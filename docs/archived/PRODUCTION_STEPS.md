# 🚀 Production Deployment - Passo a Passo

## 📌 Resumo

Você vai deployar os contratos do Trayon Bridge para **Polygon Mainnet** com POL real.

| Item | Testnet | Produção |
|------|---------|----------|
| Rede | Polygon Amoy (80002) | Polygon Mainnet (137) |
| Token | POL de teste | POL real |
| Risco | Nenhum | ⚠️ Alto - ETH/POL real |
| Reversível | Sim | ❌ NÃO |

## 🔐 Segurança - IMPORTANTE

### ❌ Erros comuns:

1. **Usar a mesma private key de testnet**
   - ❌ ERRADO: Testnet key em produção
   - ✅ CERTO: Gera uma nova key para produção

2. **Comitar private keys no git**
   - ❌ ERRADO: `PRIVATE_KEY=0x... git add .env`
   - ✅ CERTO: `.env` no `.gitignore`

3. **Não ter fundos suficientes**
   - ❌ ERRADO: Tentar deployar com 0.01 POL
   - ✅ CERTO: Ter ~0.5 POL para segurança

## 📝 Passo 1: Prepare a Private Key de Produção

### Opção A: Gerar Nova Key (Recomendado)

```bash
# Gerar nova private key segura
cast wallet new

# Output será algo como:
# Successfully generated a new keypair.
# Address: 0x...
# Private Key: 0x...

# Salve a key em local SEGURO (não no git!)
# Exemplo: Password manager, hardware wallet, etc
```

### Opção B: Usar Hardware Wallet

Se tiver Ledger/Trezor:
1. Conecte a hardware wallet
2. Use `cast` com `--ledger` flag
3. Não precisa exposição da key

## 💰 Passo 2: Financie a Conta

### Enviar POL para a conta

```bash
# Substitua pelo seu endereço de produção
NEW_ADDRESS=0x... (do passo anterior)

# Enviar do seu MetaMask/wallet para este endereço
# Recomendação: 0.5 POL (para ter margem de segurança)

# Depois verificar:
cast balance $NEW_ADDRESS --rpc-url https://polygon.drpc.org
```

## 🔧 Passo 3: Crie `.env.production`

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Crie o arquivo (com sua private key e account)
cat > .env.production << 'EOF'
# PRODUCTION - POLYGON MAINNET
PRIVATE_KEY=0x... (sua production key com 0x prefix)
POLYGON_MAINNET_RPC=https://polygon.drpc.org
RELAYER_MANAGER_ADDRESS=0x... (seu endereço de produção)
EOF

# IMPORTANTE: Não comitar este arquivo!
# Verifique que está no .gitignore:
cat .gitignore | grep ".env.production"
```

## ✅ Passo 4: Verifique Tudo Antes

```bash
# Verificar chain ID (deve ser 137)
cast rpc eth_chainId --rpc-url https://polygon.drpc.org

# Verificar balance
cast balance 0x... --rpc-url https://polygon.drpc.org

# Verificar compilação
forge build
```

## 🚀 Passo 5: Deploy!

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Execute o script seguro de deployment
./DEPLOY_PRODUCTION.sh

# O script vai:
# 1. Carregar .env.production
# 2. Verificar balance
# 3. Verificar chain (137)
# 4. Pedir confirmação
# 5. Fazer o deploy
```

## 📊 Passo 6: Após Deploy

### Copiar Endereços

Após deploy bem-sucedido, os endereços aparecerão. Copie:

```
TRAY Token: 0x...
BridgeL1: 0x...
Owner: 0x...
```

### Verificar no PolygonScan

```
https://polygonscan.com/address/0x... (substitua pelo endereço)
```

### Atualizar DEPLOYMENT_ADDRESSES.md

```markdown
### L1 (Polygon Mainnet - Chain 137) - PRODUÇÃO

| Contract | Address |
|----------|---------|
| TRAY Token | 0x... |
| BridgeL1 | 0x... |
```

### Comitar (SEM a private key!)

```bash
git add DEPLOYMENT_ADDRESSES.md
git commit -m "📦 Production: Deploy to Polygon Mainnet"
git push
```

## 🔄 Configurar Relayer para Produção

Depois que os contratos estão em produção:

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/relayer

# Atualizar .env.local com endereços de produção
BRIDGE_L1_ADDRESS=0x... (do step anterior)
TRAY_L1_ADDRESS=0x... (do step anterior)
L1_RPC=https://polygon.drpc.org

# Recompile e restart
npm run build
npm start
```

## ⚠️ Troubleshooting

### "Insufficient balance"
- Enviar mais POL para a conta
- Verificar se a RPC é mainnet (chain 137)

### "Execution reverted"
- Verificar se não há nenhum teste rodando
- Verificar se compilação passou

### "Private key format"
- Garantir que tem `0x` prefix
- Exemplo: `0x3cfd8d...` (NOT `3cfd8d...`)

## ✅ Checklist Final

- [ ] Nova private key gerada (NÃO testnet)
- [ ] `.env.production` criado com key nova
- [ ] Account tem ~0.5 POL
- [ ] `.env.production` está no `.gitignore`
- [ ] Testnet deployment testado e funcionando
- [ ] Entendo os riscos de produção
- [ ] Chain ID verificado (137)
- [ ] Pronto para deploy!

---

**Próximo passo: Execute `./DEPLOY_PRODUCTION.sh` na pasta `/contracts`**
