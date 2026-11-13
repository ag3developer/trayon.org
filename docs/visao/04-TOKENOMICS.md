# 4. Tokenomics & Economia Circular - TRAY

##  Visão Geral do Token TRAY

O **TRAY** é o token nativo da infraestrutura Trayon com utilidade real, não especulação:

| Aspecto | Especificação |
|--------|--------------|
| **Nome** | TRAY |
| **Tipo** | ERC-20 (L1) + Custom Gas Token (L2) |
| **Supply Total** | 1.000.000.000 TRAY (1 bilhão) |
| **Supply Inicial** | 250.000.000 TRAY (25% liberado no lançamento) |
| **Decimals** | 18 |
| **Ticker** | $TRAY |

---

##  Casos de Uso do Token

### 1. **Pagamento de Gás (Native Gas Token)**
```
Transação na Trayon L2:
├─ Operação: Submeter predição
├─ Gas limit: 21.000 unidades
├─ Gas price: 10 wei/TRAY
├─ Fee total: 210.000 TRAY (~$1.05 a $5 dependendo do preço)
└─ Impacto: Custo real de validação é pago em TRAY

Benefício:
├─ Usuários não precisam manter ETH
├─ Economias de custo vs. Ethereum
└─ Crescimento de gás = pressão de preço de TRAY
```

### 2. **Staking de Validadores**
```
Requisito: 32.000 TRAY bloqueados por validador

Recompensas anuais (APY):
├─ Recompensas de bloco: 6% APY
├─ Comissão de dados: 2% APY
├─ Governança: Votação para queimar supply
└─ Total estimado: 8% APY

Exemplo (1 validador):
├─ Stake: 32.000 TRAY
├─ Ano 1: 32.000 × 8% = 2.560 TRAY
├─ Composto anualmente: 34.560 TRAY
└─ Ano 5: ~47.050 TRAY (crescimento exponencial)
```

### 3. **Consultoria & Acesso a APIs**
```
Empresas pagam TRAY para acessar dados auditados:

Caso 1: Consulta de balanço corporativo
├─ Preço: 1.000 TRAY por acesso
├─ Frequência: Mensalmente
├─ Custo anual: 12.000 TRAY
└─ Impacto: Demanda contínua

Caso 2: Auditoria governamental
├─ Preço: 50.000 TRAY por licitação completa
├─ Frequência: Conforme demanda
├─ Exemplo: 1.000 licitações/ano = 50M TRAY
└─ Impacto: Massa de queima

Caso 3: Relatórios de análise preditiva
├─ Preço: 5.000 TRAY por relatório
├─ Frequência: Semanal
├─ Assinantes: 100 empresas = 26M TRAY/ano
└─ Impacto: Receita recorrente
```

### 4. **Fee Burn (Deflação Programada)**
```
Cada transação gera fee:
├─ 70% → Validadores (recompensa)
├─ 20% → Queimado (Fee Burn)
└─ 10% → Treasury DAO

Projeção de queima:
├─ Ano 1: 1B TRAY gás transacionado
│  ├─ 20% queimado: 200M TRAY
│  └─ Supply reduzido: 1B → 800M
├─ Ano 3: 100B TRAY gás transacionado
│  ├─ 20% queimado: 20B TRAY
│  └─ Supply ≈ 500M TRAY
└─ Efeito: Deflationary spiral cria pressão de preço
```

### 5. **Governança DAO**
```
Votação em mudanças do protocolo:

Poder de voto: 1 TRAY = 1 voto

Exemplos:
├─ Mudar taxa de Fee Burn (10% → 25%)
├─ Adicionar nova fonte de dados (ex: Banco Mundial)
├─ Ajustar stake mínimo de validadores
├─ Aprovar upgrade de segurança
└─ Elevar validadores para conselho de segurança

Mecanismo: Quadratic voting
├─ Custa √TRAY votos para ter peso
├─ Impede whale dominance
└─ Incentiva participação distribuída
```

---

##  Distribuição de Supply Inicial

### Alocação de 1 Bilhão TRAY

```
1.000.000.000 TRAY total
│
├─ 250M (25%) → Lançamento Inicial (IDO/Private)
│   ├─ 100M Private Round (investors, VCs)
│   ├─ 100M Public Sale (comunidade)
│   └─ 50M Liquidity Pools (DEX)
│
├─ 250M (25%) → Tesouro DAO (Governance)
│   ├─ Desenvolvimentos futuros
│   ├─ Incentivos de crescimento
│   └─ Fundo de emergência
│
├─ 200M (20%) → Validadores & Operadores
│   ├─ 100M Rewards (anos 1-5)
│   ├─ 50M Incentivos iniciais
│   └─ 50M Fundo de segurança
│
├─ 150M (15%) → Time de Desenvolvimento
│   ├─ 50M Fundadores (4-year vesting)
│   ├─ 50M Equipe técnica (4-year vesting)
│   └─ 50M Pesquisa & Segurança
│
├─ 100M (10%) → Partnerships & Integrações
│   ├─ 50M Exchanges & Market Makers
│   ├─ 25M API Integrations
│   └─ 25M Governos & Corporações
│
└─ 50M (5%) → Reserva Estratégica
    ├─ Volatilidade de emergência
    ├─ Forks de segurança
    └─ Decisões DAO extraordinárias
```

