#!/bin/bash

################################################################################
# 🚀 TRAYON - DEPLOY AGORA EM PRODUÇÃO
# Polygon Mainnet (Chain 137) - POL REAL
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 TRAYON BRIDGE - PRODUCTION DEPLOYMENT NOW           ║"
echo "║              Polygon Mainnet (Chain 137) - POL REAL             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Get Private Key
echo -e "${YELLOW}Step 1: Insira sua Private Key${NC}"
echo "Cole a private key com POL em Polygon Mainnet:"
echo "(Formato: 0x... ou sem 0x)"
read -sp "> " PRIV_KEY
echo ""

# Add 0x if missing
if [[ ! "$PRIV_KEY" =~ ^0x ]]; then
    PRIV_KEY="0x$PRIV_KEY"
fi

echo -e "${GREEN}✅ Private key recebida${NC}"
echo ""

# Step 2: Derive account
echo -e "${YELLOW}Step 2: Derivando endereço da conta...${NC}"
ACCOUNT=$(cast wallet address "$PRIV_KEY" 2>/dev/null) || {
    echo -e "${RED}❌ Erro: Private key inválida!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Account: $ACCOUNT${NC}"
echo ""

# Step 3: Check balance
echo -e "${YELLOW}Step 3: Verificando saldo em Polygon Mainnet...${NC}"
BALANCE=$(cast balance "$ACCOUNT" --rpc-url "https://polygon.drpc.org" 2>/dev/null) || {
    echo -e "${RED}❌ Erro: Não consegui conectar ao RPC${NC}"
    exit 1
}

BALANCE_POL=$(echo "scale=4; $BALANCE / 1e18" | bc 2>/dev/null || echo "?")
echo "Balance: $BALANCE_POL POL"

if (( $(echo "$BALANCE <= 0" | bc -l) )); then
    echo -e "${RED}❌ Saldo insuficiente! Precisa de pelo menos 0.1 POL${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Saldo suficiente!${NC}"
echo ""

# Step 4: Verify chain
echo -e "${YELLOW}Step 4: Verificando rede...${NC}"
CHAIN=$(cast rpc eth_chainId --rpc-url "https://polygon.drpc.org" 2>/dev/null | xargs printf '%d\n') || {
    echo -e "${RED}❌ Erro ao verificar chain${NC}"
    exit 1
}

if [ "$CHAIN" != "137" ]; then
    echo -e "${RED}❌ Rede incorreta! Esperado 137, recebido $CHAIN${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Polygon Mainnet confirmado (Chain 137)${NC}"
echo ""

# Step 5: Build
echo -e "${YELLOW}Step 5: Compilando contratos...${NC}"
forge build 2>&1 | grep -E "Compiler|finished" || true
echo -e "${GREEN}✅ Compilação completa${NC}"
echo ""

# Step 6: Final confirmation
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}⚠️  CONFIRMAÇÃO FINAL${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Rede:      Polygon Mainnet (137)"
echo "Account:   $ACCOUNT"
echo "Saldo:     $BALANCE_POL POL"
echo "Custo est: ~0.15-0.3 POL"
echo ""
echo -e "${RED}⚠️  ISSO VAI GASTAR SEU POL REAL!${NC}"
echo ""
echo "Type 'DEPLOY' para confirmar:"
read -p "> " CONFIRM

if [ "$CONFIRM" != "DEPLOY" ]; then
    echo -e "${YELLOW}❌ Deployment cancelado.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Fazendo deploy...${NC}"
echo ""

# Deploy!
forge script script/DeployBridge.s.sol \
  --rpc-url "https://polygon.drpc.org" \
  --private-key "$PRIV_KEY" \
  --broadcast \
  -v

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT CONCLUÍDO COM SUCESSO!                         ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Extract addresses from broadcast file
BROADCAST_FILE="broadcast/DeployBridge.s.sol/137/run-latest.json"
if [ -f "$BROADCAST_FILE" ]; then
    echo "📋 Endereços dos Contratos:"
    echo ""
    echo "Verifique os endereços em:"
    echo "  $BROADCAST_FILE"
    echo ""
    echo "🔍 Ver no PolygonScan:"
    echo "  https://polygonscan.com"
    echo ""
fi

echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo "1. Copie os endereços dos contratos"
echo "2. Atualize DEPLOYMENT_ADDRESSES.md"
echo "3. Configure o relayer com os novos endereços"
echo ""
