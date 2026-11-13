// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PartnershipsTreasury
 * @notice Gerencia 100M TRAY para parcerias e integradores
 * @dev Contrato com gerenciamento dinâmico de parcerias
 */
contract PartnershipsTreasury is Ownable, ReentrancyGuard {
    IERC20 public trayToken;

    // Total alocado
    uint256 public constant TOTAL_ALLOCATION = 100_000_000 * 10**18; // 100M

    // Estrutura de parceria
    struct Partnership {
        address partner;
        uint256 allocation;
        uint256 released;
        string description;
        bool active;
    }

    // Mapeamento de parcerias
    mapping(bytes32 => Partnership) public partnerships;
    bytes32[] public partnershipIds;
    mapping(address => bytes32[]) public partnershipsByAddress;

    uint256 public totalAllocated;

    event PartnershipCreated(bytes32 indexed id, address indexed partner, uint256 allocation);
    event TokensReleasedToPartner(bytes32 indexed id, address indexed partner, uint256 amount);
    event PartnershipClosed(bytes32 indexed id);

    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
    }

    /**
     * @notice Cria uma nova parceria
     * @param _partner Endereço do parceiro
     * @param _allocation Quantidade alocada
     * @param _description Descrição da parceria
     */
    function createPartnership(
        address _partner,
        uint256 _allocation,
        string calldata _description
    ) external onlyOwner returns (bytes32) {
        require(_partner != address(0), "Endereco invalido");
        require(_allocation > 0, "Alocacao deve ser maior que 0");
        require(totalAllocated + _allocation <= TOTAL_ALLOCATION, "Excede total");

        bytes32 id = keccak256(abi.encodePacked(_partner, block.timestamp));

        partnerships[id] = Partnership({
            partner: _partner,
            allocation: _allocation,
            released: 0,
            description: _description,
            active: true
        });

        partnershipIds.push(id);
        partnershipsByAddress[_partner].push(id);
        totalAllocated += _allocation;

        emit PartnershipCreated(id, _partner, _allocation);
        return id;
    }

    /**
     * @notice Libera tokens para um parceiro
     * @param _partnershipId ID da parceria
     * @param _amount Quantidade a liberar
     */
    function releaseToPartner(bytes32 _partnershipId, uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Quantidade deve ser maior que 0");
        Partnership storage partnership = partnerships[_partnershipId];

        require(partnership.active, "Parceria inativa");
        require(partnership.released + _amount <= partnership.allocation, "Excede alocacao");
        
        uint256 contractBalance = trayToken.balanceOf(address(this));
        require(contractBalance >= _amount, "Saldo insuficiente no contrato");

        partnership.released += _amount;
        require(trayToken.transfer(partnership.partner, _amount), "Transfer falhou");

        emit TokensReleasedToPartner(_partnershipId, partnership.partner, _amount);
    }

    /**
     * @notice Encerra uma parceria
     * @param _partnershipId ID da parceria
     */
    function closePartnership(bytes32 _partnershipId) external onlyOwner {
        Partnership storage partnership = partnerships[_partnershipId];
        require(partnership.active, "Parceria ja esta inativa");

        partnership.active = false;
        emit PartnershipClosed(_partnershipId);
    }

    /**
     * @notice Retorna informações de uma parceria
     */
    function getPartnershipInfo(bytes32 _partnershipId) external view returns (
        address partner,
        uint256 allocation,
        uint256 released,
        uint256 remaining,
        string memory description,
        bool active
    ) {
        Partnership memory p = partnerships[_partnershipId];
        return (
            p.partner,
            p.allocation,
            p.released,
            p.allocation - p.released,
            p.description,
            p.active
        );
    }

    /**
     * @notice Retorna parcerias de um endereço
     */
    function getPartnershipsByAddress(address _partner) external view returns (bytes32[] memory) {
        return partnershipsByAddress[_partner];
    }

    /**
     * @notice Retorna total de parcerias
     */
    function getTotalPartnerships() external view returns (uint256) {
        return partnershipIds.length;
    }

    /**
     * @notice Retorna saldo disponível
     */
    function getAvailableBalance() external view returns (uint256) {
        return TOTAL_ALLOCATION - totalAllocated;
    }

    /**
     * @notice Retorna saldo do contrato
     */
    function getContractBalance() external view returns (uint256) {
        return trayToken.balanceOf(address(this));
    }
}
