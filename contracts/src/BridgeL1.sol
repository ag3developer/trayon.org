// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin/security/ReentrancyGuard.sol";

/**
 * @title BridgeL1
 * @notice Bridge contract on Layer 1 (Polygon) for TRAY token
 * @dev Handles deposits (LOCK) and withdrawal completions (RELEASE)
 *
 * Flow:
 * - Users call deposit() to lock TRAY on L1
 * - Event is emitted and caught by Relayer
 * - Relayer collects signatures and calls completeWithdrawal() on BridgeL2
 * - For withdrawals from L2:
 * - Relayer collects signatures from L2 withdrawal event
 * - Relayer calls completeWithdrawal() to release TRAY to user
 */
contract BridgeL1 is Ownable, ReentrancyGuard {
    // ════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ════════════════════════════════════════════════════════════════════════

    IERC20 public trayToken;
    address public relayerManager;
    uint256 public dailyDepositLimit = 100_000_000 * 10**18; // 100M TRAY
    uint256 public maxDepositPerTx = 10_000_000 * 10**18; // 10M TRAY per tx

    // Tracking deposits and withdrawals
    mapping(address => uint256) public depositedAmount; // Total deposited (not yet withdrawn)
    mapping(bytes32 => bool) public processedWithdrawals; // Prevent double withdrawal

    // Daily limit tracking
    uint256 public currentDayStart;
    uint256 public depositedToday;

    // ════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ════════════════════════════════════════════════════════════════════════

    event DepositInitiated(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp
    );

    event WithdrawalCompleted(
        address indexed user,
        uint256 amount,
        bytes32 withdrawalHash,
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
    error WithdrawalAlreadyProcessed();
    error InsufficientBalance();
    error ZeroAddress();

    // ════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ════════════════════════════════════════════════════════════════════════

    constructor(address _trayToken, address _relayerManager) {
        if (_trayToken == address(0) || _relayerManager == address(0)) {
            revert ZeroAddress();
        }
        trayToken = IERC20(_trayToken);
        relayerManager = _relayerManager;
        currentDayStart = block.timestamp;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEPOSIT FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice User deposits TRAY on L1 to bridge to L2
     * @dev Amount is LOCKED in this contract until released by completeWithdrawal
     * @param amount Amount of TRAY to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (amount > maxDepositPerTx) revert ExceedsPerTxLimit();

        // Check and update daily limit
        _checkAndUpdateDailyLimit(amount);

        // Transfer tokens from user to bridge (LOCK)
        bool success = trayToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        // Update tracking
        depositedAmount[msg.sender] += amount;

        // Emit event for Relayer to catch
        uint256 nonce = uint256(
            keccak256(abi.encodePacked(msg.sender, block.timestamp, amount))
        );
        emit DepositInitiated(msg.sender, amount, nonce, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════
    // WITHDRAWAL FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Complete withdrawal from L2 (only called by Relayer)
     * @dev Relayer verifies signatures off-chain before calling
     * @param user User withdrawing
     * @param amount Amount to release
     * @param withdrawalHash Unique hash for this withdrawal
     */
    function completeWithdrawal(
        address user,
        uint256 amount,
        bytes32 withdrawalHash
    ) external nonReentrant onlyRelayer {
        if (user == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        // Prevent double withdrawal
        if (processedWithdrawals[withdrawalHash]) {
            revert WithdrawalAlreadyProcessed();
        }

        // Check sufficient balance
        if (trayToken.balanceOf(address(this)) < amount) {
            revert InsufficientBalance();
        }

        // Mark as processed
        processedWithdrawals[withdrawalHash] = true;

        // Update tracking
        depositedAmount[user] -= amount;

        // Transfer tokens from bridge to user (RELEASE)
        bool success = trayToken.transfer(user, amount);
        require(success, "Transfer failed");

        // Emit event
        emit WithdrawalCompleted(user, amount, withdrawalHash, block.timestamp);
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
     * @notice Update deposit limits (only owner)
     * @param _dailyLimit New daily limit
     * @param _maxPerTx New per-transaction limit
     */
    function setLimits(uint256 _dailyLimit, uint256 _maxPerTx) external onlyOwner {
        dailyDepositLimit = _dailyLimit;
        maxDepositPerTx = _maxPerTx;
        emit LimitsUpdated(_dailyLimit, _maxPerTx);
    }

    // ════════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * @notice Check and update daily deposit limit
     * @param amount Amount being deposited
     */
    function _checkAndUpdateDailyLimit(uint256 amount) internal {
        // Reset daily counter if new day
        if (block.timestamp >= currentDayStart + 1 days) {
            currentDayStart = block.timestamp;
            depositedToday = 0;
        }

        // Check daily limit
        if (depositedToday + amount > dailyDepositLimit) {
            revert ExceedsDailyLimit();
        }

        // Update daily counter
        depositedToday += amount;
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
     * @notice Get remaining daily deposit capacity
     * @return Remaining amount that can be deposited today
     */
    function getRemainingDailyCapacity() external view returns (uint256) {
        if (block.timestamp >= currentDayStart + 1 days) {
            return dailyDepositLimit;
        }
        return dailyDepositLimit - depositedToday;
    }

    /**
     * @notice Get bridge balance (total locked TRAY)
     * @return Bridge contract TRAY balance
     */
    function getBridgeBalance() external view returns (uint256) {
        return trayToken.balanceOf(address(this));
    }

    /**
     * @notice Check if withdrawal was already processed
     * @param withdrawalHash Hash to check
     * @return Whether withdrawal was processed
     */
    function isWithdrawalProcessed(bytes32 withdrawalHash)
        external
        view
        returns (bool)
    {
        return processedWithdrawals[withdrawalHash];
    }
}
