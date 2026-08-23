// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TRAY} from "../src/TRAY.sol";
import {TokenomicsManager} from "../src/TokenomicsManager.sol";

/**
 * @title DeployCompleteTokenomics
 * @notice Deployment COMPLETO, ROBUSTO e ESCALAVEL
 * @dev Implementacao exata conforme: https://localhost:3000/docs/tokenomics
 * 
 * TOTAL SUPPLY: 1,000,000,000 TRAY (1 bilhao)
 * 
 * ALOCACOES:
 * [1] Initial Launch (IDO/Private): 250M (25%)
 *     - 100M private round
 *     - 100M public sale
 *     - 50M liquidity pools
 * 
 * [2] DAO Treasury: 250M (25%)
 *     - Development, growth, emergency fund
 * 
 * [3] Validators & Operators: 200M (20%)
 *     - 100M rewards (years 1-5)
 *     - 50M initial incentives
 *     - 50M security fund
 * 
 * [4] Development Team: 150M (15%)
 *     - 50M founders (4-yr vesting)
 *     - 50M engineering (4-yr vesting)
 *     - 50M research & security (4-yr vesting)
 * 
 * [5] Partnerships & Integrations: 100M (10%)
 *     - 50M exchanges/market makers
 *     - 25M API integrations
 *     - 25M gov/corporate
 * 
 * [6] Strategic Reserve: 50M (5%)
 *     - Emergency volatility buffer
 *     - Security forks
 *     - Extraordinary DAO decisions
 * 
 * FEE DISTRIBUTION (70/20/10):
 * - 70% -> Validators (rewards)
 * - 20% -> Burned (deflation)
 * - 10% -> DAO Treasury
 * 
 * UNLOCK SCHEDULE (2026-2031):
 * - 2026: 250M (initial circulating)
 * - 2027-2031: +50M/year (smooth dilution)
 */
