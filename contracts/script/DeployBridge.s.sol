// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {TRAY} from "../src/TRAY.sol";
import {BridgeL1} from "../src/BridgeL1.sol";
import {BridgeL2} from "../src/BridgeL2.sol";

/**
 * @title DeployBridge
 * @notice Forge deployment script for Trayon Bridge L1/L2 infrastructure
 * @dev Run with: forge script DeployBridge --rpc-url=<RPC_URL> --broadcast
 */
contract DeployBridge is Script {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    address public deployerAddress;
    address public relayerManagerAddress;
    
    // Deployed contract addresses
    TRAY public trayToken;
    BridgeL1 public bridgeL1;
    BridgeL2 public bridgeL2;
    
    // ========================================================================
    // DEPLOYMENT CONFIGURATION
    // ========================================================================

    /**
     * @notice Main deployment function
     * @dev This is automatically executed by Forge when running script
     */
    function run() external {
        // Load deployer from private key
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        deployerAddress = vm.addr(privateKey);
        relayerManagerAddress = vm.envAddress("RELAYER_MANAGER_ADDRESS");
        
        console.log("=============================================================");
        console.log("          TRAYON BRIDGE DEPLOYMENT STARTED");
        console.log("=============================================================");
        console.log("Deployer Address: ", deployerAddress);
        console.log("Relayer Manager:  ", relayerManagerAddress);
        console.log("Chain ID:         ", block.chainid);
        console.log("Block Number:     ", block.number);
        console.log("");
        
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Determine which network we're deploying to
        if (block.chainid == 80002) {
            // POLYGON AMOY (L1)
            deployPolygonAmoy();
        } else if (block.chainid == 7654321) {
            // TRAYON TESTNET (L2)
            deployTrayonTestnet();
        } else {
            revert("Unsupported chain ID");
        }
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=============================================================");
        console.log("          DEPLOYMENT COMPLETED SUCCESSFULLY");
        console.log("=============================================================");
    }

    // ========================================================================
    // POLYGON AMOY (L1) DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy to Polygon Amoy (L1)
     * @dev Deploys:
     *   - TRAY token (wrapped)
     *   - BridgeL1 contract
     */
    function deployPolygonAmoy() internal {
        console.log(">> Deploying to POLYGON AMOY (L1)");
        console.log("");
        
        // 1. Deploy TRAY token on L1 (with deployer as treasury)
        console.log("  [1/3] Deploying TRAY token...");
        trayToken = new TRAY(deployerAddress);
        console.log("       TRAY deployed at: ", address(trayToken));
        
        // 2. Deploy BridgeL1 with constructor parameters
        console.log("  [2/3] Deploying BridgeL1 contract...");
        bridgeL1 = new BridgeL1(address(trayToken), relayerManagerAddress);
        console.log("       BridgeL1 deployed at: ", address(bridgeL1));
        
        // 3. Mint initial TRAY tokens for testing (only if needed)
        console.log("  [3/3] Minting test TRAY tokens (50M)...");
        trayToken.mint(50_000_000 * 10**18);
        console.log("       Minted 50M TRAY to deployer");
        
        // 4. Print deployment addresses
        console.log("");
        console.log("POLYGON AMOY (L1) DEPLOYMENT SUMMARY:");
        console.log("---------------------------------------");
        console.log("TRAY Token:  ", address(trayToken));
        console.log("BridgeL1:    ", address(bridgeL1));
        console.log("Owner:       ", bridgeL1.owner());
        console.log("Relayer Mgr: ", bridgeL1.relayerManager());
    }

    // ========================================================================
    // TRAYON TESTNET (L2) DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy to Trayon Testnet (L2)
     * @dev Deploys:
     *   - TRAY token (native)
     *   - BridgeL2 contract
     */
    function deployTrayonTestnet() internal {
        console.log(">> Deploying to TRAYON TESTNET (L2)");
        console.log("");
        
        // 1. Deploy TRAY token on L2 (with deployer as treasury)
        console.log("  [1/3] Deploying native TRAY token on L2...");
        trayToken = new TRAY(deployerAddress);
        console.log("       TRAY deployed at: ", address(trayToken));
        
        // 2. Deploy BridgeL2 with constructor parameters
        console.log("  [2/3] Deploying BridgeL2 contract...");
        bridgeL2 = new BridgeL2(address(trayToken), relayerManagerAddress);
        console.log("       BridgeL2 deployed at: ", address(bridgeL2));
        
        // 3. Mint initial TRAY tokens for testing
        console.log("  [3/3] Minting initial TRAY supply on L2...");
        trayToken.mint(50_000_000 * 10**18);
        console.log("       Minted 50M TRAY on L2");
        
        // 4. Print deployment addresses
        console.log("");
        console.log("TRAYON TESTNET (L2) DEPLOYMENT SUMMARY:");
        console.log("---------------------------------------");
        console.log("TRAY Token:  ", address(trayToken));
        console.log("BridgeL2:    ", address(bridgeL2));
        console.log("Owner:       ", bridgeL2.owner());
        console.log("Relayer Mgr: ", bridgeL2.relayerManager());
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Get readable chain name
     */
    function getChainName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 80002) return "Polygon Amoy";
        if (chainId == 7654321) return "Trayon Testnet";
        return "Unknown";
    }
}
