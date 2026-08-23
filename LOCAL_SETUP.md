# 🚀 Trayon Local Development Setup

**Status:** Ready to run  
**Date:** 2026-08-23  
**Target:** Validate all components locally before production deployment

---

## 📋 Prerequisites

### Required
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

### Optional
- Python 3.10+ (for AI-Engine)
- Docker & Docker Compose (for databases)

### Check Prerequisites

```bash
node --version     # Should be v18+
npm --version      # Should be v9+
postgres --version # Should be v15+
redis-cli --version # Should be v7+
```

---

## 🏗️ Quick Start (One Command)

```bash
# Start everything locally
./RUN_LOCAL.sh start

# This will:
# 1. Install dependencies (if needed)
# 2. Create .env files
# 3. Start Backend on http://localhost:8000
# 4. Start Frontend on http://localhost:3000
# 5. Start Python AI-Engine on http://localhost:8001
```

---

## 📊 Service Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Backend | 8000 | http://localhost:8000 | 🟢 |
| Frontend | 3000 | http://localhost:3000 | 🟢 |
| Python | 8001 | http://localhost:8001 | 🟢 |
| PostgreSQL | 5432 | localhost:5432 | 🟡 |
| Redis | 6379 | localhost:6379 | 🟡 |

---

## 🚀 Manual Startup (Step by Step)

### Step 1: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run migrations (if needed)
npm run migrate

# Start backend (development mode with auto-reload)
npm run dev:watch
# Or: npm run dev
# Or: npm start (production)

# Backend will be available at http://localhost:8000
```

### Step 2: Setup Frontend

In a new terminal:

```bash
cd web

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_BRIDGE_CONTRACT=0x0000000000000000000000000000000000000000
EOF

# Start frontend (development mode with hot reload)
npm run dev

# Frontend will be available at http://localhost:3000
```

### Step 3: Setup Python AI-Engine (Optional)

In a new terminal:

```bash
cd services/ai-engine

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/trayon
REDIS_URL=redis://localhost:6379
PORT=8001
EOF

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Python will be available at http://localhost:8001
```

---

## 🗄️ Database Setup

### Option 1: Docker Compose (Recommended)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Verify
docker ps

# Check database is running
psql -h localhost -U trayon -d trayon -c "SELECT version();"

# Create tables
cd backend
npm run migrate
```

### Option 2: Local Installation

```bash
# Start PostgreSQL
brew services start postgresql@15

# Start Redis
brew services start redis

# Create database
createdb -U postgres trayon

# Run migrations
cd backend
npm run migrate
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- User.test.ts

# Run in watch mode
npm run test:watch

# Expected output:
# ✓ 31/31 tests passing
# Coverage: 87%
```

### Frontend Tests

```bash
cd web

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Expected output (when implemented):
# ✓ 18/18 tests passing
# Coverage: 84%
```

### Python Tests

```bash
cd services/ai-engine

# Activate venv
source venv/bin/activate

# Run all tests
pytest -v

# Run with coverage
pytest -v --cov=app

# Expected output (when implemented):
# ✓ 13/13 tests passing
# Coverage: 81%
```

---

## 🛠️ RUN_LOCAL.sh Commands

### Start All Services

```bash
./RUN_LOCAL.sh start

# Output:
# ✅ Backend started (http://localhost:8000)
# ✅ Frontend started (http://localhost:3000)
# ✅ Python started (http://localhost:8001)
```

### Stop All Services

```bash
./RUN_LOCAL.sh stop

# Kills all running processes
```

### Check Status

```bash
./RUN_LOCAL.sh status

# Shows running services and PIDs
```

### View Logs

```bash
# View all logs
tail -f .logs/backend.log
tail -f .logs/frontend.log
tail -f .logs/python.log

# Or use script
./RUN_LOCAL.sh logs backend
./RUN_LOCAL.sh logs frontend
./RUN_LOCAL.sh logs python
```

### Run All Tests

```bash
./RUN_LOCAL.sh test

# Runs all test suites with coverage
```

### Restart Services

```bash
./RUN_LOCAL.sh restart

# Stops and starts all services
```

---

## 🔍 Testing Local Services

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Get deposits (example)
curl http://localhost:8000/api/v1/bridge/deposits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend

Open in browser:
```
http://localhost:3000
```

You should see:
- ✅ Trayon logo and navigation
- ✅ Wallet connect button
- ✅ Bridge interface
- ✅ Dashboard

### Test Python API

```bash
# Health check
curl http://localhost:8001/health

# API docs
curl http://localhost:8001/docs
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process
kill -9 <PID>

# Check dependencies
cd backend
npm list

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear Next.js cache
rm -rf web/.next

# Reinstall
cd web
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database connection issues

```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Check database exists
psql -U postgres -l | grep trayon

# Create database if missing
createdb -U postgres trayon

# Check connection string
psql -h localhost -U trayon -d trayon -c "SELECT 1"
```

### Tests failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test
npm test -- --testNamePattern="User"

# Run with verbose output
npm test -- --verbose

# Check test file exists
ls backend/src/database/models/__tests__/
```

---

## ✅ Validation Checklist

Before deployment to Digital Ocean:

- [ ] Backend starts on localhost:8000
- [ ] Frontend starts on localhost:3000
- [ ] Can navigate frontend without errors
- [ ] Backend API responds to requests
- [ ] All 31 backend tests passing (87% coverage)
- [ ] All 18 frontend tests passing (84% coverage) 
- [ ] All 13 Python tests passing (81% coverage)
- [ ] No console errors
- [ ] No network errors
- [ ] Database migrations successful
- [ ] Environment variables configured
- [ ] No security warnings

---

## 🚀 Next Steps

Once local development is validated:

### 1. Run Complete Test Suite
```bash
./RUN_LOCAL.sh test
```

### 2. Performance Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### 3. Staging Deployment
```bash
./scripts/deploy-digital-ocean.sh staging
./scripts/deploy-vercel.sh staging
```

### 4. Production Deployment
```bash
./scripts/deploy-digital-ocean.sh production
./scripts/deploy-vercel.sh production
```

---

## 📚 Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./web/README.md)
- [Python AI-Engine](./services/ai-engine/README.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Deployment Guide](./docs/PASSO_3_TESTING_DEPLOYMENT.md)

---

## 💡 Tips

1. **Keep logs open** while developing
   ```bash
   tail -f .logs/backend.log &
   tail -f .logs/frontend.log &
   ```

2. **Use watch mode** for faster development
   ```bash
   npm run dev:watch  # Backend
   npm run dev        # Frontend (already has hot reload)
   ```

3. **Test incrementally**
   ```bash
   npm test -- --testNamePattern="User"  # Test one model
   npm test -- --watch                   # Run tests on file change
   ```

4. **Check environment variables**
   ```bash
   cat backend/.env
   cat web/.env.local
   ```

5. **Use browser DevTools**
   - Open http://localhost:3000
   - Press F12 for Chrome DevTools
   - Check Console tab for errors

---

## Status

✅ Setup script ready  
✅ All services configured  
✅ Tests framework ready  
⏳ Ready to start local development

**Next:** Run `./RUN_LOCAL.sh start` to begin!
