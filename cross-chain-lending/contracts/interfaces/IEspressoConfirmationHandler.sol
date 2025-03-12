// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEspressoConfirmationHandler {
    // Events
    event ConfirmationReceived(bytes32 indexed messageId, bytes32 indexed blockHash);
    event ConfirmationValidated(bytes32 indexed messageId, bool success);

    // Structs
    struct Confirmation {
        bytes32 blockHash;
        uint256 timestamp;
        bool isValid;
        bool isProcessed;
    }

    // Core functions
    function submitConfirmation(bytes32 messageId, bytes32 blockHash) external;
    function validateConfirmation(bytes32 messageId) external returns (bool);
    function processConfirmation(bytes32 messageId) external;
    
    // View functions
    function getConfirmation(bytes32 messageId) external view returns (Confirmation memory);
    function isConfirmationValid(bytes32 messageId) external view returns (bool);
} 