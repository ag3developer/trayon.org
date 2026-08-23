# 🎯 PLANO DE AÇÃO - AUDITORIA CODEBASE TRAYON
**Data:** 23/08/2026 | **Urgência:** 🔴 CRÍTICA  
**Dono:** Lead Engineer | **Revisor:** CTO

---

## 📌 SUMÁRIO 30 SEGUNDOS

```
STATUS ATUAL:      72% Pronto para Produção
BLOQUEADORES:      3 críticos (Backend, P2P, Testes)
PRAZO PRODUÇÃO:    6-8 semanas com execução paralela
AÇÕES HOJE:        5 quick wins (2-4 horas)
PRÓXIMA SEMANA:    3 sprints paralelos (CRÍTICO)
```

---

## 🚨 PRIORIDADES (em ordem de execução)

### PRIORITY 1: TODAY (0-4 horas) ⏰ QUICK WINS

#### ✅ 1.1 Remover Código Morto

**O QUE:** Remover 3 arquivos obsoletos + 1 contrato teste  
**TEMPO:** 15 minutos  
**IMPACTO:** Clareza, -400 linhas confusão

```bash
# Ação
rm contracts/src/Counter.sol          # Contrato de teste (14 linhas)
rm validator/src/consensus-raft.ts    # Legacy Raft (descartado)
rm contracts/.env.save                # Manual backup (risco segurança)
rm relayer/.env.local                 # Duplicado com .env

# Verify
git status  # Confirma deletions
git diff    # Review changes

# Commit
git add -A
git commit -m "chore: remove dead code and obsolete files

- Remove Counter.sol (test-only contract)
- Remove consensus-raft.ts (legacy implementation)
- Remove .env files duplication
- Cleanup obsolete backups"
```

---

#### ✅ 1.2 Verificar/Atualizar .gitignore

**O QUE:** Garantir 1.8 GB de bloat está ignorado  
**TEMPO:** 15 minutos  
**IMPACTO:** Evita bloat em git

```bash
# Verify current .gitignore tem:
cat .gitignore | grep -E "node_modules|\.next|dist|build|\.env$|\.log"

# Adicionar se falta:
cat >> .gitignore << 'EOF'

# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
.next/
out/
contracts/out/

# Logs
*.log
logs/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF

# Verify
git check-ignore -v web/node_modules/* | head
git check-ignore -v relayer/dist/* | head
git check-ignore -v web/.next/* | head
# Deveriam estar IGNORED

# Se já estavam tracked, remove do git (não deleta disco):
git rm --cached -r node_modules/
git rm --cached -r web/.next/
git rm --cached -r relayer/dist/
git commit -m "chore: gitignore large build artifacts"
```

---

#### ✅ 1.3 Consolidar Deploy Scripts

**O QUE:** Reduzir 8 scripts em 3 genéricos  
**TEMPO:** 1.5 hora  
**IMPACTO:** Manutenção simplificada

```bash
# Criar estrutura
mkdir -p scripts

# Script 1: deploy.sh (generic deploy)
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
set -e

ENV=${1:-dev}
NETWORK=${2:-sepolia}

case $ENV in
  dev)
    echo "🚀 Deploying to DEV environment..."
    npx hardhat run contracts/script/deploy.ts --network $NETWORK
    ;;
  staging)
    echo "🚀 Deploying to STAGING environment..."
    DEPLOYER_KEY=$STAGING_KEY npx hardhat run contracts/script/deploy.ts --network $NETWORK
    ;;
  prod)
    echo "🚀 Deploying to PRODUCTION environment..."
    # Extra validation
    npm run test
    DEPLOYER_KEY=$PROD_KEY npx hardhat run contracts/script/deploy.ts --network mainnet
    ;;
  *)
    echo "Usage: deploy.sh [dev|staging|prod] [network]"
    exit 1
    ;;
esac

echo "✅ Deployment complete!"
EOF

# Script 2: test.sh
cat > scripts/test.sh << 'EOF'
#!/bin/bash
set -e

echo "🧪 Running tests..."
npm run test -- --coverage

echo "✅ All tests passed!"
EOF

# Script 3: validate.sh (post-deploy validation)
cat > scripts/validate.sh << 'EOF'
#!/bin/bash
set -e

NETWORK=${1:-sepolia}

echo "🔍 Validating deployment on $NETWORK..."
npx hardhat run contracts/script/validate.ts --network $NETWORK

echo "✅ Validation passed!"
EOF

# Make executable
chmod +x scripts/*.sh

# Remove old scripts
rm -f contracts/DEPLOY_NOW.sh contracts/DEPLOY_NOW_PROD.sh \
      contracts/DEPLOY_PRODUCTION.sh contracts/DEPLOY_WITH_PROXY.sh \
      contracts/WAIT_AND_DEPLOY.sh contracts/TEST_RPC.sh \
      contracts/test-deploy-local.sh

# Test novo script
./scripts/deploy.sh dev sepolia
```

