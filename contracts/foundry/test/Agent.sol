// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Agents.sol";

contract AgentsTest is Test {
    Agents internal agents;
    address internal owner = address(100);
    address internal alice = address(101);

    function setUp() public {
        vm.deal(alice, 1 ether);
        vm.prank(owner);
        agents = new Agents(owner);
    }

    function testCreateAgentRevertsIfInsufficientFunds() public {
        vm.startPrank(alice);
        vm.expectRevert(InsuficientFunds.selector);
        agents.createAgent{value: 0.001 ether}(0);
        vm.stopPrank();
    }

    function testCreateAgentSuccess() public {
        vm.startPrank(alice);
        agents.createAgent{value: 0.01 ether}(1);
        bool isActive = agents.OwnersToAgents(alice, 1);
        assertTrue(isActive);
        vm.stopPrank();
    }

    function testDestroyAgentOnlyOwner() public {
        vm.startPrank(alice);
        agents.createAgent{value: 0.01 ether}(2);
        vm.stopPrank();

        // Non-owner should revert
        vm.startPrank(alice);
        vm.expectRevert();
        agents.destroyAgent(alice, 2);
        vm.stopPrank();

        // Owner can destroy
        vm.startPrank(owner);
        agents.destroyAgent(alice, 2);
        bool isActive = agents.OwnersToAgents(alice, 2);
        assertFalse(isActive);
        vm.stopPrank();
    }

    function testTransferFundsToWinner() public {
        // Fund contract
        vm.startPrank(alice);
        agents.createAgent{value: 0.02 ether}(3);
        vm.stopPrank();

        // Transfer to owner
        vm.startPrank(owner);
        uint256 balanceBefore = owner.balance;
        agents.transferFundsToWinner(payable(owner));
        assertEq(owner.balance, balanceBefore + 0.02 ether);
        vm.stopPrank();
    }
}
