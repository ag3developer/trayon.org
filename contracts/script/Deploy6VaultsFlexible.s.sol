// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/InitialLaunchVault.sol";
import "../src/DAOTreasuryVault.sol";
import "../src/ValidatorsStakingPool.sol";
import "../src/DevelopmentVesting.sol";
import "../src/PartnershipsTreasury.sol";
import "../src/StrategicReserve.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * Deploy Script for 6 Recipient Vaults on Polygon Mainnet
 * VERSÃO FLEXÍVEL - Calcula alocação dinamicamente baseada no saldo real
 * 
 * Alocação proporcional:
 * - InitialLaunchVault:      25% do saldo
 * - DAOTreasuryVault:        25% do saldo
 * - ValidatorsStakingPool:   20% do saldo
 * - DevelopmentVesting:      15% do saldo
 * - PartnershipsTreasury:    10% do saldo
 * - StrategicReserve:         5% do saldo
 * 
 * Funcionalidade chave: Se o saldo for diferente de 1B, a distribuição
 * se ajusta automaticamente mantendo as proporções.
 * 
 * Exemplo:
 * - Se tiver 900M TRAY: distribui 225M, 225M, 180M, 135M, 90M, 45M
 * - Se tiver 1.1B TRAY: distribui 275M, 275M, 220M, 165M, 110M, 55M
 * 
 * Usage:
 * export PRIVATE_KEY=0x...
 * forge script script/Deploy6VaultsFlexible.s.sol \
 *   --rpc-url https://polygon-bor-rpc.publicnode.com \
 *   --broadcast \
 *   --verify
 */
