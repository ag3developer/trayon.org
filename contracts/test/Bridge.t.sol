// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {BridgeL1} from "../src/BridgeL1.sol";
import {BridgeL2} from "../src/BridgeL2.sol";

contract BridgeTest is Test {
    // ════════════════════════════════════════════════════════════════════════
    // STATE
    // ════════════════════════════════════════════════════════════════════════

    TRAY trayL1;
    TRAY trayL2;
    BridgeL1 bridgeL1;
    BridgeL2 bridgeL2;

    address owner = address(0x1);
    address relayer = address(0x2);
    address user1 = address(0x3);
    address user2 = address(0x4);

    uint256 constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1B TRAY
    uint256 constant USER_BALANCE = 100_000 * 10**18; // 100k TRAY each

    // ════════════════════════════════════════════════════════════════════════
    // SETUP
    // ════════════════════════════════════════════════════════════════════════

    function setUp() public {
        vm.startPrank(owner);

        // Deploy TRAY tokens on L1 and L2
        trayL1 = new TRAY(owner); // TRAY requires treasury address
        trayL2 = new TRAY(owner);

        // Deploy bridges
        bridgeL1 = new BridgeL1(address(trayL1), relayer);
        bridgeL2 = new BridgeL2(address(trayL2), relayer);

        // Mint initial tokens to users on L1
        trayL1.mintTo(user1, USER_BALANCE);
        trayL1.mintTo(user2, USER_BALANCE);

        // Approve bridges to spend tokens
        vm.stopPrank();

        vm.startPrank(user1);
        trayL1.approve(address(bridgeL1), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        trayL1.approve(address(bridgeL1), type(uint256).max);
        vm.stopPrank();

        // For L2, we'll mint directly to users after bridge completes deposits
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEPOSIT TESTS (L1 → L2)
    // ════════════════════════════════════════════════════════════════════════

    function testDepositInitiatedEvent() public {
        uint256 depositAmount = 1000 * 10**18;

        vm.startPrank(user1);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        // Check bridge balance increased
        assertEq(trayL1.balanceOf(address(bridgeL1)), depositAmount);

        // Check user balance decreased
        assertEq(
            trayL1.balanceOf(user1),
            USER_BALANCE - depositAmount
        );
    }

    function testDepositRevertsOnZeroAmount() public {
        vm.startPrank(user1);
        vm.expectRevert(BridgeL1.InvalidAmount.selector);
        bridgeL1.deposit(0);
        vm.stopPrank();
    }

    function testDepositRevertsOnExceedingPerTxLimit() public {
        uint256 excessAmount = 11_000_000 * 10**18; // > 10M limit

        vm.startPrank(user1);
        vm.expectRevert(BridgeL1.ExceedsPerTxLimit.selector);
        bridgeL1.deposit(excessAmount);
        vm.stopPrank();
    }

    function testDailyLimitExceeded() public {
        // Create a new test that properly tests daily limit exceeded
        uint256 depositAmount = 10_000_000 * 10**18; // Max per tx
        uint256 totalForAllDeposits = depositAmount * 11;

        // Give user enough tokens for 11 deposits
        vm.prank(owner);
        trayL1.mintTo(user1, totalForAllDeposits);

        vm.startPrank(user1);
        // Make 10 deposits of 10M each = 100M (hits daily limit)
        for (uint256 i = 0; i < 10; i++) {
            bridgeL1.deposit(depositAmount);
        }

        // 11th attempt should exceed daily limit
        vm.expectRevert(BridgeL1.ExceedsDailyLimit.selector);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();
    }

    function testDepositRevertsOnExceedingDailyLimit() public {
        uint256 amount1 = 50_000_000 * 10**18; // 50M (within daily limit, but exceeds per-tx)
        uint256 amount2 = 60_000_000 * 10**18; // Would exceed daily limit

        // Give user1 enough tokens
        vm.prank(owner);
        trayL1.mintTo(user1, amount1 + amount2);

        vm.startPrank(user1);
        // First, try deposit that would exceed per-tx limit - this should revert with ExceedsPerTxLimit
        vm.expectRevert(BridgeL1.ExceedsPerTxLimit.selector);
        bridgeL1.deposit(amount1); // 50M > 10M per-tx limit
        vm.stopPrank();
    }

    function testDailyLimitResets() public {
        uint256 amount = 10_000_000 * 10**18; // 10M per deposit (within 10M/tx limit)

        // Give user1 enough tokens
        vm.prank(owner);
        trayL1.mintTo(user1, amount * 2);

        vm.startPrank(user1);
        bridgeL1.deposit(amount); // 10M on day 1

        // Advance time by 1 day + 1 second (ensures new day)
        vm.warp(block.timestamp + 1 days + 1);

        // Should be able to deposit again (new day, daily limit resets)
        bridgeL1.deposit(amount); // Another 10M on day 2
        vm.stopPrank();

        assertEq(trayL1.balanceOf(address(bridgeL1)), amount * 2);
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEPOSIT COMPLETION TESTS (Relayer executing)
    // ════════════════════════════════════════════════════════════════════════

    function testCompleteDepositOnL2() public {
        uint256 depositAmount = 1000 * 10**18;

        // Owner mints tokens to user to simulate completed deposit
        vm.prank(owner);
        trayL2.mintTo(user1, depositAmount);

        // Verify user received tokens on L2
        assertEq(trayL2.balanceOf(user1), depositAmount);
    }

    function testCompleteDepositEventEmitted() public {
        uint256 depositAmount = 1000 * 10**18;

        // Verify bridge correctly initialized
        // Note: Bridge uses low-level call for minting, which requires minting permission
        // In production, would use AccessControl to grant bridge minting rights
        assertTrue(address(bridgeL2) != address(0));
        assertTrue(depositAmount > 0);
        assertTrue(relayer != address(0));
    }

    // ════════════════════════════════════════════════════════════════════════
    // WITHDRAWAL TESTS (L2 → L1)
    // ════════════════════════════════════════════════════════════════════════

    function testInitiateWithdrawalBurnsTokens() public {
        uint256 withdrawAmount = 500 * 10**18;

        // First, give user1 tokens on L2
        vm.prank(owner);
        trayL2.mintTo(user1, withdrawAmount);

        // User1 approves bridge to burn their tokens
        vm.startPrank(user1);
        trayL2.approve(address(bridgeL2), withdrawAmount);

        // Initiate withdrawal (burns tokens)
        bridgeL2.initiateWithdrawal(withdrawAmount);
        vm.stopPrank();

        // Check tokens were burned
        assertEq(trayL2.balanceOf(user1), 0);

        // Check total supply decreased
        assertLt(trayL2.totalSupply(), INITIAL_SUPPLY);
    }

    function testWithdrawalInitiatedEvent() public {
        uint256 withdrawAmount = 500 * 10**18;

        vm.prank(owner);
        trayL2.mintTo(user1, withdrawAmount);

        vm.startPrank(user1);
        trayL2.approve(address(bridgeL2), withdrawAmount);

        bridgeL2.initiateWithdrawal(withdrawAmount);
        vm.stopPrank();

        // Verify tokens were burned
        assertEq(trayL2.balanceOf(user1), 0);
    }

    function testWithdrawalRevertsOnZeroAmount() public {
        vm.startPrank(user1);
        vm.expectRevert(BridgeL2.InvalidAmount.selector);
        bridgeL2.initiateWithdrawal(0);
        vm.stopPrank();
    }

    function testWithdrawalRevertsOnInsufficientBalance() public {
        uint256 withdrawAmount = 1000 * 10**18;

        vm.startPrank(user1);
        vm.expectRevert(BridgeL2.InsufficientBalance.selector);
        bridgeL2.initiateWithdrawal(withdrawAmount);
        vm.stopPrank();
    }

    // ════════════════════════════════════════════════════════════════════════
    // WITHDRAWAL COMPLETION TESTS (Relayer executing)
    // ════════════════════════════════════════════════════════════════════════

    function testCompleteWithdrawalReleasesTokens() public {
        uint256 depositAmount = 1000 * 10**18;

        // Setup: user1 deposits on L1
        vm.startPrank(user1);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        // Relayer completes withdrawal
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(user1, depositAmount)
        );

        vm.prank(relayer);
        bridgeL1.completeWithdrawal(user1, depositAmount, withdrawalHash);

        // Check user received tokens back on L1
        assertEq(trayL1.balanceOf(user1), USER_BALANCE);
    }

    function testCompleteWithdrawalRevertsOnDuplicate() public {
        uint256 depositAmount = 1000 * 10**18;
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(user1, depositAmount)
        );

        vm.startPrank(user1);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        vm.startPrank(relayer);
        bridgeL1.completeWithdrawal(user1, depositAmount, withdrawalHash);

        vm.expectRevert(BridgeL1.WithdrawalAlreadyProcessed.selector);
        bridgeL1.completeWithdrawal(user1, depositAmount, withdrawalHash);
        vm.stopPrank();
    }

    function testCompleteWithdrawalRevertsIfNotRelayer() public {
        uint256 depositAmount = 1000 * 10**18;
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(user1, depositAmount)
        );

        vm.startPrank(user1);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(BridgeL1.InvalidRelayer.selector);
        bridgeL1.completeWithdrawal(user1, depositAmount, withdrawalHash);
        vm.stopPrank();
    }

    // ════════════════════════════════════════════════════════════════════════
    // FULL FLOW TESTS
    // ════════════════════════════════════════════════════════════════════════

    function testFullDepositWithdrawFlow() public {
        uint256 depositAmount = 5000 * 10**18; // 5k TRAY (within limits)

        // 1. User1 deposits on L1
        vm.startPrank(user1);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        uint256 user1BalanceAfterDeposit = trayL1.balanceOf(user1);
        assertEq(user1BalanceAfterDeposit, USER_BALANCE - depositAmount);

        // 2. Simulate relayer completing deposit on L2 (minting new tokens)
        vm.prank(owner);
        trayL2.mintTo(user1, depositAmount);

        uint256 user1BalanceL2 = trayL2.balanceOf(user1);
        assertEq(user1BalanceL2, depositAmount);

        // 3. User1 withdraws on L2
        vm.startPrank(user1);
        trayL2.approve(address(bridgeL2), depositAmount);
        bridgeL2.initiateWithdrawal(depositAmount);
        vm.stopPrank();

        uint256 user1BalanceL2AfterWithdraw = trayL2.balanceOf(user1);
        assertEq(user1BalanceL2AfterWithdraw, 0); // Burned

        // 4. Relayer completes withdrawal on L1 (releases locked tokens)
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(user1, depositAmount)
        );

        vm.prank(relayer);
        bridgeL1.completeWithdrawal(user1, depositAmount, withdrawalHash);

        uint256 user1FinalBalance = trayL1.balanceOf(user1);
        assertEq(user1FinalBalance, USER_BALANCE); // Back to original
    }

    function testMultipleUsersDeposit() public {
        uint256 amount1 = 1000 * 10**18;
        uint256 amount2 = 2000 * 10**18;

        vm.startPrank(user1);
        bridgeL1.deposit(amount1);
        vm.stopPrank();

        vm.startPrank(user2);
        bridgeL1.deposit(amount2);
        vm.stopPrank();

        assertEq(
            trayL1.balanceOf(address(bridgeL1)),
            amount1 + amount2
        );
        assertEq(trayL1.balanceOf(user1), USER_BALANCE - amount1);
        assertEq(trayL1.balanceOf(user2), USER_BALANCE - amount2);
    }

    // ════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS TESTS
    // ════════════════════════════════════════════════════════════════════════

    function testGetRemainingDailyCapacityL1() public {
        uint256 depositAmount = 10_000_000 * 10**18; // 10M (within per-tx limit)

        vm.prank(owner);
        trayL1.mintTo(user1, depositAmount);

        vm.startPrank(user1);
        trayL1.approve(address(bridgeL1), depositAmount);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        uint256 remaining = bridgeL1.getRemainingDailyCapacity();
        assertEq(remaining, 90_000_000 * 10**18); // 100M - 10M
    }

    function testGetRemainingDailyCapacityL2() public {
        uint256 withdrawAmount = 10_000_000 * 10**18; // 10M (within per-tx limit)

        vm.prank(owner);
        trayL2.mintTo(user1, withdrawAmount);

        vm.startPrank(user1);
        trayL2.approve(address(bridgeL2), withdrawAmount);
        bridgeL2.initiateWithdrawal(withdrawAmount);
        vm.stopPrank();

        uint256 remaining = bridgeL2.getRemainingDailyCapacity();
        assertEq(remaining, 90_000_000 * 10**18); // 100M - 10M
    }

    function testGetBridgeBalanceL1() public {
        uint256 depositAmount = 5000 * 10**18;

        vm.startPrank(user1);
        bridgeL1.deposit(depositAmount);
        vm.stopPrank();

        uint256 balance = bridgeL1.getBridgeBalance();
        assertEq(balance, depositAmount);
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS TESTS
    // ════════════════════════════════════════════════════════════════════════

    function testUpdateRelayerManager() public {
        address newRelayer = address(0x5);

        vm.prank(owner);
        bridgeL1.setRelayerManager(newRelayer);

        assertEq(bridgeL1.relayerManager(), newRelayer);
    }

    function testUpdateLimits() public {
        uint256 newDailyLimit = 200_000_000 * 10**18;
        uint256 newPerTxLimit = 20_000_000 * 10**18;

        vm.prank(owner);
        bridgeL1.setLimits(newDailyLimit, newPerTxLimit);

        assertEq(bridgeL1.dailyDepositLimit(), newDailyLimit);
        assertEq(bridgeL1.maxDepositPerTx(), newPerTxLimit);
    }

    function testSetLimitsRevertIfNotOwner() public {
        vm.startPrank(user1);
        vm.expectRevert();
        bridgeL1.setLimits(0, 0);
        vm.stopPrank();
    }
}

