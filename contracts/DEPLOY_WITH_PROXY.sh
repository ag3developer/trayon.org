#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# TRAYON BRIDGE - DEPLOYMENT WITH DNS/PROXY BYPASS
# ════════════════════════════════════════════════════════════════════════════
# Se os RPC endpoints estão bloqueados/DNS não resolve, tenta contornar
# usando VPN, proxy, ou resolvendo IP manualmente
# ════════════════════════════════════════════════════════════════════════════

set -e

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
    print_header "TRAYON BRIDGE - DEPLOYMENT WITH PROXY/VPN SUPPORT"
    
    cd "$(dirname "$0")" || exit 1
    
    # Load env
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        exit 1
    fi
    
    export $(grep -v '^#' .env | xargs)
    
    echo ""
    print_info "Network Connectivity Options:"
    echo ""
    echo "  1) Direct RPC (default - requires internet access to RPC endpoints)"
    echo "  2) Via VPN (if you have VPN active)"
    echo "  3) Via HTTP Proxy (if configured)"
    echo "  4) Using public DNS (Cloudflare, Google)"
    echo "  5) Skip network check and deploy locally"
    echo ""
    read -p "Choose option (1-5) [default: 1]: " network_option
    network_option=${network_option:-1}
    
    case $network_option in
        1)
            print_info "Using direct RPC connection..."
            deploy_direct
            ;;
        2)
            print_info "Using VPN connection..."
            deploy_with_vpn
            ;;
        3)
            print_info "Using HTTP proxy..."
            deploy_with_proxy
            ;;
        4)
            print_info "Using public DNS..."
            deploy_with_dns
            ;;
        5)
            print_info "Skipping network check (local deploy only)..."
            deploy_local_only
            ;;
        *)
            print_error "Invalid option!"
            exit 1
            ;;
    esac
}

deploy_direct() {
    print_info "Testing direct RPC connection..."
    
    # Test Alchemy
    if [ ! -z "$ALCHEMY_API_KEY" ] && [ "$ALCHEMY_API_KEY" != "YOUR_ALCHEMY_KEY_HERE" ]; then
        RPC_URL="https://polygon-amoy.g.alchemy.com/v2/$ALCHEMY_API_KEY"
        print_info "Testing Alchemy RPC..."
        if timeout 10 cast rpc eth_chainId --rpc-url "$RPC_URL" &> /dev/null; then
            print_success "Alchemy RPC connected!"
            execute_deployment "$RPC_URL"
            return 0
        fi
    fi
    
    # Test Infura
    if [ ! -z "$INFURA_API_KEY" ] && [ "$INFURA_API_KEY" != "YOUR_INFURA_KEY_HERE" ]; then
        RPC_URL="https://polygon-amoy.infura.io/v3/$INFURA_API_KEY"
        print_info "Testing Infura RPC..."
        if timeout 10 cast rpc eth_chainId --rpc-url "$RPC_URL" &> /dev/null; then
            print_success "Infura RPC connected!"
            execute_deployment "$RPC_URL"
            return 0
        fi
    fi
    
    # Test public RPC
    RPC_URL="https://rpc-amoy.polygon.technology"
    print_info "Testing public RPC..."
    if timeout 10 cast rpc eth_chainId --rpc-url "$RPC_URL" &> /dev/null; then
        print_success "Public RPC connected!"
        execute_deployment "$RPC_URL"
        return 0
    fi
    
    print_error "All RPC endpoints unreachable!"
    print_info "Suggestions:"
    print_info "  - Check your internet connection"
    print_info "  - Try option 2 (VPN) or option 4 (Public DNS)"
    print_info "  - Contact your ISP if RPC endpoints are blocked"
    exit 1
}

deploy_with_vpn() {
    print_warning "VPN support requires manual setup"
    print_info "Steps:"
    print_info "  1. Connect to your VPN client first"
    print_info "  2. Then run this script again, choosing option 1"
    print_info ""
    read -p "VPN connected? (y/n) " vpn_check
    if [ "$vpn_check" = "y" ]; then
        deploy_direct
    else
        print_error "Please connect to VPN first"
        exit 1
    fi
}

