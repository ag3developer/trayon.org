// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BridgeL2} from "../src/BridgeL2.sol";
import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";

/**
 * Test script to execute a deposit on L2 (Anvil)
 * Simulates relayer calling completeDeposit
 */
contract TestDepositL2 is Script {
    // L2 Contracts (Anvil 31337)
    address constant TRAY_L2 = 0x6645794F6834DE96cC666c5Cfb7fC58f386fe2B5;
    address constant BRIDGE_L2 = 0x1e1aC442A833b71F60715a1040281F7C5D1F77db;
    address constant RELAYER = 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f;
    address constant USER = 0x70997970c51812E339D9b73B0245ad59CC0cffeB; // anvil default account

    function run() external {
        vm.startBroadcast(RELAYER);

        // Simulate relayer executing deposit on L2
        // In real flow, relayer would call after receiving signatures
        bytes32 depositHash = keccak256(abi.encodePacked(USER, uint256(0.1 ether), block.timestamp));

        BridgeL2 bridge = BridgeL2(BRIDGE_L2);

        console.log("=== Executing Deposit on L2 ===");
        console.log("User:", USER);
        console.log("Amount: 0.1 TRAY");
        console.log("DepositHash:", vm.toString(depositHash));

        // Call completeDeposit (as relayer would)
        bridge.completeDeposit(USER, 100000000000000000, depositHash);

        console.log("Deposit completed on L2");

        // Verify user balance increased
        IERC20 tray = IERC20(TRAY_L2);
        uint256 balance = tray.balanceOf(USER);
        console.log("User L2 balance:", balance);

        vm.stopBroadcast();
    }
}
