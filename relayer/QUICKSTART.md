# Trayon Bridge Relayer - Quick Start Guide

## Installation

### 1. Install Dependencies
```bash
cd relayer
npm install
```

### 2. Configure Environment

Copy the test environment:
```bash
cp .env.local .env
```

Or create your own `.env` file:
```bash
cp .env.example .env
# Edit .env with your actual configuration
```

### 3. Build TypeScript

```bash
npm run build
```

This will compile all TypeScript files to `dist/` directory.

### 4. Run Local Tests

Test configuration and all components locally:
```bash
npm run test-local
```

Expected output: `✅ ALL TESTS PASSED SUCCESSFULLY!`

---

## Running the Relayer

### Development Mode

Watch files and auto-recompile:
```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker (Optional)

```bash
docker build -t trayon-relayer .
docker run -env-file .env trayon-relayer
```

---

## Configuration

### Environment Variables

**Required:**
```env
# Network RPC Endpoints
RPC_POLYGON_AMOY=https://rpc-amoy.polygon.technology
RPC_TRAYON_TESTNET=http://your-trayon-rpc-endpoint

# Contract Addresses (after deployment)
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
```

**Optional:**
```env
# Configuration
REQUIRED_SIGNATURES=3           # default: 3
ENABLE_AUTO_EXECUTE=true       # default: true
LOG_LEVEL=info                 # debug, info, warn, error
POLLING_INTERVAL=12000         # milliseconds
START_BLOCK=0                  # start block for listeners
DRY_RUN=false                  # simulate without executing
```

### Networks

#### Polygon Amoy (L1)
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology
- Explorer: https://amoy.polygonscan.com/

#### Trayon Testnet (L2)
- Chain ID: 7654321
- RPC: http://localhost:8545 (local)
- Explorer: https://testnet-explorer.trayon.io/

---

## Usage Examples

### Example 1: Local Testing
```bash
# Install and test locally
npm install
npm run build
npm run test-local

# Output should show: ✅ ALL TESTS PASSED SUCCESSFULLY! (9/9)
```

### Example 2: Run Against Local Network
```bash
# Start Trayon Testnet (if running locally)
# trayon-cli start-testnet

# Set environment variables for local network
export RPC_POLYGON_AMOY=http://localhost:8545
export RPC_TRAYON_TESTNET=http://localhost:8546

# Run relayer
npm run dev
```

### Example 3: Run Against Testnets
```bash
# Update .env with testnet contract addresses
# Then run:
npm run build
npm start

# Monitor output:
# - L1Listener: Listening for DepositInitiated on Polygon Amoy
# - L2Listener: Listening for WithdrawalInitiated on Trayon Testnet
# - Status updates every 5 minutes
```

---

## Monitoring & Logs

### Log Levels

- **debug**: Detailed information for debugging
- **info**: General information about operations
- **warn**: Warnings about potential issues
- **error**: Error messages and failures

### View Logs

```bash
# Real-time logs
npm start

# Save logs to file
npm start > relayer.log 2>&1 &

# View logs
tail -f relayer.log
```

### Status Output

The relayer prints status every 5 minutes:
```
═══════════════════════════════════════════════════════
📊 Relayer Status:
  L1 Listener: { lastProcessedBlock: 123, totalEventsFound: 5, isRunning: true }
  L2 Listener: { lastProcessedBlock: 456, totalEventsFound: 3, isRunning: true }
  Relayer Address: 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
  Validators: 5
  Required Signatures: 3
  Deposits Executed: 2
  Withdrawals Executed: 1
═══════════════════════════════════════════════════════
```

---

## Troubleshooting

### Problem: "Missing required environment variables"

**Solution:**
```bash
# Ensure .env file exists and is complete
cp .env.example .env
# Edit .env with your configuration
# Run:
npm run test-local  # Verify configuration
```

### Problem: "RPC connection failed"

**Solution:**
```bash
# Check RPC endpoints are accessible
curl https://rpc-amoy.polygon.technology

