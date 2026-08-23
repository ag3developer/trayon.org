// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract PredictionMarketTest is Test {
    TRAY public tray;
    PredictionMarket public market;
    
    address public treasury = makeAddr("treasury");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public creator = makeAddr("creator");
    address public owner = address(this);

    function setUp() public {
        tray = new TRAY(treasury);
        market = new PredictionMarket(address(tray));
        
        // Distribuir tokens
        tray.transfer(user1, 1_000_000 * 10**18);
        tray.transfer(user2, 1_000_000 * 10**18);
        
        // Aprovar market para gastar
        vm.prank(user1);
        tray.approve(address(market), type(uint256).max);
        
        vm.prank(user2);
        tray.approve(address(market), type(uint256).max);
    }

    // ============ Market Creation Tests ============

    function testCreateMarket() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        
        uint256 marketId = market.createMarket(
            "Will Bitcoin reach $100k?",
            "Bitcoin price by end of 2024",
            resolvesAt
        );
        
        assertEq(marketId, 1);
        
        PredictionMarket.Market memory m = market.getMarket(1);
        assertEq(keccak256(abi.encodePacked(m.title)), 
                 keccak256(abi.encodePacked("Will Bitcoin reach $100k?")));
        assertEq(m.state, 0);  // MARKET_OPEN
    }

    function testInvalidResolutionTime() public {
        vm.expectRevert(PredictionMarket.InvalidAmount.selector);
        market.createMarket(
            "Test",
            "Test",
            block.timestamp
        );
    }

    // ============ Position Opening Tests ============

    function testOpenPosition() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        (uint256 yesAmount, uint256 noAmount) = market.getUserPositions(user1, marketId);
        assertEq(yesAmount, amount);
        assertEq(noAmount, 0);
    }

    function testOpenPositionNo() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, false, amount);
        
        (uint256 yesAmount, uint256 noAmount) = market.getUserPositions(user1, marketId);
        assertEq(yesAmount, 0);
        assertEq(noAmount, amount);
    }

    function testInsufficientBalance() public {
        address poorUser = makeAddr("poorUser");
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        vm.prank(poorUser);
        vm.expectRevert(PredictionMarket.InsufficientBalance.selector);
        market.openPosition(marketId, true, 1000 * 10**18);
    }

    function testInvalidAmount() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        vm.prank(user1);
        vm.expectRevert(PredictionMarket.InvalidAmount.selector);
        market.openPosition(marketId, true, 0);
    }

    // ============ Market Resolution Tests ============

    function testResolveMarket() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        // Esperar até resolution time
        vm.warp(resolvesAt + 1);
        
        market.resolveMarket(marketId, true);
        
        PredictionMarket.Market memory m = market.getMarket(marketId);
        assertTrue(m.resolved);
        assertTrue(m.resolution);
    }

    function testResolveTooEarly() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        vm.expectRevert(PredictionMarket.ResolutionTimedOut.selector);
        market.resolveMarket(marketId, true);
    }

    function testCancelMarket() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        market.cancelMarket(marketId);
        
        PredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.state, market.MARKET_CANCELLED());
    }

    // ============ Reward Claiming Tests ============

    function testClaimRewards() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        // User1 bets YES
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        // User2 bets NO
        vm.prank(user2);
        market.openPosition(marketId, false, amount);
        
        // Resolver para YES ganhou
        vm.warp(resolvesAt + 1);
        market.resolveMarket(marketId, true);
        
        // User1 reivindica recompensas
        uint256 balanceBefore = tray.balanceOf(user1);
        
        vm.prank(user1);
        market.claimRewards(marketId);
        
        uint256 balanceAfter = tray.balanceOf(user1);
        assertGt(balanceAfter, balanceBefore);
    }

    function testClaimRewardsLoser() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        vm.prank(user2);
        market.openPosition(marketId, false, amount);
        
        vm.warp(resolvesAt + 1);
        market.resolveMarket(marketId, true);
        
        // User2 perdeu
        uint256 balanceBefore = tray.balanceOf(user2);
        
        vm.prank(user2);
        market.claimRewards(marketId);
        
        uint256 balanceAfter = tray.balanceOf(user2);
        // Não deve recuperar nada (perdeu)
        assertEq(balanceAfter, balanceBefore);
    }

    function testRefundOnCancel() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        // Cancelar mercado
        market.cancelMarket(marketId);
        
        uint256 balanceBefore = tray.balanceOf(user1);
        
        vm.prank(user1);
        market.claimRewards(marketId);
        
        uint256 balanceAfter = tray.balanceOf(user1);
        // Deve receber reembolso
        assertGt(balanceAfter, balanceBefore);
    }

    // ============ View Functions Tests ============

    function testGetMarketPositions() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        vm.prank(user2);
        market.openPosition(marketId, false, amount);
        
        PredictionMarket.Position[] memory positions = market.getMarketPositions(marketId);
        assertEq(positions.length, 2);
    }

    function testGetStats() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        vm.prank(user2);
        market.openPosition(marketId, false, amount);
        
        vm.warp(resolvesAt + 1);
        market.resolveMarket(marketId, true);
        
        // Claim rewards to trigger fee collection
        vm.prank(user1);
        market.claimRewards(marketId);
        
        (uint256 totalMarkets, uint256 totalVolume, uint256 platformBalance) = market.getStats();
        
        assertEq(totalMarkets, 1);
        assertEq(totalVolume, amount * 2);  // Both positions
        assertGt(platformBalance, 0);  // Now there's a platform fee from resolution
    }

    function testPlatformFeeCollection() public {
        uint256 resolvesAt = block.timestamp + 7 days;
        uint256 marketId = market.createMarket("Test Market", "Test", resolvesAt);
        
        uint256 amount = 1000 * 10**18;
        
        vm.prank(user1);
        market.openPosition(marketId, true, amount);
        
        vm.prank(user2);
        market.openPosition(marketId, false, amount);
        
        vm.warp(resolvesAt + 1);
        market.resolveMarket(marketId, true);
        
        // Platform fee: 2% de losing pool
        vm.prank(user1);
        market.claimRewards(marketId);
        
        (,,uint256 platformBalance) = market.getStats();
        assertGt(platformBalance, 0);
    }
}
