# 🔑 Como Obter API Key para Polygon Amoy

## Opção 1: Alchemy (RECOMENDADO - Mais Rápido)

### Passo 1: Ir para Alchemy
Acesse: https://www.alchemy.com/

### Passo 2: Criar Conta (se não tiver)
- Clique em "Sign Up"
- Use seu email
- Confirme email

### Passo 3: Fazer Login
- Entre com suas credenciais

### Passo 4: Criar Novo App
1. Dashboard → "Create app"
2. Name: "Trayon Bridge" (ou qualquer nome)
3. Chain: **Polygon**
4. Network: **Polygon Amoy**
5. Clique "Create app"

### Passo 5: Copiar API Key
1. Vá para seu app criado
2. Clique em "API key"
3. Copie a chave mostrada

### Passo 6: Adicionar ao .env
```bash
nano /Users/josecarlosmartins/Documents/trayon.org/contracts/.env
```

Encontre a linha:
```
ALCHEMY_API_KEY=NgW4a0WvHrZOW1Eebu6lK
```
(Já deve estar preenchida!)

---

## Opção 2: Infura (Alternativa Boa)

### Passo 1: Ir para Infura
Acesse: https://www.infura.io/

## Passo 2: Criar Conta (se não tiver)
- Clique em "Sign Up"
- Use seu email
- Confirme email

## Passo 3: Fazer Login
- Entre com suas credenciais

## Passo 4: Criar Novo Projeto
1. Dashboard → "Create New Project"
2. Nome: "Trayon Bridge" (ou qualquer nome)
3. Network: **Polygon**
4. Clique "Create"

## Passo 5: Copiar API Key
1. Selecione seu projeto
2. Vá para "Settings" 
3. Em "Keys", encontre **Polygon Amoy (formerly Mumbai)**
4. Copie o link que começa com: `https://polygon-amoy.infura.io/v3/`
5. A **API Key** é a parte final (64 caracteres hex)

## Passo 6: Adicionar ao .env

Abra seu arquivo `.env`:
```bash
nano /Users/josecarlosmartins/Documents/trayon.org/contracts/.env
```

Encontre a linha:
```
INFURA_API_KEY=YOUR_INFURA_KEY_HERE
```

Substitua por sua chave real:
```
INFURA_API_KEY=abc123def456...
```

## Passo 7: Verificar Funcionamento

```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts

# Teste a conexão
cast rpc eth_chainId --rpc-url "https://polygon-amoy.infura.io/v3/YOUR_API_KEY"
# Deve retornar: 0x13881 (chain ID 80001)
```

## ✅ Se Funcionar
Você verá: `0x13881`

## ❌ Se Não Funcionar
- Verifique se copiou a chave corretamente
- Verifique se tem "Polygon Amoy" selecionado
- Tente novamente

## 🚀 Depois de Adicionar a Key

Execute o deployment:
```bash
cd /Users/josecarlosmartins/Documents/trayon.org/contracts
./DEPLOY_NOW.sh
```

---

## 📝 Alternativa: Sem Infura (RPC Público)

Se não quiser criar conta no Infura, podemos usar:
```
https://rpc-amoy.polygon.technology
```

Mas é menos confiável. Infura é recomendado para produção.

---

## 💡 Dicas

- A API key é grátis no plano Free
- Não tem limite de requisições no testnet
- Mantenha segura (como senha)
- Não commita no git (já está no .gitignore)

---

**Próximo Passo**: Adicione a chave e execute `./DEPLOY_NOW.sh`
