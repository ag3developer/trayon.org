#!/bin/bash

##############################################################################
#                   🚀 TRAYON LOCAL DEVELOPMENT RUNNER                      #
#                                                                            #
# This script starts all services locally for development:                  #
# - Backend API on http://localhost:8000                                    #
# - Frontend on http://localhost:3000                                       #
# - Services (Python, Relayer, Validator)                                   #
#                                                                            #
# Usage: ./RUN_LOCAL.sh [command]                                           #
# Commands: start, stop, logs, test, status                                 #
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000
PYTHON_PORT=8001
VALIDATOR_PORT=8002
RELAYER_PORT=8003

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_ROOT/.logs"
PID_DIR="$PROJECT_ROOT/.pids"

# Create necessary directories
mkdir -p "$LOG_DIR" "$PID_DIR"

##############################################################################
# FUNCTIONS
##############################################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║ $1"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    log_success "Node.js $(node --version) found"
}

check_python() {
    if ! command -v python3 &> /dev/null; then
        log_warning "Python 3 not found. Some services may not start."
        return 1
    fi
    log_success "Python $(python3 --version | cut -d' ' -f2) found"
    return 0
}

check_postgres() {
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL client not found. Using Docker Compose database."
        return 1
    fi
    log_success "PostgreSQL client found"
    return 0
}

setup_backend() {
    print_header "Setting up Backend"
    
    if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
        log_info "Installing backend dependencies..."
        cd "$PROJECT_ROOT/backend"
        npm install
        log_success "Backend dependencies installed"
    else
        log_success "Backend dependencies already installed"
    fi
    
    # Check if .env exists
    if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        log_info "Creating .env file..."
        cat > "$PROJECT_ROOT/backend/.env" << EOF
# Backend Environment Variables
NODE_ENV=development
PORT=$BACKEND_PORT
DATABASE_URL=postgresql://trayon:trayon@localhost:5432/trayon
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
L1_BRIDGE_ADDRESS=0x0000000000000000000000000000000000000000
L2_BRIDGE_ADDRESS=0x0000000000000000000000000000000000000000

# API Configuration
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
EOF
        log_success ".env created"
    fi
}

setup_frontend() {
    print_header "Setting up Frontend"
    
    if [ ! -d "$PROJECT_ROOT/web/node_modules" ]; then
        log_info "Installing frontend dependencies..."
        cd "$PROJECT_ROOT/web"
        npm install
        log_success "Frontend dependencies installed"
    else
        log_success "Frontend dependencies already installed"
    fi
    
    # Check if .env.local exists
    if [ ! -f "$PROJECT_ROOT/web/.env.local" ]; then
        log_info "Creating .env.local file..."
        cat > "$PROJECT_ROOT/web/.env.local" << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_BRIDGE_CONTRACT=0x0000000000000000000000000000000000000000
EOF
        log_success ".env.local created"
    fi
}

setup_python() {
    print_header "Setting up Python AI-Engine"
    
    if check_python; then
        if [ ! -d "$PROJECT_ROOT/services/ai-engine/venv" ]; then
            log_info "Creating Python virtual environment..."
            cd "$PROJECT_ROOT/services/ai-engine"
            python3 -m venv venv
            source venv/bin/activate
            pip install -r requirements.txt
            log_success "Python environment ready"
        else
            log_success "Python environment already exists"
        fi
        
        # Create .env if needed
        if [ ! -f "$PROJECT_ROOT/services/ai-engine/.env" ]; then
            log_info "Creating Python .env file..."
            cat > "$PROJECT_ROOT/services/ai-engine/.env" << EOF
# Python AI-Engine Environment
DATABASE_URL=postgresql://trayon:trayon@localhost:5432/trayon
REDIS_URL=redis://localhost:6379
PORT=$PYTHON_PORT
IPFS_GATEWAY=https://gateway.pinata.cloud

# Model Configuration
MODEL_NAME=bert-base-uncased
MODEL_PATH=./models
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
EOF
            log_success "Python .env created"
        fi
    fi
}

