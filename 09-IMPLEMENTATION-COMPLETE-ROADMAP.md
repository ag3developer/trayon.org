# 9. Roadmap Completo de Implementação - Trayon Protocol

**Data:** 23 de agosto de 2026  
**Versão:** 1.0 - Análise Completa  
**Escopo:** 100% das funcionalidades necessárias  

---

## 📊 Resumo Executivo

Este documento detalha **TODAS** as funcionalidades, componentes e serviços necessários para implementar o Trayon completo, baseado na análise dos documentos 01-07.

### Componentes Principais

```
TRAYON PROTOCOL
├── LAYER 1 (Smart Contracts - Ethereum/Polygon)
├── LAYER 2 (Sequencer + Validator Network)
├── ORACLE SYSTEM (AI Data Ingestion + Consensus)
├── BACKEND SERVICES (APIs, Data Aggregation)
├── INFRASTRUCTURE (DevOps, Monitoring)
├── FRONTEND (Web Dashboard + APIs)
└── GOVERNANCE & OPERATIONS (DAO, Treasury)
```

---

## 🏗️ PARTE 1: SMART CONTRACTS (Layer 1 + L2)

### 1.1 Token Contracts

#### TRAY.sol ✅ (JÁ INICIADO)
```solidity
// Funcionalidades:
├─ ERC-20 standard implementation
├─ 1B supply, 18 decimals
├─ Custom gas token support
├─ Fee processing (70% validators, 20% burn, 10% treasury)
├─ Mint/burn mechanics
├─ Treasury management
└─ Permit function (EIP-2612)

// Estado necessário:
├─ Mapping: balances, allowances, nonces
├─ Constantes: totalSupply, decimals, name, symbol
├─ Variables: l2SequencerAddress, feeBurnPercentage, treasury
├─ Events: Transfer, Approval, FeeBurned, FeeDistributed

// Funções críticas:
├─ transfer(to, amount)
├─ approve(spender, amount)
├─ transferFrom(from, to, amount)
├─ burn(amount)
├─ processFee(totalFee, validatorReward)
├─ enableGasToken()
├─ permit(owner, spender, amount, deadline, v, r, s)
└─ increaseAllowance/decreaseAllowance
```

**Status:** ✅ Especificação completa em 08-IMPLEMENTATION-ROADMAP.md  
**Próxima ação:** Implementação + Testes

---

#### TRAYStaking.sol ✅ (JÁ INICIADO)
```solidity
// Funcionalidades:
├─ Stake mínimo: 32.000 TRAY (ou 100 TRAY testnet)
├─ APY recompensa: 8% (6% bloco + 2% dados)
├─ Withdraw delay: 7 dias
├─ Slashing: -10% downtime, -50% dados falsos, -100% byzantine
├─ Reputação scoring
└─ Compounding automático

// Estado necessário:
├─ Struct Stake: amount, startTime, lastRewardTime, pendingWithdraw, withdrawRequestTime
├─ Mapping: stakes (address => Stake)
├─ Array: stakers (address[])
├─ Variable: totalStaked

// Funções críticas:
├─ stake(amount)
├─ calculateReward(staker)
├─ claimReward()
├─ requestUnstake(amount)
├─ completeUnstake()
├─ slash(staker, percentage, reason)
├─ getAllStakers()
└─ getValidatorStats(staker)
```

**Status:** ✅ Especificação completa em 08-IMPLEMENTATION-ROADMAP.md  
**Próxima ação:** Implementação + Testes

---

#### TRAYGovernance.sol 🆕 (NOVO)
```solidity
// Funcionalidades:
├─ Quadratic voting (1 TRAY = √TRAY votos)
├─ Propostas on-chain
├─ Timelock: 2 dias para execute
├─ Treasury management
├─ Protocol upgrades
└─ Multi-signature approval

// Estado necessário:
├─ Struct Proposal: proposer, description, votesFor, votesAgainst, executed, eta
├─ Mapping: proposals (uint => Proposal)
├─ Mapping: hasVoted (proposalId => address => bool)
├─ Variables: proposalCount, executionDelay, quorumPercentage

// Funções críticas:
├─ createProposal(description, actions[])
├─ castVote(proposalId, votes, support)
├─ castVoteBySig(proposalId, votes, support, v, r, s)
├─ queue(proposalId)
├─ execute(proposalId)
├─ cancel(proposalId)
└─ getProposalState(proposalId)

// Exemplos de propostas:
├─ Mudar taxa de Fee Burn (10% → 25%)
├─ Adicionar nova fonte de dados
├─ Ajustar stake mínimo de validadores
├─ Aprovar upgrade de contrato
└─ Eleger validadores para security council
```