# Update .env with working RPC URL
npm run test-local  # Test again
```

### Problem: "Insufficient gas balance"

**Solution:**
```bash
# Relayer account needs native tokens for gas
# Send ETH/MATIC to relayer address:
# RELAYER_ADDRESS in .env

# For testnet, use faucets:
# Polygon Amoy: https://faucet.polygon.technology/
```

### Problem: "Contract compilation errors"

**Solution:**
```bash
# Ensure contracts are deployed first
# Update contract addresses in .env:
BRIDGE_L1_ADDRESS=0x...
BRIDGE_L2_ADDRESS=0x...

# Run tests to verify:
npm run test-local
```

### Problem: "TypeScript compilation errors"

**Solution:**
```bash
# Clean and rebuild
rm -rf dist
npm run build

# If errors persist:
npm install  # Reinstall dependencies
npm run build
```

---

## Performance Tuning

### Reduce RPC Calls

```env
# Increase polling interval (less frequent monitoring)
POLLING_INTERVAL=30000  # 30 seconds instead of 12

# Increase start block to skip old events
START_BLOCK=1000000     # Start from higher block number
```

### Increase Event Processing

```env
# Decrease polling interval (more frequent monitoring)
POLLING_INTERVAL=6000   # 6 seconds instead of 12

# Enable more detailed logging
LOG_LEVEL=debug         # More information for debugging
```

### Memory Optimization

```bash
# Run with memory limit
node --max-old-space-size=256 dist/index.js
```

---

## Development Tips

### Add New Validator

1. Add to `.env`:
```env
VALIDATOR_6_ADDRESS=0x...
```

2. Update `REQUIRED_SIGNATURES` if needed:
```env
REQUIRED_SIGNATURES=4  # Out of 6 now
```

3. Restart relayer

### Add New Network

1. Update `src/config/networks.ts`:
```typescript
export const newNetworkConfig: NetworkConfig = {
  name: 'new-network',
  rpcUrl: 'https://...',
  chainId: 12345,
  bridgeAddress: '0x...',
  trayAddress: '0x...',
  startBlock: 0,
};
```

2. Create new listener in `src/listeners/`

3. Update `getRelayerConfig()` to include new network

### Add Custom Middleware

Create file in `src/middleware/`:
```typescript
export async function myMiddleware(event: Event) {
  // Custom processing
}
```

Then use in listeners:
```typescript
await myMiddleware(event);
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test-local`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] `.env` configured with real values
- [ ] Contract addresses verified on block explorers
- [ ] Relayer account funded with gas
- [ ] All 5 validators confirmed
- [ ] Monitoring alerts configured
- [ ] Backup RPC endpoints configured
- [ ] Logging to persistent storage
- [ ] Process manager setup (PM2, supervisor, etc.)

---

## Useful Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run development mode
npm run dev

# Run production mode
npm start

# Run local tests
npm run test-local

# Lint code
npm run lint

# Format code
npm run format

# Clean build artifacts
rm -rf dist

# Full clean and rebuild
rm -rf dist node_modules && npm install && npm run build
```

---

## Support & Resources

- **Documentation**: See `README.md` for full documentation
- **Test Report**: See `TEST_REPORT.md` for test results
- **Contract Docs**: See `/docs/BRIDGE_*` guides
- **GitHub**: https://github.com/trayon-org/trayon.org

---

## Next Steps

1. ✅ **Local Testing** (DONE)
   - Run `npm run test-local`
   - Verify all 9 tests passing

2. 📋 **Deploy Contracts** (NEXT)
   - Create `DeployBridge.s.sol`
   - Deploy to Polygon Amoy + Trayon Testnet
   - Update contract addresses in `.env`

3. 🧪 **E2E Testing**
   - Run relayer against testnet
   - Execute deposit/withdrawal cycles
   - Monitor for errors

4. 🚀 **Production Deployment**
   - Deploy to mainnet networks
   - Setup monitoring & alerting
   - Enable 24/7 operation

---

**Status**: ✅ Ready to deploy  
**Last Updated**: 2026-08-23  
**Version**: 1.0.0
