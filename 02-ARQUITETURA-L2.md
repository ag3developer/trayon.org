# 2. Arquitetura Layer 2 - Trayon (Polygon CDK)

## 📐 Visão Geral

Trayon é uma **Layer 2 descentralizada** desenvolvida com **Polygon CDK (Chain Development Kit)**, otimizada para:
- Captura e validação de dados com alta disponibilidade
- Processamento de oráculos de IA em tempo real
- Transações rápidas e de baixo custo
- Segurança herdada da Ethereum via ZK-Proofs

---

## 🏗 Arquitetura de Camadas

```
┌─────────────────────────────────────────────────┐
│          Aplicações & Casos de Uso              │
│  (GovTech, Corporativo, Judiciário, Mercados)   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│     Trayon Smart Contracts (Solidity)           │
│  - Oracle Manager                               │
│  - Validator Registry                           │
│  - Token TRAY (ERC-20 + Custom Gas)            │
│  - Market Prediction (Polymarket-style)         │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│       Trayon Layer 2 (Polygon CDK)             │
│  - Sequencer                                    │
│  - State Machine (EVM-compatible)               │
│  - Validator Nodes                              │
│  - AI Consensus Engine                          │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│    ZK-Prover & Data Availability               │
│  - ZK-SNARK Proofs gerados locally             │
│  - Batch submissions para Ethereum/Polygon     │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  Ethereum L1 / Polygon PoS (Finality Layer)    │
│  - Verificação de ZK-Proofs                     │
│  - Armazenamento de merkle roots                │
└─────────────────────────────────────────────────┘
```

---

## 🔗 Papel do Token TRAY como Custom Gas Token

### 1. Native Gas Token
O token TRAY substitui completamente ETH como moeda de gás dentro da Layer 2 Trayon:

```
Transação na Trayon L2:
┌──────────────────────────────┐
│ gasPrice = 10 wei (TRAY)    │
│ gasLimit = 21.000           │
│ fee = 210.000 TRAY          │
└──────────────────────────────┘
```

**Vantagens:**
- Usuários não precisam manter ETH
- Economia circular dentro do ecossistema
- Facilita adoção por não-cripto (empresas, governo)
- Fee Burn programado reduz supply automáticamente

### 2. Mecanismo de Queima (Fee Burn)
```
Total de TRAY transacionado por bloco = 1.000 TRAY
├─ 70% → Validadores (recompensa)
├─ 20% → Queimado (Fee Burn)
└─ 10% → Fundo de desenvolvimento (DAO)
```

**Impacto:** Supply deflacionário conforme crescimento de uso

### 3. Custom Gas Token Implementation
```solidity
// Implementação no Polygon CDK
contract GasToken is ERC20 {
    address public sequencer;
    
    function payGas(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount);
        burn(amount); // Consumir do supply
        emit GasConsumed(msg.sender, amount);
    }
}
```

---

## ⚙ Funcionamento dos Nós Validadores

### Arquitetura de Validadores

```
Trayon Validator Node
├── Full Node (State Sync)
│   ├─ Ethereum Light Client
│   ├─ Trayon Full State
│   └─ Oracle Data Cache
│
├── Validator Manager
│   ├─ Stake Monitor (TRAY locked)
│   ├─ Reputation Score
│   └─ Slashing Detector
│
├── AI Consensus Module
│   ├─ Data Ingestion Agent
│   ├─ Validation Algorithm
│   └─ Threshold Signature Scheme (TSS)
│
└── RPC Interface
    ├─ JSON-RPC 2.0
    ├─ WebSocket subscriptions
    └─ Archive mode support
```

### Requisitos para Validador

| Aspecto | Requisito |
|--------|-----------|
| **Stake Mínimo** | 32.000 TRAY |
| **Hardware** | CPU 16-core, 32GB RAM, SSD 500GB |
| **Conexão** | Uptime 99%+, latência <100ms |
| **Atualizações** | Contínuas (protocolo evolui) |

### Processo de Validação de Dados

