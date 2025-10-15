// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AchievementSystem
 * @notice NFT-based achievement system for milestone tracking
 * @dev Mints NFT achievements for user milestones and accomplishments
 */
contract AchievementSystem is ERC721, Ownable, Pausable, ReentrancyGuard {
    
    uint256 public nextTokenId = 1;
    string public baseURI;
    
    // Achievement categories
    enum AchievementCategory {
        PREDICTION_ACCURACY,  // High accuracy predictions
        WIN_STREAK,          // Consecutive wins
        TOTAL_VOLUME,        // Trading volume milestones
        REFERRAL,            // Referral achievements
        TOURNAMENT,          // Tournament wins
        SPECIAL_EVENT        // Special platform events
    }
    
    struct Achievement {
        uint256 tokenId;
        AchievementCategory category;
        string name;
        string description;
        uint256 requirement; // Required value for achievement
        bool active;
        uint256 mintedCount;
    }
    
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(AchievementCategory => uint256)) public userProgress;
    mapping(address => mapping(uint256 => bool)) public userAchievements;
    
    uint256 public totalAchievements;
    uint256 public totalMinted;
    
    event AchievementCreated(
        uint256 indexed achievementId,
        AchievementCategory category,
        string name,
        uint256 requirement
    );
    
    event AchievementMinted(
        address indexed user,
        uint256 indexed tokenId,
        uint256 indexed achievementId,
        AchievementCategory category
    );
    
    event ProgressUpdated(
        address indexed user,
        AchievementCategory category,
        uint256 newProgress
    );
    
    event BaseURIUpdated(string oldBaseURI, string newBaseURI);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) Ownable(msg.sender) {
        baseURI = baseURI_;
    }

    /**
     * @notice Create a new achievement
     * @param category Achievement category
     * @param name Achievement name
     * @param description Achievement description
     * @param requirement Required value to unlock achievement
     */
    function createAchievement(
        AchievementCategory category,
        string memory name,
        string memory description,
        uint256 requirement
    ) external onlyOwner returns (uint256) {
        uint256 achievementId = totalAchievements + 1;
        
        achievements[achievementId] = Achievement({
            tokenId: nextTokenId,
            category: category,
            name: name,
            description: description,
            requirement: requirement,
            active: true,
            mintedCount: 0
        });
        
        totalAchievements = achievementId;
        nextTokenId++;
        
        emit AchievementCreated(achievementId, category, name, requirement);
        
        return achievementId;
    }

    /**
     * @notice Mint achievement NFT for user
     * @param user User address to mint achievement for
     * @param achievementId Achievement ID to mint
     */
    function mintAchievement(
        address user,
        uint256 achievementId
    ) external onlyOwner nonReentrant returns (uint256) {
        require(achievements[achievementId].active, "Achievement not active");
        require(!userAchievements[user][achievementId], "Achievement already owned");
        require(userProgress[user][achievements[achievementId].category] >= achievements[achievementId].requirement, "Requirement not met");
        
        uint256 tokenId = achievements[achievementId].tokenId + achievements[achievementId].mintedCount;
        
        _safeMint(user, tokenId);
        
        userAchievements[user][achievementId] = true;
        achievements[achievementId].mintedCount++;
        totalMinted++;
        
        emit AchievementMinted(user, tokenId, achievementId, achievements[achievementId].category);
        
        return tokenId;
    }

    /**
     * @notice Update user progress for a category
     * @param user User address
     * @param category Achievement category
     * @param progress New progress value
     */
    function updateProgress(
        address user,
        AchievementCategory category,
        uint256 progress
    ) external onlyOwner {
        userProgress[user][category] = progress;
        emit ProgressUpdated(user, category, progress);
    }

    /**
     * @notice Batch update user progress
     * @param users Array of user addresses
     * @param categories Array of achievement categories
     * @param progresses Array of progress values
     */
    function batchUpdateProgress(
        address[] calldata users,
        AchievementCategory[] calldata categories,
        uint256[] calldata progresses
    ) external onlyOwner {
        require(users.length == categories.length && categories.length == progresses.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            userProgress[users[i]][categories[i]] = progresses[i];
            emit ProgressUpdated(users[i], categories[i], progresses[i]);
        }
    }

    /**
     * @notice Update base URI for NFT metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        string memory oldBaseURI = baseURI;
        baseURI = newBaseURI;
        emit BaseURIUpdated(oldBaseURI, newBaseURI);
    }

    /**
     * @notice Deactivate an achievement
     * @param achievementId Achievement ID to deactivate
     */
    function deactivateAchievement(uint256 achievementId) external onlyOwner {
        achievements[achievementId].active = false;
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
     * @notice Get user's progress for all categories
     * @param user User address
     */
    function getUserProgress(address user) external view returns (
        uint256 predictionAccuracy,
        uint256 winStreak,
        uint256 totalVolume,
        uint256 referral,
        uint256 tournament,
        uint256 specialEvent
    ) {
        return (
            userProgress[user][AchievementCategory.PREDICTION_ACCURACY],
            userProgress[user][AchievementCategory.WIN_STREAK],
            userProgress[user][AchievementCategory.TOTAL_VOLUME],
            userProgress[user][AchievementCategory.REFERRAL],
            userProgress[user][AchievementCategory.TOURNAMENT],
            userProgress[user][AchievementCategory.SPECIAL_EVENT]
        );
    }

    /**
     * @notice Check if user owns a specific achievement
     * @param user User address
     * @param achievementId Achievement ID
     */
    function hasAchievement(address user, uint256 achievementId) external view returns (bool) {
        return userAchievements[user][achievementId];
    }

    /**
     * @notice Get achievement info
     * @param achievementId Achievement ID
     */
    function getAchievement(uint256 achievementId) external view returns (
        uint256 tokenId,
        AchievementCategory category,
        string memory name,
        string memory description,
        uint256 requirement,
        bool active,
        uint256 mintedCount
    ) {
        Achievement memory achievement = achievements[achievementId];
        return (
            achievement.tokenId,
            achievement.category,
            achievement.name,
            achievement.description,
            achievement.requirement,
            achievement.active,
            achievement.mintedCount
        );
    }

    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalAchievements,
        uint256 _totalMinted,
        uint256 _nextTokenId
    ) {
        return (totalAchievements, totalMinted, nextTokenId);
    }

    /**
     * @notice Override _baseURI to return the base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Override _update to add pausable functionality
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
}