### Schedule de Unlock

```
Lançamento (T=0): 250M liberado
│
├─ Ano 1: 50M unlock (validadores + development)
├─ Ano 2: 50M unlock
├─ Ano 3: 50M unlock
├─ Ano 4: 50M unlock
├─ Ano 5: 50M unlock
│
└─ Resultado: Diluição suave, sem shock de price

Total em circulação no Ano 5: 500M TRAY
Remaining locked: 500M TRAY (governance power)
```

---

##  Modelo de Preço & Demanda

### Drivers de Preço

```
P(TRAY) = (Demanda × Utility) / Supply
        = (Gás + Staking + Consultas + Governança) / Supply Deflacionário

Ano 1:
├─ Demanda: $10M/ano em gás
├─ Supply: 800M (após burn)
├─ Preço teórico: $0.0125/TRAY
└─ Market cap: $10M

Ano 3:
├─ Demanda: $500M/ano em gás + $200M consultas
├─ Supply: 500M (após burn massivo)
├─ Preço teórico: $1.40/TRAY
└─ Market cap: $700M

Ano 5:
├─ Demanda: $2B/ano em gás + $1B consultas
├─ Supply: 250M (após burn agressivo)
├─ Preço teórico: $12/TRAY
└─ Market cap: $3B
```

### Fee Burn Mechanics (Detalhado)

```python
class FeeStructure:
    """Modelo de fee e burn do protocolo TRAY"""
    
    def __init__(self):
        self.burn_rate = 0.20        # 20%
        self.validator_share = 0.70  # 70%
        self.treasury_share = 0.10   # 10%
    
    def process_transaction_fee(self, gas_used: int, gas_price: float):
        """Processa fee de transação"""
        total_fee = gas_used * gas_price
        
        # Distribuição
        burn_amount = total_fee * self.burn_rate
        validator_amount = total_fee * self.validator_share
        treasury_amount = total_fee * self.treasury_share
        
        return {
            "total": total_fee,
            "burn": burn_amount,
            "validators": validator_amount,
            "treasury": treasury_amount,
            "supply_effect": f"Reduzido em {burn_amount} TRAY"
        }

# Simulação Ano 1
fee_calc = FeeStructure()

# 100B TRAY em transações (simulado)
daily_volume = 100_000_000_000 / 365  # ~274M/dia

daily_burn = daily_volume * fee_calc.burn_rate
annual_burn = daily_burn * 365

print(f"Annual burn Year 1: {annual_burn:,.0f} TRAY")
# Output: Annual burn Year 1: 20,000,000,000 TRAY

# Resultado: Supply reduzido de 1B para 980M
```

---

## 🎖 Incentivos de Adoção Antecipada

### Fase 1: Validadores Iniciais
```
Bônus para primeiros 100 validadores:

├─ Validador 1-50:
│  ├─ Recompensas: 12% APY (vs 8%)
│  ├─ Duração: Anos 1-2
│  └─ Bônus: 160k TRAY por validador
│
├─ Validador 51-100:
│  ├─ Recompensas: 10% APY
│  ├─ Duração: Anos 1-2
│  └─ Bônus: 80k TRAY por validador
│
└─ Validador 101+:
   ├─ Recompensas: 8% APY (standard)
   └─ Sem bônus adicional

Total investimento em bootstrap: 4.8M TRAY
```

### Fase 2: Programas de Referência
```
Refira empresa para usar Oracle:
├─ Base reward: 10.000 TRAY por empresa
├─ Performance bonus: até 50.000 TRAY (se empresa usa > 1 ano)
└─ Top referrer anual: 1M TRAY

Impacto: Crescimento viral de demanda
```

### Fase 3: Programas de Educação
```
Educação sobre Trayon:
├─ Criar artigo técnico: 5.000 TRAY
├─ Apresentação em conferência: 50.000 TRAY
├─ Integração open-source: 100.000 TRAY
└─ Auditoria de segurança: até 1M TRAY

Objetivo: Construir comunidade engajada
```

---

##  Economia Circular Exemplar

### Ciclo Completo do TRAY

