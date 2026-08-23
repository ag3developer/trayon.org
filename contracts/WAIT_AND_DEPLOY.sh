#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# WAIT FOR INTERNET AND DEPLOY
# ════════════════════════════════════════════════════════════════════════════
# This script waits for internet connection, then runs deployment
# ════════════════════════════════════════════════════════════════════════════

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_status() {
    echo -e "${YELLOW}⏳ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

main() {
    print_header "TRAYON BRIDGE - WAITING FOR INTERNET"
    
    print_status "Waiting for internet connection..."
    echo ""
    
    ATTEMPT=1
    MAX_ATTEMPTS=600  # 10 minutes (60 seconds per attempt, 600 attempts)
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        if timeout 5 cast rpc eth_chainId --rpc-url "https://rpc-amoy.polygon.technology" &> /dev/null || \
           timeout 5 cast rpc eth_chainId --rpc-url "https://rpc-mumbai.maticvigil.com" &> /dev/null; then
            print_success "Internet connection established!"
            break
        fi
        
        if [ $((ATTEMPT % 10)) -eq 0 ]; then
            ELAPSED=$((ATTEMPT))
            print_status "Still waiting... ($ELAPSED seconds elapsed)"
        fi
        
        sleep 1
        ((ATTEMPT++))
    done
    
    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Timeout waiting for internet (10 minutes)${NC}"
        exit 1
    fi
    
    echo ""
    print_success "Ready to deploy!"
    echo ""
    
    # Run the deployment script
    ./DEPLOY_NOW.sh
}

main "$@"
