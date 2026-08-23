# Bridge L1/L2 - Guia Visual 🎨

## Diagrama Completo do Sistema

```
╔════════════════════════════════════════════════════════════════════════════╗
║                      TRAYON BRIDGE ARCHITECTURE                            ║
╚════════════════════════════════════════════════════════════════════════════╝


                    ┌─────────────────────────┐
                    │   USUÁRIO / DEVELOPER   │
                    │   (Carteira de Crypto)  │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌────────────┐   ┌────────────┐   ┌────────────┐
        │  Polygon   │   │   Trayon   │   │  Backend   │
        │   (L1)     │   │   (L2)     │   │  (Relayer) │
        └────────────┘   └────────────┘   └────────────┘
                │                │                │
                │                │                │
        ┌───────▼────────────────▼────────────────▼──────┐
        │                                                 │
        │        ═══════ BRIDGE CONTRACTS ═══════        │
        │                                                 │
        │  ┌────────────┐              ┌────────────┐    │
        │  │ BridgeL1   │  ◄──────────► │ BridgeL2   │    │
        │  │ (Polygon)  │   (Relayer)   │ (Trayon)   │    │
        │  └────────────┘              └────────────┘    │
        │       │                              │         │
        │       └──────────────┬───────────────┘         │
        │                      │                         │
        │        ┌─────────────▼──────────────┐          │
        │        │   TRAY Token Supply (1B)   │          │
        │        │                            │          │
        │        │  L1: 250M ~ 750M          │          │
        │        │  L2: 250M ~ 750M          │          │
        │        │  Total: Always 1B          │          │
        │        └────────────────────────────┘          │
        │                                                 │
        └─────────────────────────────────────────────────┘
```

---

## Fluxo de Deposit (L1 → L2)

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                 DEPOSIT FLOW: L1 → L2                        ║
    ╚═══════════════════════════════════════════════════════════════╝

