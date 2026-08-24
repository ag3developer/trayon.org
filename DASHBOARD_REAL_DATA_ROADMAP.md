# 📊 DASHBOARD - Real Data Integration Roadmap

## Current Dashboard Overview

O Dashboard atual em `web/src/components/Dashboard.tsx` é um **mockup funcional** que:

### ✅ Já Funciona:
```
Dashboard (Estrutura Pronta)
│
├─ 🔌 Wallet Connection
│  └─ MetaMask sign-in
│  └─ Message signature authentication
│
├─ 👤 User Account Display
│  └─ Formatted wallet address
│  └─ ETH balance from chain
│  └─ Chain ID display
│
├─ 💼 Portfolio Section (Mockup Data)
│  ├─ Total Value stats card
│  ├─ Top 2 assets preview
│  └─ Full assets table (3 columns: Asset/Balance/Value)
│
└─ 🎨 UI/UX (Production Quality)
   ├─ Dark theme with gradients
   ├─ Responsive layout (mobile/desktop)
   ├─ Loading states
   ├─ Error handling
   └─ Hover effects & transitions
```

---

## 🔄 What's Missing - Real Data Integration

### Current State (Mockup):
```typescript
// Currently just returns null or shows loading spinner
const data = await request(`/portfolio/${web3State.address}`);
// But the /portfolio endpoint doesn't exist yet!
```

### What Needs to Be Built:

---

## 📋 INTEGRATION CHECKLIST

### Phase 1: Backend API Endpoints (PRIORITY #2)

**1. Portfolio Endpoint**
```
GET /api/portfolio/:address
├─ Response: {
│  ├─ totalValue: string         // "$50,234.56"
│  ├─ totalValueUSD: number      // 50234.56
│  ├─ totalValueChange24h: number // +12.5 (%)
│  ├─ totalValueChangeBTC: string // "+0.0234 BTC"
│  ├─ lastUpdated: timestamp
│  └─ assets: [{
│     ├─ symbol: "ETH"
│     ├─ name: "Ethereum"
│     ├─ balance: "5.234"
│     ├─ value: "$18,234.56"
│     ├─ change24h: -2.3
│     ├─ logo: "https://..."
│     ├─ contractAddress: "0x..."
│     └─ chain: "ethereum"
│  }]
└─ Status: ✅ Called but endpoint missing
```

**2. Transaction History Endpoint**
```
GET /api/portfolio/:address/transactions?limit=10&offset=0
├─ Response: [{
│  ├─ id: uuid
│  ├─ hash: "0x..."
│  ├─ type: "send" | "receive" | "swap" | "bridge"
│  ├─ from: address
│  ├─ to: address
│  ├─ value: "5.234"
│  ├─ token: "ETH"
│  ├─ timestamp: ISO string
│  ├─ status: "success" | "pending" | "failed"
│  ├─ chainId: number
│  └─ gasUsed: "0.0045"
│}]
└─ Status: ❌ Not called from Dashboard yet
```

**3. Token Price Endpoint** (for real-time updates)
```
GET /api/tokens/prices?symbols=ETH,TRAY,USDC
├─ Response: {
│  ├─ ETH: { price: 2847.32, change24h: 2.3, change7d: 5.1 }
│  ├─ TRAY: { price: 12.45, change24h: 1.2, change7d: -3.2 }
│  └─ USDC: { price: 1.00, change24h: 0.0, change7d: 0.0 }
└─ Status: ❌ Not implemented
```

**4. Balance Endpoint**
```
GET /api/portfolio/:address/balances
├─ Response: {
│  ├─ network: "ethereum",
│  ├─ native: "5.234",           // ETH
│  ├─ nativeUSD: 18234.56,
│  └─ tokens: [
│     { symbol: "TRAY", balance: "1000", valueUSD: 12450 },
│     { symbol: "USDC", balance: "5000", valueUSD: 5000 },
│     { symbol: "DAI", balance: "2500", valueUSD: 2500 }
│  ]
└─ Status: ❌ Not implemented
```

---

### Phase 2: Database Schema Updates

**Add to PostgreSQL:**

