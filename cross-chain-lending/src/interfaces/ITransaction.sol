// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITransaction {
    // Events
    event TransactionInitiated(
        bytes32 indexed messageId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 targetChainId
    );
    event TransactionExecuted(bytes32 indexed messageId, bool success);

    // Core functions
    function initiateTransaction(
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external returns (bytes32 messageId);

    function executeTransaction(
        bytes32 messageId,
        address sender,
        address recipient,
        address token,
        uint256 amount
    ) external;

    // View functions
    function getTransaction(bytes32 messageId) external view returns (
        address sender,
        address recipient,
        address token,
        uint256 amount,
        bool executed
    );
} 