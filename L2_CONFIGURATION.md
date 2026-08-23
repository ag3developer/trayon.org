# 🔧 TRAYON L2 CONFIGURATION

## Overview

Configure L2 (Trayon Testnet or Anvil) to use TRAY as the native gas token.

**Status:** Ready for Configuration  
**Requirement:** L2 must support custom gas token (TRAY)  
**Reference:** https://localhost:3000/docs/tokenomics

---

## Quick Start (Anvil Local)

### 1️⃣ Run Setup Script

```bash
cd /Users/josecarlosmartins/Documents/trayon.org
./setup-l2-local.sh
```

This will:
- ✅ Start Anvil on port 8545
- ✅ Deploy TRAY + TokenomicsManager
- ✅ Enable TRAY as gas token
- ✅ Test connections
- ✅ Output configuration

### 2️⃣ Verify L2 is Ready

```bash
# Check chain ID
cast chain-id --rpc-url http://localhost:8545

# Expected: 31337 (Anvil default)

# Check TRAY total supply
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "totalSupply()(uint256)" \
  --rpc-url http://localhost:8545

# Expected: 1000000000000000000000000000 (1B)
```

---

## Manual Configuration

### If setup script fails:

#### Step 1: Start Anvil

```bash
# Terminal 1: Start Anvil
anvil \
  --chain-id 31337 \
  --host 0.0.0.0 \
  --port 8545 \
  --accounts 10 \
  --balance 1000
```

Output shows accounts and private keys.

#### Step 2: Deploy Contracts

```bash
# Terminal 2
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Export anvil's default account
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852

# Deploy
forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow
```

**Expected output:**
```
TRAY Token deployed at: 0x...
TokenomicsManager deployed at: 0x...
Total allocated: 1000000000 TRAY
Total distributed: 850000000 TRAY
DEPLOYMENT COMPLETED SUCCESSFULLY
```

#### Step 3: Enable Gas Token

```bash
# Set sequencer (use Anvil's first account)
export L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Enable gas token
forge script script/SetupL2GasToken.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow
```

**Expected output:**
```
TRAY enabled as gas token
Sequencer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
L2 GAS TOKEN CONFIGURATION COMPLETE ✅
```

---

## Configuration Details

### L2 Architecture

```
┌─────────────────────────────────────────────┐
│         TRAYON L2 (Anvil/Testnet)           │
├─────────────────────────────────────────────┤
│                                              │
│  TRAY Token (Native Gas Token)              │
│  ├─ Chain: 31337 (Anvil) or custom          │
│  ├─ Standard: ERC-20 (compatible)           │
│  ├─ Decimals: 18                            │
│  └─ Supply: 1B TRAY                         │
│                                              │
│  TokenomicsManager                          │
│  ├─ Fee Collection: 70/20/10                │
│  ├─ Validator Staking: 32K TRAY minimum    │
│  ├─ Vesting: 4 years (dev team)            │
│  └─ Unlock: 2026-2031                       │
│                                              │
│  Sequencer                                  │
│  ├─ Collects TRAY gas fees                 │
│  ├─ Calls collectAndDistributeFees()       │
│  └─ Distributes to validators              │
│                                              │
│  Validators (Registered)                   │
│  ├─ Minimum: 32,000 TRAY                   │
│  ├─ Receive: 70% of fees                   │
│  └─ Can be slashed                          │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Environment Variables

After deployment, set these:

```bash
# L2 Network
export L2_RPC_URL="http://localhost:8545"
export L2_CHAIN_ID=31337
export L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Deployed Contracts
export TRAY_TOKEN=0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
export TOKENOMICS_MANAGER=0x3BB78Ddb66f5De33463C1C4a69e605C526720B22

# Bridge Contracts (from L1)
export BRIDGE_L1=0x...
export BRIDGE_L2=0x...

# Accounts
export VALIDATOR_REWARDS_POOL=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
export DAO_TREASURY=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Private Keys (Anvil defaults)
export SEQUENCER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852
```

### Add to `.env`

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

cat >> .env << 'EOF'

# L2 Configuration
L2_RPC_URL=http://localhost:8545
L2_CHAIN_ID=31337
L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Contracts
TRAY_TOKEN=0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
TOKENOMICS_MANAGER=0x3BB78Ddb66f5De33463C1C4a69e605C526720B22

# Accounts
VALIDATOR_REWARDS_POOL=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
EOF
```

