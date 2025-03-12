// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ISwap.sol";
import "./interfaces/IEspressoConfirmationHandler.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Swap is ISwap, Ownable {
    // State variables
    IEspressoConfirmationHandler public espressoHandler;
    mapping(bytes32 => bool) private processedSwaps;
    mapping(address => mapping(address => uint256)) private swapRates; // sourceToken => targetToken => rate
    
    constructor(address _espressoHandler) Ownable(msg.sender) {
        espressoHandler = IEspressoConfirmationHandler(_espressoHandler);
    }

    function initiateSwap(
        address recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 targetAmount,
        uint256 targetChainId
    ) external override returns (bytes32 messageId) {
        require(sourceAmount > 0, "Invalid source amount");
        require(targetAmount > 0, "Invalid target amount");
        require(swapRates[sourceToken][targetToken] > 0, "Swap pair not supported");

        // Transfer tokens from sender
        IERC20(sourceToken).transferFrom(msg.sender, address(this), sourceAmount);

        // Generate message ID
        messageId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            recipient,
            sourceToken,
            targetToken,
            sourceAmount,
            targetAmount,
            targetChainId
        ));

        emit SwapInitiated(
            messageId,
            msg.sender,
            recipient,
            sourceToken,
            targetToken,
            sourceAmount,
            targetAmount
        );
    }

    function executeSwap(
        bytes32 messageId,
        address sender,
        address recipient,
        address sourceToken,
        address targetToken,
        uint256 sourceAmount,
        uint256 targetAmount
    ) external override {
        require(msg.sender == address(espressoHandler), "Only Espresso handler");
        require(!processedSwaps[messageId], "Swap already processed");
        require(IERC20(targetToken).balanceOf(address(this)) >= targetAmount, "Insufficient liquidity");

        processedSwaps[messageId] = true;
        IERC20(targetToken).transfer(recipient, targetAmount);

        emit SwapCompleted(messageId, true);
    }

    // Admin functions
    function setSwapRate(
        address sourceToken,
        address targetToken,
        uint256 rate
    ) external onlyOwner {
        swapRates[sourceToken][targetToken] = rate;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }

    // View functions
    function getSwapRate(address sourceToken, address targetToken) external view override returns (uint256) {
        return swapRates[sourceToken][targetToken];
    }

    function getLiquidity(address token) external view override returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
} 