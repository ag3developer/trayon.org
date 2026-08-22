# 6. Especificações Técnicas - Trayon Protocol

## 🔧 Stack Técnico

```
┌─────────────────────────────────────────────────┐
│ Frontend & UX                                   │
│ Next.js 14 | TypeScript | TailwindCSS | Wagmi  │
├─────────────────────────────────────────────────┤
│ Backend & APIs                                  │
│ Node.js | Express | FastAPI | PostgreSQL       │
├─────────────────────────────────────────────────┤
│ Blockchain                                      │
│ Solidity 0.8.x | Polygon CDK | Ethereum L1    │
├─────────────────────────────────────────────────┤
│ AI & ML                                         │
│ Python | TensorFlow | PyTorch | Scikit-learn   │
├─────────────────────────────────────────────────┤
│ Cryptography & Proofs                           │
│ ZK-SNARK | BLS Signatures | Merkle Trees       │
└─────────────────────────────────────────────────┘
```

---

## 📐 Arquitetura de Componentes

### 1. Validador Node (Trayon Validator)

```
Trayon Validator Node Architecture:

┌───────────────────────────────────┐
│  Node Operator Interface          │
│  (CLI + Web Dashboard)            │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  State Machine                    │
│  ├─ EVM Compatible                │
│  ├─ Custom Gas Token              │
│  └─ State Storage                 │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  Validator Core                   │
│  ├─ Consensus Handler             │
│  ├─ Stake Manager                 │
│  ├─ Reputation Tracker            │
│  └─ Slashing Engine               │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  AI Processing                    │
│  ├─ Data Ingestion                │
│  ├─ ML Models                     │
│  ├─ Validation Logic              │
│  └─ Signature Generation (BLS)    │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  Network & Storage                │
│  ├─ P2P Network (libp2p)          │
│  ├─ RPC Server                    │
│  ├─ Local DB (LevelDB)            │
│  └─ IPFS Integration              │
└───────────────────────────────────┘
```

### 2. Sequencer Node

```
Trayon Sequencer Architecture:

┌───────────────────────────────────┐
│  Mempool Manager                  │
│  ├─ Transaction validation        │
│  ├─ Fee calculation               │
│  └─ Ordering (fair sort)          │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  Block Producer                   │
│  ├─ Batch creation (2k tx max)   │
│  ├─ State root calculation        │
│  ├─ Timestamp assignment          │
│  └─ Batch signing                 │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  Consensus Coordinator            │
│  ├─ Broadcast to validators       │
│  ├─ Collect signatures (BLS)      │
│  ├─ Verify quorum (2/3 + 1)      │
│  └─ Finalize block                │
└────────────┬──────────────────────┘
             │
┌────────────▼──────────────────────┐
│  Settlement & ZK Proving          │
│  ├─ Generate ZK-proof locally     │
│  ├─ Batch to L1 (Ethereum)        │
│  ├─ Wait for L1 confirmation      │
│  └─ Update state root             │
└───────────────────────────────────┘
```

---

## 🔐 Protocolo de Consenso

### Trayon BFT (Modified PBFT)

```
Consensus Round (Duration: 12 seconds):

T+0s: Block Proposal
├─ Sequencer proposes batch
├─ Includes: txs, state root, timestamp
└─ Broadcasts to validators

T+4s: Validation Phase
├─ Validators execute batch independently
├─ Compute local state root
├─ Compare with sequencer's root
├─ Vote APPROVE/REJECT
└─ Send vote + signature to sequencer

T+8s: Quorum Check
├─ Sequencer collects votes
├─ Requires 2/3 + 1 validators
├─ Aggregates signatures (BLS)
├─ Broadcasts commit message
└─ Or restarts if fails

T+12s: Finality
├─ Block is finalized
├─ State update becomes immutable
├─ Validators update reputation
└─ Ready for next block

Slashing:
├─ If validator voted REJECT but block was approved
│  └─ -5% stake (penalty for false positive)
├─ If validator didn't vote
│  └─ -10% stake (downtime penalty)
└─ If validator double-signed
   └─ -100% stake (byzantine slash)
```

### Threshold Signature Scheme (TSS)

```
BLS Signature Aggregation:

Input: Signatures from validators
├─ sig_1 from validator_1
├─ sig_2 from validator_2
├─ ... (2/3 + 1 minimum)
└─ sig_n from validator_n

Process:
├─ Each signature is on same message (state root)
├─ BLS scheme allows aggregation
├─ Combined signature ≠ concatenation
├─ Compact: 48 bytes regardless of # signers
└─ Verification: Single aggregated check

Output:
└─ aggregated_signature (48 bytes)
   ├─ Can be verified on-chain
   ├─ Proves 2/3 validators approved
   └─ Immutable proof of consensus
```

---

## 📦 Smart Contracts Detalhados

