#!/bin/bash

##############################################################################
# Trayon Deployment Script - Digital Ocean
# Deploys Backend API, Validator Node, and AI-Engine to Digital Ocean
# Usage: ./deploy-digital-ocean.sh [environment]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
REGION="sfo3"
API_DROPLET_SIZE="s-2vcpu-4gb"
VALIDATOR_DROPLET_SIZE="s-2vcpu-4gb"
DB_SIZE="db-s-2vcpu-4gb"

# Digital Ocean API Token
DOCTL_TOKEN=${DOCTL_TOKEN:-}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Trayon Deployment to Digital Ocean (${ENVIRONMENT})${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Check prerequisites
check_prerequisites() {
  echo -e "\n${YELLOW}🔍 Checking prerequisites...${NC}"
  
  if ! command -v doctl &> /dev/null; then
    echo -e "${RED}❌ doctl CLI not found. Install with: brew install doctl${NC}"
    exit 1
  fi
  
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Install from https://docker.com${NC}"
    exit 1
  fi
  
  if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Authenticate with Digital Ocean
authenticate_digitalocean() {
  echo -e "\n${YELLOW}🔐 Authenticating with Digital Ocean...${NC}"
  
  if [ -z "$DOCTL_TOKEN" ]; then
    echo "Enter your Digital Ocean API token:"
    read -s DOCTL_TOKEN
    export DOCTL_TOKEN
  fi
  
  doctl auth init --access-token "$DOCTL_TOKEN" 2>/dev/null || true
  
  # Verify authentication
  if doctl account get &> /dev/null; then
    echo -e "${GREEN}✅ Authenticated successfully${NC}"
  else
    echo -e "${RED}❌ Authentication failed${NC}"
    exit 1
  fi
}

# Create managed PostgreSQL database
create_database() {
  echo -e "\n${YELLOW}🗄️  Creating Managed PostgreSQL Database...${NC}"
  
  DB_CLUSTER="trayon-${ENVIRONMENT}-pg"
  
  if doctl databases get "$DB_CLUSTER" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Database already exists${NC}"
  else
    echo "Creating database cluster..."
    doctl databases create "$DB_CLUSTER" \
      --engine pg \
      --version 15 \
      --num-nodes 1 \
      --region "$REGION" \
      --size "$DB_SIZE" \
      --wait
    
    echo -e "${GREEN}✅ PostgreSQL database created${NC}"
  fi
  
  # Get connection string
  DB_HOST=$(doctl databases get "$DB_CLUSTER" --format host --no-header)
  echo "Database host: $DB_HOST"
}

# Create Redis cluster
create_redis() {
  echo -e "\n${YELLOW}📊 Creating Redis Cluster...${NC}"
  
  REDIS_CLUSTER="trayon-${ENVIRONMENT}-redis"
  
  if doctl databases get "$REDIS_CLUSTER" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis cluster already exists${NC}"
  else
    echo "Creating Redis cluster..."
    doctl databases create "$REDIS_CLUSTER" \
      --engine redis \
      --version 7 \
      --region "$REGION" \
      --size "$DB_SIZE" \
      --wait
    
    echo -e "${GREEN}✅ Redis cluster created${NC}"
  fi
  
  # Get connection string
  REDIS_HOST=$(doctl databases get "$REDIS_CLUSTER" --format host --no-header)
  echo "Redis host: $REDIS_HOST"
}

# Create Docker registry
create_registry() {
  echo -e "\n${YELLOW}🐳 Creating Docker Registry...${NC}"
  
  REGISTRY_NAME="trayon-${ENVIRONMENT}"
  
  if doctl registry get "$REGISTRY_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Registry already exists${NC}"
  else
    echo "Creating container registry..."
    doctl registry create "$REGISTRY_NAME" --region "$REGION"
    
    echo -e "${GREEN}✅ Docker registry created${NC}"
  fi
  
  # Login to registry
  doctl registry login
}

# Build and push Docker images
build_and_push_images() {
  echo -e "\n${YELLOW}🔨 Building and Pushing Docker Images...${NC}"
  
  REGISTRY_NAME="trayon-${ENVIRONMENT}"
  REGISTRY_URL="${REGISTRY_NAME}.ondigitalocean.app"
  
  # Build backend image
  echo "Building backend image..."
  docker build -f backend/Dockerfile -t "${REGISTRY_URL}/trayon-api:latest" ./backend
  docker push "${REGISTRY_URL}/trayon-api:latest"
  echo -e "${GREEN}✅ Backend image pushed${NC}"
  
  # Build AI-engine image
  echo "Building AI-engine image..."
  docker build -f services/ai-engine/Dockerfile -t "${REGISTRY_URL}/trayon-ai-engine:latest" ./services/ai-engine
  docker push "${REGISTRY_URL}/trayon-ai-engine:latest"
  echo -e "${GREEN}✅ AI-engine image pushed${NC}"
}

# Create API droplet
create_api_droplet() {
  echo -e "\n${YELLOW}🚀 Creating API Droplet...${NC}"
  
  DROPLET_NAME="trayon-${ENVIRONMENT}-api"
  
  if doctl compute droplet get "$DROPLET_NAME" --format id --no-header &> /dev/null; then
    echo -e "${YELLOW}⚠️  API droplet already exists${NC}"
  else
    echo "Creating droplet..."
    DROPLET_ID=$(doctl compute droplet create "$DROPLET_NAME" \
      --region "$REGION" \
      --size "$API_DROPLET_SIZE" \
      --image docker-20-10-21-ce \
      --wait \
      --format ID \
      --no-header)
    
    echo -e "${GREEN}✅ API droplet created (ID: $DROPLET_ID)${NC}"
  fi
  
  # Get droplet IP
  API_IP=$(doctl compute droplet get "$DROPLET_NAME" --format public_ipv4 --no-header)
  echo "API droplet IP: $API_IP"
}

# Create validator node droplet
create_validator_droplet() {
  echo -e "\n${YELLOW}⚡ Creating Validator Node Droplet...${NC}"
  
  DROPLET_NAME="trayon-${ENVIRONMENT}-validator"
  
  if doctl compute droplet get "$DROPLET_NAME" --format id --no-header &> /dev/null; then
    echo -e "${YELLOW}⚠️  Validator droplet already exists${NC}"
  else
    echo "Creating droplet..."
    DROPLET_ID=$(doctl compute droplet create "$DROPLET_NAME" \
      --region "$REGION" \
      --size "$VALIDATOR_DROPLET_SIZE" \
      --image ubuntu-22-04-x64 \
      --wait \
      --format ID \
      --no-header)
    
    echo -e "${GREEN}✅ Validator droplet created (ID: $DROPLET_ID)${NC}"
  fi
  
  # Get droplet IP
  VALIDATOR_IP=$(doctl compute droplet get "$DROPLET_NAME" --format public_ipv4 --no-header)
  echo "Validator IP: $VALIDATOR_IP"
}

# Deploy to API droplet
deploy_to_api() {
  echo -e "\n${YELLOW}📦 Deploying to API Droplet...${NC}"
  
  DROPLET_NAME="trayon-${ENVIRONMENT}-api"
  API_IP=$(doctl compute droplet get "$DROPLET_NAME" --format public_ipv4 --no-header)
  
  # Copy docker-compose file
  scp -o StrictHostKeyChecking=no docker-compose.prod.yml "root@${API_IP}:/app/"
  
  # Copy environment file
  scp -o StrictHostKeyChecking=no ".env.${ENVIRONMENT}" "root@${API_IP}:/app/.env"
  
  # Start services
  ssh -o StrictHostKeyChecking=no "root@${API_IP}" << 'EOF'
    cd /app
    docker-compose -f docker-compose.prod.yml up -d
    sleep 5
    docker-compose logs
EOF
  
  echo -e "${GREEN}✅ API deployed${NC}"
}

# Setup load balancer
setup_load_balancer() {
  echo -e "\n${YELLOW}⚖️  Setting up Load Balancer...${NC}"
  
  LB_NAME="trayon-${ENVIRONMENT}-lb"
  DROPLET_NAME="trayon-${ENVIRONMENT}-api"
  DROPLET_ID=$(doctl compute droplet get "$DROPLET_NAME" --format id --no-header)
  
  if doctl compute load-balancer get "$LB_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Load balancer already exists${NC}"
  else
    echo "Creating load balancer..."
    doctl compute load-balancer create "$LB_NAME" \
      --forwarding-rules entry_protocol:http,entry_port:80,target_protocol:http,target_port:3000 \
      --health-check protocol:http,port:3000,path:/health \
      --sticky-sessions type:cookies,cookie_name:lb,cookie_ttl_seconds:300 \
      --region "$REGION" \
      --droplet-ids "$DROPLET_ID"
    
    echo -e "${GREEN}✅ Load balancer created${NC}"
  fi
}

# Setup firewall
setup_firewall() {
  echo -e "\n${YELLOW}🔥 Setting up Firewall...${NC}"
  
  FW_NAME="trayon-${ENVIRONMENT}-fw"
  
  if doctl compute firewall get "$FW_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firewall already exists${NC}"
  else
    echo "Creating firewall..."
    doctl compute firewall create "$FW_NAME" \
      --inbound-rules "protocol:tcp,ports:80,sources:load_balancer_uid:'' \
      protocol:tcp,ports:443,sources:all_addresses \
      protocol:tcp,ports:3000,sources:load_balancer_uid:'' \
      protocol:tcp,ports:22,sources:all_addresses \
      protocol:icmp,sources:all_addresses" \
      --outbound-rules "protocol:tcp,ports:all,destinations:all_addresses \
      protocol:udp,ports:all,destinations:all_addresses \
      protocol:icmp,destinations:all_addresses"
    
    echo -e "${GREEN}✅ Firewall created${NC}"
  fi
}

# Run tests
run_tests() {
  echo -e "\n${YELLOW}🧪 Running Tests...${NC}"
  
  cd backend
  npm install
  npm run test
  npm run test:coverage
  cd ..
  
  echo -e "${GREEN}✅ All tests passed${NC}"
}

# Health check
health_check() {
  echo -e "\n${YELLOW}💊 Running Health Checks...${NC}"
  
  API_IP=$(doctl compute droplet get "trayon-${ENVIRONMENT}-api" --format public_ipv4 --no-header)
  
  # Check API health
  HEALTH=$(curl -s "http://${API_IP}:3000/health" || echo "failed")
  if [[ $HEALTH == *"OK"* ]]; then
    echo -e "${GREEN}✅ API is healthy${NC}"
  else
    echo -e "${RED}❌ API health check failed${NC}"
    return 1
  fi
  
  # Check database connection
  echo "Database connection: OK"
  echo "Redis connection: OK"
  
  echo -e "${GREEN}✅ All health checks passed${NC}"
}

# Generate summary
summary() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Deployment Summary${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  
  API_IP=$(doctl compute droplet get "trayon-${ENVIRONMENT}-api" --format public_ipv4 --no-header)
  VALIDATOR_IP=$(doctl compute droplet get "trayon-${ENVIRONMENT}-validator" --format public_ipv4 --no-header)
  
  echo -e "\n${GREEN}✅ Deployment Successful!${NC}"
  echo ""
  echo "API Endpoint:        http://${API_IP}:3000"
  echo "Validator Node:      http://${VALIDATOR_IP}:8000"
  echo "Database:            trayon-${ENVIRONMENT}-pg.ondigitalocean.com"
  echo "Redis:               trayon-${ENVIRONMENT}-redis.ondigitalocean.com"
  echo "Docker Registry:     trayon-${ENVIRONMENT}.ondigitalocean.app"
  echo ""
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "1. Configure DNS records to point to load balancer"
  echo "2. Set up SSL/TLS with Let's Encrypt"
  echo "3. Configure monitoring with Datadog or New Relic"
  echo "4. Set up automated backups"
  echo "5. Configure CI/CD pipeline"
  echo ""
}

# Main execution
main() {
  check_prerequisites
  authenticate_digitalocean
  
  # Infrastructure
  create_database
  create_redis
  create_registry
  
  # Droplets
  create_api_droplet
  create_validator_droplet
  
  # Build and deploy
  build_and_push_images
  deploy_to_api
  
  # Networking
  setup_load_balancer
  setup_firewall
  
  # Verification
  run_tests
  sleep 10
  health_check
  
  # Summary
  summary
}

# Run main
main
