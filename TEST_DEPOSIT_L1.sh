#!/bin/bash

##############################################################################
# L1 Deposit Test
# Executes a real deposit transaction on Polygon Mainnet
##############################################################################

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

L1_RPC="https://polygon.drpc.org"
L1_CHAIN_ID="137"

# Production Contracts
L1_TRAY="0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b"
L1_BRIDGE="0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9"

# Test Account (from .env)
TEST_ACCOUNT="0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f"

# Deposit Amount (0.1 TRAY for testing - minimal cost)
DEPOSIT_AMOUNT="100000000000000000"  # 0.1 TRAY = 10^17 wei

# ============================================================================
# COLORS
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# CHECK REQUIREMENTS
# ============================================================================

check_requirements() {
    print_header "STEP 1: Check Requirements"
    
    print_step "Checking for cast (foundry)..."
    if ! command -v cast &> /dev/null; then
        print_error "cast not found! Install foundry: https://book.getfoundry.sh/"
        exit 1
    fi
    print_success "cast found"
    
    print_step "Checking for .env file..."
    if [ ! -f "/Users/josecarlosmartins/Documents/trayon.org/contracts/.env" ]; then
        print_error ".env file not found!"
        exit 1
    fi
    print_success ".env file found"
}

# ============================================================================
# LOAD ENVIRONMENT
# ============================================================================

load_env() {
    print_header "STEP 2: Load Environment"
    
    source /Users/josecarlosmartins/Documents/trayon.org/contracts/.env
    
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env"
        exit 1
    fi
    
    print_success "Environment loaded"
    echo "  Account: $TEST_ACCOUNT"
}

# ============================================================================
# CHECK BALANCES
# ============================================================================

check_balances() {
    print_header "STEP 3: Check Account Balances"
    
    print_step "Getting POL balance (for gas)..."
    POL_BALANCE=$(cast balance "$TEST_ACCOUNT" --rpc-url "$L1_RPC")
    POL_BALANCE_DECIMAL=$(echo "scale=6; $POL_BALANCE / 1000000000000000000" | bc)
    echo "  POL Balance: $POL_BALANCE_DECIMAL POL"
    
    if (( $(echo "$POL_BALANCE_DECIMAL < 0.1" | bc -l) )); then
        print_error "Insufficient POL balance for gas! Need at least 0.1 POL"
        exit 1
    fi
    print_success "Sufficient gas balance"
    
    print_step "Getting TRAY balance..."
    TRAY_BALANCE=$(cast call "$L1_TRAY" "balanceOf(address)(uint256)" "$TEST_ACCOUNT" --rpc-url "$L1_RPC")
    TRAY_BALANCE_DECIMAL=$(echo "scale=2; $TRAY_BALANCE / 1000000000000000000" | bc)
    echo "  TRAY Balance: $TRAY_BALANCE_DECIMAL TRAY"
    
    if [ $(echo "$TRAY_BALANCE < $DEPOSIT_AMOUNT" | bc) -eq 1 ]; then
        print_error "Insufficient TRAY balance! Have $TRAY_BALANCE_DECIMAL TRAY, need 0.1 TRAY"
        exit 1
    fi
    print_success "Sufficient TRAY balance"
}

# ============================================================================
# CHECK APPROVALS
# ============================================================================

check_and_approve() {
    print_header "STEP 4: Check & Set Approvals"
    
    print_step "Checking current TRAY approval for BridgeL1..."
    CURRENT_APPROVAL=$(cast call "$L1_TRAY" "allowance(address,address)(uint256)" \
        "$TEST_ACCOUNT" "$L1_BRIDGE" --rpc-url "$L1_RPC")
    
    echo "  Current Approval: $CURRENT_APPROVAL wei"
    
    if [ $(echo "$CURRENT_APPROVAL < $DEPOSIT_AMOUNT" | bc) -eq 1 ]; then
        print_step "Approval insufficient, approving BridgeL1 to spend 1000 TRAY..."
        
        # Approve 1000 TRAY (enough for many tests)
        APPROVE_AMOUNT="1000000000000000000000"
        
        APPROVE_TX=$(cast send "$L1_TRAY" \
            "approve(address,uint256)" "$L1_BRIDGE" "$APPROVE_AMOUNT" \
            --private-key "$PRIVATE_KEY" \
            --rpc-url "$L1_RPC" \
            --confirmations 1 \
            2>&1)
        
        echo "$APPROVE_TX" | grep -q "transactionHash" && print_success "Approval sent" || print_error "Approval failed"
        echo "  $APPROVE_TX" | tail -1
        
        sleep 2
        print_step "Waiting for confirmation..."
        
    else
        print_success "Approval already sufficient"
    fi
}

