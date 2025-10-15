// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ParlayStaking
 * @notice Multi-prediction staking with compound multiplier rewards
 * @dev 6% platform fee on gross rewards
 */
contract ParlayStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable ntiqToken;
    address public treasury;
    uint256 public constant PLATFORM_FEE_RATE = 600; // 6% = 600 basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_COINS = 2;
    uint256 public constant MAX_COINS = 10;
    
    // Duration multipliers (basis points)
    uint256 public constant DURATION_1H = 12000; // 1.2x
    uint256 public constant DURATION_6H = 15000; // 1.5x
    uint256 public constant DURATION_24H = 20000; // 2.0x
    uint256 public constant DURATION_7D = 30000; // 3.0x

    struct ParlayStake {
        address user;
        uint256 amount;
        uint8 coinCount;
        uint256 duration; // Duration in seconds (1h, 6h, 24h, 7d)
        uint256 durationMultiplier; // Duration-based multiplier
        uint256 timestamp;
        bool released;
        bool forfeited;
        uint256 rewardAmount;
    }

    mapping(bytes32 => ParlayStake) public parlays;
    mapping(address => uint256) public userTotalStaked;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public totalFeesCollected;

    event ParlayStakeLocked(
        bytes32 indexed parlayId,
        address indexed user,
        uint256 amount,
        uint8 coinCount,
        uint256 timestamp
    );

    event ParlayRewardReleased(
        bytes32 indexed parlayId,
        address indexed user,
        uint256 reward,
        uint256 fee,
        uint256 multiplierBasisPoints
    );

    event ParlayStakeForfeited(
        bytes32 indexed parlayId,
        address indexed user,
        uint256 amount
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
     * @notice Lock NTIQ tokens for a parlay
     * @param parlayId Unique identifier for the parlay
     * @param amount Amount of NTIQ to stake
     * @param coinCount Number of predictions in parlay (2-10)
     * @param duration Duration in seconds (3600=1h, 21600=6h, 86400=24h, 604800=7d)
     */
    function lockParlayStake(
        bytes32 parlayId,
        uint256 amount,
        uint8 coinCount,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        require(coinCount >= MIN_COINS, "Minimum 2 coins required");
        require(coinCount <= MAX_COINS, "Maximum 10 coins allowed");
        require(parlays[parlayId].user == address(0), "Parlay already exists");
        
        // Validate duration and get multiplier
        uint256 durationMultiplier = _getDurationMultiplier(duration);
        require(durationMultiplier > 0, "Invalid duration");

        // Transfer NTIQ from user to contract
        ntiqToken.safeTransferFrom(msg.sender, address(this), amount);

        // Store parlay info
        parlays[parlayId] = ParlayStake({
            user: msg.sender,
            amount: amount,
            coinCount: coinCount,
            duration: duration,
            durationMultiplier: durationMultiplier,
            timestamp: block.timestamp,
            released: false,
            forfeited: false,
            rewardAmount: 0
        });

        userTotalStaked[msg.sender] += amount;
        totalStaked += amount;

        emit ParlayStakeLocked(parlayId, msg.sender, amount, coinCount, block.timestamp);

        return true;
    }

    /**
     * @notice Release compound reward for winning parlay
     * Formula: (1.5 × durationMultiplier)^coinCount
     * @param parlayId Unique identifier for the parlay
     */
    function releaseCompoundReward(
        bytes32 parlayId
    ) external nonReentrant onlyOwner returns (bool) {
        ParlayStake storage parlay = parlays[parlayId];
        
        require(parlay.user != address(0), "Parlay not found");
        require(!parlay.released, "Reward already released");
        require(!parlay.forfeited, "Stake already forfeited");

        // Calculate compound reward: (1.5 × durationMultiplier)^coinCount
        uint256 baseMultiplier = (15000 * parlay.durationMultiplier) / BASIS_POINTS; // 1.5 × durationMultiplier
        uint256 compoundMultiplier = _power(baseMultiplier, parlay.coinCount);
        uint256 grossReward = (parlay.amount * compoundMultiplier) / BASIS_POINTS;
        
        // Apply 6% platform fee
        uint256 platformFee = (grossReward * PLATFORM_FEE_RATE) / BASIS_POINTS;
        uint256 netReward = grossReward - platformFee;

        // Mark as released
        parlay.released = true;
        parlay.rewardAmount = netReward;

        // Transfer reward to user
        ntiqToken.safeTransfer(parlay.user, netReward);

        // Transfer fee to treasury
        ntiqToken.safeTransfer(treasury, platformFee);

        totalRewardsDistributed += netReward;
        totalFeesCollected += platformFee;

        emit ParlayRewardReleased(
            parlayId,
            parlay.user,
            netReward,
            platformFee,
            compoundMultiplier
        );

        return true;
    }

    /**
     * @notice Forfeit stake when any prediction is wrong
     * @param parlayId Unique identifier for the parlay
     */
    function forfeitStake(
        bytes32 parlayId
    ) external nonReentrant onlyOwner returns (bool) {
        ParlayStake storage parlay = parlays[parlayId];
        
        require(parlay.user != address(0), "Parlay not found");
        require(!parlay.released, "Reward already released");
        require(!parlay.forfeited, "Stake already forfeited");

        // Mark as forfeited
        parlay.forfeited = true;

        // Transfer entire stake to treasury
        ntiqToken.safeTransfer(treasury, parlay.amount);
        totalFeesCollected += parlay.amount;

        emit ParlayStakeForfeited(parlayId, parlay.user, parlay.amount);

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
     * @notice Get parlay info
     * @param parlayId Unique identifier for the parlay
     */
    function getParlay(bytes32 parlayId) external view returns (
        address user,
        uint256 amount,
        uint8 coinCount,
        uint256 duration,
        uint256 durationMultiplier,
        uint256 timestamp,
        bool released,
        bool forfeited,
        uint256 rewardAmount
    ) {
        ParlayStake memory parlay = parlays[parlayId];
        return (
            parlay.user,
            parlay.amount,
            parlay.coinCount,
            parlay.duration,
            parlay.durationMultiplier,
            parlay.timestamp,
            parlay.released,
            parlay.forfeited,
            parlay.rewardAmount
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
     * @notice Calculate power for compound multiplier
     * @param base Base number
     * @param exponent Exponent
     * @return result Result of base^exponent
     */
    function _power(uint256 base, uint256 exponent) internal pure returns (uint256 result) {
        result = BASIS_POINTS; // Start with 1 (10000 basis points)
        for (uint256 i = 0; i < exponent; i++) {
            result = (result * base) / BASIS_POINTS;
        }
    }
}
