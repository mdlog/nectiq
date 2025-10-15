// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TournamentPool
 * @notice Prize pool management for survival tournaments
 * @dev No platform fee - winner(s) take entire prize pool
 */
contract TournamentPool is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable ntiqToken;

    enum TournamentStatus {
        Open,
        Active,
        Completed,
        Cancelled
    }

    struct Tournament {
        uint256 entryFee;
        uint256 prizePool;
        uint256 participantCount;
        uint256 timestamp;
        TournamentStatus status;
    }

    mapping(bytes32 => Tournament) public tournaments;
    mapping(bytes32 => mapping(address => bool)) public participants;
    uint256 public totalTournamentsCreated;
    uint256 public totalTournamentsCompleted;
    uint256 public totalPrizesDistributed;

    event TournamentCreated(
        bytes32 indexed tournamentId,
        uint256 entryFee,
        uint256 timestamp
    );

    event TournamentJoined(
        bytes32 indexed tournamentId,
        address indexed user,
        uint256 entryFee,
        uint256 newPrizePool
    );

    event TournamentStarted(
        bytes32 indexed tournamentId,
        uint256 participantCount,
        uint256 prizePool
    );

    event PrizesDistributed(
        bytes32 indexed tournamentId,
        address[] winners,
        uint256[] amounts,
        uint256 totalDistributed
    );

    event TournamentCancelled(
        bytes32 indexed tournamentId,
        uint256 refundedAmount
    );

    constructor(address _ntiqToken) Ownable(msg.sender) {
        require(_ntiqToken != address(0), "Invalid NTIQ token address");
        ntiqToken = IERC20(_ntiqToken);
    }

    /**
     * @notice Create a new tournament
     * @param tournamentId Unique identifier for the tournament
     * @param entryFee Entry fee in NTIQ
     */
    function createTournament(
        bytes32 tournamentId,
        uint256 entryFee
    ) external onlyOwner returns (bool) {
        require(entryFee > 0, "Entry fee must be greater than 0");
        require(tournaments[tournamentId].timestamp == 0, "Tournament already exists");

        tournaments[tournamentId] = Tournament({
            entryFee: entryFee,
            prizePool: 0,
            participantCount: 0,
            timestamp: block.timestamp,
            status: TournamentStatus.Open
        });

        totalTournamentsCreated++;

        emit TournamentCreated(tournamentId, entryFee, block.timestamp);

        return true;
    }

    /**
     * @notice Join a tournament
     * @param tournamentId Unique identifier for the tournament
     */
    function joinTournament(
        bytes32 tournamentId
    ) external nonReentrant whenNotPaused returns (bool) {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.timestamp != 0, "Tournament not found");
        require(tournament.status == TournamentStatus.Open, "Tournament not open");
        require(!participants[tournamentId][msg.sender], "Already joined");

        // Transfer entry fee from user
        ntiqToken.safeTransferFrom(msg.sender, address(this), tournament.entryFee);

        // Update tournament
        tournament.prizePool += tournament.entryFee;
        tournament.participantCount++;
        participants[tournamentId][msg.sender] = true;

        emit TournamentJoined(
            tournamentId,
            msg.sender,
            tournament.entryFee,
            tournament.prizePool
        );

        return true;
    }

    /**
     * @notice Start tournament (change status to Active)
     * @param tournamentId Unique identifier for the tournament
     */
    function startTournament(
        bytes32 tournamentId
    ) external onlyOwner returns (bool) {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.timestamp != 0, "Tournament not found");
        require(tournament.status == TournamentStatus.Open, "Tournament not open");
        require(tournament.participantCount > 0, "No participants");

        tournament.status = TournamentStatus.Active;

        emit TournamentStarted(
            tournamentId,
            tournament.participantCount,
            tournament.prizePool
        );

        return true;
    }

    /**
     * @notice Distribute prizes to winners
     * @param tournamentId Unique identifier for the tournament
     * @param winners Array of winner addresses
     * @param amounts Array of prize amounts
     */
    function distributePrizes(
        bytes32 tournamentId,
        address[] calldata winners,
        uint256[] calldata amounts
    ) external nonReentrant onlyOwner returns (bool) {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.timestamp != 0, "Tournament not found");
        require(tournament.status == TournamentStatus.Active, "Tournament not active");
        require(winners.length == amounts.length, "Arrays length mismatch");
        require(winners.length > 0, "No winners specified");

        // Calculate total distribution
        uint256 totalDistribution = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalDistribution += amounts[i];
        }

        require(totalDistribution <= tournament.prizePool, "Exceeds prize pool");

        // Distribute prizes
        for (uint256 i = 0; i < winners.length; i++) {
            require(winners[i] != address(0), "Invalid winner address");
            require(amounts[i] > 0, "Invalid prize amount");
            
            ntiqToken.safeTransfer(winners[i], amounts[i]);
        }

        // Update tournament status
        tournament.status = TournamentStatus.Completed;
        totalTournamentsCompleted++;
        totalPrizesDistributed += totalDistribution;

        emit PrizesDistributed(tournamentId, winners, amounts, totalDistribution);

        return true;
    }

    /**
     * @notice Cancel tournament and refund all participants
     * @param tournamentId Unique identifier for the tournament
     * @param participantAddresses Array of participant addresses to refund
     */
    function refundParticipants(
        bytes32 tournamentId,
        address[] calldata participantAddresses
    ) external nonReentrant onlyOwner returns (bool) {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.timestamp != 0, "Tournament not found");
        require(
            tournament.status == TournamentStatus.Open || 
            tournament.status == TournamentStatus.Active,
            "Tournament cannot be cancelled"
        );

        uint256 totalRefunded = 0;

        // Refund all participants
        for (uint256 i = 0; i < participantAddresses.length; i++) {
            address participant = participantAddresses[i];
            
            if (participants[tournamentId][participant]) {
                ntiqToken.safeTransfer(participant, tournament.entryFee);
                totalRefunded += tournament.entryFee;
            }
        }

        // Update tournament status
        tournament.status = TournamentStatus.Cancelled;

        emit TournamentCancelled(tournamentId, totalRefunded);

        return true;
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
     * @notice Get tournament info
     * @param tournamentId Unique identifier for the tournament
     */
    function getTournament(bytes32 tournamentId) external view returns (
        uint256 entryFee,
        uint256 prizePool,
        uint256 participantCount,
        uint256 timestamp,
        TournamentStatus status
    ) {
        Tournament memory tournament = tournaments[tournamentId];
        return (
            tournament.entryFee,
            tournament.prizePool,
            tournament.participantCount,
            tournament.timestamp,
            tournament.status
        );
    }

    /**
     * @notice Check if user is participant
     * @param tournamentId Unique identifier for the tournament
     * @param user User address
     */
    function isParticipant(
        bytes32 tournamentId,
        address user
    ) external view returns (bool) {
        return participants[tournamentId][user];
    }

    /**
     * @notice Get contract stats
     */
    function getStats() external view returns (
        uint256 _totalTournamentsCreated,
        uint256 _totalTournamentsCompleted,
        uint256 _totalPrizesDistributed
    ) {
        return (
            totalTournamentsCreated,
            totalTournamentsCompleted,
            totalPrizesDistributed
        );
    }
}
