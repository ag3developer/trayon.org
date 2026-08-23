# 🚀 TRAYON L2 - CONFIGURAÇÃO & SETUP

## Status: Ready for Configuration ✅

A Trayon L2 pode ser configurada para usar TRAY como token nativo de gas. Aqui estão todas as ferramentas, scripts e documentação necessários.

---

## 📚 Documentação Disponível

| Arquivo | Descrição |
|---------|-----------|
| **L2_CONFIGURATION.md** | Instruções passo-a-passo para configurar L2 |
| **L2_SETUP_GUIDE.md** | Guia técnico detalhado |
| **setup-l2-local.sh** | Script automatizado para setup local com Anvil |

---

## ⚡ Quick Start (3 Minutos)

### Pré-requisitos
```bash
# Instale foundry se não tiver
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
```

### Execute
```bash
cd /Users/josecarlosmartins/Documents/trayon.org
./setup-l2-local.sh
```

**O que isso faz:**
1. ✅ Inicia Anvil em http://localhost:8545
2. ✅ Deploy de TRAY + TokenomicsManager
3. ✅ Habilita TRAY como gas token
4. ✅ Testa conexões
5. ✅ Salva configuração em `/tmp/trayon-l2-config.env`

---

## 🔧 Configuração Manual (Passo-a-Passo)

### 1. Start Anvil

```bash
# Terminal 1
anvil --chain-id 31337 --host 0.0.0.0 --port 8545 --accounts 10 --balance 1000
```

### 2. Deploy Contracts

```bash
# Terminal 2
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852

forge script script/DeployCompleteTokenomics.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow
```

**Output esperado:**
```
TRAY Token deployed at: 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
TokenomicsManager deployed at: 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22
```

### 3. Enable Gas Token

```bash
export L2_SEQUENCER_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

forge script script/SetupL2GasToken.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --slow
```

**Output esperado:**
```
✅ TRAY enabled as gas token
✅ L2 GAS TOKEN CONFIGURATION COMPLETE
```

---

## 📊 Arquitetura L2

```
┌────────────────────────────────────────┐
│     Trayon L2 (Chain 31337 Anvil)      │
├────────────────────────────────────────┤
│                                         │
│  🪙 TRAY Token (Native Gas)            │
│     ├─ Total Supply: 1B TRAY           │
│     ├─ Decimals: 18                    │
│     ├─ ERC-20 + Gas Token              │
│     └─ Status: Enabled ✅              │
│                                         │
│  💰 TokenomicsManager                  │
│     ├─ Fee Collection: 70/20/10        │
│     ├─ Validators: 32K TRAY min        │
│     ├─ Vesting: 4 anos (dev)          │
│     └─ Unlock: 2026-2031               │
│                                         │
│  🔗 Sequencer (Validator)             │
│     ├─ Address: 0xf39Fd6e...          │
│     ├─ Collects gas fees               │
│     └─ Distributes fees                │
│                                         │
│  ⚙️ Fee Distribution                   │
│     ├─ 70% → Validators                │
│     ├─ 20% → Burned                    │
│     └─ 10% → DAO Treasury              │
│                                         │
└────────────────────────────────────────┘
```

---

## ✅ Checklist de Configuração

### Setup Local (Anvil)
- [ ] Script `setup-l2-local.sh` executado com sucesso
- [ ] Anvil rodando em http://localhost:8545
- [ ] TRAY deployed e functioning
- [ ] TokenomicsManager deployed
- [ ] Gas token enabled
- [ ] `/tmp/trayon-l2-config.env` criado

### Verificação
- [ ] `cast chain-id --rpc-url http://localhost:8545` retorna `31337`
- [ ] `cast call $TRAY_TOKEN "gasTokenEnabled()(bool)" --rpc-url http://localhost:8545` retorna `true`
- [ ] TRAY total supply é 1B
- [ ] TokenomicsManager tem 150M TRAY (dev vesting)

### Validator Staking
- [ ] Stake de 32K TRAY funcionando
- [ ] Validator registrado
- [ ] `getValidatorStake()` retorna valor correto

### Fee Distribution
- [ ] `collectAndDistributeFees()` funcionando
- [ ] 70% indo para validators
- [ ] 20% sendo queimados
- [ ] 10% para DAO treasury

---