---

## Testing L2

### 1. Check Gas Token Status

```bash
# Is gas token enabled?
cast call $TRAY_TOKEN \
  "gasTokenEnabled()(bool)" \
  --rpc-url $L2_RPC_URL

# Expected: true

# Get sequencer address
cast call $TRAY_TOKEN \
  "sequencer()(address)" \
  --rpc-url $L2_RPC_URL

# Expected: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 2. Test Validator Staking

```bash
# Approve staking
cast send $TRAY_TOKEN \
  "approve(address,uint256)" \
  $TOKENOMICS_MANAGER \
  32000000000000000000000 \
  --private-key $SEQUENCER_KEY \
  --rpc-url $L2_RPC_URL

# Stake 32K TRAY
cast send $TOKENOMICS_MANAGER \
  "stake(uint256)" \
  32000000000000000000000 \
  --private-key $SEQUENCER_KEY \
  --rpc-url $L2_RPC_URL

# Verify stake
cast call $TOKENOMICS_MANAGER \
  "getValidatorStake(address)(uint256)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url $L2_RPC_URL

# Expected: 32000000000000000000000
```

### 3. Test Fee Distribution

```bash
# Collect 100 TRAY in fees
cast send $TOKENOMICS_MANAGER \
  "collectAndDistributeFees(uint256,address)" \
  100000000000000000000 \
  $VALIDATOR_REWARDS_POOL \
  --private-key $SEQUENCER_KEY \
  --rpc-url $L2_RPC_URL

# Verify distribution:
# - 70 TRAY → Validator pool
# - 20 TRAY → Burned
# - 10 TRAY → DAO Treasury

# Check pool balance
cast call $TRAY_TOKEN \
  "balanceOf(address)(uint256)" \
  $VALIDATOR_REWARDS_POOL \
  --rpc-url $L2_RPC_URL
```

---

## Trayon Testnet Deployment

If deploying to official Trayon Testnet:

```bash
# 1. Update RPC URL
export L2_RPC_URL="https://testnet-rpc.trayon.io"

# 2. Deploy contracts
forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url $L2_RPC_URL \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY

# 3. Enable gas token (with testnet sequencer)
export L2_SEQUENCER_ADDR=0x...  # Testnet sequencer

forge script script/SetupL2GasToken.s.sol \
  --rpc-url $L2_RPC_URL \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY

# 4. Register validators
# 5. Start fee collection
```

---

## Troubleshooting

### Port 8545 Already in Use

```bash
# Find and kill process
lsof -i :8545
kill -9 <PID>

# Or use different port
anvil --port 8546
```

### Contract Deployment Fails

```bash
# Check Anvil is running
curl -s http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","result":"0x7d3d","id":1}
```

### Gas Token Not Enabled

```bash
# Check TRAY contract owner
cast call $TRAY_TOKEN "owner()(address)" --rpc-url $L2_RPC_URL

# Must be deployer account
# If not, ownership may have been transferred
```

### Fee Distribution Fails

```bash
# Check TokenomicsManager has TRAY balance
cast call $TRAY_TOKEN \
  "balanceOf(address)(uint256)" \
  $TOKENOMICS_MANAGER \
  --rpc-url $L2_RPC_URL

# Must have at least enough for 150M (dev team vesting)
```

---

## Next Steps

1. ✅ **L2 Setup:** Run setup-l2-local.sh
2. ⏳ **Enable Gas Token:** Run SetupL2GasToken.s.sol
3. ⏳ **Register Validators:** Stake 32K TRAY
4. ⏳ **Test E2E Flow:** Deposit → Execution → Withdrawal
5. ⏳ **Monitor Fees:** Track distribution

---

## Files Reference

| File | Purpose |
|------|---------|
| `setup-l2-local.sh` | Automated setup script |
| `script/DeployCompleteTokenomics.s.sol` | Deploy contracts |
| `script/SetupL2GasToken.s.sol` | Enable gas token |
| `L2_SETUP_GUIDE.md` | Detailed guide |
| `L2_CONFIGURATION.md` | This file |

---

**Status:** Ready for L2 Configuration  
**Reference:** TRAY Tokenomics Docs  
**Implementation:** Production-ready