ETAPA 1: USER em Polygon (L1)
════════════════════════════════════════════════════════════════════

    User Wallet (Polygon)              TRAY Token Contract
    ┌─────────────────┐                ┌──────────────────┐
    │ 10,000 TRAY     │                │ Total: 1,000,000 │
    │ [Deposit 1000]  │ ────approve───►│ TRAY             │
    │ Button Clicked! │                │                  │
    └─────────────────┘                └──────────────────┘
           │                                    │
           │                                    ▼
           │                            [Approve Done ✓]
           │
           └──────────────┬──────────────────────────┐
                          │ deposit(1000)            │
                          ▼                          ▼
                    BridgeL1 Contract          Emit: DepositInitiated
                    ┌────────────────────┐     (User, 1000, Block#)
                    │ Lock 1000 TRAY     │
                    │ from User Wallet   │
                    └────────────────────┘


RESULTADO ETAPA 1:
├─ User Polygon: 10,000 - 1,000 = 9,000 TRAY
├─ BridgeL1: 0 + 1,000 = 1,000 TRAY (LOCKED)
└─ Event emitted: Available for Relayer


ETAPA 2: Relayer observa evento
════════════════════════════════════════════════════════════════════

    Relayer Backend (Node.js/TypeScript)
    ┌──────────────────────────────────┐
    │ Listening to Polygon events...   │
    │                                  │
    │ 🔔 EVENT DETECTED! 🔔            │
    │ DepositInitiated(                │
    │   user: 0x1234...,               │
    │   amount: 1000,                  │
    │   nonce: 12345                   │
    │ )                                │
    │                                  │
    │ ✓ Validating...                  │
    │ ✓ Collecting signatures (3/5)... │
    │ ✓ Ready to execute on L2         │
    └──────────────────────────────────┘
            │
            │ Sends to 3 Validators
            │
            ├─→ Validator1: Sign ✓
            ├─→ Validator2: Sign ✓
            └─→ Validator3: Sign ✓


ETAPA 3: Execute em Trayon (L2)
════════════════════════════════════════════════════════════════════

    BridgeL2 Contract (Trayon)          TRAY Token (Trayon)
    ┌────────────────────────────┐     ┌──────────────────────┐
    │ completeDeposit(            │     │ Mint 1,000 TRAY      │
    │   user: 0x1234...,         │────►│ for User             │
    │   amount: 1000,            │     │                      │
    │   signatures: [sig1,sig2,  │     │ New Balance Created  │
    │    sig3]                   │     └──────────────────────┘
    │ )                          │
    │                            │
    │ ✓ Verify 3 signatures      │
    │ ✓ Check not duplicate      │
    │ ✓ Mint TRAY                │
    └────────────────────────────┘
            │
            ▼
    Emit: DepositCompleted


RESULTADO FINAL:
════════════════════════════════════════════════════════════════════

    Polygon (L1)                    Trayon (L2)
    ┌─────────────────────┐        ┌─────────────────────┐
    │ User: 9,000 TRAY    │        │ User: 1,000 TRAY    │
    │ BridgeL1: 1,000     │        │ BridgeL2: 0         │
    │ (LOCKED)            │        │                     │
    └─────────────────────┘        └─────────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
                  ┌────────▼────────┐
                  │ Total: 10,000   │
                  │ Supply OK ✓     │
                  └─────────────────┘
```

---

## Fluxo de Withdraw (L2 → L1)

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                 WITHDRAW FLOW: L2 → L1                       ║
    ╚═══════════════════════════════════════════════════════════════╝

ETAPA 1: USER em Trayon (L2)
════════════════════════════════════════════════════════════════════

    User Wallet (Trayon)               TRAY Token Contract
    ┌─────────────────┐                ┌──────────────────┐
    │ 1,000 TRAY      │                │ Total: 1,000,000 │
    │ [Withdraw 1000] │ ──burn(1000)──►│ TRAY             │
    │ Button Clicked! │                │                  │
    └─────────────────┘                └──────────────────┘
           │                                    │
           │                                    ▼
           │                          [1000 TRAY DESTROYED]
           │
           └──────────────┬──────────────────────────┐
                          │ initiateWithdrawal(1000) │
                          ▼                          ▼
                    BridgeL2 Contract          Emit: WithdrawalInitiated
                    ┌────────────────────┐     (User, 1000, Block#)
                    │ Burn 1000 TRAY     │
                    │ (Already done ✓)   │
                    └────────────────────┘


RESULTADO ETAPA 1:
├─ User Trayon: 1,000 - 1,000 = 0 TRAY
├─ TRAY Supply Trayon: -1,000
└─ Event emitted: Available for Relayer


ETAPA 2: Relayer observa evento
════════════════════════════════════════════════════════════════════

    Relayer Backend (Node.js/TypeScript)
    ┌──────────────────────────────────┐
    │ Listening to Trayon events...    │
    │                                  │
    │ 🔔 EVENT DETECTED! 🔔            │
    │ WithdrawalInitiated(             │
    │   user: 0x1234...,               │
    │   amount: 1000,                  │
    │   nonce: 12346                   │
    │ )                                │
    │                                  │
    │ ✓ Validating...                  │
    │ ✓ Collecting signatures (3/5)... │
    │ ✓ Ready to execute on L1         │
    └──────────────────────────────────┘
            │
            │ Sends to 3 Validators
            │
            ├─→ Validator1: Sign ✓
            ├─→ Validator2: Sign ✓
            └─→ Validator3: Sign ✓


ETAPA 3: Execute em Polygon (L1)
════════════════════════════════════════════════════════════════════

    BridgeL1 Contract (Polygon)        TRAY Token (Polygon)
    ┌────────────────────────────┐     ┌──────────────────────┐
    │ completeWithdrawal(         │     │ Transfer 1,000 TRAY  │
    │   user: 0x1234...,         │────►│ to User              │
    │   amount: 1000,            │     │                      │
    │   withdrawalHash: 0x...,   │     │ Libera do Lock       │
    │   signatures: [sig1,sig2,  │     └──────────────────────┘
    │    sig3]                   │
    │ )                          │
    │                            │
    │ ✓ Verify 3 signatures      │
    │ ✓ Check hash not used      │
    │ ✓ Transfer TRAY (RELEASE)  │
    └────────────────────────────┘
            │
            ▼
    Emit: WithdrawalCompleted


RESULTADO FINAL:
════════════════════════════════════════════════════════════════════

    Polygon (L1)                    Trayon (L2)
    ┌─────────────────────┐        ┌─────────────────────┐
    │ User: 9,000 + 1,000 │        │ User: 0 TRAY        │
    │        = 10,000     │        │ BridgeL2: 0         │
    │ BridgeL1: 0         │        │                     │
    │ (Liberado!)         │        │                     │
    └─────────────────────┘        └─────────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
                  ┌────────▼────────┐
                  │ Total: 10,000   │
                  │ Supply OK ✓     │
                  └─────────────────┘
```

---

## Comparação: Com vs Sem Bridge

```
╔═════════════════════════════════════════════════════════════════╗
║  SEM BRIDGE ❌                  COM BRIDGE ✅                   ║
╠═════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  User tem TRAY em             User tem TRAY em Polygon          ║
║  Polygon, mas...              E consegue USAR em Trayon!        ║
║                                                                  ║
║  ❌ Não consegue usar         ✅ Deposita em Bridge             ║
║     em Trayon                                                    ║
║                               ✅ Recebe em Trayon               ║
║  ❌ TRAY presos em Polygon                                      ║
║                               ✅ Usa para pagar gas             ║
║  ❌ Precisa de exchange                                         ║
║     para converter             ✅ Depois saca de volta           ║
║                                                                  ║
║  ❌ Perda de liquidity        ✅ Liquidity conectada            ║
║                                                                  ║
║  ❌ Usuários isolados         ✅ Usuários conectados            ║
║                                                                  ║
╚═════════════════════════════════════════════════════════════════╝
```

---

## Estados do TRAY em Diferentes Pontos

```
                   ┌─────────────────────┐
                   │   TRAY ESTADOS      │
                   │   (No Sistema)      │
                   └────────┬────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Circulando   │ │ Locked em    │ │ Circulando   │
    │ em Polygon   │ │ Bridge L1    │ │ em Trayon    │
    │ (L1)         │ │              │ │ (L2)         │
    └──────────────┘ └──────────────┘ └──────────────┘
           │                 │                 │
           │                 │                 │
           │◄─────DepositIn  │  ─→CompleteD──►│
           │                 │                 │
           │◄──CompleteWith  │ ─InitiateWith──►│
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                        Total: 1B
                      (INVARIANTE)
```

---

## Fluxo de Segurança: Multi-Signature

```
┌────────────────────────────────────────────────────────────┐
│         MULTI-SIGNATURE VALIDATION (3 of 5)               │
└────────────────────────────────────────────────────────────┘

Transação de Saque:
┌─────────────────────────────────┐
│ WithdrawalHash: 0xABC...        │
│ User: 0x1234...                 │
│ Amount: 1000 TRAY               │
│ Nonce: 12346                    │
└─────────────────────────────────┘
        │
        │ Relayer precisa de 3 assinaturas
        │
        ┌────────────┬────────────┬────────────┬────────────┐
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
    Val#1        Val#2        Val#3        Val#4        Val#5
  ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐
  │ Sign │ ✓   │ Sign │ ✓   │ Sign │ ✓   │ Sign │ ✗   │ Sign │ ✗
  │   ✓  │     │   ✓  │     │   ✓  │     │  ✗   │     │  ✗   │
  └──────┘     └──────┘     └──────┘     └──────┘     └──────┘
      │            │            │
      └────────────┼────────────┘
                   │
                   ▼
            ┌─────────────┐
            │ Sufficient! │
            │ 3 >= 3 ✓    │
            └─────────────┘
                   │
                   ▼
            EXECUTE WITHDRAWAL
                   │
            ├─ Transfer 1000 TRAY
            ├─ Emit WithdrawalCompleted
            └─ Mark as processed
```

---

## Rate Limiting Protection

```
┌──────────────────────────────────────────────────────┐
│          RATE LIMITING PROTECTION                   │
└──────────────────────────────────────────────────────┘

Per Transaction Limit:
┌─────────────────────────────────┐
│ Max: 10M TRAY per deposit       │
│                                 │
│ ✓ User deposits 5M   → OK       │
│ ✓ User deposits 9M   → OK       │
│ ✗ User deposits 15M  → REJECTED │
└─────────────────────────────────┘

Daily Limit:
┌─────────────────────────────────────────────────────┐
│ Max: 100M TRAY per day                              │
│                                                      │
│ 00:00 Reset:  totalDepositedToday = 0               │
│               capacity = 100M                       │
│                                                      │
│ 03:00 User1:  deposits 30M                          │
│               capacity = 70M                        │
│                                                      │
│ 06:00 User2:  deposits 40M                          │
│               capacity = 30M                        │
│                                                      │
│ 09:00 User3:  deposits 50M      ✗ REJECTED!         │
│               (would exceed daily limit)            │
│               capacity = 30M (unchanged)            │
│                                                      │
│ 23:59 Daily limit ends                              │
│ 00:00 RESET back to 100M                            │
└─────────────────────────────────────────────────────┘
```

---

## Timeline do Bridge: Do Depósito até Recebimento

```
Tempo    Ação                          Status
════════════════════════════════════════════════════════════

T+0s     User clica "Deposit" em       ⏳ Pendente
         Polygon

T+12s    Transação confirmada          ✅ Locked em L1
         (1 bloco em Polygon)          1000 TRAY em Bridge

T+13s    Relayer escuta evento         👀 Detectado
                                       Coletando assinats

T+14s    3 validadores assinam         🔐 Multi-sig OK

T+15s    Relayer executa em Trayon    ⏳ Enviando para L2
         (1 bloco em Trayon)

T+27s    Transação confirmada          ✅ Mintado em L2
         em Trayon                     User recebe 1000 TRAY

TOTAL:   ~25-30 segundos              Pronto para usar! 🎉
```

---

## Exemplo de Código - Estrutura

```solidity
// BridgeL1.sol (Polygon)
contract BridgeL1 {
    
    // STATE
    TRAY public tray;                    ◄── Token
    mapping(address => bool) validators; ◄── Multi-sig
    uint256 dailyLimit = 100M * 1e18;   ◄── Rate limit
    
    // DEPOSIT (L1 → L2)
    function deposit(uint256 amount) {
        tray.transferFrom(msg.sender, address(this), amount);  // LOCK
        emit DepositInitiated(...);  // Relayer vai observar
    }
    
    // WITHDRAW (L2 → L1)
    function completeWithdrawal(...signatures...) {
        _validateSignatures(signatures);  // Multi-sig check
        tray.transfer(user, amount);      // RELEASE
        emit WithdrawalCompleted(...);
    }
}


// BridgeL2.sol (Trayon)
contract BridgeL2 {
    
    // STATE
    TRAY public tray;                  ◄── Token em L2
    mapping(address => bool) relayers; ◄── Relayer auth
    
    // DEPOSIT COMPLETION (L1 → L2)
    function completeDeposit(address user, uint256 amount) {
        tray.mint(user, amount);       // MINT novo TRAY
        emit DepositCompleted(...);
    }
    
    // WITHDRAWAL INITIATION (L2 → L1)
    function initiateWithdrawal(uint256 amount) {
        tray.burnFrom(msg.sender, amount);  // BURN
        emit WithdrawalInitiated(...);
    }
}
```

---

## Checklist Visual

```
🏗️  BRIDGE IMPLEMENTATION CHECKLIST
════════════════════════════════════════════════════════════

Phase 1: Smart Contracts
  ├─ [ ] BridgeL1.sol
  │  ├─ [ ] deposit() function
  │  ├─ [ ] completeWithdrawal() function
  │  ├─ [ ] Multi-sig validation
  │  └─ [ ] Rate limiting
  │
  ├─ [ ] BridgeL2.sol
  │  ├─ [ ] completeDeposit() function
  │  ├─ [ ] initiateWithdrawal() function
  │  └─ [ ] Relayer management
  │
  └─ [ ] BridgeTest.t.sol
     ├─ [ ] Deposit tests
     ├─ [ ] Withdrawal tests
     └─ [ ] Security tests

Phase 2: Backend
  ├─ [ ] L1 Event Listener
  ├─ [ ] L2 Event Listener
  ├─ [ ] Multi-sig Signer
  ├─ [ ] Transaction Executor
  └─ [ ] Error Handler

Phase 3: Testing
  ├─ [ ] Unit tests (smart contracts)
  ├─ [ ] Integration tests (L1 → L2 → L1)
  ├─ [ ] Security audit
  └─ [ ] Load testing

Phase 4: Deployment
  ├─ [ ] Deploy BridgeL1 (Polygon Amoy)
  ├─ [ ] Deploy BridgeL2 (Trayon Testnet)
  ├─ [ ] Launch Relayer (staging)
  ├─ [ ] E2E testing (mainnet simulation)
  └─ [ ] Mainnet deployment

Phase 5: Operations
  ├─ [ ] Monitor 24/7
  ├─ [ ] Community support
  ├─ [ ] Bug bounty program
  └─ [ ] Regular audits
```

---

Agora você tem um entendimento COMPLETO do Bridge L1/L2! 🎉

**Próximo**: Implementar os contratos usando esses templates!
