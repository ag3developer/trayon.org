// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {ValidatorRegistry} from "../src/ValidatorRegistry.sol";

contract ValidatorRegistryTest is Test {
    TRAY public tray;
    ValidatorRegistry public registry;
    
    address public treasury = makeAddr("treasury");
    address public validator1 = makeAddr("validator1");
    address public validator2 = makeAddr("validator2");
    address public owner = address(this);

    function setUp() public {
        tray = new TRAY(treasury);
        registry = new ValidatorRegistry(address(tray));
    }

    // ============ Registration Tests ============

    function testRegisterValidator() public {
        registry.registerValidator(validator1, "BR", 2);
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertTrue(record.isActive);
        assertEq(record.kycLevel, 2);
        assertEq(record.certificationAccuracy, 10000);  // 100%
    }

    function testDuplicateRegistration() public {
        registry.registerValidator(validator1, "BR", 2);
        
        vm.expectRevert(ValidatorRegistry.ValidatorAlreadyRegistered.selector);
        registry.registerValidator(validator1, "BR", 2);
    }

    function testInvalidKYCLevel() public {
        vm.expectRevert(ValidatorRegistry.InvalidKYCLevel.selector);
        registry.registerValidator(validator1, "BR", 3);
    }

    function testApproveValidator() public {
        registry.registerValidator(validator1, "BR", 2);
        
        ValidatorRegistry.ValidatorRecord memory recordBefore = registry.getValidatorRecord(validator1);
        assertFalse(recordBefore.isApproved);
        
        registry.approveValidator(validator1);
        
        ValidatorRegistry.ValidatorRecord memory recordAfter = registry.getValidatorRecord(validator1);
        assertTrue(recordAfter.isApproved);
    }

    // ============ Deactivation Tests ============

    function testDeactivateValidator() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.deactivateValidator(validator1, "Testing deactivation");
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertFalse(record.isActive);
    }

    // ============ Certification Tests ============

    function testRecordCertification() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.recordCertification(validator1, 1, 9500);  // 95% accuracy
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertEq(record.certificationsCount, 1);
        assertEq(record.certificationAccuracy, 9500);
    }

    function testMultipleCertifications() public {
        registry.registerValidator(validator1, "BR", 2);
        
        registry.recordCertification(validator1, 1, 10000);  // 100%
        registry.recordCertification(validator1, 2, 9000);   // 90%
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertEq(record.certificationsCount, 2);
        // Média: (10000 + 9000) / 2 = 9500
        assertEq(record.certificationAccuracy, 9500);
    }

    function testInvalidAccuracy() public {
        registry.registerValidator(validator1, "BR", 2);
        
        vm.expectRevert(ValidatorRegistry.InvalidAccuracy.selector);
        registry.recordCertification(validator1, 1, 10001);
    }

    // ============ Slashing Tests ============

    function testRecordSlashing() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.recordCertification(validator1, 1, 10000);
        
        uint256 slashAmount = 1000 * 10**18;
        registry.recordSlashing(validator1, slashAmount, "Data falsification");
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertEq(record.slashCount, 1);
        assertEq(record.totalSlashedAmount, slashAmount);
    }

    function testAccuracyPenaltyAfterSlash() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.recordCertification(validator1, 1, 10000);
        
        uint256 accuracyBefore = registry.getValidatorAccuracy(validator1);
        
        registry.recordSlashing(validator1, 1000 * 10**18, "Test slash");
        
        uint256 accuracyAfter = registry.getValidatorAccuracy(validator1);
        // Deve reduzir 5%
        assertLt(accuracyAfter, accuracyBefore);
    }

    function testMultipleSlashesDeactivate() public {
        registry.registerValidator(validator1, "BR", 2);
        
        // Registrar 5 slashes
        for (uint256 i = 0; i < 5; i++) {
            registry.recordSlashing(validator1, 1000 * 10**18, "Slash");
        }
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertFalse(record.isActive);
    }

    // ============ Jurisdiction & KYC Tests ============

    function testUpdateJurisdiction() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.updateJurisdiction(validator1, "US");
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertEq(keccak256(abi.encodePacked(record.jurisdictionCode)), 
                 keccak256(abi.encodePacked("US")));
    }

    function testUpdateKYCLevel() public {
        registry.registerValidator(validator1, "BR", 1);
        registry.updateKYCLevel(validator1, 2);
        
        ValidatorRegistry.ValidatorRecord memory record = registry.getValidatorRecord(validator1);
        assertEq(record.kycLevel, 2);
    }

    // ============ View Functions Tests ============

    function testGetApprovedValidators() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.registerValidator(validator2, "US", 2);
        
        registry.approveValidator(validator1);
        
        address[] memory approved = registry.getApprovedValidators();
        assertEq(approved.length, 1);
        assertEq(approved[0], validator1);
    }

    function testGetActiveValidators() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.registerValidator(validator2, "US", 2);
        
        registry.deactivateValidator(validator1, "Test");
        
        address[] memory active = registry.getActiveValidators();
        assertEq(active.length, 1);
        assertEq(active[0], validator2);
    }

    function testGetCertificationHistory() public {
        registry.registerValidator(validator1, "BR", 2);
        
        registry.recordCertification(validator1, 1, 9000);
        registry.recordCertification(validator1, 2, 9500);
        registry.recordCertification(validator1, 3, 9800);
        
        uint256[] memory history = registry.getCertificationHistory(validator1);
        assertEq(history.length, 3);
        assertEq(history[0], 1);
        assertEq(history[1], 2);
        assertEq(history[2], 3);
    }

    function testGetSlashHistory() public {
        registry.registerValidator(validator1, "BR", 2);
        
        registry.recordSlashing(validator1, 1000 * 10**18, "Slash 1");
        registry.recordSlashing(validator1, 500 * 10**18, "Slash 2");
        
        ValidatorRegistry.SlashEvent[] memory history = registry.getSlashHistory(10);
        assertEq(history.length, 2);
    }

    function testGetStats() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.registerValidator(validator2, "US", 2);
        
        registry.approveValidator(validator1);
        registry.recordSlashing(validator1, 1000 * 10**18, "Test");
        
        (uint256 total, uint256 approved, uint256 active, uint256 totalSlashed, uint256 slashCount) = registry.getStats();
        
        assertEq(total, 2);
        assertEq(approved, 1);
        assertEq(active, 2);
        assertEq(totalSlashed, 1000 * 10**18);
        assertEq(slashCount, 1);
    }

    function testGetValidators() public {
        registry.registerValidator(validator1, "BR", 2);
        registry.registerValidator(validator2, "US", 2);
        
        address[] memory all = registry.getValidators();
        assertEq(all.length, 2);
    }
}
