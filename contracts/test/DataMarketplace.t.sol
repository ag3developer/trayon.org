// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TRAY} from "../src/TRAY.sol";
import {DataMarketplace} from "../src/DataMarketplace.sol";

contract DataMarketplaceTest is Test {
    TRAY public tray;
    DataMarketplace public marketplace;
    
    address public treasury = makeAddr("treasury");
    address public creator = makeAddr("creator");
    address public buyer = makeAddr("buyer");
    address public owner = address(this);

    function setUp() public {
        tray = new TRAY(treasury);
        marketplace = new DataMarketplace(address(tray));
        
        // Distribuir tokens
        tray.transfer(creator, 1_000_000 * 10**18);
        tray.transfer(buyer, 1_000_000 * 10**18);
        
        // Aprovar marketplace para gastar
        vm.prank(creator);
        tray.approve(address(marketplace), type(uint256).max);
        
        vm.prank(buyer);
        tray.approve(address(marketplace), type(uint256).max);
    }

    // ============ Dataset Creation Tests ============

    function testCreateDataset() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Government Data",
            "Budget allocation 2024",
            "government",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        assertEq(datasetId, 1);
        
        DataMarketplace.Dataset memory dataset = marketplace.getDataset(1);
        assertEq(dataset.creator, creator);
        assertEq(dataset.price, price);
        assertTrue(dataset.isActive);
    }

    function testInvalidPrice() public {
        vm.prank(creator);
        vm.expectRevert(DataMarketplace.InvalidPrice.selector);
        marketplace.createDataset(
            "Test",
            "Test",
            "test",
            0,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
    }

    function testInvalidAccuracy() public {
        vm.prank(creator);
        vm.expectRevert(DataMarketplace.InvalidAccuracy.selector);
        marketplace.createDataset(
            "Test",
            "Test",
            "test",
            1000 * 10**18,
            10001,
            "ipfs://QmXXX",
            keccak256("data")
        );
    }

    // ============ Purchase Tests ============

    function testPurchaseDataset() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Government Data",
            "Budget allocation",
            "government",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        uint256 buyerBalanceBefore = tray.balanceOf(buyer);
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId);
        
        uint256 buyerBalanceAfter = tray.balanceOf(buyer);
        assertEq(buyerBalanceBefore - buyerBalanceAfter, price);
    }

    function testPurchasedFlag() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId);
        
        assertTrue(marketplace.hasPurchased(buyer, datasetId));
    }

    function testDoublePurchase() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId);
        
        vm.prank(buyer);
        vm.expectRevert(DataMarketplace.AlreadyPurchased.selector);
        marketplace.purchaseDataset(datasetId);
    }

    function testInsufficientBalance() public {
        address poorBuyer = makeAddr("poorBuyer");
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(poorBuyer);
        vm.expectRevert(DataMarketplace.InsufficientBalance.selector);
        marketplace.purchaseDataset(datasetId);
    }

    // ============ Price Update Tests ============

    function testUpdatePrice() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        uint256 newPrice = 2000 * 10**18;
        vm.prank(creator);
        marketplace.updateDatasetPrice(datasetId, newPrice);
        
        DataMarketplace.Dataset memory dataset = marketplace.getDataset(datasetId);
        assertEq(dataset.price, newPrice);
    }

    // ============ Deactivation Tests ============

    function testDeactivateDataset() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(creator);
        marketplace.deactivateDataset(datasetId);
        
        DataMarketplace.Dataset memory dataset = marketplace.getDataset(datasetId);
        assertFalse(dataset.isActive);
    }

    function testReactivateDataset() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(creator);
        marketplace.deactivateDataset(datasetId);
        
        vm.prank(creator);
        marketplace.reactivateDataset(datasetId);
        
        DataMarketplace.Dataset memory dataset = marketplace.getDataset(datasetId);
        assertTrue(dataset.isActive);
    }

    // ============ View Functions Tests ============

    function testGetCreatorDatasets() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        marketplace.createDataset("Data1", "Data1", "test", price, 9500, "ipfs://Q1", keccak256("1"));
        
        vm.prank(creator);
        marketplace.createDataset("Data2", "Data2", "test", price, 9500, "ipfs://Q2", keccak256("2"));
        
        uint256[] memory datasets = marketplace.getCreatorDatasets(creator);
        assertEq(datasets.length, 2);
        assertEq(datasets[0], 1);
        assertEq(datasets[1], 2);
    }

    function testGetBuyerPurchaseHistory() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId1 = marketplace.createDataset(
            "Data1",
            "Data1",
            "test",
            price,
            9500,
            "ipfs://Q1",
            keccak256("1")
        );
        
        vm.prank(creator);
        uint256 datasetId2 = marketplace.createDataset(
            "Data2",
            "Data2",
            "test",
            price,
            9500,
            "ipfs://Q2",
            keccak256("2")
        );
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId1);
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId2);
        
        uint256[] memory history = marketplace.getBuyerPurchaseHistory(buyer);
        assertEq(history.length, 2);
    }

    function testGetRecentPurchases() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId);
        
        DataMarketplace.Purchase[] memory purchases = marketplace.getRecentPurchases(10);
        assertEq(purchases.length, 1);
        assertEq(purchases[0].datasetId, datasetId);
        assertEq(purchases[0].buyer, buyer);
    }

    function testGetStats() public {
        uint256 price = 1000 * 10**18;
        
        vm.prank(creator);
        uint256 datasetId = marketplace.createDataset(
            "Data",
            "Data",
            "test",
            price,
            9500,
            "ipfs://QmXXX",
            keccak256("data")
        );
        
        vm.prank(buyer);
        marketplace.purchaseDataset(datasetId);
        
        (uint256 totalDatasets, uint256 transactions, uint256 volume, uint256 platformFee) = marketplace.getStats();
        
        assertEq(totalDatasets, 1);
        assertEq(transactions, 1);
        assertEq(volume, price);
        assertGt(platformFee, 0);
    }
}
