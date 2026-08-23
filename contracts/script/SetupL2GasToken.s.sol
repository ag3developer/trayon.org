// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TRAY} from "../src/TRAY.sol";

/**
 * @title Setup L2 Gas Token
 * @notice Configure TRAY as the native gas token on L2
 * @dev Implementation: TRAY as native gas token per tokenomics docs
 * 
 * Reference: https://localhost:3000/docs/tokenomics
 * "Token standard: ERC-20 (L1) + native gas token (L2)"
 * 
 * This script enables TRAY to function as the gas token on L2,
 * replacing ETH-like gas. The sequencer will collect TRAY gas fees
 * and distribute them via the 70/20/10 mechanism.
 */
contract SetupL2GasToken is Script {
    // L2 Configuration
    address public constant TRAY_TOKEN = 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b;
    address public constant TOKENOMICS_MANAGER = 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22;

    // L2 Sequencer (to be configured)
    address public sequencer;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Get or use default sequencer
        sequencer = vm.envOr("L2_SEQUENCER_ADDR", deployer);

        console.log("════════════════════════════════════════════════════════════════════════");
        console.log("  TRAYON L2 GAS TOKEN CONFIGURATION");
        console.log("  Enabling TRAY as native L2 gas token");
        console.log("════════════════════════════════════════════════════════════════════════");
        console.log("");

        console.log("Configuration:");
        console.log("  TRAY Token:         ", TRAY_TOKEN);
        console.log("  TokenomicsManager:  ", TOKENOMICS_MANAGER);
        console.log("  Sequencer Address:  ", sequencer);
        console.log("  Network:            ", block.chainid);
        console.log("");

        vm.startBroadcast(deployerKey);

        // Get TRAY instance
        TRAY trayToken = TRAY(TRAY_TOKEN);

        // ════════════════════════════════════════════════════════════════════
        // STEP 1: ENABLE GAS TOKEN
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 1: Enabling TRAY as Gas Token");
        console.log("");

        // Enable gas token on TRAY
        trayToken.enableGasToken(sequencer);

        console.log("  ✅ TRAY enabled as gas token");
        console.log("  ✅ Sequencer: ", sequencer);
        console.log("");

        // ════════════════════════════════════════════════════════════════════
        // STEP 2: VERIFICATION
        // ════════════════════════════════════════════════════════════════════

        console.log("STEP 2: Verification");
        console.log("");

        bool gasTokenEnabled = trayToken.gasTokenEnabled();
        address sequencerAddress = trayToken.sequencer();

        console.log("  Gas Token Enabled:  ", gasTokenEnabled);
        console.log("  Sequencer Address:  ", sequencerAddress);
        console.log("");

        require(gasTokenEnabled, "Gas token not enabled");
        require(sequencerAddress == sequencer, "Sequencer address mismatch");

        console.log("════════════════════════════════════════════════════════════════════════");
        console.log("  L2 GAS TOKEN CONFIGURATION COMPLETE ✅");
        console.log("════════════════════════════════════════════════════════════════════════");
        console.log("");
        console.log("Next Steps:");
        console.log("  1. Configure L2 sequencer to:");
        console.log("     - Accept TRAY for gas fees");
        console.log("     - Collect fees into treasury");
        console.log("     - Call processFee() for distribution (70/20/10)");
        console.log("  2. Update L2 RPC to use TRAY gas pricing");
        console.log("  3. Configure validator rewards account");
        console.log("  4. Test deposit → execution → withdrawal flow");
        console.log("");

        vm.stopBroadcast();
    }
}