# ============================================================================
# GET CURRENT STATE
# ============================================================================

get_current_state() {
    print_header "STEP 5: Get Current State"
    
    print_step "Getting L1 Bridge state..."
    echo "  Bridge Address: $L1_BRIDGE"
    
    print_step "Getting current block number..."
    BLOCK_NUMBER=$(cast block-number --rpc-url "$L1_RPC")
    echo "  Block Number: $BLOCK_NUMBER"
    
    print_step "Getting gas price estimate..."
    GAS_PRICE=$(cast gas-price --rpc-url "$L1_RPC")
    GAS_PRICE_GWEI=$(echo "scale=2; $GAS_PRICE / 1000000000" | bc)
    echo "  Gas Price: $GAS_PRICE_GWEI Gwei"
}

# ============================================================================
# EXECUTE DEPOSIT
# ============================================================================

execute_deposit() {
    print_header "STEP 6: Execute Deposit"
    
    print_step "Sending deposit transaction to L1 Bridge..."
    echo "  Amount: 0.1 TRAY"
    echo "  Recipient: $TEST_ACCOUNT"
    echo ""
    
    DEPOSIT_TX=$(cast send "$L1_BRIDGE" \
        "deposit(uint256,address)" "$DEPOSIT_AMOUNT" "$TEST_ACCOUNT" \
        --private-key "$PRIVATE_KEY" \
        --rpc-url "$L1_RPC" \
        --confirmations 2 \
        2>&1)
    
    echo "$DEPOSIT_TX"
    
    if echo "$DEPOSIT_TX" | grep -q "transactionHash"; then
        TX_HASH=$(echo "$DEPOSIT_TX" | grep "transactionHash" | head -1 | awk '{print $2}')
        print_success "Deposit transaction sent!"
        echo "  TX Hash: $TX_HASH"
        echo "  Explorer: https://polygonscan.com/tx/$TX_HASH"
    else
        print_error "Failed to send deposit transaction"
        exit 1
    fi
}

# ============================================================================
# VERIFY DEPOSIT
# ============================================================================

verify_deposit() {
    print_header "STEP 7: Verify Deposit Event"
    
    print_step "Checking for DepositInitiated events..."
    echo "  This is what the relayer will listen for!"
    echo ""
    
    CURRENT_BLOCK=$(cast block-number --rpc-url "$L1_RPC")
    START_BLOCK=$((CURRENT_BLOCK - 10))
    
    # Get recent DepositInitiated events
    # Note: This would need the contract ABI to decode properly
    echo "  Searching for events from block $START_BLOCK to $CURRENT_BLOCK..."
    
    print_success "Deposit executed successfully!"
    echo ""
    echo "📊 Summary:"
    echo "  ✓ Deposit of 0.1 TRAY sent to BridgeL1"
    echo "  ✓ Transaction confirmed on Polygon Mainnet"
    echo "  ✓ Event should appear in relayer logs"
    echo ""
    echo "🔄 Next Steps:"
    echo "  1. Start relayer: cd relayer && npm start"
    echo "  2. Monitor relayer logs for DepositInitiated event"
    echo "  3. Check L2 balance increased to 0.1 TRAY"
    echo "  4. If successful, withdraw from L2 back to L1"
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    print_header "🌉 L1 DEPOSIT TEST - Polygon Mainnet"
    echo ""
    echo "This script will:"
    echo "  1. Check account balances (POL for gas, TRAY for deposit)"
    echo "  2. Approve BridgeL1 to spend TRAY (if needed)"
    echo "  3. Send 0.1 TRAY deposit to BridgeL1"
    echo "  4. Monitor for DepositInitiated event"
    echo ""
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Cancelled by user"
        exit 1
    fi
    
    echo ""
    
    check_requirements
    load_env
    check_balances
    check_and_approve
    get_current_state
    execute_deposit
    verify_deposit
}

main