```
1. Data Ingestion
   └─ Agentes de IA capturam de APIs oficiais (JSON, CSV, HTTP)

2. Consensus Phase
   ├─ Cada validador executa algoritmo independentemente
   ├─ TSS (Threshold Signature Scheme) requer 2/3 acordo
   └─ Timeout = 12 segundos por bloco

3. Commit to Blockchain
   ├─ Merkle root dos dados validados
   ├─ Assinatura agregada (BLS signature)
   └─ Armazenado em smart contract

4. ZK-Proof Generation
   └─ Prover offline calcula ZK-SNARK para L1

5. Batch Settlement
   ├─ Verificação na Ethereum/Polygon
   ├─ Finality em ~30 minutos
   └─ Impossível reverter (security)
```

---

##  Mecanismo de Staking & Slashing

### Staking
Validadores trancam TRAY para:
1. Ganhar recompensas de bloco (~8% APY)
2. Receber comissão de dados validados
3. Participar de governança DAO

```
Validator Stake Model:
┌────────────────────────────────────┐
│ Initial Stake: 32.000 TRAY        │
│ Annual Rewards: ~2.560 TRAY (8%)   │
│ Lock Period: 3-12 months variable  │
│ Unstake Time: 3 dias (security)    │
└────────────────────────────────────┘
```

### Slashing (Penalização)

Validadores são automaticamente penalizados por:

| Infração | Penalidade | Condição |
|---------|-----------|---------|
| **Data Falsa (detectada)** | -50% do stake | Uma votação recusa dados |
| **Downtime > 48h** | -10% do stake | Validador offline |
| **Double-sign** | -100% do stake | Assinatura conflitante |
| **Byzantine Attack** | -100% do stake | Ataque coordenado |

```
Slashing Calculation:
┌────────────────────────────────────┐
│ Validator Stake: 32.000 TRAY      │
│ Infração: Data Falsa               │
│ Slashing Rate: 50%                 │
│ Penalidade: 16.000 TRAY queimada  │
│ Novo Stake: 16.000 TRAY           │
│ Resultado: Removido (< min 32k)   │
└────────────────────────────────────┘
```

---

## 📤 Envio de ZK-Proofs para Ethereum/Polygon

### ZK-SNARK Proof Generation

```
Bloco da Trayon L2
├─ State Root (Merkle)
├─ Transactions Batch
├─ Data Commitments
└─ Validator Signatures
    │
    ▼
ZK-Prover (Off-chain)
├─ Gera SNARK circuit
├─ Prova de: "state transition válida"
├─ Tempo: 5-10 minutos por batch
└─ Saída: πProof (288 bytes)
    │
    ▼
Settlement Contract (L1 Ethereum)
├─ Verifica πProof em ~200ms
├─ Atualiza merkle root L1
└─ Emite evento: StateCommitted
```

### Batch Settlement Design

```solidity
// Contrato na Ethereum L1
contract TrayonSettlement {
    bytes32 public latestStateRoot;
    uint256 public batchHeight;
    
    function submitBatch(
        bytes32 _stateRoot,
        bytes calldata _zkProof,
        uint256 _batchHeight
    ) external {
        require(msg.sender == sequencer);
        
        // Verifica ZK-Proof
        bool valid = verifyZKProof(_zkProof, _stateRoot);
        require(valid, "Invalid proof");
        
        latestStateRoot = _stateRoot;
        batchHeight = _batchHeight;
        
        emit BatchSettled(_batchHeight, _stateRoot);
    }
}
```

### Cronograma de Settlements
- **Batch Size:** 2.000 transações
- **Intervalo:** A cada 2 horas (ou quando batch fica full)
- **Finality:** 30 minutos após L1 confirmation
- **Cost:** ~$50-200 por batch (custo compartilhado entre transações)

---

## 🌐 Data Availability & Ethereum DA

### Estratégia de DA (Data Availability)

```
Opção 1: Ethereum DA (Danksharding - Pós-Dencun)
├─ Blobs: 4MB por bloco (~3 meses de retenção)
├─ Custo: ~$0,01 por transação
└─ Segurança: Maximal (herdada de Ethereum)

Opção 2: Polygon CDK DA
├─ DataAvailabilityCommittee descentralizado
├─ Custo: ~$0,005 por transação
└─ Segurança: 2/3 honesto conforme Polygon PoS

Opção 3: Hybrid (recomendado)
├─ Dados críticos (oracle) → Ethereum DA
├─ Dados secundários → Polygon CDK DA
└─ Resultado: Otimização custo/segurança
```

