// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Oracle Manager
 * @dev Gerencia oráculos de dados e feeds de IA
 * 
 * Funcionalidades:
 * - Validadores registram dados
 * - Dados são consolidados e certificados
 * - Consultas pagam taxa em TRAY
 * - Reputação scoring de validadores
 */
contract OracleManager is Ownable {
    // ============ Constants ============
    
    uint256 public constant MIN_CERTIFICATIONS = 2; // 2 de 3 = 66%+ consensus
    uint256 public constant QUERY_FEE = 1_000 * 10**18; // 1,000 TRAY
    
    // ============ State Variables ============
    
    IERC20 public trayToken;
    
    uint256 public queryFee = QUERY_FEE;
    uint256 public totalFeesCollected;
    
    // Validators
    address[] public validators;
    mapping(address => ValidatorInfo) public validatorInfo;
    mapping(address => bool) public isValidatorActive;
    
    struct ValidatorInfo {
        uint256 reputation;
        uint256 dataSubmitted;
        uint256 dataCertified;
        bool isActive;
        uint256 joinedAt;
    }
    
    // Data Feeds
    bytes32[] public feedIds;
    mapping(bytes32 => DataFeed) public feeds;
    
    struct DataFeed {
        string dataType;
        string category;
        bytes data;
        address submitter;
        uint256 timestamp;
        bool certified;
        uint256 certifications;
        mapping(address => bool) hasVoted;
    }
    
    // ============ Events ============
    
    event ValidatorRegistered(address indexed validator, uint256 timestamp);
    event ValidatorDeactivated(address indexed validator);
    event ValidatorReactivated(address indexed validator);
    event DataSubmitted(address indexed validator, bytes32 indexed feedId, string dataType);
    event DataCertification(address indexed validator, bytes32 indexed feedId, bool approved);
    event QueryExecuted(bytes32 indexed feedId, address indexed querier, uint256 fee);
    event QueryFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    
    // ============ Errors ============
    
    error ValidatorAlreadyRegistered();
    error NotAValidator();
    error InvalidAddress();
    error FeedNotFound();
    error FeedAlreadyCertified();
    error InvalidFeeAmount();
    error InvalidDataType();
    error InvalidCategory();
    error TransferFailed();
    error InsufficientFee();
    
    // ============ Constructor ============
    
    constructor(address _trayToken) {
        require(_trayToken != address(0), "Invalid TRAY token");
        trayToken = IERC20(_trayToken);
    }
    
    // ============ Validator Management ============
    
    /**
     * @dev Registrar novo validador de oracle
     * @param validatorAddress Endereço do validador
     */
    function registerValidator(address validatorAddress) external onlyOwner {
        if (validatorAddress == address(0)) revert InvalidAddress();
        if (isValidatorActive[validatorAddress]) revert ValidatorAlreadyRegistered();
        
        validators.push(validatorAddress);
        isValidatorActive[validatorAddress] = true;
        
        validatorInfo[validatorAddress] = ValidatorInfo({
            reputation: 100,
            dataSubmitted: 0,
            dataCertified: 0,
            isActive: true,
            joinedAt: block.timestamp
        });
        
        emit ValidatorRegistered(validatorAddress, block.timestamp);
    }
    
    /**
     * @dev Desativar validador
     * @param validatorAddress Endereço
     */
    function deactivateValidator(address validatorAddress) external onlyOwner {
        require(isValidatorActive[validatorAddress], "Validator not active");
        isValidatorActive[validatorAddress] = false;
        validatorInfo[validatorAddress].isActive = false;
        emit ValidatorDeactivated(validatorAddress);
    }
    
    /**
     * @dev Reativar validador
     * @param validatorAddress Endereço
     */
    function reactivateValidator(address validatorAddress) external onlyOwner {
        require(validators.length > 0, "No validators registered");
        isValidatorActive[validatorAddress] = true;
        validatorInfo[validatorAddress].isActive = true;
        emit ValidatorReactivated(validatorAddress);
    }
    
    // ============ Data Submission ============
    
    /**
     * @dev Submeter dados para oracle
     * @param dataType Tipo de dados (government, corporate, market, etc)
     * @param category Categoria dos dados
     * @param data Payload dos dados
     */
    function submitData(
        string calldata dataType,
        string calldata category,
        bytes calldata data
    ) external {
        if (!isValidatorActive[msg.sender]) revert NotAValidator();
        if (data.length == 0) revert InvalidFeeAmount();
        
        bytes32 feedId = keccak256(abi.encodePacked(dataType, category, data, block.timestamp, msg.sender));
        
        feeds[feedId].dataType = dataType;
        feeds[feedId].category = category;
        feeds[feedId].data = data;
        feeds[feedId].submitter = msg.sender;
        feeds[feedId].timestamp = block.timestamp;
        feeds[feedId].certified = false;
        feeds[feedId].certifications = 0;
        
        feedIds.push(feedId);
        validatorInfo[msg.sender].dataSubmitted++;
        
        emit DataSubmitted(msg.sender, feedId, dataType);
    }
    
    // ============ Data Certification ============
    
    /**
     * @dev Certificar dados (validador vota)
     * @param feedId ID do feed
     * @param approved True para aprovar, false para rejeitar
     */
    function certifyData(bytes32 feedId, bool approved) external {
        if (!isValidatorActive[msg.sender]) revert NotAValidator();
        if (feeds[feedId].timestamp == 0) revert FeedNotFound();
        if (feeds[feedId].hasVoted[msg.sender]) revert FeedAlreadyCertified();
        
        feeds[feedId].hasVoted[msg.sender] = true;
        
        if (approved) {
            feeds[feedId].certifications++;
            validatorInfo[msg.sender].reputation += 5;
            if (validatorInfo[msg.sender].reputation > 150) {
                validatorInfo[msg.sender].reputation = 150;
            }
            validatorInfo[msg.sender].dataCertified++;
        } else {
            if (validatorInfo[msg.sender].reputation >= 5) {
                validatorInfo[msg.sender].reputation -= 5;
            } else {
                validatorInfo[msg.sender].reputation = 0;
            }
        }
        
        // Auto-certificar se 2/3 chegados
        if (feeds[feedId].certifications >= MIN_CERTIFICATIONS) {
            feeds[feedId].certified = true;
        }
        
        emit DataCertification(msg.sender, feedId, approved);
    }
    
    // ============ Data Query ============
    
    /**
     * @dev Consultar dados certificados (com pagamento)
     * @param feedId ID do feed
     */
    function queryData(bytes32 feedId) external returns (bytes memory) {
        if (!feeds[feedId].certified) revert FeedNotFound();
        
        // Cobrar taxa
        require(
            trayToken.transferFrom(msg.sender, address(this), queryFee),
            "Payment failed"
        );
        
        totalFeesCollected += queryFee;
        emit QueryExecuted(feedId, msg.sender, queryFee);
        
        return feeds[feedId].data;
    }
    
    /**
     * @dev Atualizar taxa de query
     * @param newFee Nova taxa
     */
    function updateQueryFee(uint256 newFee) external onlyOwner {
        if (newFee == 0) revert InvalidFeeAmount();
        queryFee = newFee;
        emit QueryFeeUpdated(newFee);
    }
    
    /**
     * @dev Sacar fees coletadas
     * @param recipient Destinatário
     */
    function withdrawFees(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(totalFeesCollected > 0, "No fees to withdraw");
        
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        
        require(trayToken.transfer(recipient, amount), "Transfer failed");
        emit FeesWithdrawn(recipient, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Retornar informações do feed
     * @param feedId ID do feed
     */
    function getFeedInfo(bytes32 feedId) external view returns (
        string memory dataType,
        address submitter,
        uint256 timestamp,
        bool certified,
        uint256 certifications,
        string memory category
    ) {
        require(feeds[feedId].timestamp != 0, "Feed not found");
        return (
            feeds[feedId].dataType,
            feeds[feedId].submitter,
            feeds[feedId].timestamp,
            feeds[feedId].certified,
            feeds[feedId].certifications,
            feeds[feedId].category
        );
    }
    
    /**
     * @dev Retornar feeds recentes
     * @param limit Quantidade
     */
    function getRecentFeeds(uint256 limit) external view returns (bytes32[] memory) {
        uint256 length = feedIds.length;
        if (length > limit) length = limit;
        
        bytes32[] memory recent = new bytes32[](length);
        for (uint256 i = 0; i < length; i++) {
            recent[i] = feedIds[feedIds.length - 1 - i];
        }
        return recent;
    }
    
    /**
     * @dev Retornar informações do validador
     * @param validator Endereço
     */
    function getValidatorInfo(address validator) external view returns (
        address,
        uint256,
        uint256,
        uint256,
        bool
    ) {
        ValidatorInfo memory info = validatorInfo[validator];
        return (validator, info.reputation, info.dataSubmitted, info.dataCertified, info.isActive);
    }
    
    /**
     * @dev Retornar lista de validadores
     */
    function getValidators() external view returns (address[] memory) {
        return validators;
    }
    
    /**
     * @dev Retornar estatísticas gerais
     */
    function getStats() external view returns (
        uint256 totalValidators,
        uint256 totalFeeds,
        uint256 certifiedFeeds,
        uint256 queries,
        uint256 fees
    ) {
        uint256 certified = 0;
        for (uint256 i = 0; i < feedIds.length; i++) {
            if (feeds[feedIds[i]].certified) certified++;
        }
        
        return (
            validators.length,
            feedIds.length,
            certified,
            0, // queries count seria rastreado separadamente
            totalFeesCollected
        );
    }
}
