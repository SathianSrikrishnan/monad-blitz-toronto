// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AgentBudgetRegistry {
    enum SpendDecision {
        Allowed,
        Unauthorized,
        Paused,
        Expired,
        InvalidAmount,
        PerPurchaseLimit,
        TotalBudget
    }

    error ZeroAddress();
    error InvalidPolicy();
    error UnauthorizedWriter();
    error PolicyPaused();
    error PolicyExpired();
    error EmptyBatch();
    error InvalidPurchaseAmount();
    error PurchaseExceedsLimit(uint256 amount, uint256 limit);
    error TotalBudgetExceeded(uint256 requested, uint256 remaining);
    error EmptyReceipt();
    error ReceiptAlreadyRecorded();

    address public immutable owner;
    address public immutable agent;
    uint256 public immutable totalBudget;
    uint256 public immutable perPurchaseLimit;
    uint256 public immutable expiresAt;

    uint256 public spent;
    bool public paused;

    mapping(bytes32 receiptHash => bool recorded) public recordedReceipts;

    event PolicyCreated(
        address indexed owner,
        address indexed agent,
        uint256 totalBudget,
        uint256 perPurchaseLimit,
        uint256 expiresAt
    );
    event PolicyPauseChanged(bool paused);
    event BatchRecorded(
        address indexed agent,
        bytes32 indexed receiptHash,
        uint256 purchaseCount,
        uint256 batchAmount,
        uint256 totalSpent
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert UnauthorizedWriter();
        _;
    }

    constructor(
        address owner_,
        address agent_,
        uint256 totalBudget_,
        uint256 perPurchaseLimit_,
        uint256 expiresAt_
    ) {
        if (owner_ == address(0) || agent_ == address(0)) revert ZeroAddress();
        if (
            totalBudget_ == 0 ||
            perPurchaseLimit_ == 0 ||
            perPurchaseLimit_ > totalBudget_ ||
            expiresAt_ <= block.timestamp
        ) revert InvalidPolicy();

        owner = owner_;
        agent = agent_;
        totalBudget = totalBudget_;
        perPurchaseLimit = perPurchaseLimit_;
        expiresAt = expiresAt_;

        emit PolicyCreated(
            owner_,
            agent_,
            totalBudget_,
            perPurchaseLimit_,
            expiresAt_
        );
    }

    function remainingBudget() external view returns (uint256) {
        return totalBudget - spent;
    }

    function canSpend(
        address spender,
        uint256 amount
    ) external view returns (SpendDecision) {
        if (spender != agent) return SpendDecision.Unauthorized;
        if (paused) return SpendDecision.Paused;
        if (block.timestamp >= expiresAt) return SpendDecision.Expired;
        if (amount == 0) return SpendDecision.InvalidAmount;
        if (amount > perPurchaseLimit) {
            return SpendDecision.PerPurchaseLimit;
        }
        if (amount > totalBudget - spent) return SpendDecision.TotalBudget;
        return SpendDecision.Allowed;
    }

    function setPaused(bool paused_) external onlyOwner {
        paused = paused_;
        emit PolicyPauseChanged(paused_);
    }

    function recordBatch(
        uint256[] calldata amounts,
        bytes32 receiptHash
    ) external {
        if (msg.sender != agent) revert UnauthorizedWriter();
        if (paused) revert PolicyPaused();
        if (block.timestamp >= expiresAt) revert PolicyExpired();
        if (amounts.length == 0) revert EmptyBatch();
        if (receiptHash == bytes32(0)) revert EmptyReceipt();
        if (recordedReceipts[receiptHash]) revert ReceiptAlreadyRecorded();

        uint256 batchAmount;

        for (uint256 index = 0; index < amounts.length; index++) {
            uint256 amount = amounts[index];
            if (amount == 0) revert InvalidPurchaseAmount();
            if (amount > perPurchaseLimit) {
                revert PurchaseExceedsLimit(amount, perPurchaseLimit);
            }
            batchAmount += amount;
        }

        uint256 remaining = totalBudget - spent;
        if (batchAmount > remaining) {
            revert TotalBudgetExceeded(batchAmount, remaining);
        }

        recordedReceipts[receiptHash] = true;
        spent += batchAmount;

        emit BatchRecorded(
            msg.sender,
            receiptHash,
            amounts.length,
            batchAmount,
            spent
        );
    }
}
