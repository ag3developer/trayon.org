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
        # Load env to get API keys
        export $(grep -v '^#' .env | xargs) 2>/dev/null || true
        
        # Try Alchemy first if key available
        if [ ! -z "$ALCHEMY_API_KEY" ] && [ "$ALCHEMY_API_KEY" != "YOUR_ALCHEMY_KEY_HERE" ]; then
            if timeout 5 cast rpc eth_chainId --rpc-url "https://polygon-amoy.g.alchemy.com/v2/$ALCHEMY_API_KEY" &> /dev/null; then
                print_success "Internet connection established (via Alchemy)!"
                break
            fi
        fi
        
        # Try Infura if key available
        if [ ! -z "$INFURA_API_KEY" ] && [ "$INFURA_API_KEY" != "YOUR_INFURA_KEY_HERE" ]; then
            if timeout 5 cast rpc eth_chainId --rpc-url "https://polygon-amoy.infura.io/v3/$INFURA_API_KEY" &> /dev/null; then
                print_success "Internet connection established (via Infura)!"
                break
            fi
        fi
        
        # Fallback to public RPC
        if timeout 5 cast rpc eth_chainId --rpc-url "https://rpc-amoy.polygon.technology" &> /dev/null; then
            print_success "Internet connection established (via public RPC)!"
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