**Implementação detalhada necessária**

---

### 1.2 Oracle Contracts

#### OracleManager.sol ✅ (JÁ INICIADO)
```solidity
// Funcionalidades:
├─ Registro de validadores de oracle
├─ Submissão de dados (feedId, dataType, data)
├─ Certificação de dados (multi-validator approval)
├─ Query de dados com pagamento em TRAY
├─ Reputação scoring
└─ Histórico de dados (auditável)

// Estado necessário:
├─ Struct DataFeed: feedId, dataType, submitter, data, timestamp, certified
├─ Struct OracleValidator: validatorAddress, reputation, dataSubmitted, isActive
├─ Mapping: dataFeeds (bytes32 => DataFeed)
├─ Mapping: validators (address => OracleValidator)
├─ Array: feedHistory (bytes32[])
├─ Variable: queryFee (1.000 TRAY default)

// Funções críticas:
├─ registerValidator(validatorAddress)
├─ submitData(dataType, data, signature)
├─ certifyData(feedId)
├─ queryData(feedId) → returns data (com pagamento)
├─ getRecentFeeds(limit)
├─ getValidatorStats(validator)
├─ slash(validator, percentage)
└─ updateFee(newFee)

// Feed types:
├─ government (PIB, inflação, desemprego)
├─ corporate (balanços, solvência)
├─ market (preços, volumes)
├─ judicial (decisões, jurisprudência)
└─ predictive (forecasts, análises)
```

**Status:** ✅ Especificação completa em 08-IMPLEMENTATION-ROADMAP.md  
**Próxima ação:** Implementação + Testes

---

#### DataMarketplace.sol 🆕 (NOVO)
```solidity
// Funcionalidades:
├─ Venda/compra de datasets auditados
├─ Listagem de dados por empresa/governo
├─ Payment splits entre vendedor/plataforma
├─ Royalties para geradores de dados
├─ Dispute resolution (3-of-5 arbiters)
└─ Reputation scoring vendedor

// Estado necessário:
├─ Struct DataListing: seller, dataHash, price, reputation, sales, disputes
├─ Struct Purchase: buyer, dataHash, timestamp, verified
├─ Mapping: listings (bytes32 => DataListing)
├─ Mapping: purchases (bytes32 => Purchase[])
├─ Variables: platformFee (10%), arbitrers[]

// Funções críticas:
├─ listData(dataHash, price, description)
├─ delistData(dataHash)
├─ purchaseData(dataHash)
├─ verifyPurchase(dataHash, purchaseId)
├─ disputePurchase(purchaseId, reason)
├─ settleDispute(disputeId, resolution)
├─ withdrawFunds()
└─ getDataStats(dataHash)

// Casos de uso:
├─ Empresas vendem dados contábeis auditados
├─ Governos monetizam dados de licitações
├─ Validadores vendem análises preditivas
└─ Investidores compram relatórios certificados
```

**Implementação detalhada necessária**

---

#### PredictionMarket.sol 🆕 (NOVO)
```solidity
// Funcionalidades:
├─ Mercado preditivo (estilo Polymarket)
├─ Criação de markets sobre governo/negócios/mercados
├─ Compra/venda de shares (YES/NO)
├─ Resolução via oracle
├─ Liquidity pools (AMM-style)
├─ Fee structure (2% platform, 3% creator)
└─ Settlement com TRAY

// Estado necessário:
├─ Struct Market: creator, question, yesPrice, noPrice, liquidity, resolved, outcome
├─ Struct Position: user, market, shareType, amount
├─ Mapping: markets (bytes32 => Market)
├─ Mapping: positions (address => Position[])
├─ Variables: totalVolume, platformTreasury

// Funções críticas:
├─ createMarket(question, endDate, category)
├─ buyShares(marketId, shareType, amount)
├─ sellShares(marketId, shareType, amount)
├─ addLiquidity(marketId, amount)
├─ removeLiquidity(marketId, liquidity)
├─ resolveMarket(marketId, outcome, oracleData)
├─ claimWinnings(marketId, position)
└─ getMarketPrice(marketId)

// Exemplos de markets:
├─ PIB Brasil 2026: acima de 3%?
├─ Inflação será >5% em 2026?
├─ Eleição: candidato X vence?
├─ Empresa: earnings >$1B em 2027?
└─ Mercado: BTC acima $100k em 12 meses?
```

**Implementação detalhada necessária**

