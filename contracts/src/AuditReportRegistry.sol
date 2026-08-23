// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title AuditReportRegistry
 * @dev Registry for audit reports with IPFS integration and multi-validator signatures
 *
 * Stores audit reports on-chain with:
 * - IPFS content hash (CID)
 * - Data integrity hash
 * - AI confidence score
 * - Validator signatures (BFT consensus)
 * - Timestamp and metadata
 */

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AuditReportRegistry is AccessControl, ReentrancyGuard, Ownable {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Report structure
    struct AuditReport {
        uint256 reportId;
        address submitter;
        string ipfsHash; // IPFS CID of full report
        bytes32 dataHash; // Keccak256 of raw data
        uint256 confidenceScore; // 0-1000 (0-100%)
        uint256 submittedAt;
        uint256 verifiedAt;
        bool isVerified;
        uint8 signatureCount;
        uint256 anomalyCount;
    }

    // Report state
    mapping(uint256 => AuditReport) public reports;
    mapping(uint256 => mapping(address => bool)) public signatures; // reportId => validator => signed
    mapping(uint256 => string[]) public anomalies; // reportId => anomaly list
    mapping(address => uint256) public submitterReportCount;
    
    // Configuration
    uint8 public requiredSignatures = 3;
    uint256 public reportCounter = 0;
    
    // Events
    event ReportSubmitted(
        uint256 indexed reportId,
        address indexed submitter,
        string ipfsHash,
        bytes32 dataHash,
        uint256 confidenceScore
    );

    event ReportVerified(
        uint256 indexed reportId,
        uint256 signatureCount,
        uint256 timestamp
    );

    event SignatureAdded(
        uint256 indexed reportId,
        address indexed validator,
        uint256 currentSignatures
    );

    event AnomalyRecorded(
        uint256 indexed reportId,
        string anomalyType,
        uint256 severity
    );

    event RequiredSignaturesUpdated(uint8 newRequired);

    // Modifiers
    modifier onlyValidator() {
        require(hasRole(VALIDATOR_ROLE, msg.sender), "Not a validator");
        _;
    }

    modifier onlyAuditor() {
        require(hasRole(AUDITOR_ROLE, msg.sender), "Not an auditor");
        _;
    }

    modifier reportExists(uint256 _reportId) {
        require(_reportId <= reportCounter && _reportId > 0, "Report does not exist");
        _;
    }

    /**
     * @dev Constructor sets up roles and initial configuration
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @dev Submit a new audit report
     * @param ipfsHash IPFS content hash
     * @param dataHash Keccak256 hash of the data
     * @param confidenceScore AI confidence (0-1000 = 0-100%)
     * @return reportId The ID of the newly submitted report
     */
    function submitReport(
        string calldata ipfsHash,
        bytes32 dataHash,
        uint256 confidenceScore
    ) external onlyAuditor returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(dataHash != bytes32(0), "Data hash cannot be zero");
        require(confidenceScore <= 1000, "Confidence score must be 0-1000");

        reportCounter++;
        uint256 reportId = reportCounter;

        reports[reportId] = AuditReport({
            reportId: reportId,
            submitter: msg.sender,
            ipfsHash: ipfsHash,
            dataHash: dataHash,
            confidenceScore: confidenceScore,
            submittedAt: block.timestamp,
            verifiedAt: 0,
            isVerified: false,
            signatureCount: 0,
            anomalyCount: 0
        });

        submitterReportCount[msg.sender]++;

        emit ReportSubmitted(reportId, msg.sender, ipfsHash, dataHash, confidenceScore);

        return reportId;
    }

    /**
     * @dev Add validator signature (BFT consensus)
     * @param reportId Report ID to sign
     */
    function signReport(uint256 reportId) external onlyValidator reportExists(reportId) {
        require(!signatures[reportId][msg.sender], "Already signed");
        require(!reports[reportId].isVerified, "Report already verified");

        signatures[reportId][msg.sender] = true;
        reports[reportId].signatureCount++;

        emit SignatureAdded(reportId, msg.sender, reports[reportId].signatureCount);

        // Auto-verify if threshold reached
        if (reports[reportId].signatureCount >= requiredSignatures) {
            _verifyReport(reportId);
        }
    }

    /**
     * @dev Internal function to verify report
     */
    function _verifyReport(uint256 reportId) internal {
        AuditReport storage report = reports[reportId];
        require(!report.isVerified, "Already verified");
        require(report.signatureCount >= requiredSignatures, "Not enough signatures");

        report.isVerified = true;
        report.verifiedAt = block.timestamp;

        emit ReportVerified(reportId, report.signatureCount, block.timestamp);
    }

    /**
     * @dev Record an anomaly found in the report
     * @param reportId Report ID
     * @param anomalyType Type of anomaly (e.g., "accounting_mismatch")
     * @param severity Severity level (1-10)
     */
    function recordAnomaly(
        uint256 reportId,
        string calldata anomalyType,
        uint256 severity
    ) external onlyValidator reportExists(reportId) {
        require(!reports[reportId].isVerified, "Cannot modify verified reports");
        require(severity >= 1 && severity <= 10, "Severity must be 1-10");

        string memory anomalyRecord = string(abi.encodePacked(
            anomalyType,
            "|",
            _uintToString(severity),
            "|",
            _addressToString(msg.sender)
        ));

        anomalies[reportId].push(anomalyRecord);
        reports[reportId].anomalyCount++;

        emit AnomalyRecorded(reportId, anomalyType, severity);
    }

    /**
     * @dev Get report details
     */
    function getReport(uint256 reportId) 
        external 
        view 
        reportExists(reportId) 
        returns (AuditReport memory) 
    {
        return reports[reportId];
    }

    /**
     * @dev Get anomalies for a report
     */
    function getAnomalies(uint256 reportId) 
        external 
        view 
        reportExists(reportId) 
        returns (string[] memory) 
    {
        return anomalies[reportId];
    }

    /**
     * @dev Check if validator signed a report
     */
    function hasSignature(uint256 reportId, address validator) 
        external 
        view 
        reportExists(reportId)
        returns (bool) 
    {
        return signatures[reportId][validator];
    }

    /**
     * @dev Get total reports count
     */
    function getTotalReports() external view returns (uint256) {
        return reportCounter;
    }

    /**
     * @dev Get reports submitted by an address
     */
    function getSubmitterReportCount(address submitter) external view returns (uint256) {
        return submitterReportCount[submitter];
    }

    /**
     * @dev Update required signatures threshold
     * @param _newRequired New number of required signatures for BFT consensus
     */
    function setRequiredSignatures(uint8 _newRequired) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_newRequired > 0, "Must require at least 1 signature");
        requiredSignatures = _newRequired;
        emit RequiredSignaturesUpdated(_newRequired);
    }

    /**
     * @dev Grant validator role to an address
     */
    function addValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VALIDATOR_ROLE, validator);
    }

    /**
     * @dev Remove validator role from an address
     */
    function removeValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VALIDATOR_ROLE, validator);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITY FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }

    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
