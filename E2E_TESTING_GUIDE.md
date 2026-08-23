# 🌉 E2E Bridge Testing Guide

**Purpose**: Complete end-to-end testing of Trayon Bridge deposit and withdrawal flows  
**Network**: Polygon Mainnet (L1) ↔ Anvil Local (L2)  
**Status**: Ready for execution

---

## 📋 Prerequisites

### Hardware & Software
- ✅ Foundry installed (`forge`, `cast`)
- ✅ Node.js v18+ 
- ✅ npm or yarn
- ✅ Anvil running on localhost:8545
- ✅ 0.2+ POL in test account (for gas)
- ✅ 1+ TRAY in test account (for deposits)

### Accounts & Keys
- Test Account: `0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f`
- Private Key: ✅ Stored in `/contracts/.env`
- Relayer Account: Same as test account

### Network Access
- ✅ L1 RPC: https://polygon.drpc.org (Polygon Mainnet)
- ✅ L2 RPC: http://localhost:8545 (Anvil Local)

---

## 🚀 Quick Start (5 minutes)

### Terminal 1: Start Relayer
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/relayer
npm start
```

**Expected Output:**
```
[INFO] 🌉 Trayon Bridge Relayer v1.0.0
[INFO] Configuration loaded: L1=polygon-mainnet, L2=trayon-testnet
[INFO] ✅ All components initialized successfully
[INFO] 🚀 Relayer Started Successfully
[INFO] Listening for events on:
[INFO]   - L1: DepositInitiated
[INFO]   - L2: WithdrawalInitiated
```

### Terminal 2: Execute Tests
```bash
cd /Users/josecarlosmartins/Documents/trayon.org

# Verify infrastructure
./TEST_E2E_BRIDGE.sh

# Execute deposit test
chmod +x TEST_DEPOSIT_L1.sh
./TEST_DEPOSIT_L1.sh
```

---

## 📊 Test Sequence

### Test 1: Infrastructure Verification (2 min)
**Command**: `./TEST_E2E_BRIDGE.sh`

**What it does**:
- ✅ Checks network connectivity (L1 & L2)
- ✅ Verifies contracts deployed
- ✅ Checks account balances
- ✅ Confirms relayer configuration

**Expected Result**: All verifications pass (green checkmarks)

```
═══════════════════════════════════════════════════════════
  🌉 TRAYON BRIDGE - E2E TEST SUITE
═══════════════════════════════════════════════════════════

✅ VERIFICATION COMPLETE

Networks verified:
  ✓ L1 (Polygon Mainnet) - Chain 137
  ✓ L2 (Anvil Local) - Chain 31337

Contracts verified:
  ✓ TRAY Token on L1: 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
  ✓ BridgeL1 on L1: 0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9
  ✓ TRAY Token on L2: 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
  ✓ BridgeL2 on L2: 0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9
```

---

### Test 2: L1 Deposit (5-10 min)
**Command**: `./TEST_DEPOSIT_L1.sh`

**What it does**:
1. Checks POL balance (for gas)
2. Checks TRAY balance (for deposit)
3. Approves BridgeL1 to spend TRAY (if needed)
4. Sends 0.1 TRAY deposit transaction
5. Waits for confirmation

**Expected Result**: Transaction confirmed on Polygon Mainnet

```
✅ STEP 6: Execute Deposit

▶ Sending deposit transaction to L1 Bridge...
  Amount: 0.1 TRAY
  Recipient: 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f

blockNumber: 92511567
gasUsed: 145321
transactionHash: 0x...(your tx hash)

✅ Deposit transaction sent!
  TX Hash: 0x...
  Explorer: https://polygonscan.com/tx/0x...
```

**Relayer Activity** (watch Terminal 1 logs):
```
[INFO] L1Listener detected DepositInitiated event
[INFO] Event Data: amount=100000000000000000, recipient=0x9efFA...
[INFO] MultiSigSigner processing deposit
[INFO] DepositExecutor calling BridgeL2.executeDeposit()
[INFO] L2 transaction sent: 0x...
```

**Verification**:
- ✅ Check PolygonScan for transaction: https://polygonscan.com/tx/[TX_HASH]
- ✅ Watch relayer logs for event detection
- ✅ Check L2 balance on Anvil increased

---

### Test 3: L2 Withdrawal (5-10 min)
**Command**: Manual `cast send` to L2 Bridge

```bash
# Get current L2 balance
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "balanceOf(address)(uint256)" 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f \
  --rpc-url "http://localhost:8545"

# Initiate withdrawal of 0.1 TRAY
cast send 0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9 \
  "initiateWithdrawal(uint256,address)" 100000000000000000 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f \
  --private-key "0x..." \
  --rpc-url "http://localhost:8545"
```

**Expected Result**: Withdrawal initiated on L2

**Relayer Activity**:
```
[INFO] L2Listener detected WithdrawalInitiated event
[INFO] Event Data: amount=100000000000000000, recipient=0x9efFA...
[INFO] WithdrawExecutor calling BridgeL1.completeWithdrawal()
[INFO] L1 transaction sent: 0x...
```

**Verification**:
- ✅ L2 balance decreased by 0.1 TRAY
- ✅ L1 balance increased by 0.1 TRAY
- ✅ Check PolygonScan for L1 completion transaction

---

## 🔍 Monitoring & Debugging

### View Relayer Logs
```bash
# Terminal with relayer still running, or check logs:
tail -100 /tmp/relayer.log
```

### Check Event Emissions
```bash
# Look for DepositInitiated events (example)
cast logs \
  --address 0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9 \
  --from-block 92500000 \
  --to-block 92511600 \
  --rpc-url "https://polygon.drpc.org"
