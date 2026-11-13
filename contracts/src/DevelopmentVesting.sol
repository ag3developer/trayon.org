// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DevelopmentVesting
 * @notice Gerencia 150M TRAY com vesting linear de 4 anos para equipe de desenvolvimento
 * @dev Contrato de vesting com 4 anos de lock (até 25/08/2030)
 */
contract DevelopmentVesting is Ownable, ReentrancyGuard {
    IERC20 public trayToken;

    // Total alocado
    uint256 public constant TOTAL_ALLOCATION = 150_000_000 * 10**18; // 150M

    // Configuração de vesting
    uint256 public constant VESTING_DURATION_DAYS = 1461; // 4 anos exatos
    uint256 public vestingStartTime;

    // Beneficiários e seus montantes
    mapping(address => uint256) public beneficiaryAllocation;
    mapping(address => uint256) public beneficiaryReleased;
    address[] public beneficiaries;
    mapping(address => bool) public isBeneficiary;

    uint256 public totalAllocatedToBeneficiaries;
    bool public vestingStartTimeSet;

    event BeneficiaryAdded(address indexed beneficiary, uint256 allocation);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingStartTimeSet(uint256 startTime);

    constructor(address _trayToken) {
        trayToken = IERC20(_trayToken);
        vestingStartTime = 0; // Será configurado depois
        vestingStartTimeSet = false;
    }

    /**
     * @notice Define o tempo de início do vesting (apenas uma vez)
     * @param _startTime Timestamp de início
     */
    function setVestingStartTime(uint256 _startTime) external onlyOwner {
        require(!vestingStartTimeSet, "Vesting start time ja foi definido");
        require(_startTime > 0, "Data invalida");
        require(_startTime >= block.timestamp, "Data nao pode ser no passado");
        
        vestingStartTime = _startTime;
        vestingStartTimeSet = true;
        emit VestingStartTimeSet(_startTime);
    }

    /**
     * @notice Define beneficiários e suas alocações (4 total)
     * @param _beneficiary Endereço do beneficiário
     * @param _allocation Quantidade alocada para este beneficiário
     */
    function setBeneficiary(address _beneficiary, uint256 _allocation) external onlyOwner {
        require(_beneficiary != address(0), "Endereco invalido");
        require(_allocation > 0, "Alocacao deve ser maior que 0");
        require(totalAllocatedToBeneficiaries + _allocation <= TOTAL_ALLOCATION, "Excede total");

        if (!isBeneficiary[_beneficiary]) {
            beneficiaries.push(_beneficiary);
            isBeneficiary[_beneficiary] = true;
        }

        totalAllocatedToBeneficiaries += _allocation;
        beneficiaryAllocation[_beneficiary] = _allocation;

        emit BeneficiaryAdded(_beneficiary, _allocation);
    }

    /**
     * @notice Calcula quantidade liberável para um beneficiário
     * @param _beneficiary Endereço do beneficiário
     */
    function releasableAmount(address _beneficiary) public view returns (uint256) {
        require(isBeneficiary[_beneficiary], "Nao eh beneficiario");
        require(vestingStartTimeSet, "Vesting nao foi iniciado ainda");

        if (vestingStartTime > block.timestamp) {
            // Vesting ainda não começou
            return 0;
        }

        uint256 elapsed = block.timestamp - vestingStartTime;
        uint256 elapsedSeconds = elapsed;
        uint256 vestingDurationSeconds = VESTING_DURATION_DAYS * 1 days;

        if (elapsedSeconds >= vestingDurationSeconds) {
            // Vesting completo
            return beneficiaryAllocation[_beneficiary] - beneficiaryReleased[_beneficiary];
        }

        // Linear vesting: (Montante × Tempo Decorrido) / Duração Total
        uint256 vested = (beneficiaryAllocation[_beneficiary] * elapsedSeconds) / vestingDurationSeconds;
        uint256 releasable = vested - beneficiaryReleased[_beneficiary];

        return releasable;
    }

    /**
     * @notice Libera tokens vesting do beneficiário
     */
    function release(address _beneficiary) external nonReentrant {
        require(isBeneficiary[_beneficiary], "Nao eh beneficiario");

        uint256 unreleased = releasableAmount(_beneficiary);
        require(unreleased > 0, "Nenhum token disponivel");

        beneficiaryReleased[_beneficiary] += unreleased;
        require(trayToken.transfer(_beneficiary, unreleased), "Transfer falhou");

        emit TokensReleased(_beneficiary, unreleased);
    }

    /**
     * @notice Retorna informações de vesting do beneficiário
     */
    function getVestingInfo(address _beneficiary) external view returns (
        uint256 allocation,
        uint256 released,
        uint256 releasable,
        uint256 locked,
        uint256 daysUntilUnlock
    ) {
        allocation = beneficiaryAllocation[_beneficiary];
        released = beneficiaryReleased[_beneficiary];
        releasable = releasableAmount(_beneficiary);
        locked = allocation - released;

        uint256 vestingEndTime = vestingStartTime + (VESTING_DURATION_DAYS * 1 days);
        if (block.timestamp >= vestingEndTime) {
            daysUntilUnlock = 0;
        } else {
            daysUntilUnlock = (vestingEndTime - block.timestamp) / 1 days;
        }
    }

    /**
     * @notice Retorna data exata de desbloqueio
     */
    function getUnlockDate() external view returns (uint256) {
        return vestingStartTime + (VESTING_DURATION_DAYS * 1 days);
    }

    /**
     * @notice Retorna total de beneficiários
     */
    function getTotalBeneficiaries() external view returns (uint256) {
        return beneficiaries.length;
    }

    /**
     * @notice Retorna saldo disponível no contrato
     */
    function getAvailableBalance() external view returns (uint256) {
        return trayToken.balanceOf(address(this));
    }
}
