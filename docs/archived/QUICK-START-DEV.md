# ⚡ Quick Start - Dev Setup (Next 2 Hours)

**Guia rápido para começar desenvolvimento HOJE MESMO**

---

##  Objetivo: 2 horas, 5 passos

```
By end of this guide:
 GitHub repos created & organized
 Smart contract template ready
 Local environment setup
 First code committed
 CI/CD pipeline working
```

---

##  PASSO 1: GitHub Organization (15 min)

### 1.1 Create GitHub Organization
```bash
# Go to: https://github.com/organizations/new
# Fill in:
# - Organization name: trayon
# - Email: partnerships@trayon.org
# - Plan: Free (can upgrade later)
# Click: "Create organization"
```

### 1.2 Create 4 Repositories
```bash
# Inside organization, click "New repository"

# Repo 1: trayon.org (already exists - fork it)
# Repo 2: trayon-contracts
# Repo 3: trayon-oracle
# Repo 4: trayon-infra

# For each new repo:
# - Name: [as above]
# - Description: [see below]
# - Public: YES
# - Initialize with: No (we'll add files)
# Click: "Create repository"

# Descriptions:
trayon-contracts: "Smart contracts for Trayon Protocol (Solidity/Foundry)"
trayon-oracle: "AI validators and consensus engine (Python/FastAPI)"
trayon-infra: "Infrastructure, Docker, Kubernetes deployment"
```

**After 15 min:**
-  4 repos created in GitHub organization
-  All public
-  Ready to clone

---

##  PASSO 2: Local Repository Setup (20 min)

### 2.1 Create Working Directory
```bash
mkdir -p ~/trayon-dev && cd ~/trayon-dev
```

### 2.2 Clone or Initialize Each Repo
```bash
# Option A: If repo already exists on GitHub
git clone https://github.com/trayon/trayon-contracts.git
cd trayon-contracts

# Option B: If starting fresh
git init trayon-contracts
cd trayon-contracts
git remote add origin https://github.com/trayon/trayon-contracts.git

# Create initial structure
mkdir -p contracts tests scripts
```

### 2.3 Create README for Smart Contracts
```bash
cd ~/trayon-dev/trayon-contracts

cat > README.md << 'EOF'
# Trayon Protocol - Smart Contracts

Solidity smart contracts for Trayon Protocol Layer 2

## Quick Start

```bash
# Install dependencies
forge install

# Run tests
forge test

# Deploy to testnet
forge script scripts/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

## Contracts

- **TrayonToken.sol** - Native gas token (ERC-20)
- **ValidatorRegistry.sol** - Validator staking & slashing
- **TrayonOracle.sol** - Data commitments & Merkle proofs

## Documentation

See: [../trayon.org/06-SPECS-TECNICAS.md](../trayon.org/06-SPECS-TECNICAS.md)

## Security

Audited by: [Auditor] (TODO)
EOF

git add README.md
git commit -m "Initial: Smart contracts repository setup"
git push -u origin main
```

### 2.4 Repeat for Other Repos
```bash
# Same process for:
# - trayon-oracle
# - trayon-infra

# For trayon-oracle:
cat > ~/trayon-dev/trayon-oracle/README.md << 'EOF'
# Trayon Protocol - AI Validators

Decentralized AI validators for data integrity consensus

Python FastAPI service for validator consensus engine.

## Quick Start

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
EOF

# For trayon-infra:
cat > ~/trayon-dev/trayon-infra/README.md << 'EOF'
# Trayon Protocol - Infrastructure

Docker, Kubernetes, and deployment scripts

```bash
docker-compose up
```
EOF
```

**After 20 min:**
-  4 local repos cloned
-  README files created
-  Initial commits pushed

---

##  PASSO 3: Smart Contracts Environment (40 min)

### 3.1 Install Foundry
```bash
# macOS
brew install libusb

# Install foundryup
curl -L https://foundry.paradigm.xyz | bash

# Add to PATH
export PATH="$HOME/.foundry/bin:$PATH"

# Verify
foundry --version
```

### 3.2 Initialize Foundry Project
```bash
cd ~/trayon-dev/trayon-contracts

# Initialize
forge init . --force

# Project structure created:
# ├── src/
# ├── test/
# ├── foundry.toml
# └── .gitignore
```

### 3.3 Create foundry.toml
```bash
cat > foundry.toml << 'EOF'
[profile.default]
src = 'contracts'
out = 'out'
libs = ['lib']
solc_version = '0.8.19'
optimizer = true
optimizer_runs = 200

[profile.test]
memory_limit = "10000000000"

[rpc_endpoints]
polygon = "https://polygon-rpc.com"
mumbai = "https://rpc-mumbai.maticvigil.com"
eth = "https://eth.llamarpc.com"
EOF

git add foundry.toml
git commit -m "Config: Foundry configuration"
git push
```

### 3.4 Install Dependencies
```bash
# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts

git add lib/ .gitmodules
git commit -m "Deps: Add OpenZeppelin contracts"
git push
```

### 3.5 Create Smart Contract File
```bash
mkdir -p contracts

cat > contracts/TrayonToken.sol << 'EOF'
// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrayonToken
 * @dev Native gas token for Trayon Protocol
 * Features: 1B supply, 20% fee burn for deflation
 */