---

### 1.3 Infrastructure Contracts

#### ValidatorRegistry.sol 🆕 (NOVO)
```solidity
// Funcionalidades:
├─ Registro de validadores da rede
├─ Requisitos: 32k TRAY stake, KYC, uptime monitor
├─ Participação em consenso
├─ Reputação scoring
├─ Exit mechanism (ramp-down)
└─ Slashing & penalizações

// Estado necessário:
├─ Struct Validator: address, stake, reputation, uptime, isActive, exitRequest
├─ Mapping: validators (address => Validator)
├─ Array: validatorList (address[])
├─ Variables: totalStaked, minStake, maxValidators

// Funções críticas:
├─ registerValidator(address, amount)
├─ updateReputation(validator, delta)
├─ requestExit(validator)
├─ processExit(validator)
├─ recordUptime(validator, blocks)
├─ enforceSlash(validator, percentage, reason)
├─ getValidatorStats(validator)
└─ getActiveValidators()
```

**Implementação detalhada necessária**

---

#### SequencerRegistry.sol 🆕 (NOVO)
```solidity
// Funcionalidades:
├─ Registro de sequencers (1-N)
├─ Rotação de sequencer
├─ Batch submission management
├─ Fee collection
├─ Heartbeat monitoring
└─ Failover mechanism

// Estado necessário:
├─ Struct Sequencer: address, stake, isActive, lastHeartbeat, batches
├─ Mapping: sequencers (address => Sequencer)
├─ Variable: currentSequencer (address)

// Funções críticas:
├─ registerSequencer(address, amount)
├─ submitBatch(batchData, merkleRoot)
├─ rotateSequencer()
├─ recordHeartbeat()
├─ handleSequencerFailure()
├─ getSequencerStats(sequencer)
└─ getFeePool()
```

**Implementação detalhada necessária**

---

#### ZKProofVerifier.sol 🆕 (NOVO)
```solidity
// Funcionalidades:
├─ Verificação de ZK-SNARK proofs
├─ Verificação de state roots
├─ Batch settlement
├─ Merkle proof verification
└─ Finality on L1

// Funções críticas:
├─ verifyProof(proof, publicInputs)
├─ verifyMerkleProof(leaf, root, proof)
├─ settleBatch(batchData, proof)
└─ getFinalityStatus(batchId)
```

**Implementação detalhada necessária (requer Circom/SnarkJS)**

---

## 🤖 PARTE 2: ORACLE SYSTEM (AI Validators)

### 2.1 Data Ingestion Layer (Python)

#### TrayonIngestionAgent.py 🆕 (NOVO)
```python
# Funcionalidades:
├─ Conexão a múltiplas fontes de dados (APIs, web scraping)
├─ Validação de dados (schema, checksums)
├─ Detecção de anomalias (statistical)
├─ Caching inteligente
├─ Retry logic
└─ Error handling robusto

# Fontes por setor:

# GOVERNO & MACROECONOMIA
├─ IBGE (PIB, CPI, desemprego)
├─ Banco Central (taxa câmbio, reservas)
├─ Portal da Transparência (gastos públicos)
├─ TCU (licitações, auditorias)
└─ Portal de Dados Abertos (governo)

# CORPORATIVO
├─ CVM (balanços, IPOs)
├─ B3 (cotações, volumes)
├─ Empresas (API/XBRL feeds)
└─ Agências de rating (AAA, Moody's)

# MERCADOS
├─ Exchanges (Binance, Coinbase, spot prices)
├─ DEX agregadores (Uniswap, Curve)
├─ Bloomberg/Reuters (opção, futures)
└─ Volatility indices (VIX, etc)

# JUDICIÁRIO
├─ STF/TJs (decisões públicas)
├─ Jurisprudência online (casos)
├─ CNJ (estatísticas judiciais)
└─ Protocolos (registros públicos)

# Classe: TrayonIngestionAgent
class TrayonIngestionAgent:
    def __init__(self):
        self.sources = {}
        self.cache = {}
        self.validators = {}
    
    async def fetch_all(self) → Dict[str, Data]:
        # Busca dados de todas as fontes em paralelo
        # Valida cada fonte
        # Detecta anomalias
        # Retorna consolidado
```

**Implementação detalhada necessária**

---