deploy_with_proxy() {
    print_info "HTTP Proxy Configuration"
    echo ""
    read -p "Enter proxy URL (e.g., http://proxy.example.com:8080): " proxy_url
    
    if [ -z "$proxy_url" ]; then
        print_error "Proxy URL required!"
        exit 1
    fi
    
    print_info "Testing proxy connection..."
    
    export http_proxy="$proxy_url"
    export https_proxy="$proxy_url"
    export HTTP_PROXY="$proxy_url"
    export HTTPS_PROXY="$proxy_url"
    
    if timeout 10 cast rpc eth_chainId --rpc-url "https://polygon-amoy.g.alchemy.com/v2/$ALCHEMY_API_KEY" &> /dev/null; then
        print_success "Proxy connection working!"
        deploy_direct
    else
        print_error "Proxy not working or RPC still unreachable"
        exit 1
    fi
}

deploy_with_dns() {
    print_info "Using Cloudflare DNS (1.1.1.1)"
    print_info "This requires networksetup or direct resolver configuration"
    echo ""
    
    # Try to use Cloudflare DNS
    if command -v networksetup &> /dev/null; then
        print_warning "This requires sudo to change DNS"
        read -p "Continue? (y/n) " dns_change
        if [ "$dns_change" != "y" ]; then
            exit 1
        fi
        
        # Try to find primary network device
        DEVICE=$(networksetup -listallnetworkservices | grep -v "An asterisk" | head -1)
        print_info "Using network device: $DEVICE"
        
        print_info "Changing DNS to Cloudflare..."
        sudo networksetup -setdnsservers "$DEVICE" 1.1.1.1 1.0.0.1
        
        sleep 2
        
        deploy_direct
        
        print_info "Restoring original DNS..."
        sudo networksetup -setdnsservers "$DEVICE" empty
    else
        print_warning "networksetup not available on this system"
        print_info "Try using: resolvectl or /etc/resolv.conf"
        exit 1
    fi
}

deploy_local_only() {
    print_warning "Skipping network connectivity check"
    print_warning "This will attempt deployment without verifying RPC access"
    echo ""
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        exit 1
    fi
    
    execute_deployment "https://placeholder-rpc-url"
}

execute_deployment() {
    local RPC_URL=$1
    
    print_header "EXECUTING DEPLOYMENT"
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    
    if ! command -v forge &> /dev/null; then
        print_error "Foundry (forge) not installed"
        exit 1
    fi
    print_success "✅ Foundry installed"
    
    if ! command -v cast &> /dev/null; then
        print_error "Foundry cast not available"
        exit 1
    fi
    print_success "✅ Foundry cast available"
    
    if [ ! -f ".env" ]; then
        print_error ".env not found!"
        exit 1
    fi
    print_success "✅ .env configured"
    
    WALLET=$(cast wallet address --private-key "$PRIVATE_KEY" 2>/dev/null)
    if [ -z "$WALLET" ]; then
        print_error "Could not derive wallet from PRIVATE_KEY"
        exit 1
    fi
    print_success "✅ Wallet: $WALLET"
    
    echo ""
    print_info "Building contracts..."
    forge build
    
    echo ""
    print_warning "DEPLOYMENT READY"
    print_info "Network: Polygon Amoy (Chain 80001)"
    print_info "Wallet: $WALLET"
    print_info "RPC: ${RPC_URL:0:50}..."
    echo ""
    
    read -p "Deploy now? (yes/no): " final_confirm
    if [ "$final_confirm" != "yes" ]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    print_info "🚀 Starting deployment..."
    
    forge script script/DeployBridge.s.sol \
        --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        --broadcast \
        -vvv
    
    print_success "✅ Deployment completed!"
    print_info "Check your wallet on PolygonScan for transaction details"
}

main "$@"
