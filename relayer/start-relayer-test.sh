#!/bin/bash

# Trayon Bridge Relayer - Test Start Script
# This script starts the relayer in test/dry-run mode

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🌉 TRAYON BRIDGE RELAYER - START TEST${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Using .env.example${NC}"
    cp .env.example .env.local
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  - Environment: .env.local (TEST MODE)"
echo "  - Log Level: debug"
echo "  - Auto Execute: disabled (dry-run)"
echo "  - Polling Interval: 12 seconds"
echo ""

echo -e "${GREEN}🚀 Starting Relayer...${NC}"
echo ""

# Start relayer with debug output
npm run dev