#### DataValidator.py 🆕 (NOVO)
```python
# Funcionalidades:
├─ Validação de schema (dados esperados)
├─ Type checking
├─ Range validation
├─ Checksum verification
├─ Cross-source validation
└─ Anomaly detection (ML)

# ML Models:
├─ Isolation Forest (outlier detection)
├─ Autoencoders (anomaly detection temporal)
├─ GARCH (volatility)
└─ Prophet (trend analysis)

class DataValidator:
    def validate_schema(data, expected_schema) → bool:
        # Verifica se dados correspondem schema esperado
    
    def detect_anomalies(data_series, model) → List[Anomaly]:
        # Retorna anomalias detectadas
    
    def cross_validate(data, sources) → ValidationScore:
        # Compara com outras fontes, retorna score
```

**Implementação detalhada necessária**

---

### 2.2 Consensus & Validation Layer

#### ConsensusEngine.py 🆕 (NOVO)
```python
# Funcionalidades:
├─ PBFT consensus (Practical Byzantine Fault Tolerance)
├─ Threshold Signature Scheme (BLS aggregation)
├─ Validator voting
├─ Quorum checking (2/3 + 1)
├─ Slashing detection
└─ Finality calculation

# Protocolo Trayon BFT:
├─ T+0s: Block proposal (sequencer)
├─ T+4s: Validation phase (validators)
├─ T+8s: Quorum check
├─ T+12s: Finality
└─ Timelock: 5-30s para finality confirmada

class ConsensusEngine:
    def propose_block(sequencer, block_data, merkle_root):
        # Sequencer propõe bloco
    
    def validate_block(validator, block_hash, state_root) → bool:
        # Validador executa e valida
    
    def aggregate_signatures(signatures: List[Signature]) → AggregatedSignature:
        # BLS signature aggregation
    
    def check_quorum(votes: Dict[Validator, bool]) → bool:
        # Requer 2/3 + 1 aprovações
    
    def finalize_block(block_hash):
        # Marca bloco como finalizado
```

**Implementação detalhada necessária**

---

#### ReputationSystem.py 🆕 (NOVO)
```python
# Funcionalidades:
├─ Tracking de validator reputation
├─ Punição por downtime (-10%)
├─ Punição por dados falsos (-50%)
├─ Punição por byzantine behavior (-100%)
├─ Prêmios por participação (+10%)
└─ Tier system (bronze/silver/gold)

class ReputationSystem:
    def calculate_reputation(validator, history) → Score:
        # Calcula score baseado em histórico
    
    def apply_penalty(validator, reason, percentage):
        # Aplica penalidade
    
    def apply_reward(validator, reason, percentage):
        # Aplica recompensa
    
    def get_tier(validator) → Tier:
        # Retorna tier: bronze < 50, silver 50-80, gold >80
```

**Implementação detalhada necessária**

---

## 💻 PARTE 3: BACKEND SERVICES

### 3.1 API Gateway

#### TrayonAPI.ts (Express/Node.js) 🆕 (NOVO)
```typescript
// Funcionalidades:
├─ REST API endpoints
├─ WebSocket subscriptions
├─ Authentication (JWT)
├─ Rate limiting
├─ CORS
├─ Request logging
└─ Error handling

// Main Endpoints:

// /api/v1/data
├─ GET /api/v1/data/feeds → List all data feeds
├─ GET /api/v1/data/feeds/{feedId} → Get specific feed
├─ GET /api/v1/data/feeds/{feedId}/history → Get history
├─ GET /api/v1/data/{category} → Get by category (government, corporate, market)
└─ POST /api/v1/data/query → Query certified data (com pagamento)

// /api/v1/validators
├─ GET /api/v1/validators → List all validators
├─ GET /api/v1/validators/{address} → Get validator stats
├─ GET /api/v1/validators/{address}/reputation → Reputation score
├─ POST /api/v1/validators/register → Register new validator
└─ GET /api/v1/validators/{address}/earnings → Earnings history

// /api/v1/staking
├─ POST /api/v1/staking/stake → Stake TRAY
├─ POST /api/v1/staking/unstake → Request unstake
├─ GET /api/v1/staking/{address}/position → View stake position
├─ GET /api/v1/staking/{address}/rewards → Calculate rewards
└─ POST /api/v1/staking/claim-rewards → Claim rewards

// /api/v1/oracle
├─ POST /api/v1/oracle/submit → Submit data
├─ GET /api/v1/oracle/certified → List certified data
├─ POST /api/v1/oracle/query → Query data (pagamento)
└─ GET /api/v1/oracle/stats → Oracle network stats

// /api/v1/markets
├─ GET /api/v1/markets → List prediction markets
├─ GET /api/v1/markets/{marketId} → Get market details
├─ POST /api/v1/markets/create → Create new market
├─ POST /api/v1/markets/{marketId}/buy → Buy shares
├─ POST /api/v1/markets/{marketId}/sell → Sell shares
└─ GET /api/v1/markets/{marketId}/prices → Get prices

// /api/v1/governance
├─ GET /api/v1/governance/proposals → List proposals
├─ POST /api/v1/governance/proposals/create → Create proposal
├─ POST /api/v1/governance/proposals/{id}/vote → Cast vote
├─ GET /api/v1/governance/proposals/{id}/results → Vote results
└─ POST /api/v1/governance/proposals/{id}/execute → Execute (timelock)

// /api/v1/health
├─ GET /api/v1/health → Health check
├─ GET /api/v1/health/validator → Validator status
└─ GET /api/v1/health/network → Network status

// WebSocket endpoints:
├─ ws://api.trayon.org/ws/feeds → Subscribe to data feed updates
├─ ws://api.trayon.org/ws/markets → Subscribe to market updates
├─ ws://api.trayon.org/ws/validators → Subscribe to validator stats
└─ ws://api.trayon.org/ws/notifications → Real-time notifications
```