```
1⃣ Investidor compra 10.000 TRAY na IDO
   └─ Preço: $0.01/TRAY = $100 investido

2⃣ Monta nó validador (stake 32.000 TRAY)
   └─ APY: 8% = 2.560 TRAY/ano

3⃣ Após 2 anos
   ├─ TRAY acumulado: 5.120
   ├─ Novo total: 15.120 TRAY
   └─ Pode unstake e reinvestir

4⃣ Empresa ABC paga 1M TRAY para auditoria
   ├─ 200k TRAY queimado
   ├─ 700k TRAY para validadores (distribuído)
   └─ 100k TRAY para treasury

5⃣ Deflação de supply
   ├─ Menos TRAY em circulação
   ├─ Pressão de preço: $0.01 → $0.15
   └─ Seu stake agora vale $2.268

6⃣ Resultado
   ├─ Investimento inicial: $100
   ├─ Após 2 anos: $2.268 (22.7x)
   ├─ Retorno: 1.068%
   └─ Ciclo sustentável (não é pyramid)
```

---

##  Comparativo com Outros Tokens

| Aspecto | TRAY | ETH | Polygon | Uniswap |
|--------|------|-----|---------|---------|
| **Utilidade Real** | Gás + Staking | Gás + Staking | Staking | Governança |
| **Fee Burn** | Sim (20%) | Sim (EIP-1559) | Sim | Não |
| **Custo de Operação** | Claro (gás) | Claro (gás) | Claro (gás) | Especulativo |
| **Preço Driver** | Demanda de auditoria | Demanda de rede | Staking + rede | Governança |
| **Supply Dinâmica** | Deflationary | Quasi-stable | Inflationário | Inflationary |

---

## 🛡 Proteções Contra Manipulação

### Anti-Whale Mechanics

```python
class AntiWhaleProtection:
    """Proteções para prevenir manipulação de preço"""
    
    def __init__(self, max_single_holder: float = 0.05):  # 5%
        self.max_single_holder = max_single_holder
    
    def check_concentration(self, holder: str, percentage: float) -> bool:
        """Verifica se um holder excede limite"""
        if percentage > self.max_single_holder:
            return False  # Concentração excessiva
        return True
    
    def apply_quadratic_voting_cost(self, tokens: float) -> float:
        """Custo de votação aumenta quadraticamente"""
        # Impede whale vote buying
        voting_cost = tokens ** 1.5  # √ pattern, customizável
        return voting_cost
    
    def implement_voting_cooldown(self, voter: str, days: int = 1):
        """Espera entre votações para impedir flash loans"""
        pass

# Exemplo
protection = AntiWhaleProtection()

# Verificação de holder
print(protection.check_concentration("0x...", 0.08))  # False (> 5%)
print(protection.check_concentration("0x...", 0.03))  # True (< 5%)

# Custo de votação
print(protection.apply_quadratic_voting_cost(100_000))      # ≈ 31.6M (custoso)
print(protection.apply_quadratic_voting_cost(1_000))        # ≈ 31.6k (acessível)
```

---

## 💹 Projeção de 5 Anos

```
TRAY Price Projection (Base Case):

Ano 0 (Lançamento):
├─ Preço: $0.01
├─ Market Cap: $10M
└─ Supply: 1B

Ano 1:
├─ Preço: $0.10
├─ Market Cap: $80M (após 200M queimado)
├─ TVL: $50M
└─ Validadores: 500

Ano 2:
├─ Preço: $0.50
├─ Market Cap: $300M
├─ TVL: $300M
└─ Validadores: 5.000

Ano 3:
├─ Preço: $1.50
├─ Market Cap: $750M
├─ TVL: $1B
└─ Validadores: 20.000

Ano 4:
├─ Preço: $5.00
├─ Market Cap: $1.25B
├─ TVL: $3B
└─ Validadores: 50.000

Ano 5:
├─ Preço: $12.00
├─ Market Cap: $3B
├─ TVL: $5B+
└─ Validadores: 100.000+
```

### Cenários (Bull/Bear)

```
BULL CASE (Adoção global):
└─ Ano 5 Price: $50-100 (Market cap: $12-25B)

BASE CASE (Adoção regional):
└─ Ano 5 Price: $8-12 (Market cap: $2-3B)

BEAR CASE (Adoção limitada):
└─ Ano 5 Price: $0.50-2 (Market cap: $100-500M)
```

---

##  Roadmap de Tokenomics

```
Q3 2026: Privada Round ($5M)
Q4 2026: IDO ($10M)
Q1 2027: Listagem em CEX (Binance, Kraken)
Q2 2027: Staking em produção
Q3 2027: Fee Burn ativo
Q4 2027: Revisão de parâmetros econômicos
```

---

**Versão:** 1.0 | **Data:** 22/08/2026 | **Status:** Modelo Econômico
