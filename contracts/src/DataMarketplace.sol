// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Data Marketplace
 * @dev Marketplace para comerciar datasets validados
 * 
 * Permitir que validadores vendam dados ao público:
 * - Datasets certificados com histórico de acurácia
 * - Preço em TRAY
 * - Histórico de compras
 * - Royalties para validadores
 */
contract DataMarketplace is ReentrancyGuard, Ownable {
    // ============ Constants ============
    
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 10;  // 10%
    
    // ============ State Variables ============
    
    IERC20 public trayToken;
    
    struct Dataset {
        uint256 datasetId;
        address creator;
        string title;
        string description;
        string category;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        uint256 totalSales;
        uint256 totalRevenue;
        uint256 accuracy;           // 0-10000 (0-100%)
        string ipfsHash;            // Link para dados no IPFS
        bytes32 dataHash;           // Merkle root dos dados
    }
    
    struct Purchase {
        uint256 datasetId;
        address buyer;
        uint256 amount;
        uint256 timestamp;
        bool accessGranted;
    }
    
    mapping(uint256 => Dataset) public datasets;
    mapping(address => uint256[]) public creatorDatasets;
    mapping(address => uint256[]) public purchaseHistory;
    mapping(bytes32 => bool) public purchaseRecords;  // hash(buyer, datasetId) => purchased
    
    uint256 public datasetCounter;
    uint256 public totalDatasets;
    uint256 public totalTransactionVolume;
    
    Purchase[] public purchaseLog;
    
    uint256 public platformBalance;
    
    // ============ Events ============
    
    event DatasetCreated(
        uint256 indexed datasetId,
        address indexed creator,
        string title,
        uint256 price,
        string category,
        uint256 timestamp
    );
    
    event DatasetUpdated(
        uint256 indexed datasetId,
        uint256 newPrice,
        bool isActive,
        uint256 timestamp
    );
    
    event DatasetPurchased(
        uint256 indexed datasetId,
        address indexed buyer,
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );
    
    event AccessGranted(
        uint256 indexed datasetId,
        address indexed buyer,
        uint256 timestamp
    );
    
    event PlatformFeeWithdrawn(uint256 amount, uint256 timestamp);
    event CreatorPaymentWithdrawn(address indexed creator, uint256 amount, uint256 timestamp);
    
    // ============ Errors ============
    
    error DatasetNotFound();
    error DatasetInactive();
    error InsufficientBalance();
    error AlreadyPurchased();
    error InvalidPrice();
    error InvalidAccuracy();
    error TransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
        datasetCounter = 1;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Criar novo dataset
     * @param _title Título do dataset
     * @param _description Descrição
     * @param _category Categoria (ex: "government", "financial")
     * @param _price Preço em TRAY
     * @param _accuracy Acurácia (0-10000 = 0-100%)
     * @param _ipfsHash Hash IPFS dos dados
     * @param _dataHash Merkle root dos dados
     */
    function createDataset(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        uint256 _price,
        uint256 _accuracy,
        string calldata _ipfsHash,
        bytes32 _dataHash
    ) external returns (uint256) {
        if (_price == 0) revert InvalidPrice();
        if (_accuracy > 10000) revert InvalidAccuracy();
        
        uint256 datasetId = datasetCounter;
        datasetCounter++;
        
        datasets[datasetId] = Dataset({
            datasetId: datasetId,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            price: _price,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0,
            totalRevenue: 0,
            accuracy: _accuracy,
            ipfsHash: _ipfsHash,
            dataHash: _dataHash
        });
        
        creatorDatasets[msg.sender].push(datasetId);
        totalDatasets++;
        
        emit DatasetCreated(datasetId, msg.sender, _title, _price, _category, block.timestamp);
        
        return datasetId;
    }
    
    /**
     * @dev Comprar acesso a dataset
     * @param _datasetId ID do dataset
     */
    function purchaseDataset(uint256 _datasetId) external nonReentrant {
        Dataset storage dataset = datasets[_datasetId];
        if (dataset.creator == address(0)) revert DatasetNotFound();
        if (!dataset.isActive) revert DatasetInactive();
        
        // Verificar se já comprou
        bytes32 purchaseKey = keccak256(abi.encodePacked(msg.sender, _datasetId));
        if (purchaseRecords[purchaseKey]) revert AlreadyPurchased();
        
        uint256 price = dataset.price;
        
        // Verificar aprovação e saldo
        if (trayToken.balanceOf(msg.sender) < price) revert InsufficientBalance();
        if (trayToken.allowance(msg.sender, address(this)) < price) revert InsufficientBalance();
        
        // Transferir tokens
        bool success = trayToken.transferFrom(msg.sender, address(this), price);
        if (!success) revert TransferFailed();
        
        // Calcular distribuição de fees
        uint256 platformFee = (price * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 creatorPayment = price - platformFee;
        
        // Registrar compra
        purchaseRecords[purchaseKey] = true;
        dataset.totalSales++;
        dataset.totalRevenue += creatorPayment;
        totalTransactionVolume += price;
        platformBalance += platformFee;
        
        Purchase memory purchase = Purchase({
            datasetId: _datasetId,
            buyer: msg.sender,
            amount: price,
            timestamp: block.timestamp,
            accessGranted: false
        });
        
        purchaseLog.push(purchase);
        purchaseHistory[msg.sender].push(_datasetId);
        
        // Transferir payment para creator (guardar no contrato para safety)
        // Creator depois faz withdraw
        
        emit DatasetPurchased(_datasetId, msg.sender, dataset.creator, price, block.timestamp);
        emit AccessGranted(_datasetId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Atualizar preço de dataset
     */
    function updateDatasetPrice(uint256 _datasetId, uint256 _newPrice) external {
        Dataset storage dataset = datasets[_datasetId];
        if (dataset.creator == address(0)) revert DatasetNotFound();
        if (msg.sender != dataset.creator) revert();
        if (_newPrice == 0) revert InvalidPrice();
        
        dataset.price = _newPrice;
        emit DatasetUpdated(_datasetId, _newPrice, dataset.isActive, block.timestamp);
    }
    
    /**
     * @dev Desativar dataset
     */
    function deactivateDataset(uint256 _datasetId) external {
        Dataset storage dataset = datasets[_datasetId];
        if (dataset.creator == address(0)) revert DatasetNotFound();
        if (msg.sender != dataset.creator && msg.sender != owner()) revert();
        
        dataset.isActive = false;
        emit DatasetUpdated(_datasetId, dataset.price, false, block.timestamp);
    }
    
    /**
     * @dev Reativar dataset
     */
    function reactivateDataset(uint256 _datasetId) external {
        Dataset storage dataset = datasets[_datasetId];
        if (dataset.creator == address(0)) revert DatasetNotFound();
        if (msg.sender != dataset.creator) revert();
        
        dataset.isActive = true;
        emit DatasetUpdated(_datasetId, dataset.price, true, block.timestamp);
    }
    
    /**
     * @dev Verificar se usuário comprou dataset
     */
    function hasPurchased(address _buyer, uint256 _datasetId) 
        external 
        view 
        returns (bool) 
    {
        bytes32 purchaseKey = keccak256(abi.encodePacked(_buyer, _datasetId));
        return purchaseRecords[purchaseKey];
    }
    
    /**
     * @dev Sacar platform fees (admin)
     */
    function withdrawPlatformFees(address _recipient, uint256 _amount) external onlyOwner {
        if (_amount > platformBalance) revert InsufficientBalance();
        
        platformBalance -= _amount;
        
        bool success = trayToken.transfer(_recipient, _amount);
        if (!success) revert TransferFailed();
        
        emit PlatformFeeWithdrawn(_amount, block.timestamp);
    }
    
    /**
     * @dev Sacar royalties do creator (creator chama)
     */
    function withdrawCreatorRoyalties() external nonReentrant {
        // Calcular total devido ao creator
        uint256 totalDue = 0;
        
        for (uint256 i = 0; i < creatorDatasets[msg.sender].length; i++) {
            uint256 datasetId = creatorDatasets[msg.sender][i];
            totalDue += datasets[datasetId].totalRevenue;
        }
        
        if (totalDue == 0) revert InsufficientBalance();
        
        // Reset royalties
        for (uint256 i = 0; i < creatorDatasets[msg.sender].length; i++) {
            datasets[creatorDatasets[msg.sender][i]].totalRevenue = 0;
        }
        
        bool success = trayToken.transfer(msg.sender, totalDue);
        if (!success) revert TransferFailed();
        
        emit CreatorPaymentWithdrawn(msg.sender, totalDue, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Obter informações de dataset
     */
    function getDataset(uint256 _datasetId) 
        external 
        view 
        returns (Dataset memory) 
    {
        return datasets[_datasetId];
    }
    
    /**
     * @dev Obter datasets de um creator
     */
    function getCreatorDatasets(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorDatasets[_creator];
    }
    
    /**
     * @dev Obter histórico de compras de um buyer
     */
    function getBuyerPurchaseHistory(address _buyer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return purchaseHistory[_buyer];
    }
    
    /**
     * @dev Obter log de compras recentes (últimas N)
     */
    function getRecentPurchases(uint256 _limit) 
        external 
        view 
        returns (Purchase[] memory) 
    {
        uint256 start = purchaseLog.length > _limit ? purchaseLog.length - _limit : 0;
        uint256 length = purchaseLog.length - start;
        
        Purchase[] memory recent = new Purchase[](length);
        for (uint256 i = 0; i < length; i++) {
            recent[i] = purchaseLog[start + i];
        }
        
        return recent;
    }
    
    /**
     * @dev Obter estatísticas do marketplace
     */
    function getStats() external view returns (
        uint256 totalDatasets_,
        uint256 totalTransactions,
        uint256 totalVolume,
        uint256 platformBalance_
    ) {
        return (
            totalDatasets,
            purchaseLog.length,
            totalTransactionVolume,
            platformBalance
        );
    }
}