**Implementação detalhada necessária**

---

### 3.2 Database Layer (PostgreSQL)

#### Database Schema 🆕 (NOVO)
```sql
-- VALIDATORS
CREATE TABLE validators (
    id BIGSERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    stake NUMERIC NOT NULL,
    reputation INT DEFAULT 100,
    uptime NUMERIC DEFAULT 100.0,
    is_active BOOLEAN DEFAULT true,
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- STAKES
CREATE TABLE stakes (
    id BIGSERIAL PRIMARY KEY,
    validator_id BIGINT REFERENCES validators(id),
    amount NUMERIC NOT NULL,
    start_time TIMESTAMP NOT NULL,
    last_reward_time TIMESTAMP NOT NULL,
    pending_withdraw NUMERIC DEFAULT 0,
    withdraw_request_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- DATA FEEDS
CREATE TABLE data_feeds (
    id BIGSERIAL PRIMARY KEY,
    feed_id VARCHAR(128) UNIQUE NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- government, corporate, market, judicial, predictive
    submitter_address VARCHAR(42) NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    is_certified BOOLEAN DEFAULT false,
    certification_count INT DEFAULT 0,
    merkle_root VARCHAR(128),
    created_at TIMESTAMP DEFAULT NOW()
);

-- VALIDATOR SUBMISSIONS
CREATE TABLE data_submissions (
    id BIGSERIAL PRIMARY KEY,
    validator_id BIGINT REFERENCES validators(id),
    feed_id BIGINT REFERENCES data_feeds(id),
    vote BOOLEAN, -- true = approve, false = reject
    signature VARCHAR(256),
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONSENSUS HISTORY
CREATE TABLE consensus_history (
    id BIGSERIAL PRIMARY KEY,
    block_height BIGINT NOT NULL,
    block_hash VARCHAR(128) NOT NULL,
    merkle_root VARCHAR(128) NOT NULL,
    proposer_address VARCHAR(42),
    validators_count INT,
    approvals INT,
    timestamp TIMESTAMP NOT NULL,
    finalized_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SLASHING EVENTS
CREATE TABLE slashing_events (
    id BIGSERIAL PRIMARY KEY,
    validator_id BIGINT REFERENCES validators(id),
    reason VARCHAR(50) NOT NULL, -- downtime, false_data, byzantine
    percentage INT NOT NULL,
    amount NUMERIC NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- QUERY HISTORY
CREATE TABLE query_history (
    id BIGSERIAL PRIMARY KEY,
    querier_address VARCHAR(42),
    feed_id BIGINT REFERENCES data_feeds(id),
    fee_paid NUMERIC NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MARKETS
CREATE TABLE markets (
    id BIGSERIAL PRIMARY KEY,
    market_id VARCHAR(128) UNIQUE NOT NULL,
    creator_address VARCHAR(42),
    question TEXT NOT NULL,
    category VARCHAR(50), -- government, corporate, market, sport, other
    yes_price NUMERIC DEFAULT 0.5,
    no_price NUMERIC DEFAULT 0.5,
    total_liquidity NUMERIC DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    outcome BOOLEAN, -- true = YES, false = NO
    resolved_at TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- MARKET POSITIONS
CREATE TABLE market_positions (
    id BIGSERIAL PRIMARY KEY,
    market_id BIGINT REFERENCES markets(id),
    user_address VARCHAR(42),
    share_type BOOLEAN, -- true = YES, false = NO
    amount NUMERIC NOT NULL,
    average_price NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PROPOSALS
CREATE TABLE proposals (
    id BIGSERIAL PRIMARY KEY,
    proposal_id INT UNIQUE NOT NULL,
    proposer_address VARCHAR(42),
    description TEXT NOT NULL,
    actions JSONB, -- Array of actions
    votes_for NUMERIC DEFAULT 0,
    votes_against NUMERIC DEFAULT 0,
    is_executed BOOLEAN DEFAULT false,
    executed_at TIMESTAMP,
    eta TIMESTAMP, -- Timelock ETA
    created_at TIMESTAMP DEFAULT NOW()
);

-- INDICES
CREATE INDEX idx_validators_address ON validators(address);
CREATE INDEX idx_feeds_type ON data_feeds(data_type);
CREATE INDEX idx_feeds_timestamp ON data_feeds(timestamp);
CREATE INDEX idx_submissions_feed ON data_submissions(feed_id);
CREATE INDEX idx_consensus_block ON consensus_history(block_height);
CREATE INDEX idx_slashing_validator ON slashing_events(validator_id);
CREATE INDEX idx_markets_resolved ON markets(is_resolved);
```

