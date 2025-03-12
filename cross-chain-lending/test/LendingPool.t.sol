// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/LendingPool.sol";
import "../src/interfaces/IEspressoConfirmationHandler.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    function mint(address account, uint256 amount) external {
        _balances[account] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), account, amount);
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(_balances[from] >= amount, "ERC20: transfer amount exceeds balance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = _allowances[owner][spender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        _approve(owner, spender, currentAllowance - amount);
    }
}

contract MockEspressoHandler is IEspressoConfirmationHandler {
    mapping(bytes32 => bool) private _processedMessages;
    mapping(bytes32 => address) private _messageSenders;
    mapping(bytes32 => Confirmation) private _confirmations;

    event MessageConfirmed(bytes32 indexed messageId, bool success);
    event MessageProcessed(bytes32 indexed messageId, address sender, address recipient);

    function submitConfirmation(bytes32 messageId, bytes32 blockHash) external override {
        _confirmations[messageId] = Confirmation(blockHash, block.timestamp, true, false);
        emit ConfirmationReceived(messageId, blockHash);
    }

    function validateConfirmation(bytes32 messageId) external override returns (bool) {
        emit ConfirmationValidated(messageId, true);
        return true;
    }

    function processConfirmation(bytes32 messageId) external override {
        _confirmations[messageId].isProcessed = true;
    }

    function getConfirmation(bytes32 messageId) external view override returns (Confirmation memory) {
        return _confirmations[messageId];
    }

    function isConfirmationValid(bytes32 messageId) external view override returns (bool) {
        return _confirmations[messageId].isValid;
    }

    function confirmMessage(bytes32 messageId, bool success) external {
        emit MessageConfirmed(messageId, success);
    }

    function processMessage(bytes32 messageId, address sender, address recipient, bytes calldata data) external {
        _processedMessages[messageId] = true;
        _messageSenders[messageId] = sender;
        emit MessageProcessed(messageId, sender, recipient);
    }

    function isMessageProcessed(bytes32 messageId) external view returns (bool) {
        return _processedMessages[messageId];
    }

    function getMessageSender(bytes32 messageId) external view returns (address) {
        return _messageSenders[messageId];
    }
}

contract LendingPoolTest is Test {
    LendingPool public pool;
    MockERC20 public token;
    MockEspressoHandler public espressoHandler;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        espressoHandler = new MockEspressoHandler();
        pool = new LendingPool(address(espressoHandler));
        token = new MockERC20();

        // Setup initial balances
        token.mint(alice, 1000 ether);
        token.mint(bob, 1000 ether);
        vm.startPrank(alice);
        token.approve(address(pool), type(uint256).max);
        vm.stopPrank();
        vm.startPrank(bob);
        token.approve(address(pool), type(uint256).max);
        vm.stopPrank();
    }

    function testDeposit() public {
        vm.startPrank(alice);
        uint256 depositAmount = 100 ether;
        pool.deposit(address(token), depositAmount);
        
        assertEq(pool.getUserDeposit(alice, address(token)), depositAmount);
        assertEq(token.balanceOf(address(pool)), depositAmount);
        vm.stopPrank();
    }

    function testBorrow() public {
        vm.startPrank(alice);
        uint256 depositAmount = 100 ether;
        pool.deposit(address(token), depositAmount);
        
        uint256 borrowAmount = 50 ether;
        pool.borrow(address(token), borrowAmount);
        
        assertEq(pool.getUserBorrow(alice, address(token)), borrowAmount);
        assertEq(token.balanceOf(alice), 950 ether);
        vm.stopPrank();
    }

    function testRepay() public {
        vm.startPrank(alice);
        pool.deposit(address(token), 100 ether);
        pool.borrow(address(token), 50 ether);
        pool.repay(address(token), 30 ether);
        
        assertEq(pool.getUserBorrow(alice, address(token)), 20 ether);
        vm.stopPrank();
    }

    function testWithdraw() public {
        vm.startPrank(alice);
        pool.deposit(address(token), 100 ether);
        pool.withdraw(address(token), 50 ether);
        
        assertEq(pool.getUserDeposit(alice, address(token)), 50 ether);
        assertEq(token.balanceOf(alice), 950 ether);
        vm.stopPrank();
    }

    function testCrossChainBorrow() public {
        vm.startPrank(alice);
        pool.deposit(address(token), 100 ether);
        
        bytes32 messageId = pool.initiateCrossChainBorrow(2, address(token), 50 ether);
        vm.stopPrank();
        
        vm.prank(address(espressoHandler));
        pool.handleCrossChainBorrow(messageId, alice, address(token), 50 ether);
        
        assertEq(pool.getUserBorrow(alice, address(token)), 50 ether);
        assertEq(token.balanceOf(alice), 950 ether);
    }
} 