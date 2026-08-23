# 🚀 Phase 4: E2E Testing - Setup Guide

**Goal**: Preparar credenciais e fazer deployment para testnets  
**Tempo estimado**: 30-60 minutos para setup + deployment  
**Dificuldade**: Fácil (guia passo a passo)

---

## 📋 Pré-Requisitos

Antes de começar, você vai precisar de:

### 1. **Private Key de Deployment**

Você precisa de uma chave privada (private key) de uma conta que será o **owner** dos contratos.

**Opção A: Usar Conta Existente**
- Se você tem uma carteira (MetaMask, Hardhat, etc)
- Exporte a private key (NÃO COMPARTILHE!)
- Guarde em local seguro

**Opção B: Criar Nova Conta (Recomendado para Testnet)**
```bash
# Gere uma nova conta com Foundry
cast wallet new

# Saída será algo como:
# Generated a new keypair.
# Address: 0x1234...
# Private key: 0xabcd...
```

**⚠️ IMPORTANTE**: Nunca commita private keys no git!

### 2. **Relayer Manager Address**

Este é o endereço que pode chamar funções do relayer (transferir tokens, etc).

Pode ser:
- O mesmo que o deployer
- Uma conta diferente (mais seguro em produção)
- Para testnet: use a mesma por simplicidade

**Exemplo**:
```
Deployer: 0x1234567890123456789012345678901234567890
Relayer Manager: 0x1234567890123456789012345678901234567890  (ou diferente)
```

### 3. **Gas Tokens nos Testnets**

Você precisa de tokens nativos para pagar gas:

**Polygon Amoy (L1)**
- Faucet: https://faucet.polygon.technology/
- Você vai receber: MATIC tokens
- Quanto: ~0.5 MATIC deve ser suficiente

**Trayon Testnet (L2)**
- Contact: Trayon team for testnet tokens
- Ou use localhost:8545 se tiver Trayon local

---

## 🔧 Step 1: Preparar Arquivo .env

### 1.1 Navigate to contracts directory

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts
```

### 1.2 Copiar template

```bash
cp .env.example .env
```

### 1.3 Editar .env com suas credenciais

```bash
nano .env
# ou
vim .env
# ou abra em VS Code
```

### 1.4 Preencher com seus valores

Encontre estas linhas no .env:

```bash
# DEPLOYMENT CREDENTIALS
PRIVATE_KEY=your_private_key_here_without_0x_prefix
RELAYER_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890
```

**Substitua**:

```bash
# Exemplo com sua private key (SEM 0x prefix!)
PRIVATE_KEY=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx

# Exemplo com relayer manager
RELAYER_MANAGER_ADDRESS=0xYourAddressHere1234567890123456789012
```

### 1.5 Verificar RPC endpoints (opcional)

Por padrão, o script usa:

```bash
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
TRAYON_TESTNET_RPC=http://localhost:8545
```

Se você tem endpoints diferentes, update:

```bash
POLYGON_AMOY_RPC=https://seu-rpc-endpoint-aqui
TRAYON_TESTNET_RPC=http://seu-endpoint:porta
```

### 1.6 Validar arquivo .env

```bash
# Verifique se foi salvo corretamente
cat .env | grep -E "PRIVATE_KEY|RELAYER_MANAGER"

# Saída esperada:
# PRIVATE_KEY=abc123...
# RELAYER_MANAGER_ADDRESS=0x123...
```

✅ **Setup Completo!**

---

## 🧪 Step 2: Dry-Run Simulation (Recomendado!)

### Por que fazer dry-run?

- ✅ Testa sem gastar gas
- ✅ Verifica se tudo está configurado corretamente
- ✅ Mostra exatamente o que vai acontecer
- ✅ Seguro para testar antes de fazer de verdade

### 2.1 Rodar simulação em Polygon Amoy (L1)

```bash
./script/deploy.sh polygon_amoy simulate
```

**Esperado**: Verá logs de deployment simulado

```
=============================================================
          TRAYON BRIDGE DEPLOYMENT STARTED
=============================================================
Deployer Address:  0x1234...
Relayer Manager:   0x5678...
Chain ID:          80002
Block Number:      123456

>> Deploying to POLYGON AMOY (L1)

  [1/3] Deploying TRAY token...
       TRAY deployed at: 0xabcd...

  [2/3] Deploying BridgeL1 contract...
       BridgeL1 deployed at: 0xefgh...

  [3/3] Minting test TRAY tokens (50M)...
       Minted 50M TRAY to deployer

