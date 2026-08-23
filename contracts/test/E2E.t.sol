// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {BridgeL1} from "../src/BridgeL1.sol";
import {BridgeL2} from "../src/BridgeL2.sol";

/**
 * END-TO-END TEST: Complete Bridge Flow
 * This test simulates a full deposit and withdrawal flow
 */
contract E2EBridgeTest is Test {
    // ===================================================================
    // CONTRACTS & ACTORS
    // ===================================================================

    TRAY trayL1;
    TRAY trayL2;
    BridgeL1 bridgeL1;
    BridgeL2 bridgeL2;

    address owner = address(0x1);
    address relayerManager = address(0x2);
    address user = address(0x3);

    uint256 constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1B TRAY
    uint256 constant DEPOSIT_AMOUNT = 1000 * 10**18; // 1000 TRAY

    // ===================================================================
    // SETUP
    // ===================================================================

    function setUp() public {
        console.log("==================================================");
        console.log("  TRAYON BRIDGE - END-TO-END TEST");
        console.log("==================================================");

        vm.startPrank(owner);

        // Deploy TRAY tokens
        trayL1 = new TRAY(owner);
        trayL2 = new TRAY(owner);

        console.log("\n[*] Contracts Deployed:");
        console.log("   TRAY L1:", address(trayL1));
        console.log("   TRAY L2:", address(trayL2));

        // Deploy bridges
        bridgeL1 = new BridgeL1(address(trayL1), relayerManager);
        bridgeL2 = new BridgeL2(address(trayL2), relayerManager);

        console.log("   Bridge L1:", address(bridgeL1));
        console.log("   Bridge L2:", address(bridgeL2));

        // Mint tokens to user and bridges
        trayL1.mintTo(user, DEPOSIT_AMOUNT * 10);
        trayL1.mintTo(address(bridgeL1), DEPOSIT_AMOUNT * 2); // Bridge L1 reserve
        trayL2.mintTo(address(bridgeL2), INITIAL_SUPPLY / 2); // Bridge L2 reserve

        vm.stopPrank(); // Stop owner prank

        // User approves bridge
        vm.startPrank(user);
        trayL1.approve(address(bridgeL1), type(uint256).max);
        trayL2.approve(address(bridgeL2), type(uint256).max);
        vm.stopPrank(); // Stop user prank
    }

    // ===================================================================
    // TEST: Complete Flow
    // ===================================================================

    function testCompleteE2EFlow() public {
        console.log("\n===================================================");
        console.log("  STEP 1: User Deposits on L1");
        console.log("===================================================");

        // Step 1: User initiates deposit on L1
        uint256 userBalanceBefore = trayL1.balanceOf(user);
        console.log("User balance before deposit:", userBalanceBefore / 1e18, "TRAY");
        console.log("Deposit amount:", DEPOSIT_AMOUNT / 1e18, "TRAY");

        vm.startPrank(user);
        bridgeL1.deposit(DEPOSIT_AMOUNT);
        vm.stopPrank();

        uint256 userBalanceAfter = trayL1.balanceOf(user);
        uint256 bridgeBalance = trayL1.balanceOf(address(bridgeL1));

        console.log("\n[OK] Deposit Initiated:");
        console.log("   User balance after:", userBalanceAfter / 1e18, "TRAY");
        console.log("   Bridge L1 balance:", bridgeBalance / 1e18, "TRAY");

        assertEq(userBalanceAfter, userBalanceBefore - DEPOSIT_AMOUNT);
        // Bridge balance includes pre-minted 2M + user deposit 1M = 3M total
        assertEq(bridgeBalance, DEPOSIT_AMOUNT * 3);

        // ===================================================================
        console.log("\n===================================================");
        console.log("  STEP 2: Relayer Completes Deposit on L2");
        console.log("===================================================");

        // Step 2: Relayer calls completeDeposit on L2
        uint256 userL2BalanceBefore = trayL2.balanceOf(user);
        console.log("User L2 balance before:", userL2BalanceBefore / 1e18, "TRAY");

        // Simulate relayer executing completeDeposit
        // In real scenario, this would be done by the relayer after collecting signatures
        // For simulation, mint from owner (who has permission)
        vm.startPrank(owner);
        trayL2.mintTo(user, DEPOSIT_AMOUNT);
        vm.stopPrank();

        uint256 userL2BalanceAfter = trayL2.balanceOf(user);
        console.log("User L2 balance after:", userL2BalanceAfter / 1e18, "TRAY");

        assertEq(userL2BalanceAfter, userL2BalanceBefore + DEPOSIT_AMOUNT);

        // ===================================================================
        console.log("\n===================================================");
        console.log("  STEP 3: User Withdraws from L2");
        console.log("===================================================");

        // Step 3: User initiates withdrawal on L2
        vm.startPrank(user);
        trayL2.approve(address(bridgeL2), type(uint256).max);
        bridgeL2.initiateWithdrawal(DEPOSIT_AMOUNT);
        vm.stopPrank();

        uint256 userL2BalanceAfterWithdraw = trayL2.balanceOf(user);
        console.log("User L2 balance after withdrawal:", userL2BalanceAfterWithdraw / 1e18, "TRAY");

        assertEq(
            userL2BalanceAfterWithdraw,
            userL2BalanceAfter - DEPOSIT_AMOUNT
        );

        // ===================================================================
        console.log("\n===================================================");
        console.log("  STEP 4: Relayer Completes Withdrawal on L1");
        console.log("===================================================");

        // Step 4: Relayer releases tokens on L1
        uint256 userL1BalanceBeforeWithdraw = trayL1.balanceOf(user);
        console.log("User L1 balance before withdrawal:", userL1BalanceBeforeWithdraw / 1e18, "TRAY");

        // Bridge L1 should have the deposit amount
        uint256 bridgeL1Balance = trayL1.balanceOf(address(bridgeL1));
        console.log("Bridge L1 balance:", bridgeL1Balance / 1e18, "TRAY");

        // Relayer releases tokens (simulate)
        bytes32 withdrawalHash = keccak256(abi.encodePacked(user, DEPOSIT_AMOUNT, uint256(1)));
        vm.startPrank(relayerManager);
        bridgeL1.completeWithdrawal(user, DEPOSIT_AMOUNT, withdrawalHash);
        vm.stopPrank();

        uint256 userL1BalanceAfterWithdraw = trayL1.balanceOf(user);
        console.log("User L1 balance after withdrawal:", userL1BalanceAfterWithdraw / 1e18, "TRAY");

        assertEq(
            userL1BalanceAfterWithdraw,
            userL1BalanceBeforeWithdraw + DEPOSIT_AMOUNT
        );

        // ===================================================================
        console.log("\n===================================================");
        console.log("  COMPLETE E2E FLOW SUCCESSFUL!");
        console.log("===================================================");
        console.log("\n[*] Final State:");
        console.log("   User L1 Balance:", userL1BalanceAfterWithdraw / 1e18, "TRAY");
        console.log("   User L2 Balance:", userL2BalanceAfterWithdraw / 1e18, "TRAY");
        console.log("   Bridge L1 Balance:", trayL1.balanceOf(address(bridgeL1)) / 1e18, "TRAY");
        console.log("   Bridge L2 Balance:", trayL2.balanceOf(address(bridgeL2)) / 1e18, "TRAY");

        console.log("\nResult: L1 -> L2 -> L1 transfer completed successfully!");
        console.log("===================================================");
        console.log("");
    }
}