### Contract 1: TrayonToken.sol

```solidity
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrayonToken is ERC20, Ownable {
    // Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B TRAY
    uint256 public constant BURN_RATE = 20; // 20% fee burn
    
    // State
    address public sequencer;
    uint256 public totalBurned;
    mapping(address => bool) public isMinter;
    
    // Events
    event TokensBurned(uint256 amount);
    event GasConsumed(address indexed user, uint256 amount);
    
    constructor() ERC20("Trayon", "TRAY") {
        _mint(msg.sender, TOTAL_SUPPLY);
        sequencer = msg.sender;
    }
    
    // Allow sequencer to burn tokens for gas
    function consumeGas(address user, uint256 amount) external {
        require(msg.sender == sequencer, "Only sequencer");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        // Burn gas amount
        _burn(user, amount);
        totalBurned += amount;
        
        emit GasConsumed(user, amount);
    }
    
    // Manual burn function (for treasury)
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        totalBurned += amount;
        emit TokensBurned(amount);
    }
    
    // Deflation info
    function getCurrentSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    function getDeflationPercentage() external view returns (uint256) {
        uint256 burned = TOTAL_SUPPLY - totalSupply();
        return (burned * 100) / TOTAL_SUPPLY;
    }
}
```

### Contract 2: ValidatorRegistry.sol

```solidity
pragma solidity ^0.8.19;

import "./TrayonToken.sol";

contract ValidatorRegistry {
    // Constants
    uint256 public constant MIN_STAKE = 32_000 * 10**18; // 32k TRAY
    uint256 public constant SLASH_DATA_FALSE = 50; // 50%
    uint256 public constant SLASH_DOWNTIME = 10; // 10%
    uint256 public constant SLASH_BYZANTINE = 100; // 100%
    
    // Structs
    struct Validator {
        address operator;
        uint256 stake;
        uint256 reputation;
        uint256 slashable;
        bool active;
        uint256 joinedAt;
        uint256 lastVotedAt;
    }
    
    // State
    TrayonToken public tray;
    address public oracleManager;
    
    mapping(address => Validator) public validators;
    address[] public validatorList;
    
    uint256 public totalStaked;
    uint256 public totalSlashed;
    
    // Events
    event ValidatorRegistered(address indexed operator, uint256 stake);
    event ValidatorSlashed(address indexed operator, uint256 amount, string reason);
    event ValidatorExited(address indexed operator);
    
    constructor(address _tray) {
        tray = TrayonToken(_tray);
    }
    
    // Register as validator
    function registerValidator() external {
        require(tray.balanceOf(msg.sender) >= MIN_STAKE, "Insufficient stake");
        require(!validators[msg.sender].active, "Already validator");
        
        // Transfer stake to contract
        tray.transferFrom(msg.sender, address(this), MIN_STAKE);
        
        validators[msg.sender] = Validator({
            operator: msg.sender,
            stake: MIN_STAKE,
            reputation: 100,
            slashable: MIN_STAKE,
            active: true,
            joinedAt: block.timestamp,
            lastVotedAt: block.timestamp
        });
        
        validatorList.push(msg.sender);
        totalStaked += MIN_STAKE;
        
        emit ValidatorRegistered(msg.sender, MIN_STAKE);
    }
    
    // Slash validator
    function slashValidator(
        address _validator,
        uint256 _percentage,
        string calldata _reason
    ) external {
        require(msg.sender == oracleManager, "Only oracle");
        require(validators[_validator].active, "Not active");
        
        uint256 slashAmount = (validators[_validator].slashable * _percentage) / 100;
        
        validators[_validator].slashable -= slashAmount;
        totalSlashed += slashAmount;
        
        if (validators[_validator].slashable < MIN_STAKE) {
            validators[_validator].active = false;
        }
        
        // Burn slashed tokens
        tray.burn(slashAmount);
        
        emit ValidatorSlashed(_validator, slashAmount, _reason);
    }
    
    // Exit as validator
    function exitValidator() external {
        require(validators[msg.sender].active, "Not active validator");
        
        validators[msg.sender].active = false;
        
        uint256 returnAmount = validators[msg.sender].slashable;
        tray.transfer(msg.sender, returnAmount);
        
        totalStaked -= validators[msg.sender].stake;
        
        emit ValidatorExited(msg.sender);
    }
    
    // Get active validator count
    function getActiveValidatorCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].active) count++;
        }
        return count;
    }
    
    // Update reputation
    function updateReputation(address _validator, int256 _change) external {
        require(msg.sender == oracleManager, "Only oracle");
        
        int256 newRep = int256(validators[_validator].reputation) + _change;
        if (newRep < 0) newRep = 0;
        if (newRep > 100) newRep = 100;
        
        validators[_validator].reputation = uint256(newRep);
    }
}
```

