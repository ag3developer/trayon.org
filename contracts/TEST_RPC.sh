#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# TEST RPC CONNECTION
# ════════════════════════════════════════════════════════════════════════════
# Testa a conexão com Polygon Amoy RPC (com ou sem Infura)
# ════════════════════════════════════════════════════════════════════════════

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
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

main() {
    print_header "TESTING RPC CONNECTION"
    
    # Load env
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        exit 1
    fi
    
    export $(grep -v '^#' .env | xargs)
    
    echo ""
    print_info "Loaded configuration from .env"
    echo ""
    
    # Test Alchemy (if key provided)
    if [ ! -z "$ALCHEMY_API_KEY" ] && [ "$ALCHEMY_API_KEY" != "YOUR_ALCHEMY_KEY_HERE" ]; then
        print_info "Testing Alchemy RPC..."
        ALCHEMY_RPC="https://polygon-amoy.g.alchemy.com/v2/$ALCHEMY_API_KEY"
        
        if timeout 10 cast rpc eth_chainId --rpc-url "$ALCHEMY_RPC" &> /dev/null; then
            CHAIN_ID=$(timeout 10 cast rpc eth_chainId --rpc-url "$ALCHEMY_RPC" 2>/dev/null)
            if [ "$CHAIN_ID" = "0x13881" ]; then
                print_success "Alchemy RPC working! (Chain ID: $CHAIN_ID)"
                echo ""
                print_success "Ready to deploy!"
                exit 0
            else
                print_error "Unexpected chain ID: $CHAIN_ID (expected 0x13881)"
            fi
        else
            print_warning "Alchemy RPC unreachable"
        fi
    else
        print_warning "No Alchemy API key configured"
    fi
    
    echo ""
    
    # Test Infura (if key provided)
    if [ ! -z "$INFURA_API_KEY" ] && [ "$INFURA_API_KEY" != "YOUR_INFURA_KEY_HERE" ]; then
        print_info "Testing Infura RPC..."
        INFURA_RPC="https://polygon-amoy.infura.io/v3/$INFURA_API_KEY"
        
        if timeout 10 cast rpc eth_chainId --rpc-url "$INFURA_RPC" &> /dev/null; then
            CHAIN_ID=$(timeout 10 cast rpc eth_chainId --rpc-url "$INFURA_RPC" 2>/dev/null)
            if [ "$CHAIN_ID" = "0x13881" ]; then
                print_success "Infura RPC working! (Chain ID: $CHAIN_ID)"
                echo ""
                print_success "Ready to deploy!"
                exit 0
            else
                print_error "Unexpected chain ID: $CHAIN_ID (expected 0x13881)"
            fi
        else
            print_warning "Infura RPC unreachable"
        fi
    fi
    
    echo ""
    
    # Test public RPC (fallback)
    print_info "Testing public RPC fallback..."
    PUBLIC_RPC="https://rpc-amoy.polygon.technology"
    
    if timeout 10 cast rpc eth_chainId --rpc-url "$PUBLIC_RPC" &> /dev/null; then
        CHAIN_ID=$(timeout 10 cast rpc eth_chainId --rpc-url "$PUBLIC_RPC" 2>/dev/null)
        if [ "$CHAIN_ID" = "0x13881" ]; then
            print_success "Public RPC working! (Chain ID: $CHAIN_ID)"
            print_warning "Note: Public RPC may be slower. Consider adding Infura key."
            echo ""
            print_success "Ready to deploy!"
            exit 0
        else
            print_error "Unexpected chain ID: $CHAIN_ID (expected 0x13881)"
        fi
    else
        print_error "Public RPC also unreachable"
        print_error "Network connectivity issue. Please check your internet."
        exit 1
    fi
}

main "$@"