---

##  Performance & Scalability

### Capacidade da Trayon L2

| Métrica | Especificação |
|--------|--------------|
| **TPS (Transações/seg)** | 4.000 |
| **Block Time** | 2 segundos |
| **Finality** | 30 min (L1 batch) |
| **Gas Limit/block** | 40M TRAY (~2M USD/bloco) |
| **Latency** | <500ms |

### Projeção de Crescimento

```
Ano 1: 100 TPS (teste em produção)
Ano 2: 1.000 TPS (adoção corporativa)
Ano 3: 4.000 TPS (escala global)
Ano 4+: Sharding → 100.000+ TPS
```

---

## 🔗 Smart Contracts Principais

### 1. TrayonToken (ERC-20 + Custom Gas)
```solidity
pragma solidity ^0.8.0;

contract TRAY is ERC20 {
    address public sequencer;
    uint256 public burnRate = 20; // 20% fee burn
    
    function transferWithGas(
        address to,
        uint256 amount,
        uint256 gasUsed
    ) external {
        uint256 totalCost = amount + gasUsed;
        require(balanceOf(msg.sender) >= totalCost);
        
        uint256 toBurn = (gasUsed * burnRate) / 100;
        _burn(msg.sender, toBurn);
        _transfer(msg.sender, to, amount);
    }
}
```

### 2. ValidatorRegistry
```solidity
contract ValidatorRegistry {
    struct Validator {
        address operator;
        uint256 stake;
        uint256 reputation;
        uint256 slashable;
        bool active;
    }
    
    mapping(address => Validator) public validators;
    
    function registerValidator(uint256 _stake) external {
        require(_stake >= 32000 * 10**18); // 32k TRAY
        
        validators[msg.sender] = Validator({
            operator: msg.sender,
            stake: _stake,
            reputation: 100,
            slashable: _stake,
            active: true
        });
        
        emit ValidatorRegistered(msg.sender, _stake);
    }
    
    function slashValidator(address _validator, uint256 _amount) external {
        require(msg.sender == oracle); // Only oracle can slash
        Validator storage v = validators[_validator];
        v.slashable -= _amount;
        
        if (v.slashable < 32000 * 10**18) {
            v.active = false;
        }
    }
}
```

### 3. TrayonOracle (Data Registry)
```solidity
contract TrayonOracle {
    struct DataCommitment {
        bytes32 merkleRoot;
        uint256 timestamp;
        address[] validators; // quem validou
        bytes[] signatures;   // BLS signatures
    }
    
    mapping(bytes32 => DataCommitment) public dataHistory;
    
    function commitData(
        bytes32 _merkleRoot,
        address[] calldata _validators,
        bytes[] calldata _signatures
    ) external {
        require(_validators.length >= 2); // min 2 validators
        
        // Verifica assinatura agregada
        bool valid = verifyAggregateSignature(
            _merkleRoot,
            _validators,
            _signatures
        );
        require(valid);
        
        dataHistory[_merkleRoot] = DataCommitment({
            merkleRoot: _merkleRoot,
            timestamp: block.timestamp,
            validators: _validators,
            signatures: _signatures
        });
        
        emit DataCommitted(_merkleRoot);
    }
}
```

---

## 🛡 Segurança & Auditoria

### Auditorias Planejadas

- [ ] Fase 1: Auditoria de contratos (OpenZeppelin/Certora)
- [ ] Fase 2: Auditoria de consenso (Consensys Diligence)
- [ ] Fase 3: Formal verification do ZK-Prover
- [ ] Fase 4: Pentest de infraestrutura

### Responsabilidade Coordenada

- Bug Bounty: até 5% do valor comprometido
- Divulgação: 90 dias antes de publicação
- Comunicação: Discord + Twitter oficial

---

## 📋 Roadmap Arquitetônico

```
Q3 2026: Versão Testnet (Polygon Mumbai)
Q4 2026: Alpha Mainnet (100 validadores)
Q1 2027: Beta Mainnet (1.000 validadores)
Q2 2027: Mainnet completo + Data Availability
```

---

**Versão:** 1.0 | **Data:** 22/08/2026 | **Status:** Especificação Técnica