```sql
-- User Portfolios
CREATE TABLE user_portfolios (
    id UUID PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL UNIQUE,
    total_value_usd DECIMAL(20,8),
    total_value_btc DECIMAL(20,8),
    last_updated TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- User Assets
CREATE TABLE user_assets (
    id UUID PRIMARY KEY,
    portfolio_id UUID REFERENCES user_portfolios(id),
    symbol VARCHAR(20),
    name VARCHAR(255),
    balance DECIMAL(30,8),
    value_usd DECIMAL(20,8),
    contract_address VARCHAR(42),
    chain_id INTEGER,
    change_24h DECIMAL(10,4),
    last_updated TIMESTAMP
);

-- Transaction History
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_address VARCHAR(42),
    tx_hash VARCHAR(255) UNIQUE,
    tx_type VARCHAR(20), -- send, receive, swap, bridge
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    value DECIMAL(30,8),
    token_symbol VARCHAR(20),
    status VARCHAR(20), -- success, pending, failed
    chain_id INTEGER,
    gas_used DECIMAL(20,8),
    timestamp TIMESTAMP,
    created_at TIMESTAMP
);

-- Token Prices (cache)
CREATE TABLE token_prices (
    id UUID PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE,
    price_usd DECIMAL(20,8),
    change_24h DECIMAL(10,4),
    change_7d DECIMAL(10,4),
    market_cap DECIMAL(30,8),
    volume_24h DECIMAL(30,8),
    last_updated TIMESTAMP
);
```

---

### Phase 3: Frontend Dashboard Components to Add

#### 3.1 Transaction History Component
```typescript
interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'bridge';
  amount: string;
  token: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  hash: string;
}

// Component shows:
// - Transaction list with pagination
// - Filter by type (All, Sent, Received, Swaps, Bridges)
// - Status badges (✓ Success, ⏳ Pending, ✗ Failed)
// - Click to Etherscan link
```

#### 3.2 Asset Performance Charts
```typescript
// Currently empty, needs:
// - 24h price change graph
// - 7-day chart with line graph
// - Allocation pie chart (Asset distribution %)
// - Performance metrics (gains/losses)
```

#### 3.3 Real-time Balance Updates
```typescript
// Currently shows static balance
// Needs:
// - WebSocket connection for live updates
// - Refresh button (manual)
// - Auto-refresh interval (every 30s)
```

#### 3.4 Bridge Interface
```typescript
// Currently no bridge UI
// Needs:
// - From/To chain selector
// - Amount input
// - Fee estimation
// - Confirm transaction modal
```

#### 3.5 Swap Interface (Optional Phase 2)
```typescript
// Swap tokens view
// - From/To tokens
// - Price impact display
// - Slippage tolerance
// - Confirm transaction
```

---

## 🔗 Data Flow Architecture

### Current (Mockup):
```
Dashboard.tsx
    ↓
useAPI hook
    ↓
/portfolio/{address}  ← ENDPOINT MISSING ❌
    ↓
setPortfolio(null)  ← No real data
```

### Target (Real Data):
```
Dashboard.tsx
    ↓ useEffect on mount
    ↓
useAuth → Get JWT token
    ↓
useAPI → Set Authorization header
    ↓
GET /api/portfolio/{address}
    ↓
Backend API (Express)
    ├─ Query PostgreSQL
    ├─ Fetch live prices
    ├─ Calculate balances
    └─ Return JSON response
    ↓
setPortfolio(realData)
    ↓
Render with real values
    ↓
WebSocket updates (live)
```

---

## 📈 Dashboard Display Structure

### Section 1: Account Overview
```
┌─────────────────────────────────────────┐
│ Portfolio                               │
│ Account: 0x1234...5678                  │
└─────────────────────────────────────────┘
```

### Section 2: Key Metrics (3 columns)
```
┌──────────────┬──────────────┬──────────────┐
│ Total Value  │ 24h Change   │ Best Asset   │
│ $50,234.56   │ +$2,345.12   │ ETH +5.2%    │
│              │ +4.8%        │ $25,000      │
└──────────────┴──────────────┴──────────────┘
```

### Section 3: Assets Table
```
┌────────┬──────────┬──────────┬──────────────┐
│ Asset  │ Balance  │ Value    │ Change 24h   │
├────────┼──────────┼──────────┼──────────────┤
│ ETH    │ 5.234    │ $18,234  │ +2.3% 📈     │
│ TRAY   │ 1000     │ $12,450  │ +1.2% 📈     │
│ USDC   │ 5000     │ $5,000   │ +0.0% ➡️     │
└────────┴──────────┴──────────┴──────────────┘
```

### Section 4: Recent Transactions
```
┌─────────────┬──────────┬────────────┬──────────┐
│ Type        │ Amount   │ Status     │ Time     │
├─────────────┼──────────┼────────────┼──────────┤
│ → Sent      │ -2.5 ETH │ ✓ Success  │ 2 min    │
│ ← Received  │ +1 TRAY  │ ✓ Success  │ 5 hours  │
│ ⟲ Swap      │ 100 USDC │ ⏳ Pending  │ 1 sec    │
└─────────────┴──────────┴────────────┴──────────┘
```

