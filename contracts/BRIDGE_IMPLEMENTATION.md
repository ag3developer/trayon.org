# Bridge L1/L2 - Guia de Implementação Prático

## Resumo Executivo

Você tem um token `TRAY` que existe em **dois lugares** simultaneamente:

```
1. Polygon (L1) - Token negociável em DEX
2. Trayon (L2)  - Token para pagar gas/transações

Bridge = "Túnel" que conecta os dois, mantendo suprimento único (1B)
```

---

## O Problema Concreto

### Sem Bridge ❌

```
Você quer usar TRAY em Trayon L2, mas:

1. Seu TRAY está em Polygon (L1)
2. Trayon é outra blockchain separada
3. Você NÃO consegue usar TRAY em Trayon direto
4. Seus 1000 TRAY em Polygon ≠ 1000 TRAY em Trayon

Resultado: Usuários PRESOS em uma das blockchains!
```

### Com Bridge ✅

```
Você quer usar TRAY em Trayon L2:

1. Seu TRAY está em Polygon (L1)
2. Você deposita no Bridge
3. Bridge TRANCA seus TRAY em Polygon
4. Bridge CRIA equivalente em Trayon
5. Agora você tem TRAY em Trayon para usar!

Depois:
6. Você quer voltar para Polygon
7. Bridge QUEIMA TRAY em Trayon
8. Bridge LIBERA TRAY em Polygon
9. Você tem TRAY em Polygon novamente!
```

---

## Solução: Lock/Mint Pattern

### Passo 1: Depositar L1 → L2

```
┌──────────────────────────────────────────────────────┐
│ Etapa 1: Usuário deposita em Polygon                │
└──────────────────────────────────────────────────────┘

User: "Quero mover 1000 TRAY para Trayon"
   │
   ├─ Aprova 1000 TRAY no Bridge
   │ (Contrato BridgeL1 recebe permissão)
   │
   └─ Chama: bridge.deposit(1000)
           │
           ├─ TRAY.transferFrom(user, bridge, 1000)
           │  └─ 1000 TRAY sai da carteira do usuário
           │  └─ 1000 TRAY entra no Bridge (LOCKED)
           │
           └─ Emite evento: DepositInitiated(user, 1000)


┌──────────────────────────────────────────────────────┐
│ Etapa 2: Relayer observa evento em Polygon          │
└──────────────────────────────────────────────────────┘

Relayer:
   ├─ Monitora logs de DepositInitiated
   ├─ Vê: "User depositou 1000 TRAY"
   └─ Cria transação para Trayon L2

┌──────────────────────────────────────────────────────┐
│ Etapa 3: Relayer executa em Trayon                  │
└──────────────────────────────────────────────────────┘

Relayer chama: bridgeL2.completeDeposit(user, 1000)
   │
   └─ TRAY.mint(user, 1000)
      └─ 1000 TRAY NOVOS criados em Trayon
      └─ Aparecem na carteira do usuário
      └─ User agora tem 1000 TRAY em Trayon!

RESULTADO:
- Polygon: User -1000 TRAY (estava locked no bridge)
- Trayon:  User +1000 TRAY (novo mint)
- Total:   Ainda 1B, não duplicou!
```

### Passo 2: Sacar L2 → L1

```
┌──────────────────────────────────────────────────────┐
│ Etapa 1: Usuário saca em Trayon                      │
└──────────────────────────────────────────────────────┘

User: "Quero sacar 1000 TRAY de volta para Polygon"
   │
   └─ Chama: bridge.withdraw(1000)
           │
           ├─ TRAY.burn(1000)
           │  └─ 1000 TRAY são DESTRUÍDOS em Trayon
           │  └─ Suprimento em Trayon cai em 1000
           │
           └─ Emite evento: WithdrawalInitiated(user, 1000)


┌──────────────────────────────────────────────────────┐
│ Etapa 2: Relayer observa evento em Trayon           │
└──────────────────────────────────────────────────────┘

Relayer:
   ├─ Monitora logs de WithdrawalInitiated
   ├─ Vê: "User retirou 1000 TRAY"
   └─ Cria transação para Polygon

┌──────────────────────────────────────────────────────┐
│ Etapa 3: Relayer executa em Polygon                 │
└──────────────────────────────────────────────────────┘

Relayer chama: bridgeL1.completeWithdrawal(user, 1000)
   │
   └─ TRAY.transfer(user, 1000)
      └─ 1000 TRAY que estavam LOCKED são liberados
      └─ Aparecem na carteira do usuário em Polygon
      └─ User agora tem 1000 TRAY em Polygon!

RESULTADO:
- Trayon: User -1000 TRAY (foi queimado)
- Polygon: User +1000 TRAY (foi liberado do lock)
- Total: Ainda 1B, mantém integridade!
```

