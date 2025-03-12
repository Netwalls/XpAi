// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IEspressoConfirmationHandler.sol";
import "./interfaces/ITransaction.sol";
import "./interfaces/ISwap.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AIAgent is Ownable {
    IEspressoConfirmationHandler public espressoHandler;
    ITransaction public transactionHandler;
    ISwap public swapHandler;
    
    struct AgentTask {
        bytes32 messageId;
        address sourceToken;
        address targetToken;
        uint256 amount;
        uint256 targetChainId;
        bool isSwap;
        bool completed;
    }
    
    mapping(bytes32 => AgentTask) public tasks;
    mapping(address => bool) public authorizedAgents;
    
    event TaskInitiated(bytes32 indexed taskId, address sourceToken, address targetToken, uint256 amount);
    event TaskCompleted(bytes32 indexed taskId, bool success);
    
    constructor(
        address _espressoHandler,
        address _transactionHandler,
        address _swapHandler
    ) Ownable(msg.sender) {
        espressoHandler = IEspressoConfirmationHandler(_espressoHandler);
        transactionHandler = ITransaction(_transactionHandler);
        swapHandler = ISwap(_swapHandler);
    }
    
    function authorizeAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }
    
    function initiateTransfer(
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external returns (bytes32) {
        require(authorizedAgents[msg.sender], "Unauthorized agent");
        
        bytes32 taskId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            recipient,
            token,
            amount,
            targetChainId
        ));
        
        IERC20(token).approve(address(transactionHandler), amount);
        
        bytes32 messageId = transactionHandler.initiateTransaction(
            recipient,
            token,
            amount,
            targetChainId
        );
        
        tasks[taskId] = AgentTask({
            messageId: messageId,
            sourceToken: token,
            targetToken: token,
            amount: amount,
            targetChainId: targetChainId,
            isSwap: false,
            completed: false
        });
        
        emit TaskInitiated(taskId, token, token, amount);
        return taskId;
    }
    
    function initiateSwap(
        address recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 targetAmount,
        uint256 targetChainId
    ) external returns (bytes32) {
        require(authorizedAgents[msg.sender], "Unauthorized agent");
        
        bytes32 taskId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            recipient,
            sourceToken,
            targetToken,
            sourceAmount
        ));
        
        IERC20(sourceToken).approve(address(swapHandler), sourceAmount);
        
        bytes32 messageId = swapHandler.initiateSwap(
            recipient,
            sourceToken,
            targetToken,
            sourceAmount,
            targetAmount,
            targetChainId
        );
        
        tasks[taskId] = AgentTask({
            messageId: messageId,
            sourceToken: sourceToken,
            targetToken: targetToken,
            amount: sourceAmount,
            targetChainId: targetChainId,
            isSwap: true,
            completed: false
        });
        
        emit TaskInitiated(taskId, sourceToken, targetToken, sourceAmount);
        return taskId;
    }
    
    function checkTaskStatus(bytes32 taskId) external view returns (bool completed) {
        return espressoHandler.isConfirmationValid(tasks[taskId].messageId);
    }
    
    function completeTask(bytes32 taskId) external {
        require(authorizedAgents[msg.sender], "Unauthorized agent");
        AgentTask storage task = tasks[taskId];
        require(!task.completed, "Task already completed");
        require(espressoHandler.isConfirmationValid(task.messageId), "Confirmation not received");
        
        task.completed = true;
        emit TaskCompleted(taskId, true);
    }
} 