contract Deploy6VaultsFlexible is Script {
    // Polygon Mainnet - TRAY Token Address
    address constant TRAY_TOKEN = 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b;
    
    // Percentuais de distribuição (em basis points: 10000 = 100%)
    uint256 constant PERCENT_INITIAL_LAUNCH = 2500;    // 25%
    uint256 constant PERCENT_DAO_TREASURY = 2500;      // 25%
    uint256 constant PERCENT_VALIDATORS = 2000;        // 20%
    uint256 constant PERCENT_DEVELOPMENT = 1500;       // 15%
    uint256 constant PERCENT_PARTNERSHIPS = 1000;      // 10%
    uint256 constant PERCENT_STRATEGIC = 500;          // 5%
    
    // Deployed contracts
    address deployedInitialLaunch;
    address deployedDAOTreasury;
    address deployedValidators;
    address deployedDevelopment;
    address deployedPartnerships;
    address deployedStrategic;
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=======================================================");
        console.log("  DEPLOY 6 VAULTS - POLYGON MAINNET (VERSAO FLEXIVEL)");
        console.log("=======================================================");
        console.log("Deployer:", deployer);
        console.log("TRAY Token:", TRAY_TOKEN);
        console.log("Network: Polygon Mainnet (ChainID: 137)");
        console.log("");
        
        // ===== PASSO 1: Deploy dos 6 Contratos =====
        console.log("PASSO 1: Deploying 6 Recipient Contracts");
        console.log("---");
        
        InitialLaunchVault initialLaunch = new InitialLaunchVault(TRAY_TOKEN);
        deployedInitialLaunch = address(initialLaunch);
        console.log("1. InitialLaunchVault: ", deployedInitialLaunch);
        
        DAOTreasuryVault daoTreasury = new DAOTreasuryVault(TRAY_TOKEN);
        deployedDAOTreasury = address(daoTreasury);
        console.log("2. DAOTreasuryVault:   ", deployedDAOTreasury);
        
        ValidatorsStakingPool validatorsPool = new ValidatorsStakingPool(TRAY_TOKEN);
        deployedValidators = address(validatorsPool);
        console.log("3. ValidatorsStakingPool: ", deployedValidators);
        
        DevelopmentVesting devVesting = new DevelopmentVesting(TRAY_TOKEN);
        deployedDevelopment = address(devVesting);
        console.log("4. DevelopmentVesting: ", deployedDevelopment);
        
        PartnershipsTreasury partnerships = new PartnershipsTreasury(TRAY_TOKEN);
        deployedPartnerships = address(partnerships);
        console.log("5. PartnershipsTreasury: ", deployedPartnerships);
        
        address[] memory initialSignatories = new address[](0);
        StrategicReserve strategicReserve = new StrategicReserve(TRAY_TOKEN, initialSignatories);
        deployedStrategic = address(strategicReserve);
        console.log("6. StrategicReserve:   ", deployedStrategic);
        
        console.log("");
        console.log("SUCCESS: All 6 contracts deployed!");
        console.log("");
        
        // ===== PASSO 2: Verificar Saldo REAL =====
        console.log("PASSO 2: Checking REAL TRAY Balance");
        console.log("---");
        
        IERC20 tray = IERC20(TRAY_TOKEN);
        uint256 realBalance = tray.balanceOf(deployer);
        
        console.log("Deployer TRAY Balance (REAL): ", realBalance / 10**18, "TRAY");
        console.log("");
        
        // ===== PASSO 3: Calcular Distribuição Proporcional =====
        console.log("PASSO 3: Calculating Proportional Distribution");
        console.log("---");
        
        // Calcular alocação proporcional baseada no saldo real
        uint256 amount1 = (realBalance * PERCENT_INITIAL_LAUNCH) / 10000;
        uint256 amount2 = (realBalance * PERCENT_DAO_TREASURY) / 10000;
        uint256 amount3 = (realBalance * PERCENT_VALIDATORS) / 10000;
        uint256 amount4 = (realBalance * PERCENT_DEVELOPMENT) / 10000;
        uint256 amount5 = (realBalance * PERCENT_PARTNERSHIPS) / 10000;
        uint256 amount6 = (realBalance * PERCENT_STRATEGIC) / 10000;
        
        console.log("Distribution Plan (proporcional ao saldo real):");
        console.log("  InitialLaunchVault (25%): ", amount1 / 10**18, "TRAY");
        console.log("  DAOTreasuryVault (25%):   ", amount2 / 10**18, "TRAY");
        console.log("  ValidatorsPool (20%):     ", amount3 / 10**18, "TRAY");
        console.log("  DevelopmentVesting (15%): ", amount4 / 10**18, "TRAY");
        console.log("  PartnershipsTreasury (10%): ", amount5 / 10**18, "TRAY");
        console.log("  StrategicReserve (5%):    ", amount6 / 10**18, "TRAY");
        console.log("");
        
        uint256 totalToDistribute = amount1 + amount2 + amount3 + amount4 + amount5 + amount6;
        console.log("Total to distribute: ", totalToDistribute / 10**18, "TRAY");
        console.log("Remaining after distribution: ", (realBalance - totalToDistribute) / 10**18, "TRAY");
        console.log("");
        
        // ===== PASSO 4: Transferir TRAY para Contratos =====
        console.log("PASSO 4: Transferring TRAY to Vaults");
        console.log("---");
        
        require(tray.transfer(deployedInitialLaunch, amount1), "Transfer to InitialLaunch failed");
        console.log("Transferred to InitialLaunchVault: ", amount1 / 10**18, "TRAY");
        
        require(tray.transfer(deployedDAOTreasury, amount2), "Transfer to DAO failed");
        console.log("Transferred to DAOTreasuryVault: ", amount2 / 10**18, "TRAY");
        
        require(tray.transfer(deployedValidators, amount3), "Transfer to Validators failed");
        console.log("Transferred to ValidatorsStakingPool: ", amount3 / 10**18, "TRAY");
        
        require(tray.transfer(deployedDevelopment, amount4), "Transfer to Dev failed");
        console.log("Transferred to DevelopmentVesting: ", amount4 / 10**18, "TRAY");
        
        require(tray.transfer(deployedPartnerships, amount5), "Transfer to Partnerships failed");
        console.log("Transferred to PartnershipsTreasury: ", amount5 / 10**18, "TRAY");
        
        require(tray.transfer(deployedStrategic, amount6), "Transfer to Strategic failed");
        console.log("Transferred to StrategicReserve: ", amount6 / 10**18, "TRAY");
        
        console.log("");
        
        // ===== PASSO 5: Verificar Saldos Finais =====
        console.log("PASSO 5: Final Balance Verification");
        console.log("---");
        
        uint256 balance1 = tray.balanceOf(deployedInitialLaunch) / 10**18;
        uint256 balance2 = tray.balanceOf(deployedDAOTreasury) / 10**18;
        uint256 balance3 = tray.balanceOf(deployedValidators) / 10**18;
        uint256 balance4 = tray.balanceOf(deployedDevelopment) / 10**18;
        uint256 balance5 = tray.balanceOf(deployedPartnerships) / 10**18;
        uint256 balance6 = tray.balanceOf(deployedStrategic) / 10**18;
        
        console.log("InitialLaunchVault:     ", balance1, "TRAY");
        console.log("DAOTreasuryVault:       ", balance2, "TRAY");
        console.log("ValidatorsStakingPool:  ", balance3, "TRAY");
        console.log("DevelopmentVesting:     ", balance4, "TRAY");
        console.log("PartnershipsTreasury:   ", balance5, "TRAY");
        console.log("StrategicReserve:       ", balance6, "TRAY");
        
        uint256 totalDistributed = balance1 + balance2 + balance3 + balance4 + balance5 + balance6;
        console.log("");
        console.log("TOTAL DISTRIBUTED: ", totalDistributed, "TRAY");
        console.log("Deployer balance remaining: ", tray.balanceOf(deployer) / 10**18, "TRAY");
        console.log("");
        
        // ===== PASSO 6: Configurar DevelopmentVesting =====
        console.log("PASSO 6: Configuring DevelopmentVesting");
        console.log("---");
        
        if (!devVesting.vestingStartTimeSet()) {
            devVesting.setVestingStartTime(block.timestamp);
            console.log("DevelopmentVesting start time set to: ", block.timestamp);
        } else {
            console.log("DevelopmentVesting already configured");
        }
        console.log("");
        
        // ===== PASSO 7: Resumo Final =====
        console.log("=======================================================");
        console.log("  DEPLOYMENT COMPLETE!");
        console.log("=======================================================");
        console.log("Network: Polygon Mainnet (ChainID 137)");
        console.log("TRAY Token: ", TRAY_TOKEN);
        console.log("");
        console.log("Deployed Contracts:");
        console.log("  1. InitialLaunchVault:     ", deployedInitialLaunch);
        console.log("  2. DAOTreasuryVault:       ", deployedDAOTreasury);
        console.log("  3. ValidatorsStakingPool:  ", deployedValidators);
        console.log("  4. DevelopmentVesting:     ", deployedDevelopment);
        console.log("  5. PartnershipsTreasury:   ", deployedPartnerships);
        console.log("  6. StrategicReserve:       ", deployedStrategic);
        console.log("");
        console.log("Distribution Summary:");
        console.log("  Initial Balance: ", realBalance / 10**18, "TRAY");
        console.log("  Total Distributed: ", totalDistributed, "TRAY");
        console.log("  Deployer Remaining: ", tray.balanceOf(deployer) / 10**18, "TRAY");
        console.log("");
        console.log("Percentuais Utilizados:");
        console.log("  InitialLaunchVault:     25%");
        console.log("  DAOTreasuryVault:       25%");
        console.log("  ValidatorsStakingPool:  20%");
        console.log("  DevelopmentVesting:     15%");
        console.log("  PartnershipsTreasury:   10%");
        console.log("  StrategicReserve:        5%");
        console.log("=======================================================");
        
        vm.stopBroadcast();
    }
}