**Antes:** 8 scripts duplicados  
**Depois:** 3 scripts parametrizados + 1 README

---

#### ✅ 1.4 Documentar na Sessão

**O QUE:** Criar session memory com findings  
**TEMPO:** 30 minutos  
**IMPACTO:** Referência para equipe

```markdown
# Criado em /memories/session/REPOSITORY_AUDIT_COMPLETE.md
- 400+ linhas de análise detalhada
- Matriz de duplicatas
- Recomendações priorizadas
- Timeline para produção
```

---

### PRIORITY 2: THIS WEEK (1 semana) 🔴 CRÍTICO - PARALELO

#### 🔴 2.1 BLOCKER #1: Backend ORM Implementation

**DONO:** Backend Lead Dev  
**TEMPO:** 3-4 dias  
**LINHAS:** +800-1200  
**IMPACTO:** CRÍTICO (sem isso, sem persistência)

**Step-by-Step:**

```bash
# 1. Setup Sequelize
cd backend
npm install --save sequelize pg sequelize-typescript reflect-metadata
npm install --save-dev @types/sequelize

# 2. Create models/ directory
mkdir -p src/models

# 3. Create base model
cat > src/models/BaseModel.ts << 'EOF'
import { DataTypes, Model } from 'sequelize';

export abstract class BaseModel extends Model {
  public id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const BaseAttributes = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
};
EOF

# 4. Create 9 models (from schema.sql)
# - User
# - Validator
# - Transaction
# - Bridge
# - Staking
# - TokenAllocation
# - AuditReport
# - Anomaly
# - FeeDistribution

# Example User model:
cat > src/models/User.ts << 'EOF'
import { DataTypes } from 'sequelize';
import { BaseModel, BaseAttributes } from './BaseModel';

export class User extends BaseModel {
  public address!: string;
  public nonce!: number;
  public balance!: string;
  public isValidator!: boolean;
}

export default (sequelize: any) => {
  User.init(
    {
      ...BaseAttributes,
      address: {
        type: DataTypes.STRING(42),
        unique: true,
        allowNull: false,
      },
      nonce: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.DECIMAL(78, 0),
        defaultValue: 0,
      },
      isValidator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { sequelize, tableName: 'users' }
  );
  return User;
};
EOF

# 5. Create services/ layer
mkdir -p src/services

cat > src/services/UserService.ts << 'EOF'
import { User } from '../models/User';

export class UserService {
  async createUser(address: string) {
    return await User.create({ address });
  }

  async getUser(address: string) {
    return await User.findOne({ where: { address } });
  }

  async updateBalance(address: string, balance: string) {
    const user = await this.getUser(address);
    if (user) {
      user.balance = balance;
      await user.save();
    }
    return user;
  }
}
EOF

# 6. Update backend/src/app.ts
# Import database initialization
# Connect before starting server

# 7. Create API endpoints using services
# Instead of: res.json({ data: 'mock' })
# Do: return await UserService.getUser(address)

# 8. Add tests
mkdir -p tests/unit
# Create test for UserService

# Commit
git add backend/src/models backend/src/services
git commit -m "feat: add Sequelize ORM models and services

Adds:
- 9 core models (User, Validator, Transaction, etc.)
- Business logic services layer
- Database integration
- Type-safe Sequelize setup"
```

