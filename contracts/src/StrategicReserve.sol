// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StrategicReserve
 * @notice Gerencia 50M TRAY com timelock de segurança (7 dias)
 * @dev Fundo de emergência com aprovação de múltiplos signatários
 */
contract StrategicReserve is Ownable, ReentrancyGuard {
    IERC20 public trayToken;

    // Total alocado
    uint256 public constant TOTAL_ALLOCATION = 50_000_000 * 10**18; // 50M

    // Configuração de timelock
    uint256 public constant TIMELOCK_DURATION = 7 days;
    uint256 public constant MAX_EMERGENCY_RELEASE = 10_000_000 * 10**18; // 10M por vez

    // Requisições de liberação
    struct ReleaseRequest {
        address requester;
        address recipient;
        uint256 amount;
        string reason;
        uint256 requestedAt;
        uint256 executeAt;
        bool executed;
        bool cancelled;
        uint256 approvalsNeeded;
        uint256 approvalsReceived;
    }

    mapping(uint256 => ReleaseRequest) public releaseRequests;
    mapping(uint256 => mapping(address => bool)) public requestApprovals;
    uint256 public requestCounter;
    uint256 public totalReleased;

    // Multi-sig
    address[] public signatories;
    mapping(address => bool) public isSignatory;
    uint256 public requiredApprovals;

    event ReleaseRequested(uint256 indexed requestId, address indexed recipient, uint256 amount);
    event ReleaseApproved(uint256 indexed requestId, address indexed signer);
    event ReleaseExecuted(uint256 indexed requestId, address indexed recipient, uint256 amount);
    event ReleaseCancelled(uint256 indexed requestId);
    event SignatoryAdded(address indexed signatory);

    constructor(address _trayToken, address[] memory _initialSignatories) {
        trayToken = IERC20(_trayToken);
        
        // Adicionar owner como signatário principal
        signatories.push(owner());
        isSignatory[owner()] = true;
        
        // Adicionar signatories iniciais
        for (uint256 i = 0; i < _initialSignatories.length; i++) {
            address sig = _initialSignatories[i];
            require(sig != address(0), "Endereco invalido");
            require(!isSignatory[sig], "Ja eh signatario");
            require(sig != owner(), "Owner ja eh signatario");
            
            signatories.push(sig);
            isSignatory[sig] = true;
        }
        
        // Requer aprovação de owner + 50% dos outros (mínimo 2)
        requiredApprovals = signatories.length / 2 + 1;
    }

    /**
     * @notice Adiciona um signatário autorizado
     * @param _signatory Endereço do signatário
     */
    function addSignatory(address _signatory) external onlyOwner {
        require(_signatory != address(0), "Endereco invalido");
        require(!isSignatory[_signatory], "Ja eh signatario");

        signatories.push(_signatory);
        isSignatory[_signatory] = true;
    }

    /**
     * @notice Define número de aprovações necessárias
     * @param _required Número de aprovações necessárias
     */
    function setRequiredApprovals(uint256 _required) external onlyOwner {
        require(_required > 0, "Deve ser maior que 0");
        require(_required <= signatories.length + 1, "Excede signatarios");
        requiredApprovals = _required;
    }

    /**
     * @notice Requisita liberação de emergência
     * @param _recipient Endereço recebedor
     * @param _amount Quantidade a liberar
     * @param _reason Razão da liberação
     */
    function requestRelease(
        address _recipient,
        uint256 _amount,
        string calldata _reason
    ) external onlyOwner returns (uint256) {
        require(_recipient != address(0), "Endereco invalido");
        require(_amount > 0, "Quantidade deve ser maior que 0");
        require(_amount <= MAX_EMERGENCY_RELEASE, "Excede limite de liberacao");
        require(totalReleased + _amount <= TOTAL_ALLOCATION, "Excede total");

        uint256 requestId = requestCounter;
        requestCounter++;

        releaseRequests[requestId] = ReleaseRequest({
            requester: msg.sender,
            recipient: _recipient,
            amount: _amount,
            reason: _reason,
            requestedAt: block.timestamp,
            executeAt: block.timestamp + TIMELOCK_DURATION,
            executed: false,
            cancelled: false,
            approvalsNeeded: requiredApprovals,
            approvalsReceived: 1 // Owner já aprova
        });

        requestApprovals[requestId][msg.sender] = true;

        emit ReleaseRequested(requestId, _recipient, _amount);
        return requestId;
    }

    /**
     * @notice Aprova uma requisição de liberação
     * @param _requestId ID da requisição
     */
    function approveRelease(uint256 _requestId) external {
        require(isSignatory[msg.sender] || msg.sender == owner(), "Nao autorizado");
        require(!requestApprovals[_requestId][msg.sender], "Ja aprovou");

        ReleaseRequest storage request = releaseRequests[_requestId];
        require(!request.executed, "Ja executado");
        require(!request.cancelled, "Cancelado");

        requestApprovals[_requestId][msg.sender] = true;
        request.approvalsReceived++;

        emit ReleaseApproved(_requestId, msg.sender);
    }

    /**
     * @notice Executa uma liberação aprovada (após timelock)
     * @param _requestId ID da requisição
     */
    function executeRelease(uint256 _requestId) external nonReentrant {
        ReleaseRequest storage request = releaseRequests[_requestId];

        require(!request.executed, "Ja executado");
        require(!request.cancelled, "Cancelado");
        require(request.approvalsReceived >= request.approvalsNeeded, "Faltam aprovacoes");
        require(block.timestamp >= request.executeAt, "Timelock ainda nao expirou");

        uint256 contractBalance = trayToken.balanceOf(address(this));
        require(contractBalance >= request.amount, "Saldo insuficiente no contrato");
        
        request.executed = true;
        totalReleased += request.amount;

        require(trayToken.transfer(request.recipient, request.amount), "Transfer falhou");
        emit ReleaseExecuted(_requestId, request.recipient, request.amount);
    }

    /**
     * @notice Cancela uma requisição de liberação
     * @param _requestId ID da requisição
     */
    function cancelRelease(uint256 _requestId) external onlyOwner {
        ReleaseRequest storage request = releaseRequests[_requestId];
        require(!request.executed, "Ja executado");

        request.cancelled = true;
        emit ReleaseCancelled(_requestId);
    }

    /**
     * @notice Retorna informações de uma requisição
     */
    function getRequestInfo(uint256 _requestId) external view returns (
        address recipient,
        uint256 amount,
        string memory reason,
        uint256 executeAt,
        uint256 approvalsNeeded,
        uint256 approvalsReceived,
        bool executed,
        bool cancelled
    ) {
        ReleaseRequest memory request = releaseRequests[_requestId];
        return (
            request.recipient,
            request.amount,
            request.reason,
            request.executeAt,
            request.approvalsNeeded,
            request.approvalsReceived,
            request.executed,
            request.cancelled
        );
    }

    /**
     * @notice Retorna total de signatários
     */
    function getTotalSignatories() external view returns (uint256) {
        return signatories.length;
    }

    /**
     * @notice Retorna saldo disponível
     */
    function getAvailableBalance() external view returns (uint256) {
        return TOTAL_ALLOCATION - totalReleased;
    }

    /**
     * @notice Retorna saldo do contrato
     */
    function getContractBalance() external view returns (uint256) {
        return trayToken.balanceOf(address(this));
    }
}
