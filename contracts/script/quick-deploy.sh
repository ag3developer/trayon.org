#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# QUICK DEPLOYMENT SCRIPT - All-in-One
# ════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main logic
main() {
    print_header "TRAYON BRIDGE - QUICK DEPLOYMENT"
    
    # Step 1: Check internet connection
    print_info "Step 1: Checking internet connection..."
    if ! cast rpc eth_chainId --rpc-url "https://rpc-mumbai.maticvigil.com" &> /dev/null; then
        print_error "No internet connection detected!"
        print_info "Waiting for internet..."
        sleep 3
        if ! cast rpc eth_chainId --rpc-url "https://rpc-mumbai.maticvigil.com" &> /dev/null; then
            print_error "Still no internet. Please connect and try again."
            exit 1
        fi
    fi
    print_success "Internet connection OK"
    
    # Step 2: Check wallet balance
    print_info "Step 2: Checking wallet balance..."
    BALANCE=$(cast balance 0x99e519c1Dff179011541907Ea3d81232d397aaF1 \
        --rpc-url "https://rpc-mumbai.maticvigil.com" 2>/dev/null || echo "0")
    BALANCE_WEI=$(echo "$BALANCE" | tr -d ' ')
    
    if [ "$BALANCE_WEI" = "0" ] || [ -z "$BALANCE_WEI" ]; then
        print_error "No MATIC balance detected!"
        print_info "Get free testnet MATIC:"
        print_info "  Visit: https://faucet.polygon.technology/"
        print_info "  Address: 0x99e519c1Dff179011541907Ea3d81232d397aaF1"
        exit 1
    fi
    
    # Convert to MATIC (18 decimals)
    BALANCE_MATIC=$(echo "scale=6; $BALANCE_WEI / 1000000000000000000" | bc)
    print_success "Wallet balance: $BALANCE_MATIC MATIC"
    
    if (( $(echo "$BALANCE_MATIC < 0.5" | bc -l) )); then
        print_warning "Balance is low (< 0.5 MATIC). Consider getting more from faucet."
    fi
    
    # Step 3: Simulate deployment
    print_info "Step 3: Running deployment simulation..."
    if ./deploy.sh polygon_amoy simulate 2>&1 | tail -20; then
        print_success "Simulation passed!"
    else
        print_error "Simulation failed!"
        exit 1
    fi
    
    # Step 4: Ask for confirmation
    print_warning "Ready to deploy to REAL blockchain?"
    print_warning "This will spend ~0.5 MATIC in gas fees."
    read -p "Type 'yes' to continue, anything else to cancel: " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        print_info "Deployment cancelled."
        exit 0
    fi
    
    # Step 5: Deploy for real
    print_header "DEPLOYING TO POLYGON AMOY..."
    if ./deploy.sh polygon_amoy deploy 2>&1 | tee deployment.log; then
        print_success "Deployment completed!"
        
        # Extract addresses from log
        print_header "DEPLOYMENT SUMMARY"
        echo ""
        echo "Check deployment logs for contract addresses:"
        echo "  cat deployment.log"
        echo ""
        print_success "Next steps:"
        echo "  1. Copy deployed contract addresses"
        echo "  2. Update /relayer/.env.local with new addresses"
        echo "  3. Run: cd /relayer && npm run build && npm run dev"
        echo ""
    else
        print_error "Deployment failed!"
        exit 1
    fi
}

# Run main
main "$@"
