# 🚀 Trayon Bridge Deployment Guide

Complete guide for deploying the Trayon Bridge L1/L2 infrastructure to testnets.

---

## 📋 Prerequisites

### 1. Environment Setup
```bash
# Ensure Foundry is installed
forge --version  # Should be v1.7.1+

# Navigate to contracts directory
cd contracts

# Create .env file with required variables
cp .env.example .env
```

### 2. Environment Variables

Create a `.env` file in the `contracts/` directory:

```bash
# Private key of deployer account
PRIVATE_KEY=your_deployer_private_key_here

# Relayer Manager address (who can call relayer functions)
RELAYER_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890

# RPC URLs (optional - will use foundry.toml defaults if not set)
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
TRAYON_TESTNET_RPC=http://your-trayon-rpc-endpoint:port
```

### 3. Verify Contract Requirements

Check that both contracts have `initialize()` functions:
```solidity
// BridgeL1
function initialize(address _trayToken, address _relayerManager) external onlyOwner

// BridgeL2
function initialize(address _trayToken, address _relayerManager) external onlyOwner
```

---

## 🔧 Configuration Files

### foundry.toml

Ensure your `foundry.toml` has the correct RPC URLs configured:

```toml
[rpc_endpoints]
polygon_amoy = "https://rpc-amoy.polygon.technology"
trayon_testnet = "http://localhost:8545"  # or your Trayon RPC endpoint

[profile.default]
optimizer_runs = 200
solc_version = "0.8.20"
```

### .env Template

```bash
# DEPLOYMENT CONFIGURATION
PRIVATE_KEY=0x...your_private_key_here
RELAYER_MANAGER_ADDRESS=0x...relayer_address_here

# NETWORK RPC ENDPOINTS
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
TRAYON_TESTNET_RPC=http://localhost:8545

# OPTIONAL: Pre-existing token addresses (leave empty for fresh deployment)
TRAY_TOKEN_L1=
TRAY_TOKEN_L2=
```

---

## 📱 Deployment Steps

### Step 1: Deploy to Polygon Amoy (L1)

```bash
# Load environment variables
export $(cat .env | xargs)

# Dry-run (simulate without actual deployment)
forge script script/DeployBridge.s.sol \
  --rpc-url polygon_amoy \
  --private-key $PRIVATE_KEY \
  --verify \
  -vvv

# Actual deployment with broadcast
forge script script/DeployBridge.s.sol \
  --rpc-url polygon_amoy \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvv
```

**Expected Output:**
```
═══════════════════════════════════════════════════════════
          🚀 TRAYON BRIDGE DEPLOYMENT STARTED
═══════════════════════════════════════════════════════════
Deployer Address:  0x...
Relayer Manager:   0x...
Chain ID:          80002
Block Number:      123456

>>> Deploying to POLYGON AMOY (L1)

  [1/2] Deploying TRAY token...
       ✅ TRAY deployed at: 0x...

  [2/2] Deploying BridgeL1 contract...
       ✅ BridgeL1 deployed at: 0x...

📋 POLYGON AMOY (L1) DEPLOYMENT SUMMARY:
─────────────────────────────────────────
TRAY Token:  0x...
BridgeL1:    0x...
Owner:       0x...
Relayer Mgr: 0x...

✅ DEPLOYMENT COMPLETED SUCCESSFULLY
```

### Step 2: Deploy to Trayon Testnet (L2)

```bash
# Load environment variables
export $(cat .env | xargs)

# Dry-run simulation
forge script script/DeployBridge.s.sol \
  --rpc-url trayon_testnet \
  --private-key $PRIVATE_KEY \
  --verify \
  -vvv

# Actual deployment with broadcast
forge script script/DeployBridge.s.sol \
  --rpc-url trayon_testnet \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvv
```

### Step 3: Record Deployed Addresses

Save the deployed contract addresses:

```bash
# Create deployment record
cat > DEPLOYMENT_ADDRESSES.json << 'EOF'
{
  "polygon_amoy_l1": {
    "chain_id": 80002,
    "deployed_at": "2024-01-XX",
    "deployer": "0x...",
    "tray_token": "0x...",
    "bridge_l1": "0x...",
    "owner": "0x...",
    "relayer_manager": "0x..."
  },
  "trayon_testnet_l2": {
    "chain_id": 7654321,
    "deployed_at": "2024-01-XX",
    "deployer": "0x...",
    "tray_token": "0x...",
    "bridge_l2": "0x...",
    "owner": "0x...",
    "relayer_manager": "0x..."
  }
}
EOF
```

---

## 🔐 Security Checks

