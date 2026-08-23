# 🚀 Production Deployment - Quick Start

## 5 Passos para Deploy em Produção

### 1️⃣ Gere uma NOVA Private Key (não use testnet!)

```bash
cast wallet new
# Copie: Address e Private Key
```

### 2️⃣ Envie ~0.5 POL para essa conta

Use seu MetaMask/Wallet para enviar POL:
- **Para**: O endereço gerado acima
- **Quantidade**: 0.5 POL (ou mais)

### 3️⃣ Crie `.env.production` no `/contracts`

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

cat > .env.production << 'EOF'
PRIVATE_KEY=0x... (seu novo private key com 0x prefix)
POLYGON_MAINNET_RPC=https://polygon.drpc.org
RELAYER_MANAGER_ADDRESS=0x... (seu endereço)
EOF
```

⚠️ **IMPORTANTE**: Não comitir este arquivo!

### 4️⃣ Valide tudo

```bash
./VALIDATE_PRODUCTION.sh
```

Se tudo passar com ✅, continue.
Se houver ❌, corrija os problemas.

### 5️⃣ Deploy!

```bash
./DEPLOY_PRODUCTION.sh
```

O script vai:
- Carregar configuração
- Verificar saldo
- Pedir confirmação (digite `DEPLOY`)
- Fazer o deploy em Polygon Mainnet

## 📊 Após Deploy

### Copiar endereços do deploy

```
TRAY Token: 0x...
BridgeL1: 0x...
```

### Verificar no PolygonScan

```
https://polygonscan.com/address/0x... (cole o endereço)
```

### Atualizar DEPLOYMENT_ADDRESSES.md

```bash
# Adicione a seção de Produção com os endereços
# Comitar (sem .env.production!)
git add DEPLOYMENT_ADDRESSES.md
git commit -m "Production: Deploy to Polygon Mainnet"
git push
```

## ⚠️ Checklist Segurança

- [ ] Nova private key gerada (✅ gerar new, ❌ não usar testnet)
- [ ] .env.production não está no git
- [ ] Account tem ~0.5 POL
- [ ] Validação passou (./VALIDATE_PRODUCTION.sh)
- [ ] Pronto!

## 💡 Dúvidas?

Veja:
- `PRODUCTION_STEPS.md` - Guia completo passo a passo
- `PRODUCTION_DEPLOYMENT.md` - Notas de segurança detalhadas

## 🎯 Próximos Passos

1. **Gerar key**: `cast wallet new`
2. **Validar**: `./VALIDATE_PRODUCTION.sh`
3. **Deploy**: `./DEPLOY_PRODUCTION.sh`
4. **Verificar**: https://polygonscan.com

**Boa sorte! 🚀**
