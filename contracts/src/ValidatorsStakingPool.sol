// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ValidatorsStakingPool
 * @notice Gerencia 200M TRAY para staking de validadores com 8% APY
 * @dev Pool de staking com recompensas diárias de 8% ao ano
 */
contract ValidatorsStakingPool is Ownable, ReentrancyGuard {
    IERC20 public trayToken;

    // Total alocado
    uint256 public constant TOTAL_ALLOCATION = 200_000_000 * 10**18; // 200M

    // Configuração de staking
    uint256 public constant MINIMUM_STAKE = 32_000 * 10**18; // 32K TRAY mínimo
    uint256 public constant APY_PERCENTAGE = 8; // 8% ao ano
    uint256 public constant DAYS_PER_YEAR = 365;

    // Dados de staking
    mapping(address => StakeInfo) public stakes;
    address[] public stakers;
    mapping(address => bool) public isStaker;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 pendingRewards;
        uint256 claimedRewards;
        bool active;
    }

    event Staked(address indexed validator, uint256 amount);
    event Unstaked(address indexed validator, uint256 amount);
    event RewardsClaimed(address indexed validator, uint256 amount);
    event RewardsUpdated(address indexed validator, uint256 newRewards);

    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
    }

    /**
     * @notice Fazer stake de TRAY como validador
     * @param amount Quantidade a fazer stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount >= MINIMUM_STAKE, "Abaixo do minimo requerido");
        require(amount > 0, "Quantidade deve ser maior que 0");

        // Transferir tokens do usuário para o contrato
        require(trayToken.transferFrom(msg.sender, address(this), amount), "Transfer falhou");

        // Atualizar ou criar stake
        if (!isStaker[msg.sender]) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].stakedAt = block.timestamp;
        stakes[msg.sender].active = true;

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Calcular recompensas pendentes para um validador
     * @param validator Endereço do validador
     */
    function calculateRewards(address validator) public view returns (uint256) {
        StakeInfo memory stake = stakes[validator];
        if (!stake.active || stake.amount == 0) {
            return stake.pendingRewards;
        }

        uint256 timeElapsed = block.timestamp - stake.stakedAt;
        uint256 daysElapsed = timeElapsed / 1 days;

        if (daysElapsed == 0) {
            return stake.pendingRewards;
        }

        // Recompensas = (Montante × APY%) / 365 dias
        uint256 dailyReward = (stake.amount * APY_PERCENTAGE) / 100 / DAYS_PER_YEAR;
        uint256 totalRewards = dailyReward * daysElapsed;

        return stake.pendingRewards + totalRewards;
    }

    /**
     * @notice Atualizar recompensas pendentes (deve ser chamado antes de reclamar)
     */
    function updateRewards(address validator) external {
        require(stakes[validator].active, "Validador nao esta ativo");
        uint256 newRewards = calculateRewards(validator);
        stakes[validator].pendingRewards = newRewards;
        stakes[validator].stakedAt = block.timestamp; // Resetar contador
        emit RewardsUpdated(validator, newRewards);
    }

    /**
     * @notice Reclamar recompensas acumuladas
     */
    function claimRewards() external nonReentrant {
        require(stakes[msg.sender].active, "Nao tem stake ativo");

        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "Nenhuma recompensa disponivel");

        stakes[msg.sender].pendingRewards = 0;
        stakes[msg.sender].claimedRewards += rewards;
        stakes[msg.sender].stakedAt = block.timestamp;

        require(trayToken.transfer(msg.sender, rewards), "Transfer de recompensas falhou");
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @notice Fazer unstake de todos os tokens
     */
    function unstake() external nonReentrant {
        require(stakes[msg.sender].active, "Nao tem stake ativo");

        StakeInfo memory stake = stakes[msg.sender];
        uint256 totalAmount = stake.amount + calculateRewards(msg.sender);

        stakes[msg.sender].active = false;
        stakes[msg.sender].amount = 0;
        stakes[msg.sender].pendingRewards = 0;

        require(trayToken.transfer(msg.sender, totalAmount), "Transfer falhou");
        emit Unstaked(msg.sender, stake.amount);
    }

    /**
     * @notice Retorna informações de stake do validador
     */
    function getStakeInfo(address validator) external view returns (
        uint256 amount,
        uint256 pendingRewards,
        uint256 claimedRewards,
        bool active
    ) {
        StakeInfo memory stake = stakes[validator];
        return (
            stake.amount,
            calculateRewards(validator),
            stake.claimedRewards,
            stake.active
        );
    }

    /**
     * @notice Retorna total de validadores ativos
     */
    function getTotalStakers() external view returns (uint256) {
        return stakers.length;
    }

    /**
     * @notice Retorna saldo disponível no pool
     */
    function getAvailableBalance() external view returns (uint256) {
        return trayToken.balanceOf(address(this));
    }
}