contract DeployCompleteTokenomics is Script {
    // ════════════════════════════════════════════════════════════════════════
    // SUPPLY CONSTANTS (EXATOS DOS DOCS)
    // ════════════════════════════════════════════════════════════════════════

    uint256 constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 constant INITIAL_SUPPLY = 250_000_000 * 10**18;
    
    // Categoria 1: Initial Launch (250M)
    uint256 constant INITIAL_LAUNCH_TOTAL = 250_000_000 * 10**18;
    uint256 constant PRIVATE_ROUND = 100_000_000 * 10**18;
    uint256 constant PUBLIC_SALE = 100_000_000 * 10**18;
    uint256 constant LIQUIDITY_POOLS = 50_000_000 * 10**18;
    
    // Categoria 2: DAO Treasury (250M)
    uint256 constant DAO_TREASURY_TOTAL = 250_000_000 * 10**18;
    
    // Categoria 3: Validators & Operators (200M)
    uint256 constant VALIDATORS_TOTAL = 200_000_000 * 10**18;
    uint256 constant VALIDATOR_REWARDS_5YRS = 100_000_000 * 10**18;
    uint256 constant VALIDATOR_INITIAL_INCENTIVES = 50_000_000 * 10**18;
    uint256 constant VALIDATOR_SECURITY_FUND = 50_000_000 * 10**18;
    
    // Categoria 4: Development Team (150M, 4-yr vesting)
    uint256 constant DEVELOPMENT_TOTAL = 150_000_000 * 10**18;
    uint256 constant FOUNDERS = 50_000_000 * 10**18;
    uint256 constant ENGINEERING = 50_000_000 * 10**18;
    uint256 constant RESEARCH_SECURITY = 50_000_000 * 10**18;
    uint256 constant VESTING_DURATION_DAYS = 4 * 365; // 4 years
    
    // Categoria 5: Partnerships (100M)
    uint256 constant PARTNERSHIPS_TOTAL = 100_000_000 * 10**18;
    uint256 constant EXCHANGES_MAKERS = 50_000_000 * 10**18;
    uint256 constant API_INTEGRATIONS = 25_000_000 * 10**18;
    uint256 constant GOV_CORPORATE = 25_000_000 * 10**18;
    
    // Categoria 6: Strategic Reserve (50M)
    uint256 constant STRATEGIC_TOTAL = 50_000_000 * 10**18;
    
    // State
    TRAY public trayToken;
    TokenomicsManager public tokenomicsManager;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Addresses for allocations (from env or defaults to deployer)
        address daoTreasury = vm.envOr("DAO_TREASURY_ADDR", deployer);
        address validatorsRewardsPool = vm.envOr("VALIDATORS_POOL_ADDR", deployer);
        address devTeam = vm.envOr("DEV_TEAM_ADDR", deployer);
        address partnershipsAddr = vm.envOr("PARTNERSHIPS_ADDR", deployer);
        address strategicReserve = vm.envOr("STRATEGIC_RESERVE_ADDR", deployer);
        address liquidityPoolsAddr = vm.envOr("LIQUIDITY_POOLS_ADDR", deployer);

        console.log("=========================================================");
        console.log("  TRAYON COMPLETE TOKENOMICS DEPLOYMENT");
        console.log("  Implementation: https://localhost:3000/docs/tokenomics");
        console.log("=========================================================");
        console.log("");
        console.log("Network Information:");
        console.log("  Deployer:", deployer);
        console.log("  Chain ID:", block.chainid);
        console.log("  Block:", block.number);
        console.log("");

        vm.startBroadcast(deployerKey);

        // ════════════════════════════════════════════════════════════════════
        // STEP 1: DEPLOY TRAY TOKEN (250M initial supply)
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 1: Deploying TRAY Token");
        console.log("  Minting initial 250M to deployer...");
        
        trayToken = new TRAY(daoTreasury);
        
        console.log("  TRAY Token deployed at:", address(trayToken));
        console.log("  Initial supply:", trayToken.totalSupply() / 10**18, "TRAY");
        
        // Mint remaining 750M (1B total supply)
        console.log("  Minting remaining 750M...");
        uint256 remainingSupply = TOTAL_SUPPLY - INITIAL_SUPPLY;
        trayToken.mintTo(deployer, remainingSupply);
        
        console.log("  Total supply after mint:", trayToken.totalSupply() / 10**18, "TRAY");
        console.log("");

        // ════════════════════════════════════════════════════════════════════
        // STEP 2: DEPLOY TOKENOMICS MANAGER
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 2: Deploying TokenomicsManager");
        
        tokenomicsManager = new TokenomicsManager(address(trayToken));
        
        console.log("  TokenomicsManager deployed at:", address(tokenomicsManager));
        console.log("");

        // ════════════════════════════════════════════════════════════════════
        // STEP 3: CONFIGURE ALLOCATIONS
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 3: Configuring Allocations");
        console.log("");

        // [1] Initial Launch (250M, not vested)
        console.log("  [1/6] Initial Launch: 250M");
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH,
            INITIAL_LAUNCH_TOTAL,
            liquidityPoolsAddr,
            0,  // no vesting
            false
        );
        _configureInitialLaunchBreakdowns(tokenomicsManager, liquidityPoolsAddr);
        console.log("       - Private Round: 100M");
        console.log("       - Public Sale: 100M");
        console.log("       - Liquidity Pools: 50M");
        console.log("");

        // [2] DAO Treasury (250M, not vested)
        console.log("  [2/6] DAO Treasury: 250M");
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.DAO_TREASURY,
            DAO_TREASURY_TOTAL,
            daoTreasury,
            0,
            false
        );
        console.log("       - For development, growth, emergency fund");
        console.log("");

        // [3] Validators & Operators (200M, not vested)
        console.log("  [3/6] Validators & Operators: 200M");
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            VALIDATORS_TOTAL,
            validatorsRewardsPool,
            0,
            false
        );
        _configureValidatorsBreakdowns(tokenomicsManager, validatorsRewardsPool);
        console.log("       - Validator Rewards (1-5 yrs): 100M");
        console.log("       - Initial Incentives: 50M");
        console.log("       - Security Fund: 50M");
        console.log("");

        // [4] Development Team (150M, 4-yr vesting)
        console.log("  [4/6] Development Team: 150M (4-yr vesting)");
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.DEVELOPMENT,
            DEVELOPMENT_TOTAL,
            devTeam,
            VESTING_DURATION_DAYS,
            true
        );
        _configureDevelopmentBreakdowns(tokenomicsManager, devTeam);
        console.log("       - Founders: 50M (vesting 4 yrs)");
        console.log("       - Engineering: 50M (vesting 4 yrs)");
        console.log("       - Research & Security: 50M (vesting 4 yrs)");
        console.log("");

        // [5] Partnerships (100M, not vested)
        console.log("  [5/6] Partnerships & Integrations: 100M");
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS,
            PARTNERSHIPS_TOTAL,
            partnershipsAddr,
            0,
            false
        );
        _configurePartnershipsBreakdowns(tokenomicsManager, partnershipsAddr);
        console.log("       - Exchanges/Market Makers: 50M");
        console.log("       - API Integrations: 25M");
        console.log("       - Gov/Corporate: 25M");
        console.log("");

        // [6] Strategic Reserve (50M, not vested)
        console.log("  [6/6] Strategic Reserve: 50M");
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.STRATEGIC_RESERVE,
            STRATEGIC_TOTAL,
            strategicReserve,
            0,
            false
        );
        console.log("       - Emergency buffer & security");
        console.log("");

        // ════════════════════════════════════════════════════════════════════
        // STEP 4: TRANSFER TOKENS TO TOKENOMICS MANAGER
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 4: Transferring Tokens to TokenomicsManager");
        console.log("");
        
        // Transfer all tokens to TokenomicsManager for distribution
        trayToken.transfer(address(tokenomicsManager), TOTAL_SUPPLY);
        
        console.log("  Transferred", TOTAL_SUPPLY / 10**18, "TRAY to TokenomicsManager");
        console.log("");

        // ════════════════════════════════════════════════════════════════════
        // STEP 5: RELEASE INITIAL ALLOCATIONS
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 5: Releasing Initial Allocations");
        console.log("");

        // Release non-vested allocations
        console.log("  Releasing Initial Launch (250M)...");
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.INITIAL_LAUNCH);
        
        console.log("  Releasing DAO Treasury (250M)...");
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.DAO_TREASURY);
        
        console.log("  Releasing Validators & Operators (200M)...");
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.VALIDATORS_OPS);
        
        console.log("  Releasing Partnerships (100M)...");
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.PARTNERSHIPS);
        
        console.log("  Releasing Strategic Reserve (50M)...");
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.STRATEGIC_RESERVE);
        
        console.log("");
        console.log("  NOTE: Development Team vested tokens locked for 4 years");
        console.log("");

        // ════════════════════════════════════════════════════════════════════
        // STEP 6: VERIFY DEPLOYMENT
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 6: Verification");
        console.log("");

        (
            uint256 allocated,
            uint256 distributed,
            uint256 burned,
            uint256 feeCollected,
            uint256 circulating
        ) = tokenomicsManager.getTokenomicsStats();

        console.log("  Tokenomics Statistics:");
        console.log("    Total Allocated:", allocated / 10**18, "TRAY");
        console.log("    Total Distributed:", distributed / 10**18, "TRAY");
        console.log("    Total Burned:", burned / 10**18, "TRAY");
        console.log("    Total Fee Collected:", feeCollected / 10**18, "TRAY");
        console.log("    Circulating Supply:", circulating / 10**18, "TRAY");
        console.log("");

        // Verify supply
        require(circulating <= TOTAL_SUPPLY, "Supply exceeds total");

        console.log("=========================================================");
        console.log("  DEPLOYMENT COMPLETED SUCCESSFULLY");
        console.log("=========================================================");
        console.log("");
        console.log("Deployed Contracts:");
        console.log("  TRAY Token:           ", address(trayToken));
        console.log("  TokenomicsManager:    ", address(tokenomicsManager));
        console.log("");
        console.log("Allocation Recipients:");
        console.log("  DAO Treasury:         ", daoTreasury);
        console.log("  Validators Pool:      ", validatorsRewardsPool);
        console.log("  Dev Team (vesting):   ", devTeam);
        console.log("  Partnerships:         ", partnershipsAddr);
        console.log("  Strategic Reserve:    ", strategicReserve);
        console.log("  Liquidity Pools:      ", liquidityPoolsAddr);
        console.log("");
        console.log("NEXT STEPS:");
        console.log("  1. Enable TRAY as gas token: trayToken.enableGasToken(sequencer)");
        console.log("  2. Configure L2 to use TRAY for gas fees");
        console.log("  3. Start validator staking (32K TRAY minimum)");
        console.log("  4. Integrate fee collection: collectAndDistributeFees()");
        console.log("  5. Monitor vesting releases for dev team");
        console.log("");

        vm.stopBroadcast();
    }

    // ════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS FOR BREAKDOWNS
    // ════════════════════════════════════════════════════════════════════════

    function _configureInitialLaunchBreakdowns(
        TokenomicsManager manager,
        address liquidityPoolsAddr
    ) internal {
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH,
            "Private Round",
            PRIVATE_ROUND,
            liquidityPoolsAddr,
            0
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH,
            "Public Sale",
            PUBLIC_SALE,
            liquidityPoolsAddr,
            0
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH,
            "Liquidity Pools",
            LIQUIDITY_POOLS,
            liquidityPoolsAddr,
            0
        );
    }

    function _configureValidatorsBreakdowns(
        TokenomicsManager manager,
        address validatorsRewardsPool
    ) internal {
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            "Validator Rewards (1-5 years)",
            VALIDATOR_REWARDS_5YRS,
            validatorsRewardsPool,
            0
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            "Initial Incentives",
            VALIDATOR_INITIAL_INCENTIVES,
            validatorsRewardsPool,
            0
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            "Security Fund",
            VALIDATOR_SECURITY_FUND,
            validatorsRewardsPool,
            0
        );
    }

    function _configureDevelopmentBreakdowns(
        TokenomicsManager manager,
        address devTeam
    ) internal {
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.DEVELOPMENT,
            "Founders",
            FOUNDERS,
            devTeam,
            VESTING_DURATION_DAYS
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.DEVELOPMENT,
            "Engineering",
            ENGINEERING,
            devTeam,
            VESTING_DURATION_DAYS
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.DEVELOPMENT,
            "Research & Security",
            RESEARCH_SECURITY,
            devTeam,
            VESTING_DURATION_DAYS
        );
    }

    function _configurePartnershipsBreakdowns(
        TokenomicsManager manager,
        address partnershipsAddr
    ) internal {
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS,
            "Exchanges & Market Makers",
            EXCHANGES_MAKERS,
            partnershipsAddr,
            0
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS,
            "API Integrations",
            API_INTEGRATIONS,
            partnershipsAddr,
            0
        );
        
        manager.addAllocationBreakdown(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS,
            "Gov & Corporate",
            GOV_CORPORATE,
            partnershipsAddr,
            0
        );
    }
}