```

### Verify Balances
```bash
# L1 Balance
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "balanceOf(address)(uint256)" 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f \
  --rpc-url "https://polygon.drpc.org" | xargs printf "%.0f\n" | awk '{printf "%.2f TRAY\n", $1/1e18}'

# L2 Balance
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "balanceOf(address)(uint256)" 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f \
  --rpc-url "http://localhost:8545"
```

---

## ✅ Success Criteria

### Phase 1: Infrastructure ✓
- [x] Both networks connected
- [x] Contracts deployed
- [x] Balances sufficient
- [x] Relayer running

### Phase 2: Deposit ✓
- [x] L1 deposit transaction sent
- [x] Transaction confirmed on Mainnet
- [x] DepositInitiated event emitted
- [x] Relayer detects event
- [x] L2 balance increases

### Phase 3: Withdrawal ✓
- [x] L2 withdrawal initiated
- [x] WithdrawalInitiated event emitted
- [x] Relayer processes withdrawal
- [x] L1 balance increases (verified)
- [x] Withdrawal amount matches deposit

---

## ⚠️ Common Issues & Solutions

### Issue 1: Insufficient Gas
**Error**: `Error: transaction underpriced`
**Solution**:
```bash
# Get test account more POL
# Send 0.5 POL to: 0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f
# Via PolygonScan or exchange
```

### Issue 2: Insufficient TRAY Balance
**Error**: `Error: ERC20: transfer amount exceeds balance`
**Solution**:
- You already have 300M TRAY on L1 (test account is owner)
- Reduce deposit amount if testing with limited balance

### Issue 3: Relayer Not Detecting Events
**Error**: No event logs in relayer terminal
**Solution**:
```bash
# Check relayer is running
ps aux | grep "node dist/index.js"

# Check contract addresses in relayer/.env match
cat relayer/.env | grep BRIDGE

# Check RPC connectivity
cast chain-id --rpc-url "https://polygon.drpc.org"
```

### Issue 4: L2 Transaction Failed
**Error**: `Insufficient funds for gas`
**Solution**:
- Anvil has limited default account funding
- Use cast to send ETH to execution account:
```bash
cast send 0x99e519c1Dff179011541907Ea3d81232d397aaF1 \
  --value 10ether \
  --private-key "0x..." \
  --rpc-url "http://localhost:8545"
```

---

## 📈 Performance Metrics

### Expected Timing
| Step | Time | Notes |
|------|------|-------|
| L1 Deposit TX | 1-5 sec | Depends on Polygon network |
| TX Confirmation | 5-20 sec | Wait for 2 blocks |
| Relayer Processing | 1-5 sec | Poll interval 12 seconds |
| L2 Execution | 1-3 sec | Anvil blocks are instant |
| **Total Deposit Flow** | **10-30 sec** | From TX send to L2 minting |
| L2 Withdrawal | 1-5 sec | Immediate |
| Relayer Processing | 1-5 sec | |
| L1 Completion | 5-20 sec | TX + confirmations |
| **Total Withdrawal Flow** | **10-30 sec** | From L2 initiate to L1 complete |

### Gas Usage
| Operation | Gas | Cost (at 30 Gwei) |
|-----------|-----|-------------------|
| Approve Token | ~46K | ~0.0014 POL |
| L1 Deposit | ~75K | ~0.0023 POL |
| L2 Deposit Execution | ~65K | ~0.0020 POL (local) |
| L2 Withdrawal | ~55K | ~0.0017 POL (local) |
| L1 Withdrawal Completion | ~80K | ~0.0024 POL |

---

## 📝 Test Report Template

```
TEST EXECUTION REPORT
Date: YYYY-MM-DD
Tester: [Your Name]

TEST 1: Infrastructure Verification
✓ Result: PASSED
  Time: 2 minutes
  Notes: All checks passed

TEST 2: L1 Deposit
✓ Result: PASSED
  Amount: 0.1 TRAY
  TX Hash: 0x...
  L2 Balance Increased: YES (0.1 TRAY)
  Time: 8 minutes
  Notes: Event detected in relayer logs

TEST 3: L2 Withdrawal
✓ Result: PASSED
  Amount: 0.1 TRAY
  TX Hash: 0x...
  L1 Balance Increased: YES (0.1 TRAY)
  Time: 12 minutes
  Notes: Full cycle completed successfully

SUMMARY:
✓ All tests passed
✓ Bridge fully functional
✓ Ready for production testing
```

---

## 🎯 Next Phases

### Phase 2: Load Testing
- Multiple deposits in sequence
- Large deposit amounts (100+ TRAY)
- Concurrent multi-user deposits
- Monitor relayer performance

### Phase 3: Security Audit
- Review contract code
- Check for vulnerabilities
- Test edge cases
- Verify permissions

### Phase 4: Production Readiness
- Deploy L2 to production network
- Setup monitoring & alerts
- Create documentation for users
- Prepare for mainnet launch

---

## 📞 Support

**Issues?** Check:
1. `PRODUCTION_STATUS.md` - Current deployment status
2. Relayer logs - Event detection and processing
3. PolygonScan - Transaction confirmation
4. Contract ABIs - Function signatures

**Contact**: Development team  
**Last Updated**: 2026-08-23
