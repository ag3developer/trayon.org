// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TRAY Token
 * @dev Native ERC-20 token para Trayon L2 com suporte a gas token customizado
 * 
 * Tokenomics:
 * - Total Supply: 1 bilhão (1e9 * 1e18)
 * - Initial Supply: 250 milhões (25% liberados no launch)
 * - Fee Distribution: 70% validadores, 20% burn, 10% treasury
 */
contract TRAY is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    // ============ Constants ============
    
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant INITIAL_SUPPLY = 250_000_000 * 10**18;
    
    // ============ State Variables ============
    
    address public treasury;
    bool public gasTokenEnabled;
    address public sequencer;
    
    uint256 public feePercentageValidators = 70;
    uint256 public feePercentageBurn = 20;
    uint256 public feePercentageTreasury = 10;
    
    uint256 public totalBurned;
    
    // ============ Events ============
    
    event GasTokenEnabled(address indexed sequencer, uint256 timestamp);
    event FeeProcessed(uint256 indexed blockNumber, uint256 validatorShare, uint256 burnedAmount, uint256 treasuryShare);
    event TreasuryUpdated(address indexed newTreasury, uint256 timestamp);
    event FeePercentagesUpdated(uint256 validators, uint256 burn, uint256 treasury);
    
    // ============ Errors ============
    
    error InvalidTreasury();
    error GasTokenAlreadyEnabled();
    error InvalidFeeAmount();
    error InvalidPercentages();
    error ExceedsMaxSupply();
    
    // ============ Constructor ============
    
    /**
     * @dev Construtor
     * @param _treasury Endereço da tesoraria para receber tokens iniciais
     */
    constructor(address _treasury) ERC20("TRAY", "TRAY") ERC20Permit("TRAY") {
        if (_treasury == address(0)) revert InvalidTreasury();
        
        treasury = _treasury;
        
        // Mint supply inicial para o deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Ativar token como gas token da L2 (apenas uma vez)
     * @param _sequencer Endereço do sequencer L2
     */
    function enableGasToken(address _sequencer) external onlyOwner {
        if (gasTokenEnabled) revert GasTokenAlreadyEnabled();
        if (_sequencer == address(0)) revert InvalidTreasury();
        
        gasTokenEnabled = true;
        sequencer = _sequencer;
        
        emit GasTokenEnabled(_sequencer, block.timestamp);
    }
    
    /**
     * @dev Processar fees de transações (chamado pelo sequencer)
     * @param totalFee Taxa total a ser processada
     * @param validatorReward Endereço para receber reward de validadores
     */
    function processFee(uint256 totalFee, address validatorReward) external onlyOwner {
        if (totalFee == 0) revert InvalidFeeAmount();
        if (validatorReward == address(0)) revert InvalidTreasury();
        
        uint256 validatorShare = (totalFee * feePercentageValidators) / 100;
        uint256 burnAmount = (totalFee * feePercentageBurn) / 100;
        uint256 treasuryShare = (totalFee * feePercentageTreasury) / 100;
        
        // Transferir para validadores
        if (validatorShare > 0) {
            _transfer(address(this), validatorReward, validatorShare);
        }
        
        // Queimar tokens
        if (burnAmount > 0) {
            _burn(address(this), burnAmount);
            totalBurned += burnAmount;
        }
        
        // Transferir para treasury
        if (treasuryShare > 0) {
            _transfer(address(this), treasury, treasuryShare);
        }
        
        emit FeeProcessed(block.number, validatorShare, burnAmount, treasuryShare);
    }
    
    /**
     * @dev Mintar novos tokens (até max supply)
     * @param amount Quantidade a mintar
     */
    function mint(uint256 amount) external onlyOwner {
        if (totalSupply() + amount > TOTAL_SUPPLY) revert ExceedsMaxSupply();
        _mint(msg.sender, amount);
    }
    
    /**
     * @dev Mintar para endereço específico
     * @param to Destinatário
     * @param amount Quantidade
     */
    function mintTo(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert InvalidTreasury();
        if (totalSupply() + amount > TOTAL_SUPPLY) revert ExceedsMaxSupply();
        _mint(to, amount);
    }
    
    /**
     * @dev Queimar tokens (public, qualquer um pode queimar seus tokens)
     * @param amount Quantidade a queimar
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        totalBurned += amount;
    }
    
    /**
     * @dev Queimar tokens de terceiros (com aprovação)
     * @param account Endereço de quem vai queimar
     * @param amount Quantidade a queimar
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        totalBurned += amount;
    }
    
    /**
     * @dev Atualizar endereço da treasury
     * @param newTreasury Novo endereço
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTreasury();
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury, block.timestamp);
    }
    
    /**
     * @dev Atualizar percentuais de fee distribution
     * @param _validators Percentual para validadores
     * @param _burn Percentual para burn
     * @param _treasury Percentual para treasury
     */
    function updateFeePercentages(
        uint256 _validators,
        uint256 _burn,
        uint256 _treasury
    ) external onlyOwner {
        if (_validators + _burn + _treasury != 100) revert InvalidPercentages();
        
        feePercentageValidators = _validators;
        feePercentageBurn = _burn;
        feePercentageTreasury = _treasury;
        
        emit FeePercentagesUpdated(_validators, _burn, _treasury);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Retornar quantidade disponível para mintar
     */
    function availableToMint() external view returns (uint256) {
        return TOTAL_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Retornar estatísticas gerais do token
     */
    function getStats() external view returns (
        uint256 currentSupply,
        uint256 burned,
        uint256 remainingToMint,
        bool isGasTokenActive
    ) {
        return (
            totalSupply(),
            totalBurned,
            TOTAL_SUPPLY - totalSupply(),
            gasTokenEnabled
        );
    }
    
}
