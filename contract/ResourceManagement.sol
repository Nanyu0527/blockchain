// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./ResourceToken.sol";
import "./UserManagement.sol";

contract ResourceManagement {
    struct Resource {
        address owner;
        string title;
        uint256 price;
        bool exists;
    }

    mapping(uint256 => Resource) public resources;
    uint256 public resourceCount;
    uint256 public platformFee = 5; // 平台抽成5%

    UserManagement public userManagement;
    ResourceToken public resourceToken;

    constructor(address _userManagementAddress, address _resourceTokenAddress) {
        userManagement = UserManagement(_userManagementAddress);
        resourceToken = ResourceToken(_resourceTokenAddress);
    }

    function uploadResource(string memory title, uint256 price) public {
        // 解构用户信息
        (bool isVerified, uint256 tokens, uint256 rewards) = userManagement.users(msg.sender);
        require(tokens > 0, "Not enough tokens");

        resourceCount++;
        resources[resourceCount] = Resource({
            owner: msg.sender,
            title: title,
            price: price,
            exists: true
        });

        // 消耗代币
        resourceToken.transferFrom(msg.sender, address(this), 1);

        // 更新用户信息
        userManagement.updateUser(msg.sender, isVerified, tokens - 1, rewards + 5);
    }

    function buyResource(uint256 resourceId) public {
        require(resources[resourceId].exists, "Resource does not exist");
        Resource storage resource = resources[resourceId];
        uint256 totalPrice = resource.price + (resource.price * platformFee / 100);

        // 解构购买者信息
        (bool buyIsVerified, uint256 buyTokens, uint256 buyRewards) = userManagement.users(msg.sender);
        require(buyTokens >= totalPrice, "Not enough tokens");

        // 解构卖家信息
        (bool sellIsVerified, uint256 sellTokens, uint256 sellRewards) = userManagement.users(resource.owner);

        // 消耗代币
        resourceToken.transferFrom(msg.sender, resource.owner, resource.price);
        resourceToken.transferFrom(msg.sender, address(this), resource.price * platformFee / 100);

        // 更新购买者信息
        userManagement.updateUser(msg.sender, buyIsVerified, buyTokens - totalPrice, buyRewards);

        // 更新卖家信息
        userManagement.updateUser(resource.owner, sellIsVerified, sellTokens + resource.price, sellRewards + 5);
    }
}