Before deploying to mainnet, verify:

1. **Contract Ownership**
   ```bash
   cast call <BRIDGE_ADDRESS> "owner()" --rpc-url <RPC_URL>
   ```

2. **Relayer Manager**
   ```bash
   cast call <BRIDGE_ADDRESS> "relayerManager()" --rpc-url <RPC_URL>
   ```

3. **Rate Limits**
   ```bash
   cast call <BRIDGE_ADDRESS> "dailyDepositLimit()" --rpc-url <RPC_URL>
   cast call <BRIDGE_ADDRESS> "maxDepositPerTx()" --rpc-url <RPC_URL>
   ```

4. **Token Balance**
   ```bash
   cast call <TRAY_ADDRESS> "balanceOf(<BRIDGE_ADDRESS>)" --rpc-url <RPC_URL>
   ```

---

## 🧪 Post-Deployment Testing

### 1. Verify Contract Addresses

```bash
# Check L1
forge verify-contract --chain-id 80002 \
  <BRIDGE_L1_ADDRESS> \
  contracts/src/BridgeL1.sol:BridgeL1

# Check L2
forge verify-contract --chain-id 7654321 \
  <BRIDGE_L2_ADDRESS> \
  contracts/src/BridgeL2.sol:BridgeL2
```

### 2. Test Token Transfer

```bash
# Send test TRAY to bridge
cast send <TRAY_ADDRESS> \
  "approve(address,uint256)" \
  <BRIDGE_L1_ADDRESS> \
  1000000000000000000 \
  --rpc-url polygon_amoy \
  --private-key $PRIVATE_KEY
```

### 3. Test Bridge Deposit (L1)

```bash
# Initiate deposit on L1
cast send <BRIDGE_L1_ADDRESS> \
  "deposit(uint256)" \
  1000000000000000000 \
  --rpc-url polygon_amoy \
  --private-key $PRIVATE_KEY
```

---

## 🔄 Updating Relayer Configuration

After deployment, update the relayer `.env` file:

```bash
# Update relayer/.env.local with deployed addresses
BRIDGE_L1_ADDRESS=0x...
BRIDGE_L2_ADDRESS=0x...
TRAY_TOKEN_ADDRESS_L1=0x...
TRAY_TOKEN_ADDRESS_L2=0x...

# Restart relayer to pick up new configuration
cd relayer
npm run dev
```

---

## 📊 Deployment Checklist

- [ ] Private key loaded in `.env`
- [ ] Relayer manager address configured
- [ ] RPC endpoints tested and working
- [ ] Foundry version v1.7.1+
- [ ] Contract files unmodified (hash verified)
- [ ] Deployment script reviewed (DeployBridge.s.sol)
- [ ] Dry-run simulation successful
- [ ] Test account has sufficient gas (testnet faucet)
- [ ] L1 deployment completed successfully
- [ ] L2 deployment completed successfully
- [ ] Contract addresses recorded
- [ ] Ownership verified
- [ ] Rate limits verified
- [ ] Relayer configuration updated
- [ ] Relayer restarted with new addresses

---

## 🆘 Troubleshooting

### "Unsupported chain ID"
**Problem**: Deploying to unsupported network
**Solution**: Only Polygon Amoy (80002) and Trayon Testnet (7654321) are supported

### "PRIVATE_KEY not found"
**Problem**: Environment variable not set
**Solution**: 
```bash
export PRIVATE_KEY=0x...
# or
source .env
```

### "Insufficient gas"
**Problem**: Insufficient native token balance
**Solution**: Request testnet faucet tokens:
- Polygon Amoy: https://faucet.polygon.technology/
- Trayon Testnet: Contact Trayon team

### "Contract verification failed"
**Problem**: Contract source doesn't match bytecode
**Solution**: Ensure you're using the exact contract source from repo

### "Initialize failed - Ownable: caller is not the owner"
**Problem**: Deployer is not the contract owner
**Solution**: Verify `owner()` is the same as deployer address

---

## 📞 Support

For issues or questions:
1. Check logs in `/tmp/deploy.log`
2. Verify RPC endpoint connectivity
3. Review contract source files
4. Check Foundry documentation: https://book.getfoundry.sh/

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Update relayer configuration with contract addresses
2. ✅ Restart relayer with new addresses
3. ✅ Run E2E tests on testnet
4. ✅ Monitor bridge for 24 hours
5. ✅ Prepare mainnet deployment (after audit/testing)

---

**Last Updated**: 2024-01-XX
**Maintained By**: Trayon Bridge Team
**Status**: ✅ Ready for Testnet Deployment
