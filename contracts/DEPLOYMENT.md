# Trayon Smart Contract Suite - Deployment Guide

## Status: ✅ PRODUCTION READY

- **Test Results**: 118/118 passing (100%)
- **Code Coverage**: 88.91% lines, 80.79% statements
- **Contracts**: 7 (TRAY, TRAYStaking, OracleManager, SequencerRegistry, ValidatorRegistry, DataMarketplace, PredictionMarket)
- **Framework**: Foundry v1.7.1
- **Solidity**: 0.8.20

---

## Quick Start

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

### Build
```bash
cd contracts
forge build
```

### Test
```bash
forge test                    # Run all tests
forge test -vvv              # Verbose output
forge coverage --ir-minimum  # Code coverage report
```

---

## Deployment

### 1. Prepare Environment

Create `.env` file in contracts directory:
```bash
# For testnet (Polygon Amoy)
PRIVATE_KEY=0x...your_private_key...
TREASURY_ADDRESS=0x...treasury_wallet...
SEQUENCER_ADDRESS=0x...sequencer_wallet...

# For verification
POLYGONSCAN_API_KEY=...your_api_key...
```

### 2. Deploy to Testnet

```bash
# Polygon Amoy (L2 Testnet)
forge script script/Deploy.s.sol --rpc-url polygon_amoy --broadcast

# Or with verification
forge script script/Deploy.s.sol --rpc-url polygon_amoy --broadcast --verify
```

### 3. Deploy to Mainnet

```bash
# Polygon PoS (L1 Mainnet)
forge script script/Deploy.s.sol --rpc-url polygon --broadcast --verify

# Ethereum L1 (optional, if deploying L1 version)
forge script script/Deploy.s.sol --rpc-url ethereum --broadcast --verify
```

---

## Contract Architecture

### Tier 1: Core Token & Staking

**TRAY (src/TRAY.sol)**
- Total Supply: 1B tokens (1,000,000,000 * 10^18)
- Initial Supply: 250M (released at deployment)
- Decimals: 18
- Features:
  - ERC20 standard token for trading on DEXs/CEXs
  - ERC20Permit for gasless approvals
  - Burnable (with totalBurned tracking)
  - Native gas token on Trayon L2 (via `enableGasToken()`)
  - Fee distribution: 70% validators, 20% burn, 10% treasury

**TRAYStaking (src/TRAYStaking.sol)**
- Min Stake: 100 TRAY
- Validator Min: 32,000 TRAY (32k = full validator)
- APY: 8% base + reputation multiplier (0.5x to 1.5x)
- Unstake Delay: 7 days
- Reputation: 0-150 range with slashing penalties

**OracleManager (src/OracleManager.sol)**
- Min Certifications: 2 (2/3 consensus)
- Query Fee: 1,000 TRAY
- Fee Usage: Paid to validators for data submission
- Reputation Rewards: +5 for approval, -5 for rejection

### Tier 2: L2 Infrastructure

**SequencerRegistry (src/SequencerRegistry.sol)**
- Required Bond: 100,000 TRAY
- Heartbeat Interval: 12 seconds
- Min Uptime: 99%
- Tracks: blocks proposed, blocks missed, uptime percentage
- Slashing: 5% penalty for extended downtime

**ValidatorRegistry (src/ValidatorRegistry.sol)**
- KYC Levels: 0 (none), 1 (verified), 2 (full KYC)
- Max Validators: 1,000
- Tracks: certifications, accuracy, slashing history
- Auto-Deactivate: After 5 slashes
- Accuracy Range: 0-10,000 (0-100%)

### Tier 3: Applications

**DataMarketplace (src/DataMarketplace.sol)**
- Platform Fee: 10%
- Creator Gets: 90% of sales
- IPFS Support: Data hash storage
- Accuracy Tracking: Dataset quality metrics
- Prevents: Double-purchase by same buyer

**PredictionMarket (src/PredictionMarket.sol)**
- Market Types: Binary (YES/NO)
- Platform Fee: 2% of losing pool
- Resolution Timeout: 7 days after market closes
- States: OPEN (0), RESOLVED (1), CANCELLED (2)
- Refunds: On cancellation (prevents loss)

