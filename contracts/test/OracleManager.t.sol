// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {OracleManager} from "../src/OracleManager.sol";

contract OracleManagerTest is Test {
    TRAY public tray;
    OracleManager public oracle;
    
    address public owner = address(this);
    address public treasury = makeAddr("treasury");
    address public validator1 = makeAddr("validator1");
    address public validator2 = makeAddr("validator2");
    address public validator3 = makeAddr("validator3");
    address public querier = makeAddr("querier");

    function setUp() public {
        tray = new TRAY(treasury);
        oracle = new OracleManager(address(tray));
        
        // Distribuir tokens
        uint256 amount = 100_000 * 10**18;
        tray.transfer(validator1, amount);
        tray.transfer(validator2, amount);
        tray.transfer(validator3, amount);
        tray.transfer(querier, amount);
        
        // Aprovar oracle para gastar
        vm.prank(querier);
        tray.approve(address(oracle), type(uint256).max);
        
        // Registrar validadores
        oracle.registerValidator(validator1);
        oracle.registerValidator(validator2);
        oracle.registerValidator(validator3);
    }

    // ============ Validator Management Tests ============

    function testRegisterValidator() public {
        address newValidator = makeAddr("newValidator");
        oracle.registerValidator(newValidator);
        
        address[] memory validators = oracle.getValidators();
        assertGt(validators.length, 0);
    }

    function testValidatorInfo() public {
        (address addr, uint256 reputation, uint256 submitted, uint256 certified, bool isActive) = 
            oracle.getValidatorInfo(validator1);
        
        assertEq(addr, validator1);
        assertEq(reputation, 100);
        assertFalse(submitted > 0);
        assertTrue(isActive);
    }

    function testDeactivateValidator() public {
        oracle.deactivateValidator(validator1);
        
        (, , , , bool isActive) = oracle.getValidatorInfo(validator1);
        assertFalse(isActive);
    }

    function testReactivateValidator() public {
        oracle.deactivateValidator(validator1);
        oracle.reactivateValidator(validator1);
        
        (, , , , bool isActive) = oracle.getValidatorInfo(validator1);
        assertTrue(isActive);
    }

    // ============ Data Submission Tests ============

    function testSubmitData() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        assertEq(feeds.length, 1);
    }

    function testDataSubmittedCounter() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        (, , uint256 submitted, , ) = oracle.getValidatorInfo(validator1);
        assertEq(submitted, 1);
    }

    function testNonValidatorCannotSubmit() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(querier);
        vm.expectRevert(OracleManager.NotAValidator.selector);
        oracle.submitData("government", "inflation", data);
    }

    // ============ Data Certification Tests ============

    function testCertifyData() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        (, , , , uint256 certifications, ) = oracle.getFeedInfo(feedId);
        assertEq(certifications, 1);
    }

    function testCertification2of3Auto() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        vm.prank(validator2);
        oracle.certifyData(feedId, true);
        
        (string memory dataType, , , bool certified, , string memory category) = oracle.getFeedInfo(feedId);
        assertTrue(certified);
    }

    function testReputationIncrease() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        (, uint256 repBefore, , , ) = oracle.getValidatorInfo(validator1);
        
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        (, uint256 repAfter, , , ) = oracle.getValidatorInfo(validator1);
        assertGt(repAfter, repBefore);
    }

    function testReputationDecreaseOnReject() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        (, uint256 repBefore, , , ) = oracle.getValidatorInfo(validator1);
        
        vm.prank(validator1);
        oracle.certifyData(feedId, false);
        
        (, uint256 repAfter, , , ) = oracle.getValidatorInfo(validator1);
        assertLt(repAfter, repBefore);
    }

    function testDoubleCertificationReverts() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        vm.prank(validator1);
        vm.expectRevert(OracleManager.FeedAlreadyCertified.selector);
        oracle.certifyData(feedId, true);
    }

    // ============ Data Query Tests ============

    function testQueryCertifiedData() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        // Certificar
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        vm.prank(validator2);
        oracle.certifyData(feedId, true);
        
        // Query
        vm.prank(querier);
        bytes memory result = oracle.queryData(feedId);
        
        assertEq(result, data);
    }

    function testQueryChargesFee() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        vm.prank(validator2);
        oracle.certifyData(feedId, true);
        
        uint256 balanceBefore = tray.balanceOf(querier);
        
        vm.prank(querier);
        oracle.queryData(feedId);
        
        uint256 balanceAfter = tray.balanceOf(querier);
        assertEq(balanceBefore - balanceAfter, oracle.queryFee());
    }

    function testQueryUncertifiedDataReverts() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        vm.prank(querier);
        vm.expectRevert(OracleManager.FeedNotFound.selector);
        oracle.queryData(feedId);
    }

    // ============ Admin Functions Tests ============

    function testUpdateQueryFee() public {
        uint256 newFee = 2000 * 10**18;
        oracle.updateQueryFee(newFee);
        assertEq(oracle.queryFee(), newFee);
    }

    function testWithdrawFees() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        bytes32[] memory feeds = oracle.getRecentFeeds(1);
        bytes32 feedId = feeds[0];
        
        vm.prank(validator1);
        oracle.certifyData(feedId, true);
        
        vm.prank(validator2);
        oracle.certifyData(feedId, true);
        
        vm.prank(querier);
        oracle.queryData(feedId);
        
        uint256 balanceBefore = tray.balanceOf(treasury);
        
        oracle.withdrawFees(treasury);
        
        uint256 balanceAfter = tray.balanceOf(treasury);
        assertGt(balanceAfter, balanceBefore);
    }

    // ============ View Functions Tests ============

    function testGetRecentFeeds() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(validator1);
            oracle.submitData("government", "inflation", abi.encode(i));
        }
        
        bytes32[] memory feeds = oracle.getRecentFeeds(3);
        assertEq(feeds.length, 3);
    }

    function testGetStats() public {
        bytes memory data = "inflation_0.52%";
        
        vm.prank(validator1);
        oracle.submitData("government", "inflation", data);
        
        (uint256 totalValidators, uint256 totalFeeds, uint256 certifiedFeeds, , ) = oracle.getStats();
        
        assertEq(totalValidators, 3);
        assertEq(totalFeeds, 1);
        assertEq(certifiedFeeds, 0);
    }
}
