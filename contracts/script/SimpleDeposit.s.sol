// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleDeposit
 * @notice Script to execute a simple deposit on BridgeL1
 * 
 * Usage:
 *   forge script contracts/script/SimpleDeposit.s.sol \
 *     --rpc-url https://polygon.drpc.org \
 *     --broadcast \
 *     --private-key $PRIVATE_KEY
 */
contract SimpleDeposit is Script {
    // Configuration
    address constant L1_TRAY = 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b;
    address constant L1_BRIDGE = 0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9;
    address constant TEST_ACCOUNT = 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f;
    
    function run() external {
        // Get deployer from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===== EXECUTING DEPOSIT ON L1 =====");
        console.log("");
        console.log("Configuration:");
        console.log("  Deployer: %s", deployer);
        console.log("  Test Account: %s", TEST_ACCOUNT);
        console.log("  L1 TRAY: %s", L1_TRAY);
        console.log("  L1 Bridge: %s", L1_BRIDGE);
        console.log("");
        
        // Check balance
        uint256 balance = IERC20(L1_TRAY).balanceOf(deployer);
        console.log("  Deployer TRAY Balance: %s wei", balance);
        
        // Deposit amount: 0.1 TRAY
        uint256 depositAmount = 0.1 ether;
        
        console.log("");
        console.log("===== STEP 1: Approve Bridge to spend TRAY =====");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Check current allowance
        uint256 currentAllowance = IERC20(L1_TRAY).allowance(deployer, L1_BRIDGE);
        console.log("  Current allowance: %s wei", currentAllowance);
        
        if (currentAllowance < depositAmount) {
            console.log("  Approving %s wei", depositAmount);
            IERC20(L1_TRAY).approve(L1_BRIDGE, depositAmount);
        }
        
        console.log("");
        console.log("===== STEP 2: Execute Deposit =====");
        
        // Call deposit function
        // deposit(uint256 amount)
        // Note: The bridge will track the depositor as msg.sender
        (bool success, bytes memory result) = L1_BRIDGE.call(
            abi.encodeWithSignature(
                "deposit(uint256)",
                depositAmount
            )
        );
        
        require(success, "Deposit call failed");
        
        console.log("OK: Deposit executed successfully!");
        console.log("  Amount: %s wei (0.1 TRAY)", depositAmount);
        console.log("  Depositor: %s", deployer);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("===== NEXT STEPS =====");
        console.log("1. Monitor relayer logs for DepositInitiated event");
        console.log("2. Wait 15 seconds for relayer to process");
        console.log("3. Check L2 TRAY balance");
    }
}
