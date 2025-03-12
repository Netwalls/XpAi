// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISwap {
    // Events
    event SwapInitiated(
        bytes32 indexed messageId,
        address indexed sender,
        address indexed recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 targetAmount
    );
    event SwapCompleted(bytes32 indexed messageId, bool success);

    // Core functions
    function initiateSwap(
        address recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 targetAmount,
        uint256 targetChainId
    ) external returns (bytes32 messageId);

    function executeSwap(
        bytes32 messageId,
        address sender,
        address recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 targetAmount
    ) external;

    // View functions
    function getSwapRate(address sourceToken, address targetToken) external view returns (uint256);
    function getLiquidity(address token) external view returns (uint256);
} 