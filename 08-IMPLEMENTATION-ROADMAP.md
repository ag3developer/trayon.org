# 8. Roadmap de Implementação - Trayon Protocol

## 🎯 Visão Geral

Este documento estrutura o caminho completo de implementação do Trayon, dividido em **4 fases** (Phase 0-3):
- **Phase 0**: Setup inicial + Smart Contracts básicos (3-4 semanas)
- **Phase 1**: Backend + Validadores (6-8 semanas)
- **Phase 2**: Layer 2 Core + Polygon CDK (8-10 semanas)
- **Phase 3**: AI Oracle + Integração (ongoing)

---

## 📦 Phase 0: Setup Inicial & Smart Contracts (Semanas 1-4)

### 0.1 - Repositórios & Estrutura

```
trayon.org/
├── web/                          # Frontend Next.js (já existe)
├── contracts/                    # ✨ NOVO: Smart Contracts Solidity
│   ├── src/
│   │   ├── tokens/
│   │   │   ├── TRAY.sol         # ERC-20 + Gas Token
│   │   │   └── TRAYStaking.sol  # Staking contract
│   │   ├── oracle/
│   │   │   ├── OracleManager.sol
│   │   │   ├── DataFeed.sol
│   │   │   └── AIOracle.sol
│   │   ├── l2/
│   │   │   ├── SequencerRegistry.sol
│   │   │   ├── ValidatorRegistry.sol
│   │   │   └── L2Bridge.sol
│   │   └── governance/
│   │       ├── TrayDAO.sol
│   │       └── TimeLock.sol
│   ├── test/
│   ├── scripts/deploy/
│   └── hardhat.config.ts        # Hardhat + Ethers v6
│
├── validator/                    # ✨ NOVO: Validator Node
│   ├── src/
│   │   ├── node/
│   │   │   ├── core.ts
│   │   │   ├── consensus.ts
│   │   │   └── state-machine.ts
│   │   ├── validator/
│   │   │   ├── staking.ts
│   │   │   ├── slashing.ts
│   │   │   └── reputation.ts
│   │   ├── ai/
│   │   │   ├── inference.ts
│   │   │   └── validation.ts
│   │   ├── network/
│   │   │   ├── p2p.ts
│   │   │   ├── rpc.ts
│   │   │   └── sync.ts
│   │   └── cli.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # ✨ NOVO: Backend API
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   └── middleware/
│   │   ├── services/
│   │   │   ├── blockchain.ts
│   │   │   ├── oracle.ts
│   │   │   └── data-ingestion.ts
│   │   ├── database/
│   │   │   ├── models/
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── app.ts
│   ├── package.json
│   └── docker-compose.yml
│
└── docs/                         # Documentação técnica
    ├── CONTRACTS-API.md
    ├── VALIDATOR-SETUP.md
    ├── BACKEND-API.md
    └── DEPLOYMENT.md
```

**Ação imediata:**
```bash
# Criar diretórios
mkdir -p contracts/src/{tokens,oracle,l2,governance} contracts/{test,scripts/deploy}
mkdir -p validator/src/{node,validator,ai,network}
mkdir -p backend/src/{api,services,database}

# Inicializar repos
cd contracts && npm init -y
cd ../validator && npm init -y
cd ../backend && npm init -y
```

---

### 0.2 - Contratos de Token (TRAY.sol)