### Section 5: Charts (Optional)
```
┌──────────────────────────┐
│ Asset Allocation         │
│                          │
│  ETH (35%)  ████         │
│  TRAY (25%) ███          │
│  USDC (10%) ██           │
│  Other (30%) ████        │
└──────────────────────────┘

┌──────────────────────────┐
│ 7-Day Price History      │
│     ╱╲    ╱╲             │
│    ╱  ╲  ╱  ╲ 📈         │
│   ╱    ╲╱    ╲           │
│                          │
└──────────────────────────┘
```

---

## 🛠️ Implementation Roadmap

### Week 1: Backend API Setup
- [ ] Create `/api/portfolio/:address` endpoint
- [ ] Create `/api/portfolio/:address/transactions` endpoint
- [ ] Add database tables (user_portfolios, user_assets, transactions, token_prices)
- [ ] Seed with dummy data for testing

### Week 2: Frontend Integration
- [ ] Connect Dashboard to real endpoints
- [ ] Add error boundaries and loading states
- [ ] Add transaction history component
- [ ] Add real-time price updates

### Week 3: Enhancement
- [ ] Add charts (Chart.js or Recharts)
- [ ] Add WebSocket for live updates
- [ ] Add filtering and sorting
- [ ] Add export functionality

### Week 4: Polish
- [ ] Performance optimization
- [ ] Mobile responsiveness refinement
- [ ] Add animations
- [ ] User feedback & testing

---

## 💻 Code Example: Real Data Integration

### Backend Endpoint (Express)
```typescript
// backend/api/routes/portfolio.ts
router.get('/portfolio/:address', authMiddleware, async (req, res) => {
  const { address } = req.params;
  
  try {
    // Get from database
    const portfolio = await db.query(
      'SELECT * FROM user_portfolios WHERE user_address = $1',
      [address]
    );
    
    // Get assets
    const assets = await db.query(
      'SELECT * FROM user_assets WHERE portfolio_id = $1',
      [portfolio.id]
    );
    
    // Format response
    res.json({
      totalValue: portfolio.total_value_usd,
      assets: assets.map(a => ({
        symbol: a.symbol,
        balance: a.balance,
        value: a.value_usd
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend Component (React)
```typescript
// web/src/components/Dashboard.tsx
useEffect(() => {
  if (authState.isAuthenticated && web3State.address) {
    loadPortfolio();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPortfolio, 30000);
    return () => clearInterval(interval);
  }
}, [authState.isAuthenticated, web3State.address]);

const loadPortfolio = async () => {
  try {
    setIsLoadingPortfolio(true);
    const data = await request(`/api/portfolio/${web3State.address}`);
    setPortfolio(data);
  } catch (error) {
    setPortfolioError(error.message);
  } finally {
    setIsLoadingPortfolio(false);
  }
};
```

---

## 📊 Priority Matrix

| Component | Complexity | Impact | Timeline |
|-----------|-----------|--------|----------|
| Portfolio endpoint | Low | Critical | Week 1 |
| Transaction history | Medium | High | Week 1-2 |
| Real-time prices | Medium | High | Week 2 |
| Charts | Medium | Medium | Week 3 |
| Bridge UI | High | Medium | Week 4+ |
| Swap UI | High | Low | Phase 2 |

---

## ✨ Final Dashboard Features

```
DASHBOARD FEATURES CHECKLIST:

Viewing:
  ☑️ Portfolio overview
  ☑️ Total value in USD
  ☑️ Assets list with balances
  ☑️ 24h price changes
  ☑️ Transaction history
  ☑️ Charts & graphs
  ☑️ Real-time updates

Actions:
  ☑️ View transaction details
  ☑️ Filter transactions
  ☑️ Export portfolio
  ☑️ Copy addresses
  ☑️ View on block explorer
  ☑️ Refresh data

Settings:
  ☑️ Select display currency (USD/EUR/BTC)
  ☑️ Auto-refresh interval
  ☑️ Theme settings
  ☑️ Notification preferences
```

---

## 🎯 Success Criteria

Dashboard is "complete" when:
- ✅ Real portfolio data displays correctly
- ✅ All transactions show with correct timestamps
- ✅ Price updates reflect live market data
- ✅ Mobile responsive and loads <2s
- ✅ No broken links or missing data
- ✅ Error states handled gracefully
- ✅ User testing shows good UX

**Estimated Completion:** 3-4 weeks with dedicated development