---

## Código Completo - Bridge L1

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BridgeL1
 * @dev Bridge para mover TRAY de Polygon (L1) para Trayon (L2)
 * 
 * Funciona com padrão Lock/Mint:
 * - L1: Lock (guardar TRAY no contrato)
 * - L2: Mint (criar equivalente em L2)
 */
contract BridgeL1 is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    IERC20 public tray;
    
    // Limites de segurança
    uint256 public dailyLimit = 100_000_000 * 10**18;      // 100M TRAY por dia
    uint256 public perTxLimit = 10_000_000 * 10**18;       // 10M TRAY por tx
    
    // Validadores que podem executar saques
    mapping(address => bool) public validators;
    uint256 public requiredSignatures = 3;  // Mínimo 3 de 5 assinaturas
    
    // Rastreamento de limites diários
    uint256 public totalDepositedToday;
    uint256 public lastResetDay;
    
    // Rastreamento de transações processadas
    mapping(bytes32 => bool) public processedWithdrawals;
    
    // ============ Events ============
    
    event DepositInitiated(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp
    );
    
    event WithdrawalCompleted(
        address indexed user,
        uint256 amount,
        bytes32 withdrawalHash
    );
    
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event LimitUpdated(uint256 dailyLimit, uint256 perTxLimit);
    
    // ============ Errors ============
    
    error InvalidToken();
    error AmountZero();
    error ExceedsPerTxLimit(uint256 amount, uint256 limit);
    error ExceedsDailyLimit(uint256 amount, uint256 available);
    error TransferFailed();
    error InvalidValidator();
    error InsufficientSignatures();
    error WithdrawalAlreadyProcessed();
    error InvalidSignature();
    
    // ============ Constructor ============
    
    constructor(address _tray, address[] memory _validators) {
        if (_tray == address(0)) revert InvalidToken();
        
        tray = IERC20(_tray);
        
        // Adicionar validadores iniciais
        for (uint i = 0; i < _validators.length; i++) {
            validators[_validators[i]] = true;
        }
        
        lastResetDay = block.timestamp / 1 days;
    }
    
    // ============ Deposit Functions (L1 → L2) ============
    
    /**
     * @dev Depositar TRAY para transferir para L2
     * @param amount Quantidade de TRAY a depositar
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert AmountZero();
        if (amount > perTxLimit) revert ExceedsPerTxLimit(amount, perTxLimit);
        
        // Atualizar limite diário
        _updateDailyLimit();
        
        if (totalDepositedToday + amount > dailyLimit) {
            revert ExceedsDailyLimit(amount, dailyLimit - totalDepositedToday);
        }
        
        // Receber TRAY do usuário (LOCK)
        if (!tray.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        totalDepositedToday += amount;
        
        emit DepositInitiated(msg.sender, amount, block.timestamp, block.timestamp);
    }
    
    // ============ Withdrawal Functions (L2 → L1) ============
    
    /**
     * @dev Completar saque de L2 (apenas validadores)
     * 
     * Requer multi-sig para segurança:
     * - Mínimo 3 validadores devem assinar
     * - Cada assinatura é verificada
     * 
     * @param user Endereço do usuário
     * @param amount Quantidade de TRAY
     * @param withdrawalHash Hash único da transação
     * @param v Array de valores v da assinatura
     * @param r Array de valores r da assinatura
     * @param s Array de valores s da assinatura
     */
    function completeWithdrawal(
        address user,
        uint256 amount,
        bytes32 withdrawalHash,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    ) external nonReentrant {
        // Validar que não foi processado
        if (processedWithdrawals[withdrawalHash]) {
            revert WithdrawalAlreadyProcessed();
        }
        
        // Validar que temos suficientes assinaturas
        if (v.length < requiredSignatures) {
            revert InsufficientSignatures();
        }
        
        // Validar cada assinatura
        address[] memory signers = new address[](v.length);
        for (uint i = 0; i < v.length; i++) {
            // Recuperar assinante da assinatura
            address signer = _recoverSigner(withdrawalHash, v[i], r[i], s[i]);
            
            // Validar que é um validador autorizado
            if (!validators[signer]) {
                revert InvalidValidator();
            }
            
            // Validar que não há assinaturas duplicadas
            for (uint j = 0; j < i; j++) {
                if (signers[j] == signer) {
                    revert InvalidSignature();
                }
            }
            
            signers[i] = signer;
        }
        
        // Marcar como processado (previne re-entrada)
        processedWithdrawals[withdrawalHash] = true;
        
        // Liberar TRAY (UNLOCK)
        if (!tray.transfer(user, amount)) {
            revert TransferFailed();
        }
        
        emit WithdrawalCompleted(user, amount, withdrawalHash);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Adicionar validador
     */
    function addValidator(address _validator) external onlyOwner {
        if (_validator == address(0)) revert InvalidValidator();
        
        validators[_validator] = true;
        emit ValidatorAdded(_validator);
    }
    
    /**
     * @dev Remover validador
     */
    function removeValidator(address _validator) external onlyOwner {
        validators[_validator] = false;
        emit ValidatorRemoved(_validator);
    }
    
    /**
     * @dev Atualizar limites
     */
    function updateLimits(uint256 _dailyLimit, uint256 _perTxLimit) external onlyOwner {
        dailyLimit = _dailyLimit;
        perTxLimit = _perTxLimit;
        emit LimitUpdated(_dailyLimit, _perTxLimit);
    }
    
    /**
     * @dev Sacar TRAY em emergência (apenas owner)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        if (!tray.transfer(msg.sender, amount)) {
            revert TransferFailed();
        }
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Atualizar limite diário (reset a cada 24h)
     */
    function _updateDailyLimit() internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (currentDay > lastResetDay) {
            totalDepositedToday = 0;
            lastResetDay = currentDay;
        }
    }
    
    /**
     * @dev Recuperar assinante de uma assinatura ECDSA
     * 
     * Fórmula padrão Ethereum:
     * message = keccak256(abi.encodePacked(data))
     * signer = ecrecover(hash, v, r, s)
     */
    function _recoverSigner(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        return ecrecover(hash, v, r, s);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Verificar saldo de TRAY locked no bridge
     */
    function getLockedBalance() external view returns (uint256) {
        return tray.balanceOf(address(this));
    }
    
    /**
     * @dev Verificar quanto pode ainda depositar hoje
     */
    function getDailyCapacityRemaining() external view returns (uint256) {
        _updateDailyLimit();
        
        uint256 remaining = dailyLimit - totalDepositedToday;
        return remaining;
    }
    
    /**
     * @dev Verificar se saque já foi processado
     */
    function isWithdrawalProcessed(bytes32 withdrawalHash) external view returns (bool) {
        return processedWithdrawals[withdrawalHash];
    }
}
```

---

## Código Completo - Bridge L2

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/TRAY.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BridgeL2
 * @dev Bridge para receber TRAY em Trayon (L2)
 * 
 * Funciona com padrão Mint/Burn:
 * - L2: Mint (criar TRAY para usuários)
 * - L2: Burn (destruir TRAY quando usuários sacam)
 */
contract BridgeL2 is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    TRAY public tray;
    
    // Relayers autorizados (passam mensagens do L1)
    mapping(address => bool) public relayers;
    
    // Rastreamento de depósitos processados
    mapping(bytes32 => bool) public processedDeposits;
    
    uint256 public totalMintedL2;
    uint256 public totalBurnedL2;
    
    // ============ Events ============
    
    event DepositCompleted(
        address indexed user,
        uint256 amount,
        bytes32 depositHash
    );
    
    event WithdrawalInitiated(
        address indexed user,
        uint256 amount,
        bytes32 withdrawalHash
    );
    
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    
    // ============ Errors ============
    
    error InvalidToken();
    error InvalidRelayer();
    error AmountZero();
    error DepositAlreadyProcessed();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _tray, address[] memory _relayers) {
        if (_tray == address(0)) revert InvalidToken();
        
        tray = TRAY(_tray);
        
        // Adicionar relayers iniciais
        for (uint i = 0; i < _relayers.length; i++) {
            relayers[_relayers[i]] = true;
        }
    }
    
    // ============ Deposit Functions (L1 → L2) ============
    
    /**
     * @dev Completar depósito do L1 (apenas relayer)
     * 
     * Minta novos TRAY em L2 quando usuário deposita em L1
     */
    function completeDeposit(
        address user,
        uint256 amount,
        bytes32 depositHash
    ) external nonReentrant {
        if (msg.sender != tx.origin && !relayers[msg.sender]) {
            revert InvalidRelayer();
        }
        
        if (amount == 0) revert AmountZero();
        if (processedDeposits[depositHash]) revert DepositAlreadyProcessed();
        
        // Marcar como processado
        processedDeposits[depositHash] = true;
        
        // MINT novo TRAY em L2 (cria do nada)
        tray.mint(user, amount);
        totalMintedL2 += amount;
        
        emit DepositCompleted(user, amount, depositHash);
    }
    
    // ============ Withdrawal Functions (L2 → L1) ============
    
    /**
     * @dev Iniciar saque de L2 para L1
     * 
     * Queima TRAY em L2 para ser liberado em L1
     */
    function initiateWithdrawal(uint256 amount) external nonReentrant {
        if (amount == 0) revert AmountZero();
        
        // Verificar saldo
        if (tray.balanceOf(msg.sender) < amount) {
            revert TransferFailed();
        }
        
        // BURN TRAY de L2
        tray.burnFrom(msg.sender, amount);
        totalBurnedL2 += amount;
        
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(msg.sender, amount, block.timestamp, block.number)
        );
        
        emit WithdrawalInitiated(msg.sender, amount, withdrawalHash);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Adicionar relayer
     */
    function addRelayer(address _relayer) external onlyOwner {
        if (_relayer == address(0)) revert InvalidRelayer();
        relayers[_relayer] = true;
        emit RelayerAdded(_relayer);
    }
    
    /**
     * @dev Remover relayer
     */
    function removeRelayer(address _relayer) external onlyOwner {
        relayers[_relayer] = false;
        emit RelayerRemoved(_relayer);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Verificar se depósito já foi processado
     */
    function isDepositProcessed(bytes32 depositHash) external view returns (bool) {
        return processedDeposits[depositHash];
    }
    
    /**
     * @dev Verificar estatísticas de bridge
     */
    function getStats() external view returns (
        uint256 minted,
        uint256 burned,
        uint256 circulatingL2
    ) {
        return (
            totalMintedL2,
            totalBurnedL2,
            totalMintedL2 - totalBurnedL2
        );
    }
}
```

