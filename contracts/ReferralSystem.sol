// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReferralSystem
 * @notice Handles referral rewards with 10% bonus for referrers
 * @dev Users can refer others and earn rewards when referees participate in platform activities
 */
contract ReferralSystem is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable ntiqToken;
    address public treasury;
    
    uint256 public constant REFERRAL_BONUS_RATE = 1000; // 10% = 1000 basis points
    uint256 public constant BASIS_POINTS = 10000;

    struct ReferralData {
        address referrer;
        address referee;
        uint256 timestamp;
        bool active;
        uint256 totalEarnings;
        uint256 totalActivities;
    }

    mapping(address => address) public userReferrers; // referee => referrer
    mapping(address => address[]) public referrerReferees; // referrer => referees[]
    mapping(address => ReferralData) public referralData;
    mapping(address => uint256) public userTotalReferralEarnings;
    
    uint256 public totalReferralRewards;
    uint256 public totalReferrals;

    event ReferralRegistered(
        address indexed referrer,
        address indexed referee,
        uint256 timestamp
    );

    event ReferralRewardDistributed(
        address indexed referrer,
        address indexed referee,
        uint256 activityAmount,
        uint256 rewardAmount,
        string activityType
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
     * @notice Register a referral relationship
     * @param referrer Address of the referrer
     * @param referee Address of the referee (new user)
     */
    function registerReferral(
        address referrer,
        address referee
    ) external onlyOwner nonReentrant returns (bool) {
        require(referrer != address(0), "Invalid referrer address");
        require(referee != address(0), "Invalid referee address");
        require(referrer != referee, "Cannot refer yourself");
        require(userReferrers[referee] == address(0), "Already referred");

        // Register referral relationship
        userReferrers[referee] = referrer;
        referrerReferees[referrer].push(referee);

        // Create referral data
        referralData[referee] = ReferralData({
            referrer: referrer,
            referee: referee,
            timestamp: block.timestamp,
            active: true,
            totalEarnings: 0,
            totalActivities: 0
        });

        totalReferrals++;

        emit ReferralRegistered(referrer, referee, block.timestamp);

        return true;
    }

    /**
     * @notice Distribute referral reward
     * @param referee Address of the referee who performed an activity
     * @param activityAmount Amount involved in the activity
     * @param activityType Type of activity (prediction, battle, parlay, tournament)
     */
    function distributeReferralReward(
        address referee,
        uint256 activityAmount,
        string memory activityType
    ) external onlyOwner nonReentrant returns (bool) {
        address referrer = userReferrers[referee];
        require(referrer != address(0), "No referrer found");
        require(referralData[referee].active, "Referral not active");
        require(activityAmount > 0, "Invalid activity amount");

        // Calculate referral reward (10% of activity amount)
        uint256 rewardAmount = (activityAmount * REFERRAL_BONUS_RATE) / BASIS_POINTS;

        // Update referral data
        referralData[referee].totalEarnings += rewardAmount;
        referralData[referee].totalActivities++;

        // Update user total earnings
        userTotalReferralEarnings[referrer] += rewardAmount;

        // Transfer reward to referrer
        ntiqToken.safeTransfer(referrer, rewardAmount);

        totalReferralRewards += rewardAmount;

        emit ReferralRewardDistributed(
            referrer,
            referee,
            activityAmount,
            rewardAmount,
            activityType
        );

        return true;
    }

    /**
     * @notice Batch distribute referral rewards
     * @param referees Array of referee addresses
     * @param activityAmounts Array of activity amounts
     * @param activityTypes Array of activity types
     */
    function batchDistributeReferralRewards(
        address[] calldata referees,
        uint256[] calldata activityAmounts,
        string[] calldata activityTypes
    ) external onlyOwner nonReentrant returns (bool) {
        require(referees.length == activityAmounts.length && activityAmounts.length == activityTypes.length, "Array length mismatch");

        for (uint256 i = 0; i < referees.length; i++) {
            _distributeReferralReward(referees[i], activityAmounts[i], activityTypes[i]);
        }

        return true;
    }

    /**
     * @notice Internal function to distribute referral reward
     * @param referee Address of the referee who performed an activity
     * @param activityAmount Amount involved in the activity
     * @param activityType Type of activity (prediction, battle, parlay, tournament)
     */
    function _distributeReferralReward(
        address referee,
        uint256 activityAmount,
        string memory activityType
    ) internal returns (bool) {
        address referrer = userReferrers[referee];
        require(referrer != address(0), "No referrer found");
        require(referralData[referee].active, "Referral not active");
        require(activityAmount > 0, "Invalid activity amount");

        // Calculate referral reward (10% of activity amount)
        uint256 rewardAmount = (activityAmount * REFERRAL_BONUS_RATE) / BASIS_POINTS;

        // Update referral data
        referralData[referee].totalEarnings += rewardAmount;
        referralData[referee].totalActivities++;

        // Update user total earnings
        userTotalReferralEarnings[referrer] += rewardAmount;

        // Transfer reward to referrer
        ntiqToken.safeTransfer(referrer, rewardAmount);

        totalReferralRewards += rewardAmount;

        emit ReferralRewardDistributed(
            referrer,
            referee,
            activityAmount,
            rewardAmount,
            activityType
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
     * @notice Get referrer's referees
     * @param referrer Referrer address
     */
    function getReferees(address referrer) external view returns (address[] memory) {
        return referrerReferees[referrer];
    }

    /**
     * @notice Get referee count for a referrer
     * @param referrer Referrer address
     */
    function getRefereeCount(address referrer) external view returns (uint256) {
        return referrerReferees[referrer].length;
    }

    /**
     * @notice Get referral data for a user
     * @param referee Referee address
     */
    function getReferralData(address referee) external view returns (
        address referrer,
        uint256 timestamp,
        bool active,
        uint256 totalEarnings,
        uint256 totalActivities
    ) {
        ReferralData memory data = referralData[referee];
        return (
            data.referrer,
            data.timestamp,
            data.active,
            data.totalEarnings,
            data.totalActivities
        );
    }

    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalReferrals,
        uint256 _totalReferralRewards
    ) {
        return (totalReferrals, totalReferralRewards);
    }

    /**
     * @notice Check if address has a referrer
     * @param user User address
     */
    function hasReferrer(address user) external view returns (bool) {
        return userReferrers[user] != address(0);
    }

    /**
     * @notice Get referrer for a user
     * @param user User address
     */
    function getReferrer(address user) external view returns (address) {
        return userReferrers[user];
    }
}
