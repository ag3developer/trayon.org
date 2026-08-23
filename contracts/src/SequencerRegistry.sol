// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Sequencer Registry
 * @dev Registro e gerenciamento de sequencers da Trayon L2
 * 
 * Um sequencer é responsável por:
 * - Criar blocos com transações
 * - Ordenar transações de forma justa
 * - Gerar provas ZK para finality em L1
 * - Manter uptime mínimo de 99%
 */
contract SequencerRegistry is Ownable {
    IERC20 public trayToken;
    // ============ Constants ============
    
    uint256 public constant REQUIRED_BOND = 100_000 * 10**18;  // 100k TRAY
    uint256 public constant MIN_UPTIME_PERCENTAGE = 99;         // 99%
    uint256 public constant HEARTBEAT_INTERVAL = 12 seconds;    // Bloco a cada 12s
    
    // ============ State Variables ============
    
    struct SequencerInfo {
        address sequencerAddress;
        address feeRecipient;
        uint256 bond;
        bool isActive;
        uint256 registeredAt;
        uint256 blocksProposed;
        uint256 blocksMissed;
        uint256 lastHeartbeat;
        string rpcEndpoint;
        string p2pEndpoint;
    }
    
    mapping(address => SequencerInfo) public sequencers;
    address[] public sequencerList;
    
    uint256 public totalBond;
    uint256 public currentEpoch;
    uint256 public epochStartTime;
    
    // ============ Events ============
    
    event SequencerRegistered(
        address indexed sequencer,
        address indexed feeRecipient,
        uint256 bond,
        string rpcEndpoint
    );
    
    event SequencerDeactivated(address indexed sequencer, string reason);
    event SequencerReactivated(address indexed sequencer);
    event BondIncreased(address indexed sequencer, uint256 amount);
    event BondWithdrawn(address indexed sequencer, uint256 amount);
    event HeartbeatReceived(address indexed sequencer, uint256 blocksProposed);
    event UptimeSlashed(address indexed sequencer, uint256 percentage, string reason);
    event EpochStarted(uint256 epoch, uint256 timestamp);
    
    // ============ Errors ============
    
    error InsufficientBond();
    error SequencerAlreadyRegistered();
    error SequencerNotFound();
    error SequencerInactive();
    error InvalidUptimePercentage();
    error InsufficientBondToWithdraw();
    error BondTransferFailed();
    
    // ============ Constructor ============
    
    constructor(address _trayToken) {
        require(_trayToken != address(0), "Invalid token");
        trayToken = IERC20(_trayToken);
        currentEpoch = 1;
        epochStartTime = block.timestamp;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Registrar novo sequencer
     * @param _feeRecipient Endereço que recebe fees
     * @param _rpcEndpoint URL do RPC endpoint
     * @param _p2pEndpoint URL do P2P endpoint
     */
    function registerSequencer(
        address _feeRecipient,
        string calldata _rpcEndpoint,
        string calldata _p2pEndpoint
    ) external {
        if (sequencers[msg.sender].sequencerAddress != address(0)) {
            revert SequencerAlreadyRegistered();
        }
        
        uint256 bondAmount = REQUIRED_BOND;
        if (!trayToken.transferFrom(msg.sender, address(this), bondAmount)) {
            revert InsufficientBond();
        }
        
        sequencers[msg.sender] = SequencerInfo({
            sequencerAddress: msg.sender,
            feeRecipient: _feeRecipient,
            bond: bondAmount,
            isActive: true,
            registeredAt: block.timestamp,
            blocksProposed: 0,
            blocksMissed: 0,
            lastHeartbeat: block.timestamp,
            rpcEndpoint: _rpcEndpoint,
            p2pEndpoint: _p2pEndpoint
        });
        
        sequencerList.push(msg.sender);
        totalBond += bondAmount;
        
        emit SequencerRegistered(msg.sender, _feeRecipient, bondAmount, _rpcEndpoint);
    }
    
    /**
     * @dev Enviar heartbeat para indicar atividade
     * @param _blocksProposed Número de blocos propostos desde último heartbeat
     */
    function sendHeartbeat(uint256 _blocksProposed) external {
        SequencerInfo storage seq = sequencers[msg.sender];
        if (seq.sequencerAddress == address(0)) revert SequencerNotFound();
        if (!seq.isActive) revert SequencerInactive();
        
        seq.blocksProposed += _blocksProposed;
        seq.lastHeartbeat = block.timestamp;
        
        emit HeartbeatReceived(msg.sender, _blocksProposed);
    }
    
    /**
     * @dev Verificar uptime e penalizar sequencers inativos
     */
    function checkUptimeAndSlash() external onlyOwner {
        uint256 currentTime = block.timestamp;
        
        for (uint256 i = 0; i < sequencerList.length; i++) {
            address seqAddr = sequencerList[i];
            SequencerInfo storage seq = sequencers[seqAddr];
            
            if (!seq.isActive) continue;
            
            // Verificar se não enviou heartbeat recentemente (mais de 5 blocos = 60s)
            if (currentTime - seq.lastHeartbeat > 60 seconds) {
                // Penalizar: reduzir bond em 5%
                uint256 penalty = (seq.bond * 5) / 100;
                seq.bond -= penalty;
                seq.blocksMissed += 5;
                
                // Se bond cair muito, desativar
                if (seq.bond < REQUIRED_BOND) {
                    seq.isActive = false;
                    emit SequencerDeactivated(seqAddr, "Insufficient bond after penalty");
                }
                
                emit UptimeSlashed(seqAddr, 5, "Missed heartbeats");
            }
        }
    }
    
    /**
     * @dev Deativar sequencer (admin)
     * @param _sequencer Endereço do sequencer
     * @param _reason Razão da desativação
     */
    function deactivateSequencer(address _sequencer, string calldata _reason) external onlyOwner {
        SequencerInfo storage seq = sequencers[_sequencer];
        if (seq.sequencerAddress == address(0)) revert SequencerNotFound();
        
        seq.isActive = false;
        emit SequencerDeactivated(_sequencer, _reason);
    }
    
    /**
     * @dev Reativar sequencer (admin)
     * @param _sequencer Endereço do sequencer
     */
    function reactivateSequencer(address _sequencer) external onlyOwner {
        SequencerInfo storage seq = sequencers[_sequencer];
        if (seq.sequencerAddress == address(0)) revert SequencerNotFound();
        
        seq.isActive = true;
        seq.lastHeartbeat = block.timestamp;
        emit SequencerReactivated(_sequencer);
    }
    
    /**
     * @dev Adicionar mais bond (aumentar stake)
     */
    function increaseBond(uint256 _amount) external {
        SequencerInfo storage seq = sequencers[msg.sender];
        if (seq.sequencerAddress == address(0)) revert SequencerNotFound();
        
        if (!trayToken.transferFrom(msg.sender, address(this), _amount)) {
            revert InsufficientBond();
        }
        
        seq.bond += _amount;
        totalBond += _amount;
        
        emit BondIncreased(msg.sender, _amount);
    }
    
    /**
     * @dev Sacar bond (parcialmente, mantém mínimo necessário)
     * @param _amount Quantidade a sacar
     */
    function withdrawBond(uint256 _amount) external {
        SequencerInfo storage seq = sequencers[msg.sender];
        if (seq.sequencerAddress == address(0)) revert SequencerNotFound();
        if (seq.bond - _amount < REQUIRED_BOND) revert InsufficientBondToWithdraw();
        
        seq.bond -= _amount;
        totalBond -= _amount;
        
        if (!trayToken.transfer(msg.sender, _amount)) revert BondTransferFailed();
        
        emit BondWithdrawn(msg.sender, _amount);
    }
    
    /**
     * @dev Iniciar nova epoch (reset de contadores)
     */
    function startNewEpoch() external onlyOwner {
        currentEpoch += 1;
        epochStartTime = block.timestamp;
        
        // Reset de contadores de uptime
        for (uint256 i = 0; i < sequencerList.length; i++) {
            sequencers[sequencerList[i]].blocksProposed = 0;
            sequencers[sequencerList[i]].blocksMissed = 0;
        }
        
        emit EpochStarted(currentEpoch, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Obter informações de um sequencer
     */
    function getSequencerInfo(address _sequencer) 
        external 
        view 
        returns (SequencerInfo memory) 
    {
        return sequencers[_sequencer];
    }
    
    /**
     * @dev Calcular uptime de um sequencer
     */
    function getSequencerUptime(address _sequencer) 
        external 
        view 
        returns (uint256 uptimePercentage) 
    {
        SequencerInfo storage seq = sequencers[_sequencer];
        if (seq.sequencerAddress == address(0)) revert SequencerNotFound();
        
        uint256 totalBlocks = seq.blocksProposed + seq.blocksMissed;
        if (totalBlocks == 0) return 100;
        
        uptimePercentage = (seq.blocksProposed * 100) / totalBlocks;
    }
    
    /**
     * @dev Obter lista de todos os sequencers
     */
    function getSequencers() external view returns (address[] memory) {
        return sequencerList;
    }
    
    /**
     * @dev Obter sequencers ativos
     */
    function getActiveSequencers() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < sequencerList.length; i++) {
            if (sequencers[sequencerList[i]].isActive) count++;
        }
        
        address[] memory active = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < sequencerList.length; i++) {
            if (sequencers[sequencerList[i]].isActive) {
                active[idx] = sequencerList[i];
                idx++;
            }
        }
        
        return active;
    }
    
    /**
     * @dev Obter total de sequencers
     */
    function getSequencerCount() external view returns (uint256) {
        return sequencerList.length;
    }
    
    /**
     * @dev Obter estatísticas gerais
     */
    function getStats() external view returns (
        uint256 totalSequencers,
        uint256 activeSequencers,
        uint256 totalBondLocked,
        uint256 currentEpochNumber
    ) {
        uint256 active = 0;
        for (uint256 i = 0; i < sequencerList.length; i++) {
            if (sequencers[sequencerList[i]].isActive) active++;
        }
        
        return (sequencerList.length, active, totalBond, currentEpoch);
    }
}
