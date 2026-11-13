// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DAOTreasuryVault
 * @notice Gerencia 250M TRAY para tesouro DAO e desenvolvimentos
 * @dev Contrato com rastreamento de gastos da tesouraria DAO
 */
contract DAOTreasuryVault is Ownable, ReentrancyGuard {
    IERC20 public trayToken;

    // Total alocado
    uint256 public constant TOTAL_ALLOCATION = 250_000_000 * 10**18; // 250M

    // Rastreamento de gastos
    uint256 public totalSpent;
    mapping(address => uint256) public spentByAddress;
    mapping(uint256 => SpendingRecord) public spendingHistory;
    uint256 public spendingCount;

    struct SpendingRecord {
        address recipient;
        uint256 amount;
        string description;
        uint256 timestamp;
    }

    event TreasurySpent(address indexed recipient, uint256 amount, string description);
    event BalanceQueried(uint256 available);

    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
    }

    /**
     * @notice Gasta tokens da tesouraria para um endereço
     * @param to Endereço recebedor
     * @param amount Quantidade a gastar
     * @param description Descrição do gasto
     */
    function spendFromTreasury(
        address to,
        uint256 amount,
        string calldata description
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Endereco invalido");
        require(amount > 0, "Quantidade deve ser maior que 0");
        require(totalSpent + amount <= TOTAL_ALLOCATION, "Excede alocacao da tesouraria");

        uint256 contractBalance = trayToken.balanceOf(address(this));
        require(contractBalance >= amount, "Saldo insuficiente no contrato");
        
        totalSpent += amount;
        spentByAddress[to] += amount;

        // Registrar no histórico
        spendingHistory[spendingCount] = SpendingRecord({
            recipient: to,
            amount: amount,
            description: description,
            timestamp: block.timestamp
        });
        spendingCount++;

        require(trayToken.transfer(to, amount), "Transfer falhou");
        emit TreasurySpent(to, amount, description);
    }

    /**
     * @notice Retorna saldo disponível na tesouraria
     */
    function getAvailableBalance() external view returns (uint256) {
        return TOTAL_ALLOCATION - totalSpent;
    }

    /**
     * @notice Retorna informações de gastos
     */
    function getSpendingInfo() external view returns (
        uint256 spent,
        uint256 available,
        uint256 records
    ) {
        spent = totalSpent;
        available = TOTAL_ALLOCATION - totalSpent;
        records = spendingCount;
    }

    /**
     * @notice Retorna histórico de gastos por índice
     */
    function getSpendingRecord(uint256 index) external view returns (SpendingRecord memory) {
        require(index < spendingCount, "Indice invalido");
        return spendingHistory[index];
    }

    /**
     * @notice Retorna quanto foi gasto para um endereço específico
     */
    function getSpentByAddress(address addr) external view returns (uint256) {
        return spentByAddress[addr];
    }
}
