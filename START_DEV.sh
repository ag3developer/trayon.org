#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ 🚀 TRAYON LOCAL DEVELOPMENT STARTUP                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kill any existing processes
echo "Cleaning up old processes..."
killall -9 npm ts-node-dev node 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p .logs

# Start Backend
echo -e "${YELLOW}Starting Backend on localhost:8000...${NC}"
cd backend
npm run dev:watch > ../.logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.pids/backend.pid
echo -e "${GREEN}✅ Backend PID: $BACKEND_PID${NC}"
echo ""
cd ..

# Wait for backend to start
sleep 5

# Start Frontend
echo -e "${YELLOW}Starting Frontend on localhost:3000...${NC}"
cd web
npm run dev > ../.logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../.pids/frontend.pid
echo -e "${GREEN}✅ Frontend PID: $FRONTEND_PID${NC}"
echo ""
cd ..

# Display status
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ ✅ SERVICES STARTED                                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Logs:"
echo "  tail -f .logs/backend.log"
echo "  tail -f .logs/frontend.log"
echo ""
echo "Stop all: pkill -f 'npm run dev'"
echo ""

# Keep script running
wait
