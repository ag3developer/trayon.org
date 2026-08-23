# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ⚠️ CRITICAL SECURITY NOTES

**NUNCA use a mesma private key de testnet em produção!**

### Recomendações de Segurança:

1. **Use uma conta SEPARADA para produção**
   - Gere uma nova private key via MetaMask, Ledger, ou Trezor
   - Use uma hardware wallet se possível
   - Mantenha a key em local seguro (NOT NO GIT)

2. **Financiamento**
   - Envie POL para o endereço de deployment ANTES de deployar
   - Estimativa de gas: ~3.5M gas = ~0.15-0.3 POL (dependendo do preço)

3. **Verificação**
   - Após deploy, verifique no PolygonScan
   - Guarde os endereços dos contratos

4. **After Deployment**
   - Configure multi-sig para propriedade (se aplicável)
   - Set rate limiting parameters
   - Pause contracts enquanto testa se necessário

## 📋 Checklist de Deployment

- [ ] Nova private key gerada (NÃO testnet key!)
- [ ] Account tem POL suficiente (~0.5 POL recomendado)
- [ ] Alchemy/RPC provider configurado para mainnet
- [ ] Contratos testados com sucesso no testnet
- [ ] Backup da private key seguro
- [ ] .env.production criado (NÃO COMITIR)
- [ ] Contracts verificados no PolygonScan após deploy

## 🔑 Setup Produção

### 1. Crie `.env.production` (NÃO COMITIR)

```bash
# PRIVATE KEY - USE UMA CONTA NOVA, NÃO TESTNET!
PRIVATE_KEY=0x... (sua production key com 0x prefix)

# RPC - Use dRPC ou Alchemy mainnet
POLYGON_MAINNET_RPC=https://polygon.drpc.org
# OU
POLYGON_MAINNET_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Relayer manager (pode ser a mesma account ou multi-sig)
RELAYER_MANAGER_ADDRESS=0x...
```

### 2. Deploy

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Carregar env
source .env.production

# Deploy com verificação
forge script script/DeployBridge.s.sol \
  --rpc-url "$POLYGON_MAINNET_RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  -vvv

# Salvar addresses
# Copiar de: broadcast/DeployBridge.s.sol/137/run-latest.json
```

## 📊 Polygon Mainnet Chain Info

- **Chain ID**: 137 (NOT 80002!)
- **Currency**: POL (formerly MATIC)
- **Block Explorer**: https://polygonscan.com
- **RPC**: https://polygon.drpc.org (free, no limits)

## ✅ Verification

Após deploy, verificar:

```bash
# Check token supply
cast call <TOKEN_ADDRESS> "totalSupply()" --rpc-url "https://polygon.drpc.org"

# Check bridge owner
cast call <BRIDGE_ADDRESS> "owner()" --rpc-url "https://polygon.drpc.org"

# View no PolygonScan
https://polygonscan.com/address/<CONTRACT_ADDRESS>
```

## 📝 Contract Addresses (Will be filled after deployment)

```
POLYGON MAINNET (137):

TRAY Token: 
BridgeL1: 
Owner: 
Relayer Manager: 
Deployed Block: 
Deployment TX: 
```

---

**After deployment, update DEPLOYMENT_ADDRESSES.md and commit only the addresses (NOT private keys)**