### Contract 3: TrayonOracle.sol

```solidity
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TrayonOracle {
    // Structs
    struct DataCommitment {
        bytes32 merkleRoot;
        uint256 timestamp;
        address[] validators;
        bytes aggregatedSignature;
        bool finalized;
    }
    
    struct DataQuery {
        bytes32 merkleRoot;
        string dataType;
        uint256 value;
        uint256 precision;
    }
    
    // State
    mapping(bytes32 => DataCommitment) public dataHistory;
    mapping(string => DataQuery) public latestData;
    
    address public oracleManager;
    uint256 public commitmentCount;
    
    // Events
    event DataCommitted(bytes32 indexed merkleRoot, uint256 timestamp);
    event DataQueried(string indexed dataType, uint256 value);
    
    constructor() {
        oracleManager = msg.sender;
    }
    
    // Commit data with multi-sig
    function commitData(
        bytes32 _merkleRoot,
        address[] calldata _validators,
        bytes calldata _aggregatedSignature,
        uint256 _timestamp
    ) external {
        require(msg.sender == oracleManager, "Only oracle");
        require(_validators.length >= 2, "Need at least 2 validators");
        
        // Verify quorum (2/3 + 1)
        // NOTE: Full BLS verification would happen here
        
        dataHistory[_merkleRoot] = DataCommitment({
            merkleRoot: _merkleRoot,
            timestamp: _timestamp,
            validators: _validators,
            aggregatedSignature: _aggregatedSignature,
            finalized: true
        });
        
        commitmentCount++;
        
        emit DataCommitted(_merkleRoot, _timestamp);
    }
    
    // Verify data against commitment
    function verifyData(
        bytes32 _merkleRoot,
        bytes calldata _data,
        bytes32[] calldata _proof
    ) external view returns (bool) {
        require(dataHistory[_merkleRoot].finalized, "Not finalized");
        
        // Merkle proof verification
        bytes32 leaf = keccak256(abi.encodePacked(_data));
        bytes32 computed = leaf;
        
        for (uint256 i = 0; i < _proof.length; i++) {
            if (computed < _proof[i]) {
                computed = keccak256(abi.encodePacked(computed, _proof[i]));
            } else {
                computed = keccak256(abi.encodePacked(_proof[i], computed));
            }
        }
        
        return computed == _merkleRoot;
    }
    
    // Get historical data
    function getCommitment(bytes32 _merkleRoot) 
        external 
        view 
        returns (DataCommitment memory) 
    {
        return dataHistory[_merkleRoot];
    }
}
```

---

## 🧠 Modelos de IA Utilizados

### 1. Fraud Detection Model

```python
# fraud_detector.py
import numpy as np
from sklearn.ensemble import IsolationForest, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

class FraudDetectionModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.isolation_forest = IsolationForest(contamination=0.05)
        self.gb_classifier = GradientBoostingClassifier()
        self.nn_model = self._build_neural_network()
    
    def _build_neural_network(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_dim=20),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model
    
    def extract_features(self, transaction):
        """Extract 20 features from transaction"""
        return np.array([
            transaction['amount'],
            transaction['account_age_days'],
            transaction['num_previous_tx'],
            transaction['avg_tx_amount'],
            transaction['time_since_last_tx'],
            transaction['recipient_account_age'],
            transaction['recipient_country_risk'],
            transaction['device_fingerprint_score'],
            transaction['ip_proxy_risk'],
            transaction['email_validity_score'],
            # ... 10 more features
        ])
    
    def predict_fraud(self, transaction):
        """Returns fraud probability 0-1"""
        features = self.extract_features(transaction)
        features = self.scaler.transform([features])
        
        # Ensemble voting
        scores = []
        
        # Isolation Forest
        iso_score = -self.isolation_forest.score_samples([features[0]])
        scores.append(iso_score[0])
        
        # Gradient Boosting
        gb_score = self.gb_classifier.predict_proba([features[0]])[0][1]
        scores.append(gb_score)
        
        # Neural Network
        nn_score = self.nn_model.predict([features[0]])[0][0]
        scores.append(nn_score)
        
        # Average scores
        fraud_probability = np.mean(scores)
        return float(fraud_probability)
```

### 2. Time Series Forecasting

