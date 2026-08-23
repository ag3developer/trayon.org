# Trayon Validator Node

Consensus engine and validator client for the Trayon L2 Blockchain.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start validator node
npm run dev

# Build for production
npm build
npm start
```

## Architecture

### Core Components

**ValidatorNode (src/node/core.ts)**
- Main orchestrator for the validator node
- Manages consensus engine, P2P network, and state machine
- Handles startup/shutdown and metrics collection

**ConsensusEngine (src/node/consensus.ts)**
- Implements Proof-of-Stake (PoS) consensus
- Manages block production and validation
- Tracks produced/missed blocks

**StateMachine (src/node/state-machine.ts)**
- Manages L2 state and processes blocks
- Executes transactions
- Maintains state root

**P2PNetwork (src/network/p2p.ts)**
- Peer-to-peer networking between validators
- Message broadcasting and routing
- Peer connection management

**StakingManager (src/validator/staking.ts)**
- Manages validator staking and rewards
- Tracks reputation and slashing
- Handles reward claims

## Configuration

Set the following environment variables in `.env`:

```
VALIDATOR_NAME=validator-1
VALIDATOR_ADDRESS=0x...
VALIDATOR_PRIVATE_KEY=0x...
L1_RPC_URL=https://polygon.drpc.org
L2_RPC_URL=http://localhost:8545
TRAY_TOKEN_ADDRESS=0x...
MIN_STAKE=32000000000000000000000
P2P_PORT=30333
LOG_LEVEL=info
```

## Running a Validator

1. **Setup**: Configure `.env` with your validator details
2. **Stake**: Stake minimum 32,000 TRAY tokens
3. **Start**: Run `npm run dev` to start the validator
4. **Monitor**: Check logs for node status and metrics

## Requirements

- **Stake**: Minimum 32,000 TRAY tokens
- **Hardware**: 2+ CPU cores, 4GB+ RAM
- **Network**: Stable internet connection
- **Node.js**: v18+ with npm/yarn

## Development

```bash
npm run dev:watch    # Watch mode
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
npm run cli          # CLI tools
```

## Monitoring

The validator node exposes metrics via:
- Status endpoint: GET /metrics/status
- Logs: `./logs/validator.log`
- Console output with structured logging

## Slashing

Validators can be slashed for:
- Double signing
- Missed blocks (> 30% miss rate)
- Invalid blocks
- Network misbehavior

Slashing results in reputation loss and potential stake reduction.

## Rewards

Validators earn rewards from:
- Block production (70% of fees)
- Transaction inclusion
- Network participation

Rewards are distributed automatically via the TokenomicsManager.

## Support

For issues or questions:
1. Check the logs: `./logs/validator.log`
2. Review configuration in `.env`
3. Verify stake and reputation status
4. Check network connectivity
