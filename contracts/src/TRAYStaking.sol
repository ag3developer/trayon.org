// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TRAY Staking
 * @dev Staking pool para validadores (32.000 TRAY mínimo)
 * 
 * Funcionalidades:
 * - APY: 8% (6% bloco + 2% comissão de dados)
 * - Lockup: flexível com withdraw delay de 7 dias
 * - Slashing: penalidades por má conduta
 * - Reputação: 0-150 (afeta multiplicador de APY)
 */
contract TRAYStaking is ReentrancyGuard, Ownable {
    // ============ Constants ============
    
    uint256 public constant VALIDATOR_STAKE = 32_000 * 10**18;
    uint256 public constant MIN_STAKE = 100 * 10**18;
    uint256 public constant APY = 8;
    uint256 public constant WITHDRAW_DELAY = 7 days;
    
    // ============ State Variables ============
    
    IERC20 public trayToken;
    
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    address[] public stakers;
    mapping(address => Stake) public stakes;
    
    struct Stake {
        uint256 amount;
        uint256 reputation;
        bool isValidator;
        uint256 lastRewardTime;
        uint256 pendingWithdrawAmount;
        uint256 pendingWithdrawTime;
    }
    
    // ============ Events ============
    
    event Staked(address indexed staker, uint256 amount, bool isValidator);
    event Unstaked(address indexed staker, uint256 amount);
    event RewardClaimed(address indexed staker, uint256 reward);
    event WithdrawCompleted(address indexed staker, uint256 amount);
    event Slashed(address indexed staker, uint256 amount, string reason);
    event ReputationUpdated(address indexed staker, uint256 newReputation);
    event ValidatorStatusChanged(address indexed staker, bool isValidator);
    
    // ============ Errors ============
    
    error InsufficientStake();
    error NoStakeFound();
    error NoRewardsPending();
    error NoWithdrawPending();
    error WithdrawDelayNotPassed();
    error NotAValidator();
    error InvalidDelay();
    
    // ============ Constructor ============
    
    constructor(address _trayToken) {
        require(_trayToken != address(0), "Invalid TRAY token address");
        trayToken = IERC20(_trayToken);
    }
    
    // ============ Core Staking Functions ============
    
    /**
     * @dev Fazer stake de TRAY tokens
     * @param amount Quantidade a fazer stake
     * @param _isValidator True se quer ser validador
     */
    function stake(uint256 amount, bool _isValidator) external nonReentrant {
        require(amount >= MIN_STAKE, "Stake below minimum");
        require(trayToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (stakes[msg.sender].amount == 0) {
            stakers.push(msg.sender);
        }
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].reputation = 100; // Iniciar com reputação neutra
        stakes[msg.sender].lastRewardTime = block.timestamp;
        
        if (_isValidator && amount >= VALIDATOR_STAKE) {
            stakes[msg.sender].isValidator = true;
            emit ValidatorStatusChanged(msg.sender, true);
        }
        
        totalStaked += amount;
        emit Staked(msg.sender, amount, stakes[msg.sender].isValidator);
    }
    
    /**
     * @dev Calcular reward acumulado
     * @param staker Endereço do staker
     */
    function calculateReward(address staker) public view returns (uint256) {
        Stake memory stakeData = stakes[staker];
        if (stakeData.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - stakeData.lastRewardTime;
        uint256 baseReward = (stakeData.amount * APY * timeStaked) / (100 * 365 days);
        
        // Aplicar modificador de reputação
        uint256 reputationModifier = 100;
        if (stakeData.reputation > 100) {
            reputationModifier = 100 + ((stakeData.reputation - 100) * 10) / 50; // +20% por 50 reputação
        } else if (stakeData.reputation < 100) {
            reputationModifier = 100 - ((100 - stakeData.reputation) * 10) / 50; // -20% por 50 reputação
        }
        
        return (baseReward * reputationModifier) / 100;
    }
    
    /**
     * @dev Clamar rewards acumulados
     */
    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards pending");
        
        stakes[msg.sender].lastRewardTime = block.timestamp;
        totalRewardsDistributed += reward;
        
        require(trayToken.transfer(msg.sender, reward), "Reward transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Solicitar unstake (inicia delay de 7 dias)
     * @param amount Quantidade a desemaranhar
     */
    function requestUnstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        require(amount > 0, "Amount must be greater than 0");
        
        stakes[msg.sender].pendingWithdrawAmount = amount;
        stakes[msg.sender].pendingWithdrawTime = block.timestamp;
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Completar unstake após delay
     */
    function completeUnstake() external nonReentrant {
        require(stakes[msg.sender].pendingWithdrawAmount > 0, "No withdrawal pending");
        require(
            block.timestamp >= stakes[msg.sender].pendingWithdrawTime + WITHDRAW_DELAY,
            "Withdrawal delay not passed"
        );
        
        uint256 amount = stakes[msg.sender].pendingWithdrawAmount;
        stakes[msg.sender].pendingWithdrawAmount = 0;
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        require(trayToken.transfer(msg.sender, amount), "Unstake transfer failed");
        emit WithdrawCompleted(msg.sender, amount);
    }
    
    // ============ Slashing Functions ============
    
    /**
     * @dev Penalizar staker por má conduta
     * @param staker Endereço a ser penalizado
     * @param percentage Percentual de slashing (0-100)
     * @param reason Razão do slashing
     */
    function slash(address staker, uint256 percentage, string calldata reason) external onlyOwner {
        require(percentage <= 100, "Invalid percentage");
        require(stakes[staker].amount > 0, "Staker not found");
        
        uint256 slashAmount = (stakes[staker].amount * percentage) / 100;
        stakes[staker].amount -= slashAmount;
        totalStaked -= slashAmount;
        
        // Reduzir reputação
        if (stakes[staker].reputation >= 50) {
            stakes[staker].reputation -= 50;
        } else {
            stakes[staker].reputation = 0;
        }
        
        // Enviar tokens penalizados para queimar
        require(trayToken.transfer(address(0xdead), slashAmount), "Slash transfer failed");
        
        emit Slashed(staker, slashAmount, reason);
        emit ReputationUpdated(staker, stakes[staker].reputation);
    }
    
    /**
     * @dev Atualizar reputação de um staker
     * @param staker Endereço
     * @param newReputation Nova reputação (0-150)
     */
    function updateReputation(address staker, uint256 newReputation) external onlyOwner {
        require(newReputation <= 150, "Reputation max is 150");
        require(stakes[staker].amount > 0, "Staker not found");
        
        stakes[staker].reputation = newReputation;
        emit ReputationUpdated(staker, newReputation);
    }
    
    /**
     * @dev Aumentar reputação (para bom comportamento)
     * @param staker Endereço
     * @param delta Incremento
     */
    function increaseReputation(address staker, uint256 delta) external onlyOwner {
        require(stakes[staker].amount > 0, "Staker not found");
        
        uint256 newRep = stakes[staker].reputation + delta;
        if (newRep > 150) {
            stakes[staker].reputation = 150;
        } else {
            stakes[staker].reputation = newRep;
        }
        
        emit ReputationUpdated(staker, stakes[staker].reputation);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Retornar informações de stake
     * @param staker Endereço
     */
    function getStakeInfo(address staker) external view returns (
        uint256 amount,
        uint256 reputation,
        bool isValidator,
        uint256 pendingReward,
        uint256 pendingWithdrawAmount
    ) {
        Stake memory stakeData = stakes[staker];
        return (
            stakeData.amount,
            stakeData.reputation,
            stakeData.isValidator,
            calculateReward(staker),
            stakeData.pendingWithdrawAmount
        );
    }
    
    /**
     * @dev Retornar lista de stakers
     */
    function getAllStakers() external view returns (address[] memory) {
        return stakers;
    }
    
    /**
     * @dev Contar stakers
     */
    function getStakersCount() external view returns (uint256) {
        return stakers.length;
    }
    
    /**
     * @dev Contar validadores
     */
    function getValidatorsCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < stakers.length; i++) {
            if (stakes[stakers[i]].isValidator && stakes[stakers[i]].amount >= VALIDATOR_STAKE) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Retornar estatísticas gerais
     */
    function getStats() external view returns (
        uint256 total,
        uint256 rewards,
        uint256 stakersCount,
        uint256 validatorsCount
    ) {
        return (
            totalStaked,
            totalRewardsDistributed,
            stakers.length,
            getValidatorsCount()
        );
    }
}
