// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PredictionBattle
 * @dev Smart contract for cryptocurrency price prediction battles
 * Users stake tokens to make predictions and earn rewards based on accuracy
 */
contract PredictionBattle is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable stakeToken; // NTIQ token
    
    // Prediction structure
    struct Prediction {
        address user;
        string cryptocurrency; // e.g., "bitcoin", "ethereum"
        uint256 predictedPrice; // In wei (18 decimals)
        uint256 stakeAmount;
        uint256 submissionTime;
        uint256 targetTime; // When prediction expires
        uint256 actualPrice; // Final price from oracle
        bool resolved;
        bool claimed;
        uint256 accuracyScore; // 0-10000 (100.00%)
        uint256 rewardAmount;
    }
    
    // Mapping from prediction ID to prediction
    mapping(uint256 => Prediction) public predictions;
    
    // Mapping from user to their prediction IDs
    mapping(address => uint256[]) public userPredictions;
    
    // Mapping from cryptocurrency to active predictions
    mapping(string => uint256[]) public cryptoPredictions;
    
    // Oracle address for price updates
    address public priceOracle;
    
    // Prediction counter
    uint256 public nextPredictionId = 1;
    
    // Constants
    uint256 public constant MIN_STAKE = 1e18; // 1 NTIQ
    uint256 public constant MAX_STAKE = 1000e18; // 1000 NTIQ
    uint256 public constant ACCURACY_PRECISION = 10000; // 100.00%
    uint256 public constant PERFECT_ACCURACY_THRESHOLD = 10; // 0.1%
    
    // Reward multipliers (basis points)
    uint256 public constant PERFECT_MULTIPLIER = 500; // 5x for ±0.1%
    uint256 public constant HIGH_MULTIPLIER = 300; // 3x for ±1%
    uint256 public constant MEDIUM_MULTIPLIER = 200; // 2x for ±5%
    uint256 public constant LOW_MULTIPLIER = 150; // 1.5x for ±10%
    uint256 public constant BASE_MULTIPLIER = 100; // 1x base
    
    // Time durations (in seconds)
    uint256 public constant ONE_HOUR = 3600;
    uint256 public constant SIX_HOURS = 21600;
    uint256 public constant ONE_DAY = 86400;
    uint256 public constant ONE_WEEK = 604800;
    
    // Events
    event PredictionSubmitted(
        uint256 indexed predictionId,
        address indexed user,
        string cryptocurrency,
        uint256 predictedPrice,
        uint256 stakeAmount,
        uint256 targetTime
    );
    
    event PredictionResolved(
        uint256 indexed predictionId,
        uint256 actualPrice,
        uint256 accuracyScore,
        uint256 rewardAmount
    );
    
    event RewardClaimed(
        uint256 indexed predictionId,
        address indexed user,
        uint256 rewardAmount
    );
    
    event PriceOracleUpdated(address indexed newOracle);
    
    constructor(address _stakeToken, address _priceOracle) {
        require(_stakeToken != address(0), "Invalid stake token");
        require(_priceOracle != address(0), "Invalid price oracle");
        
        stakeToken = IERC20(_stakeToken);
        priceOracle = _priceOracle;
    }
    
    /**
     * @dev Submit a price prediction
     * @param _cryptocurrency The cryptocurrency symbol
     * @param _predictedPrice The predicted price in wei
     * @param _stakeAmount Amount of tokens to stake
     * @param _duration Duration of prediction (1h, 6h, 24h, 7d)
     */
    function submitPrediction(
        string memory _cryptocurrency,
        uint256 _predictedPrice,
        uint256 _stakeAmount,
        uint256 _duration
    ) external nonReentrant whenNotPaused {
        require(_stakeAmount >= MIN_STAKE && _stakeAmount <= MAX_STAKE, "Invalid stake amount");
        require(_predictedPrice > 0, "Invalid predicted price");
        require(_isValidDuration(_duration), "Invalid duration");
        require(bytes(_cryptocurrency).length > 0, "Invalid cryptocurrency");
        
        // Transfer stake from user
        require(
            stakeToken.transferFrom(msg.sender, address(this), _stakeAmount),
            "Stake transfer failed"
        );
        
        uint256 predictionId = nextPredictionId++;
        uint256 targetTime = block.timestamp + _duration;
        
        predictions[predictionId] = Prediction({
            user: msg.sender,
            cryptocurrency: _cryptocurrency,
            predictedPrice: _predictedPrice,
            stakeAmount: _stakeAmount,
            submissionTime: block.timestamp,
            targetTime: targetTime,
            actualPrice: 0,
            resolved: false,
            claimed: false,
            accuracyScore: 0,
            rewardAmount: 0
        });
        
        userPredictions[msg.sender].push(predictionId);
        cryptoPredictions[_cryptocurrency].push(predictionId);
        
        emit PredictionSubmitted(
            predictionId,
            msg.sender,
            _cryptocurrency,
            _predictedPrice,
            _stakeAmount,
            targetTime
        );
    }
    
    /**
     * @dev Resolve a prediction with actual price from oracle
     * @param _predictionId The prediction ID to resolve
     * @param _actualPrice The actual price from CoinGecko oracle
     */
    function resolvePrediction(
        uint256 _predictionId,
        uint256 _actualPrice
    ) external {
        require(msg.sender == priceOracle || msg.sender == owner(), "Only oracle or owner");
        require(_actualPrice > 0, "Invalid actual price");
        
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.user != address(0), "Prediction not found");
        require(!prediction.resolved, "Already resolved");
        require(block.timestamp >= prediction.targetTime, "Prediction not expired");
        
        prediction.actualPrice = _actualPrice;
        prediction.resolved = true;
        
        // Calculate accuracy and reward
        (uint256 accuracyScore, uint256 rewardAmount) = _calculateReward(
            prediction.predictedPrice,
            _actualPrice,
            prediction.stakeAmount
        );
        
        prediction.accuracyScore = accuracyScore;
        prediction.rewardAmount = rewardAmount;
        
        emit PredictionResolved(_predictionId, _actualPrice, accuracyScore, rewardAmount);
    }
    
    /**
     * @dev Claim reward for a resolved prediction
     * @param _predictionId The prediction ID to claim reward for
     */
    function claimReward(uint256 _predictionId) external nonReentrant {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.user == msg.sender, "Not your prediction");
        require(prediction.resolved, "Not resolved yet");
        require(!prediction.claimed, "Already claimed");
        
        prediction.claimed = true;
        
        uint256 totalPayout = prediction.rewardAmount;
        
        if (totalPayout > 0) {
            require(
                stakeToken.transfer(msg.sender, totalPayout),
                "Reward transfer failed"
            );
        }
        
        emit RewardClaimed(_predictionId, msg.sender, totalPayout);
    }
    
    /**
     * @dev Calculate accuracy score and reward amount
     * @param _predictedPrice The predicted price
     * @param _actualPrice The actual price
     * @param _stakeAmount The stake amount
     * @return accuracyScore The accuracy score (0-10000)
     * @return rewardAmount The reward amount
     */
    function _calculateReward(
        uint256 _predictedPrice,
        uint256 _actualPrice,
        uint256 _stakeAmount
    ) internal pure returns (uint256 accuracyScore, uint256 rewardAmount) {
        // Calculate percentage difference
        uint256 difference;
        if (_predictedPrice > _actualPrice) {
            difference = _predictedPrice - _actualPrice;
        } else {
            difference = _actualPrice - _predictedPrice;
        }
        
        // Calculate accuracy percentage (inverse of error percentage)
        uint256 errorPercentage = (difference * ACCURACY_PRECISION) / _actualPrice;
        
        if (errorPercentage >= ACCURACY_PRECISION) {
            // More than 100% error, no reward
            return (0, 0);
        }
        
        accuracyScore = ACCURACY_PRECISION - errorPercentage;
        
        // Determine multiplier based on accuracy
        uint256 multiplier;
        if (errorPercentage <= PERFECT_ACCURACY_THRESHOLD) {
            multiplier = PERFECT_MULTIPLIER; // ±0.1% = 5x
        } else if (errorPercentage <= 100) {
            multiplier = HIGH_MULTIPLIER; // ±1% = 3x
        } else if (errorPercentage <= 500) {
            multiplier = MEDIUM_MULTIPLIER; // ±5% = 2x
        } else if (errorPercentage <= 1000) {
            multiplier = LOW_MULTIPLIER; // ±10% = 1.5x
        } else {
            multiplier = BASE_MULTIPLIER; // >10% = 1x (stake back only)
        }
        
        rewardAmount = (_stakeAmount * multiplier) / 100;
    }
    
    /**
     * @dev Check if duration is valid
     */
    function _isValidDuration(uint256 _duration) internal pure returns (bool) {
        return _duration == ONE_HOUR || 
               _duration == SIX_HOURS || 
               _duration == ONE_DAY || 
               _duration == ONE_WEEK;
    }
    
    /**
     * @dev Get user's predictions
     */
    function getUserPredictions(address _user) external view returns (uint256[] memory) {
        return userPredictions[_user];
    }
    
    /**
     * @dev Get active predictions for a cryptocurrency
     */
    function getCryptoPredictions(string memory _crypto) external view returns (uint256[] memory) {
        return cryptoPredictions[_crypto];
    }
    
    /**
     * @dev Get prediction details
     */
    function getPrediction(uint256 _predictionId) external view returns (
        address user,
        string memory cryptocurrency,
        uint256 predictedPrice,
        uint256 stakeAmount,
        uint256 submissionTime,
        uint256 targetTime,
        uint256 actualPrice,
        bool resolved,
        bool claimed,
        uint256 accuracyScore,
        uint256 rewardAmount
    ) {
        Prediction memory prediction = predictions[_predictionId];
        return (
            prediction.user,
            prediction.cryptocurrency,
            prediction.predictedPrice,
            prediction.stakeAmount,
            prediction.submissionTime,
            prediction.targetTime,
            prediction.actualPrice,
            prediction.resolved,
            prediction.claimed,
            prediction.accuracyScore,
            prediction.rewardAmount
        );
    }
    
    /**
     * @dev Get expired predictions that need resolution
     */
    function getExpiredPredictions(string memory _cryptocurrency) external view returns (uint256[] memory) {
        uint256[] memory cryptoPreds = cryptoPredictions[_cryptocurrency];
        uint256 count = 0;
        
        // Count expired predictions
        for (uint256 i = 0; i < cryptoPreds.length; i++) {
            Prediction memory prediction = predictions[cryptoPreds[i]];
            if (!prediction.resolved && block.timestamp >= prediction.targetTime) {
                count++;
            }
        }
        
        // Create array of expired prediction IDs
        uint256[] memory expired = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < cryptoPreds.length; i++) {
            Prediction memory prediction = predictions[cryptoPreds[i]];
            if (!prediction.resolved && block.timestamp >= prediction.targetTime) {
                expired[index] = cryptoPreds[i];
                index++;
            }
        }
        
        return expired;
    }
    
    /**
     * @dev Batch resolve multiple predictions
     */
    function batchResolvePredictions(
        uint256[] memory _predictionIds,
        uint256[] memory _actualPrices
    ) external {
        require(msg.sender == priceOracle || msg.sender == owner(), "Only oracle or owner");
        require(_predictionIds.length == _actualPrices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _predictionIds.length; i++) {
            if (_actualPrices[i] > 0) {
                resolvePrediction(_predictionIds[i], _actualPrices[i]);
            }
        }
    }
    
    /**
     * @dev Update price oracle address
     */
    function updatePriceOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        priceOracle = _newOracle;
        emit PriceOracleUpdated(_newOracle);
    }
    
    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(0), "Invalid token");
        IERC20(_token).transfer(owner(), _amount);
    }
    
    /**
     * @dev Pause/unpause contract
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalPredictions,
        uint256 totalStaked,
        uint256 totalRewardsPaid
    ) {
        totalPredictions = nextPredictionId - 1;
        
        // Calculate total staked and rewards paid
        for (uint256 i = 1; i < nextPredictionId; i++) {
            Prediction memory prediction = predictions[i];
            totalStaked += prediction.stakeAmount;
            if (prediction.claimed) {
                totalRewardsPaid += prediction.rewardAmount;
            }
        }
        
        return (totalPredictions, totalStaked, totalRewardsPaid);
    }
}