# 🚀 TRAYON TOKENOMICS - QUICK START

## ⚡ TL;DR

Production-grade tokenomics system deployed on Polygon Amoy:
- **TRAY Token:** `0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b`
- **TokenomicsManager:** `0x3BB78Ddb66f5De33463C1C4a69e605C526720B22`
- **Network:** Polygon Amoy (Chain 80002)
- **Status:** ✅ Live & tested (11/11 tests passing)

---

## 📦 What's Deployed

### TRAY Token (1 Bilhão)
- 250M - Initial Launch (released)
- 250M - DAO Treasury (released)
- 200M - Validators & Ops (released)
- 150M - Dev Team (vesting 4 years)
- 100M - Partnerships (released)
- 50M - Strategic Reserve (released)

### Features
- ✅ ERC-20 standard
- ✅ Burnable (20% of fees)
- ✅ Permit support (gas-less approvals)
- ✅ Can be L2 native gas token

---

## 🎯 Common Tasks

### 1. Query Tokenomics Stats

```bash
cast call 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "getTokenomicsStats()(uint256,uint256,uint256,uint256,uint256)" \
  --rpc-url https://polygon-amoy.drpc.org
```

Expected output:
```
1000000000000000000000000000  # allocated (1B)
850000000000000000000000000   # distributed (850M)
0                              # burned (0)
0                              # fee collected (0)
1000000000000000000000000000  # circulating (1B)
```

### 2. Check TRAY Balance

```bash
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "balanceOf(address)(uint256)" \
  0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f \
  --rpc-url https://polygon-amoy.drpc.org
```

### 3. Stake TRAY as Validator

```bash
# Approve tokens
cast send 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "approve(address,uint256)" \
  0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  32000000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://polygon-amoy.drpc.org

# Stake minimum (32K TRAY)
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "stake(uint256)" \
  32000000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://polygon-amoy.drpc.org
```

### 4. Release Vested Tokens (After 4 Years)

```bash
# Release development team vesting
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "releaseVestedTokens(uint8,uint256)" \
  3 \
  0 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://polygon-amoy.drpc.org
```

### 5. Process Fees

```bash
# Collect and distribute fees (70/20/10)
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "collectAndDistributeFees(uint256,address)" \
  100000000000000000000 \
  0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://polygon-amoy.drpc.org
```

---

## 🔄 Mainnet Deployment

### 1. Update Recipients

Edit `.env`:
```bash
DAO_TREASURY_ADDR=0x...
VALIDATORS_POOL_ADDR=0x...
DEV_TEAM_ADDR=0x...
PARTNERSHIPS_ADDR=0x...
STRATEGIC_RESERVE_ADDR=0x...
LIQUIDITY_POOLS_ADDR=0x...
```

### 2. Deploy to Mainnet

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url https://polygon-mainnet.drpc.org \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY
```

---

## 📊 Allocation Categories

### AllocationCategory Enum Values

```solidity
0 = INITIAL_LAUNCH       (250M)
1 = DAO_TREASURY         (250M)
2 = VALIDATORS_OPS       (200M)
3 = DEVELOPMENT          (150M, vested 4yr)
4 = PARTNERSHIPS         (100M)
5 = STRATEGIC_RESERVE    (50M)
```

---

## 🧪 Run Tests

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Run all tokenomics tests
forge test test/TokenomicsDeployment.t.sol -v

# Run specific test
forge test test/TokenomicsDeployment.t.sol -k test_CompleteAllocationFlow -v
```

Expected: **11 TESTS PASSING ✅**

---

## 🔐 Security Notes

1. **Vesting Duration:** 4-year linear release for development team
2. **Minimum Stake:** 32,000 TRAY required for validators
3. **Fee Distribution:** Automatic 70/20/10 split (validators/burn/treasury)
4. **Owner Control:** Current owner is deployer (can transfer ownership)
5. **ReentrancyGuard:** Staking and fee collection protected

---

## 📄 Files Reference

| File | Purpose |
|------|---------|
| `script/DeployCompleteTokenomics.s.sol` | Deployment script |
| `src/TokenomicsManager.sol` | Core logic |
| `src/TRAY.sol` | Token contract |
| `test/TokenomicsDeployment.t.sol` | Test suite |
| `TOKENOMICS_COMPLETE.md` | Full documentation |

---

## 🆘 Troubleshooting

### Issue: "ERC20: transfer amount exceeds balance"
**Solution:** Ensure TokenomicsManager has tokens before releasing allocations.

### Issue: "StakingAmountTooLow"
**Solution:** Minimum stake is 32,000 TRAY. Use `getValidatorStake(address)` to check current stake.

### Issue: "Insufficient approval"
**Solution:** Call `approve()` on TRAY token before calling `stake()` on TokenomicsManager.

---

## 📞 Support

- Full documentation: `TOKENOMICS_COMPLETE.md`
- Deployment logs: Saved after `forge script` execution
- Test results: Run `forge test test/TokenomicsDeployment.t.sol -v`

---

**Status:** Production Ready ✅  
**Last Updated:** 2024  
**Network:** Polygon Amoy (Testnet) / Polygon Mainnet (Production)
