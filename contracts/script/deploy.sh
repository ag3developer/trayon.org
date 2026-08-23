#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# TRAYON BRIDGE DEPLOYMENT SCRIPT
# ════════════════════════════════════════════════════════════════════════════
# This script automates the deployment of Bridge contracts to L1 and L2
# 
# Usage: ./script/deploy.sh [network] [action]
# 
# Networks: polygon_amoy (L1), trayon_testnet (L2), all
# Actions: simulate (dry-run), deploy (broadcast), verify
# 
# Examples:
#   ./script/deploy.sh polygon_amoy simulate
#   ./script/deploy.sh trayon_testnet deploy
#   ./script/deploy.sh all deploy
# ════════════════════════════════════════════════════════════════════════════

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
LOG_DIR="$PROJECT_DIR/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Network configurations
POLYGON_AMOY_RPC="${POLYGON_AMOY_RPC:-https://rpc-amoy.polygon.technology}"
TRAYON_TESTNET_RPC="${TRAYON_TESTNET_RPC:-http://localhost:8545}"

# ════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════

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

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if forge is installed
    if ! command -v forge &> /dev/null; then
        print_error "Forge not found. Please install Foundry first."
        echo "  Visit: https://book.getfoundry.sh/getting-started/installation"
        exit 1
    fi
    print_success "Forge found: $(forge --version)"
    
    # Check if .env exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error ".env file not found at $PROJECT_DIR"
        echo "  Please create .env with PRIVATE_KEY and RELAYER_MANAGER_ADDRESS"
        exit 1
    fi
    print_success ".env file found"
    
    # Load environment variables
    export $(cat "$ENV_FILE" | xargs)
    
    # Check if PRIVATE_KEY is set
    if [ -z "$PRIVATE_KEY" ]; then
        print_error "PRIVATE_KEY not set in .env file"
        exit 1
    fi
    print_success "PRIVATE_KEY loaded"
    
    # Check if RELAYER_MANAGER_ADDRESS is set
    if [ -z "$RELAYER_MANAGER_ADDRESS" ]; then
        print_error "RELAYER_MANAGER_ADDRESS not set in .env file"
        exit 1
    fi
    print_success "RELAYER_MANAGER_ADDRESS loaded: $RELAYER_MANAGER_ADDRESS"
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    print_success "Logs directory: $LOG_DIR"
}

deploy_to_network() {
    local NETWORK=$1
    local ACTION=$2
    local RPC_URL=$3
    local CHAIN_NAME=$4
    
    print_header "Deploying to $CHAIN_NAME ($NETWORK)"
    
    print_info "Network: $NETWORK"
    print_info "RPC URL: $RPC_URL"
    print_info "Action: $ACTION"
    print_info "Timestamp: $TIMESTAMP"
    echo ""
    
    # Prepare command
    local CMD="forge script script/DeployBridge.s.sol"
    CMD="$CMD --rpc-url $RPC_URL"
    CMD="$CMD --private-key $PRIVATE_KEY"
    
    if [ "$ACTION" = "deploy" ]; then
        CMD="$CMD --broadcast"
        print_warning "BROADCASTING TRANSACTIONS (This will spend gas)"
    else
        print_info "Simulating deployment (dry-run, no transactions)"
    fi
    
    CMD="$CMD -vvv"
    
    # Create log file
    local LOG_FILE="$LOG_DIR/deploy_${NETWORK}_${TIMESTAMP}.log"
    
    print_info "Logging to: $LOG_FILE"
    echo ""
    
    # Run deployment
    echo "Executing: $CMD"
    echo ""
    
    if eval "$CMD" 2>&1 | tee "$LOG_FILE"; then
        print_success "Deployment to $CHAIN_NAME completed successfully!"
        echo ""
        echo "📋 Log file: $LOG_FILE"
        return 0
    else
        print_error "Deployment to $CHAIN_NAME failed!"
        echo ""
        echo "📋 Log file: $LOG_FILE"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════════════════
# MAIN SCRIPT
# ════════════════════════════════════════════════════════════════════════════

main() {
    local NETWORK="${1:-all}"
    local ACTION="${2:-simulate}"
    
    print_header "🚀 TRAYON BRIDGE DEPLOYMENT"
    
    # Validate inputs
    if [[ ! "$NETWORK" =~ ^(polygon_amoy|trayon_testnet|all)$ ]]; then
        print_error "Invalid network: $NETWORK"
        echo "Valid networks: polygon_amoy, trayon_testnet, all"
        exit 1
    fi
    
    if [[ ! "$ACTION" =~ ^(simulate|deploy|verify)$ ]]; then
        print_error "Invalid action: $ACTION"
        echo "Valid actions: simulate (dry-run), deploy (broadcast), verify"
        exit 1
    fi
    
    # Check prerequisites
    check_prerequisites
    
    print_header "Deployment Configuration"
    echo "Network:          $NETWORK"
    echo "Action:           $ACTION"
    echo "Private Key:      ${PRIVATE_KEY:0:10}...***"
    echo "Relayer Manager:  $RELAYER_MANAGER_ADDRESS"
    echo ""
    
    # Confirm if deploying (not simulating)
    if [ "$ACTION" = "deploy" ]; then
        print_warning "You are about to deploy contracts to blockchain."
        print_warning "This will spend gas tokens. Proceed? (yes/no)"
        read -r CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            print_info "Deployment cancelled."
            exit 0
        fi
    fi
    
    # Deploy to selected networks
    local FAILED=0
    
    if [ "$NETWORK" = "polygon_amoy" ] || [ "$NETWORK" = "all" ]; then
        deploy_to_network "polygon_amoy" "$ACTION" "$POLYGON_AMOY_RPC" "Polygon Amoy (L1)" || FAILED=1
    fi
    
    if [ "$NETWORK" = "trayon_testnet" ] || [ "$NETWORK" = "all" ]; then
        deploy_to_network "trayon_testnet" "$ACTION" "$TRAYON_TESTNET_RPC" "Trayon Testnet (L2)" || FAILED=1
    fi
    
    # Final summary
    echo ""
    print_header "Deployment Summary"
    
    if [ $FAILED -eq 0 ]; then
        print_success "All deployments completed successfully!"
        echo ""
        print_info "Next steps:"
        echo "  1. Review deployment logs in $LOG_DIR"
        echo "  2. Record the deployed contract addresses"
        echo "  3. Update relayer/.env with new addresses"
        echo "  4. Restart relayer with: cd relayer && npm run dev"
    else
        print_error "Some deployments failed. Check logs for details."
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