**Checklist:**
- [ ] Sequelize installed
- [ ] All 9 models created
- [ ] Services layer implemented
- [ ] Database connection working
- [ ] API endpoints using services (not mocks)
- [ ] Tests for critical paths
- [ ] PR reviewed + merged

---

#### 🔴 2.2 BLOCKER #2: P2P Networking for Validator

**DONO:** Validator Lead Dev  
**TEMPO:** 3-4 dias  
**LINHAS:** +400-600  
**IMPACTO:** CRÍTICO (sem isso, sem validadores distribuídos)

```bash
# 1. Install libp2p
cd validator
npm install libp2p @libp2p/tcp @libp2p/noise @libp2p/mplex \
                   @libp2p/kadDHT @libp2p/pubsub-core

# 2. Create P2P node wrapper
cat > src/network/libp2p-node.ts << 'EOF'
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@libp2p/noise';
import { mplex } from '@libp2p/mplex';
import { gossipsub } from '@libp2p/gossipsub';
import { kadDHT } from '@libp2p/kad-dht';

export class P2PNode {
  private libp2p: any;

  async initialize(peerId: string, port: number) {
    this.libp2p = await createLibp2p({
      addresses: {
        listen: [`/ip4/0.0.0.0/tcp/${port}`],
      },
      transports: [tcp()],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      peerDiscovery: [kadDHT()],
      pubsub: gossipsub(),
    });

    await this.libp2p.start();
    console.log(`P2P node started on port ${port}`);
  }

  async publishBFTMessage(message: any) {
    await this.libp2p.pubsub.publish('bft-consensus', 
      Buffer.from(JSON.stringify(message)));
  }

  subscribeToMessages(callback: Function) {
    this.libp2p.pubsub.subscribe('bft-consensus', (msg: any) => {
      callback(JSON.parse(msg.data.toString()));
    });
  }

  async dial(peerAddress: string) {
    await this.libp2p.dial(peerAddress);
  }

  getPeerCount(): number {
    return this.libp2p.getConnections().length;
  }
}
EOF

# 3. Integrate with BFT consensus
cat >> src/consensus/bft.ts << 'EOF'
// Add to BFTConsensus class
private p2p: P2PNode;

async initializeP2P(nodeId: string, port: number) {
  this.p2p = new P2PNode();
  await this.p2p.initialize(nodeId, port);
  
  // Subscribe to incoming BFT messages
  this.p2p.subscribeToMessages((msg: BFTMessage) => {
    this.handleIncomingMessage(msg);
  });
}

async broadcastMessage(message: BFTMessage) {
  await this.p2p.publishBFTMessage(message);
}
EOF

# 4. Create discovery mechanism
cat > src/network/peer-discovery.ts << 'EOF'
export class PeerDiscovery {
  async discoverBootstrapPeers(bootstrapNodes: string[]) {
    // Connect to bootstrap nodes
    // Discover other peers via DHT
  }
  
  async registerAsPeer(publicKey: string, port: number) {
    // Register in DHT
  }
}
EOF

# 5. Test locally with 3 validators
cat > tests/integration/p2p.test.ts << 'EOF'
describe('P2P Networking', () => {
  it('should connect multiple validators', async () => {
    // Start 3 nodes
    // Verify they can see each other
    // Verify message passing works
  });
  
  it('should handle peer disconnection', async () => {
    // Disconnect one peer
    // Verify consensus continues
  });
});
EOF

# Commit
git add src/network src/consensus
git commit -m "feat: implement P2P networking with libp2p

Adds:
- libp2p-based peer-to-peer communication
- BFT message broadcasting
- Peer discovery via DHT
- Multi-validator support"
```

