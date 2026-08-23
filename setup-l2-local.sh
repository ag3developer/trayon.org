#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# TRAYON L2 LOCAL SETUP SCRIPT
# ════════════════════════════════════════════════════════════════════════════
# 
# Sets up a complete L2 environment on Anvil with TRAY as native gas token
# 
# Usage: ./setup-l2-local.sh
#
# Requirements:
# - anvil (from foundry)
# - forge (from foundry)
# - jq (for JSON parsing)
# 
# ════════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
L2_PORT=8545
L2_CHAIN_ID=31337
ANVIL_ACCOUNTS=10
ANVIL_BALANCE=1000

# Anvil default account (first account)
ANVIL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852"
ANVIL_SEQUENCER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Contracts (deployed on Amoy)
TRAY_TOKEN="0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b"
TOKENOMICS_MANAGER="0x3BB78Ddb66f5De33463C1C4a69e605C526720B22"

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACTS_DIR="$SCRIPT_DIR/contracts"

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "  🚀 TRAYON L2 LOCAL SETUP"
echo "  Configure TRAY as native gas token on Anvil"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# STEP 1: CHECK REQUIREMENTS
# ════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}STEP 1: Checking Requirements${NC}"
echo ""

# Check anvil
if ! command -v anvil &> /dev/null; then
    echo -e "${RED}❌ anvil not found${NC}"
    echo "   Install: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi
echo -e "${GREEN}✅ anvil found${NC}"

# Check forge
if ! command -v forge &> /dev/null; then
    echo -e "${RED}❌ forge not found${NC}"
    echo "   Install: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi
echo -e "${GREEN}✅ forge found${NC}"

# Check jq
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not found${NC}"
    echo "   Install: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi
echo -e "${GREEN}✅ jq found${NC}"

echo ""

# ════════════════════════════════════════════════════════════════════════════
# STEP 2: START ANVIL
# ════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}STEP 2: Starting Anvil${NC}"
echo ""

# Kill existing anvil process if running
if lsof -Pi :$L2_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $L2_PORT already in use. Killing existing process..."
    kill -9 $(lsof -t -i:$L2_PORT) || true
    sleep 1
fi

# Start Anvil in background
echo "Starting Anvil on port $L2_PORT with chain ID $L2_CHAIN_ID..."
anvil \
  --chain-id $L2_CHAIN_ID \
  --host 0.0.0.0 \
  --port $L2_PORT \
  --accounts $ANVIL_ACCOUNTS \
  --balance $ANVIL_BALANCE \
  > /tmp/anvil.log 2>&1 &

ANVIL_PID=$!
echo -e "${GREEN}✅ Anvil started (PID: $ANVIL_PID)${NC}"
echo ""

# Wait for Anvil to start
echo "Waiting for Anvil to start..."
for i in {1..30}; do
    if curl -s http://localhost:$L2_PORT -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Anvil is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Anvil failed to start${NC}"
        echo "Log: $(cat /tmp/anvil.log | tail -20)"
        exit 1
    fi
    echo "  Attempt $i/30..."
    sleep 1
done

echo ""

# ════════════════════════════════════════════════════════════════════════════
# STEP 3: DEPLOY CONTRACTS TO ANVIL
# ════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}STEP 3: Deploying Contracts to Anvil${NC}"
echo ""

cd "$CONTRACTS_DIR"

# Export variables for forge
export PRIVATE_KEY=$ANVIL_PRIVATE_KEY
export RPC_URL="http://localhost:$L2_PORT"

echo "Deploying TokenomicsManager and TRAY to Anvil..."
DEPLOY_OUTPUT=$(forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow 2>&1)

# Extract deployed addresses
TRAY_DEPLOYED=$(echo "$DEPLOY_OUTPUT" | grep -oP "TRAY Token deployed at: \K0x[a-fA-F0-9]{40}" | head -1)
TOKENOMICS_DEPLOYED=$(echo "$DEPLOY_OUTPUT" | grep -oP "TokenomicsManager deployed at: \K0x[a-fA-F0-9]{40}" | head -1)

if [ -z "$TRAY_DEPLOYED" ] || [ -z "$TOKENOMICS_DEPLOYED" ]; then
    echo -e "${YELLOW}⚠️  Could not extract deployed addresses from output${NC}"
    echo "Using default addresses:"
    echo "  TRAY Token: $TRAY_TOKEN"
    echo "  TokenomicsManager: $TOKENOMICS_MANAGER"
else
    echo -e "${GREEN}✅ Contracts deployed to Anvil${NC}"
    echo "  TRAY Token: $TRAY_DEPLOYED"
    echo "  TokenomicsManager: $TOKENOMICS_DEPLOYED"
    TRAY_TOKEN=$TRAY_DEPLOYED
    TOKENOMICS_MANAGER=$TOKENOMICS_DEPLOYED
