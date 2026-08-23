// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {TRAYStaking} from "../src/TRAYStaking.sol";

contract TRAYStakingTest is Test {
    TRAY public tray;
    TRAYStaking public staking;
    
    address public owner = address(this);
    address public treasury = makeAddr("treasury");
    address public validator1 = makeAddr("validator1");
    address public validator2 = makeAddr("validator2");
    address public staker = makeAddr("staker");

    function setUp() public {
        tray = new TRAY(treasury);
        staking = new TRAYStaking(address(tray));
        
        // Distribuir tokens
        uint256 amount = 100_000 * 10**18;
        tray.transfer(validator1, amount);
        tray.transfer(validator2, amount);
        tray.transfer(staker, amount);
        
        // Transferir para staking (para rewards)
        tray.transfer(address(staking), 1_000_000 * 10**18);
    }

    // ============ Staking Tests ============

    function testStake() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        (uint256 staked, , , , ) = staking.getStakeInfo(staker);
        assertEq(staked, amount);
    }

    function testStakeAsValidator() public {
        uint256 amount = 32_000 * 10**18;
        vm.prank(validator1);
        tray.approve(address(staking), amount);
        
        vm.prank(validator1);
        staking.stake(amount, true);
        
        (uint256 staked, , bool isValidator, , ) = staking.getStakeInfo(validator1);
        assertEq(staked, amount);
        assertTrue(isValidator);
    }

    function testStakeMultiple() public {
        uint256 amount1 = 1000 * 10**18;
        uint256 amount2 = 2000 * 10**18;
        
        vm.prank(staker);
        tray.approve(address(staking), amount1 + amount2);
        
        vm.prank(staker);
        staking.stake(amount1, false);
        
        vm.prank(staker);
        staking.stake(amount2, false);
        
        (uint256 staked, , , , ) = staking.getStakeInfo(staker);
        assertEq(staked, amount1 + amount2);
    }

    // ============ Reward Tests ============

    function testCalculateReward() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        // Avançar tempo
        vm.warp(block.timestamp + 365 days);
        
        uint256 reward = staking.calculateReward(staker);
        // 8% APY = ~80 tokens
        assertGt(reward, 0);
        assertLt(reward, amount);
    }

    function testClaimReward() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        vm.warp(block.timestamp + 365 days);
        
        uint256 balanceBefore = tray.balanceOf(staker);
        
        vm.prank(staker);
        staking.claimReward();
        
        uint256 balanceAfter = tray.balanceOf(staker);
        assertGt(balanceAfter, balanceBefore);
    }

    // ============ Unstaking Tests ============

    function testRequestUnstake() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        vm.prank(staker);
        staking.requestUnstake(amount);
        
        (, , , , uint256 pending) = staking.getStakeInfo(staker);
        assertEq(pending, amount);
    }

    function testUnstakeDelay() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        vm.prank(staker);
        staking.requestUnstake(amount);
        
        // Tentar sacar antes do delay
        vm.prank(staker);
        vm.expectRevert("Withdrawal delay not passed");
        staking.completeUnstake();
        
        // Aguardar delay
        vm.warp(block.timestamp + 7 days + 1);
        
        vm.prank(staker);
        staking.completeUnstake();
        
        (uint256 staked, , , , ) = staking.getStakeInfo(staker);
        assertEq(staked, 0);
    }

    // ============ Slashing Tests ============

    function testSlash() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        uint256 expectedSlash = (amount * 50) / 100;
        staking.slash(staker, 50, "test slash");
        
        (uint256 staked, , , , ) = staking.getStakeInfo(staker);
        assertEq(staked, amount - expectedSlash);
    }

    function testSlashReducesReputation() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        staking.slash(staker, 10, "test");
        
        (uint256 stakedAmount, uint256 reputation, , , ) = staking.getStakeInfo(staker);
        assertEq(reputation, 50); // 100 - 50
    }

    // ============ Reputation Tests ============

    function testUpdateReputation() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        staking.updateReputation(staker, 120);
        
        (, uint256 reputation, , , ) = staking.getStakeInfo(staker);
        assertEq(reputation, 120);
    }

    function testIncreaseReputation() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        staking.increaseReputation(staker, 30);
        
        (, uint256 reputation, , , ) = staking.getStakeInfo(staker);
        assertEq(reputation, 130);
    }

    function testReputationCapped() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        staking.increaseReputation(staker, 100);
        
        (, uint256 reputation, , , ) = staking.getStakeInfo(staker);
        assertEq(reputation, 150); // Capped at 150
    }

    // ============ View Functions Tests ============

    function testGetAllStakers() public {
        vm.prank(validator1);
        tray.approve(address(staking), 1000 * 10**18);
        
        vm.prank(validator1);
        staking.stake(1000 * 10**18, false);
        
        vm.prank(validator2);
        tray.approve(address(staking), 1000 * 10**18);
        
        vm.prank(validator2);
        staking.stake(1000 * 10**18, false);
        
        address[] memory stakers = staking.getAllStakers();
        assertGe(stakers.length, 2);
    }

    function testGetValidatorsCount() public {
        uint256 amount = 32_000 * 10**18;
        
        vm.prank(validator1);
        tray.approve(address(staking), amount);
        
        vm.prank(validator1);
        staking.stake(amount, true);
        
        vm.prank(validator2);
        tray.approve(address(staking), amount);
        
        vm.prank(validator2);
        staking.stake(amount, true);
        
        uint256 count = staking.getValidatorsCount();
        assertEq(count, 2);
    }

    function testGetStats() public {
        uint256 amount = 1000 * 10**18;
        vm.prank(staker);
        tray.approve(address(staking), amount);
        
        vm.prank(staker);
        staking.stake(amount, false);
        
        (uint256 total, uint256 rewards, uint256 stakersCount, uint256 validatorsCount) = staking.getStats();
        
        assertEq(total, amount);
        assertEq(stakersCount, 1);
    }
}
