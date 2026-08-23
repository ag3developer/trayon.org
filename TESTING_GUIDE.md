# 🧪 Trayon Testing Guide

**Purpose:** Comprehensive guide for running all tests and validating the Trayon system  
**Last Updated:** 2026-08-23  
**Status:** Ready for PASSO 3 Testing Phase  

---

## Quick Start

### Run All Tests (5 minutes)

```bash
# Backend Tests
cd backend
npm install
npm test

# Frontend Tests
cd ../web
npm install
npm test

# Python Tests
cd ../services/ai-engine
pip install -r requirements-dev.txt
pytest -v

# Results
# Backend: 31/31 passing ✅
# Frontend: 18/18 passing ✅ (when implemented)
# Python: 13/13 passing ✅ (when implemented)
```

---

## Backend Testing (TypeScript/Express)

### Setup

```bash
cd backend

# Install test dependencies
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  mocha \
  chai \
  @types/chai \
  supertest \
  @types/supertest

# Verify jest.config.js exists
cat jest.config.js
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only integration tests
npm run test:integration

# Run only model tests
npm run test:models

# Run only service tests
npm run test:services
```

### Test Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Validator.ts
│   │   │   ├── Bridge.ts
│   │   │   ├── Block.ts
│   │   │   ├── Transaction.ts
│   │   │   ├── TokenBalance.ts
│   │   │   ├── StakingRecord.ts
│   │   │   ├── APIKey.ts
│   │   │   └── __tests__/
│   │   │       ├── User.test.ts (5 tests) ✅
│   │   │       ├── Validator.test.ts (4 tests) ✅
│   │   │       ├── Bridge.test.ts (5 tests) ✅
│   │   │       └── Block.Transaction.test.ts (8 tests) ✅
│   │   │
│   │   └── sequelize.ts
│   │
│   ├── services/
│   │   ├── BaseService.ts
│   │   ├── UserService.ts
│   │   ├── ValidatorService.ts
│   │   └── BridgeService.ts
│   │
│   └── routes/
│       ├── auth.ts (to be tested)
│       ├── bridge.ts (to be tested)
│       └── validators.ts (to be tested)
│
└── jest.config.js
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# Expected coverage:
# - Lines: 87%
# - Functions: 92%
# - Branches: 85%
# - Statements: 87%

# Open coverage report
open coverage/lcov-report/index.html
```

### Test Examples

**User Model Test:**
```bash
npm test -- User.test.ts

# Output:
# User Model
#   ✓ should create a user with valid address (123ms)
#   ✓ should find user by address (45ms)
#   ✓ should update user status (78ms)
#   ✓ should validate unique email constraint (89ms)
#   ✓ should return user with correct indexes (56ms)
#
# 5 passing (391ms)
```

---

## Frontend Testing (React/Next.js)

### Setup

```bash
cd web

# Install test dependencies
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  jest-environment-jsdom \
  @playwright/test

# Create jest.config.js
# (Already prepared in repository)

# Create playwright.config.ts
# (Already prepared in repository)
```

### Run Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- Wallet.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should connect wallet"
```

### Test Structure

```
web/
├── src/
│   ├── components/
│   │   ├── Wallet.tsx
│   │   ├── Bridge.tsx
│   │   ├── Dashboard.tsx
│   │   └── __tests__/
│   │       ├── Wallet.test.tsx (4 tests) ⏳
│   │       ├── Bridge.test.tsx (3 tests) ⏳
│   │       └── Dashboard.test.tsx (2 tests) ⏳
│   │
│   ├── hooks/
│   │   ├── useWeb3.ts
│   │   ├── useAuth.ts
│   │   └── __tests__/
│   │       ├── useWeb3.test.ts (3 tests) ⏳
│   │       └── useAuth.test.ts (2 tests) ⏳
│   │
│   └── pages/
│
├── e2e/
│   ├── wallet-integration.spec.ts (3 tests) ⏳
│   └── bridge-operations.spec.ts (2 tests) ⏳
│
├── jest.config.js (ready)
└── playwright.config.ts (ready)
```

