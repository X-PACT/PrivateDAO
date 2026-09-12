// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface PrivateDaoTokenTreasuryIERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract PrivateDaoTokenTreasury {
    enum PaymentStatus { None, Pending, Approved, Executed, Cancelled }

    struct Payment {
        address recipient;
        uint256 amount;
        bytes32 budgetId;
        PaymentStatus status;
        uint64 createdAt;
        uint64 approvedAt;
        uint64 executedAt;
    }

    address public immutable owner;
    address public immutable token;
    address public maker;
    address public checker;
    mapping(bytes32 => uint256) public budgetRemaining;
    mapping(bytes32 => Payment) public payments;
    uint256 private locked;

    event Deposited(address indexed sender, uint256 amount);
    event BudgetConfigured(bytes32 indexed budgetId, uint256 amount);
    event PaymentRequested(bytes32 indexed paymentId, bytes32 indexed budgetId, address indexed recipient, uint256 amount);
    event PaymentApproved(bytes32 indexed paymentId, address indexed checker);
    event PaymentExecuted(bytes32 indexed paymentId, address indexed recipient, uint256 amount);
    event PaymentCancelled(bytes32 indexed paymentId);

    error NotOwner();
    error NotMaker();
    error NotChecker();
    error InvalidRole();
    error InvalidAmount();
    error UnknownPayment();
    error InvalidPaymentStatus();
    error BudgetExceeded();
    error InsufficientTreasury();
    error TransferFailed();
    error Reentrancy();

    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier onlyMaker() { if (msg.sender != maker) revert NotMaker(); _; }
    modifier onlyChecker() { if (msg.sender != checker) revert NotChecker(); _; }
    modifier nonReentrant() { if (locked == 1) revert Reentrancy(); locked = 1; _; locked = 0; }

    constructor(address checkerAddress, address tokenAddress) {
        if (checkerAddress == address(0) || checkerAddress == msg.sender || tokenAddress == address(0)) revert InvalidRole();
        owner = msg.sender;
        maker = msg.sender;
        checker = checkerAddress;
        token = tokenAddress;
    }

    function deposit(uint256 amount) external {
        if (amount == 0 || !PrivateDaoTokenTreasuryIERC20(token).transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        emit Deposited(msg.sender, amount);
    }

    function setRoles(address makerAddress, address checkerAddress) external onlyOwner {
        if (makerAddress == address(0) || checkerAddress == address(0) || makerAddress == checkerAddress) revert InvalidRole();
        maker = makerAddress;
        checker = checkerAddress;
    }

    function configureBudget(bytes32 budgetId, uint256 amount) external onlyOwner {
        if (budgetId == bytes32(0)) revert InvalidAmount();
        budgetRemaining[budgetId] = amount;
        emit BudgetConfigured(budgetId, amount);
    }

    function requestPayment(bytes32 paymentId, bytes32 budgetId, address recipient, uint256 amount) external onlyMaker {
        if (paymentId == bytes32(0) || recipient == address(0) || amount == 0) revert InvalidAmount();
        if (payments[paymentId].status != PaymentStatus.None) revert InvalidPaymentStatus();
        if (budgetRemaining[budgetId] < amount) revert BudgetExceeded();
        budgetRemaining[budgetId] -= amount;
        payments[paymentId] = Payment({ recipient: recipient, amount: amount, budgetId: budgetId, status: PaymentStatus.Pending, createdAt: uint64(block.timestamp), approvedAt: 0, executedAt: 0 });
        emit PaymentRequested(paymentId, budgetId, recipient, amount);
    }

    function approvePayment(bytes32 paymentId) external onlyChecker {
        Payment storage payment = payments[paymentId];
        if (payment.status == PaymentStatus.None) revert UnknownPayment();
        if (payment.status != PaymentStatus.Pending) revert InvalidPaymentStatus();
        payment.status = PaymentStatus.Approved;
        payment.approvedAt = uint64(block.timestamp);
        emit PaymentApproved(paymentId, msg.sender);
    }

    function cancelPayment(bytes32 paymentId) external onlyMaker {
        Payment storage payment = payments[paymentId];
        if (payment.status == PaymentStatus.None) revert UnknownPayment();
        if (payment.status != PaymentStatus.Pending) revert InvalidPaymentStatus();
        payment.status = PaymentStatus.Cancelled;
        budgetRemaining[payment.budgetId] += payment.amount;
        emit PaymentCancelled(paymentId);
    }

    function executePayment(bytes32 paymentId) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        if (payment.status == PaymentStatus.None) revert UnknownPayment();
        if (payment.status != PaymentStatus.Approved) revert InvalidPaymentStatus();
        if (PrivateDaoTokenTreasuryIERC20(token).balanceOf(address(this)) < payment.amount) revert InsufficientTreasury();
        payment.status = PaymentStatus.Executed;
        payment.executedAt = uint64(block.timestamp);
        if (!PrivateDaoTokenTreasuryIERC20(token).transfer(payment.recipient, payment.amount)) revert TransferFailed();
        emit PaymentExecuted(paymentId, payment.recipient, payment.amount);
    }
}
