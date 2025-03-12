// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IEspressoConfirmationHandler.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EspressoConfirmationHandler is IEspressoConfirmationHandler, Ownable {
    // State variables
    mapping(bytes32 => Confirmation) private confirmations;
    mapping(bytes32 => bool) private isMessageProcessed;
    
    // Additional events for message confirmation and processing
    event MessageConfirmed(bytes32 indexed messageId, bool success);
    event MessageProcessed(bytes32 indexed messageId, address sender, address recipient);

    constructor() Ownable(msg.sender) {}

    function submitConfirmation(bytes32 messageId, bytes32 blockHash) external override {
        require(blockHash != bytes32(0), "Invalid block hash");
        require(confirmations[messageId].blockHash == bytes32(0), "Confirmation already exists");

        confirmations[messageId] = Confirmation({
            blockHash: blockHash,
            timestamp: block.timestamp,
            isValid: false,
            isProcessed: false
        });

        emit ConfirmationReceived(messageId, blockHash);
        
        bool success = validateConfirmation(messageId);
        emit MessageConfirmed(messageId, success);
    }

    function validateConfirmation(bytes32 messageId) public override returns (bool) {
        Confirmation storage confirmation = confirmations[messageId];
        require(confirmation.blockHash != bytes32(0), "Confirmation does not exist");
        require(!confirmation.isValid, "Confirmation already validated");

        // In a real implementation, this would verify the block hash with Espresso Network
        // For now, we'll simulate validation by always returning true
        confirmation.isValid = true;
        
        emit ConfirmationValidated(messageId, true);
        return true;
    }

    function processConfirmation(bytes32 messageId) external override {
        require(!isMessageProcessed[messageId], "Message already processed");
        require(confirmations[messageId].isValid, "Confirmation not validated");

        confirmations[messageId].isProcessed = true;
        isMessageProcessed[messageId] = true;

        emit MessageProcessed(messageId, msg.sender, address(this));
    }

    function getConfirmation(bytes32 messageId) external view override returns (Confirmation memory) {
        return confirmations[messageId];
    }

    function isConfirmationValid(bytes32 messageId) external view override returns (bool) {
        return confirmations[messageId].isValid;
    }
} 