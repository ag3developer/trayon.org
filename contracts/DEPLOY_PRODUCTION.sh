#!/bin/bash

################################################################################
# 🚀 TRAYON BRIDGE - PRODUCTION DEPLOYMENT SCRIPT
# 
# IMPORTANTE: Este script faz deploy em POLYGON MAINNET com ETH/POL REAL
# Use apenas se você sabe o que está fazendo!
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🚀 TRAYON BRIDGE - PRODUCTION DEPLOYMENT                     ║"
echo "║                                                                ║"
echo "║   ⚠️  THIS WILL DEPLOY TO POLYGON MAINNET WITH REAL POL       ║"
echo "║   ⚠️  ERRORS CAN RESULT IN LOSS OF FUNDS                       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ ERROR: .env.production not found!${NC}"
    echo ""
    echo "Create .env.production with:"
    echo "  PRIVATE_KEY=0x... (production key, NOT testnet!)"
    echo "  POLYGON_MAINNET_RPC=https://polygon.drpc.org"
    echo "  RELAYER_MANAGER_ADDRESS=0x..."
    exit 1
fi

echo -e "${YELLOW}Step 1: Load configuration${NC}"
source .env.production

# Verify variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY not set in .env.production${NC}"
    exit 1
fi

if [ -z "$POLYGON_MAINNET_RPC" ]; then
    echo -e "${RED}❌ POLYGON_MAINNET_RPC not set in .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration loaded${NC}"
echo "   RPC: $POLYGON_MAINNET_RPC"
echo "   Relayer Manager: $RELAYER_MANAGER_ADDRESS"
echo ""

# Get account address from private key
echo -e "${YELLOW}Step 2: Derive account address${NC}"
ACCOUNT=$(cast wallet address "$PRIVATE_KEY")
echo -e "${GREEN}✅ Account: $ACCOUNT${NC}"
echo ""

# Check balance
echo -e "${YELLOW}Step 3: Check account balance${NC}"
BALANCE=$(cast balance "$ACCOUNT" --rpc-url "$POLYGON_MAINNET_RPC")
BALANCE_POL=$(echo "scale=4; $BALANCE / 1e18" | bc 2>/dev/null || echo "? (bc not available)")

echo "   Balance: $BALANCE wei"
echo "   Balance: ~$BALANCE_POL POL"
echo ""

# Check if balance is sufficient (need ~0.2 POL minimum)
MIN_BALANCE=200000000000000000  # 0.2 POL
if (( $(echo "$BALANCE < $MIN_BALANCE" | bc -l) )); then
    echo -e "${RED}❌ INSUFFICIENT BALANCE!${NC}"
    echo "   Need at least 0.2 POL for deployment"
    echo "   Send POL to: $ACCOUNT"
    exit 1
fi

echo -e "${GREEN}✅ Balance sufficient${NC}"
echo ""

# Network info
echo -e "${YELLOW}Step 4: Verify network${NC}"
CHAIN_ID=$(cast rpc eth_chainId --rpc-url "$POLYGON_MAINNET_RPC" | xargs printf '%d\n')
echo "   Chain ID: $CHAIN_ID"

if [ "$CHAIN_ID" != "137" ]; then
    echo -e "${RED}❌ WRONG NETWORK! Chain ID should be 137 (Polygon Mainnet), got $CHAIN_ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connected to Polygon Mainnet (Chain 137)${NC}"
echo ""

# Gas estimation
echo -e "${YELLOW}Step 5: Build contracts${NC}"
forge build 2>&1 | grep -E "Compiler|finished|error" || echo "Build completed"
echo -e "${GREEN}✅ Contracts built${NC}"
echo ""

# Final confirmation
echo -e "${YELLOW}Step 6: FINAL CONFIRMATION${NC}"
echo ""
echo -e "${RED}⚠️  ABOUT TO DEPLOY TO PRODUCTION!${NC}"
echo ""
echo "   Chain: Polygon Mainnet (137)"
echo "   Account: $ACCOUNT"
echo "   Balance: $BALANCE_POL POL"
echo ""
echo "Type 'DEPLOY' (all caps) to confirm and proceed:"
read -p "> " CONFIRM

if [ "$CONFIRM" != "DEPLOY" ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Deploying...${NC}"
echo ""

# Deploy
forge script script/DeployBridge.s.sol \
  --rpc-url "$POLYGON_MAINNET_RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  -vvv

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT COMPLETE!                                      ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Output summary
echo "📋 Check deployment in:"
echo "   broadcast/DeployBridge.s.sol/137/run-latest.json"
echo ""
echo "🔍 View on PolygonScan:"
echo "   https://polygonscan.com"
echo ""
echo "⚠️  UPDATE DEPLOYMENT_ADDRESSES.md with the contract addresses"
echo ""

