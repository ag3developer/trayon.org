# 🚀 Setup Infura para Deployment

## Status Atual
✅ Scripts preparados para usar Infura API key  
✅ .env atualizado para suportar API key  
✅ Test script criado (`TEST_RPC.sh`)  
⏳ Aguardando sua API key do Infura  

---

## 🔑 Passos para Obter API Key

### 1️⃣ Acesse Infura
https://www.infura.io/

### 2️⃣ Login/Signup
- Se não tiver conta: clique em "Sign Up"
- Confirme email
- Faça login

### 3️⃣ Criar Projeto
1. Dashboard → "Create New Project"
2. Name: `Trayon Bridge` (ou outro nome)
3. Network: **Polygon**
4. Click "Create"

### 4️⃣ Copiar API Key
1. Vá para "Settings" do projeto
2. Procure por **"Polygon Amoy"** (antigo Mumbai)
3. Copie o link completo que começa com:
   ```
   https://polygon-amoy.infura.io/v3/YOUR_KEY_HERE
   ```

4. A **API KEY** é tudo depois de `/v3/`
   - Exemplo: `abc123def456ghi789jkl...` (64 caracteres)

---

## ✏️ Adicionar ao .env

### Opção 1: Via CLI
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Editar o arquivo
nano .env

# Encontre esta linha:
INFURA_API_KEY=YOUR_INFURA_KEY_HERE

# Substitua por sua chave:
INFURA_API_KEY=abc123def456ghi789jkl000...

# Salve: Ctrl+O → Enter → Ctrl+X
```

### Opção 2: Direto com sed
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Substitua YOUR_API_KEY_HERE pela sua chave real
sed -i 's/INFURA_API_KEY=YOUR_INFURA_KEY_HERE/INFURA_API_KEY=YOUR_ACTUAL_KEY_HERE/' .env
```

---

## ✅ Testar Conexão

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Executar test script
./TEST_RPC.sh
```

**Resultado esperado:**
```
✅ Infura RPC working! (Chain ID: 0x13881)
✅ Ready to deploy!
```

---

## 🚀 Depois de Verificado

Execute o deployment:

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Opção 1: Deployment imediato com confirmação
./DEPLOY_NOW.sh

# Opção 2: Esperar internet (se instável)
./WAIT_AND_DEPLOY.sh
```

---

## 🐛 Troubleshooting

### ❌ "Chain ID mismatch"
- Verifique se copiou a chave corretamente
- Verifique se é da rede **Polygon Amoy** (não Polygon PoS)

### ❌ "Connection timeout"
- Sua internet está instável
- Tente com `./WAIT_AND_DEPLOY.sh` (auto-retry)
- Espere 5 minutos e tente novamente

### ❌ "Invalid API Key"
- Chave copiada incorretamente?
- Sua conta Infura pode estar com rate limit?
- Try criar novo projeto

---

## 📋 Checklist

- [ ] Criar conta Infura (https://www.infura.io/)
- [ ] Criar projeto Polygon
- [ ] Copiar API key
- [ ] Adicionar ao .env
- [ ] Executar `./TEST_RPC.sh`
- [ ] Verificar ✅ success
- [ ] Executar `./DEPLOY_NOW.sh`
- [ ] Registrar endereços dos contracts

---

## 💾 Próximos Passos Após Deploy

1. **Registrar Endereços**
   ```
   TRAY_L1_ADDRESS = 0x...
   BRIDGE_L1_ADDRESS = 0x...
   TRAY_L2_ADDRESS = 0x...
   BRIDGE_L2_ADDRESS = 0x...
   ```

2. **Atualizar Relayer**
   ```bash
   cd /relayer
   nano .env.local
   # Adicionar endereços dos contracts
   npm run build
   npm run dev
   ```

3. **Testar E2E Real**
   - Executar transaction real na rede testnet
   - Verificar eventos no relayer
   - Confirmar withdrawal

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:
1. Verifique seu internet connection: `ping 8.8.8.8`
2. Teste RPC: `./TEST_RPC.sh`
3. Verifique .env: `cat .env | grep INFURA`

**Está tudo pronto! Só precisa da API key! 🚀**