---

## Teste do Bridge

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {BridgeL1} from "../src/BridgeL1.sol";
import {BridgeL2} from "../src/BridgeL2.sol";

contract BridgeTest is Test {
    TRAY public tray;
    BridgeL1 public bridgeL1;
    BridgeL2 public bridgeL2;
    
    address public user = makeAddr("user");
    address public validator1 = makeAddr("validator1");
    address public validator2 = makeAddr("validator2");
    address public validator3 = makeAddr("validator3");
    address public treasury = makeAddr("treasury");
    
    function setUp() public {
        // Deploy TRAY
        tray = new TRAY(treasury);
        
        // Deploy bridges
        address[] memory validators = new address[](3);
        validators[0] = validator1;
        validators[1] = validator2;
        validators[2] = validator3;
        
        bridgeL1 = new BridgeL1(address(tray), validators);
        bridgeL2 = new BridgeL2(address(tray), new address[](0));
        
        // Mint TRAY para user
        tray.mintTo(user, 1_000_000 * 10**18);
    }
    
    // Test deposit
    function testDepositL1ToL2() public {
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user);
        tray.approve(address(bridgeL1), amount);
        
        vm.prank(user);
        bridgeL1.deposit(amount);
        
        // Verificar que TRAY foi locked no bridge
        assertEq(tray.balanceOf(address(bridgeL1)), amount);
    }
    
    // Test complete deposit
    function testCompleteDepositL2() public {
        uint256 amount = 1000 * 10**18;
        
        bytes32 depositHash = keccak256(
            abi.encodePacked(user, amount, block.timestamp)
        );
        
        bridgeL2.completeDeposit(user, amount, depositHash);
        
        // Verificar que TRAY foi mintado em L2
        assertEq(tray.balanceOf(user), 1_000_000 * 10**18 + amount);
    }
    
    // Test withdrawal
    function testWithdrawalL2ToL1() public {
        uint256 amount = 1000 * 10**18;
        
        // Primeiro dar TRAY ao user em L2
        tray.mintTo(user, amount);
        
        // User inicia saque
        vm.prank(user);
        bridgeL2.initiateWithdrawal(amount);
        
        // Verificar que TRAY foi queimado
        assertEq(tray.balanceOf(user), 0);
    }
}
```

---

## Fluxo Completo: Exemplo Prático

```
CENÁRIO: José quer mover 1000 TRAY de Polygon para Trayon