fi

echo ""

# ════════════════════════════════════════════════════════════════════════════
# STEP 4: ENABLE GAS TOKEN
# ════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}STEP 4: Enabling TRAY as Gas Token${NC}"
echo ""

export L2_SEQUENCER_ADDR=$ANVIL_SEQUENCER

echo "Enabling TRAY as gas token with sequencer: $ANVIL_SEQUENCER"
forge script script/SetupL2GasToken.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow 2>&1 | grep -E "TRAY|Gas Token|Sequencer|COMPLETE" || true

echo -e "${GREEN}✅ Gas token enabled${NC}"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# STEP 5: CONFIGURATION & SUMMARY
# ════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}STEP 5: Configuration Summary${NC}"
echo ""

cat > /tmp/trayon-l2-config.env << EOF
# TRAYON L2 LOCAL CONFIGURATION
# Generated: $(date)

# L2 Network
L2_RPC_URL=http://localhost:$L2_PORT
L2_CHAIN_ID=$L2_CHAIN_ID
L2_SEQUENCER_ADDR=$ANVIL_SEQUENCER

# Deployed Contracts
TRAY_TOKEN=$TRAY_TOKEN
TOKENOMICS_MANAGER=$TOKENOMICS_MANAGER

# Anvil Defaults
ANVIL_PRIVATE_KEY=$ANVIL_PRIVATE_KEY
ANVIL_SEQUENCER=$ANVIL_SEQUENCER

# Anvil Accounts (first 5)
ACCOUNT_1=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ACCOUNT_2=0x70997970C51812e339D9B73b0245ad59cc5ffe89
ACCOUNT_3=0x3C44CdDdB6a900c6671B13B87ccEaF9f9c01F616
ACCOUNT_4=0x1CBd3b2770909D4e10f157cABC84C7264073C9Be
ACCOUNT_5=0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
EOF

echo "Configuration saved to /tmp/trayon-l2-config.env"
echo ""
echo "Environment Variables:"
echo "  L2_RPC_URL:           http://localhost:$L2_PORT"
echo "  L2_CHAIN_ID:          $L2_CHAIN_ID"
echo "  L2_SEQUENCER_ADDR:    $ANVIL_SEQUENCER"
echo "  TRAY_TOKEN:           $TRAY_TOKEN"
echo "  TOKENOMICS_MANAGER:   $TOKENOMICS_MANAGER"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# STEP 6: TEST CONNECTION
# ════════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}STEP 6: Testing Connection${NC}"
echo ""

# Test chain ID
CHAIN_ID=$(cast chain-id --rpc-url http://localhost:$L2_PORT)
echo "Connected to chain: $CHAIN_ID"

# Test account balance
BALANCE=$(cast balance $ANVIL_SEQUENCER --rpc-url http://localhost:$L2_PORT)
BALANCE_ETH=$(cast from-wei $BALANCE)
echo "Sequencer balance: $BALANCE_ETH ETH"

# Test TRAY contract
TRAY_SUPPLY=$(cast call $TRAY_TOKEN "totalSupply()(uint256)" --rpc-url http://localhost:$L2_PORT)
TRAY_SUPPLY_FORMATTED=$(echo "scale=0; $TRAY_SUPPLY / 10^18" | bc)
echo "TRAY total supply: ${TRAY_SUPPLY_FORMATTED} TRAY"

echo -e "${GREEN}✅ Connection verified${NC}"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# COMPLETION
# ════════════════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════════════════"
echo "  ✅ L2 SETUP COMPLETE"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo ""
echo "1. Source the configuration:"
echo "   source /tmp/trayon-l2-config.env"
echo ""
echo "2. Test TRAY balance:"
echo "   cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://localhost:$L2_PORT"
echo ""
echo "3. Stake as validator (32K TRAY minimum):"
echo "   cast send $TRAY_TOKEN \"approve(address,uint256)\" $TOKENOMICS_MANAGER 32000000000000000000000 --private-key $ANVIL_PRIVATE_KEY --rpc-url http://localhost:$L2_PORT"
echo "   cast send $TOKENOMICS_MANAGER \"stake(uint256)\" 32000000000000000000000 --private-key $ANVIL_PRIVATE_KEY --rpc-url http://localhost:$L2_PORT"
echo ""
echo "4. Test fee collection:"
echo "   cast send $TOKENOMICS_MANAGER \"collectAndDistributeFees(uint256,address)\" 100000000000000000000 $ANVIL_SEQUENCER --private-key $ANVIL_PRIVATE_KEY --rpc-url http://localhost:$L2_PORT"
echo ""
echo "5. Stop Anvil:"
echo "   kill $ANVIL_PID"
echo ""
echo "Anvil is running on port $L2_PORT"
echo "PID: $ANVIL_PID"
echo ""
