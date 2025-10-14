// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NTIQToken
 * @dev NECTIQ Platform Token with Enhanced Tokenomics
 * 
 * Key Features:
 * - Total Supply: 1,000,000,000 NTIQ (1 Billion)
 * - Deflationary mechanics with token burn
 * - Tiered staking system with revenue sharing
 * - Anti-whale protections
 * - Vesting schedules for team/investors
 * - Governance integration (vNTIQ)
 * 
 * Improved Distribution (Based on Audit Feedback):
 * - Community & Ecosystem: 40% (400M)
 *   - Early Airdrop: 5% immediate + 10% vested (50M + 100M)
 *   - Liquidity Mining: 10% over 4 years (100M)
 *   - DAO Treasury: 10% (100M)
 *   - Community Grants: 5% (50M)
 * - Game Rewards: 30% over 4 years (300M)
 * - Team & Advisors: 20% with 4-year vesting + 1-year cliff (200M)
 * - Buildathons: 5% milestone-based (50M)
 * - Investors: 5% with 2-year vesting + 6-month cliff (50M)
 */
contract NTIQToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============================================
    // CONSTANTS & IMMUTABLES
    // ============================================
    
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion NTIQ
    
    // Distribution amounts (adjusted based on feedback)
    uint256 public constant IMMEDIATE_AIRDROP = 50_000_000 * 10**18;      // 5% immediate (reduced from 15%)
    uint256 public constant VESTED_AIRDROP = 100_000_000 * 10**18;        // 10% vested over 12 months
    uint256 public constant LIQUIDITY_MINING = 100_000_000 * 10**18;      // 10% over 4 years (extended)
    uint256 public constant DAO_TREASURY = 100_000_000 * 10**18;          // 10%
    uint256 public constant COMMUNITY_GRANTS = 50_000_000 * 10**18;       // 5%
    uint256 public constant GAME_REWARDS = 300_000_000 * 10**18;          // 30% over 4 years
    uint256 public constant TEAM_ALLOCATION = 200_000_000 * 10**18;       // 20% with vesting
    uint256 public constant BUILDATHONS = 50_000_000 * 10**18;            // 5%
    uint256 public constant INVESTOR_ALLOCATION = 50_000_000 * 10**18;    // 5% with vesting
    
    // Anti-whale limits
    uint256 public maxTransactionAmount = 1_000_000 * 10**18; // 0.1% of total supply
    uint256 public maxWalletAmount = 10_000_000 * 10**18;     // 1% of total supply
    bool public limitsEnabled = true;
    
    // Fee structure for deflationary mechanics
    uint256 public burnFeePercentage = 50;      // 50% of fees burned
    uint256 public treasuryFeePercentage = 30;  // 30% to DAO treasury
    uint256 public operationsFeePercentage = 20; // 20% to operations
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    // Addresses
    address public daoTreasury;
    address public operationsWallet;
    address public liquidityMiningContract;
    address public gameRewardsContract;
    
    // Vesting tracking
    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(address => bool) public isExemptFromLimits;
    mapping(address => bool) public isExemptFromFees;
    
    // Staking system
    mapping(address => StakeInfo) public stakes;
    mapping(uint8 => TierInfo) public tiers;
    
    // Revenue sharing
    uint256 public totalStaked;
    uint256 public accumulatedRevenue;
    uint256 public revenuePerShare;
    uint256 private constant REVENUE_PRECISION = 1e18;
    
    // Burn tracking
    uint256 public totalBurned;
    
    // ============================================
    // STRUCTS
    // ============================================
    
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 released;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
    }
    
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 revenueDebt;
        uint8 tier;
        uint256 lockUntil;
    }
    
    struct TierInfo {
        uint256 minStake;
        uint256 revenueShareBonus; // Basis points (100 = 1%)
        string name;
    }
    
    // ============================================
    // EVENTS
    // ============================================
    
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 startTime);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event Staked(address indexed user, uint256 amount, uint8 tier);
    event Unstaked(address indexed user, uint256 amount);
    event RevenueDistributed(uint256 amount);
    event RevenuesClaimed(address indexed user, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event MaxTransactionUpdated(uint256 newAmount);
    event MaxWalletUpdated(uint256 newAmount);
    event InitialAllocationsDistributed();
    event AirdropDistributed(uint256 recipientCount);
    
    // ============================================
    // ERRORS
    // ============================================
    
    error ExceedsMaxTransaction();
    error ExceedsMaxWallet();
    error VestingNotStarted();
    error NoTokensToRelease();
    error InsufficientBalance();
    error InvalidTier();
    error StillLocked();
    error ZeroAddress();
    error InvalidAmount();
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor(
        address _daoTreasury,
        address _operationsWallet
    ) ERC20("Nectiq Token", "NTIQ") Ownable(msg.sender) {
        if (_daoTreasury == address(0) || _operationsWallet == address(0)) revert ZeroAddress();
        
        daoTreasury = _daoTreasury;
        operationsWallet = _operationsWallet;
        
        // Initialize tier system
        _initializeTiers();
        
        // Mint total supply to owner (will be distributed later)
        _mint(owner(), TOTAL_SUPPLY);
        
        // Exempt critical addresses from limits and fees
        isExemptFromLimits[address(this)] = true;
        isExemptFromLimits[owner()] = true;
        isExemptFromLimits[_daoTreasury] = true;
        isExemptFromFees[address(this)] = true;
        isExemptFromFees[owner()] = true;
    }
    
    // ============================================
    // DISTRIBUTION FUNCTIONS
    // ============================================
    
    /**
     * @notice Distribute initial token allocations
     * @dev Can only be called by owner after deployment
     */
    function distributeInitialAllocations() external onlyOwner {
        // Transfer DAO Treasury allocation
        _transfer(owner(), daoTreasury, DAO_TREASURY);
        
        // Keep immediate airdrop with owner for manual distribution
        // Owner will distribute IMMEDIATE_AIRDROP to early users manually
        
        emit InitialAllocationsDistributed();
    }
    
    /**
     * @notice Distribute airdrop tokens to multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     */
    function distributeAirdrop(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 100, "Too many recipients");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _transfer(owner(), recipients[i], amounts[i]);
        }
        
        emit AirdropDistributed(recipients.length);
    }
    
    // ============================================
    // TIER SYSTEM INITIALIZATION
    // ============================================
    
    function _initializeTiers() private {
        // 🥉 Bronze: 1,000 NTIQ
        tiers[0] = TierInfo({
            minStake: 1_000 * 10**18,
            revenueShareBonus: 100, // 1% bonus
            name: "Bronze"
        });
        
        // 🥈 Silver: 5,000 NTIQ
        tiers[1] = TierInfo({
            minStake: 5_000 * 10**18,
            revenueShareBonus: 250, // 2.5% bonus
            name: "Silver"
        });
        
        // 🥇 Gold: 20,000 NTIQ
        tiers[2] = TierInfo({
            minStake: 20_000 * 10**18,
            revenueShareBonus: 500, // 5% bonus
            name: "Gold"
        });
        
        // 💎 Diamond: 100,000 NTIQ
        tiers[3] = TierInfo({
            minStake: 100_000 * 10**18,
            revenueShareBonus: 1000, // 10% bonus
            name: "Diamond"
        });
    }
    
    // ============================================
    // VESTING FUNCTIONS
    // ============================================
    
    /**
     * @dev Create vesting schedule for team/investors
     * @param beneficiary Address to receive vested tokens
     * @param amount Total amount to vest
     * @param cliffDuration Cliff period in seconds
     * @param vestingDuration Total vesting duration in seconds
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            released: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration
        });
        
        emit VestingScheduleCreated(beneficiary, amount, block.timestamp);
    }
    
    /**
     * @dev Calculate releasable amount for vesting schedule
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount - schedule.released;
        }
        
        uint256 timeVested = block.timestamp - schedule.startTime;
        uint256 vestedAmount = (schedule.totalAmount * timeVested) / schedule.vestingDuration;
        
        return vestedAmount - schedule.released;
    }
    
    /**
     * @dev Release vested tokens
     */
    function releaseVestedTokens() external nonReentrant {
        uint256 amount = releasableAmount(msg.sender);
        if (amount == 0) revert NoTokensToRelease();
        
        vestingSchedules[msg.sender].released += amount;
        _transfer(address(this), msg.sender, amount);
        
        emit TokensReleased(msg.sender, amount);
    }
    
    // ============================================
    // STAKING FUNCTIONS WITH REVENUE SHARING
    // ============================================
    
    /**
     * @dev Stake tokens and earn revenue share
     * @param amount Amount to stake
     * @param lockDuration Lock duration in seconds (0 for no lock)
     */
    function stake(uint256 amount, uint256 lockDuration) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();
        
        // Update revenue before staking
        _updateRevenue(msg.sender);
        
        // Determine tier
        uint8 tier = _calculateTier(stakes[msg.sender].amount + amount);
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].stakedAt = block.timestamp;
        stakes[msg.sender].tier = tier;
        stakes[msg.sender].lockUntil = block.timestamp + lockDuration;
        stakes[msg.sender].revenueDebt = (stakes[msg.sender].amount * revenuePerShare) / REVENUE_PRECISION;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, tier);
    }
    
    /**
     * @dev Unstake tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (amount == 0 || amount > stakeInfo.amount) revert InvalidAmount();
        if (block.timestamp < stakeInfo.lockUntil) revert StillLocked();
        
        // Claim pending revenue first
        _claimRevenue();
        
        // Update stake
        stakeInfo.amount -= amount;
        totalStaked -= amount;
        
        // Recalculate tier
        stakeInfo.tier = _calculateTier(stakeInfo.amount);
        stakeInfo.revenueDebt = (stakeInfo.amount * revenuePerShare) / REVENUE_PRECISION;
        
        // Transfer tokens back
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Calculate user tier based on stake amount
     */
    function _calculateTier(uint256 stakedAmount) private view returns (uint8) {
        if (stakedAmount >= tiers[3].minStake) return 3; // Diamond
        if (stakedAmount >= tiers[2].minStake) return 2; // Gold
        if (stakedAmount >= tiers[1].minStake) return 1; // Silver
        if (stakedAmount >= tiers[0].minStake) return 0; // Bronze
        return 0; // Default to Bronze
    }
    
    /**
     * @dev Distribute platform revenue to stakers
     * @param amount Revenue amount in NTIQ
     */
    function distributeRevenue(uint256 amount) external onlyOwner {
        if (totalStaked == 0) return;
        
        accumulatedRevenue += amount;
        revenuePerShare += (amount * REVENUE_PRECISION) / totalStaked;
        
        emit RevenueDistributed(amount);
    }
    
    /**
     * @dev Calculate pending revenue for user
     */
    function pendingRevenue(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 pending = ((stakeInfo.amount * revenuePerShare) / REVENUE_PRECISION) - stakeInfo.revenueDebt;
        
        // Apply tier bonus
        uint256 bonus = (pending * tiers[stakeInfo.tier].revenueShareBonus) / 10000;
        
        return pending + bonus;
    }
    
    /**
     * @dev Update revenue state for user
     */
    function _updateRevenue(address user) private {
        uint256 pending = pendingRevenue(user);
        if (pending > 0) {
            _transfer(address(this), user, pending);
            emit RevenuesClaimed(user, pending);
        }
        stakes[user].revenueDebt = (stakes[user].amount * revenuePerShare) / REVENUE_PRECISION;
    }
    
    /**
     * @dev Claim pending revenue
     */
    function _claimRevenue() private {
        _updateRevenue(msg.sender);
    }
    
    /**
     * @dev Public function to claim revenue
     */
    function claimRevenue() external nonReentrant {
        _claimRevenue();
    }
    
    // ============================================
    // DEFLATIONARY MECHANICS
    // ============================================
    
    /**
     * @dev Burn tokens from platform fees
     * @param amount Amount to burn
     */
    function burnFromFees(uint256 amount) external onlyOwner {
        _burn(address(this), amount);
        totalBurned += amount;
        emit TokensBurned(address(this), amount);
    }
    
    /**
     * @dev Process platform fees with automatic distribution
     * @param totalFees Total fees collected
     */
    function processPlatformFees(uint256 totalFees) external onlyOwner {
        uint256 burnAmount = (totalFees * burnFeePercentage) / 100;
        uint256 treasuryAmount = (totalFees * treasuryFeePercentage) / 100;
        uint256 operationsAmount = (totalFees * operationsFeePercentage) / 100;
        
        // Burn tokens
        _burn(address(this), burnAmount);
        totalBurned += burnAmount;
        
        // Distribute to treasury and operations
        _transfer(address(this), daoTreasury, treasuryAmount);
        _transfer(address(this), operationsWallet, operationsAmount);
        
        emit TokensBurned(address(this), burnAmount);
    }
    
    // ============================================
    // ANTI-WHALE PROTECTIONS
    // ============================================
    
    /**
     * @dev Override transfer to add anti-whale checks
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        // Skip checks for exempt addresses
        if (limitsEnabled && !isExemptFromLimits[from] && !isExemptFromLimits[to]) {
            // Check max transaction
            if (amount > maxTransactionAmount) revert ExceedsMaxTransaction();
            
            // Check max wallet (only for buys, not sells)
            if (to != address(0) && from != address(0)) {
                if (balanceOf(to) + amount > maxWalletAmount) revert ExceedsMaxWallet();
            }
        }
        
        super._update(from, to, amount);
    }
    
    /**
     * @dev Update max transaction amount
     */
    function setMaxTransactionAmount(uint256 newAmount) external onlyOwner {
        maxTransactionAmount = newAmount;
        emit MaxTransactionUpdated(newAmount);
    }
    
    /**
     * @dev Update max wallet amount
     */
    function setMaxWalletAmount(uint256 newAmount) external onlyOwner {
        maxWalletAmount = newAmount;
        emit MaxWalletUpdated(newAmount);
    }
    
    /**
     * @dev Enable/disable limits
     */
    function setLimitsEnabled(bool enabled) external onlyOwner {
        limitsEnabled = enabled;
    }
    
    /**
     * @dev Set exemption from limits
     */
    function setExemptFromLimits(address account, bool exempt) external onlyOwner {
        isExemptFromLimits[account] = exempt;
    }
    
    /**
     * @dev Set exemption from fees
     */
    function setExemptFromFees(address account, bool exempt) external onlyOwner {
        isExemptFromFees[account] = exempt;
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @dev Update fee percentages
     */
    function updateFeePercentages(
        uint256 _burnFee,
        uint256 _treasuryFee,
        uint256 _operationsFee
    ) external onlyOwner {
        require(_burnFee + _treasuryFee + _operationsFee == 100, "Fees must total 100%");
        burnFeePercentage = _burnFee;
        treasuryFeePercentage = _treasuryFee;
        operationsFeePercentage = _operationsFee;
    }
    
    /**
     * @dev Update critical addresses
     */
    function updateAddresses(
        address _daoTreasury,
        address _operationsWallet
    ) external onlyOwner {
        if (_daoTreasury != address(0)) daoTreasury = _daoTreasury;
        if (_operationsWallet != address(0)) operationsWallet = _operationsWallet;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @dev Get stake info for user
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 stakedAt,
        uint8 tier,
        uint256 lockUntil,
        uint256 pending
    ) {
        StakeInfo memory stakeInfo = stakes[user];
        return (
            stakeInfo.amount,
            stakeInfo.stakedAt,
            stakeInfo.tier,
            stakeInfo.lockUntil,
            pendingRevenue(user)
        );
    }
    
    /**
     * @dev Get tier info
     */
    function getTierInfo(uint8 tier) external view returns (
        uint256 minStake,
        uint256 revenueShareBonus,
        string memory name
    ) {
        TierInfo memory tierInfo = tiers[tier];
        return (tierInfo.minStake, tierInfo.revenueShareBonus, tierInfo.name);
    }
    
    /**
     * @dev Get circulating supply (excluding locked tokens)
     */
    function getCirculatingSupply() external view returns (uint256) {
        return totalSupply() - balanceOf(address(this));
    }
}

