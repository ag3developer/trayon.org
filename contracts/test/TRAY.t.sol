// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";

contract TRAYTest is Test {
    TRAY public tray;
    address public treasury = makeAddr("treasury");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public validator = makeAddr("validator");

    function setUp() public {
        tray = new TRAY(treasury);
    }

    // ============ Deployment Tests ============

    function testDeployment() public {
        assertEq(tray.name(), "TRAY");
        assertEq(tray.symbol(), "TRAY");
        assertEq(tray.decimals(), 18);
        assertEq(tray.treasury(), treasury);
        assertFalse(tray.gasTokenEnabled());
    }

    function testInitialSupply() public {
        uint256 expected = 250_000_000 * 10**18;
        assertEq(tray.totalSupply(), expected);
    }

    // ============ Transfer Tests ============

    function testTransfer() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(address(this));
        tray.transfer(user1, amount);
        assertEq(tray.balanceOf(user1), amount);
    }

    function testTransferFrom() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(address(this));
        tray.approve(user1, amount);
        
        vm.prank(user1);
        tray.transferFrom(address(this), user2, amount);
        
        assertEq(tray.balanceOf(user2), amount);
    }

    // ============ Burning Tests ============

    function testBurn() public {
        uint256 amount = 100 * 10**18;
        uint256 balanceBefore = tray.balanceOf(address(this));
        
        tray.burn(amount);
        
        assertEq(tray.balanceOf(address(this)), balanceBefore - amount);
        assertEq(tray.totalBurned(), amount);
    }

    function testBurnFrom() public {
        uint256 amount = 100 * 10**18;
        
        // Primeiro, transfer tokens para user1
        vm.prank(address(this));
        tray.transfer(user1, amount * 2);
        
        // Depois aprove user1 para queimar do endereço do contrato
        vm.prank(address(this));
        tray.approve(user1, amount);
        
        // user1 queima tokens do endereço do contrato (address(this))
        uint256 burnedBefore = tray.totalBurned();
        
        vm.prank(user1);
        tray.burnFrom(address(this), amount);
        
        assertEq(tray.totalBurned(), burnedBefore + amount);
    }

    // ============ Minting Tests ============

    function testMint() public {
        uint256 amount = 100 * 10**18;
        tray.mint(amount);
        assertEq(tray.balanceOf(address(this)), tray.INITIAL_SUPPLY() + amount);
    }

    function testMintTo() public {
        uint256 amount = 100 * 10**18;
        tray.mintTo(user1, amount);
        assertEq(tray.balanceOf(user1), amount);
    }

    function testMintExceedsMaxSupply() public {
        // A supply inicial é 250M, total é 1B. Só podemos mintar 750M mais
        // Tentar mintar mais de 750M deve falhar
        uint256 available = tray.availableToMint();
        
        vm.expectRevert(TRAY.ExceedsMaxSupply.selector);
        tray.mint(available + 1 ether);
    }

    // ============ Gas Token Tests ============

    function testEnableGasToken() public {
        tray.enableGasToken(validator);
        assertTrue(tray.gasTokenEnabled());
        assertEq(tray.sequencer(), validator);
    }

    function testEnableGasTokenTwice() public {
        tray.enableGasToken(validator);
        vm.expectRevert(TRAY.GasTokenAlreadyEnabled.selector);
        tray.enableGasToken(validator);
    }

    // ============ Fee Processing Tests ============

    function testFeeProcessing() public {
        uint256 fee = 1000 * 10**18;
        vm.prank(address(this));
        tray.transfer(address(tray), fee);
        
        tray.processFee(fee, validator);
        
        // Validar distribuição: 70% validator, 20% burn, 10% treasury
        uint256 expectedValidator = (fee * 70) / 100;
        uint256 expectedBurn = (fee * 20) / 100;
        uint256 expectedTreasury = (fee * 10) / 100;
        
        assertEq(tray.balanceOf(validator), expectedValidator);
        assertEq(tray.totalBurned(), expectedBurn);
        assertEq(tray.balanceOf(treasury), expectedTreasury);
    }

    // ============ Treasury Tests ============

    function testUpdateTreasury() public {
        address newTreasury = makeAddr("newTreasury");
        tray.updateTreasury(newTreasury);
        assertEq(tray.treasury(), newTreasury);
    }

    function testUpdateTreasuryZeroAddress() public {
        vm.expectRevert(TRAY.InvalidTreasury.selector);
        tray.updateTreasury(address(0));
    }

    // ============ Fee Percentages Tests ============

    function testUpdateFeePercentages() public {
        tray.updateFeePercentages(60, 25, 15);
        assertEq(tray.feePercentageValidators(), 60);
        assertEq(tray.feePercentageBurn(), 25);
        assertEq(tray.feePercentageTreasury(), 15);
    }

    function testUpdateFeePercentagesInvalid() public {
        vm.expectRevert(TRAY.InvalidPercentages.selector);
        tray.updateFeePercentages(50, 30, 21); // Soma = 101 != 100
    }

    // ============ View Functions Tests ============

    function testAvailableToMint() public {
        uint256 minted = tray.INITIAL_SUPPLY();
        uint256 available = tray.TOTAL_SUPPLY() - minted;
        assertEq(tray.availableToMint(), available);
    }

    function testGetStats() public {
        (uint256 supply, uint256 burned, uint256 remaining, bool isGas) = tray.getStats();
        assertEq(supply, tray.totalSupply());
        assertEq(burned, tray.totalBurned());
        assertEq(remaining, tray.availableToMint());
        assertFalse(isGas);
    }

    // ============ Allowance Tests ============

    function testApprove() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(address(this));
        tray.approve(user1, amount);
        assertEq(tray.allowance(address(this), user1), amount);
    }

    function testIncreaseAllowance() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(address(this));
        tray.approve(user1, amount);
        
        vm.prank(address(this));
        tray.increaseAllowance(user1, 500 * 10**18);
        
        assertEq(tray.allowance(address(this), user1), amount + 500 * 10**18);
    }

    function testDecreaseAllowance() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(address(this));
        tray.approve(user1, amount);
        
        vm.prank(address(this));
        tray.decreaseAllowance(user1, 300 * 10**18);
        
        assertEq(tray.allowance(address(this), user1), amount - 300 * 10**18);
    }
}