POLYGON AMOY (L1) DEPLOYMENT SUMMARY:
---------------------------------------
TRAY Token:  0xabcd...
BridgeL1:    0xefgh...
Owner:       0x1234...
Relayer Mgr: 0x5678...
```

### 2.2 Rodar simulação em Trayon Testnet (L2)

```bash
./script/deploy.sh trayon_testnet simulate
```

### 2.3 Rodar simulação em ambos (Recomendado!)

```bash
./script/deploy.sh all simulate
```

✅ **Se tudo passou, está tudo certo!**

---

## 🚀 Step 3: Deployment Real (Com Gas!)

### ⚠️ ANTES DE CONTINUAR

- [ ] Verificou dry-run com sucesso
- [ ] Tem gas tokens nos testnets (Polygon Amoy + Trayon)
- [ ] Quer gastar gas testnet (muito barato!)
- [ ] Confirmou que .env está correto

### 3.1 Deploy para Polygon Amoy

```bash
./script/deploy.sh polygon_amoy deploy
```

Será perguntado:

```
You are about to deploy contracts to blockchain.
This will spend gas tokens. Proceed? (yes/no)
```

Digite: `yes`

**Vai levar**: 2-5 minutos  
**Custo**: < 0.01 MATIC (muito barato!)

**Saída esperada**:
```
[✓] BridgeL1 deployed at: 0xabcd1234...
[✓] TRAY token at: 0xefgh5678...
[✓] All contracts initialized
```

### 3.2 Deploy para Trayon Testnet

```bash
./script/deploy.sh trayon_testnet deploy
```

Digite: `yes` quando perguntado

**Vai levar**: 2-5 minutos  
**Custo**: Depende do Trayon

### 3.3 Deploy para Ambos (Completo!)

```bash
./script/deploy.sh all deploy
```

Serão deployados em sequência!

---

## 📝 Step 4: Registrar Endereços Deployados

Após deployment, **IMPORTANTE**: Salve os endereços!

### 4.1 Procurar nos logs

```bash
# Ver último deployment
ls -lah logs/
cat logs/deploy_polygon_amoy_*.log
cat logs/deploy_trayon_testnet_*.log
```

### 4.2 Criar arquivo de registro

```bash
# Crie um arquivo com os endereços
cat > DEPLOYMENT_ADDRESSES.json << 'EOF'
{
  "polygon_amoy": {
    "chain_id": 80002,
    "tray_token": "0x...",
    "bridge_l1": "0x...",
    "deployed_at": "2024-08-23T10:30:00Z"
  },
  "trayon_testnet": {
    "chain_id": 7654321,
    "tray_token": "0x...",
    "bridge_l2": "0x...",
    "deployed_at": "2024-08-23T10:35:00Z"
  }
}
EOF
```

**Substitua** os `0x...` pelos endereços reais do seu deployment!

### 4.3 Verificar no Block Explorer

**Polygon Amoy**:
- Explorer: https://amoy.polygonscan.com/
- Cole seu BRIDGE_L1_ADDRESS
- Deve ver: BridgeL1 contract code

**Trayon Testnet**:
- Explorer: Depend do seu setup
- Cole seu BRIDGE_L2_ADDRESS
- Deve ver: BridgeL2 contract code

✅ **Endereços confirmados e registrados!**

---

## 🔄 Step 5: Atualizar Relayer com Endereços

Agora o relayer precisa saber os endereços dos contratos deployados!

### 5.1 Navegar para relayer

```bash
cd ../relayer
```

### 5.2 Editar .env.local

```bash
nano .env.local
# ou
vim .env.local
```

### 5.3 Atualizar com endereços reais

Encontre estas linhas:

```bash
# Polygon Amoy (L1)
BRIDGE_L1_ADDRESS=0x0000000000000000000000000000000000000001
TRAY_TOKEN_ADDRESS_L1=0x0000000000000000000000000000000000000002

# Trayon Testnet (L2)
BRIDGE_L2_ADDRESS=0x0000000000000000000000000000000000000003
TRAY_TOKEN_ADDRESS_L2=0x0000000000000000000000000000000000000004
```

**Substitua** com seus endereços reais:

```bash
# Polygon Amoy (L1)
BRIDGE_L1_ADDRESS=0xabcd1234...  # Do seu deployment
TRAY_TOKEN_ADDRESS_L1=0xefgh5678... # Do seu deployment

# Trayon Testnet (L2)
BRIDGE_L2_ADDRESS=0xijkl9012...  # Do seu deployment
TRAY_TOKEN_ADDRESS_L2=0xmnop3456... # Do seu deployment
```

### 5.4 Verificar mudanças

```bash
cat .env.local | grep -E "BRIDGE_|TRAY_"

