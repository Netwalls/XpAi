// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ILendingPool.sol";
import "./interfaces/IEspressoConfirmationHandler.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingPool is ILendingPool, Ownable {
    // State variables
    mapping(address => mapping(address => uint256)) private userDeposits;
    mapping(address => mapping(address => uint256)) private userBorrows;
    mapping(address => mapping(address => uint256)) private lastInterestUpdate;
    mapping(bytes32 => bool) private processedMessages;
    
    IEspressoConfirmationHandler public espressoHandler;
    uint256 public constant INTEREST_RATE = 500; // 5% APR
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80%
    uint256 public constant LIQUIDATION_BONUS = 500; // 5% bonus for liquidators

    event Liquidated(address indexed user, address indexed liquidator, address indexed token, uint256 amount);
    event InterestAccrued(address indexed user, address indexed token, uint256 amount);

    constructor(address _espressoHandler) Ownable(msg.sender) {
        espressoHandler = IEspressoConfirmationHandler(_espressoHandler);
    }

    function deposit(address token, uint256 amount) external override {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userDeposits[msg.sender][token] += amount;
        emit Deposit(msg.sender, token, amount);
    }

    function borrow(address token, uint256 amount) external override {
        accrueInterest(msg.sender, token);
        require(amount > 0, "Amount must be greater than 0");
        require(getAvailableLiquidity(token) >= amount, "Insufficient liquidity");
        require(_hasCollateral(msg.sender, token, amount), "Insufficient collateral");
        
        userBorrows[msg.sender][token] += amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Borrow(msg.sender, token, amount);
    }

    function repay(address token, uint256 amount) external override {
        accrueInterest(msg.sender, token);
        require(amount > 0, "Amount must be greater than 0");
        require(userBorrows[msg.sender][token] >= amount, "Amount exceeds debt");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userBorrows[msg.sender][token] -= amount;
        emit Repay(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) external override {
        require(amount > 0, "Amount must be greater than 0");
        require(userDeposits[msg.sender][token] >= amount, "Insufficient balance");
        require(_canWithdraw(msg.sender, token, amount), "Withdrawal would put loans at risk");
        
        userDeposits[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, token, amount);
    }

    function initiateCrossChainBorrow(
        uint256 targetChainId,
        address token,
        uint256 amount
    ) external override returns (bytes32 messageId) {
        require(amount > 0, "Amount must be greater than 0");
        require(_hasCollateral(msg.sender, token, amount), "Insufficient collateral");
        
        messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            targetChainId,
            token,
            amount
        ));
        
        emit CrossChainBorrowInitiated(messageId, msg.sender, amount);
        return messageId;
    }

    function handleCrossChainBorrow(
        bytes32 messageId,
        address user,
        address token,
        uint256 amount
    ) external override {
        require(msg.sender == address(espressoHandler), "Only Espresso handler");
        require(!processedMessages[messageId], "Message already processed");
        require(_hasCollateral(user, token, amount), "Insufficient collateral");
        
        processedMessages[messageId] = true;
        userBorrows[user][token] += amount;
        IERC20(token).transfer(user, amount);
        
        emit EspressoConfirmationReceived(messageId, true);
    }

    function getUserDeposit(address user, address token) external view override returns (uint256) {
        return userDeposits[user][token];
    }

    function getUserBorrow(address user, address token) external view override returns (uint256) {
        return userBorrows[user][token];
    }

    function getAvailableLiquidity(address token) public view override returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function liquidate(address user, address token) external {
        require(_canBeLiquidated(user, token), "Position is not liquidatable");
        
        uint256 borrowAmount = userBorrows[user][token];
        uint256 bonus = (borrowAmount * LIQUIDATION_BONUS) / 10000;
        uint256 totalAmount = borrowAmount + bonus;
        
        require(userDeposits[user][token] >= totalAmount, "Insufficient collateral for liquidation");
        
        userDeposits[user][token] -= totalAmount;
        userBorrows[user][token] = 0;
        IERC20(token).transfer(msg.sender, totalAmount);
        
        emit Liquidated(user, msg.sender, token, totalAmount);
    }

    function accrueInterest(address user, address token) public {
        uint256 timePassed = block.timestamp - lastInterestUpdate[user][token];
        if (timePassed > 0 && userBorrows[user][token] > 0) {
            uint256 interest = (userBorrows[user][token] * INTEREST_RATE * timePassed) / (365 days * 10000);
            userBorrows[user][token] += interest;
            lastInterestUpdate[user][token] = block.timestamp;
            emit InterestAccrued(user, token, interest);
        }
    }

    function _hasCollateral(address user, address token, uint256 borrowAmount) internal view returns (bool) {
        uint256 totalDeposited = userDeposits[user][token];
        uint256 totalBorrowed = userBorrows[user][token];
        return totalDeposited >= (totalBorrowed + borrowAmount) * LIQUIDATION_THRESHOLD / 10000;
    }

    function _canWithdraw(address user, address token, uint256 amount) internal view returns (bool) {
        uint256 remainingDeposit = userDeposits[user][token] - amount;
        uint256 totalBorrowed = userBorrows[user][token];
        return remainingDeposit >= totalBorrowed * LIQUIDATION_THRESHOLD / 10000;
    }

    function _canBeLiquidated(address user, address token) internal view returns (bool) {
        uint256 totalDeposited = userDeposits[user][token];
        uint256 totalBorrowed = userBorrows[user][token];
        return totalDeposited * 10000 < totalBorrowed * LIQUIDATION_THRESHOLD;
    }
} 