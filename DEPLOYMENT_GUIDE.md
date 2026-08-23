# 🚀 Deployment Guide - Trayon Bridge

## Phase 4: Real Deployment to Polygon Amoy

### Prerequisites ✅
- [x] Smart Contracts: 142/142 tests passing
- [x] E2E Test: Fully functional
- [x] Relayer: Built and ready
- [x] Deploy Script: Ready to execute
- [x] Private Key: Configured in `.env`

### Your Wallet
- **Address**: `0x99e519c1Dff179011541907Ea3d81232d397aaF1`
- **Private Key**: Configured in `.env`

---

## Step-by-Step Deployment

### Step 1: Verify Internet Connection
```bash
# Test RPC connection to Polygon Amoy
cast rpc eth_chainId --rpc-url "https://rpc-mumbai.maticvigil.com"
# Expected: 0x13881 (decimal 80001)
```

### Step 2: Check MATIC Balance
```bash
# Check your balance on Polygon Amoy
cast balance 0x99e519c1Dff179011541907Ea3d81232d397aaF1 \
  --rpc-url "https://rpc-mumbai.maticvigil.com"

# You need at least 1-2 MATIC for gas fees
# Get free testnet MATIC from: https://faucet.polygon.technology/
```

### Step 3: Simulate Deployment (Dry Run - No Gas Cost)
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Simulate Polygon Amoy deployment (no blockchain changes)
./script/deploy.sh polygon_amoy simulate
```

**Expected Output:**
- Contract addresses will be displayed
- Gas estimates shown
- No actual blockchain transactions

### Step 4: Real Deployment (Costs MATIC Gas)
```bash
# Deploy to Polygon Amoy (REAL - will spend gas)
./script/deploy.sh polygon_amoy deploy

# When prompted: type "yes" to confirm
```

**What happens:**
1. Deploys TRAY token contract
2. Deploys BridgeL1 contract
3. Deploys BridgeL2 contract
4. Sets relayer manager
5. Initializes contract state

**Script will ask for confirmation before spending gas!**

### Step 5: Record Deployed Addresses
After deployment, you'll see:
```
✅ TRAY Token deployed: 0x...
✅ BridgeL1 deployed: 0x...
✅ BridgeL2 deployed: 0x...
```

**SAVE THESE ADDRESSES** - you need them for the relayer!

### Step 6: Update Relayer Configuration
```bash
# Edit relayer environment file
nano /Users/josecarlosmartins/Documents/trayon.org/relayer/.env.local

# Update these values with your deployed addresses:
BRIDGE_L1_ADDRESS=0x...  # From deployment
BRIDGE_L2_ADDRESS=0x...  # From deployment
TRAY_L1_ADDRESS=0x...    # From deployment
TRAY_L2_ADDRESS=0x...    # From deployment
```

### Step 7: Start Relayer with Real Contracts
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/relayer

# Build relayer
npm run build

# Start relayer (with real addresses)
npm run dev

# Expected: Relayer connects to both networks and starts listening
```

### Step 8: Test Real E2E Flow
```bash
# In a new terminal, execute a real deposit transaction
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Send a test transaction (requires some MATIC)
cast send <BRIDGE_L1_ADDRESS> "deposit(uint256)" 1000000000000000000 \
  --private-key "3cfd8d9136fc147b4140cbcb1574eeeeb73fa802d9a2f168e349a73ee0e9d743" \
  --rpc-url "https://rpc-mumbai.maticvigil.com"
```

---

## Expected Results

### Successful Deployment Indicators ✅
1. All contracts deployed to Polygon Amoy
2. Relayer successfully connects to both networks
3. Relayer detects DepositInitiated events
4. Relayer executes completeDeposit on L2
5. Real TRAY tokens transferred across bridge
6. E2E test flow completes successfully

### Logging & Monitoring
```bash
# View relayer logs
tail -f /tmp/relayer.log

# View deployment logs
ls -la /Users/josecarlosmartins/Documents/trayon.org/contracts/logs/

# Monitor contract events
cast logs "DepositInitiated" \
  --rpc-url "https://rpc-mumbai.maticvigil.com"
```

---

## Troubleshooting

### ❌ "Error: Client error (Connect)"
**Problem**: No internet connection
**Solution**: Wait for internet, then retry

### ❌ "Insufficient balance"
**Problem**: Not enough MATIC for gas
**Solution**: Get free MATIC from faucet at https://faucet.polygon.technology/

### ❌ "Invalid private key"
**Problem**: Private key format incorrect
**Solution**: Verify `.env` has correct private key (no `0x` prefix)

### ❌ "Contract verification failed"
**Problem**: Verification step failed
**Solution**: Contracts are still deployed, just can't verify on Etherscan yet

---

## Cost Estimation

| Operation | Gas (approx) | MATIC Cost |
|-----------|--------------|-----------|
| Deploy TRAY Token | 2,000,000 | ~0.2 MATIC |
| Deploy BridgeL1 | 1,500,000 | ~0.15 MATIC |
| Deploy BridgeL2 | 1,500,000 | ~0.15 MATIC |
| **TOTAL** | **5,000,000** | **~0.5 MATIC** |

**Total Cost**: ~0.5 MATIC (~$0.001 USD at current testnet rates)

---

## Next Steps After Deployment

1. ✅ Verify contracts deployed
2. ✅ Configure relayer with real addresses
3. ✅ Start relayer
4. ✅ Execute real deposit transaction
5. ✅ Monitor relayer processing event
6. ✅ Verify tokens appear on L2
7. ✅ Test withdrawal flow L2→L1

---

## Commands Reference

```bash
# Quick deployment flow
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Simulate first
./script/deploy.sh polygon_amoy simulate

# Then deploy for real
./script/deploy.sh polygon_amoy deploy
```

---

**Status**: Ready for deployment! 🚀
