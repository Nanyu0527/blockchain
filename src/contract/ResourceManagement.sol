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
        uint256 id;
    }

    mapping(uint256 => Resource) public resources;
    uint256 public resourceCount;
    uint256 public platformFee = 3; // 平台抽成3%

    UserManagement public userManagement;
    ResourceToken public resourceToken;

    constructor(address _userManagementAddress, address _resourceTokenAddress) {
        userManagement = UserManagement(_userManagementAddress);
        resourceToken = ResourceToken(_resourceTokenAddress);
    }

    function uploadResource(string memory title, uint256 price) public {
        resourceCount++;
        resources[resourceCount] = Resource({
            owner: msg.sender,
            title: title,
            price: price,
            exists: true,
            id: resourceCount
        });
    }

    function buyResource(uint256 resourceId) public {
        require(resources[resourceId].exists, "Resource does not exist");
        Resource storage resource = resources[resourceId];
        uint256 totalPrice = resource.price - (resource.price * platformFee / 100);

        // 解构购买者信息
        (bool buyIsVerified, bool buyIsexist, uint256 buyTokens) = userManagement.users(msg.sender);
        require(buyTokens >= resource.price, "Not enough tokens");

        // 解构卖家信息
        (bool sellIsVerified, bool sellIsexist, uint256 sellTokens) = userManagement.users(resource.owner);

        // 消耗代币
        resourceToken.transferFrom(msg.sender, address(this), resource.price);

        // 更新购买者信息
        userManagement.updateUser(msg.sender, buyIsVerified, buyIsexist, buyTokens - resource.price);

        // 更新卖家信息
        userManagement.updateUser(resource.owner, sellIsVerified, sellIsexist, sellTokens + totalPrice);
    }

    function get_resourceCount() public view returns (uint){
        return resourceCount;
    }

    function get_resource(uint256 resourceId) public view returns (Resource memory){
        return resources[resourceId];
    }

}