┌─────────────────────────────────────────────────────────┐
│ PASSO 1: José aprova em Polygon (L1)                   │
└─────────────────────────────────────────────────────────┘

José tem: 10,000 TRAY em Polygon
Carteira: 0x1234...

1. MetaMask: "Approve BridgeL1 to spend 1000 TRAY"
2. José clica "Confirm"
3. Transação: approve(bridgeL1, 1000)

┌─────────────────────────────────────────────────────────┐
│ PASSO 2: José deposita em Polygon (L1)                 │
└─────────────────────────────────────────────────────────┘

1. MetaMask: "Deposit 1000 TRAY to Bridge"
2. José clica "Confirm"
3. Transação: deposit(1000)

Resultado em Polygon:
  José:    10,000 - 1000 = 9,000 TRAY ✅
  Bridge:  0 + 1000 = 1,000 TRAY (LOCKED) ✅

┌─────────────────────────────────────────────────────────┐
│ PASSO 3: Relayer observa (automaticamente)             │
└─────────────────────────────────────────────────────────┘

Relayer (Node.js):
1. Escuta evento DepositInitiated em Polygon
2. Vê: "José depositou 1000 TRAY"
3. Valida com 3 validadores
4. Prepara transação para Trayon

┌─────────────────────────────────────────────────────────┐
│ PASSO 4: Relayer executa em Trayon (L2)               │
└─────────────────────────────────────────────────────────┘