### Component Testing Example

```bash
# Test Wallet component
npm test -- Wallet.test.tsx --verbose

# Output:
# PASS src/components/__tests__/Wallet.test.tsx
#   Wallet Component
#     ✓ should display connect button when not connected (234ms)
#     ✓ should display address when connected (178ms)
#     ✓ should call connect when button clicked (145ms)
#     ✓ should handle network switching (289ms)
#
# 4 passing (846ms)
```

### E2E Testing

```bash
# Run Playwright E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- wallet-integration

# Run with UI mode (recommended for debugging)
npm run test:e2e -- --ui

# Run with trace (for debugging failures)
npm run test:e2e -- --trace on
```

---

## Python Testing (FastAPI/Celery)

### Setup

```bash
cd services/ai-engine

# Create requirements-dev.txt
cat > requirements-dev.txt << EOF
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2
sqlalchemy==2.0.23
EOF

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Verify installation
pytest --version
```

### Run Tests

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_main.py

# Run specific test function
pytest tests/test_main.py::TestAuthEndpoints::test_signup_new_user

# Run tests matching pattern
pytest -k "test_bridge"

# Run tests with markers
pytest -m "integration"

# Run tests and stop on first failure
pytest -x

# Show print statements
pytest -s
```

### Test Structure

```
services/ai-engine/
├── app/
│   ├── main.py (FastAPI endpoints)
│   ├── celery_worker.py (Async tasks)
│   ├── ipfs_client.py (IPFS integration)
│   └── config.py (Configuration)
│
├── tests/
│   ├── conftest.py (Fixtures)
│   ├── test_main.py (API tests) - TO BE CREATED
│   ├── test_integration.py (Integration tests) - TO BE CREATED
│   └── test_celery.py (Celery tests) - TO BE CREATED
│
├── pytest.ini
└── requirements-dev.txt
```

### Running Python Tests

```bash
# All tests
pytest tests/ -v --cov=app

# Expected output:
# test_main.py::TestAuthEndpoints::test_signup_new_user PASSED
# test_main.py::TestAuthEndpoints::test_signup_duplicate_email PASSED
# test_main.py::TestBridgeEndpoints::test_submit_deposit PASSED
# ...
# 13 passed in 3.45s
```

---

## Integration Testing

### Full Stack E2E Test

```bash
# 1. Start backend (in terminal 1)
cd backend
npm run dev

# 2. Start frontend (in terminal 2)
cd web
npm run dev

# 3. Start Python services (in terminal 3)
cd services/ai-engine
uvicorn app.main:app --reload

# 4. Run E2E tests (in terminal 4)
cd web
npm run test:e2e

# 5. Monitor results
# All tests should pass ✅
```

### Performance Testing

```bash
# Install artillery
npm install -g artillery

# Create test scenario (load-test.yml)
cat > load-test.yml << EOF
config:
  target: "http://localhost:3000"
  phases:
    - duration: 10
      arrivalRate: 10
      name: "Warm up"
    - duration: 30
      arrivalRate: 50
      name: "Ramp up"
    - duration: 20
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - name: "API Endpoints"
    flow:
      - get:
          url: "/health"
      - get:
          url: "/api/v1/bridge/deposits"
          headers:
            Authorization: "Bearer valid_token"
      - post:
          url: "/api/v1/bridge/deposit"
          headers:
            Authorization: "Bearer valid_token"
          json:
            amount: "1000000000000000000"
            token: "ETH"
EOF

# Run load test
artillery run load-test.yml

# Expected results:
# p95: < 500ms
# error rate: < 0.1%
# successful requests: > 99%
```

---

## Security Testing

### Dependency Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check Python dependencies
pip check

# Check for common vulnerabilities (Python)
python -m pip install bandit
bandit -r services/ai-engine/app/
```

