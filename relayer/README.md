# Trayon Bridge Relayer

Multi-signature bridge relayer for Trayon L1/L2 architecture. Monitors Polygon Amoy (L1) and Trayon Testnet (L2) for bridge events and executes cross-chain transfers with multi-signature validation.

## 🏗️ Architecture

```
┌─────────────┐                              ┌─────────────┐
│ Polygon     │  DepositInitiated            │ Trayon      │
│ Amoy (L1)   │◄──────────────────────────►  │ Testnet (L2)│
│             │  WithdrawalCompleted          │             │
└─────────────┘                              └─────────────┘
       ▲                                             ▲
       │                                             │
       │ L1Listener                          L2Listener
       │ (Event Monitor)                     (Event Monitor)
       │                                             │
       └──────────────────┬──────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Relayer   │
                    │ Coordinator│
                    └─────┬─────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
      ┌─────▼────┐  ┌─────▼────┐  ┌────▼──────┐
      │Multi-Sig  │  │ Deposit  │  │ Withdraw  │
      │  Signer   │  │ Executor │  │ Executor  │
      └───────────┘  └──────────┘  └───────────┘
```

## 📦 Components

### L1Listener
- Monitors `BridgeL1` on Polygon Amoy for `DepositInitiated` events
- Polls blockchain at regular intervals
- Collects deposit requests from users

### L2Listener
- Monitors `BridgeL2` on Trayon Testnet for `WithdrawalInitiated` events
- Polls blockchain at regular intervals
- Collects withdrawal requests from users

### MultiSigSigner
- Collects signatures from validators (M-of-N scheme)
- Default: 3-of-5 multi-signature validation
- Uses ECDSA for signature verification

### DepositExecutor
- Executes `BridgeL2.completeDeposit()` after collecting signatures
- Mints new TRAY tokens on L2 for depositing users
- Tracks execution history to prevent double-execution

### WithdrawExecutor
- Executes `BridgeL1.completeWithdrawal()` after collecting signatures
- Releases locked TRAY tokens on L1
- Tracks execution history to prevent double-execution

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Network RPC Endpoints
RPC_POLYGON_AMOY=https://rpc-amoy.polygon.technology
RPC_TRAYON_TESTNET=http://localhost:8545

# Bridge Contract Addresses
BRIDGE_L1_ADDRESS=0x...
BRIDGE_L2_ADDRESS=0x...

# Token Addresses
TRAY_L1_ADDRESS=0x...
TRAY_L2_ADDRESS=0x...

# Relayer Account
RELAYER_PRIVATE_KEY=0x...
RELAYER_ADDRESS=0x...

# Validators (5 total)
VALIDATOR_1_ADDRESS=0x...
VALIDATOR_2_ADDRESS=0x...
VALIDATOR_3_ADDRESS=0x...
VALIDATOR_4_ADDRESS=0x...
VALIDATOR_5_ADDRESS=0x...

# Configuration
REQUIRED_SIGNATURES=3
ENABLE_AUTO_EXECUTE=true
LOG_LEVEL=info
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Start Relayer

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📊 Features

- ✅ **Event-driven architecture** - Real-time monitoring of bridge events
- ✅ **Multi-signature validation** - Configurable M-of-N signature scheme
- ✅ **Automated execution** - Optional auto-execute after threshold met
- ✅ **Dry-run mode** - Simulate executions without actual transactions
- ✅ **Comprehensive logging** - Structured logs with multiple levels
- ✅ **Gas estimation** - Check gas costs before execution
- ✅ **History tracking** - Track all executed transactions
- ✅ **Graceful shutdown** - Clean shutdown handling

## 🔄 Flow: Deposit (L1 → L2)

```
1. User calls BridgeL1.deposit(amount)
   ↓
2. BridgeL1 locks tokens and emits DepositInitiated
   ↓
3. L1Listener detects event
   ↓
4. MultiSigSigner collects 3/5 validator signatures
   ↓
5. DepositExecutor calls BridgeL2.completeDeposit()
   ↓
6. BridgeL2 mints new tokens for user
   ↓
7. User receives tokens on L2 ✅
```

## 🔄 Flow: Withdrawal (L2 → L1)

```
1. User calls BridgeL2.initiateWithdrawal(amount)
   ↓
2. BridgeL2 burns tokens and emits WithdrawalInitiated
   ↓
3. L2Listener detects event
   ↓
4. MultiSigSigner collects 3/5 validator signatures
   ↓
5. WithdrawExecutor calls BridgeL1.completeWithdrawal()
   ↓
6. BridgeL1 releases locked tokens
   ↓
7. User receives tokens on L1 ✅
```

## 🛠️ Commands

### Development

```bash
# Watch and rebuild TypeScript
npm run dev

# Build only
npm run build

# Start compiled version
npm start

# Lint code
npm run lint

# Format code
npm run format
```

### Monitoring

The relayer prints status every 5 minutes:

```
═══════════════════════════════════════════════════════
📊 Relayer Status:
  L1 Listener: {...}
  L2 Listener: {...}
  Relayer Address: 0x...
  Validators: 5
  Required Signatures: 3
  Deposits Executed: 42
  Withdrawals Executed: 38
═══════════════════════════════════════════════════════
```

## 📝 Logs

Log levels: `debug | info | warn | error`

Example logs:

```
[2024-01-15T10:30:45.123Z] INFO  L1Listener started { network: 'polygon-amoy', startBlock: 0 }
[2024-01-15T10:30:52.456Z] INFO  Found DepositInitiated events { count: 1, fromBlock: 0, toBlock: 100 }
[2024-01-15T10:30:53.789Z] INFO  Processing DepositInitiated event { user: '0x...', amount: '1000...', ... }
[2024-01-15T10:31:05.012Z] INFO  Deposit executed successfully { transactionHash: '0x...', blockNumber: 1234 }
```

## 🔒 Security Considerations

1. **Private Key Management**
   - Never commit `.env` file to git
   - Use secure key management in production (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Rotate keys regularly

2. **Multi-Signature Validation**
   - Requires 3-of-5 signatures by default (configurable)
   - Validators must be trusted parties
   - Signatures verified using ECDSA

3. **Replay Prevention**
   - Each transaction uses unique hash
   - Already-executed transactions tracked
   - Cannot execute same transaction twice

4. **Rate Limiting**
   - 100M TRAY per day (L1/L2)
   - 10M TRAY per transaction
   - Enforced at bridge contract level

## 📈 Performance

- **Event Polling**: Every 12 seconds (configurable)
- **Status Updates**: Every 5 minutes
- **Gas Optimization**: Estimates gas before execution
- **Memory**: ~50-100MB steady state

## 🚨 Troubleshooting

### "Missing required environment variables"
- Ensure all required env vars are set in `.env`
- Check for typos in variable names

### "RPC connection failed"
- Verify RPC URLs are correct and accessible
- Check network connectivity
- Try alternative RPC endpoints

### "Insufficient gas balance"
- Relayer account needs ETH/MATIC for gas
- Send funds to relayer address before running

### "Signature collection timeout"
- Validators may be offline
- Check validator health
- Verify validator addresses in config

## 📚 Documentation

- [Bridge Architecture](../../docs/BRIDGE_L1_L2_GUIDE.md)
- [Contract Implementation](../../docs/BRIDGE_IMPLEMENTATION.md)
- [Visual Guide](../../docs/BRIDGE_VISUAL_GUIDE.md)

## 📄 License

MIT

## 👥 Authors

Trayon Team