**Implementação detalhada necessária (migrations + seeders)**

---

### 3.3 Authentication & Authorization

#### AuthService.ts 🆕 (NOVO)
```typescript
// Funcionalidades:
├─ JWT token generation
├─ Wallet-based auth (EIP-191)
├─ Rate limiting per address
├─ Permission checking
├─ Session management
└─ Refresh token rotation

// Estratégia:
├─ Usuário conecta wallet (Metamask)
├─ Assina mensagem com chave privada
├─ Backend verifica assinatura
├─ Emite JWT token
├─ Token válido por 24h
└─ Refresh token válido por 7 dias
```

**Implementação detalhada necessária**

---

## 🌐 PARTE 4: FRONTEND

### 4.1 Web Dashboard (Next.js)

#### Pages necessárias 🆕 (NOVO)
```
app/
├─ page.tsx (Landing page - já existe)
├─ docs/
│  ├─ layout.tsx (Doc layout - já existe)
│  ├─ tokenomics/page.tsx
│  ├─ economic-projections/page.tsx
│  └─ ... (outros)
│
├─ dashboard/
│  ├─ layout.tsx (Dashboard layout com sidebar)
│  ├─ page.tsx (Dashboard overview)
│  ├─ validators/page.tsx (List validators)
│  ├─ validators/[address]/page.tsx (Validator details)
│  ├─ staking/page.tsx (Staking interface)
│  ├─ data/page.tsx (Data feeds viewer)
│  ├─ data/[feedId]/page.tsx (Feed details)
│  ├─ oracle/page.tsx (Oracle stats)
│  ├─ markets/page.tsx (List markets)
│  ├─ markets/[marketId]/page.tsx (Market details)
│  ├─ governance/page.tsx (Proposals)
│  ├─ governance/[proposalId]/page.tsx (Proposal details)
│  └─ portfolio/page.tsx (User portfolio)
│
├─ api/
│  ├─ validators/route.ts
│  ├─ data/route.ts
│  ├─ staking/route.ts
│  ├─ oracle/route.ts
│  ├─ markets/route.ts
│  ├─ governance/route.ts
│  └─ auth/route.ts
│
└─ (auth)/
   ├─ login/page.tsx (Wallet connect)
   └─ register/page.tsx (KYC básico)
```

**Implementação detalhada necessária**

---

#### Component Library 🆕 (NOVO)
```typescript
// Componentes necessários:

// Shared
├─ Header/Navigation
├─ Sidebar (Dashboard)
├─ Card/Grid layout
├─ Table (with sorting, pagination)
├─ Modal (dialogs)
├─ Toast (notifications)
├─ Loading states
└─ Error boundaries

// Data visualization
├─ LineChart (time series)
├─ BarChart (comparisons)
├─ DonutChart (distributions)
├─ HeatMap (correlations)
├─ NetworkGraph (validators topology)
└─ Map (validator locations)

// Forms
├─ TokenInput (com validação)
├─ AddressInput (com validation)
├─ DateRangePicker
├─ MultiSelect
├─ SearchInput (com autocomplete)
└─ FormBuilder

// Wallet Integration
├─ WalletConnect (Wagmi)
├─ Balance display
├─ Transaction history
├─ Allowance management
└─ Transaction signing UI
```

**Implementação detalhada necessária**

---

## 📡 PARTE 5: INFRASTRUCTURE

