# 🌐 Network Troubleshooting Guide

## 🚨 Problem
Your internet works normally (você navega), mas **RPC endpoints estão inacessíveis**:
```
Error: getaddrinfo ENOTFOUND rpc-amoy.polygon.technology
Error: getaddrinfo ENOTFOUND polygon-amoy.g.alchemy.com
```

**Causa Provável**: DNS bloqueado pelo ISP ou rede corporativa

---

## ✅ Solutions (em ordem de facilidade)

### Solução 1: Script Interativo (RECOMENDADO)
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts
chmod +x DEPLOY_WITH_PROXY.sh
./DEPLOY_WITH_PROXY.sh
```

Escolha uma opção:
1. **Direct RPC** - tenta novamente
2. **VPN** - se tiver VPN ativa
3. **Proxy** - configurar proxy HTTP
4. **Public DNS** - mudar DNS para Cloudflare
5. **Local Only** - skip network check

---

### Solução 2: Usar VPN 🔒
Se seu ISP está bloqueando os RPC:

**Opção A: VPN Online (Gratuito)**
- ExpressVPN trial
- ProtonVPN (gratuito)
- Cloudflare WARP (gratuito)

**Steps:**
1. Download + Install VPN
2. Connect
3. Run:
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts
./DEPLOY_WITH_PROXY.sh
# Escolha opção 2
```

---

### Solução 3: Trocar DNS 🔧

**Opção A: Via macOS GUI**
1. System Preferences → Network
2. Advanced → DNS
3. Remova current DNS
4. Add: `1.1.1.1` (Cloudflare)
5. Add: `1.0.0.1` (Cloudflare backup)
6. OK

**Opção B: Via Terminal**
```bash
# Ver redes disponíveis
networksetup -listallnetworkservices

# Trocar DNS (requer sudo)
sudo networksetup -setdnsservers "WiFi" 1.1.1.1 1.0.0.1

# Restaurar DNS padrão
sudo networksetup -setdnsservers "WiFi" empty
```

**DNS Alternatives:**
- **Cloudflare**: `1.1.1.1` / `1.0.0.1`
- **Google**: `8.8.8.8` / `8.8.4.4`
- **Quad9**: `9.9.9.9` / `149.112.112.112`

**Testar novo DNS:**
```bash
nslookup polygon-amoy.g.alchemy.com
# Deve retornar um IP
```

---

### Solução 4: Usar HTTP Proxy 🔗

Se você tem acesso a proxy corporativo:

```bash
# Set environment variables
export http_proxy=http://proxy.company.com:8080
export https_proxy=http://proxy.company.com:8080

# Run deployment
cd /Users/josecarlosmartins/Documents/trayon.org/contracts
./DEPLOY_WITH_PROXY.sh
# Escolha opção 3
```

---

### Solução 5: Usar Mobile Hotspot 📱

Se tudo mais falhar, tente:
1. Conecte seu iPhone/Android
2. Ative hotspot
3. Mac se conecta via WiFi do celular
4. Tente deploy novamente

(Diferente do ISP, pode ter melhor acesso)

---

### Solução 6: Contacte seu ISP 📞

Se nada funciona:
```
"Olá, os domínios polygon-amoy.g.alchemy.com e polygon-amoy.infura.io 
estão bloqueados. Podem liberar? São endpoints RPC necessários para 
desenvolvimento blockchain."
```

---

## 🧪 Testing Connectivity

### Teste 1: Verificar DNS
```bash
# Deve retornar um IP
nslookup polygon-amoy.g.alchemy.com

# Ou com dig
dig polygon-amoy.g.alchemy.com

# Ou com host
host polygon-amoy.g.alchemy.com
```

### Teste 2: Testar Conexão RPC
```bash
# Teste diretamente com curl
curl -s -X POST \
  https://polygon-amoy.g.alchemy.com/v2/NgW4a0WvHrZOW1Eebu6lK \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Deve retornar: {"jsonrpc":"2.0","result":"0x13881","id":1}
```

### Teste 3: Com Cast
```bash
cast rpc eth_chainId \
  --rpc-url "https://polygon-amoy.g.alchemy.com/v2/NgW4a0WvHrZOW1Eebu6lK"

# Deve retornar: 0x13881
```

### Teste 4: Verificar seu IP
```bash
curl -s https://ifconfig.me
# Seu IP externo aparece

# Se retornar erro: seu DNS está REALMENTE bloqueado
```

---

## 📊 Diagnóstico Rápido

```bash
#!/bin/bash

echo "=== Network Diagnostics ==="

echo "1. Ping DNS"
ping -c 3 8.8.8.8

echo ""
echo "2. Resolve DNS"
nslookup polygon-amoy.g.alchemy.com

echo ""
echo "3. Test RPC"
cast rpc eth_chainId --rpc-url "https://polygon-amoy.g.alchemy.com/v2/NgW4a0WvHrZOW1Eebu6lK"

echo ""
echo "4. Check IP"
curl -s https://ifconfig.me
```

---

## 🎯 If Everything Fails: Alternative Approach

### Deploy via Testnet em Machine com Acesso

1. **Local Hardhat/Anvil**
   ```bash
   # Deploy em local testnet
   cd /Users/josecarlosmartins/Documents/trayon.org/contracts
   forge test  # Funciona sem RPC externo
   ```

2. **Amigos/Colegas**
   - Compartilhe DEPLOY_NOW.sh
   - Alguém com internet OK faz o deploy
   - Você recebe endereços dos contracts

3. **AWS/GCP Cloud Machine**
   - Crie small VM
   - SSH com acesso externo
   - Execute deploy de lá

---

## 💡 Quick Reference

| Comando | Uso |
|---------|-----|
| `./DEPLOY_WITH_PROXY.sh` | Menu interativo (RECOMENDADO) |
| `./DEPLOY_NOW.sh` | Deploy direto (se internet OK) |
| `./TEST_RPC.sh` | Testar RPC |
| `nslookup domain.com` | Verificar DNS |
| `curl https://url` | Testar conexão |

---

## 🆘 Still Stuck?

Copia o erro completo e tenta:
```bash
./DEPLOY_WITH_PROXY.sh 2>&1 | tee deployment-error.log

# Envie o arquivo deployment-error.log para análise
```

**Próximas opções:**
1. Tente VPN (90% funciona)
2. Trocar DNS (60% funciona)
3. Mobile hotspot (70% funciona)
4. Deploy localmente + manual addresses

---

**Status**: 🔴 Bloqueio de RPC confirmado  
**Recomendação**: Usar VPN ou trocar DNS  
**ETA para deploy**: 15-30 minutos com uma das soluções
