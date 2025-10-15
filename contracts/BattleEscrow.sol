// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BattleEscrow
 * @notice Escrow system for battle stakes with winner-takes-all mechanism
 * @dev 3.5% platform fee on total pool
 */
contract BattleEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable ntiqToken;
    address public treasury;
    uint256 public constant PLATFORM_FEE_RATE = 350; // 3.5% = 350 basis points
    uint256 public constant BASIS_POINTS = 10000;

    enum BattleStatus {
        Created,
        Accepted,
        Completed,
        Cancelled,
        Expired
    }

    struct Battle {
        address challenger;
        address challenged;
        uint256 stakeAmount;
        uint256 timestamp;
        BattleStatus status;
        address winner;
    }

    mapping(bytes32 => Battle) public battles;
    uint256 public totalBattlesCreated;
    uint256 public totalBattlesCompleted;
    uint256 public totalFeesCollected;

    event BattleCreated(
        bytes32 indexed battleId,
        address indexed challenger,
        uint256 stake,
        uint256 timestamp
    );

    event BattleAccepted(
        bytes32 indexed battleId,
        address indexed challenged,
        uint256 stake,
        uint256 timestamp
    );

    event BattleResolved(
        bytes32 indexed battleId,
        address indexed winner,
        uint256 reward,
        uint256 fee
    );

    event BattleCancelled(
        bytes32 indexed battleId,
        string reason
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
     * @notice Create a new battle
     * @param battleId Unique identifier for the battle
     * @param stakeAmount Amount of NTIQ to stake
     */
    function createBattle(
        bytes32 battleId,
        uint256 stakeAmount
    ) external nonReentrant whenNotPaused returns (bool) {
        require(stakeAmount > 0, "Stake must be greater than 0");
        require(battles[battleId].challenger == address(0), "Battle already exists");

        // Transfer stake from challenger
        ntiqToken.safeTransferFrom(msg.sender, address(this), stakeAmount);

        // Create battle record
        battles[battleId] = Battle({
            challenger: msg.sender,
            challenged: address(0),
            stakeAmount: stakeAmount,
            timestamp: block.timestamp,
            status: BattleStatus.Created,
            winner: address(0)
        });

        totalBattlesCreated++;

        emit BattleCreated(battleId, msg.sender, stakeAmount, block.timestamp);

        return true;
    }

    /**
     * @notice Accept a battle
     * @param battleId Unique identifier for the battle
     */
    function acceptBattle(
        bytes32 battleId
    ) external nonReentrant whenNotPaused returns (bool) {
        Battle storage battle = battles[battleId];
        
        require(battle.challenger != address(0), "Battle not found");
        require(battle.status == BattleStatus.Created, "Battle not available");
        require(msg.sender != battle.challenger, "Cannot accept own battle");

        // Transfer stake from challenged user
        ntiqToken.safeTransferFrom(msg.sender, address(this), battle.stakeAmount);

        // Update battle
        battle.challenged = msg.sender;
        battle.status = BattleStatus.Accepted;

        emit BattleAccepted(battleId, msg.sender, battle.stakeAmount, block.timestamp);

        return true;
    }

    /**
     * @notice Resolve battle and distribute rewards
     * @param battleId Unique identifier for the battle
     * @param winner Address of the winner
     */
    function resolveBattle(
        bytes32 battleId,
        address winner
    ) external nonReentrant onlyOwner returns (bool) {
        Battle storage battle = battles[battleId];
        
        require(battle.challenger != address(0), "Battle not found");
        require(battle.status == BattleStatus.Accepted, "Battle not accepted");
        require(
            winner == battle.challenger || winner == battle.challenged,
            "Invalid winner"
        );

        // Calculate total pool and rewards
        uint256 totalPool = battle.stakeAmount * 2;
        uint256 platformFee = (totalPool * PLATFORM_FEE_RATE) / BASIS_POINTS;
        uint256 winnerReward = totalPool - platformFee;

        // Update battle status
        battle.status = BattleStatus.Completed;
        battle.winner = winner;

        // Transfer reward to winner
        ntiqToken.safeTransfer(winner, winnerReward);

        // Transfer fee to treasury
        ntiqToken.safeTransfer(treasury, platformFee);

        totalBattlesCompleted++;
        totalFeesCollected += platformFee;

        emit BattleResolved(battleId, winner, winnerReward, platformFee);

        return true;
    }

    /**
     * @notice Cancel battle and refund stakes
     * @param battleId Unique identifier for the battle
     * @param reason Reason for cancellation
     */
    function cancelBattle(
        bytes32 battleId,
        string calldata reason
    ) external nonReentrant onlyOwner returns (bool) {
        Battle storage battle = battles[battleId];
        
        require(battle.challenger != address(0), "Battle not found");
        require(
            battle.status == BattleStatus.Created || 
            battle.status == BattleStatus.Accepted,
            "Battle cannot be cancelled"
        );

        // Refund challenger
        ntiqToken.safeTransfer(battle.challenger, battle.stakeAmount);

        // Refund challenged user if battle was accepted
        if (battle.status == BattleStatus.Accepted && battle.challenged != address(0)) {
            ntiqToken.safeTransfer(battle.challenged, battle.stakeAmount);
        }

        // Update status
        battle.status = BattleStatus.Cancelled;

        emit BattleCancelled(battleId, reason);

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
     * @notice Get battle info
     * @param battleId Unique identifier for the battle
     */
    function getBattle(bytes32 battleId) external view returns (
        address challenger,
        address challenged,
        uint256 stakeAmount,
        uint256 timestamp,
        BattleStatus status,
        address winner
    ) {
        Battle memory battle = battles[battleId];
        return (
            battle.challenger,
            battle.challenged,
            battle.stakeAmount,
            battle.timestamp,
            battle.status,
            battle.winner
        );
    }

    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalBattlesCreated,
        uint256 _totalBattlesCompleted,
        uint256 _totalFeesCollected
    ) {
        return (totalBattlesCreated, totalBattlesCompleted, totalFeesCollected);
    }
}