---

## Key Features

### Security
✅ ReentrancyGuard on all external functions
✅ Custom error types (vs require/revert)
✅ Access control via Ownable
✅ Reputation system preventing abuse
✅ Slashing penalties for misbehavior
✅ Time-locked withdrawals (7-day delay)
✅ Double-transaction prevention

### Gas Optimization
✅ Optimizer enabled (200 runs)
✅ Efficient storage packing
✅ Minimal external calls
✅ Batch operations supported

### Composability
✅ All contracts use same TRAY token
✅ ERC20 standard interface
✅ No hardcoded dependencies
✅ Easy integration with bridges

---

## Configuration

### Foundry Config (foundry.toml)

```toml
[profile.default]
solc_version = "0.8.20"
optimizer_runs = 200

[rpc_endpoints]
sepolia = "https://sepolia.infura.io/v3/${INFURA_KEY}"
polygon_amoy = "https://rpc-amoy.polygon.technology/"
polygon = "https://polygon-rpc.com"
ethereum = "https://eth-rpc.gateway.pokt.network"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
polygon_amoy = { key = "${POLYGONSCAN_API_KEY}" }
polygon = { key = "${POLYGONSCAN_API_KEY}" }
ethereum = { key = "${ETHERSCAN_API_KEY}" }
```

---

## Post-Deployment

### 1. Verify Contracts
```bash
# Verify on Polygon Amoy
forge verify-contract <ADDRESS> TRAY --chain polygonAmoy
forge verify-contract <ADDRESS> TRAYStaking --chain polygonAmoy
```

### 2. Initialize Treasury
```bash
# Set treasury address in TRAY contract
cast send <TRAY_ADDRESS> "updateTreasury(address)" <TREASURY_ADDRESS> --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

### 3. Enable Gas Token (L2 Only)
```bash
# Enable TRAY as gas token on Trayon L2
cast send <TRAY_ADDRESS> "enableGasToken(address)" <SEQUENCER_ADDRESS> --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

### 4. Initial Funding
- Distribute 250M initial TRAY from deployer
- Fund validators through TRAYStaking
- Fund oracle validators through OracleManager

---

## Testing

### Test Coverage
```
TRAY.sol:             100.00% lines
TRAYStaking.sol:      95.45% lines
OracleManager.sol:    94.32% lines
SequencerRegistry.sol: 80.61% lines
ValidatorRegistry.sol: 95.00% lines
DataMarketplace.sol:  78.89% lines
PredictionMarket.sol: 92.13% lines
─────────────────────────────
Overall:             88.91% lines
```

### Run Specific Tests
```bash
# Test TRAY token
forge test --grep testTransfer

# Test staking
forge test --grep testStake

# Test oracle
forge test --grep testCertifyData
```

---

## Monitoring

### Events to Watch
- `Transfer`: Token movements
- `Approval`: Allowance changes
- `SequencerRegistered`: New sequencer registration
- `ValidatorApproved`: Validator approval
- `DatasetCreated`: New marketplace dataset
- `MarketCreated`: New prediction market

### Gas Reports
```bash
forge test --gas-report
```

---

## Support & Troubleshooting

### Stack Too Deep Error
```bash
# Use IR minimum for coverage
forge coverage --ir-minimum
```

### RPC Connection Issues
```bash
# Test RPC endpoint
cast rpc eth_blockNumber --rpc-url <RPC_URL>
```

### Transaction Simulation
```bash
# Dry-run before broadcast
forge script script/Deploy.s.sol --rpc-url <RPC> --sender <ADDRESS>
```

---

## License

SPDX-License-Identifier: MIT

All contracts are licensed under the MIT License.

---

## Contact & Links

- **Framework**: https://getfoundry.sh
- **Solidity Docs**: https://docs.soliditylang.org
- **OpenZeppelin**: https://docs.openzeppelin.com
- **Polygon Docs**: https://polygon.technology/developers