```python
# forecast_model.py
import tensorflow as tf
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

class PriceForecaster:
    def __init__(self):
        self.lstm_model = self._build_lstm()
        self.sarima_model = None
    
    def _build_lstm(self):
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, activation='relu', input_shape=(30, 1)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(25, activation='relu'),
            tf.keras.layers.Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        return model
    
    def forecast_24h(self, price_history: list):
        """
        Forecasts price for next 24 hours
        Input: Last 30 days of prices
        Output: Predicted price + confidence interval
        """
        # Prepare LSTM input
        X = np.array(price_history).reshape(-1, 30, 1)
        
        # LSTM prediction
        lstm_pred = self.lstm_model.predict(X)
        
        # ARIMA/SARIMA for trend
        sarima = SARIMAX(price_history, order=(1,1,1), seasonal_order=(1,1,1,7))
        sarima_fit = sarima.fit()
        sarima_pred = sarima_fit.forecast(steps=1)
        
        # Ensemble
        final_pred = (lstm_pred[0][0] + sarima_pred[0]) / 2
        
        # Confidence interval (±2%)
        confidence_interval = [final_pred * 0.98, final_pred * 1.02]
        
        return {
            'prediction': final_pred,
            'interval': confidence_interval,
            'confidence': 0.74
        }
```

---

## 📊 Database Schema

### PostgreSQL Tables

```sql
-- Validators table
CREATE TABLE validators (
    id SERIAL PRIMARY KEY,
    operator_address BYTEA NOT NULL UNIQUE,
    stake DECIMAL(38, 18) NOT NULL,
    reputation INT DEFAULT 100,
    slashable DECIMAL(38, 18) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_voted_at TIMESTAMP,
    uptime_percentage DECIMAL(5, 2),
    INDEX idx_operator (operator_address)
);

-- Data commitments table
CREATE TABLE data_commitments (
    id SERIAL PRIMARY KEY,
    merkle_root BYTEA NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    num_validators INT NOT NULL,
    aggregated_signature BYTEA,
    finalized BOOLEAN DEFAULT FALSE,
    data_type VARCHAR(50),
    ipfs_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_merkle_root (merkle_root),
    INDEX idx_timestamp (timestamp)
);

-- Validator votes table
CREATE TABLE validator_votes (
    id SERIAL PRIMARY KEY,
    validator_id INT REFERENCES validators(id),
    commitment_id INT REFERENCES data_commitments(id),
    vote BOOLEAN NOT NULL,
    signature BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(validator_id, commitment_id)
);

-- Data values table
CREATE TABLE data_values (
    id SERIAL PRIMARY KEY,
    commitment_id INT REFERENCES data_commitments(id),
    data_type VARCHAR(50) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value DECIMAL(38, 18),
    unit VARCHAR(50),
    source VARCHAR(255),
    validated BOOLEAN DEFAULT FALSE,
    INDEX idx_data_type (data_type),
    INDEX idx_key (key)
);

-- Slashing events table
CREATE TABLE slashing_events (
    id SERIAL PRIMARY KEY,
    validator_id INT REFERENCES validators(id),
    reason VARCHAR(255),
    slash_percentage INT,
    amount_slashed DECIMAL(38, 18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_validator (validator_id)
);
```

---

## 🔍 API Specification

### Trayon Node RPC API

```json
{
  "jsonrpc": "2.0",
  "methods": [
    {
      "name": "tray_getValidators",
      "description": "Get list of active validators",
      "params": [],
      "result": {
        "type": "array",
        "items": {
          "address": "0x...",
          "stake": "32000000000000000000",
          "reputation": 100,
          "active": true
        }
      }
    },
    {
      "name": "tray_commitData",
      "description": "Commit data to blockchain",
      "params": [
        {
          "name": "merkleRoot",
          "type": "bytes32"
        },
        {
          "name": "validators",
          "type": "address[]"
        },
        {
          "name": "signature",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "tray_verifyData",
      "description": "Verify data against commitment",
      "params": [
        {
          "name": "merkleRoot",
          "type": "bytes32"
        },
        {
          "name": "data",
          "type": "bytes"
        },
        {
          "name": "proof",
          "type": "bytes32[]"
        }
      ],
      "result": {
        "type": "boolean"
      }
    }
  ]
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```
Coverage Target: 95%+

├─ Token contract: 50 tests
├─ Validator registry: 45 tests
├─ Oracle contract: 40 tests
├─ Consensus logic: 30 tests
└─ AI models: 25 tests
```

### Integration Tests
```
├─ Validator registration → staking → voting
├─ Data ingestion → validation → commitment
├─ Slashing mechanism
├─ ZK-proof verification
└─ End-to-end transactions
```

### Security Testing
```
├─ Fuzzing (differential fuzzing)
├─ Symbolic execution (formal methods)
├─ Reentrancy analysis
├─ Integer overflow/underflow
└─ Access control verification
```

---

## 📋 Performance Benchmarks

| Operation | Latency | Throughput |
|-----------|---------|-----------|
| **Data commitment** | 50ms | 2k/sec |
| **Validator vote** | 30ms | 5k/sec |
| **ZK-proof gen** | 5min | 1/5min |
| **Settlement L1** | 30min | 1 batch/2h |
| **Data verification** | 100ms | 1k/sec |

---

**Versão:** 1.0 | **Data:** 22/08/2026 | **Status:** Especificação Técnica Detalhada
