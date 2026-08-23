// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Burnable} from "openzeppelin/token/ERC20/extensions/ERC20Burnable.sol";
import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin/security/ReentrancyGuard.sol";

/**
 * @title BridgeL2
 * @notice Bridge contract on Layer 2 (Trayon) for TRAY token
 * @dev Handles deposit completions (MINT) and withdrawal initiations (BURN)
 *
 * Flow:
 * - Relayer calls completeDeposit() after L1 deposit
 * - User receives newly minted TRAY on L2
 * - User calls initiateWithdrawal() to burn TRAY on L2
 * - Event is caught by Relayer
 * - Relayer calls completeWithdrawal() on BridgeL1 to release L1 tokens
 */
contract BridgeL2 is Ownable, ReentrancyGuard {
    // ════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ════════════════════════════════════════════════════════════════════════

    ERC20Burnable public trayToken;
    address public relayerManager;
    uint256 public dailyWithdrawalLimit = 100_000_000 * 10**18; // 100M TRAY
    uint256 public maxWithdrawalPerTx = 10_000_000 * 10**18; // 10M TRAY per tx

    // Tracking withdrawals
    mapping(address => uint256) public withdrawalRequests; // Pending withdrawals
    mapping(bytes32 => bool) public processedDeposits; // Prevent double deposit

    // Daily limit tracking
    uint256 public currentDayStart;
    uint256 public withdrawnToday;

    // ════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ════════════════════════════════════════════════════════════════════════

    event DepositCompleted(
        address indexed user,
        uint256 amount,
        bytes32 depositHash,
        uint256 timestamp
    );

    event WithdrawalInitiated(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp
    );

    event RelayerManagerUpdated(address indexed newManager);
    event LimitsUpdated(uint256 dailyLimit, uint256 maxPerTx);

    // ════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ════════════════════════════════════════════════════════════════════════

    error InvalidAmount();
    error ExceedsDailyLimit();
    error ExceedsPerTxLimit();
    error InvalidRelayer();
    error DepositAlreadyProcessed();
    error InsufficientBalance();
    error ZeroAddress();
    error BurnFailed();

    // ════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ════════════════════════════════════════════════════════════════════════

    constructor(address _trayToken, address _relayerManager) {
        if (_trayToken == address(0) || _relayerManager == address(0)) {
            revert ZeroAddress();
        }
        trayToken = ERC20Burnable(_trayToken);
        relayerManager = _relayerManager;
        currentDayStart = block.timestamp;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEPOSIT FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Complete deposit from L1 (only called by Relayer)
     * @dev Creates new TRAY tokens on L2 for user
     * @param user User receiving the deposit
     * @param amount Amount to mint
     * @param depositHash Unique hash for this deposit
     */
    function completeDeposit(
        address user,
        uint256 amount,
        bytes32 depositHash
    ) external nonReentrant onlyRelayer {
        if (user == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        // Prevent double deposit
        if (processedDeposits[depositHash]) {
            revert DepositAlreadyProcessed();
        }

        // Mark as processed
        processedDeposits[depositHash] = true;

        // Mint TRAY tokens on L2
        // This requires TRAY.sol to have mintTo() function and owner permissions
        // In production, use AccessControl to restrict minting to only this bridge
        (bool success, ) = address(trayToken).call(
            abi.encodeWithSignature("mintTo(address,uint256)", user, amount)
        );
        require(success, "Mint failed");

        // Emit event
        emit DepositCompleted(user, amount, depositHash, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════
    // WITHDRAWAL FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice User initiates withdrawal from L2 (burns tokens)
     * @dev Amount is burned immediately on L2
     * @param amount Amount to withdraw
     */
    function initiateWithdrawal(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (amount > maxWithdrawalPerTx) revert ExceedsPerTxLimit();

        // Check and update daily limit
        _checkAndUpdateDailyLimit(amount);

        // Check user has sufficient balance
        if (trayToken.balanceOf(msg.sender) < amount) {
            revert InsufficientBalance();
        }

        // Burn tokens from user (BURN)
        trayToken.burnFrom(msg.sender, amount);

        // Update tracking
        withdrawalRequests[msg.sender] += amount;

        // Emit event for Relayer to catch
        uint256 nonce = uint256(
            keccak256(abi.encodePacked(msg.sender, block.timestamp, amount))
        );
        emit WithdrawalInitiated(msg.sender, amount, nonce, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Update relayer manager (only owner)
     * @param _newManager New relayer manager address
     */
    function setRelayerManager(address _newManager) external onlyOwner {
        if (_newManager == address(0)) revert ZeroAddress();
        relayerManager = _newManager;
        emit RelayerManagerUpdated(_newManager);
    }

    /**
     * @notice Update withdrawal limits (only owner)
     * @param _dailyLimit New daily limit
     * @param _maxPerTx New per-transaction limit
     */
    function setLimits(uint256 _dailyLimit, uint256 _maxPerTx) external onlyOwner {
        dailyWithdrawalLimit = _dailyLimit;
        maxWithdrawalPerTx = _maxPerTx;
        emit LimitsUpdated(_dailyLimit, _maxPerTx);
    }

    // ════════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Check and update daily withdrawal limit
     * @param amount Amount being withdrawn
     */
    function _checkAndUpdateDailyLimit(uint256 amount) internal {
        // Reset daily counter if new day
        if (block.timestamp >= currentDayStart + 1 days) {
            currentDayStart = block.timestamp;
            withdrawnToday = 0;
        }

        // Check daily limit
        if (withdrawnToday + amount > dailyWithdrawalLimit) {
            revert ExceedsDailyLimit();
        }

        // Update daily counter
        withdrawnToday += amount;
    }

    // ════════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Restrict to relayer manager
     */
    modifier onlyRelayer() {
        if (msg.sender != relayerManager) revert InvalidRelayer();
        _;
    }

    // ════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Get remaining daily withdrawal capacity
     * @return Remaining amount that can be withdrawn today
     */
    function getRemainingDailyCapacity() external view returns (uint256) {
        if (block.timestamp >= currentDayStart + 1 days) {
            return dailyWithdrawalLimit;
        }
        return dailyWithdrawalLimit - withdrawnToday;
    }

    /**
     * @notice Get user's pending withdrawals
     * @param user User to check
     * @return Pending withdrawal amount
     */
    function getPendingWithdrawals(address user)
        external
        view
        returns (uint256)
    {
        return withdrawalRequests[user];
    }

    /**
     * @notice Check if deposit was already processed
     * @param depositHash Hash to check
     * @return Whether deposit was processed
     */
    function isDepositProcessed(bytes32 depositHash)
        external
        view
        returns (bool)
    {
        return processedDeposits[depositHash];
    }
}
