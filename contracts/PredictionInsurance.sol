// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionInsurance
 * @notice Handles prediction insurance with 10% cost and 50% refund mechanism
 * @dev Users can buy insurance for their predictions to get partial refunds on losses
 */
contract PredictionInsurance is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable ntiqToken;
    address public treasury;
    
    uint256 public constant INSURANCE_COST_RATE = 1000; // 10% = 1000 basis points
    uint256 public constant REFUND_RATE = 5000; // 50% = 5000 basis points
    uint256 public constant BASIS_POINTS = 10000;

    struct InsurancePolicy {
        address user;
        bytes32 predictionId;
        uint256 stakeAmount;
        uint256 insuranceCost;
        uint256 timestamp;
        bool claimed;
        bool active;
    }

    mapping(bytes32 => InsurancePolicy) public policies;
    mapping(address => uint256) public userTotalInsured;
    uint256 public totalInsuranceCost;
    uint256 public totalRefundsPaid;

    event InsurancePurchased(
        bytes32 indexed policyId,
        bytes32 indexed predictionId,
        address indexed user,
        uint256 stakeAmount,
        uint256 insuranceCost,
        uint256 timestamp
    );

    event InsuranceClaimed(
        bytes32 indexed policyId,
        address indexed user,
        uint256 refundAmount,
        uint256 timestamp
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(
        address _ntiqToken,
        address _treasury
    ) Ownable(msg.sender) {
        require(_ntiqToken != address(0), "Invalid NTIQ token address");
        require(_treasury != address(0), "Invalid treasury address");
        
        ntiqToken = IERC20(_ntiqToken);
        treasury = _treasury;
    }

    /**
     * @notice Buy insurance for a prediction
     * @param policyId Unique identifier for the insurance policy
     * @param predictionId Unique identifier for the prediction being insured
     * @param stakeAmount Amount of NTIQ staked in the prediction
     */
    function buyInsurance(
        bytes32 policyId,
        bytes32 predictionId,
        uint256 stakeAmount
    ) external nonReentrant whenNotPaused returns (bool) {
        require(stakeAmount > 0, "Invalid stake amount");
        require(policies[policyId].user == address(0), "Policy already exists");
        require(policies[policyId].active == false, "Policy already active");

        // Calculate insurance cost (10% of stake amount)
        uint256 insuranceCost = (stakeAmount * INSURANCE_COST_RATE) / BASIS_POINTS;

        // Transfer insurance cost from user to contract
        ntiqToken.safeTransferFrom(msg.sender, address(this), insuranceCost);

        // Create insurance policy
        policies[policyId] = InsurancePolicy({
            user: msg.sender,
            predictionId: predictionId,
            stakeAmount: stakeAmount,
            insuranceCost: insuranceCost,
            timestamp: block.timestamp,
            claimed: false,
            active: true
        });

        userTotalInsured[msg.sender] += stakeAmount;
        totalInsuranceCost += insuranceCost;

        emit InsurancePurchased(
            policyId,
            predictionId,
            msg.sender,
            stakeAmount,
            insuranceCost,
            block.timestamp
        );

        return true;
    }

    /**
     * @notice Claim insurance refund (50% of original stake)
     * @param policyId Unique identifier for the insurance policy
     */
    function claimInsurance(
        bytes32 policyId
    ) external nonReentrant whenNotPaused returns (bool) {
        InsurancePolicy storage policy = policies[policyId];
        
        require(policy.user == msg.sender, "Not policy owner");
        require(policy.active, "Policy not active");
        require(!policy.claimed, "Already claimed");

        // Calculate refund amount (50% of original stake)
        uint256 refundAmount = (policy.stakeAmount * REFUND_RATE) / BASIS_POINTS;

        // Mark as claimed
        policy.claimed = true;
        policy.active = false;

        // Transfer refund to user
        ntiqToken.safeTransfer(msg.sender, refundAmount);

        totalRefundsPaid += refundAmount;

        emit InsuranceClaimed(
            policyId,
            msg.sender,
            refundAmount,
            block.timestamp
        );

        return true;
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Withdraw collected insurance costs to treasury
     */
    function withdrawInsuranceCosts() external onlyOwner nonReentrant {
        uint256 balance = ntiqToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");

        ntiqToken.safeTransfer(treasury, balance);
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get insurance policy info
     * @param policyId Unique identifier for the insurance policy
     */
    function getPolicy(bytes32 policyId) external view returns (
        address user,
        bytes32 predictionId,
        uint256 stakeAmount,
        uint256 insuranceCost,
        uint256 timestamp,
        bool claimed,
        bool active
    ) {
        InsurancePolicy memory policy = policies[policyId];
        return (
            policy.user,
            policy.predictionId,
            policy.stakeAmount,
            policy.insuranceCost,
            policy.timestamp,
            policy.claimed,
            policy.active
        );
    }

    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalInsuranceCost,
        uint256 _totalRefundsPaid
    ) {
        return (totalInsuranceCost, totalRefundsPaid);
    }
}
