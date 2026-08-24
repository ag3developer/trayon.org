# 🚀 Guia de Deploy - Trayon Dashboard no Vercel

## 📋 Pré-requisitos

✅ Conta Vercel criada
✅ `app.trayon.org` subdomain configurado no seu registrador de domínio (DNS)
✅ Git repository conectado (ag3developer/trayon.org)
✅ Node.js 22+ instalado

---

## 🎯 Passo 1: Preparar o Projeto Localmente

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/web

# Verificar build
npm run build

# Se houver erros, corrigir antes de fazer deploy
npm run lint
```

---

## 🔐 Passo 2: Preparar Variáveis de Ambiente para Vercel

**Arquivo criado:** `vercel.json` ✅

Para o **production**, você precisa definir:

```bash
NEXT_PUBLIC_API_URL=https://api.trayon.org  # ou seu backend URL
NEXT_PUBLIC_CHAIN_ID=11155111               # Sepolia testnet
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_BRIDGE_CONTRACT=0x...           # Seu contrato
```

---

## 🌐 Passo 3: Instalar Vercel CLI

```bash
npm install -g vercel
```

---

## 📤 Passo 4: Deploy Automático (Recomendado)

### Opção A: Via GitHub (Melhor)

1. **Acesse:** https://vercel.com/new
2. **Selecione:** Seu repositório `ag3developer/trayon.org`
3. **Configure:**
   - Framework: Next.js (detectado automaticamente)
   - Root Directory: `web/`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://api.trayon.org
   NEXT_PUBLIC_CHAIN_ID = 11155111
   NEXT_PUBLIC_ETHEREUM_RPC_URL = https://sepolia.infura.io/v3/YOUR_KEY
   NEXT_PUBLIC_BRIDGE_CONTRACT = 0x...
   ```
5. **Deploy domains:**
   - Adicione: `app.trayon.org`
   - Aponte DNS CNAME para: `cname.vercel.com`

6. **Clique em Deploy!** 🎉

---

## 📤 Passo 5: Deploy Manual via CLI (Alternativa)

```bash
# Do diretório web/
cd /Users/josecarlosmartins/Documents/trayon.org/web

# Login
vercel login

# Deploy (staging)
vercel --prod

# O CLI pedirá confirmação - responda SIM

# Ou deploy direto com:
vercel deploy --prod --yes
```

---

## 🔗 Passo 6: Configurar Domínio no Vercel

**No painel Vercel:**

1. Vá para: **Settings → Domains**
2. Clique em **Add**
3. Digite: `app.trayon.org`
4. Escolha: **Use Vercel's Nameservers** ou **CNAME**

### Se usar CNAME:
Adicione este record no seu registrador de domínio:

```
Type: CNAME
Name: app
Value: cname.vercel.com
TTL: 3600
```

### Se usar Nameservers:
Vercel fornecerá 4 nameservers para adicionar no registrador

---

## ✅ Passo 7: Validar DNS (Opcional)

```bash
# Verificar se DNS propagar
nslookup app.trayon.org

# Ou com dig
dig app.trayon.org

# Deve resolver para um IP Vercel
```

---

## 🧪 Passo 8: Testar Dashboard

Após 5-10 minutos (tempo de propagação DNS):

1. **Acesse:**
   - 🌍 https://app.trayon.org (global)
   - 🌍 https://app.trayon.org/en/dashboard-preview
   - 🌍 https://app.trayon.org/pt/dashboard-preview
   - 🌍 https://app.trayon.org/de/dashboard-preview

2. **Verifique:**
   - ✅ Dashboard carrega
   - ✅ Todas as 7 línguas funcionam
   - ✅ Temas escuro/claro aplicados
   - ✅ Quick Actions visíveis com cores corretas
   - ✅ Animações suaves

---

## 🔄 Passo 9: Configurar Auto-Deploy (GitHub)

Vercel faz isso automaticamente! Toda vez que você faz push para `main`:

```bash
git add .
git commit -m "feat: deploy dashboard to app.trayon.org"
git push origin main
```

✅ Deploy automático em ~30-60 segundos

---

## 📊 Monitoramento Pós-Deploy

**No painel Vercel:**

- **Analytics:** Visualizar tráfego
- **Logs:** Ver erros/warnings
- **Performance:** Check Core Web Vitals
- **Deployments:** Histórico de versões

---

## 🆘 Troubleshooting

### ❌ Erro: "Build failed"
```bash
# Localmente, rodar build
npm run build

# Se der erro, verificar:
npm run lint
npm run dev
```

### ❌ Erro: "Domain not resolving"
- Aguardar 5-15 minutos (propagação DNS)
- Verificar CNAME no registrador
- Testar com: `nslookup app.trayon.org`

### ❌ Erro: "Dashboard não carrega"
- Verificar environment variables em Vercel → Settings → Environment Variables
- Confirmar que NEXT_PUBLIC_API_URL está correto
- Verificar console do navegador para erros

### ❌ Erro: "Idiomas não funcionam"
- Verificar se message files existem em `/web/src/messages/`
- Confirmar que `next-intl` está configurado em `middleware.ts`
- Testar localmente: `npm run dev`

---

## 📝 Checklist Final

- [ ] Build local OK (`npm run build`)
- [ ] Environment variables configuradas no Vercel
- [ ] Domain `app.trayon.org` apontando para Vercel
- [ ] DNS propagado (`nslookup app.trayon.org`)
- [ ] Dashboard carrega em app.trayon.org
- [ ] Todas as 7 línguas funcionam
- [ ] Quick Actions com cores corretas
- [ ] Mobile responsivo
- [ ] Performance OK (Vercel Analytics)

---

## 🎯 Próximos Passos

1. ✅ Deploy dashboard
2. ⏳ Conectar backend real (`/api/portfolio`, etc.)
3. ⏳ Implementar autenticação JWT
4. ⏳ WebSocket para atualizações em tempo real
5. ⏳ Real data endpoints

---

## 📞 Suporte

Se algo não funcionar:
1. Verificar logs no Vercel Console
2. Testar localmente com `npm run dev`
3. Verificar `.env.local` contém todas as variáveis necessárias

**Happy deploying! 🚀**