contract TrayonToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant BURN_RATE = 20; // 20% of fees burned
    
    event TokenBurned(address indexed burner, uint256 amount);
    
    constructor() ERC20("Trayon", "TRAY") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Consume gas with automatic burn
     * @param user Address consuming gas
     * @param amount Amount to consume
     */
    function consumeGas(address user, uint256 amount) external {
        require(balanceOf(user) >= amount, "Insufficient balance");
        uint256 burnAmount = (amount * BURN_RATE) / 100;
        _burn(user, burnAmount);
        emit TokenBurned(user, burnAmount);
    }
    
    /**
     * @dev Manual token burn
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokenBurned(msg.sender, amount);
    }
}
EOF

git add contracts/TrayonToken.sol
git commit -m "Feature: TrayonToken contract (ERC-20)"
git push
```

### 3.6 Create Test File
```bash
mkdir -p test

cat > test/TrayonToken.t.sol << 'EOF'
// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../contracts/TrayonToken.sol";

contract TrayonTokenTest is Test {
    TrayonToken public token;
    address user = address(0x123);
    
    function setUp() public {
        token = new TrayonToken();
        vm.label(user, "User");
    }
    
    function test_totalSupply() public {
        assertEq(token.totalSupply(), 1_000_000_000 * 10**18);
    }
    
    function test_transfer() public {
        token.transfer(user, 1000 * 10**18);
        assertEq(token.balanceOf(user), 1000 * 10**18);
    }
    
    function test_burn() public {
        token.transfer(user, 1000 * 10**18);
        vm.prank(user);
        token.burn(100 * 10**18);
        assertEq(token.balanceOf(user), 900 * 10**18);
    }
}
EOF

git add test/TrayonToken.t.sol
git commit -m "Test: Add TrayonToken tests"
git push
```

### 3.7 Run Tests
```bash
cd ~/trayon-dev/trayon-contracts

# Run all tests
forge test

# Expected output:
# [PASS] test_totalSupply (gas: 5432)
# [PASS] test_transfer (gas: 62189)
# [PASS] test_burn (gas: 78234)
# Test result: ok. 3 passed
```

**After 40 min:**
-  Foundry installed & configured
-  TrayonToken contract created
-  Tests written & passing
-  All code committed & pushed

---

##  PASSO 4: CI/CD Pipeline (20 min)

### 4.1 Create GitHub Actions Workflow
```bash
mkdir -p ~/.github/workflows

cd ~/trayon-dev/trayon-contracts

mkdir -p .github/workflows

cat > .github/workflows/test.yml << 'EOF'
name: Smart Contract Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      
      - name: Run Tests
        run: forge test -vvv
      
      - name: Generate Coverage
        run: forge coverage --report lcov
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./lcov.info

EOF

git add .github/workflows/test.yml
git commit -m "CI: Add GitHub Actions test workflow"
git push
```

### 4.2 Verify Workflow Runs
```bash
# Go to: https://github.com/trayon/trayon-contracts/actions
# You should see workflow running
# After ~2 min:  All checks passing
```

**After 20 min:**
-  CI/CD pipeline configured
-  Tests run automatically on every push
-  Coverage tracked

---

##  PASSO 5: Verify Everything (25 min)

### 5.1 Check GitHub repos
```bash
# Go to: https://github.com/trayon
# Verify:
#  trayon-contracts - with smart contract code
#  trayon-oracle - with README
#  trayon-infra - with README
#  trayon.org - with all documentation
```

### 5.2 Check Local repos
```bash
cd ~/trayon-dev
ls -la

# Should show:
# trayon.org/              (documentation)
# trayon-contracts/       (smart contracts + passing tests)
# trayon-oracle/          (placeholder)
# trayon-infra/           (placeholder)
```

### 5.3 Check Git History
```bash
cd ~/trayon-dev/trayon-contracts
git log --oneline

# Should show something like:
# abc1234 CI: Add GitHub Actions test workflow
# def5678 Test: Add TrayonToken tests
# ghi9012 Feature: TrayonToken contract
# jkl3456 Config: Foundry configuration
```

### 5.4 Final Verification
```bash
# Run all tests one more time
cd ~/trayon-dev/trayon-contracts
forge test

# Should pass all tests 
```

---

##  Status After 2 Hours

```
COMPLETED:
 GitHub organization created
 4 repositories initialized
 Foundry installed & configured
 TrayonToken.sol written (50 lines)
 Tests written & passing (3 tests)
 CI/CD pipeline setup
 All code pushed to GitHub
 Documentation linked

READY FOR:
→ More smart contracts (ValidatorRegistry, TrayonOracle)
→ Python AI engine setup
→ Docker & infrastructure
→ First partnership pilot

NEXT ACTIONS:
1. Create ValidatorRegistry.sol (follow same pattern)
2. Setup Python environment
3. Begin reaching out to partners
```

---

## 📞 Common Issues & Fixes

### Issue: "forge not found"
```bash
# Solution: Add to PATH
export PATH="$HOME/.foundry/bin:$PATH"

# Make permanent
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: "Tests failing"
```bash
# Solution: Check Solidity version
forge --version

# If needed, update
foundryup
```

### Issue: "Can't push to GitHub"
```bash
# Solution: Setup SSH
ssh-keygen -t ed25519 -C "your@email.com"
# Add to GitHub: Settings → SSH Keys
```

### Issue: "GitHub Actions not running"
```bash
# Solution: Check workflow file location
# Must be: .github/workflows/test.yml
# Not: .workflows/test.yml or workflows/test.yml
```

---

## 🎉 Parabéns!

You now have:
- 📁 Organized GitHub repositories
- 🔗 Smart contracts infrastructure
- 🧪 Automated testing pipeline
- 📝 Documentation linked
-  Ready for Phase 2

**Next:**
Choose one:
1. **Create ValidatorRegistry.sol** (30 min) - Follow same pattern
2. **Setup Python environment** (30 min) - AI validators
3. **Start partnership outreach** (30 min) - Send first RFPs
4. **Deploy to testnet** (45 min) - Make contracts live

**What's next?** Let me know! 

---

**Version:** 1.0 | **Time:** ~2 hours | **Status:** Ready to Execute

