// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title InitialLaunchVault
 * @notice Gerencia 250M TRAY para IDO, Private Sale e Liquidity Pools
 * @dev Contrato para distribuição de tokens na fase inicial de lançamento
 */
contract InitialLaunchVault is Ownable, ReentrancyGuard {
    IERC20 public trayToken;

    // Alocações
    uint256 public constant PRIVATE_ROUND_ALLOCATION = 100_000_000 * 10**18; // 100M
    uint256 public constant PUBLIC_SALE_ALLOCATION = 100_000_000 * 10**18;   // 100M
    uint256 public constant LIQUIDITY_POOL_ALLOCATION = 50_000_000 * 10**18; // 50M

    // Rastreamento de liberações
    uint256 public privateRoundReleased;
    uint256 public publicSaleReleased;
    uint256 public liquidityPoolReleased;

    event PrivateRoundReleased(uint256 amount, address indexed to);
    event PublicSaleReleased(uint256 amount, address indexed to);
    event LiquidityPoolReleased(uint256 amount, address indexed to);

    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
    }

    /**
     * @notice Libera tokens para a rodada privada
     * @param to Endereço recebedor
     * @param amount Quantidade a liberar
     */
    function releasePrivateRound(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Endereco invalido");
        require(privateRoundReleased + amount <= PRIVATE_ROUND_ALLOCATION, "Excede alocacao private");
        
        uint256 contractBalance = trayToken.balanceOf(address(this));
        require(contractBalance >= amount, "Saldo insuficiente no contrato");
        
        privateRoundReleased += amount;
        require(trayToken.transfer(to, amount), "Transfer falhou");

        emit PrivateRoundReleased(amount, to);
    }

    /**
     * @notice Libera tokens para a venda pública
     * @param to Endereço recebedor
     * @param amount Quantidade a liberar
     */
    function releasePublicSale(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Endereco invalido");
        require(publicSaleReleased + amount <= PUBLIC_SALE_ALLOCATION, "Excede alocacao public");
        
        uint256 contractBalance = trayToken.balanceOf(address(this));
        require(contractBalance >= amount, "Saldo insuficiente no contrato");
        
        publicSaleReleased += amount;
        require(trayToken.transfer(to, amount), "Transfer falhou");

        emit PublicSaleReleased(amount, to);
    }

    /**
     * @notice Libera tokens para os liquidity pools
     * @param to Endereço recebedor
     * @param amount Quantidade a liberar
     */
    function releaseLiquidityPool(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Endereco invalido");
        require(liquidityPoolReleased + amount <= LIQUIDITY_POOL_ALLOCATION, "Excede alocacao liquidity");
        
        uint256 contractBalance = trayToken.balanceOf(address(this));
        require(contractBalance >= amount, "Saldo insuficiente no contrato");
        
        liquidityPoolReleased += amount;
        require(trayToken.transfer(to, amount), "Transfer falhou");

        emit LiquidityPoolReleased(amount, to);
    }

    /**
     * @notice Retorna saldo disponível no contrato
     */
    function getBalance() external view returns (uint256) {
        return trayToken.balanceOf(address(this));
    }

    /**
     * @notice Retorna informações de liberação
     */
    function getReleaseInfo() external view returns (
        uint256 privateRemaining,
        uint256 publicRemaining,
        uint256 liquidityRemaining
    ) {
        privateRemaining = PRIVATE_ROUND_ALLOCATION - privateRoundReleased;
        publicRemaining = PUBLIC_SALE_ALLOCATION - publicSaleReleased;
        liquidityRemaining = LIQUIDITY_POOL_ALLOCATION - liquidityPoolReleased;
    }
}
