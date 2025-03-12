// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ILendingPool {
    // Events
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 amount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event CrossChainBorrowInitiated(bytes32 indexed messageId, address indexed user, uint256 amount);
    event EspressoConfirmationReceived(bytes32 indexed messageId, bool success);

    // Core functions
    function deposit(address token, uint256 amount) external;
    function borrow(address token, uint256 amount) external;
    function repay(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
    
    // Cross-chain functions
    function initiateCrossChainBorrow(
        uint256 targetChainId,
        address token,
        uint256 amount
    ) external returns (bytes32 messageId);
    
    function handleCrossChainBorrow(
        bytes32 messageId,
        address user,
        address token,
        uint256 amount
    ) external;

    // View functions
    function getUserDeposit(address user, address token) external view returns (uint256);
    function getUserBorrow(address user, address token) external view returns (uint256);
    function getAvailableLiquidity(address token) external view returns (uint256);
} 