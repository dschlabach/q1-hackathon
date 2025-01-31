//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

error InsuficientFunds();

contract Agents is Ownable {
    constructor(address owner) Ownable(owner) {}

    struct Agent{
        bool Active;    
    }

    mapping(address => mapping(uint256 => Agent)) public OwnersToAgents;

    function createAgent(uint256 _id) external payable {
        require(msg.value >= 0.01 ether, InsuficientFunds());
        Agent memory newAgent = Agent({
            Active: true
        });
        OwnersToAgents[msg.sender][_id] = newAgent;
    }

     function destroyAgent(address loserAddress, uint256 _id) external onlyOwner {
        OwnersToAgents[loserAddress][_id].Active = false;
    }


    function transferFundsToWinner(address payable winnerAddress) external onlyOwner {
        require(address(this).balance > 0, "Contract has no funds");

        (bool success, ) = winnerAddress.call{value: 0.01 ether}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
    fallback() external payable {}
}