// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {SequencerRegistry} from "../src/SequencerRegistry.sol";
import {TRAY} from "../src/TRAY.sol";

contract SequencerRegistryTest is Test {
    SequencerRegistry public registry;
    TRAY public tray;
    
    address public sequencer1 = makeAddr("sequencer1");
    address public sequencer2 = makeAddr("sequencer2");
    address public feeRecipient = makeAddr("feeRecipient");
    address public treasury = makeAddr("treasury");
    address public owner = address(this);

    function setUp() public {
        // Deploy TRAY token
        tray = new TRAY(treasury);
        
        // Deploy registry with TRAY token
        registry = new SequencerRegistry(address(tray));
        
        // Mint TRAY to sequencers for testing
        tray.mintTo(sequencer1, 1_000_000 * 10**18);
        tray.mintTo(sequencer2, 1_000_000 * 10**18);
    }

    // ============ Registration Tests ============

    function testRegisterSequencer() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        SequencerRegistry.SequencerInfo memory info = registry.getSequencerInfo(sequencer1);
        assertTrue(info.isActive);
        assertEq(info.bond, bond);
        assertEq(info.feeRecipient, feeRecipient);
    }

    function testInsufficientBond() public {
        // Create a poor sequencer with no tokens
        address poorSeq = makeAddr("poorSeq");
        
        vm.prank(poorSeq);
        // Expect ERC20 error since transferFrom will fail
        vm.expectRevert("ERC20: insufficient allowance");
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
    }

    function testDuplicateRegistration() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond * 2);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        vm.prank(sequencer1);
        vm.expectRevert(SequencerRegistry.SequencerAlreadyRegistered.selector);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
    }

    // ============ Heartbeat Tests ============

    function testSendHeartbeat() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        vm.prank(sequencer1);
        registry.sendHeartbeat(10);
        
        SequencerRegistry.SequencerInfo memory info = registry.getSequencerInfo(sequencer1);
        assertEq(info.blocksProposed, 10);
    }

    function testHeartbeatUnregistered() public {
        vm.prank(sequencer1);
        vm.expectRevert(SequencerRegistry.SequencerNotFound.selector);
        registry.sendHeartbeat(5);
    }

    // ============ Deactivation Tests ============

    function testDeactivateSequencer() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        registry.deactivateSequencer(sequencer1, "Testing deactivation");
        
        SequencerRegistry.SequencerInfo memory info = registry.getSequencerInfo(sequencer1);
        assertFalse(info.isActive);
    }

    function testReactivateSequencer() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        registry.deactivateSequencer(sequencer1, "Testing");
        registry.reactivateSequencer(sequencer1);
        
        SequencerRegistry.SequencerInfo memory info = registry.getSequencerInfo(sequencer1);
        assertTrue(info.isActive);
    }

    // ============ Bond Management Tests ============

    function testIncreaseBond() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond + 100 * 10**18);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        uint256 increase = 50 * 10**18;
        vm.prank(sequencer1);
        registry.increaseBond(increase);
        
        SequencerRegistry.SequencerInfo memory info = registry.getSequencerInfo(sequencer1);
        assertEq(info.bond, bond + increase);
    }

    function testWithdrawBond() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond + 100 * 10**18);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        uint256 increase = 100 * 10**18;
        vm.prank(sequencer1);
        registry.increaseBond(increase);
        
        uint256 withdraw = 50 * 10**18;
        vm.prank(sequencer1);
        registry.withdrawBond(withdraw);
        
        SequencerRegistry.SequencerInfo memory info = registry.getSequencerInfo(sequencer1);
        assertEq(info.bond, bond + increase - withdraw);
    }

    function testWithdrawBondTooMuch() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        vm.prank(sequencer1);
        vm.expectRevert(SequencerRegistry.InsufficientBondToWithdraw.selector);
        registry.withdrawBond(1 * 10**18);
    }

    // ============ Epoch Tests ============

    function testStartNewEpoch() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        uint256 epochBefore = registry.currentEpoch();
        registry.startNewEpoch();
        uint256 epochAfter = registry.currentEpoch();
        
        assertEq(epochAfter, epochBefore + 1);
    }

    // ============ View Functions Tests ============

    function testGetSequencers() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        vm.prank(sequencer2);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer2);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc2.trayon.io",
            "http://p2p2.trayon.io"
        );
        
        address[] memory sequencers = registry.getSequencers();
        assertEq(sequencers.length, 2);
    }

    function testGetActiveSequencers() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        vm.prank(sequencer2);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer2);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc2.trayon.io",
            "http://p2p2.trayon.io"
        );
        
        registry.deactivateSequencer(sequencer1, "Test");
        
        address[] memory active = registry.getActiveSequencers();
        assertEq(active.length, 1);
        assertEq(active[0], sequencer2);
    }

    function testGetStats() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        (uint256 total, uint256 active, uint256 locked, uint256 epoch) = registry.getStats();
        
        assertEq(total, 1);
        assertEq(active, 1);
        assertEq(locked, bond);
        assertEq(epoch, 1);
    }

    function testGetSequencerUptime() public {
        uint256 bond = registry.REQUIRED_BOND();
        
        vm.prank(sequencer1);
        tray.approve(address(registry), bond);
        
        vm.prank(sequencer1);
        registry.registerSequencer(
            feeRecipient,
            "http://rpc.trayon.io",
            "http://p2p.trayon.io"
        );
        
        vm.prank(sequencer1);
        registry.sendHeartbeat(95);
        
        uint256 uptime = registry.getSequencerUptime(sequencer1);
        assertEq(uptime, 100);  // 95 / (95 + 0) = 100%
    }
}