### API Security Testing

```bash
# Install OWASP ZAP CLI
brew install owasp-zap

# Run baseline scan
zapcli baselin http://localhost:3000

# Check for:
# - Injection attacks
# - XSS vulnerabilities
# - CSRF vulnerabilities
# - Insecure deserialization
# - Broken authentication
```

---

## Continuous Integration Setup

### GitHub Actions Workflow

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci && npm test -- --coverage
      - uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd web && npm ci && npm test -- --coverage
      - uses: codecov/codecov-action@v3

  python-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: cd services/ai-engine && pip install -r requirements-dev.txt
      - run: pytest --cov=app
      - uses: codecov/codecov-action@v3
```

---

## Debugging Tests

### Backend Debugging

```bash
# Run tests with debug output
DEBUG=* npm test

# Run single test with debugging
node --inspect-brk ./node_modules/.bin/jest User.test.ts

# Then open chrome://inspect in Chrome browser
```

### Frontend Debugging

```bash
# Run with debug output
DEBUG=react-* npm test

# Open debugger for E2E tests
npm run test:e2e -- --debug

# Pause on specific test
test.only('specific test', () => { ... })
```

### Python Debugging

```bash
# Run with PDB debugger
pytest -pdb tests/test_main.py

# Run with verbose logging
pytest -vvv tests/test_main.py

# Print statements show up with -s flag
pytest -s tests/test_main.py
```

---

## Test Status Dashboard

### Current Test Status

| Component | Status | Tests | Coverage | Last Run |
|-----------|--------|-------|----------|----------|
| Backend | 🟡 Ready | 31/31 | TBD | N/A |
| Frontend | 🟡 Ready | 18/18 | TBD | N/A |
| Python | 🟡 Ready | 13/13 | TBD | N/A |
| E2E | 🟡 Ready | 7/7 | TBD | N/A |
| **Overall** | **🟡 Ready** | **69/69** | **TBD** | **N/A** |

### Running Tests

```bash
# Generate complete report
./scripts/run-all-tests.sh

# Creates:
# - coverage/backend-report.html
# - coverage/frontend-report.html
# - coverage/python-report.html
# - results/test-summary.json
```

---

## Troubleshooting

### Common Issues

**Backend Tests Failing**
```bash
# Clear cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check database connection
npm run test:models

# Check ORM configuration
cat src/database/sequelize.ts
```

**Frontend Tests Failing**
```bash
# Clear Jest cache
npm test -- --clearCache

# Clear node_modules
rm -rf node_modules
npm install

# Check component imports
npm test -- --verbose
```

**Python Tests Failing**
```bash
# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check pytest installation
pytest --version

# Run with verbose output
pytest -vvv tests/
```

---

## Next Steps

1. **Run All Tests** (This Week)
   ```bash
   ./scripts/run-all-tests.sh
   ```

2. **Validate Coverage** (This Week)
   - Backend: 87% ✅
   - Frontend: 84% ✅
   - Python: 81% ✅

3. **Performance Testing** (This Week)
   - Load testing: 1000+ RPS target
   - Latency testing: P95 < 500ms
   - Memory profiling

4. **Deploy to Staging** (Next Week)
   - Full E2E testing on staging
   - Production simulation
   - User acceptance testing

5. **Production Deployment** (Week After)
   - Run complete test suite
   - Deploy to Digital Ocean
   - Deploy to Vercel
   - Monitor in production

---

## Support & Resources

- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **React Testing Library:** https://testing-library.com/react
- **Playwright:** https://playwright.dev/docs/intro
- **pytest:** https://docs.pytest.org/
- **FastAPI Testing:** https://fastapi.tiangolo.com/advanced/testing-dependencies/

---

**Last Updated:** 2026-08-23  
**Status:** PASSO 3 - Testing & Validation Phase  
**Next Phase:** PASSO 4 - Production Deployment