**Arquivo:** `contracts/src/tokens/TRAY.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title TRAY Token
 * @dev ERC-20 Token + Custom Gas Token para Trayon L2
 * - Supply total: 1 bilhão (1e27 em wei com 18 decimals)
 * - Queima programada via fee mechanism
 * - Suporte a gás customizado (será habilitado em L2)
 */
contract TRAY is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    
    // Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 bilhão
    uint256 public constant INITIAL_SUPPLY = 250_000_000 * 10**18; // 25% no launch
    
    // State
    address public l2SequencerAddress;
    uint256 public feeBurnPercentage = 20; // 20% de burn
    uint256 public feeValidatorPercentage = 70; // 70% para validadores
    uint256 public feeTreasuryPercentage = 10; // 10% para treasury
    
    address public treasury;
    bool public gasTokenEnabled = false;
    
    // Events
    event GasTokenEnabled(uint256 timestamp);
    event FeeBurned(uint256 amount);
    event FeeDistributed(uint256 validatorFee, uint256 treasuryFee);
    
    constructor(address _treasury) ERC20("TRAY", "TRAY") ERC20Permit("TRAY") Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        
        // Mint supply inicial
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Enable gas token mode (chamado apenas 1x na ativação de L2)
     */
    function enableGasToken() external onlyOwner {
        require(!gasTokenEnabled, "Already enabled");
        gasTokenEnabled = true;
        emit GasTokenEnabled(block.timestamp);
    }
    
    /**
     * @dev Processar fee de transação
     * Quebra: 70% validadores, 20% burn, 10% treasury
     */
    function processFee(uint256 totalFee, address validatorReward) external onlyOwner {
        require(totalFee > 0, "Fee must be > 0");
        
        uint256 burnAmount = (totalFee * feeBurnPercentage) / 100;
        uint256 validatorAmount = (totalFee * feeValidatorPercentage) / 100;
        uint256 treasuryAmount = (totalFee * feeTreasuryPercentage) / 100;
        
        // Burn
        _burn(address(this), burnAmount);
        emit FeeBurned(burnAmount);
        
        // Distribuir a validadores e treasury
        _transfer(address(this), validatorReward, validatorAmount);
        _transfer(address(this), treasury, treasuryAmount);
        
        emit FeeDistributed(validatorAmount, treasuryAmount);
    }
    
    /**
     * @dev Mint adicional apenas para DAO governance (futura)
     */
    function mintByDAO(uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, amount);
    }
    
    /**
     * @dev Permitir queima direta por holders
     */
    function burn(uint256 amount) public override(ERC20Burnable) {
        super.burn(amount);
        emit FeeBurned(amount);
    }
}
```

**Deployment script:** `contracts/scripts/deploy/01-tray.ts`
```typescript
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const treasuryAddress = "0x..."; // TODO: address real
  
  console.log("Deploying TRAY token...");
  
  const TRAY = await hre.ethers.getContractFactory("TRAY");
  const tray = await TRAY.deploy(treasuryAddress);
  
  await tray.waitForDeployment();
  const address = await tray.getAddress();
  
  console.log("✅ TRAY deployed to:", address);
  
  // Verify on Etherscan
  if (process.env.NETWORK !== "hardhat") {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [treasuryAddress],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

---

### 0.3 - Staking Contract

**Arquivo:** `contracts/src/tokens/TRAYStaking.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TRAY Staking
 * @dev Staking pool para validadores (32.000 TRAY mínimo)
 * - APY: 8% (6% bloco + 2% comissão de dados)
 * - Lockup: flexível com withdraw delay
 * - Slashing: penalidades por má conduta
 */