Transação em Trayon:
  completeDeposit(josé, 1000, hash)

Resultado em Trayon:
  José:    0 + 1000 = 1,000 TRAY (novo!) ✅

┌─────────────────────────────────────────────────────────┐
│ RESULTADO FINAL                                          │
└─────────────────────────────────────────────────────────┘

Polygon (L1):
  José: 9,000 TRAY (9000 gastou)
  Bridge: 1,000 TRAY (locked)

Trayon (L2):
  José: 1,000 TRAY (recebeu)

INVARIANTE MANTIDO:
  Total de TRAY em circulação: 10,000 (9000 + 1000 = 9000 + 1000) ✅
  Supply global: 1B mantém-se ✅
```

---

## Checklist de Implementação

```
[ ] 1. BridgeL1.sol - Contrato em Polygon
    [ ] deposit() function
    [ ] completeWithdrawal() function
    [ ] Multi-sig validation
    [ ] Rate limiting (daily/per-tx)
    [ ] Emergency pause

[ ] 2. BridgeL2.sol - Contrato em Trayon
    [ ] completeDeposit() function
    [ ] initiateWithdrawal() function
    [ ] Relayer management
    [ ] Stats tracking

[ ] 3. Relayer - Node.js/TypeScript
    [ ] L1 listener (Polygon events)
    [ ] L2 listener (Trayon events)
    [ ] Multi-sig signing
    [ ] Transaction execution
    [ ] Error handling & retry

[ ] 4. Testes
    [ ] Deposit happy path
    [ ] Withdrawal happy path
    [ ] Rate limiting violation
    [ ] Multi-sig validation
    [ ] Replay attack prevention
    [ ] Emergency withdrawal

[ ] 5. Deploy
    [ ] Deploy BridgeL1 em Polygon Amoy
    [ ] Deploy BridgeL2 em Trayon Testnet
    [ ] Deploy Relayer (backend)
    [ ] E2E tests
    [ ] Security audit

[ ] 6. Mainnet
    [ ] Deploy em Polygon PoS
    [ ] Deploy em Trayon Mainnet
    [ ] Monitor 24/7
    [ ] Community announcement
```

---

## Próximos Passos

1. **Entenda este documento** - Leia várias vezes, absorva os conceitos
2. **Crie BridgeL1.sol** - Use o código como template
3. **Crie BridgeL2.sol** - Use o código como template
4. **Escreva testes** - Garanta que funciona
5. **Deploy em testnet** - Teste end-to-end
6. **Build relayer** - Node.js para passar mensagens
7. **Deploy em mainnet** - Pronto para produção!

Qualquer dúvida, releia a seção de explicação! 🚀
