// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./ResourceToken.sol";

contract UserManagement {
    struct User {
        bool isVerified;
        uint256 tokens;
        uint256 rewards;
    }

    mapping(address => User) public users;
    ResourceToken public resourceToken;

    constructor(address _tokenAddress) {
        resourceToken = ResourceToken(_tokenAddress);
    }

    function register() public {
        require(users[msg.sender].tokens == 0, "User already registered");
        users[msg.sender] = User({
            isVerified: false,
            tokens: 0,
            rewards: 0
        });
    }

    function verifyIdentity() public {
        require(!users[msg.sender].isVerified, "Identity already verified");
        users[msg.sender].isVerified = true;
        users[msg.sender].rewards += 10; // 假设核实身份奖励10个代币
    }

    function buyTokens(uint256 amount) public payable {
        uint256 cost = amount * 100 wei; // 假设代币价格为100 wei
        require(msg.value == cost, "Incorrect payment amount");
        resourceToken.mint(msg.sender, amount);
        users[msg.sender].tokens += amount;
    }

    function withdrawRewards() public {
        require(users[msg.sender].rewards > 0, "No rewards to withdraw");
        uint256 amount = users[msg.sender].rewards;
        users[msg.sender].rewards = 0;
        resourceToken.mint(msg.sender, amount);
    }
    function updateUser(address user, bool isVerified, uint256 tokens, uint256 rewards) public {
        users[user] = User({
            isVerified: isVerified,
            tokens: tokens,
            rewards: rewards
        });
    }
}