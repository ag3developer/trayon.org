#!/bin/bash

##############################################################################
# Trayon Monorepo Quick Start Script
# One-command deployment of entire stack (Docker Compose)
#
# Usage: ./MONOREPO-QUICK-START.sh [start|stop|restart|logs|clean]
##############################################################################

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose-monorepo.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running"
        print_info "Start Docker Desktop or Docker daemon and try again"
        exit 1
    fi
    print_success "Docker daemon is running"
}

# ─────────────────────────────────────────────────────────────────────────────
# DEPLOYMENT COMMANDS
# ─────────────────────────────────────────────────────────────────────────────

cmd_start() {
    print_header "🚀 Starting Trayon Monorepo Stack"
    
    check_docker
    
    # Create .env files if they don't exist
    if [ ! -f "$PROJECT_DIR/services/ai-engine/.env" ]; then
        print_warning "Creating .env from template for ai-engine"
        cp "$PROJECT_DIR/services/ai-engine/.env.example" "$PROJECT_DIR/services/ai-engine/.env"
    fi
    
    # Start services
    print_info "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    print_info "Building custom images..."
    docker-compose -f "$COMPOSE_FILE" build
    
    print_info "Starting containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    print_header "📊 Service Status"
    docker-compose -f "$COMPOSE_FILE" ps
    
    # Print endpoints
    print_header "🌐 Service Endpoints"
    print_success "Frontend:        http://localhost:3000"
    print_success "Backend API:     http://localhost:3000/api/v1"
    print_success "AI-Engine:       http://localhost:8001/api/v1"
    print_success "Prometheus:      http://localhost:9090"
    print_success "Grafana:         http://localhost:3001 (admin/admin)"
    print_success "IPFS Gateway:    http://localhost:8080"
    print_success "PostgreSQL:      localhost:5432"
    print_success "Redis:           localhost:6379"
    
    print_header "🔗 Validator Nodes"
    print_success "Validator 1 RPC: http://localhost:9001/rpc (P2P: 30301)"
    print_success "Validator 2 RPC: http://localhost:9002/rpc (P2P: 30302)"
    print_success "Validator 3 RPC: http://localhost:9003/rpc (P2P: 30303)"
    
    print_header "✅ Stack Started Successfully"
    print_info "Run './MONOREPO-QUICK-START.sh logs' to view logs"
}

cmd_stop() {
    print_header "🛑 Stopping Trayon Monorepo Stack"
    
    docker-compose -f "$COMPOSE_FILE" down
    
    print_success "Stack stopped"
}

cmd_restart() {
    print_header "🔄 Restarting Trayon Monorepo Stack"
    
    cmd_stop
    sleep 2
    cmd_start
}

cmd_logs() {
    SERVICE=${1:-""}
    
    if [ -z "$SERVICE" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100
    else
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "$SERVICE"
    fi
}

cmd_logs_ai_engine() {
    print_header "📋 AI-Engine Logs"
    docker-compose -f "$COMPOSE_FILE" logs -f --tail=50 ai-engine
}

cmd_logs_backend() {
    print_header "📋 Backend Logs"
    docker-compose -f "$COMPOSE_FILE" logs -f --tail=50 backend
}

cmd_logs_validator() {
    ID=${1:-1}
    print_header "📋 Validator-$ID Logs"
    docker-compose -f "$COMPOSE_FILE" logs -f --tail=50 "validator-$ID"
}

cmd_health() {
    print_header "🏥 Health Check"
    
    echo "AI-Engine:"
    curl -s http://localhost:8001/health | jq . || print_error "AI-Engine not responding"
    
    echo -e "\nBackend:"
    curl -s http://localhost:3000/health | jq . || print_error "Backend not responding"
    
    echo -e "\nValidator 1:"
    curl -s http://localhost:9001/health | jq . || print_error "Validator 1 not responding"
    
    echo -e "\nPostgreSQL:"
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U trayon &>/dev/null; then
        print_success "PostgreSQL is healthy"
    else
        print_error "PostgreSQL is not responding"
    fi
    
    echo -e "\nRedis:"
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping &>/dev/null; then
        print_success "Redis is healthy"
    else
        print_error "Redis is not responding"
    fi
}

cmd_test_ai_engine() {
    print_header "🧪 Testing AI-Engine"
    
    print_info "Testing health endpoint..."
    curl -s http://localhost:8001/health | jq .
    
    print_info "\nTesting ingest endpoint..."
    curl -s -X POST http://localhost:8001/api/v1/audit/ingest \
        -H "Content-Type: application/json" \
        -d '{
            "source_type": "pdf",
            "source_url": "https://example.com/report.pdf",
            "data_hash": "0xabc123",
            "priority": 5
        }' | jq .
    
    print_info "\nTesting queue status..."
    curl -s http://localhost:8001/api/v1/queue/status | jq .
}

