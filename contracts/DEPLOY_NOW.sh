#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# TRAYON BRIDGE - DEPLOY NOW SCRIPT
# ════════════════════════════════════════════════════════════════════════════
# This script guides you through the deployment process step by step
# Run this when you have MATIC and internet connection
# ════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Helper functions
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo -e "${BLUE}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

press_enter() {
    read -p "$(echo -e ${YELLOW}Press ENTER to continue...${NC})"
}

# Main deployment
main() {
    print_header "TRAYON BRIDGE - REAL DEPLOYMENT"
    
    print_section "Step 1: Verifying Setup"
    echo ""
    
    # Check .env exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Edit .env with your private key and run again!"
        exit 1
    fi
    print_success ".env file found"
    
    # Check forge
    if ! command -v forge &> /dev/null; then
        print_error "Forge not installed"
        exit 1
    fi
    print_success "Forge installed"
    
    # Load env variables
    export $(grep -v '^#' .env | xargs)
    print_success "Environment variables loaded"
    
    # Verify private key
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env"
        exit 1
    fi
    print_success "Private key found"
    
    # Get wallet address
    WALLET=$(cast wallet address --private-key "$PRIVATE_KEY" 2>/dev/null)
    print_success "Wallet: $WALLET"
    
    press_enter
    
    # ========================================================================
    print_section "Step 2: Checking Internet Connection"
    echo ""
    
    if ! cast rpc eth_chainId --rpc-url "https://rpc-mumbai.maticvigil.com" &> /dev/null; then
        print_error "Cannot connect to Polygon Amoy RPC"
        print_info "Checking internet connection..."
        sleep 2
        
        if ! cast rpc eth_chainId --rpc-url "https://rpc-mumbai.maticvigil.com" &> /dev/null; then
            print_error "Still no internet. Please check your connection and try again."
            exit 1
        fi
    fi
    print_success "Connected to Polygon Amoy (Chain ID: 80001)"
    
    press_enter
    
    # ========================================================================
    print_section "Step 3: Checking MATIC Balance"
    echo ""
    
    BALANCE=$(cast balance "$WALLET" --rpc-url "https://rpc-mumbai.maticvigil.com")
    BALANCE_MATIC=$(echo "scale=6; $BALANCE / 1000000000000000000" | bc)
    
    print_info "Your address: $WALLET"
    print_info "MATIC balance: $BALANCE_MATIC MATIC"
    
    if (( $(echo "$BALANCE_MATIC < 0.5" | bc -l) )); then
        print_warning "Balance is less than 0.5 MATIC"
        print_info "You can still deploy, but may run into gas issues"
        read -p "Continue anyway? (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            exit 0
        fi
    else
        print_success "Sufficient balance for deployment!"
    fi
    
    press_enter
    
    # ========================================================================
    print_section "Step 4: Building Contracts"
    echo ""
    
    print_info "Compiling contracts..."
    if ! forge build --sizes; then
        print_error "Build failed!"
        exit 1
    fi
    print_success "Contracts compiled successfully"
    
    press_enter
    
    # ========================================================================
    print_section "Step 5: Simulating Deployment (Dry Run)"
    echo ""
    
    print_info "Running deployment simulation (no gas costs)..."
    print_info "This will show you what will happen..."
    echo ""
    
    if forge script script/DeployBridge.s.sol:DeployBridge \
        --rpc-url "https://rpc-mumbai.maticvigil.com" \
        --private-key "$PRIVATE_KEY" \
        --broadcast false \
        -vvv 2>&1 | tee /tmp/simulation.log; then
        print_success "Simulation passed! Contracts are ready to deploy."
    else
        print_error "Simulation failed. Check the output above."
        exit 1
    fi
    
    press_enter
    
    # ========================================================================
    print_section "Step 6: FINAL CONFIRMATION"
    echo ""
    
    print_warning "╔════════════════════════════════════════════════════════════╗"
    print_warning "║         YOU ARE ABOUT TO DEPLOY FOR REAL!                  ║"
    print_warning "║                                                            ║"
    print_warning "║  Gas Cost: ~0.5 MATIC (~\$0.001 USD at testnet rates)      ║"
    print_warning "║  Network: Polygon Amoy Testnet                             ║"
    print_warning "║  Wallet: $WALLET                    ║"
    print_warning "║                                                            ║"
    print_warning "║  This CANNOT be undone!                                    ║"
    print_warning "║                                                            ║"
    print_warning "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Type 'yes' to proceed with deployment: ${NC})" FINAL_CONFIRM
    
    if [ "$FINAL_CONFIRM" != "yes" ]; then
        print_info "Deployment cancelled."
        exit 0
    fi
    
    echo ""
    
    # ========================================================================
    print_header "DEPLOYING TO POLYGON AMOY..."
    
    DEPLOY_TIME=$(date +"%Y%m%d_%H%M%S")
    LOG_FILE="deployment_${DEPLOY_TIME}.log"
    
    print_info "Deployment started at $(date)"
    print_info "Logging to: $LOG_FILE"
    echo ""
    
    if forge script script/DeployBridge.s.sol:DeployBridge \
        --rpc-url "https://rpc-mumbai.maticvigil.com" \
        --private-key "$PRIVATE_KEY" \
        --broadcast \
        -vvv 2>&1 | tee "$LOG_FILE"; then
        
        print_header "DEPLOYMENT SUCCESSFUL! 🎉"
        
        print_success "Contracts deployed to Polygon Amoy!"
        print_success "Deployment log: $LOG_FILE"
        echo ""
        
        print_section "Next Steps:"
        echo "  1. Extract contract addresses from the log above"
        echo "  2. Update /relayer/.env.local with the new addresses:"
        echo "     - BRIDGE_L1_ADDRESS"
        echo "     - BRIDGE_L2_ADDRESS"
        echo "     - TRAY_L1_ADDRESS"
        echo "     - TRAY_L2_ADDRESS"
        echo ""
        echo "  3. Restart the relayer:"
        echo "     cd /Users/josecarlosmartins/Documents/trayon.org/relayer"
        echo "     npm run build"
        echo "     npm run dev"
        echo ""
        echo "  4. Test with a real deposit transaction"
        echo ""
        
        press_enter
        
        # Extract addresses and save to file
        print_section "Extracting Contract Addresses..."
        
        TRAY_L1=$(grep -i "TRAY_L1:" "$LOG_FILE" | tail -1 | awk '{print $NF}' || echo "0x...")
        BRIDGE_L1=$(grep -i "BRIDGE_L1:" "$LOG_FILE" | tail -1 | awk '{print $NF}' || echo "0x...")
        
        if [ "$TRAY_L1" != "0x..." ] || [ "$BRIDGE_L1" != "0x..." ]; then
            cat > /tmp/deployment_addresses.txt <<EOF
════════════════════════════════════════════════════════════════════════════
TRAYON BRIDGE - DEPLOYED ADDRESSES
Deployment Date: $(date)
Network: Polygon Amoy (Chain 80001)
════════════════════════════════════════════════════════════════════════════

TRAY Token L1:     $TRAY_L1
Bridge L1:         $BRIDGE_L1

Update your relayer/.env.local with these addresses!

════════════════════════════════════════════════════════════════════════════
EOF
            cat /tmp/deployment_addresses.txt
        fi
        
    else
        print_error "DEPLOYMENT FAILED!"
        print_error "Check $LOG_FILE for details"
        echo ""
        exit 1
    fi
}

# Run main
main "$@"