### 5.1 Validator Node Infrastructure

#### ValidatorNode.ts 🆕 (NOVO)
```typescript
// Funcionalidades:
├─ Full node (state sync from L1)
├─ Validator manager
├─ AI consensus module
├─ RPC interface (JSON-RPC 2.0)
├─ P2P networking (libp2p)
├─ Local storage (LevelDB)
└─ Monitoring & health checks

// Requisitos:
├─ CPU: 16-core
├─ RAM: 32GB
├─ Storage: 500GB SSD
├─ Network: Uptime 99%+, latência <100ms
├─ Node.js 22+

// Componentes:
├─ StateManager: State sync, storage
├─ ConsensusHandler: PBFT participation
├─ ValidatorCore: Stake management, reputation
├─ AIProcessor: Data validation
├─ P2PNetwork: Peer discovery, messaging
├─ RPCServer: JSON-RPC interface
└─ Monitor: Uptime tracking, alerting
```

**Implementação detalhada necessária**

---

### 5.2 DevOps & Monitoring

#### Docker & Kubernetes 🆕 (NOVO)
```yaml
# Docker Compose (desenvolvimento)
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: trayon
      POSTGRES_USER: trayon
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://trayon:${DB_PASSWORD}@postgres:5432/trayon
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "3001:3001"
  
  validator-node:
    build: ./validator
    environment:
      L1_RPC: ${L1_RPC_URL}
      L2_SEQUENCER: ${L2_SEQUENCER_ADDRESS}
    volumes:
      - validator_data:/data
    ports:
      - "30333:30333"  # P2P
      - "9944:9944"    # RPC
  
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    ports:
      - "3000:3000"
    depends_on:
      - prometheus

volumes:
  postgres_data:
  validator_data:
  prometheus_data:
```

**Implementação detalhada necessária (K8s manifests também)**

---

#### Monitoring & Alerting 🆕 (NOVO)
```yaml
# Métricas necessárias:

# Validator metrics
├─ validator_uptime (%)
├─ validator_reputation (score)
├─ validator_stake (TRAY)
├─ validator_earnings (TRAY)
├─ validator_slashes (count)
└─ validator_response_time (ms)

# Network metrics
├─ consensus_rounds (count)
├─ consensus_success_rate (%)
├─ block_time (seconds)
├─ transaction_throughput (TPS)
├─ finality_latency (ms)
└─ network_peers (count)

# Data metrics
├─ feeds_submitted (count)
├─ feeds_certified (%)
├─ data_anomalies_detected (count)
├─ query_volume (count)
└─ query_revenue (TRAY)

# System metrics
├─ cpu_usage (%)
├─ memory_usage (%)
├─ disk_usage (%)
├─ database_connections (count)
└─ api_latency (ms)

# Alerts
├─ Validator downtime >1 hour
├─ Consensus failure >3 blocks
├─ Data anomaly detected
├─ Database connection pool full
├─ Memory usage >80%
└─ API latency >1 second
```

**Implementação detalhada necessária**

---

## 🔐 PARTE 6: SECURITY & COMPLIANCE

### 6.1 Security Requirements

#### Smart Contract Security ✅
```
- [ ] OpenZeppelin audit ($200k)
- [ ] Formal verification (Certora)
- [ ] Penetration testing
- [ ] Bug bounty program (ImmuneFi)
- [ ] Code review (2/2 approvals)
- [ ] Static analysis (Slither)
- [ ] Mythril analysis
- [ ] Coverage >95%
```

#### Backend Security
```
- [ ] HTTPS/TLS everywhere
- [ ] JWT signing with strong keys
- [ ] Rate limiting per IP/address
- [ ] SQL injection prevention (ORM)
- [ ] CORS configuration strict
- [ ] API key rotation
- [ ] Secrets management (HashiCorp Vault)
- [ ] Input validation & sanitization
```

#### Infrastructure Security
```
- [ ] VPC with private subnets
- [ ] Security groups (firewall rules)
- [ ] DDoS protection
- [ ] WAF (Web Application Firewall)
- [ ] SSH key management
- [ ] Secrets encryption at rest
- [ ] Backup & disaster recovery
- [ ] Incident response plan
```

---

### 6.2 Compliance Requirements

#### Global Regulations
```
- [ ] GDPR (EU, dados pessoais)
- [ ] LGPD (Brasil, dados pessoais)
- [ ] MiFID II (finanças, EU)
- [ ] AML/CFT (anti-lavagem)
- [ ] KYC (Know Your Customer)
- [ ] SOX (reporting, USA)
- [ ] CCPA (Califórnia, USA)
- [ ] eIDAS (assinaturas digitais, EU)
```

