//SPDX-License-Identifer:MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Agents.sol";

contract DeployAgent is Script {
    function run() public {
        vm.startBroadcast();
        new Agents(msg.sender);
        vm.stopBroadcast();
    }
}