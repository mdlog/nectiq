// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NTIQTokenSimple
 * @dev Simplified NECTIQ Platform Token for deployment
 * 
 * Key Features:
 * - Total Supply: 1,000,000,000 NTIQ (1 Billion)
 * - Deflationary mechanics with token burn
 * - Pausable functionality
 * - Ownable contract
 * - Reentrancy protection
 * 
 * Distribution (Simplified):
 * - Community & Ecosystem: 40% (400M)
 * - Game Rewards: 30% (300M)
 * - Team & Advisors: 20% (200M)
 * - Buildathons: 5% (50M)
 * - Investors: 5% (50M)
 */
contract NTIQTokenSimple is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============================================
    // CONSTANTS & IMMUTABLES
    // ============================================
    
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion NTIQ
    
    // Distribution amounts
    uint256 public constant IMMEDIATE_AIRDROP = 50_000_000 * 10**18;      // 5% immediate
    uint256 public constant VESTED_AIRDROP = 100_000_000 * 10**18;        // 10% vested over 12 months
    uint256 public constant LIQUIDITY_MINING = 100_000_000 * 10**18;      // 10% over 4 years
    uint256 public constant DAO_TREASURY = 100_000_000 * 10**18;          // 10%
    uint256 public constant COMMUNITY_GRANTS = 50_000_000 * 10**18;       // 5%
    uint256 public constant GAME_REWARDS = 300_000_000 * 10**18;          // 30% over 4 years
    uint256 public constant TEAM_ALLOCATION = 200_000_000 * 10**18;       // 20% with vesting
    uint256 public constant BUILDATHONS = 50_000_000 * 10**18;            // 5%
    uint256 public constant INVESTOR_ALLOCATION = 50_000_000 * 10**18;    // 5% with vesting
    
    // Treasury and operations addresses
    address public daoTreasury;
    address public operationsWallet;
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor(
        address _daoTreasury,
        address _operationsWallet
    ) ERC20("NECTIQ Token", "NTIQ") Ownable(msg.sender) {
        if (_daoTreasury == address(0) || _operationsWallet == address(0)) revert ZeroAddress();
        
        daoTreasury = _daoTreasury;
        operationsWallet = _operationsWallet;
        
        // Mint total supply to contract owner (will be distributed later)
        _mint(owner(), TOTAL_SUPPLY);
    }
    
    // ============================================
    // CORE FUNCTIONS
    // ============================================
    
    /**
     * @notice Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        _burn(_msgSender(), amount);
    }
    
    /**
     * @notice Burn tokens from specified account (requires allowance)
     * @param account Account to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
    
    // ============================================
    // DISTRIBUTION FUNCTIONS
    // ============================================
    
    /**
     * @notice Distribute immediate airdrop tokens
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to distribute
     */
    function distributeAirdrop(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(owner(), recipients[i], amounts[i]);
        }
    }
    
    /**
     * @notice Transfer tokens to DAO Treasury
     */
    function transferToTreasury() external onlyOwner nonReentrant {
        _transfer(owner(), daoTreasury, DAO_TREASURY);
    }
    
    /**
     * @notice Update DAO Treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        daoTreasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
    
    /**
     * @notice Update operations wallet address
     * @param newOperationsWallet New operations wallet address
     */
    function updateOperationsWallet(address newOperationsWallet) external onlyOwner {
        if (newOperationsWallet == address(0)) revert ZeroAddress();
        operationsWallet = newOperationsWallet;
        emit OperationsWalletUpdated(newOperationsWallet);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get remaining supply available for distribution
     * @return Remaining tokens in owner's balance
     */
    function getRemainingSupply() external view returns (uint256) {
        return balanceOf(owner());
    }
    
    /**
     * @notice Get distribution summary
     * @return immediateAirdrop Immediate airdrop amount
     * @return vestedAirdrop Vested airdrop amount
     * @return liquidityMining Liquidity mining amount
     * @return treasuryAmount DAO treasury amount
     * @return communityGrants Community grants amount
     * @return gameRewards Game rewards amount
     * @return teamAllocation Team allocation amount
     * @return buildathons Buildathons amount
     * @return investorAllocation Investor allocation amount
     */
    function getDistributionSummary() external pure returns (
        uint256 immediateAirdrop,
        uint256 vestedAirdrop,
        uint256 liquidityMining,
        uint256 treasuryAmount,
        uint256 communityGrants,
        uint256 gameRewards,
        uint256 teamAllocation,
        uint256 buildathons,
        uint256 investorAllocation
    ) {
        return (
            IMMEDIATE_AIRDROP,
            VESTED_AIRDROP,
            LIQUIDITY_MINING,
            DAO_TREASURY,
            COMMUNITY_GRANTS,
            GAME_REWARDS,
            TEAM_ALLOCATION,
            BUILDATHONS,
            INVESTOR_ALLOCATION
        );
    }
    
    // ============================================
    // OVERRIDES
    // ============================================
    
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
    
    // ============================================
    // EVENTS
    // ============================================
    
    event TreasuryUpdated(address indexed newTreasury);
    event OperationsWalletUpdated(address indexed newOperationsWallet);
    
    // ============================================
    // ERRORS
    // ============================================
    
    error ZeroAddress();
}