---

## 📅 PARTE 7: FASES DE IMPLEMENTAÇÃO

### Timeline Completa

```
PHASE 1: FOUNDATION (Semanas 1-4)
├─ Setup GitHub repos
├─ Smart contracts base
├─ Database schema
├─ Basic API skeleton
└─ CI/CD setup

PHASE 2: MVP ORACLE (Semanas 5-12)
├─ Implementar contratos (TRAY, Staking, Oracle)
├─ Data ingestion (1 fonte: IBGE CPI)
├─ Consensus engine
├─ Backend API (core endpoints)
├─ Frontend dashboard (básico)
└─ Testnet deploy

PHASE 3: EXPANSION (Semanas 13-24)
├─ Adicionar fontes de dados (+10)
├─ Validator registration (100 validadores)
├─ Prediction market
├─ Governance system
├─ Full dashboard
├─ Security audits
└─ Bug bounty

PHASE 4: MAINNET (Semanas 25-28)
├─ Production deployment
├─ Exchange listings
├─ Partnership integrations
├─ Marketing launch
└─ 24/7 monitoring
```

---

## ✅ CHECKLIST COMPLETO DE IMPLEMENTAÇÃO

### Smart Contracts
- [ ] TRAY.sol (ERC-20 + gas token)
- [ ] TRAYStaking.sol
- [ ] TRAYGovernance.sol
- [ ] OracleManager.sol
- [ ] DataMarketplace.sol
- [ ] PredictionMarket.sol
- [ ] ValidatorRegistry.sol
- [ ] SequencerRegistry.sol
- [ ] ZKProofVerifier.sol
- [ ] Testes unitários (>95% coverage)
- [ ] Deploy script
- [ ] Verificação Etherscan

### Backend
- [ ] Express API setup
- [ ] PostgreSQL schema + migrations
- [ ] Authentication (JWT + wallet)
- [ ] Todas as rotas da API
- [ ] WebSocket implementation
- [ ] Error handling
- [ ] Logging & monitoring
- [ ] Rate limiting
- [ ] Database queries otimizadas

### Oracle System
- [ ] Data ingestion agent
- [ ] Data validators
- [ ] Consensus engine
- [ ] Reputation system
- [ ] Slashing mechanism
- [ ] BLS signature aggregation
- [ ] Merkle proof generation

### Frontend
- [ ] Dashboard layout
- [ ] Validators page
- [ ] Staking interface
- [ ] Data feeds viewer
- [ ] Markets interface
- [ ] Governance voting
- [ ] Portfolio view
- [ ] Wallet integration (Wagmi)
- [ ] Theme (light/dark)
- [ ] Responsiveness (mobile/desktop)

### Infrastructure
- [ ] Docker setup
- [ ] Docker Compose for dev
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Prometheus + Grafana
- [ ] Logging (ELK ou Datadog)
- [ ] Backup automation
- [ ] Monitoring & alerting

### Testing
- [ ] Unit tests (backend + contracts)
- [ ] Integration tests
- [ ] Load tests (1000 TPS)
- [ ] Security tests
- [ ] Fuzzing
- [ ] Testnet staging

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Validator setup guide
- [ ] Development guide
- [ ] Deployment guide
- [ ] Security guidelines
- [ ] Troubleshooting guide

### Deployment
- [ ] Testnet (Polygon Mumbai)
- [ ] Staging environment
- [ ] Production (Polygon mainnet)
- [ ] Monitoring setup
- [ ] On-call rotation

---

## 🎯 PRIORIDADE RECOMENDADA

### Sprint 1-2: Core Contracts & DB
1. TRAY.sol
2. TRAYStaking.sol
3. OracleManager.sol
4. Database schema
5. API skeleton

### Sprint 3-4: Oracle System
1. Data ingestion
2. Consensus engine
3. Backend APIs
4. Frontend dashboard (MVP)

### Sprint 5-6: Governance & Markets
1. TRAYGovernance.sol
2. PredictionMarket.sol
3. Full dashboard
4. Security audits

### Sprint 7-8: Production & Launch
1. Mainnet deployment
2. Exchange integrations
3. Partnerships
4. Go-live

---

**Próximo Passo:** Você quer que eu comece a implementação detalhada de qual componente primeiro?

Recomendação: Começar com **Smart Contracts** → **Backend APIs** → **Frontend Dashboard** (em paralelo).

