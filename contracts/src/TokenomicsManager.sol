// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {TRAY} from "./TRAY.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin/security/ReentrancyGuard.sol";

/**
 * @title TokenomicsManager
 * @notice Gerencia distribuição de tokens, vesting e fee collection
 * @dev Implementação completa conforme: https://localhost:3000/docs/tokenomics
 * 
 * Responsabilidades:
 * 1. Controlar vesting de tokens (4 anos para dev team)
 * 2. Gerenciar unlock schedule (50M/ano 2026-2031)
 * 3. Processar fee collection (70/20/10 split)
 * 4. Rastrear alocações e distribuições
 * 5. Integração com staking de validadores (32K TRAY min)
 */
contract TokenomicsManager is Ownable, ReentrancyGuard {
    // ════════════════════════════════════════════════════════════════════════
    // TYPES & STRUCTS
    // ════════════════════════════════════════════════════════════════════════

    enum AllocationCategory {
        INITIAL_LAUNCH,      // 0: IDO/Private (250M)
        DAO_TREASURY,        // 1: Treasury (250M)
        VALIDATORS_OPS,      // 2: Validators (200M)
        DEVELOPMENT,         // 3: Dev Team (150M)
        PARTNERSHIPS,        // 4: Partnerships (100M)
        STRATEGIC_RESERVE    // 5: Strategic (50M)
    }

    struct AllocationConfig {
        string name;
        uint256 totalAmount;
        uint256 vestedAmount;
        uint256 vestingDurationDays;
        address recipient;
        bool isVested;
        uint256 vestingStartTime;
    }

    struct FeeCollectionRecord {
        uint256 timestamp;
        uint256 blockNumber;
        uint256 totalFeeCollected;
        uint256 validatorShare;
        uint256 burnAmount;
        uint256 treasuryShare;
    }

    struct AllocationBreakdown {
        string subcategory;
        uint256 amount;
        address recipient;
        uint256 vestedAmount;
        uint256 vestingStartTime;
        bool isReleased;
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ════════════════════════════════════════════════════════════════════════

    TRAY public trayToken;
    
    // Allocation tracking
    mapping(AllocationCategory => AllocationConfig) public allocations;
    mapping(AllocationCategory => AllocationBreakdown[]) public breakdowns;
    
    // Fee collection history
    FeeCollectionRecord[] public feeHistory;
    
    // Vesting tracking
    mapping(address => uint256) public vestedBalance;
    mapping(address => uint256) public releasedBalance;
    
    // Fee distribution parameters (immutable per tokenomics)
    uint256 public constant VALIDATOR_FEE_PERCENTAGE = 70;
    uint256 public constant BURN_FEE_PERCENTAGE = 20;
    uint256 public constant TREASURY_FEE_PERCENTAGE = 10;
    
    // Staking parameters
    uint256 public constant MINIMUM_STAKE = 32_000 * 10**18; // 32K TRAY
    mapping(address => uint256) public stakedAmount;
    mapping(address => bool) public isValidator;
    
    // Unlock schedule (2026-2031)
    mapping(uint256 => uint256) public yearlyUnlockSchedule;
    
    // Total tracking
    uint256 public totalAllocated;
    uint256 public totalDistributed;
    uint256 public totalBurned;
    uint256 public totalFeeCollected;
    
    // Events
    event AllocationConfigured(AllocationCategory indexed category, uint256 amount, address recipient);
    event AllocationReleased(AllocationCategory indexed category, address indexed recipient, uint256 amount);
    event VestingReleased(address indexed beneficiary, uint256 amount, uint256 releaseTime);
    event FeeCollected(uint256 indexed blockNumber, uint256 total, uint256 validatorShare, uint256 burnAmount, uint256 treasuryShare);
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorUnstaked(address indexed validator, uint256 amount);
    event RewardsDistributed(address indexed validator, uint256 amount, uint256 timestamp);
    event UnlockScheduleSet(uint256 indexed year, uint256 amount);
    
    // Errors
    error ZeroAddress();
    error InvalidAmount();
    error InsufficientBalance();
    error AllocationAlreadyConfigured();
    error NotVested();
    error VestingNotStarted();
    error StakingAmountTooLow();
    error NotAValidator();
    error InvalidPercentages();

    // ════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ════════════════════════════════════════════════════════════════════════

    constructor(address _trayToken) {
        if (_trayToken == address(0)) revert ZeroAddress();
        trayToken = TRAY(_trayToken);
        
        // Initialize unlock schedule (50M per year from 2026-2031)
        yearlyUnlockSchedule[2026] = 250_000_000 * 10**18;  // Initial 250M
        yearlyUnlockSchedule[2027] = 50_000_000 * 10**18;
        yearlyUnlockSchedule[2028] = 50_000_000 * 10**18;
        yearlyUnlockSchedule[2029] = 50_000_000 * 10**18;
        yearlyUnlockSchedule[2030] = 50_000_000 * 10**18;
        yearlyUnlockSchedule[2031] = 50_000_000 * 10**18;
    }

    // ════════════════════════════════════════════════════════════════════════
    // ALLOCATION CONFIGURATION
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Configure alocação completa (apenas uma vez por categoria)
     */
    function configureAllocation(
        AllocationCategory category,
        uint256 totalAmount,
        address recipient,
        uint256 vestingDurationDays,
        bool isVested
    ) external onlyOwner {
        if (allocations[category].totalAmount != 0) revert AllocationAlreadyConfigured();
        if (recipient == address(0)) revert ZeroAddress();
        if (totalAmount == 0) revert InvalidAmount();

        string memory categoryName = _getCategoryName(category);
        
        allocations[category] = AllocationConfig({
            name: categoryName,
            totalAmount: totalAmount,
            vestedAmount: 0,
            vestingDurationDays: vestingDurationDays,
            recipient: recipient,
            isVested: isVested,
            vestingStartTime: isVested ? block.timestamp : 0
        });

        totalAllocated += totalAmount;

        emit AllocationConfigured(category, totalAmount, recipient);
    }

    /**
     * @notice Add allocation breakdown (subcomponent de uma alocação)
     */
    function addAllocationBreakdown(
        AllocationCategory category,
        string memory subcategory,
        uint256 amount,
        address recipient,
        uint256 vestingDurationDays
    ) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        AllocationConfig storage config = allocations[category];
        require(config.totalAmount > 0, "Allocation not configured");

        AllocationBreakdown memory bd = AllocationBreakdown({
            subcategory: subcategory,
            amount: amount,
            recipient: recipient,
            vestedAmount: vestingDurationDays > 0 ? amount : 0,
            vestingStartTime: vestingDurationDays > 0 ? block.timestamp : 0,
            isReleased: false
        });

        breakdowns[category].push(bd);

        if (vestingDurationDays > 0) {
            vestedBalance[recipient] += amount;
        }
    }

    /**
     * @notice Distribuir alocação inicial (não vested)
     */
    function releaseAllocation(AllocationCategory category) external onlyOwner nonReentrant {
        AllocationConfig storage config = allocations[category];
        require(config.totalAmount > 0, "Allocation not configured");
        require(!config.isVested, "Cannot release vested allocation directly");
        require(config.vestedAmount == 0, "Already released");

        uint256 amount = config.totalAmount;
        config.vestedAmount = amount;
        totalDistributed += amount;

        trayToken.transfer(config.recipient, amount);

        emit AllocationReleased(category, config.recipient, amount);
    }

    /**
     * @notice Release vested tokens (gradualmente ao longo do tempo)
     */
    function releaseVestedTokens(AllocationCategory category) external nonReentrant {
        AllocationConfig storage config = allocations[category];
        require(config.isVested, "Allocation is not vested");
        require(config.vestingStartTime > 0, "Vesting not started");

        uint256 elapsedDays = (block.timestamp - config.vestingStartTime) / 1 days;
        uint256 vestingDurationDays = config.vestingDurationDays;

        if (elapsedDays == 0) revert VestingNotStarted();

        uint256 totalVestable = config.totalAmount;
        uint256 releasableAmount;

        if (elapsedDays >= vestingDurationDays) {
            // Vesting completo
            releasableAmount = totalVestable - config.vestedAmount;
        } else {
            // Vesting proporcional
            uint256 vestedPerDay = totalVestable / vestingDurationDays;
            uint256 totalVested = vestedPerDay * elapsedDays;
            releasableAmount = totalVested - config.vestedAmount;
        }

        if (releasableAmount == 0) revert InvalidAmount();

        config.vestedAmount += releasableAmount;
        releasedBalance[config.recipient] += releasableAmount;
        totalDistributed += releasableAmount;

        trayToken.transfer(config.recipient, releasableAmount);

        emit VestingReleased(config.recipient, releasableAmount, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════
    // FEE COLLECTION & DISTRIBUTION
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Processar fees de transações L2 (conforme 70/20/10)
     * @dev Chamado pelo sequencer L2 após blocos
     */
    function collectAndDistributeFees(
        uint256 totalFee,
        address validatorRewardPool
    ) external onlyOwner nonReentrant {
        if (totalFee == 0) revert InvalidAmount();
        if (validatorRewardPool == address(0)) revert ZeroAddress();

        uint256 validatorShare = (totalFee * VALIDATOR_FEE_PERCENTAGE) / 100;
        uint256 burnAmount = (totalFee * BURN_FEE_PERCENTAGE) / 100;
        uint256 treasuryShare = (totalFee * TREASURY_FEE_PERCENTAGE) / 100;

        // Validar percentuais
        require(validatorShare + burnAmount + treasuryShare == totalFee, "Fee calculation error");

        // Distribuir para validadores
        if (validatorShare > 0) {
            trayToken.transfer(validatorRewardPool, validatorShare);
        }

        // Queimar
        if (burnAmount > 0) {
            trayToken.burn(burnAmount);
            totalBurned += burnAmount;
        }

        // Treasury
        if (treasuryShare > 0) {
            trayToken.transfer(allocations[AllocationCategory.DAO_TREASURY].recipient, treasuryShare);
        }

        // Registrar
        totalFeeCollected += totalFee;
        feeHistory.push(FeeCollectionRecord({
            timestamp: block.timestamp,
            blockNumber: block.number,
            totalFeeCollected: totalFee,
            validatorShare: validatorShare,
            burnAmount: burnAmount,
            treasuryShare: treasuryShare
        }));

        emit FeeCollected(block.number, totalFee, validatorShare, burnAmount, treasuryShare);
    }

    // ════════════════════════════════════════════════════════════════════════
    // STAKING & VALIDATOR MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Fazer stake de tokens (mínimo 32K TRAY)
     */
    function stake(uint256 amount) external nonReentrant {
        if (amount < MINIMUM_STAKE) revert StakingAmountTooLow();

        // Transferir tokens para este contrato
        require(trayToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        stakedAmount[msg.sender] += amount;
        
        if (stakedAmount[msg.sender] >= MINIMUM_STAKE) {
            isValidator[msg.sender] = true;
        }

        emit ValidatorStaked(msg.sender, amount);
    }

    /**
     * @notice Fazer unstake de tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        if (stakedAmount[msg.sender] < amount) revert InsufficientBalance();

        stakedAmount[msg.sender] -= amount;
        
        if (stakedAmount[msg.sender] < MINIMUM_STAKE) {
            isValidator[msg.sender] = false;
        }

        require(trayToken.transfer(msg.sender, amount), "Transfer failed");

        emit ValidatorUnstaked(msg.sender, amount);
    }

    /**
     * @notice Distribuir rewards para validator
     * @dev Chamado por contrato de consenso
     */
    function distributeValidatorRewards(address validator, uint256 rewardAmount) external onlyOwner nonReentrant {
        if (!isValidator[validator]) revert NotAValidator();
        if (rewardAmount == 0) revert InvalidAmount();

        require(trayToken.transfer(validator, rewardAmount), "Transfer failed");

        emit RewardsDistributed(validator, rewardAmount, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════
    // UNLOCK SCHEDULE
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Configurar schedule de unlock (50M/ano 2026-2031)
     */
    function setUnlockSchedule(uint256 year, uint256 amount) external onlyOwner {
        if (year < 2026 || year > 2031) revert InvalidAmount();
        yearlyUnlockSchedule[year] = amount;
        emit UnlockScheduleSet(year, amount);
    }

    /**
     * @notice Obter tokens disponíveis para unlock em um ano
     */
    function getYearlyUnlockAmount(uint256 year) external view returns (uint256) {
        return yearlyUnlockSchedule[year];
    }

    /**
     * @notice Calcular tokens circulando até uma data
     */
    function getCirculatingSupply(uint256 targetYear) external view returns (uint256) {
        uint256 circulating = 0;
        
        for (uint256 year = 2026; year <= targetYear && year <= 2031; year++) {
            circulating += yearlyUnlockSchedule[year];
        }
        
        return circulating;
    }

    // ════════════════════════════════════════════════════════════════════════
    // QUERY FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Obter histórico completo de fee collection
     */
    function getFeeHistoryLength() external view returns (uint256) {
        return feeHistory.length;
    }

    /**
     * @notice Obter record de fee específico
     */
    function getFeeRecord(uint256 index) external view returns (FeeCollectionRecord memory) {
        require(index < feeHistory.length, "Index out of bounds");
        return feeHistory[index];
    }

    /**
     * @notice Obter breakdowns de uma alocação
     */
    function getAllocationBreakdownsCount(AllocationCategory category) external view returns (uint256) {
        return breakdowns[category].length;
    }

    /**
     * @notice Obter breakdown específico
     */
    function getAllocationBreakdown(AllocationCategory category, uint256 index) 
        external view returns (AllocationBreakdown memory) 
    {
        require(index < breakdowns[category].length, "Index out of bounds");
        return breakdowns[category][index];
    }

    /**
     * @notice Obter config de alocação
     */
    function getAllocationConfig(AllocationCategory category) 
        external view returns (AllocationConfig memory) 
    {
        return allocations[category];
    }

    /**
     * @notice Verificar se endereço é validator
     */
    function isValidatorActive(address addr) external view returns (bool) {
        return isValidator[addr] && stakedAmount[addr] >= MINIMUM_STAKE;
    }

    /**
     * @notice Obter stake de um validator
     */
    function getValidatorStake(address validator) external view returns (uint256) {
        return stakedAmount[validator];
    }

    /**
     * @notice Obter estatísticas gerais
     */
    function getTokenomicsStats() external view returns (
        uint256 allocated,
        uint256 distributed,
        uint256 burned,
        uint256 feeCollected,
        uint256 circulating
    ) {
        return (
            totalAllocated,
            totalDistributed,
            totalBurned,
            totalFeeCollected,
            trayToken.totalSupply()
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ════════════════════════════════════════════════════════════════════════

    function _getCategoryName(AllocationCategory category) internal pure returns (string memory) {
        if (category == AllocationCategory.INITIAL_LAUNCH) return "Initial Launch (IDO/Private)";
        if (category == AllocationCategory.DAO_TREASURY) return "DAO Treasury";
        if (category == AllocationCategory.VALIDATORS_OPS) return "Validators & Operators";
        if (category == AllocationCategory.DEVELOPMENT) return "Development Team";
        if (category == AllocationCategory.PARTNERSHIPS) return "Partnerships & Integrations";
        return "Strategic Reserve";
    }
}
