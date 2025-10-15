# Smart Contract Specifications

## Contract 1: PredictionStaking.sol

### Overview
Handles prediction stakes with accuracy-based reward multipliers (0.9x - 3.0x).

### State Variables
```solidity
IERC20 public ntiqToken;
address public admin;
address public treasury;
uint256 public platformFeeRate = 400; // 4% = 400 basis points

mapping(bytes32 => PredictionStake) public stakes;
mapping(address => uint256) public userTotalStaked;
uint256 public totalStaked;
uint256 public totalRewardsDistributed;
```

### Structs
```solidity
struct PredictionStake {
    address user;
    uint256 amount;
    uint256 timestamp;
    bool released;
    bool forfeited;
    uint256 rewardAmount;
}
```

### Functions

#### lockStake
```solidity
function lockStake(
    bytes32 predictionId,
    uint256 amount
) external nonReentrant returns (bool)
```
- Transfers NTIQ from user to contract
- Stores stake info with predictionId
- Emits `StakeLocked` event
- **Requirements:** amount >= 50 NTIQ, amount <= 10,000 NTIQ

#### releaseReward
```solidity
function releaseReward(
    bytes32 predictionId,
    uint256 multiplierBasisPoints
) external onlyAdmin nonReentrant returns (bool)
```
- Calculates reward: `amount * multiplier / 10000`
- Deducts 4% platform fee if multiplier >= 1.5x
- Transfers reward to user
- Transfers fee to treasury
- Emits `RewardReleased` event
- **Multipliers:** 900 (0.9x), 1500 (1.5x), 2000 (2.0x), 3000 (3.0x)

#### forfeitStake
```solidity
function forfeitStake(
    bytes32 predictionId
) external onlyAdmin nonReentrant returns (bool)
```
- Marks stake as forfeited
- Transfers entire stake to treasury
- Emits `StakeForfeited` event
- **Used when:** accuracy < 90%

### Events
```solidity
event StakeLocked(bytes32 indexed predictionId, address indexed user, uint256 amount);
event RewardReleased(bytes32 indexed predictionId, address indexed user, uint256 reward, uint256 fee);
event StakeForfeited(bytes32 indexed predictionId, address indexed user, uint256 amount);
```

---

## Contract 2: BattleEscrow.sol

### Overview
Escrow system for battle stakes with winner-takes-all mechanism.

### State Variables
```solidity
IERC20 public ntiqToken;
address public admin;
address public treasury;
uint256 public platformFeeRate = 350; // 3.5% = 350 basis points

mapping(bytes32 => Battle) public battles;
uint256 public totalBattlesCreated;
uint256 public totalBattlesCompleted;
```

### Structs
```solidity
struct Battle {
    address challenger;
    address challenged;
    uint256 stakeAmount;
    uint256 timestamp;
    BattleStatus status;
    address winner;
}

enum BattleStatus {
    Created,
    Accepted,
    Completed,
    Cancelled,
    Expired
}
```

### Functions

#### createBattle
```solidity
function createBattle(
    bytes32 battleId,
    uint256 stakeAmount
) external nonReentrant returns (bool)
```
- Transfers stake from challenger
- Creates battle record
- Emits `BattleCreated` event

#### acceptBattle
```solidity
function acceptBattle(
    bytes32 battleId,
    address challenged
) external nonReentrant returns (bool)
```
- Transfers stake from challenged user
- Updates battle status to Accepted
- Emits `BattleAccepted` event

#### resolveBattle
```solidity
function resolveBattle(
    bytes32 battleId,
    address winner
) external onlyAdmin nonReentrant returns (bool)
```
- Calculates total pool: `stakeAmount * 2`
- Deducts 3.5% platform fee
- Transfers reward to winner
- Transfers fee to treasury
- Emits `BattleResolved` event

#### cancelBattle
```solidity
function cancelBattle(
    bytes32 battleId
) external nonReentrant returns (bool)
```
- Refunds stakes to both parties
- Updates status to Cancelled
- Emits `BattleCancelled` event

### Events
```solidity
event BattleCreated(bytes32 indexed battleId, address indexed challenger, uint256 stake);
event BattleAccepted(bytes32 indexed battleId, address indexed challenged, uint256 stake);
event BattleResolved(bytes32 indexed battleId, address indexed winner, uint256 reward, uint256 fee);
event BattleCancelled(bytes32 indexed battleId);
```

---

## Contract 3: ParlayStaking.sol

### Overview
Multi-prediction staking with compound multiplier rewards.

### State Variables
```solidity
IERC20 public ntiqToken;
address public admin;
address public treasury;
uint256 public platformFeeRate = 600; // 6% = 600 basis points

mapping(bytes32 => ParlayStake) public parlays;
```

### Structs
```solidity
struct ParlayStake {
    address user;
    uint256 amount;
    uint8 coinCount;
    uint256 timestamp;
    bool released;
    bool forfeited;
    uint256 rewardAmount;
}
```