**Checklist:**
- [ ] libp2p installed and configured
- [ ] P2P node class created
- [ ] BFT integration complete
- [ ] Message broadcasting working
- [ ] Local 3-node test passing
- [ ] Peer discovery implemented
- [ ] PR reviewed + merged

---

#### 🔴 2.3 BLOCKER #3: Frontend Wallet Integration

**DONO:** Frontend Lead Dev  
**TEMPO:** 2-3 dias  
**LINHAS:** +300-500  
**IMPACTO:** ALTO (necessário para user interaction)

```bash
# 1. Install wallet libraries
cd web
npm install ethers @web3-react/core @web3-react/injected-connector \
           @web3-react/types

# 2. Create wallet context
cat > src/lib/web3Context.tsx << 'EOF'
import React, { createContext, useContext, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

export const Web3Context = createContext<any>(null);

const injected = new InjectedConnector({
  supportedChainIds: [
    1,           // Mainnet
    5,           // Goerli
    11155111,    // Sepolia
  ],
});

export const Web3Provider: React.FC = ({ children }) => {
  const { activate, account, library } = useWeb3React();
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      await activate(injected);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet', error);
    }
  };

  return (
    <Web3Context.Provider value={{
      connectWallet,
      account,
      library,
      isConnected,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
EOF

# 3. Create Bridge component
cat > src/components/Bridge.tsx << 'EOF'
import React from 'react';
import { useWeb3 } from '@/lib/web3Context';

export const Bridge: React.FC = () => {
  const { account, connectWallet, library } = useWeb3();
  const [amount, setAmount] = React.useState('');

  const handleDeposit = async () => {
    if (!account || !library) {
      connectWallet();
      return;
    }
    
    // TODO: Call contract via ethers.js
    const contract = new ethers.Contract(
      BRIDGE_L1_ADDRESS,
      BRIDGE_ABI,
      library.getSigner()
    );
    
    const tx = await contract.deposit(ethers.parseEther(amount));
    await tx.wait();
  };

  return (
    <div className="p-8">
      <h1>Bridge</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {account}</p>
          <input 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <button onClick={handleDeposit}>Deposit</button>
        </>
      )}
    </div>
  );
};
EOF

# 4. Create Staking component
cat > src/components/Staking.tsx << 'EOF'
import React from 'react';
import { useWeb3 } from '@/lib/web3Context';

export const Staking: React.FC = () => {
  const { account, library } = useWeb3();
  const [stakeAmount, setStakeAmount] = React.useState('');

  const handleStake = async () => {
    // TODO: Call staking contract
  };

  return (
    <div className="p-8">
      <h1>Staking</h1>
      {/* Similar to Bridge */}
    </div>
  );
};
EOF

# 5. Update root layout
cat > src/app/layout.tsx << 'EOF'
import { Web3Provider } from '@/lib/web3Context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
EOF

# 6. Add to dashboard
cat > src/app/dashboard/page.tsx << 'EOF'
import { Bridge } from '@/components/Bridge';
import { Staking } from '@/components/Staking';

export default function Dashboard() {
  return (
    <div>
      <Bridge />
      <Staking />
    </div>
  );
}
EOF

# Commit
git add src/lib/web3Context.tsx src/components/Bridge.tsx \
    src/components/Staking.tsx src/app/dashboard/
git commit -m "feat: add wallet integration and Bridge/Staking UI

Adds:
- Web3React wallet connection (MetaMask)
- Bridge UI component
- Staking UI component
- Dashboard page
- Type-safe ethers.js integration"
```

**Checklist:**
- [ ] ethers.js + web3-react installed
- [ ] Wallet context created
- [ ] MetaMask connection working
- [ ] Bridge component functional
- [ ] Staking component functional
- [ ] Dashboard page working
- [ ] E2E tests passing
- [ ] PR reviewed + merged

---

