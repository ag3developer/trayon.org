# 🎉 Deployment Addresses - Polygon Amoy

## ✅ Deployment Date: 2026-08-23

### Network: Polygon Amoy (Chain 80002)
⚠️ **Note**: Chain ID is 80002, not 80001. RPC endpoint returns wrong chain ID.

## 📍 Contract Addresses

### L1 (Polygon Amoy - Chain 80002)

| Contract | Address | Explorer |
|----------|---------|----------|
| **TRAY Token (L1)** | `0x60c872232Ef71BAf3237087b7BdD5b1a43896F3A` | [View](https://www.oklink.com/polygon-testnet/token/0x60c872232Ef71BAf3237087b7BdD5b1a43896F3A) |
| **BridgeL1** | `0xd9e51fa118C8F32070fF65BF1Ce31212DecDd8cb` | [View](https://www.oklink.com/polygon-testnet/address/0xd9e51fa118C8F32070fF65BF1Ce31212DecDd8cb) |

### L2 (Trayon Testnet - Local Anvil Chain 31337)

| Contract | Address | Network |
|----------|---------|---------|
| **TRAY Token (L2)** | `0x8554D00dC762640EEd9b568C702792aaE1A200d7` | localhost:8545 |
| **BridgeL2** | `0x5bc73652e7D866bB79989CA8E43B4F23d1b97926` | localhost:8545 |
| **Owner** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Anvil default) | localhost:8545 |

### Shared

| Item | Address |
|------|---------|
| **Deployer/Owner** | `0x99e519c1Dff179011541907Ea3d81232d397aaF1` |
| **Relayer Manager** | `0x99e519c1Dff179011541907Ea3d81232d397aaF1` |

## 📊 Deployment Statistics

- **Gas Used**: 3,525,323
- **Gas Price**: 30 gwei
- **Total Cost**: ~0.1058 POL (MATIC)
- **Initial TRAY Minted**: 50,000,000 tokens
- **Block Number**: 45,651,790
- **RPC**: dRPC (polygon-amoy.drpc.org)

## 📝 Next Steps

1. ✅ **Verify Contract Addresses**
   ```bash
   cast call 0x60c872232Ef71BAf3237087b7BdD5b1a43896F3A "name()" --rpc-url "https://polygon-amoy.drpc.org"
   ```

2. ⏳ **Deploy L2 Contracts** (Trayon Testnet)
   - Need localhost:8545 running
   - Run similar deployment script for L2

3. ⏳ **Configure Relayer**
   - Update `/relayer/.env.local` with deployed addresses
   - Start relayer service

4. ⏳ **Test E2E Bridge**
   - User deposit on L1 → Relayer completes on L2
   - User withdraw from L2 → Relayer completes on L1

## 🔍 Verification Commands

```bash
# Check TRAY token details
cast call 0x60c872232Ef71BAf3237087b7BdD5b1a43896F3A "totalSupply()" --rpc-url "https://polygon-amoy.drpc.org"

# Check deployer balance
cast balance 0x99e519c1Dff179011541907Ea3d81232d397aaF1 --rpc-url "https://polygon-amoy.drpc.org"

# Check BridgeL1 owner
cast call 0xd9e51fa118C8F32070fF65BF1Ce31212DecDd8cb "owner()" --rpc-url "https://polygon-amoy.drpc.org"
```

## 📁 Deployment Files

- Transaction data: `/contracts/broadcast/DeployBridge.s.sol/80002/run-latest.json`
- Sensitive data: `/contracts/cache/DeployBridge.s.sol/80002/run-latest.json`

## ⚠️ Important Notes

1. **Chain ID Mismatch**: dRPC returns 0x13882 (chain 80002) instead of expected 0x13881 (chain 80001)
   - This is the actual Polygon Amoy chain
   - Solidity 0.8.20 may have compatibility issues

2. **Private Key**: Exposed in git history (must be rotated after production)
   - Already .gitignored now
   - Generate new key: `cast wallet new`

3. **Alchemy Limits**: Rate limit reached
   - Using dRPC as fallback for reliability
   - Consider upgrade for production

---

**Status**: ✅ L1 Deployment Complete | ⏳ L2 Deployment Pending | ⏳ Relayer Configuration Pending
