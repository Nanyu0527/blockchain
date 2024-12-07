// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./ResourceToken.sol";

contract UserManagement {
    struct User {
        bool isVerified;
        bool isexist;
        uint256 tokens;
    }

    mapping(address => User) public users;
    ResourceToken public resourceToken;
    address public owner;

    constructor(address _tokenAddress) {
        resourceToken = ResourceToken(_tokenAddress);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function register() public {
        require(users[msg.sender].isexist == false, "User already registered");
        users[msg.sender] = User({
            isVerified: false,
            isexist: true,
            tokens: 0
        });
    }

    function verifyIdentity() public {
        require(!users[msg.sender].isVerified, "Identity already verified");
        users[msg.sender].isVerified = true;
        //核实身份奖励tag
    }

    function buyTokens(uint256 amount) public payable {
        uint256 cost = amount * 100 wei; // 假设代币价格为100 wei
        require(msg.value == cost, "Incorrect payment amount");
        resourceToken.mint(msg.sender, amount);
        users[msg.sender].tokens += amount;
    }

    function withdrawTokens() public {
        require(users[msg.sender].tokens > 0, "No tokens to withdraw");
        uint256 amount = users[msg.sender].tokens;
        users[msg.sender].tokens = 0;
        resourceToken.mint(msg.sender, amount);
    }

    function updateUser(address user, bool isVerified, bool isexist, uint256 tokens) public  {
        users[user] = User({
            isVerified: isVerified,
            isexist: isexist,
            tokens: tokens
        });
    }

    function get_userTokens(address account) public view returns (uint256){
        return users[account].tokens;
    }
}