### PRIORITY 3: NEXT 2 WEEKS (2 semanas) 🟠 IMPORTANTE

#### 3.1 Consolidate Documentation (2-3 hours)

**Action:** Merge 22 deployment docs + 11 roadmap docs into structured docs/

```bash
# Create docs/ structure
mkdir -p docs

# Create central documentation index
cat > docs/README.md << 'EOF'
# Trayon Documentation

## Getting Started
- [Quick Start](./01-GETTING_STARTED.md)
- [Development Setup](./02-DEVELOPMENT.md)

## Architecture
- [System Architecture](./03-ARCHITECTURE.md)
- [Smart Contracts](./04-CONTRACTS.md)
- [Validator & BFT](./05-VALIDATOR.md)

## Deployment
- [Deployment Guide](./06-DEPLOYMENT.md)
- [Deployment Checklist](./07-DEPLOYMENT_CHECKLIST.md)

## Operations
- [Monitoring](./08-MONITORING.md)
- [Troubleshooting](./09-TROUBLESHOOTING.md)
- [Runbooks](./10-RUNBOOKS.md)

## API
- [REST API](./11-API_REST.md)
- [WebSocket API](./12-API_WEBSOCKET.md)
- [Smart Contract API](./13-API_CONTRACTS.md)
EOF

# Move + consolidate existing docs
mv 09-IMPLEMENTATION-COMPLETE-ROADMAP.md docs/IMPLEMENTATION_STATUS.md
mv ARCHITECTURE-HYBRID-STACK.md docs/03-ARCHITECTURE.md
# ... etc

# Delete duplicates (keep consolidated versions only)
rm DEPLOYMENT_*.md DEPLOYMENT-*.md
rm PRODUCTION_*.md
rm PHASE-*.md
rm 08-IMPLEMENTATION-ROADMAP.md
rm 10-PHASE-3-DEPLOY-SCRIPT.md
```

---

#### 3.2 Add Test Suite (2-3 weeks)

**Action:** Create unit + integration tests

```bash
# Backend tests
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
# Create jest.config.js
# Create tests/unit/ and tests/integration/
# Aim for 80%+ coverage

# Validator tests  
npm install --save-dev @testing-library/react
# Create tests/ for BFT consensus
# Create tests/ for P2P networking

# Frontend E2E tests
npm install --save-dev cypress
# Create cypress/e2e/
# Test wallet connection, bridge, staking

# Run: npm run test:coverage
```

---

#### 3.3 Kubernetes Setup (2 weeks)

**Action:** Create K8s manifests in infra/kubernetes/

```bash
# Deploy on minikube first, then EKS/GKE

# Create manifests for:
# - postgres StatefulSet
# - redis StatefulSet
# - backend Deployment
# - validator StatefulSet (3 replicas)
# - frontend Deployment
# - ai-engine Deployment
# - relayer Deployment

# Add ingress, service mesh (optional), monitoring
```

---

## 🎯 SUCCESS CRITERIA

### Week 0 (TODAY)
```
✓ Code morto removido
✓ .gitignore atualizado  
✓ Deploy scripts consolidados
✓ Action plan criado

METRICS:
└─ Bloat removido: 400+ KB
└─ Git size reduced: 1.8 GB
└─ Scripts: 8 → 3 (60% reduction)
```

### Week 1
```
✓ Backend ORM/services 50% done
✓ P2P networking 50% done
✓ Wallet integration 50% done
✓ Tests framework in place

METRICS:
└─ Code coverage: 0% → 30%
└─ New linhas: +1500-2000
└─ Blockers: 3 → 1 remaining
```

### Week 2-4
```
✓ Backend ORM/services 100% done
✓ P2P networking 100% done
✓ Wallet integration 100% done
✓ Test suite 60%+ coverage

METRICS:
└─ Production readiness: 72% → 90%
└─ Code coverage: 30% → 70%
└─ Zero known blockers
```

