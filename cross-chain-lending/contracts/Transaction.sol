// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ITransaction.sol";
import "./interfaces/IEspressoConfirmationHandler.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Transaction is ITransaction, Ownable {
    // State variables
    IEspressoConfirmationHandler public espressoHandler;
    
    struct TransactionData {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        bool executed;
    }
    
    mapping(bytes32 => TransactionData) private transactions;
    
    constructor(address _espressoHandler) Ownable(msg.sender) {
        espressoHandler = IEspressoConfirmationHandler(_espressoHandler);
    }

    function initiateTransaction(
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external override returns (bytes32 messageId) {
        require(amount > 0, "Invalid amount");

        // Transfer tokens from sender
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Generate message ID
        messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            recipient,
            token,
            amount,
            targetChainId
        ));

        // Store transaction data
        transactions[messageId] = TransactionData({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            executed: false
        });

        emit TransactionInitiated(
            messageId,
            msg.sender,
            recipient,
            token,
            amount,
            targetChainId
        );
    }

    function executeTransaction(
        bytes32 messageId,
        address sender,
        address recipient,
        address token,
        uint256 amount
    ) external override {
        require(msg.sender == address(espressoHandler), "Only Espresso handler");
        require(!transactions[messageId].executed, "Transaction already executed");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");

        transactions[messageId].executed = true;
        IERC20(token).transfer(recipient, amount);

        emit TransactionExecuted(messageId, true);
    }

    function getTransaction(bytes32 messageId) external view override returns (
        address sender,
        address recipient,
        address token,
        uint256 amount,
        bool executed
    ) {
        TransactionData memory txn = transactions[messageId];
        return (
            txn.sender,
            txn.recipient,
            txn.token,
            txn.amount,
            txn.executed
        );
    }

    // Admin function to withdraw stuck tokens
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
} 