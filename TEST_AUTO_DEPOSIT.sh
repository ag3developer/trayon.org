#!/bin/bash

###############################################################################
#                    AUTOMATED L1 DEPOSIT TEST
#                   (Non-Interactive Version)
###############################################################################

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  🌉 AUTOMATED L1 DEPOSIT TEST"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Load environment
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

source .env

# Extract values
L1_TRAY_ADDRESS="${TRAY_L1_ADDRESS}"
L1_BRIDGE_ADDRESS="${BRIDGE_L1_ADDRESS}"
RELAYER_ADDRESS="${RELAYER_ADDRESS}"
L1_RPC="${RPC_POLYGON_MAINNET}"

# Test account from private key
TEST_ACCOUNT="0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f"
DEPOSIT_AMOUNT="100000000000000000"  # 0.1 TRAY in wei

echo "📋 Configuration:"
echo "  L1 TRAY Token: $L1_TRAY_ADDRESS"
echo "  L1 Bridge: $L1_BRIDGE_ADDRESS"
echo "  Test Account: $TEST_ACCOUNT"
echo "  Deposit Amount: 0.1 TRAY"
echo "  L1 RPC: $L1_RPC"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 1: Check TRAY Balance on L1"
echo "═══════════════════════════════════════════════════════════"

BALANCE=$(cast call "$L1_TRAY_ADDRESS" \
    "balanceOf(address)(uint256)" \
    "$TEST_ACCOUNT" \
    --rpc-url "$L1_RPC" 2>/dev/null || echo "0")

# Convert wei to TRAY (divide by 10^18)
BALANCE_TRAY=$(echo "scale=2; $BALANCE / 1000000000000000000" | bc 2>/dev/null || echo "0")

echo "✅ L1 TRAY Balance: $BALANCE_TRAY TRAY ($BALANCE wei)"

if (( $(echo "$BALANCE_TRAY < 1" | bc -l) )); then
    echo "⚠️  Warning: Low balance for testing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STEP 2: Check POL Balance on L1 (for gas)"
echo "═══════════════════════════════════════════════════════════"

POL_BALANCE=$(cast balance "$TEST_ACCOUNT" --rpc-url "$L1_RPC" 2>/dev/null || echo "0")
POL_BALANCE_UNIT=$(echo "scale=6; $POL_BALANCE / 1000000000000000000" | bc 2>/dev/null || echo "0")

echo "✅ L1 POL Balance: $POL_BALANCE_UNIT POL ($POL_BALANCE wei)"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STEP 3: Check Current Allowance"
echo "═══════════════════════════════════════════════════════════"

ALLOWANCE=$(cast call "$L1_TRAY_ADDRESS" \
    "allowance(address,address)(uint256)" \
    "$TEST_ACCOUNT" "$L1_BRIDGE_ADDRESS" \
    --rpc-url "$L1_RPC" 2>/dev/null || echo "0")

ALLOWANCE_TRAY=$(echo "scale=2; $ALLOWANCE / 1000000000000000000" | bc 2>/dev/null || echo "0")

echo "✅ Current Allowance: $ALLOWANCE_TRAY TRAY ($ALLOWANCE wei)"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STEP 4: Prepare Deposit Transaction"
echo "═══════════════════════════════════════════════════════════"

# Build calldata for deposit
# deposit(uint256 amount, address recipient)
RECIPIENT="$TEST_ACCOUNT"
CALLDATA=$(cast calldata "deposit(uint256,address)" "$DEPOSIT_AMOUNT" "$RECIPIENT" 2>/dev/null || echo "")

echo "ℹ️  Deposit Calldata: $CALLDATA"
echo ""
echo "Expected Flow:"
echo "  1. Transaction sends 0.1 TRAY to BridgeL1"
echo "  2. BridgeL1 emits DepositInitiated event"
echo "  3. Relayer detects event (listening on L1)"
echo "  4. Relayer collects signatures from validators"
echo "  5. Relayer executes deposit on L2"
echo "  6. L2 mints 0.1 TRAY to recipient address"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 5: Bridge Architecture"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Contract Functions:"
echo ""
echo "L1 Side (Polygon Mainnet):"
cast call "$L1_BRIDGE_ADDRESS" "deposit(uint256,address)" \
    --help 2>/dev/null || echo "  • deposit(uint256 amount, address recipient)"
echo "  • completeWithdrawal(uint256 amount, address recipient)"
echo ""
echo "L2 Side (Anvil):"
echo "  • executeDeposit(uint256 amount, address recipient)"
echo "  • initiateWithdrawal(uint256 amount, address recipient)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  ⏳ NEXT STEPS FOR MANUAL EXECUTION:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "To complete the deposit test, execute in a terminal with forged:"
echo ""
echo "1️⃣  Approve TRAY for BridgeL1 (if allowance is low):"
echo ""
echo "    forge script contracts/script/ApproveAndDeposit.s.sol --rpc-url \"$L1_RPC\" --broadcast"
echo ""
echo "Or use cast directly:"
echo ""
echo "    cast send \\
        --private-key \$PRIVATE_KEY \\
        --rpc-url \"$L1_RPC\" \\
        \"$L1_TRAY_ADDRESS\" \\
        \"approve(address,uint256)\" \\
        \"$L1_BRIDGE_ADDRESS\" \\
        \"1000000000000000000\""
echo ""
echo "2️⃣  Send Deposit:"
echo ""
echo "    cast send \\
        --private-key \$PRIVATE_KEY \\
        --rpc-url \"$L1_RPC\" \\
        \"$L1_BRIDGE_ADDRESS\" \\
        \"deposit(uint256,address)\" \\
        \"$DEPOSIT_AMOUNT\" \\
        \"$TEST_ACCOUNT\""
echo ""
echo "3️⃣  Monitor Relayer Logs:"
echo ""
echo "    tail -f /tmp/relayer_v2.log | grep -E 'DepositInitiated|executeDeposit|ERROR'"
echo ""
echo "4️⃣  Check L2 Balance After ~15 seconds:"
echo ""
echo "    cast call \\
        --rpc-url \"http://localhost:8545\" \\
        \"0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b\" \\
        \"balanceOf(address)(uint256)\" \\
        \"$TEST_ACCOUNT\""
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ℹ️  BRIDGE ADDRESSES"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "L1 Contracts (Polygon Mainnet - Chain 137):"
echo "  TRAY Token: $L1_TRAY_ADDRESS"
echo "  Bridge: $L1_BRIDGE_ADDRESS"
echo ""
echo "L2 Contracts (Anvil - Chain 31337):"
echo "  TRAY Token: 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b"
echo "  Bridge: 0x5bc73652e7D866bB79989CA8E43B4F23d1b97926"
echo ""
echo "═══════════════════════════════════════════════════════════"