### Week 5-8
```
✓ K8s deployment
✓ CI/CD pipeline
✓ Security audit
✓ Performance tuning
✓ Go-live readiness

METRICS:
└─ Production readiness: 90% → 99%+
└─ All systems tested
└─ Monitoring in place
```

---

## 📊 WEEKLY CHECKLIST TEMPLATE

```markdown
## Week [N] Status Report

### Completed This Week ✅
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Blockers 🚨
- [ ] Issue 1: Impact X, ETA Y
- [ ] Issue 2: Impact X, ETA Y

### Metrics
- Code coverage: [X]%
- Production readiness: [Y]%
- Bugs reported: [N]
- PRs merged: [M]

### Next Week
- [ ] Priority 1
- [ ] Priority 2
- [ ] Priority 3

### Risks
- Risk 1: Mitigation Z
- Risk 2: Mitigation Z
```

---

## 🚀 DEPLOY TO PRODUCTION CHECKLIST

```markdown
# Pre-Launch Verification

## Backend ✅
- [ ] ORM models created and tested
- [ ] All endpoints implemented
- [ ] Authentication working
- [ ] Database migrations passing
- [ ] 80%+ test coverage
- [ ] No TODO comments remaining

## Frontend ✅
- [ ] Wallet integration working
- [ ] Bridge UI functional
- [ ] Staking UI functional  
- [ ] Dashboard real-time updates
- [ ] Mobile responsive
- [ ] E2E tests passing

## Validator ✅
- [ ] BFT consensus working
- [ ] P2P networking tested
- [ ] 3+ validator cluster tested
- [ ] Failover scenarios tested

## Smart Contracts ✅
- [ ] All 11 contracts deployed on testnet
- [ ] Security audit passed
- [ ] Gas optimization verified
- [ ] Integration tests passing

## Operations ✅
- [ ] Kubernetes manifests ready
- [ ] CI/CD pipeline working
- [ ] Monitoring + alerting configured
- [ ] Disaster recovery tested
- [ ] Runbooks documented
- [ ] Secrets management in place

## Documentation ✅
- [ ] API docs (OpenAPI/Swagger)
- [ ] Architecture docs
- [ ] Deployment guides
- [ ] Troubleshooting guides
- [ ] Runbooks

## Security ✅
- [ ] No exposed secrets in git
- [ ] OWASP compliance checked
- [ ] Dependency scanning passed
- [ ] Audit findings addressed
- [ ] Rate limiting implemented
- [ ] CORS properly configured

## Performance ✅
- [ ] Load testing completed
- [ ] Performance benchmarks met
- [ ] Caching strategy implemented
- [ ] Database indexes optimized
- [ ] CDN configured (if needed)

## Final Checks ✅
- [ ] Staging deployment successful
- [ ] 24-hour smoke test passed
- [ ] Incident response plan ready
- [ ] Rollback plan ready
- [ ] Legal/compliance review passed

→ READY FOR PRODUCTION LAUNCH 🎉
```

---

## 📞 COMMUNICATION TEMPLATE

### Daily Standup (5 min)
```
What I did yesterday:
- Completed X
- Blocked on Y (mitigation Z)

What I'm doing today:
- Working on A
- Supporting B

Blockers:
- Issue X (impact: High, ETA: 2 days)
```

### Weekly Sync (30 min)
```
Status Summary:
- On track / At risk / Off track

Progress:
- Completed: X tasks
- In progress: Y tasks
- Blocked: Z tasks

Metrics:
- Code coverage: X%
- Test pass rate: Y%
- Deployment readiness: Z%

Risks & Mitigations:
- Risk 1: Mitigation Z
- Risk 2: Mitigation Z

Next Week Plan:
- Priority 1
- Priority 2
- Priority 3
```

---

**Prepared by:** Lead Software Engineer | **Reviewed by:** CTO  
**Last Updated:** 2026-08-23 14:30 UTC  
**Next Review:** 2026-08-24 (daily) | 2026-08-27 (weekly)
