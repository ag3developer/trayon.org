#!/bin/bash

################################################################################
# ✅ Production Deployment Validation
# Verifies everything is ready before deploying
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌${NC} $1"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════"
echo "  Production Deployment Pre-Flight Check"
echo "════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check 1: .env.production exists
echo "Checking .env.production..."
if [ -f ".env.production" ]; then
    check_pass ".env.production exists"
else
    check_fail ".env.production not found"
    echo "  Run: cat > .env.production << 'EOF'"
    echo "  PRIVATE_KEY=0x..."
    echo "  POLYGON_MAINNET_RPC=https://polygon.drpc.org"
    echo "  RELAYER_MANAGER_ADDRESS=0x..."
    echo "  EOF"
fi

# Check 2: PRIVATE_KEY is set
if [ -f ".env.production" ]; then
    source .env.production
    
    if [ -z "$PRIVATE_KEY" ]; then
        check_fail "PRIVATE_KEY not set in .env.production"
    elif [[ "$PRIVATE_KEY" != 0x* ]]; then
        check_fail "PRIVATE_KEY missing 0x prefix"
    else
        check_pass "PRIVATE_KEY is set with 0x prefix"
    fi
fi

# Check 3: RPC is set
if [ -f ".env.production" ]; then
    if [ -z "$POLYGON_MAINNET_RPC" ]; then
        check_fail "POLYGON_MAINNET_RPC not set"
    else
        check_pass "POLYGON_MAINNET_RPC is set"
    fi
fi

# Check 4: Can derive address
if [ -f ".env.production" ] && [ ! -z "$PRIVATE_KEY" ]; then
    ACCOUNT=$(cast wallet address "$PRIVATE_KEY" 2>/dev/null) || true
    if [ ! -z "$ACCOUNT" ]; then
        check_pass "Can derive account address: $ACCOUNT"
    else
        check_fail "Cannot derive account address from private key"
    fi
fi

# Check 5: RPC responds
if [ ! -z "$POLYGON_MAINNET_RPC" ]; then
    echo ""
    echo "Checking RPC connectivity..."
    CHAIN=$(cast rpc eth_chainId --rpc-url "$POLYGON_MAINNET_RPC" 2>/dev/null | xargs printf '%d\n') || true
    
    if [ ! -z "$CHAIN" ]; then
        check_pass "RPC responds"
        
        if [ "$CHAIN" = "137" ]; then
            check_pass "Connected to Polygon Mainnet (chain 137)"
        else
            check_fail "Wrong chain! Got $CHAIN, expected 137"
        fi
    else
        check_fail "RPC not responding"
    fi
fi

# Check 6: Account has balance
if [ ! -z "$ACCOUNT" ] && [ ! -z "$POLYGON_MAINNET_RPC" ]; then
    echo ""
    echo "Checking account balance..."
    BALANCE=$(cast balance "$ACCOUNT" --rpc-url "$POLYGON_MAINNET_RPC" 2>/dev/null) || true
    BALANCE_POL=$(echo "scale=4; $BALANCE / 1e18" | bc 2>/dev/null || echo "?")
    
    if [ ! -z "$BALANCE" ]; then
        check_pass "Account: $ACCOUNT"
        check_pass "Balance: ~$BALANCE_POL POL"
        
        MIN_BALANCE=200000000000000000  # 0.2 POL
        if (( $(echo "$BALANCE >= $MIN_BALANCE" | bc -l) )); then
            check_pass "Balance sufficient (>= 0.2 POL)"
        else
            check_fail "Balance too low! Need at least 0.2 POL"
        fi
    else
        check_fail "Cannot read balance"
    fi
fi

# Check 7: .gitignore includes .env files
echo ""
echo "Checking .gitignore..."
if grep -q "\.env" .gitignore 2>/dev/null; then
    check_pass ".env* is in .gitignore"
else
    check_fail ".env files not in .gitignore!"
    check_warn "Add to .gitignore: .env*"
fi

# Check 8: Contracts compile
echo ""
echo "Checking contracts compilation..."
if forge build > /dev/null 2>&1; then
    check_pass "Contracts compile successfully"
else
    check_fail "Contracts don't compile"
    echo "  Run: forge build"
fi

# Check 9: Not using testnet key
if [ -f ".env" ] && [ -f ".env.production" ]; then
    source .env
    source .env.production
    
    if [ "$PRIVATE_KEY" = "$PRIVATE_KEY" ]; then
        check_warn "Using same private key as testnet (consider generating new one)"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks failed: ${RED}$CHECKS_FAILED${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All checks passed! Ready for production deployment.${NC}"
    echo ""
    echo "Next step: ./DEPLOY_PRODUCTION.sh"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Fix the issues above before deploying.${NC}"
    echo ""
    exit 1
fi