start_backend() {
    log_info "Starting Backend on http://localhost:$BACKEND_PORT..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Check if running
    if [ -f "$PID_DIR/backend.pid" ]; then
        PID=$(cat "$PID_DIR/backend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            log_warning "Backend already running (PID: $PID)"
            return 0
        fi
    fi
    
    # Start backend
    npm run dev:watch > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
    
    log_success "Backend started (PID: $BACKEND_PID)"
    log_info "Logs: tail -f $LOG_DIR/backend.log"
}

start_frontend() {
    log_info "Starting Frontend on http://localhost:$FRONTEND_PORT..."
    
    cd "$PROJECT_ROOT/web"
    
    # Check if running
    if [ -f "$PID_DIR/frontend.pid" ]; then
        PID=$(cat "$PID_DIR/frontend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            log_warning "Frontend already running (PID: $PID)"
            return 0
        fi
    fi
    
    # Start frontend
    npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    
    log_success "Frontend started (PID: $FRONTEND_PID)"
    log_info "Logs: tail -f $LOG_DIR/frontend.log"
}

start_python() {
    if ! check_python; then
        log_warning "Skipping Python services (not installed)"
        return 0
    fi
    
    log_info "Starting Python AI-Engine on http://localhost:$PYTHON_PORT..."
    
    cd "$PROJECT_ROOT/services/ai-engine"
    
    # Check if running
    if [ -f "$PID_DIR/python.pid" ]; then
        PID=$(cat "$PID_DIR/python.pid")
        if ps -p $PID > /dev/null 2>&1; then
            log_warning "Python already running (PID: $PID)"
            return 0
        fi
    fi
    
    # Activate venv and start
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port $PYTHON_PORT > "$LOG_DIR/python.log" 2>&1 &
    PYTHON_PID=$!
    echo $PYTHON_PID > "$PID_DIR/python.pid"
    
    log_success "Python AI-Engine started (PID: $PYTHON_PID)"
    log_info "Logs: tail -f $LOG_DIR/python.log"
}

start_all() {
    print_header "🚀 Starting Trayon Local Development"
    
    check_node
    check_python
    check_postgres
    
    log_info "Setting up services..."
    setup_backend
    setup_frontend
    setup_python
    
    log_info "Starting services..."
    sleep 2
    
    start_backend
    sleep 3
    
    start_frontend
    sleep 3
    
    start_python || true
    
    print_header "✅ All services started!"
    
    echo ""
    echo "Services running:"
    echo "  Backend:  http://localhost:$BACKEND_PORT"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Python:   http://localhost:$PYTHON_PORT"
    echo ""
    echo "View logs:"
    echo "  Backend:  tail -f $LOG_DIR/backend.log"
    echo "  Frontend: tail -f $LOG_DIR/frontend.log"
    echo "  Python:   tail -f $LOG_DIR/python.log"
    echo ""
    echo "Stop services: ./RUN_LOCAL.sh stop"
    echo "View status: ./RUN_LOCAL.sh status"
    echo ""
}

stop_all() {
    print_header "🛑 Stopping Trayon Services"
    
    # Stop backend
    if [ -f "$PID_DIR/backend.pid" ]; then
        PID=$(cat "$PID_DIR/backend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            log_success "Backend stopped (PID: $PID)"
        fi
        rm -f "$PID_DIR/backend.pid"
    fi
    
    # Stop frontend
    if [ -f "$PID_DIR/frontend.pid" ]; then
        PID=$(cat "$PID_DIR/frontend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            log_success "Frontend stopped (PID: $PID)"
        fi
        rm -f "$PID_DIR/frontend.pid"
    fi
    
    # Stop python
    if [ -f "$PID_DIR/python.pid" ]; then
        PID=$(cat "$PID_DIR/python.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            log_success "Python stopped (PID: $PID)"
        fi
        rm -f "$PID_DIR/python.pid"
    fi
    
    log_success "All services stopped"
}

show_status() {
    print_header "📊 Service Status"
    
    echo "Backend:"
    if [ -f "$PID_DIR/backend.pid" ]; then
        PID=$(cat "$PID_DIR/backend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            log_success "Running (PID: $PID) on port $BACKEND_PORT"
        else
            log_error "Not running (stale PID file)"
        fi
    else
        log_error "Not running"
    fi
    
    echo ""
    echo "Frontend:"
    if [ -f "$PID_DIR/frontend.pid" ]; then
        PID=$(cat "$PID_DIR/frontend.pid")
        if ps -p $PID > /dev/null 2>&1; then
            log_success "Running (PID: $PID) on port $FRONTEND_PORT"
        else
            log_error "Not running (stale PID file)"
        fi
    else
        log_error "Not running"
    fi
    
    echo ""
    echo "Python:"
    if [ -f "$PID_DIR/python.pid" ]; then
        PID=$(cat "$PID_DIR/python.pid")
        if ps -p $PID > /dev/null 2>&1; then
            log_success "Running (PID: $PID) on port $PYTHON_PORT"
        else
            log_error "Not running (stale PID file)"
        fi
    else
        log_error "Not running"
    fi
    
    echo ""
    echo "Logs directory: $LOG_DIR"
    echo "PIDs directory: $PID_DIR"
}

run_tests() {
    print_header "🧪 Running Tests"
    
    echo ""
    log_info "Backend Tests"
    cd "$PROJECT_ROOT/backend"
    npm test -- --coverage 2>&1 | tee "$LOG_DIR/backend-tests.log" || true
    
    echo ""
    log_info "Frontend Tests (when ready)"
    # cd "$PROJECT_ROOT/web"
    # npm test 2>&1 | tee "$LOG_DIR/frontend-tests.log" || true
    
    echo ""
    log_info "Python Tests (when ready)"
    # cd "$PROJECT_ROOT/services/ai-engine"
    # pytest -v --cov 2>&1 | tee "$LOG_DIR/python-tests.log" || true
    
    log_success "Tests completed. Check logs for details."
}

##############################################################################
# MAIN
##############################################################################

case "${1:-start}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_all
        ;;
    status)
        show_status
        ;;
    test)
        run_tests
        ;;
    logs)
        if [ -n "$2" ]; then
            tail -f "$LOG_DIR/$2.log"
        else
            echo "Logs available:"
            ls -la "$LOG_DIR/" || echo "No logs yet"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|test|logs [service]}"
        echo ""
        echo "Commands:"
        echo "  start       - Start all services"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  status      - Show service status"
        echo "  test        - Run all tests"
        echo "  logs [svc]  - View logs (backend, frontend, python)"
        echo ""
        exit 1
        ;;
esac
