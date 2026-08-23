// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Prediction Market
 * @dev Mercado de predições estilo Polymarket
 * 
 * Usuários fazem apostas em eventos do mundo real:
 * - Mercados binários (Sim/Não)
 * - Liquidação via oráculo
 * - Fee: 2% para plataforma
 * - Recompensas para acertos
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    // ============ Constants ============
    
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 2;  // 2%
    uint256 public constant RESOLUTION_TIMEOUT = 7 days;  // Tempo para resolver
    
    // Market states
    uint8 public constant MARKET_OPEN = 0;
    uint8 public constant MARKET_RESOLVED = 1;
    uint8 public constant MARKET_CANCELLED = 2;
    
    // ============ State Variables ============
    
    IERC20 public trayToken;
    
    struct Market {
        uint256 marketId;
        string title;
        string description;
        uint256 createdAt;
        uint256 resolvesAt;
        uint8 state;              // OPEN, RESOLVED, CANCELLED
        bool resolution;           // true=YES won, false=NO won
        uint256 yesPool;
        uint256 noPool;
        uint256 totalVolume;
        address creator;
        address resolver;         // Oracle que resolve
        bool resolved;
    }
    
    struct Position {
        address user;
        uint256 marketId;
        bool isYes;
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Position[]) public positions;  // marketId => positions
    mapping(bytes32 => uint256) public userPositions; // hash(user, marketId, isYes) => amount
    
    uint256 public marketCounter;
    uint256 public totalMarkets;
    uint256 public totalVolume;
    uint256 public platformBalance;
    
    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        string title,
        uint256 resolvesAt,
        address indexed creator,
        uint256 timestamp
    );
    
    event PositionOpened(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 timestamp
    );
    
    event PositionClosed(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 payout,
        uint256 timestamp
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool resolution,
        uint256 yesTotal,
        uint256 noTotal,
        address indexed resolver,
        uint256 timestamp
    );
    
    event MarketCancelled(uint256 indexed marketId, uint256 timestamp);
    event PlatformFeeWithdrawn(uint256 amount, uint256 timestamp);
    
    // ============ Errors ============
    
    error MarketNotFound();
    error MarketNotOpen();
    error MarketAlreadyResolved();
    error InvalidAmount();
    error InsufficientBalance();
    error ResolutionTimedOut();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
        marketCounter = 1;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Criar novo mercado de predição
     * @param _title Título do evento
     * @param _description Descrição
     * @param _resolvesAt Timestamp quando mercado se resolve
     */
    function createMarket(
        string calldata _title,
        string calldata _description,
        uint256 _resolvesAt
    ) external returns (uint256) {
        if (_resolvesAt <= block.timestamp) revert InvalidAmount();
        
        uint256 marketId = marketCounter;
        marketCounter++;
        
        markets[marketId] = Market({
            marketId: marketId,
            title: _title,
            description: _description,
            createdAt: block.timestamp,
            resolvesAt: _resolvesAt,
            state: MARKET_OPEN,
            resolution: false,
            yesPool: 0,
            noPool: 0,
            totalVolume: 0,
            creator: msg.sender,
            resolver: address(0),
            resolved: false
        });
        
        totalMarkets++;
        
        emit MarketCreated(marketId, _title, _resolvesAt, msg.sender, block.timestamp);
        
        return marketId;
    }
    
    /**
     * @dev Abrir posição (apostar)
     * @param _marketId ID do mercado
     * @param _isYes true para YES, false para NO
     * @param _amount Quantidade de TRAY
     */
    function openPosition(
        uint256 _marketId,
        bool _isYes,
        uint256 _amount
    ) external nonReentrant {
        Market storage market = markets[_marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        if (market.state != MARKET_OPEN) revert MarketNotOpen();
        if (block.timestamp >= market.resolvesAt) revert MarketNotOpen();
        if (_amount == 0) revert InvalidAmount();
        
        // Verificar saldo
        if (trayToken.balanceOf(msg.sender) < _amount) revert InsufficientBalance();
        if (trayToken.allowance(msg.sender, address(this)) < _amount) revert InsufficientBalance();
        
        // Transferir tokens
        bool success = trayToken.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert TransferFailed();
        
        // Atualizar pools
        if (_isYes) {
            market.yesPool += _amount;
        } else {
            market.noPool += _amount;
        }
        
        market.totalVolume += _amount;
        totalVolume += _amount;
        
        // Registrar posição
        positions[_marketId].push(Position({
            user: msg.sender,
            marketId: _marketId,
            isYes: _isYes,
            amount: _amount,
            timestamp: block.timestamp
        }));
        
        // Rastrear posição por usuário
        bytes32 positionKey = keccak256(abi.encodePacked(msg.sender, _marketId, _isYes));
        userPositions[positionKey] += _amount;
        
        emit PositionOpened(_marketId, msg.sender, _isYes, _amount, block.timestamp);
    }
    
    /**
     * @dev Resolver mercado
     * @param _marketId ID do mercado
     * @param _resolution true=YES ganhou, false=NO ganhou
     */
    function resolveMarket(uint256 _marketId, bool _resolution) external onlyOwner {
        Market storage market = markets[_marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        if (market.state != MARKET_OPEN) revert MarketAlreadyResolved();
        
        // Verificar se tempo passou
        if (block.timestamp < market.resolvesAt) revert ResolutionTimedOut();
        
        market.state = MARKET_RESOLVED;
        market.resolved = true;
        market.resolution = _resolution;
        market.resolver = msg.sender;
        
        emit MarketResolved(
            _marketId,
            _resolution,
            market.yesPool,
            market.noPool,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Cancelar mercado (reembolsar todos)
     */
    function cancelMarket(uint256 _marketId) external onlyOwner {
        Market storage market = markets[_marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        
        market.state = MARKET_CANCELLED;
        
        emit MarketCancelled(_marketId, block.timestamp);
    }
    
    /**
     * @dev Coletar recompensas (call após resolução)
     */
    function claimRewards(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        if (market.creator == address(0)) revert MarketNotFound();
        if (market.state == MARKET_OPEN) revert MarketNotOpen();
        
        bytes32 positionKey = keccak256(abi.encodePacked(msg.sender, _marketId, market.resolution));
        uint256 winningAmount = userPositions[positionKey];
        
        if (winningAmount == 0) {
            // Usuário perdeu ou quer reembolso em cancelamento
            if (market.state == MARKET_CANCELLED) {
                // Reembolsar ambas posições
                bytes32 yesKey = keccak256(abi.encodePacked(msg.sender, _marketId, true));
                bytes32 noKey = keccak256(abi.encodePacked(msg.sender, _marketId, false));
                
                uint256 yesAmount = userPositions[yesKey];
                uint256 noAmount = userPositions[noKey];
                uint256 refund = yesAmount + noAmount;
                
                if (refund > 0) {
                    userPositions[yesKey] = 0;
                    userPositions[noKey] = 0;
                    
                    bool successRefund = trayToken.transfer(msg.sender, refund);
                    if (!successRefund) revert TransferFailed();
                }
            }
            return;
        }
        
        // Calcular payout
        uint256 losingPool = market.resolution ? market.noPool : market.yesPool;
        uint256 winningPool = market.resolution ? market.yesPool : market.noPool;
        
        // Payout proporcional: winning position share + perde pool share
        uint256 payout = winningAmount + (losingPool * winningAmount / winningPool);
        
        // Platform fee: 2% do losing pool
        uint256 fee = (losingPool * PLATFORM_FEE_PERCENTAGE) / 100;
        platformBalance += fee;
        
        // Resetar posição
        userPositions[positionKey] = 0;
        
        // Transferir payout
        bool success = trayToken.transfer(msg.sender, payout - (payout * PLATFORM_FEE_PERCENTAGE / 100));
        if (!success) revert TransferFailed();
        
        emit PositionClosed(_marketId, msg.sender, market.resolution, winningAmount, payout, block.timestamp);
    }
    
    /**
     * @dev Sacar platform fees
     */
    function withdrawPlatformFees(address _recipient, uint256 _amount) external onlyOwner {
        if (_amount > platformBalance) revert InsufficientBalance();
        
        platformBalance -= _amount;
        
        bool success = trayToken.transfer(_recipient, _amount);
        if (!success) revert TransferFailed();
        
        emit PlatformFeeWithdrawn(_amount, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Obter informações de mercado
     */
    function getMarket(uint256 _marketId) 
        external 
        view 
        returns (Market memory) 
    {
        return markets[_marketId];
    }
    
    /**
     * @dev Obter posições de um usuário
     */
    function getUserPositions(address _user, uint256 _marketId) 
        external 
        view 
        returns (uint256 yesAmount, uint256 noAmount) 
    {
        bytes32 yesKey = keccak256(abi.encodePacked(_user, _marketId, true));
        bytes32 noKey = keccak256(abi.encodePacked(_user, _marketId, false));
        
        return (userPositions[yesKey], userPositions[noKey]);
    }
    
    /**
     * @dev Obter histórico de posições de um mercado
     */
    function getMarketPositions(uint256 _marketId) 
        external 
        view 
        returns (Position[] memory) 
    {
        return positions[_marketId];
    }
    
    /**
     * @dev Obter estatísticas
     */
    function getStats() external view returns (
        uint256 totalMarkets_,
        uint256 totalVolume_,
        uint256 platformBalance_
    ) {
        return (totalMarkets, totalVolume, platformBalance);
    }
}
