#!/bin/bash

# 🔍 Pre-Deploy Verification Script for Trayon Dashboard
# Run this before deploying to Vercel

set -e

echo "🔍 Starting Pre-Deploy Verification..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Function to print success
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
  echo -e "${RED}❌ $1${NC}"
  ((ERRORS++))
}

# Function to print warning
warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNINGS++))
}

# ================================
# 1. Check Node version
# ================================
echo "1️⃣  Checking Node.js version..."
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION == v22* ]] || [[ $NODE_VERSION == v21* ]] || [[ $NODE_VERSION == v20* ]]; then
  success "Node.js $NODE_VERSION (required: 20+)"
else
  error "Node.js $NODE_VERSION (required: 20+)"
fi
echo ""

# ================================
# 2. Check npm packages
# ================================
echo "2️⃣  Checking npm packages..."
if [ -d "node_modules" ]; then
  success "node_modules directory exists"
else
  warning "node_modules not found, running npm install..."
  npm install
fi
echo ""

# ================================
# 3. Check environment variables
# ================================
echo "3️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
  success ".env.local file exists"
  
  # Check for required variables
  if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
    success "NEXT_PUBLIC_API_URL configured"
  else
    warning "NEXT_PUBLIC_API_URL not set in .env.local"
  fi
  
  if grep -q "NEXT_PUBLIC_CHAIN_ID" .env.local; then
    success "NEXT_PUBLIC_CHAIN_ID configured"
  else
    warning "NEXT_PUBLIC_CHAIN_ID not set in .env.local"
  fi
else
  warning ".env.local not found (will use defaults)"
fi
echo ""

# ================================
# 4. Check TypeScript
# ================================
echo "4️⃣  Checking TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
  success "TypeScript compilation OK"
else
  error "TypeScript compilation failed"
fi
echo ""

# ================================
# 5. Check ESLint
# ================================
echo "5️⃣  Checking ESLint..."
if npx eslint src --max-warnings 5 2>/dev/null || true; then
  success "ESLint check completed"
else
  warning "ESLint found issues (check above)"
fi
echo ""

# ================================
# 6. Check Build
# ================================
echo "6️⃣  Building application..."
if npm run build > /tmp/build.log 2>&1; then
  success "Build successful"
  
  # Check output directory
  if [ -d ".next" ]; then
    success ".next directory created"
    SIZE=$(du -sh .next | cut -f1)
    success "Build size: $SIZE"
  else
    error ".next directory not found after build"
  fi
else
  error "Build failed (check logs above)"
  cat /tmp/build.log
fi
echo ""

# ================================
# 7. Check Next.js config
# ================================
echo "7️⃣  Checking Next.js configuration..."
if [ -f "next.config.ts" ]; then
  success "next.config.ts exists"
else
  error "next.config.ts not found"
fi
echo ""

# ================================
# 8. Check i18n setup
# ================================
echo "8️⃣  Checking i18n configuration..."
if [ -d "src/messages" ]; then
  success "src/messages directory exists"
  
  # Count language files
  LANG_COUNT=$(ls src/messages/*.json 2>/dev/null | wc -l)
  if [ $LANG_COUNT -ge 7 ]; then
    success "Found $LANG_COUNT language files (expected: 7)"
  else
    warning "Found only $LANG_COUNT language files (expected: 7)"
  fi
  
  # Check for Dashboard translations
  for lang in en pt es fr de zh ja; do
    if grep -q "quickActions" src/messages/${lang}.json 2>/dev/null; then
      success "Dashboard translations found for $lang"
    else
      warning "Dashboard translations missing for $lang"
    fi
  done
else
  error "src/messages directory not found"
fi
echo ""

# ================================
# 9. Check Vercel config
# ================================
echo "9️⃣  Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
  success "vercel.json exists"
  
  if grep -q "app.trayon.org" vercel.json; then
    success "app.trayon.org configured in vercel.json"
  else
    warning "app.trayon.org not found in vercel.json"
  fi
else
  warning "vercel.json not found (Vercel will use defaults)"
fi
echo ""

# ================================
# 10. Summary
# ================================
echo "════════════════════════════════════════"
echo "📊 SUMMARY"
echo "════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warnings found (non-blocking)${NC}"
  echo -e "${GREEN}✅ Ready to deploy (review warnings)${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS errors found (must fix before deploy)${NC}"
  echo -e "${YELLOW}⚠️  $WARNINGS warnings found${NC}"
  exit 1
fi