### Functions

#### lockParlayStake
```solidity
function lockParlayStake(
    bytes32 parlayId,
    uint256 amount,
    uint8 coinCount
) external nonReentrant returns (bool)
```
- Transfers NTIQ from user
- Stores parlay info
- Emits `ParlayStakeLocked` event
- **Requirements:** coinCount >= 2, coinCount <= 10

#### releaseCompoundReward
```solidity
function releaseCompoundReward(
    bytes32 parlayId,
    uint256 totalMultiplierBasisPoints
) external onlyAdmin nonReentrant returns (bool)
```
- Calculates gross reward: `amount * multiplier / 10000`
- Deducts 6% platform fee
- Transfers net reward to user
- Transfers fee to treasury
- Emits `ParlayRewardReleased` event

#### forfeitStake
```solidity
function forfeitStake(
    bytes32 parlayId
) external onlyAdmin nonReentrant returns (bool)
```
- Marks parlay as forfeited
- Transfers stake to treasury
- Emits `ParlayStakeForfeited` event

### Events
```solidity
event ParlayStakeLocked(bytes32 indexed parlayId, address indexed user, uint256 amount, uint8 coinCount);
event ParlayRewardReleased(bytes32 indexed parlayId, address indexed user, uint256 reward, uint256 fee);
event ParlayStakeForfeited(bytes32 indexed parlayId, address indexed user, uint256 amount);
```

---

## Contract 4: TournamentPool.sol

### Overview
Prize pool management for survival tournaments.

### State Variables
```solidity
IERC20 public ntiqToken;
address public admin;

mapping(bytes32 => Tournament) public tournaments;
mapping(bytes32 => mapping(address => bool)) public participants;
```

### Structs
```solidity
struct Tournament {
    uint256 entryFee;
    uint256 prizePool;
    uint256 participantCount;
    uint256 timestamp;
    TournamentStatus status;
}

enum TournamentStatus {
    Open,
    Active,
    Completed,
    Cancelled
}
```

### Functions

#### joinTournament
```solidity
function joinTournament(
    bytes32 tournamentId,
    uint256 entryFee
) external nonReentrant returns (bool)
```
- Transfers entry fee from user
- Adds to prize pool
- Marks user as participant
- Emits `TournamentJoined` event

#### distributePrizes
```solidity
function distributePrizes(
    bytes32 tournamentId,
    address[] calldata winners,
    uint256[] calldata amounts
) external onlyAdmin nonReentrant returns (bool)
```
- Validates total amounts <= prize pool
- Transfers prizes to winners
- Updates tournament status
- Emits `PrizesDistributed` event

#### refundParticipants
```solidity
function refundParticipants(
    bytes32 tournamentId,
    address[] calldata participants
) external onlyAdmin nonReentrant returns (bool)
```
- Refunds entry fees to all participants
- Updates tournament status to Cancelled
- Emits `TournamentCancelled` event

### Events
```solidity
event TournamentJoined(bytes32 indexed tournamentId, address indexed user, uint256 entryFee);
event PrizesDistributed(bytes32 indexed tournamentId, address[] winners, uint256[] amounts);
event TournamentCancelled(bytes32 indexed tournamentId);
```

---

## Security Features (All Contracts)

### 1. ReentrancyGuard
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```
- Prevents reentrancy attacks
- Applied to all external functions that transfer tokens

### 2. Access Control
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin");
    _;
}
```

### 3. Pausable
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

function pause() external onlyAdmin {
    _pause();
}

function unpause() external onlyAdmin {
    _unpause();
}
```

### 4. SafeERC20
```solidity
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
using SafeERC20 for IERC20;
```

---

## Gas Optimization

### 1. Use uint256 for all numbers
- Cheaper than uint8, uint16, etc.
- Except for struct packing

### 2. Pack structs efficiently
```solidity
struct PredictionStake {
    address user;           // 20 bytes
    uint256 amount;         // 32 bytes
    uint256 timestamp;      // 32 bytes
    bool released;          // 1 byte
    bool forfeited;         // 1 byte
    uint256 rewardAmount;   // 32 bytes
}
```

### 3. Use events for data storage
- Store minimal data on-chain
- Emit events for off-chain indexing

### 4. Batch operations
- Process multiple stakes in one transaction
- Reduce gas costs per operation

---

## Deployment Configuration

### Constructor Parameters
```solidity
constructor(
    address _ntiqToken,
    address _admin,
    address _treasury
) {
    ntiqToken = IERC20(_ntiqToken);
    admin = _admin;
    treasury = _treasury;
}
```

### Network: Polygon Amoy
- **Chain ID:** 80002
- **RPC:** https://rpc-amoy.polygon.technology
- **Explorer:** https://amoy.polygonscan.com

### Addresses (from .env)
- **NTIQ Token:** 0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f
- **Admin:** 0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4
- **Treasury:** (To be determined)

---

**Next:** Implementation tasks and deployment scripts
