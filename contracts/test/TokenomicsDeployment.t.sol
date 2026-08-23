// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TRAY.sol";
import "../src/TokenomicsManager.sol";

/**
 * @title Tokenomics Deployment Validation
 * @notice Validates the complete, production-grade tokenomics deployment
 * @dev Tests core functionality: allocation, vesting, distribution, staking
 */
contract TokenomicsDeploymentTest is Test {
    TRAY public trayToken;
    TokenomicsManager public tokenomicsManager;

    address public deployer = address(0x1);
    address public dao = address(0x2);
    address public validators = address(0x3);
    address public dev = address(0x4);
    address public partners = address(0x5);
    address public strategic = address(0x6);
    address public liquidity = address(0x7);

    uint256 constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 constant INITIAL_SUPPLY = 250_000_000 * 10**18;

    function setUp() public {
        vm.startPrank(deployer);

        // Deploy TRAY
        trayToken = new TRAY(dao);

        // Mint full supply (1B)
        uint256 remaining = TOTAL_SUPPLY - INITIAL_SUPPLY;
        trayToken.mintTo(deployer, remaining);

        // Deploy Manager
        tokenomicsManager = new TokenomicsManager(address(trayToken));

        // Transfer tokens
        trayToken.transfer(address(tokenomicsManager), TOTAL_SUPPLY);

        vm.stopPrank();
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEPLOYMENT VALIDATION
    // ════════════════════════════════════════════════════════════════════════

    function test_DeploymentSuccessful() public {
        assertNotEq(address(trayToken), address(0));
        assertNotEq(address(tokenomicsManager), address(0));
    }

    function test_TotalSupply() public {
        assertEq(trayToken.totalSupply(), TOTAL_SUPPLY);
    }

    function test_TokensInManager() public {
        assertEq(trayToken.balanceOf(address(tokenomicsManager)), TOTAL_SUPPLY);
    }

    // ════════════════════════════════════════════════════════════════════════
    // ALLOCATION CONFIGURATION
    // ════════════════════════════════════════════════════════════════════════

    function test_ConfigureInitialLaunch() public {
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH,
            250_000_000 * 10**18,
            liquidity,
            0,
            false
        );

        // Verification via release
        vm.prank(deployer);
        tokenomicsManager.releaseAllocation(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH
        );

        // Check tokens distributed
        uint256 balance = trayToken.balanceOf(liquidity);
        assertEq(balance, 250_000_000 * 10**18);
    }

    function test_ConfigureDAOTreasury() public {
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.DAO_TREASURY,
            250_000_000 * 10**18,
            dao,
            0,
            false
        );

        vm.prank(deployer);
        tokenomicsManager.releaseAllocation(
            TokenomicsManager.AllocationCategory.DAO_TREASURY
        );

        uint256 balance = trayToken.balanceOf(dao);
        assertEq(balance, 250_000_000 * 10**18);
    }

    function test_ConfigureValidators() public {
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            200_000_000 * 10**18,
            validators,
            0,
            false
        );

        vm.prank(deployer);
        tokenomicsManager.releaseAllocation(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS
        );

        uint256 balance = trayToken.balanceOf(validators);
        assertEq(balance, 200_000_000 * 10**18);
    }

    function test_ConfigurePartnerships() public {
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS,
            100_000_000 * 10**18,
            partners,
            0,
            false
        );

        vm.prank(deployer);
        tokenomicsManager.releaseAllocation(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS
        );

        uint256 balance = trayToken.balanceOf(partners);
        assertEq(balance, 100_000_000 * 10**18);
    }

    function test_ConfigureStrategicReserve() public {
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.STRATEGIC_RESERVE,
            50_000_000 * 10**18,
            strategic,
            0,
            false
        );

        vm.prank(deployer);
        tokenomicsManager.releaseAllocation(
            TokenomicsManager.AllocationCategory.STRATEGIC_RESERVE
        );

        uint256 balance = trayToken.balanceOf(strategic);
        assertEq(balance, 50_000_000 * 10**18);
    }

    // ════════════════════════════════════════════════════════════════════════
    // VESTING VALIDATION
    // ════════════════════════════════════════════════════════════════════════

    function test_DevelopmentTeamVested() public {
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.DEVELOPMENT,
            150_000_000 * 10**18,
            dev,
            4 * 365,  // 4 year vesting
            true
        );

        // Initially nothing should be released
        uint256 balanceBefore = trayToken.balanceOf(dev);
        assertEq(balanceBefore, 0);
    }

    // ════════════════════════════════════════════════════════════════════════
    // VALIDATOR STAKING
    // ════════════════════════════════════════════════════════════════════════

    function test_ValidatorMinimumStake() public {
        // Setup: Give validators some tokens
        vm.prank(deployer);
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            200_000_000 * 10**18,
            validators,
            0,
            false
        );

        vm.prank(deployer);
        tokenomicsManager.releaseAllocation(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS
        );

        // Transfer to validator
        address validator1 = address(0x10);
        vm.prank(validators);
        trayToken.transfer(validator1, 32_000 * 10**18);

        // Approve and stake
        vm.prank(validator1);
        trayToken.approve(address(tokenomicsManager), 32_000 * 10**18);

        vm.prank(validator1);
        tokenomicsManager.stake(32_000 * 10**18);

        // Check staking info
        uint256 stakedAmount = tokenomicsManager.getValidatorStake(validator1);
        assertEq(stakedAmount, 32_000 * 10**18);
    }

    // ════════════════════════════════════════════════════════════════════════
    // COMPLETE DISTRIBUTION FLOW
    // ════════════════════════════════════════════════════════════════════════

    function test_CompleteAllocationFlow() public {
        vm.startPrank(deployer);

        // Configure all 6 allocations
        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.INITIAL_LAUNCH,
            250_000_000 * 10**18,
            liquidity,
            0,
            false
        );

        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.DAO_TREASURY,
            250_000_000 * 10**18,
            dao,
            0,
            false
        );

        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.VALIDATORS_OPS,
            200_000_000 * 10**18,
            validators,
            0,
            false
        );

        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.DEVELOPMENT,
            150_000_000 * 10**18,
            dev,
            4 * 365,
            true
        );

        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.PARTNERSHIPS,
            100_000_000 * 10**18,
            partners,
            0,
            false
        );

        tokenomicsManager.configureAllocation(
            TokenomicsManager.AllocationCategory.STRATEGIC_RESERVE,
            50_000_000 * 10**18,
            strategic,
            0,
            false
        );

        // Release non-vested allocations
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.INITIAL_LAUNCH);
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.DAO_TREASURY);
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.VALIDATORS_OPS);
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.PARTNERSHIPS);
        tokenomicsManager.releaseAllocation(TokenomicsManager.AllocationCategory.STRATEGIC_RESERVE);

        vm.stopPrank();

        // Verify distribution
        uint256 totalDistributed = trayToken.balanceOf(liquidity) +
            trayToken.balanceOf(dao) +
            trayToken.balanceOf(validators) +
            trayToken.balanceOf(partners) +
            trayToken.balanceOf(strategic);

        uint256 expectedDistributed = 250_000_000 * 10**18 +
            250_000_000 * 10**18 +
            200_000_000 * 10**18 +
            100_000_000 * 10**18 +
            50_000_000 * 10**18;

        assertEq(totalDistributed, expectedDistributed);

        // Verify vested amount still in manager
        uint256 managerBalance = trayToken.balanceOf(address(tokenomicsManager));
        assertEq(managerBalance, 150_000_000 * 10**18);  // Dev team vesting
    }
}