# Deve mostrar seus endereços reais
```

✅ **Relayer configurado!**

---

## 🧬 Step 6: Iniciar Relayer

### 6.1 Instalar dependências (se necessário)

```bash
npm install
```

### 6.2 Compilar TypeScript

```bash
npm run build
```

### 6.3 Iniciar relayer em modo desenvolvimento

```bash
npm run dev
```

**Saída esperada**:

```
[INFO] Initializing RelayerCoordinator...
[INFO] Loading configuration from environment
[INFO] Configuration validated successfully
[INFO] Starting RelayerCoordinator...
[INFO] L1Listener started (polling Polygon Amoy)
[INFO] L2Listener started (polling Trayon Testnet)
[INFO] Status: All systems operational
```

### 6.4 Relayer está rodando! 🎉

- ✅ Monitorando Polygon Amoy para DepositInitiated
- ✅ Monitorando Trayon Testnet para WithdrawalInitiated
- ✅ Pronto para relayar transações

Deixe rodando no background ou em outro terminal!

---

## 🧪 Step 7: Testar o Bridge

### 7.1 Preparar conta de teste

Use a mesma conta que deployou (ou outra que tenha TRAY tokens).

### 7.2 Teste 1: Fazer um Depósito (L1)

```bash
# Approve BridgeL1 para usar seus TRAY
cast send \
  0x...TRAY_TOKEN_ADDRESS... \
  "approve(address,uint256)" \
  0x...BRIDGE_L1_ADDRESS... \
  1000000000000000000 \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key $PRIVATE_KEY

# Fazer depósito (1 TRAY)
cast send \
  0x...BRIDGE_L1_ADDRESS... \
  "deposit(uint256)" \
  1000000000000000000 \
  --rpc-url https://rpc-amoy.polygon.technology \
  --private-key $PRIVATE_KEY
```

### 7.3 Monitorar relayer

Nos logs do relayer, você deve ver:

```
[INFO] DepositInitiated event detected on L1
[INFO] Collecting signatures from validators...
[INFO] Executing completeDeposit on BridgeL2...
[INFO] Deposit completed successfully!
```

### 7.4 Verificar tokens no L2

```bash
# Verificar balance de TRAY no L2
cast call \
  0x...TRAY_TOKEN_ADDRESS_L2... \
  "balanceOf(address)" \
  0xYourAddress \
  --rpc-url http://localhost:8545
```

Deve mostrar: `1000000000000000000` (1 TRAY)

✅ **Bridge funciona end-to-end!**

---

## 📊 Checklist de Deployment

- [ ] Private key preparada
- [ ] Relayer manager address definido
- [ ] .env configurado com credenciais
- [ ] Gas tokens obtidos (Polygon Amoy + Trayon)
- [ ] Dry-run passou com sucesso
- [ ] Deployment para Polygon Amoy completado
- [ ] Deployment para Trayon Testnet completado
- [ ] Endereços registrados em DEPLOYMENT_ADDRESSES.json
- [ ] Relayer configurado com endereços
- [ ] Relayer iniciado e rodando
- [ ] Teste de depósito passou
- [ ] Bridge validado end-to-end

---

## 🆘 Troubleshooting

### "PRIVATE_KEY not found"
```bash
# Certifique-se que .env está no diretório correto
ls -la .env
cat .env | grep PRIVATE_KEY
```

### "Insufficient funds"
```bash
# Você precisa de gas tokens
# Polygon Amoy: https://faucet.polygon.technology/
# Trayon: Contate equipe
```

### "RPC endpoint not responding"
```bash
# Teste connectivity
curl https://rpc-amoy.polygon.technology

# Se falhar, use endpoint alternativo
# Altere POLYGON_AMOY_RPC em .env
```

### "Contract verification failed"
```bash
# Verifique chain ID
forge config | grep chain

# Certifique que endereço está correto
cast code 0x...BRIDGE_ADDRESS... --rpc-url <rpc>
```

---

## ✅ Próximos Passos

Após validar o bridge funciona:

1. **Stress Testing**
   - Execute múltiplos depósitos
   - Teste limites de taxa
   - Valide replay prevention

2. **Monitoring**
   - Setup alertas
   - Monitor relayer 24h
   - Log todas as transações

3. **Documentação**
   - Registre addresses
   - Documente processo
   - Prepare para mainnet

4. **Mainnet Preparation**
   - Audit contratos
   - Setup mainnet infrastructure
   - Plan go-live

---

**Status**: 🟢 Ready for Phase 4 Deployment  
**Tempo Restante**: 30-60 minutos  
**Próximo**: Phase 5 Frontend after validation

---

**Dúvidas ou problemas? Veja DEPLOY_INSTRUCTIONS.md para mais detalhes!**
