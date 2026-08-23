# Trayon Setup Instructions - Phase 1

Complete guide to set up and run the newly created validator and backend components.

## Prerequisites

- Node.js 18+ with npm/yarn
- PostgreSQL 13+ (for backend)
- Git

## 1️⃣ Setup Validator Node

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/validator

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Edit .env with your validator details:
# - VALIDATOR_ADDRESS (your wallet)
# - VALIDATOR_PRIVATE_KEY
# - L1_RPC_URL and L2_RPC_URL

# Build TypeScript
npm run build

# Start in development mode
npm run dev

# Start in watch mode (for development)
npm run dev:watch
```

### Validator Node Structure

```
validator/
├── src/
│   ├── index.ts              # Entry point
│   ├── node/
│   │   ├── core.ts           # Main ValidatorNode class
│   │   ├── consensus.ts      # PoS consensus engine
│   │   └── state-machine.ts  # L2 state processor
│   ├── validator/
│   │   └── staking.ts        # Stake & reward management
│   ├── network/
│   │   └── p2p.ts            # P2P networking
│   ├── data-ingestion/       # [TODO] Data source handlers
│   └── utils/
│       └── logger.ts         # Structured logging
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Testing Validator

```bash
# Run tests
npm test

# Run with logging
LOG_LEVEL=debug npm run dev

# Health check (after starting)
curl http://localhost:3001/health
```

---

## 2️⃣ Setup Backend API

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Edit .env with your configuration:
# - DB_HOST, DB_USER, DB_PASSWORD
# - JWT_SECRET
# - Contract addresses

# Build TypeScript
npm run build

# Start in development mode
npm run dev

# Start in watch mode
npm run dev:watch
```

### Backend API Structure

```
backend/
├── src/
│   ├── app.ts                # Express main app
│   ├── api/
│   │   ├── routes/           # API endpoints
│   │   │   ├── bridge.ts
│   │   │   ├── validators.ts
│   │   │   ├── tokens.ts
│   │   │   ├── staking.ts
│   │   │   └── stats.ts
│   │   └── middleware/       # Express middleware
│   │       ├── errorHandler.ts
│   │       └── requestLogger.ts
│   ├── services/             # [TODO] Business logic
│   ├── database/
│   │   ├── schema.sql        # PostgreSQL schema
│   │   ├── models/           # [TODO] ORM models
│   │   └── migrations/       # [TODO] DB migrations
│   └── utils/
│       └── logger.ts         # Structured logging
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Testing Backend API

```bash
# Run tests
npm test

# Run with logging
LOG_LEVEL=debug npm run dev

# Health check (after starting)
curl http://localhost:3000/health

# Get bridge status
curl http://localhost:3000/api/v1/bridge/status

# Get token info
curl http://localhost:3000/api/v1/tokens
```

---

## 3️⃣ Database Setup

```bash
# Create PostgreSQL database
createdb trayon_backend

# Create tables from schema
psql trayon_backend < backend/src/database/schema.sql

# Verify tables
psql trayon_backend -c "\dt"
```

### Database Tables

- `validators` - Validator registry
- `deposits` - Bridge deposits
- `withdrawals` - Bridge withdrawals
- `transactions` - All L2 transactions
- `blocks` - Block history
- `user_balances` - Account balances
- `rewards` - Validator rewards
- `slashings` - Slashing events
- `api_keys` - Validator API keys

---

## 4️⃣ Running Both Services

### Terminal 1 - Backend API

```bash
cd backend
npm run dev:watch
# API running on http://localhost:3000
```

### Terminal 2 - Validator Node

```bash
cd validator
npm run dev:watch
# Validator running, logs to console
```

### Terminal 3 - Optional: Monitor Database

```bash
psql trayon_backend

# Check validators
SELECT * FROM validators;

# Check recent deposits
SELECT * FROM deposits ORDER BY created_at DESC LIMIT 10;

# Check transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```

---

## 5️⃣ Configuration Files

### Backend `.env`

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=trayon_backend
DB_USER=your_user
DB_PASSWORD=your_password

L1_RPC_URL=https://polygon.drpc.org
L2_RPC_URL=http://localhost:8545

JWT_SECRET=your-super-secret-key
LOG_LEVEL=debug
```

### Validator `.env`

```env
VALIDATOR_NAME=validator-1
VALIDATOR_ADDRESS=0x...
VALIDATOR_PRIVATE_KEY=0x...

L1_RPC_URL=https://polygon.drpc.org
L2_RPC_URL=http://localhost:8545

MIN_STAKE=32000000000000000000000
P2P_PORT=30333
LOG_LEVEL=info
```

---

## 🚀 Quick Start (All-in-One)

```bash
#!/bin/bash

cd /Users/josecarlosmartins/Documents/trayon.org

# Backend
cd backend
npm install
cp .env.example .env
npm run build

# Validator
cd ../validator
npm install
cp .env.example .env
npm run build

# Create database
createdb trayon_backend
psql trayon_backend < src/database/schema.sql

echo "✅ Setup complete!"
echo "Run in separate terminals:"
echo "  Terminal 1: cd backend && npm run dev:watch"
echo "  Terminal 2: cd validator && npm run dev:watch"
```

---

## 📚 API Reference

### Health Check
```bash
GET /health
```

### Bridge Endpoints
```bash
GET /api/v1/bridge/status
GET /api/v1/bridge/deposits
GET /api/v1/bridge/withdrawals
POST /api/v1/bridge/deposit
POST /api/v1/bridge/withdraw
```

### Validators Endpoints
```bash
GET /api/v1/validators
GET /api/v1/validators/:address
GET /api/v1/validators/leaderboard
```

### Tokens Endpoints
```bash
GET /api/v1/tokens
GET /api/v1/tokens/allocations
```

### Staking Endpoints
```bash
GET /api/v1/staking/info
POST /api/v1/staking/stake
POST /api/v1/staking/unstake
```

### Stats Endpoints
```bash
GET /api/v1/stats
```

---

## ⚠️ Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 30333
lsof -ti:30333 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
brew services list

# Start if needed
brew services start postgresql

# Create user if needed
psql -U postgres -c "CREATE USER trayon WITH PASSWORD 'trayon123';"
```

### TypeScript Errors
```bash
# Clear dist folder and rebuild
rm -rf dist/
npm run build
```

---

## 📋 Next Steps

1. ✅ Infrastructure created
2. ⏳ Implement P2P network in validator
3. ⏳ Implement database integration in backend
4. ⏳ Create Sequencer Registry contract
5. ⏳ Deploy to testnet

See `INFRASTRUCTURE-STATUS.md` for detailed progress.