contract TRAYStaking is ReentrancyGuard, Ownable {
    
    IERC20 public trayToken;
    
    uint256 public constant VALIDATOR_STAKE = 32_000 * 10**18; // 32k TRAY
    uint256 public constant MIN_STAKE = 100 * 10**18; // 100 TRAY para teste
    uint256 public constant APY = 8; // 8% annual
    uint256 public constant WITHDRAW_DELAY = 7 days;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastRewardTime;
        uint256 pendingWithdraw;
        uint256 withdrawRequestTime;
    }
    
    mapping(address => Stake) public stakes;
    address[] public stakers;
    
    uint256 public totalStaked;
    
    event Staked(address indexed staker, uint256 amount);
    event UnstakeRequested(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event RewardClaimed(address indexed staker, uint256 reward);
    event Slashed(address indexed staker, uint256 amount, string reason);
    
    constructor(address _trayToken) Ownable(msg.sender) {
        trayToken = IERC20(_trayToken);
    }
    
    /**
     * @dev Stake TRAY tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount >= MIN_STAKE, "Below minimum stake");
        require(trayToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (stakes[msg.sender].amount == 0) {
            stakers.push(msg.sender);
        }
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastRewardTime = block.timestamp;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Calcular rewards baseado em tempo
     */
    function calculateReward(address staker) public view returns (uint256) {
        Stake memory stake = stakes[staker];
        if (stake.amount == 0) return 0;
        
        uint256 stakedDuration = block.timestamp - stake.lastRewardTime;
        uint256 yearInSeconds = 365 days;
        
        return (stake.amount * APY * stakedDuration) / (100 * yearInSeconds);
    }
    
    /**
     * @dev Claim rewards (minting via TRAY contract)
     */
    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards");
        
        stakes[msg.sender].lastRewardTime = block.timestamp;
        
        // Recompensa é emitida pelo owner (TRAY contract)
        require(trayToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Request unstake (withdraw delay aplicado)
     */
    function requestUnstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        stakes[msg.sender].pendingWithdraw = amount;
        stakes[msg.sender].withdrawRequestTime = block.timestamp;
    }
    
    /**
     * @dev Executar unstake após delay
     */
    function completeUnstake() external nonReentrant {
        Stake storage stake = stakes[msg.sender];
        require(stake.pendingWithdraw > 0, "No pending withdraw");
        require(
            block.timestamp >= stake.withdrawRequestTime + WITHDRAW_DELAY,
            "Withdraw delay not passed"
        );
        
        uint256 amount = stake.pendingWithdraw;
        stake.amount -= amount;
        stake.pendingWithdraw = 0;
        
        totalStaked -= amount;
        
        require(trayToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Slashing para má conduta (chamado por validadores)
     */
    function slash(address staker, uint256 percentage, string calldata reason) external onlyOwner {
        uint256 slashAmount = (stakes[staker].amount * percentage) / 100;
        stakes[staker].amount -= slashAmount;
        totalStaked -= slashAmount;
        
        emit Slashed(staker, slashAmount, reason);
    }
    
    /**
     * @dev Get all stakers
     */
    function getAllStakers() external view returns (address[] memory) {
        return stakers;
    }
}
```

---

### 0.4 - Oracle Manager Contract

**Arquivo:** `contracts/src/oracle/OracleManager.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Oracle Manager
 * @dev Gerencia oráculos de dados e feeds de IA
 * - Validadores registram dados
 * - Dados são consolidados e certificados
 * - Consultas pagam taxa em TRAY
 */
contract OracleManager is Ownable {
    
    IERC20 public trayToken;
    
    struct DataFeed {
        bytes32 feedId;
        string dataType; // "tokenomics", "market", "ai_prediction"
        address submitter;
        bytes data;
        uint256 timestamp;
        bool certified;
    }
    
    struct OracleValidator {
        address validatorAddress;
        uint256 reputation;
        uint256 dataSubmitted;
        bool isActive;
    }
    
    mapping(bytes32 => DataFeed) public dataFeeds;
    mapping(address => OracleValidator) public validators;
    
    address[] public validatorList;
    bytes32[] public feedHistory;
    
    uint256 public queryFee = 1000 * 10**18; // 1000 TRAY
    
    event DataSubmitted(bytes32 indexed feedId, address indexed validator, string dataType);
    event DataCertified(bytes32 indexed feedId);
    event QueryExecuted(address indexed querier, bytes32 indexed feedId, uint256 fee);
    event ValidatorRegistered(address indexed validator);
    
    constructor(address _trayToken) Ownable(msg.sender) {
        trayToken = IERC20(_trayToken);
    }
    
    /**
     * @dev Registrar validador de oracle
     */
    function registerValidator(address validatorAddress) external onlyOwner {
        require(validatorAddress != address(0), "Invalid address");
        
        validators[validatorAddress] = OracleValidator({
            validatorAddress: validatorAddress,
            reputation: 100,
            dataSubmitted: 0,
            isActive: true
        });
        
        validatorList.push(validatorAddress);
        emit ValidatorRegistered(validatorAddress);
    }
    
    /**
     * @dev Submeter dado de oracle
     */
    function submitData(
        string calldata dataType,
        bytes calldata data,
        bytes calldata signature
    ) external {
        require(validators[msg.sender].isActive, "Not a registered validator");
        
        bytes32 feedId = keccak256(abi.encodePacked(dataType, data, block.timestamp));
        
        dataFeeds[feedId] = DataFeed({
            feedId: feedId,
            dataType: dataType,
            submitter: msg.sender,
            data: data,
            timestamp: block.timestamp,
            certified: false
        });
        
        feedHistory.push(feedId);
        validators[msg.sender].dataSubmitted++;
        
        emit DataSubmitted(feedId, msg.sender, dataType);
    }
    
    /**
     * @dev Certificar dado (multi-sig by validators)
     */
    function certifyData(bytes32 feedId) external onlyOwner {
        require(dataFeeds[feedId].feedId != bytes32(0), "Feed not found");
        
        dataFeeds[feedId].certified = true;
        validators[dataFeeds[feedId].submitter].reputation += 10;
        
        emit DataCertified(feedId);
    }
    
    /**
     * @dev Consultar data feed (com pagamento em TRAY)
     */
    function queryData(bytes32 feedId) external returns (bytes memory) {
        require(dataFeeds[feedId].certified, "Data not certified");
        require(trayToken.transferFrom(msg.sender, address(this), queryFee), "Payment failed");
        
        emit QueryExecuted(msg.sender, feedId, queryFee);
        
        return dataFeeds[feedId].data;
    }
    
    /**
     * @dev Get recent feeds
     */
    function getRecentFeeds(uint256 limit) external view returns (bytes32[] memory) {
        uint256 length = feedHistory.length < limit ? feedHistory.length : limit;
        bytes32[] memory result = new bytes32[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = feedHistory[feedHistory.length - 1 - i];
        }
        
        return result;
    }
}
```

---

### 0.5 - Hardhat Config

**Arquivo:** `contracts/hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};

export default config;
```

---

### 0.6 - Testing Setup

**Arquivo:** `contracts/test/TRAY.test.ts`

```typescript
import { expect } from "chai";
import hre from "hardhat";
import { TRAY } from "../typechain-types";

describe("TRAY Token", function () {
  let tray: TRAY;
  let owner: any;
  let treasury: any;
  let addr1: any;

  beforeEach(async () => {
    [owner, treasury, addr1] = await hre.ethers.getSigners();

    const TRAYFactory = await hre.ethers.getContractFactory("TRAY");
    tray = await TRAYFactory.deploy(treasury.address);
    await tray.waitForDeployment();
  });

  it("Should deploy with correct supply", async () => {
    const totalSupply = await tray.totalSupply();
    const expectedSupply = hre.ethers.parseEther("250000000");
    expect(totalSupply).to.equal(expectedSupply);
  });

  it("Should burn tokens", async () => {
    const burnAmount = hre.ethers.parseEther("1000");
    await tray.burn(burnAmount);

    const balance = await tray.balanceOf(owner.address);
    const expectedBalance = hre.ethers.parseEther("250000000").sub(burnAmount);
    expect(balance).to.equal(expectedBalance);
  });

  it("Should process fee correctly", async () => {
    const fee = hre.ethers.parseEther("1000");
    await tray.transfer(tray.getAddress(), fee);

    await tray.processFee(fee, addr1.address);

    const validatorReward = fee.mul(70).div(100);
    const balance = await tray.balanceOf(addr1.address);
    expect(balance).to.equal(validatorReward);
  });
});
```

---

## 📋 Phase 0 Checklist

- [ ] Criar diretórios de repositórios
- [ ] Setup Hardhat + dependências
- [ ] Implementar TRAY.sol
- [ ] Implementar TRAYStaking.sol
- [ ] Implementar OracleManager.sol
- [ ] Escrever testes unitários
- [ ] Validar coverage (>80%)
- [ ] Deploy em Sepolia testnet
- [ ] Verificar contracts em Etherscan

---

## ⏭️ Próxima Seção: Phase 1 (Backend + Validadores)

Pronto para continuar com:
1. **Backend API** (Express + PostgreSQL)
2. **Validator Node Core** (P2P + Consensus)
3. **Data Ingestion Pipeline** (Python)

Quer que eu continue com Phase 1? 👉

