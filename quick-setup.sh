#!/bin/bash

# Trayon Quick Setup Script - Phase 1
# Sets up both validator and backend services

set -e

echo "🚀 Trayon Project - Quick Setup"
echo "================================"

PROJECT_ROOT="/Users/josecarlosmartins/Documents/trayon.org"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_warning "npm is not installed"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed. Some features may not work"
fi

print_success "Prerequisites met"

# Setup Validator
echo ""
print_step "Setting up Validator Node..."
cd validator
npm install
npm run build
cp .env.example .env
print_success "Validator setup complete"

# Setup Backend
echo ""
print_step "Setting up Backend API..."
cd ../backend
npm install
npm run build
cp .env.example .env
print_success "Backend setup complete"

# Create database
echo ""
if command -v psql &> /dev/null; then
    print_step "Setting up PostgreSQL database..."
    
    # Check if database exists
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw trayon_backend; then
        print_warning "Database 'trayon_backend' already exists, skipping creation"
    else
        createdb trayon_backend 2>/dev/null || true
        psql trayon_backend < src/database/schema.sql
        print_success "Database created and schema imported"
    fi
else
    print_warning "PostgreSQL not found. Skip database setup. Install PostgreSQL and run:"
    echo "    createdb trayon_backend"
    echo "    psql trayon_backend < backend/src/database/schema.sql"
fi

# Summary
echo ""
echo "================================"
print_success "Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit validator/.env"
echo "   - Edit backend/.env"
echo ""
echo "2. Start services in separate terminals:"
echo "   Terminal 1: cd $PROJECT_ROOT/backend && npm run dev:watch"
echo "   Terminal 2: cd $PROJECT_ROOT/validator && npm run dev:watch"
echo ""
echo "3. Test the services:"
echo "   curl http://localhost:3000/health"
echo "   curl http://localhost:3000/api/v1/bridge/status"
echo ""
echo "📚 Documentation:"
echo "   - Setup: $PROJECT_ROOT/SETUP-INSTRUCTIONS.md"
echo "   - Infrastructure: $PROJECT_ROOT/INFRASTRUCTURE-STATUS.md"
echo "   - Phase 1 Summary: $PROJECT_ROOT/PHASE-1-COMPLETED.md"
echo ""
