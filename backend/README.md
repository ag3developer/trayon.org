# Trayon Backend API

REST API for the Trayon L2 Blockchain.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm build
npm start
```

## API Endpoints

### Bridge Routes
- `GET /api/v1/bridge/status` - Bridge status
- `GET /api/v1/bridge/deposits` - Recent deposits
- `GET /api/v1/bridge/withdrawals` - Recent withdrawals
- `POST /api/v1/bridge/deposit` - Initiate deposit
- `POST /api/v1/bridge/withdraw` - Initiate withdrawal

### Validators Routes
- `GET /api/v1/validators` - All validators
- `GET /api/v1/validators/:address` - Validator details
- `GET /api/v1/validators/leaderboard` - Validators leaderboard

### Tokens Routes
- `GET /api/v1/tokens` - Token info
- `GET /api/v1/tokens/allocations` - Token allocations

### Staking Routes
- `GET /api/v1/staking/info` - Staking info
- `POST /api/v1/staking/stake` - Stake TRAY
- `POST /api/v1/staking/unstake` - Unstake TRAY

### Stats Routes
- `GET /api/v1/stats` - Overall statistics

## Database

PostgreSQL schema is available in `src/database/schema.sql`.

## Development

```bash
npm run dev:watch    # Watch mode
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```