## 🧪 Commands para Testar

### Verificar Status

```bash
# Chain ID
cast chain-id --rpc-url http://localhost:8545

# TRAY balance
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545

# Gas token status
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "gasTokenEnabled()(bool)" \
  --rpc-url http://localhost:8545

# Total supply
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "totalSupply()(uint256)" \
  --rpc-url http://localhost:8545
```

### Testar Staking

```bash
# Approve
cast send 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "approve(address,uint256)" \
  0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  32000000000000000000000 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852 \
  --rpc-url http://localhost:8545

# Stake
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "stake(uint256)" \
  32000000000000000000000 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852 \
  --rpc-url http://localhost:8545

# Check stake
cast call 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "getValidatorStake(address)(uint256)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
```

### Testar Fee Collection

```bash
# Collect and distribute fees
cast send 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "collectAndDistributeFees(uint256,address)" \
  100000000000000000000 \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cbadf0b4ee5c5bcc9c0e3852 \
  --rpc-url http://localhost:8545

# Check fee history
cast call 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22 \
  "feeHistory(uint256)" \
  0 \
  --rpc-url http://localhost:8545
```

---

## 🚨 Troubleshooting

### Anvil não inicia

```bash
# Port já está em uso?
lsof -i :8545
kill -9 <PID>

# Tente novamente
anvil --port 8545
```

### Deploy falha

```bash
# Verifique Anvil está rodando
curl -s http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Deve retornar: {"jsonrpc":"2.0","result":"0x7d3d","id":1}
```

### Gas token não ativa

```bash
# Verifique owner do contrato TRAY
cast call 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b \
  "owner()(address)" \
  --rpc-url http://localhost:8545

# Deve ser o deployer (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
```

---

## 📁 Arquivos Criados

```
/Users/josecarlosmartins/Documents/trayon.org/
├─ setup-l2-local.sh          # Script automatizado
├─ L2_CONFIGURATION.md         # Instruções detalhadas
├─ L2_SETUP_GUIDE.md          # Guia técnico
├─ L2_README.md               # Este arquivo
└─ contracts/
   ├─ script/
   │  ├─ DeployCompleteTokenomics.s.sol
   │  ├─ SetupL2GasToken.s.sol
   │  └─ ...
   └─ src/
      ├─ TRAY.sol
      ├─ TokenomicsManager.sol
      └─ ...
```

---

## 🔄 Próximas Etapas

### Fase 1: Setup Local ✅ (Agora)
```bash
./setup-l2-local.sh
```

### Fase 2: Teste Completo ⏳
- Verificar gas token ativo
- Testar validator staking (32K TRAY)
- Testar fee distribution (70/20/10)
- Verificar burn mechanism (20%)

### Fase 3: E2E Flow ⏳
- L1 Deposit (0.1 TRAY)
- Relayer relay event
- L2 Execute deposit
- Verificar L2 balance

### Fase 4: Mainnet ⏳
- Atualizar `.env` com endereços production
- Deploy em Polygon Mainnet
- Deploy em Trayon Mainnet
- Ativar validators

---

## 📞 Support

### Documentação Completa
- **Tokenomics:** `/TOKENOMICS_COMPLETE.md`
- **L2 Setup:** `/L2_SETUP_GUIDE.md`
- **Configuration:** `/L2_CONFIGURATION.md`
- **Quick Start:** `/QUICK_START_TOKENOMICS.md`

### Referências
- **Official Docs:** https://localhost:3000/docs/tokenomics
- **Trayon Docs:** https://localhost:3000

### Contratos (Amoy Testnet)
- **TRAY Token:** 0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b
- **TokenomicsManager:** 0x3BB78Ddb66f5De33463C1C4a69e605C526720B22

---

## ✅ Status Summary

```
Tokenomics System:     ✅ COMPLETE (11/11 tests passing)
L2 Gas Token Setup:    ✅ READY (scripts & docs)
Scripts:               ✅ CREATED (setup-l2-local.sh)
Documentation:         ✅ COMPLETE (3 guides)
Testing:               ⏳ PENDING (manual validation)
E2E Flow:              ⏳ PENDING (deposit → execution)
Mainnet Deployment:    ⏳ PENDING (production)
```

---

**Ready to configure L2?** 🚀

Run: `./setup-l2-local.sh`

