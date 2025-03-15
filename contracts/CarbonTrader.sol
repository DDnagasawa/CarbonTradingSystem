// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * 自定义错误
 */
error CarbonTrader__NotOwner();
error CarbonTrader__PramaError();
error CarbonTrader__TransferFailed();

contract CarbonTrader {
    mapping (address => uint256) private s_addressToAllowances;
    mapping (address => uint256) private s_frozenAllowances; 
    mapping (address => uint256) private s_auctionAmount; 
    mapping (string => Trade) private s_trade; 
    
    struct Trade {
        address seller;            
        uint256 sellAmount;        
        uint256 startTimestamp;    
        uint256 endTimestamp;      
        uint256 minimumBidAmount;  
        uint256 initPriceOfUnit;   
        mapping (address => uint256) deposits; 
        mapping (address => string) bidInfos;  
        mapping (address => string) bidSecrets;
    }

    address private immutable i_owner;
    IERC20 private immutable i_usdtToken;
    
    constructor(address usdtTokenAddress) {
        i_owner = msg.sender;           // 记录部署者
        i_usdtToken = IERC20(usdtTokenAddress); // USDT-like token 的地址
    }
    
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert CarbonTrader__NotOwner();
        }
        _;
    }

    // 便于测试中验证 owner
    function getOwner() public view returns (address) {
        return i_owner;
    }

    // -------------------- Carbon Allowance --------------------
    function issueAllowance(address user, uint256 amount) public onlyOwner {
        s_addressToAllowances[user] += amount;
    }
    
    function getAllowance(address user) public view returns(uint256) {
        return s_addressToAllowances[user];
    }
    
    function freezeAllowance(address user, uint256 freezedAmount) public onlyOwner {
        s_addressToAllowances[user] -= freezedAmount;
        s_frozenAllowances[user] += freezedAmount;
    }
   
    function unfreezeAllowance(address user, uint256 freezedAmount) public onlyOwner {
        s_addressToAllowances[user] += freezedAmount;
        s_frozenAllowances[user] -= freezedAmount;
    }
   
    function getFrozenAllowance(address user) public view returns(uint256) {
        return s_frozenAllowances[user];
    }

    function destroyAllowance(address user, uint256 destroyAmount) public onlyOwner {
        s_addressToAllowances[user] -= destroyAmount;
    }         
    
    function destroyAllAllowance(address user) public onlyOwner {
        s_addressToAllowances[user] = 0;
        s_frozenAllowances[user] = 0;
    }

    // -------------------- Auction --------------------
    function startTrade(
        string memory tradeID,
        uint256 amount,
        uint256 startTimestamp,
        uint256 endTimestamp,
        uint256 minimumBidAmount,
        uint256 initPriceOfUnit
    ) public {
        if (
            amount <= 0 ||
            startTimestamp >= endTimestamp ||
            minimumBidAmount <= 0 ||
            minimumBidAmount > amount 
        ) revert CarbonTrader__PramaError();

        Trade storage newTrade = s_trade[tradeID];
        newTrade.seller = msg.sender;
        newTrade.sellAmount = amount;
        newTrade.startTimestamp = startTimestamp;
        newTrade.endTimestamp = endTimestamp;
        newTrade.minimumBidAmount = minimumBidAmount;
        newTrade.initPriceOfUnit = initPriceOfUnit;

        s_addressToAllowances[msg.sender] -= amount;
        s_frozenAllowances[msg.sender] += amount;
    }

    function getTrade(string memory tradeID) public view returns(
        address,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        Trade storage curTrade = s_trade[tradeID];
        return (
            curTrade.seller,
            curTrade.sellAmount,
            curTrade.startTimestamp,
            curTrade.endTimestamp,
            curTrade.minimumBidAmount,
            curTrade.initPriceOfUnit
        );
    } 
    
    // -------------------- Deposit --------------------
    function deposit(string memory tradeID, uint256 amount, string memory info) public {
        Trade storage curTrade = s_trade[tradeID];
        
        bool success = i_usdtToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert CarbonTrader__TransferFailed();

        curTrade.deposits[msg.sender] = amount;
        setBidInfo(tradeID, info);
    }

    function refundDeposit(string memory tradeID) public {
        Trade storage curTrade = s_trade[tradeID];
        uint256 depositAmount = curTrade.deposits[msg.sender];

        curTrade.deposits[msg.sender] = 0;
        
        bool success = i_usdtToken.transfer(msg.sender, depositAmount);
        if (!success) {
            curTrade.deposits[msg.sender] = depositAmount;
            revert CarbonTrader__TransferFailed();
        }
    }

    function setBidInfo(string memory tradeID, string memory info) public {
        Trade storage curTrade = s_trade[tradeID];
        curTrade.bidInfos[msg.sender] = info;
    }

    function setBidSecret(string memory tradeID, string memory secret) public {
        Trade storage curTrade = s_trade[tradeID];
        curTrade.bidSecrets[msg.sender] = secret;
    }

    function getBidInfo(string memory tradeID) public view returns(string memory) {
        Trade storage curTrade = s_trade[tradeID];
        return curTrade.bidInfos[msg.sender];
    }

    // -------------------- Settlement --------------------
    function finalizeAuctionAndTransferCarbon(
        string memory tradeID, 
        uint256 allowanceAmount, 
        uint256 additionalAmountToPay
    ) public {
        Trade storage curTrade = s_trade[tradeID];
        uint256 depositAmount = curTrade.deposits[msg.sender];
        curTrade.deposits[msg.sender] = 0;
        
        address seller = curTrade.seller;
        s_auctionAmount[seller] += (depositAmount + additionalAmountToPay);
        
        s_frozenAllowances[seller] -= allowanceAmount;
        s_addressToAllowances[msg.sender] += allowanceAmount;

        bool success = i_usdtToken.transferFrom(msg.sender, address(this), additionalAmountToPay);
        if (!success) revert CarbonTrader__TransferFailed();
    }
    
    // -------------------- Withdraw --------------------
    function withdrawAuctionAmount() public {
        uint256 amount = s_auctionAmount[msg.sender];
        s_auctionAmount[msg.sender] = 0;

        bool success = i_usdtToken.transfer(msg.sender, amount);
        if (!success) {
            s_auctionAmount[msg.sender] = amount;
            revert CarbonTrader__TransferFailed();
        }
    }
}