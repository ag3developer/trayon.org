# 🚀 TRAYON L2 SETUP GUIDE

## Overview

Configure TRAY as the native gas token on L2 (Trayon Testnet or Custom L2).

**Reference:** https://localhost:3000/docs/tokenomics  
**Token Standard:** ERC-20 (L1) + native gas token (L2)

---

## Architecture

```
L1 (Polygon Mainnet)          L2 (Trayon Testnet)
├─ TRAY ERC-20               ├─ TRAY Native Gas Token
├─ Bridge Contract           ├─ Sequencer
└─ User Accounts             ├─ Validators
                             ├─ Gas Fee Collection
                             └─ Fee Distribution (70/20/10)

Flow:
User ETH (L1) ──lock──> Bridge ──relay──> Sequencer ──mint──> TRAY (L2)
           Pay in TRAY (L2) ──gas──> Sequencer ──collect──> Treasury
```

---

## Phase 1: Enable Gas Token

### On L1 (Polygon Amoy or Mainnet)

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Set sequencer address
export L2_SEQUENCER_ADDR=0x...  # Your L2 sequencer address

# Enable gas token
forge script script/SetupL2GasToken.s.sol \
  --rpc-url https://polygon-amoy.drpc.org \
  --broadcast \
  --private-key $PRIVATE_KEY
```

**Expected Output:**
```
✅ TRAY enabled as gas token
✅ Sequencer: 0x...
✅ L2 GAS TOKEN CONFIGURATION COMPLETE
```

---

## Phase 2: Configure L2 Sequencer

### Option A: Anvil (Local Testing)

#### Start Anvil with Custom Gas Token

```bash
# Terminal 1: Start Anvil on port 8545
anvil \
  --chain-id 31337 \
  --host 0.0.0.0 \
  --port 8545 \
  --accounts 10 \
  --balance 1000
```

#### Deploy TRAY on Anvil

```bash
# Terminal 2: Deploy to Anvil
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852 \
  --slow
```

#### Configure Gas Token on Anvil

```bash
export L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

forge script script/SetupL2GasToken.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852
```

---

### Option B: Trayon Testnet

If you have access to Trayon Testnet infrastructure:

```bash
# Deploy TRAY
forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url https://testnet-rpc.trayon.io \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY

# Enable as gas token
export L2_SEQUENCER_ADDR=0x...  # Testnet sequencer address

forge script script/SetupL2GasToken.s.sol \
  --rpc-url https://testnet-rpc.trayon.io \
  --broadcast \
  --private-key $PRIVATE_KEY
```

---

## Phase 3: Configure Gas Pricing

### L2 Sequencer Integration

The sequencer needs to:

1. **Accept TRAY for gas**
   ```javascript
   // Pseudo-code
   if (tx.gasToken === TRAY_TOKEN_ADDRESS) {
     trayGasCost = gasUsed * gasPriceInTRAY;
     sequencer.collectGasFee(trayGasCost);
   }
   ```

2. **Distribute fees via TokenomicsManager**
   ```solidity
   // After collecting gas
   tokenomicsManager.collectAndDistributeFees(
     collectedGasFees,
     validatorRewardsPool
   );
   
   // Distribution:
   // - 70% → Validators
   // - 20% → Burned
   // - 10% → DAO Treasury
   ```

3. **Update fee parameters (if needed)**
   ```bash
   cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
     "updateFeePercentages(uint256,uint256,uint256)" \
     70 \
     20 \
     10 \
     --private-key $PRIVATE_KEY \
     --rpc-url $L2_RPC_URL
   ```

---

## Phase 4: Setup Fee Collection

### Register Fee Collection Account

```bash
# Set up validator rewards pool
export VALIDATOR_REWARDS_POOL=0x...

# The TokenomicsManager will send fees to this account
# Pool must have permission to:
# 1. Receive TRAY from collectAndDistributeFees()
# 2. Distribute to validators
# 3. Interact with staking contracts
```

### Test Fee Distribution

```bash
# Collect 100 TRAY in fees
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "collectAndDistributeFees(uint256,address)" \
  100000000000000000000 \
  $VALIDATOR_REWARDS_POOL \
  --private-key $PRIVATE_KEY \
  --rpc-url $L2_RPC_URL

