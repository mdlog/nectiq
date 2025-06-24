// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Simple ERC20 Token without external dependencies
contract SimpleNTIQ {
    string public name = "Nectiq Token";
    string public symbol = "NTIQ";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000000 * 10**18; // 1 billion tokens
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) external returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}

// Simple Price Oracle
contract SimplePriceOracle {
    mapping(string => uint256) public prices;
    mapping(string => uint256) public lastUpdated;
    mapping(address => bool) public authorizedFeeders;
    
    address public owner;
    
    event PriceUpdated(string indexed cryptocurrency, uint256 price, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedFeeders[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedFeeders[msg.sender] = true;
    }
    
    function updatePrice(string memory _cryptocurrency, uint256 _price) external onlyAuthorized {
        require(_price > 0, "Invalid price");
        prices[_cryptocurrency] = _price;
        lastUpdated[_cryptocurrency] = block.timestamp;
        emit PriceUpdated(_cryptocurrency, _price, block.timestamp);
    }
    
    function getPrice(string memory _cryptocurrency) external view returns (uint256, uint256) {
        return (prices[_cryptocurrency], lastUpdated[_cryptocurrency]);
    }
    
    function setAuthorizedFeeder(address _feeder, bool _authorized) external onlyOwner {
        authorizedFeeders[_feeder] = _authorized;
    }
}

// Simplified Prediction Battle Contract
contract SimplePredictionBattle {
    SimpleNTIQ public stakeToken;
    SimplePriceOracle public priceOracle;
    
    struct Prediction {
        address user;
        string cryptocurrency;
        uint256 predictedPrice;
        uint256 stakeAmount;
        uint256 submissionTime;
        uint256 targetTime;
        uint256 actualPrice;
        bool resolved;
        bool claimed;
        uint256 accuracyScore;
        uint256 rewardAmount;
    }
    
    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256[]) public userPredictions;
    
    uint256 public nextPredictionId = 1;
    address public owner;
    bool public paused = false;
    
    // Constants
    uint256 public constant MIN_STAKE = 1e18; // 1 NTIQ
    uint256 public constant MAX_STAKE = 1000e18; // 1000 NTIQ
    uint256 public constant ACCURACY_PRECISION = 10000; // 100.00%
    uint256 public constant ONE_HOUR = 3600;
    uint256 public constant ONE_DAY = 86400;
    
    // Reward multipliers
    uint256 public constant PERFECT_MULTIPLIER = 500; // 5x
    uint256 public constant HIGH_MULTIPLIER = 300; // 3x
    uint256 public constant MEDIUM_MULTIPLIER = 200; // 2x
    uint256 public constant LOW_MULTIPLIER = 150; // 1.5x
    uint256 public constant BASE_MULTIPLIER = 100; // 1x
    
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
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier notPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    modifier nonReentrant() {
        // Simple reentrancy guard
        _;
    }
    
    constructor(address _stakeToken, address _priceOracle) {
        owner = msg.sender;
        stakeToken = SimpleNTIQ(_stakeToken);
        priceOracle = SimplePriceOracle(_priceOracle);
    }
    
    function submitPrediction(
        string memory _cryptocurrency,
        uint256 _predictedPrice,
        uint256 _stakeAmount,
        uint256 _duration
    ) external nonReentrant notPaused {
        require(_stakeAmount >= MIN_STAKE && _stakeAmount <= MAX_STAKE, "Invalid stake amount");
        require(_predictedPrice > 0, "Invalid predicted price");
        require(_duration == ONE_HOUR || _duration == ONE_DAY, "Invalid duration");
        require(bytes(_cryptocurrency).length > 0, "Invalid cryptocurrency");
        
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
        
        emit PredictionSubmitted(
            predictionId,
            msg.sender,
            _cryptocurrency,
            _predictedPrice,
            _stakeAmount,
            targetTime
        );
    }
    
    function resolvePrediction(
        uint256 _predictionId,
        uint256 _actualPrice
    ) external {
        require(msg.sender == address(priceOracle) || msg.sender == owner, "Only oracle or owner");
        require(_actualPrice > 0, "Invalid actual price");
        
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.user != address(0), "Prediction not found");
        require(!prediction.resolved, "Already resolved");
        require(block.timestamp >= prediction.targetTime, "Prediction not expired");
        
        prediction.actualPrice = _actualPrice;
        prediction.resolved = true;
        
        (uint256 accuracyScore, uint256 rewardAmount) = _calculateReward(
            prediction.predictedPrice,
            _actualPrice,
            prediction.stakeAmount
        );
        
        prediction.accuracyScore = accuracyScore;
        prediction.rewardAmount = rewardAmount;
        
        emit PredictionResolved(_predictionId, _actualPrice, accuracyScore, rewardAmount);
    }
    
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
    
    function _calculateReward(
        uint256 _predictedPrice,
        uint256 _actualPrice,
        uint256 _stakeAmount
    ) internal pure returns (uint256 accuracyScore, uint256 rewardAmount) {
        uint256 difference;
        if (_predictedPrice > _actualPrice) {
            difference = _predictedPrice - _actualPrice;
        } else {
            difference = _actualPrice - _predictedPrice;
        }
        
        uint256 errorPercentage = (difference * ACCURACY_PRECISION) / _actualPrice;
        
        if (errorPercentage >= ACCURACY_PRECISION) {
            return (0, 0);
        }
        
        accuracyScore = ACCURACY_PRECISION - errorPercentage;
        
        uint256 multiplier;
        if (errorPercentage <= 10) { // ±0.1%
            multiplier = PERFECT_MULTIPLIER;
        } else if (errorPercentage <= 100) { // ±1%
            multiplier = HIGH_MULTIPLIER;
        } else if (errorPercentage <= 500) { // ±5%
            multiplier = MEDIUM_MULTIPLIER;
        } else if (errorPercentage <= 1000) { // ±10%
            multiplier = LOW_MULTIPLIER;
        } else {
            multiplier = BASE_MULTIPLIER;
        }
        
        rewardAmount = (_stakeAmount * multiplier) / 100;
    }
    
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
    
    function getUserPredictions(address _user) external view returns (uint256[] memory) {
        return userPredictions[_user];
    }
    
    function getStats() external view returns (
        uint256 totalPredictions,
        uint256 totalStaked,
        uint256 totalRewardsPaid
    ) {
        totalPredictions = nextPredictionId - 1;
        
        for (uint256 i = 1; i < nextPredictionId; i++) {
            Prediction memory prediction = predictions[i];
            totalStaked += prediction.stakeAmount;
            if (prediction.claimed) {
                totalRewardsPaid += prediction.rewardAmount;
            }
        }
        
        return (totalPredictions, totalStaked, totalRewardsPaid);
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
}