// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionStaking
 * @notice Handles prediction stakes with accuracy-based reward multipliers
 * @dev Supports multipliers: 0.9x, 1.5x, 2.0x, 3.0x with 4% platform fee on wins
 * @dev Includes duration-based multipliers and oracle integration
 */
contract PredictionStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable ntiqToken;
    address public treasury;
    address public oracle;
    
    uint256 public constant PLATFORM_FEE_RATE = 400; // 4% = 400 basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_STAKE = 50 ether; // 50 NTIQ
    uint256 public constant MAX_STAKE = 10000 ether; // 10,000 NTIQ
    
    // Duration multipliers (basis points)
    uint256 public constant DURATION_1H = 12000; // 1.2x
    uint256 public constant DURATION_6H = 15000; // 1.5x
    uint256 public constant DURATION_24H = 20000; // 2.0x
    uint256 public constant DURATION_7D = 30000; // 3.0x
    
    // Accuracy thresholds (basis points)
    uint256 public constant ACCURACY_99_5 = 9950; // ≥99.5%
    uint256 public constant ACCURACY_98 = 9800;   // ≥98%
    uint256 public constant ACCURACY_95 = 9500;   // ≥95%
    uint256 public constant ACCURACY_90 = 9000;   // ≥90%

    struct PredictionStake {
        address user;
        uint256 amount;
        uint256 timestamp;
        uint256 duration; // Duration in seconds (1h, 6h, 24h, 7d)
        uint256 predictedPrice;
        uint256 actualPrice;
        uint256 accuracy; // Accuracy in basis points
        bool released;
        bool forfeited;
        uint256 rewardAmount;
        uint256 durationMultiplier; // Duration-based multiplier
    }

    mapping(bytes32 => PredictionStake) public stakes;
    mapping(address => uint256) public userTotalStaked;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public totalFeesCollected;

    event StakeLocked(
        bytes32 indexed predictionId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event RewardReleased(
        bytes32 indexed predictionId,
        address indexed user,
        uint256 reward,
        uint256 fee,
        uint256 multiplierBasisPoints
    );

    event StakeForfeited(
        bytes32 indexed predictionId,
        address indexed user,
        uint256 amount
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(
        address _ntiqToken,
        address _treasury,
        address _oracle
    ) Ownable(msg.sender) {
        require(_ntiqToken != address(0), "Invalid NTIQ token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_oracle != address(0), "Invalid oracle address");
        
        ntiqToken = IERC20(_ntiqToken);
        treasury = _treasury;
        oracle = _oracle;
    }

    /**
     * @notice Lock NTIQ tokens for a prediction
     * @param predictionId Unique identifier for the prediction
     * @param amount Amount of NTIQ to stake (must be between 50-10,000)
     * @param duration Duration in seconds (3600=1h, 21600=6h, 86400=24h, 604800=7d)
     * @param predictedPrice The predicted price
     */
    function lockStake(
        bytes32 predictionId,
        uint256 amount,
        uint256 duration,
        uint256 predictedPrice
    ) external nonReentrant whenNotPaused returns (bool) {
        require(amount >= MIN_STAKE, "Stake below minimum");
        require(amount <= MAX_STAKE, "Stake above maximum");
        require(stakes[predictionId].user == address(0), "Prediction already staked");
        require(predictedPrice > 0, "Invalid predicted price");
        
        // Validate duration and get multiplier
        uint256 durationMultiplier = _getDurationMultiplier(duration);
        require(durationMultiplier > 0, "Invalid duration");

        // Transfer NTIQ from user to contract
        ntiqToken.safeTransferFrom(msg.sender, address(this), amount);

        // Store stake info
        stakes[predictionId] = PredictionStake({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            duration: duration,
            predictedPrice: predictedPrice,
            actualPrice: 0,
            accuracy: 0,
            released: false,
            forfeited: false,
            rewardAmount: 0,
            durationMultiplier: durationMultiplier
        });

        userTotalStaked[msg.sender] += amount;
        totalStaked += amount;

        emit StakeLocked(predictionId, msg.sender, amount, block.timestamp);

        return true;
    }

    /**
     * @notice Release reward based on actual price and accuracy
     * @param predictionId Unique identifier for the prediction
     * @param actualPrice The actual price at prediction end time
     */
    function releaseReward(
        bytes32 predictionId,
        uint256 actualPrice
    ) external nonReentrant onlyOwner returns (bool) {
        PredictionStake storage stake = stakes[predictionId];
        
        require(stake.user != address(0), "Prediction not found");
        require(!stake.released, "Reward already released");
        require(!stake.forfeited, "Stake already forfeited");
        require(actualPrice > 0, "Invalid actual price");

        // Update stake with actual price
        stake.actualPrice = actualPrice;
        
        // Calculate accuracy
        uint256 accuracy = _calculateAccuracy(stake.predictedPrice, actualPrice);
        stake.accuracy = accuracy;
        
        // Determine multiplier based on accuracy
        uint256 multiplierBasisPoints = _getAccuracyMultiplier(accuracy);
        
        // Calculate gross reward with duration multiplier
        uint256 baseReward = (stake.amount * multiplierBasisPoints) / BASIS_POINTS;
        uint256 grossReward = (baseReward * stake.durationMultiplier) / BASIS_POINTS;
        
        uint256 platformFee = 0;
        uint256 netReward = grossReward;

        // Apply 4% platform fee only for winning predictions (1.5x, 2.0x, 3.0x)
        if (multiplierBasisPoints >= 1500) {
            platformFee = (grossReward * PLATFORM_FEE_RATE) / BASIS_POINTS;
            netReward = grossReward - platformFee;
        }

        // Mark as released
        stake.released = true;
        stake.rewardAmount = netReward;

        // Transfer reward to user
        ntiqToken.safeTransfer(stake.user, netReward);

        // Transfer fee to treasury if applicable
        if (platformFee > 0) {
            ntiqToken.safeTransfer(treasury, platformFee);
            totalFeesCollected += platformFee;
        }

        totalRewardsDistributed += netReward;

        emit RewardReleased(
            predictionId,
            stake.user,
            netReward,
            platformFee,
            multiplierBasisPoints
        );

        return true;
    }

    /**
     * @notice Forfeit stake when accuracy < 90%
     * @param predictionId Unique identifier for the prediction
     */
    function forfeitStake(
        bytes32 predictionId
    ) external nonReentrant onlyOwner returns (bool) {
        PredictionStake storage stake = stakes[predictionId];
        
        require(stake.user != address(0), "Prediction not found");
        require(!stake.released, "Reward already released");
        require(!stake.forfeited, "Stake already forfeited");

        // Mark as forfeited
        stake.forfeited = true;

        // Transfer entire stake to treasury
        ntiqToken.safeTransfer(treasury, stake.amount);
        totalFeesCollected += stake.amount;

        emit StakeForfeited(predictionId, stake.user, stake.amount);

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
     * @notice Get stake info
     * @param predictionId Unique identifier for the prediction
     */
    function getStake(bytes32 predictionId) external view returns (
        address user,
        uint256 amount,
        uint256 timestamp,
        uint256 duration,
        uint256 predictedPrice,
        uint256 actualPrice,
        uint256 accuracy,
        uint256 durationMultiplier,
        bool released,
        bool forfeited,
        uint256 rewardAmount
    ) {
        PredictionStake memory stake = stakes[predictionId];
        return (
            stake.user,
            stake.amount,
            stake.timestamp,
            stake.duration,
            stake.predictedPrice,
            stake.actualPrice,
            stake.accuracy,
            stake.durationMultiplier,
            stake.released,
            stake.forfeited,
            stake.rewardAmount
        );
    }

    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewardsDistributed,
        uint256 _totalFeesCollected
    ) {
        return (totalStaked, totalRewardsDistributed, totalFeesCollected);
    }
    
    /**
     * @notice Update oracle address
     * @param newOracle New oracle address
     */
    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        oracle = newOracle;
    }
    
    /**
     * @notice Get duration multiplier for given duration
     * @param duration Duration in seconds
     * @return multiplier Duration multiplier in basis points
     */
    function _getDurationMultiplier(uint256 duration) internal pure returns (uint256 multiplier) {
        if (duration == 3600) { // 1 hour
            return DURATION_1H;
        } else if (duration == 21600) { // 6 hours
            return DURATION_6H;
        } else if (duration == 86400) { // 24 hours
            return DURATION_24H;
        } else if (duration == 604800) { // 7 days
            return DURATION_7D;
        } else {
            return 0; // Invalid duration
        }
    }
    
    /**
     * @notice Calculate accuracy between predicted and actual price
     * @param predictedPrice The predicted price
     * @param actualPrice The actual price
     * @return accuracy Accuracy in basis points (10000 = 100%)
     */
    function _calculateAccuracy(uint256 predictedPrice, uint256 actualPrice) internal pure returns (uint256 accuracy) {
        if (actualPrice == 0) return 0;
        
        uint256 difference = predictedPrice > actualPrice ? 
            predictedPrice - actualPrice : 
            actualPrice - predictedPrice;
        
        uint256 errorPercentage = (difference * BASIS_POINTS) / actualPrice;
        return BASIS_POINTS - errorPercentage;
    }
    
    /**
     * @notice Get multiplier based on accuracy
     * @param accuracy Accuracy in basis points
     * @return multiplier Multiplier in basis points
     */
    function _getAccuracyMultiplier(uint256 accuracy) internal pure returns (uint256 multiplier) {
        if (accuracy >= ACCURACY_99_5) {
            return 30000; // 3.0x
        } else if (accuracy >= ACCURACY_98) {
            return 20000; // 2.0x
        } else if (accuracy >= ACCURACY_95) {
            return 15000; // 1.5x
        } else if (accuracy >= ACCURACY_90) {
            return 9000; // 0.9x
        } else {
            return 0; // Forfeit
        }
    }
}