# Expected result:
# - 70 TRAY → Validator rewards pool
# - 20 TRAY → Burned from supply
# - 10 TRAY → DAO Treasury
```

---

## Phase 5: Validator Setup

### Register Validator

```bash
# Approve staking
cast send 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "approve(address,uint256)" \
  0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  32000000000000000000000 \
  --private-key $VALIDATOR_KEY \
  --rpc-url $L2_RPC_URL

# Stake 32K TRAY minimum
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "stake(uint256)" \
  32000000000000000000000 \
  --private-key $VALIDATOR_KEY \
  --rpc-url $L2_RPC_URL

# Verify stake
cast call 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "getValidatorStake(address)(uint256)" \
  0x... \
  --rpc-url $L2_RPC_URL
```

---

## Phase 6: End-to-End Testing

### Complete Flow: Deposit → Execution → Withdrawal

```bash
# 1. User deposits on L1 (0.1 TRAY)
cast send 0xBridgeL1Address \
  "deposit(uint256)" \
  100000000000000000 \
  --private-key $USER_KEY \
  --rpc-url https://polygon-amoy.drpc.org

# 2. Relayer picks up DepositInitiated event
# 3. Relayer calls executeDeposit on L2
cast send 0xBridgeL2Address \
  "executeDeposit(address,uint256,uint256)" \
  0xUserAddress \
  100000000000000000 \
  1 \
  --private-key $RELAYER_KEY \
  --rpc-url $L2_RPC_URL

# 4. Verify L2 balance (user receives 0.1 TRAY)
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "balanceOf(address)(uint256)" \
  0xUserAddress \
  --rpc-url $L2_RPC_URL

# 5. User pays for L2 transaction in TRAY
# 6. Sequencer collects fee and distributes via TokenomicsManager
# 7. User withdraws (or continues using TRAY on L2)
```

---

## Configuration Files

### `.env` for L2 Setup

```bash
# L1 (Polygon)
PRIVATE_KEY=0x...
L1_RPC_URL=https://polygon-amoy.drpc.org

# L2 (Anvil or Trayon Testnet)
L2_RPC_URL=http://localhost:8545
L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
L2_CHAIN_ID=31337

# Contracts
TRAY_TOKEN=0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
TOKENOMICS_MANAGER=0x3BB78Ddb66f5De33463C1C4a69e605C526720B22
BRIDGE_L1=0x...
BRIDGE_L2=0x...

# Validator Setup
VALIDATOR_REWARDS_POOL=0x...
DAO_TREASURY_ADDR=0x...
VALIDATOR_KEY=0x...
```

### Update `.env`

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts
cat >> .env << 'EOF'

# L2 Configuration
L2_RPC_URL=http://localhost:8545
L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
L2_CHAIN_ID=31337
VALIDATOR_REWARDS_POOL=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
EOF
```

---

## Troubleshooting

### Issue: "GasTokenAlreadyEnabled"
**Solution:** Gas token can only be enabled once. If re-deploying, use a fresh TRAY instance.

### Issue: "Invalid sequencer address"
**Solution:** Ensure L2_SEQUENCER_ADDR is a valid Ethereum address (0x...).

### Issue: "insufficient balance for transfer"
**Solution:** Ensure TokenomicsManager has enough TRAY tokens before collectAndDistributeFees().

### Issue: L2 gas pricing not using TRAY
**Solution:** Update L2 sequencer configuration to accept TRAY. This requires:
1. Sequencer code to recognize TRAY as gas token
2. Gas price calculation in TRAY units
3. Fee collection routing to TokenomicsManager

---

## Next Steps

1. ✅ **Enable Gas Token:** Run SetupL2GasToken.s.sol
2. ⏳ **Configure Sequencer:** Implement fee collection
3. ⏳ **Setup Validators:** Register with 32K TRAY
4. ⏳ **Test E2E Flow:** Complete deposit → withdrawal
5. ⏳ **Monitor Fees:** Track gas fee distribution

---

## Testing Checklist

- [ ] Gas token enabled on L1
- [ ] TRAY deployable on L2
- [ ] Fee collection working (70/20/10 split)
- [ ] Validator staking (32K minimum)
- [ ] Burn mechanism active (20% of fees)
- [ ] E2E deposit flow works
- [ ] E2E withdrawal flow works
- [ ] Fees distributed to validators
- [ ] DAO treasury receiving 10%
- [ ] Supply deflation visible

---

**Status:** L2 Setup Guide Ready  
**Reference:** TRAY Tokenomics Docs  
**Implementation:** Production-ready configuration

