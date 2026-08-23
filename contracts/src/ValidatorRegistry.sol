// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Validator Registry
 * @dev Registro independente de validadores de Trayon
 * 
 * Diferente de TRAYStaking, este contrato:
 * - Mantém histórico completo de validadores
 * - Auditoria de certificações (dados validados)
 * - Histórico de slashing
 * - Rastreamento de performance
 */
contract ValidatorRegistry is Ownable {
    // ============ Constants ============
    
    uint256 public constant MAX_VALIDATORS = 1000;
    
    // ============ State Variables ============
    
    IERC20 public trayToken;
    
    struct ValidatorRecord {
        address validatorAddress;
        uint256 registeredAt;
        uint256 certificationsCount;
        uint256 dataSubmittedCount;
        uint256 slashCount;
        uint256 totalSlashedAmount;
        bool isApproved;
        bool isActive;
        uint256 certificationAccuracy;  // 0-10000 (0-100%)
        string jurisdictionCode;        // País ou região
        uint256 kycLevel;              // 0 (none), 1 (basic), 2 (full)
    }
    
    mapping(address => ValidatorRecord) public validators;
    address[] public validatorList;
    
    // Histórico de slashing
    struct SlashEvent {
        address validator;
        uint256 timestamp;
        uint256 amount;
        string reason;
        address slashedBy;
    }
    
    SlashEvent[] public slashHistory;
    
    // Histórico de certificações por validador
    mapping(address => uint256[]) public validatorCertifications;
    
    uint256 public totalValidators;
    uint256 public totalApprovedValidators;
    uint256 public totalSlashed;
    
    // ============ Events ============
    
    event ValidatorRegistered(
        address indexed validator,
        string jurisdictionCode,
        uint256 kycLevel,
        uint256 timestamp
    );
    
    event ValidatorApproved(address indexed validator, uint256 timestamp);
    event ValidatorDeactivated(address indexed validator, string reason);
    event CertificationRecorded(
        address indexed validator,
        uint256 feedId,
        uint256 accuracy,
        uint256 timestamp
    );
    event ValidatorSlashed(
        address indexed validator,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    event JurisdictionUpdated(address indexed validator, string newCode);
    event KYCLevelUpdated(address indexed validator, uint256 newLevel);
    
    // ============ Errors ============
    
    error ValidatorNotFound();
    error ValidatorAlreadyRegistered();
    error ValidatorNotApproved();
    error MaxValidatorsReached();
    error InvalidKYCLevel();
    error InvalidAccuracy();
    
    // ============ Constructor ============
    
    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Registrar novo validador
     * @param _jurisdictionCode Código de país/região
     * @param _kycLevel Nível de KYC (0=none, 1=basic, 2=full)
     */
    function registerValidator(
        address _validator,
        string calldata _jurisdictionCode,
        uint256 _kycLevel
    ) external onlyOwner {
        if (validators[_validator].validatorAddress != address(0)) {
            revert ValidatorAlreadyRegistered();
        }
        if (_kycLevel > 2) revert InvalidKYCLevel();
        if (validatorList.length >= MAX_VALIDATORS) revert MaxValidatorsReached();
        
        validators[_validator] = ValidatorRecord({
            validatorAddress: _validator,
            registeredAt: block.timestamp,
            certificationsCount: 0,
            dataSubmittedCount: 0,
            slashCount: 0,
            totalSlashedAmount: 0,
            isApproved: false,
            isActive: true,
            certificationAccuracy: 10000,  // 100% inicialmente
            jurisdictionCode: _jurisdictionCode,
            kycLevel: _kycLevel
        });
        
        validatorList.push(_validator);
        totalValidators++;
        
        emit ValidatorRegistered(_validator, _jurisdictionCode, _kycLevel, block.timestamp);
    }
    
    /**
     * @dev Aprovar validador para participar de consenso
     */
    function approveValidator(address _validator) external onlyOwner {
        ValidatorRecord storage record = validators[_validator];
        if (record.validatorAddress == address(0)) revert ValidatorNotFound();
        
        record.isApproved = true;
        totalApprovedValidators++;
        
        emit ValidatorApproved(_validator, block.timestamp);
    }
    
    /**
     * @dev Desativar validador
     */
    function deactivateValidator(address _validator, string calldata _reason) 
        external 
        onlyOwner 
    {
        ValidatorRecord storage record = validators[_validator];
        if (record.validatorAddress == address(0)) revert ValidatorNotFound();
        
        record.isActive = false;
        if (record.isApproved) totalApprovedValidators--;
        
        emit ValidatorDeactivated(_validator, _reason);
    }
    
    /**
     * @dev Registrar certificação de validador
     * @param _validator Endereço do validador
     * @param _feedId ID do feed certificado
     * @param _accuracy Acurácia (0-10000 = 0-100%)
     */
    function recordCertification(
        address _validator,
        uint256 _feedId,
        uint256 _accuracy
    ) external onlyOwner {
        ValidatorRecord storage record = validators[_validator];
        if (record.validatorAddress == address(0)) revert ValidatorNotFound();
        if (_accuracy > 10000) revert InvalidAccuracy();
        
        record.certificationsCount++;
        
        // Atualizar média de acurácia
        if (record.certificationsCount == 1) {
            record.certificationAccuracy = _accuracy;
        } else {
            record.certificationAccuracy = 
                (record.certificationAccuracy + _accuracy) / 2;
        }
        
        validatorCertifications[_validator].push(_feedId);
        
        emit CertificationRecorded(_validator, _feedId, _accuracy, block.timestamp);
    }
    
    /**
     * @dev Registrar slashing de validador
     * @param _validator Endereço do validador
     * @param _amount Quantidade slashada
     * @param _reason Razão do slashing
     */
    function recordSlashing(
        address _validator,
        uint256 _amount,
        string calldata _reason
    ) external onlyOwner {
        ValidatorRecord storage record = validators[_validator];
        if (record.validatorAddress == address(0)) revert ValidatorNotFound();
        
        record.slashCount++;
        record.totalSlashedAmount += _amount;
        totalSlashed += _amount;
        
        // Registrar no histórico
        slashHistory.push(SlashEvent({
            validator: _validator,
            timestamp: block.timestamp,
            amount: _amount,
            reason: _reason,
            slashedBy: msg.sender
        }));
        
        // Penalizar acurácia: reduzir 5%
        uint256 accuracyPenalty = (record.certificationAccuracy * 5) / 100;
        if (record.certificationAccuracy >= accuracyPenalty) {
            record.certificationAccuracy -= accuracyPenalty;
        } else {
            record.certificationAccuracy = 0;
        }
        
        // Se muitas infrações, desativar
        if (record.slashCount >= 5) {
            record.isActive = false;
        }
        
        emit ValidatorSlashed(_validator, _amount, _reason, block.timestamp);
    }
    
    /**
     * @dev Atualizar código de jurisdição
     */
    function updateJurisdiction(address _validator, string calldata _newCode) 
        external 
        onlyOwner 
    {
        ValidatorRecord storage record = validators[_validator];
        if (record.validatorAddress == address(0)) revert ValidatorNotFound();
        
        record.jurisdictionCode = _newCode;
        emit JurisdictionUpdated(_validator, _newCode);
    }
    
    /**
     * @dev Atualizar nível de KYC
     */
    function updateKYCLevel(address _validator, uint256 _newLevel) 
        external 
        onlyOwner 
    {
        ValidatorRecord storage record = validators[_validator];
        if (record.validatorAddress == address(0)) revert ValidatorNotFound();
        if (_newLevel > 2) revert InvalidKYCLevel();
        
        record.kycLevel = _newLevel;
        emit KYCLevelUpdated(_validator, _newLevel);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Obter registro completo de validador
     */
    function getValidatorRecord(address _validator) 
        external 
        view 
        returns (ValidatorRecord memory) 
    {
        return validators[_validator];
    }
    
    /**
     * @dev Obter acurácia de validador
     */
    function getValidatorAccuracy(address _validator) 
        external 
        view 
        returns (uint256) 
    {
        return validators[_validator].certificationAccuracy;
    }
    
    /**
     * @dev Obter histórico de certificações
     */
    function getCertificationHistory(address _validator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return validatorCertifications[_validator];
    }
    
    /**
     * @dev Obter histórico de slashing (últimos N eventos)
     */
    function getSlashHistory(uint256 _limit) 
        external 
        view 
        returns (SlashEvent[] memory) 
    {
        uint256 start = slashHistory.length > _limit ? slashHistory.length - _limit : 0;
        uint256 length = slashHistory.length - start;
        
        SlashEvent[] memory recent = new SlashEvent[](length);
        for (uint256 i = 0; i < length; i++) {
            recent[i] = slashHistory[start + i];
        }
        
        return recent;
    }
    
    /**
     * @dev Obter lista de validadores aprovados
     */
    function getApprovedValidators() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isApproved) count++;
        }
        
        address[] memory approved = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isApproved) {
                approved[idx] = validatorList[i];
                idx++;
            }
        }
        
        return approved;
    }
    
    /**
     * @dev Obter lista de validadores ativos
     */
    function getActiveValidators() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) count++;
        }
        
        address[] memory active = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                active[idx] = validatorList[i];
                idx++;
            }
        }
        
        return active;
    }
    
    /**
     * @dev Obter estatísticas gerais
     */
    function getStats() external view returns (
        uint256 totalReg,
        uint256 approved,
        uint256 active,
        uint256 totalSlashAmount,
        uint256 slashEventCount
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) activeCount++;
        }
        
        return (
            totalValidators,
            totalApprovedValidators,
            activeCount,
            totalSlashed,
            slashHistory.length
        );
    }
    
    /**
     * @dev Obter lista de todos os validadores
     */
    function getValidators() external view returns (address[] memory) {
        return validatorList;
    }
}