cmd_test_backend() {
    print_header "🧪 Testing Backend API"
    
    print_info "Testing health endpoint..."
    curl -s http://localhost:3000/health | jq .
    
    print_info "\nTesting validators endpoint..."
    curl -s http://localhost:3000/api/v1/validators | jq . || print_warning "Validators table may be empty"
}

cmd_shell_postgres() {
    print_header "🐘 PostgreSQL Shell"
    docker-compose -f "$COMPOSE_FILE" exec postgres psql -U trayon -d trayon
}

cmd_shell_redis() {
    print_header "🔴 Redis CLI"
    docker-compose -f "$COMPOSE_FILE" exec redis redis-cli
}

cmd_clean() {
    print_header "🧹 Cleaning Up"
    
    print_warning "This will remove all containers, volumes, and data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing containers, networks, and volumes..."
        docker-compose -f "$COMPOSE_FILE" down -v
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

cmd_stats() {
    print_header "📈 Container Stats"
    docker-compose -f "$COMPOSE_FILE" stats --no-stream
}

cmd_ps() {
    print_header "📦 Container Status"
    docker-compose -f "$COMPOSE_FILE" ps
}

# ─────────────────────────────────────────────────────────────────────────────
# HELP
# ─────────────────────────────────────────────────────────────────────────────

cmd_help() {
    cat << EOF
${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}
${BLUE}║         Trayon Monorepo Quick Start Script                     ║${NC}
${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}

${YELLOW}USAGE:${NC}
    ./MONOREPO-QUICK-START.sh [COMMAND] [OPTIONS]

${YELLOW}COMMANDS:${NC}
    ${GREEN}start${NC}              Start all services
    ${GREEN}stop${NC}               Stop all services
    ${GREEN}restart${NC}            Restart all services
    ${GREEN}logs [service]${NC}      View logs (optional: specify service)
    ${GREEN}logs-ai${NC}             View AI-Engine logs
    ${GREEN}logs-backend${NC}        View Backend logs
    ${GREEN}logs-validator [id]${NC}  View Validator logs
    ${GREEN}health${NC}              Check health of all services
    ${GREEN}test-ai${NC}             Test AI-Engine endpoints
    ${GREEN}test-backend${NC}        Test Backend endpoints
    ${GREEN}ps${NC}                  Show container status
    ${GREEN}stats${NC}               Show container resource usage
    ${GREEN}shell-db${NC}            Open PostgreSQL shell
    ${GREEN}shell-redis${NC}         Open Redis CLI
    ${GREEN}clean${NC}               Remove all containers & volumes
    ${GREEN}help${NC}                Show this help message

${YELLOW}EXAMPLES:${NC}
    # Start the stack
    ./MONOREPO-QUICK-START.sh start

    # View logs from ai-engine service
    ./MONOREPO-QUICK-START.sh logs ai-engine

    # Test AI-Engine API
    ./MONOREPO-QUICK-START.sh test-ai

    # Check all services health
    ./MONOREPO-QUICK-START.sh health

    # Stop the stack
    ./MONOREPO-QUICK-START.sh stop

${YELLOW}SERVICE ENDPOINTS:${NC}
    Frontend:        http://localhost:3000
    Backend API:     http://localhost:3000/api/v1
    AI-Engine:       http://localhost:8001/api/v1
    Prometheus:      http://localhost:9090
    Grafana:         http://localhost:3001
    IPFS Gateway:    http://localhost:8080
    PostgreSQL:      localhost:5432
    Redis:           localhost:6379

${YELLOW}VALIDATOR NODES:${NC}
    Validator 1:     http://localhost:9001/rpc (P2P: 30301)
    Validator 2:     http://localhost:9002/rpc (P2P: 30302)
    Validator 3:     http://localhost:9003/rpc (P2P: 30303)

EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

main() {
    COMMAND=${1:-help}
    
    case "$COMMAND" in
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        restart)
            cmd_restart
            ;;
        logs)
            cmd_logs "$2"
            ;;
        logs-ai)
            cmd_logs_ai_engine
            ;;
        logs-backend)
            cmd_logs_backend
            ;;
        logs-validator)
            cmd_logs_validator "$2"
            ;;
        health)
            cmd_health
            ;;
        test-ai)
            cmd_test_ai_engine
            ;;
        test-backend)
            cmd_test_backend
            ;;
        ps)
            cmd_ps
            ;;
        stats)
            cmd_stats
            ;;
        shell-db)
            cmd_shell_postgres
            ;;
        shell-redis)
            cmd_shell_redis
            ;;
        clean)
            cmd_clean
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
