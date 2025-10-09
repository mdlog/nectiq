// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NectiqVault
 * @dev Manages deposits and withdrawals for NECTIQ platform on Polygon Amoy
 * @author NECTIQ Team
 */
contract NectiqVault is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    /// @notice Mapping of user addresses to their deposit balances
    mapping(address => uint256) public userBalances;
    
    /// @notice Total POL held in contract
    uint256 public totalDeposits;
    
    /// @notice Minimum deposit amount (0.01 POL)
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    
    /// @notice Maximum deposit amount (1000 POL)
    uint256 public constant MAX_DEPOSIT = 1000 ether;
    
    /// @notice Minimum withdrawal amount (0.01 POL)
    uint256 public constant MIN_WITHDRAWAL = 0.01 ether;
    
    /// @notice Backend signer address for withdrawal authorization
    address public backendSigner;
    
    /// @notice Nonce for preventing replay attacks
    mapping(address => uint256) public withdrawalNonces;
    
    // ============ EVENTS ============
    
    /// @notice Emitted when a user deposits POL
    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 newBalance
    );
    
    /// @notice Emitted when a user withdraws POL
    event Withdrawal(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 newBalance,
        uint256 nonce
    );
    
    /// @notice Emitted when backend signer is updated
    event BackendSignerUpdated(
        address indexed oldSigner,
        address indexed newSigner
    );
    
    /// @notice Emitted when owner withdraws fees
    event FeeWithdrawal(
        address indexed owner,
        uint256 amount
    );
    
    // ============ ERRORS ============
    
    error InvalidAmount();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error ZeroAddress();
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _backendSigner) Ownable(msg.sender) {
        if (_backendSigner == address(0)) revert ZeroAddress();
        backendSigner = _backendSigner;
    }
    
    // ============ DEPOSIT FUNCTIONS ============
    
    /**
     * @notice Deposit POL to user's account
     * @dev Requires msg.value to be within MIN and MAX limits
     */
    function depositPOL() external payable nonReentrant whenNotPaused {
        if (msg.value < MIN_DEPOSIT || msg.value > MAX_DEPOSIT) {
            revert InvalidAmount();
        }
        
        // Update balances
        userBalances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(
            msg.sender,
            msg.value,
            block.timestamp,
            userBalances[msg.sender]
        );
    }
    
    /**
     * @notice Get user's current balance
     * @param user Address to check
     * @return User's POL balance in contract
     */
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @notice Withdraw POL from user's account
     * @dev Requires valid backend signature to prevent unauthorized withdrawals
     * @param amount Amount of POL to withdraw
     * @param nonce Unique nonce for this withdrawal (prevents replay)
     * @param signature Backend signature authorizing this withdrawal
     */
    function withdraw(
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        // Validate amount
        if (amount < MIN_WITHDRAWAL) revert InvalidAmount();
        if (userBalances[msg.sender] < amount) revert InsufficientBalance();
        
        // Validate nonce (prevent replay attacks)
        if (withdrawalNonces[msg.sender] >= nonce) revert NonceAlreadyUsed();
        
        // Verify backend signature
        bytes32 messageHash = getWithdrawalMessageHash(msg.sender, amount, nonce);
        if (!_verifySignature(messageHash, signature)) revert InvalidSignature();
        
        // Update nonce
        withdrawalNonces[msg.sender] = nonce;
        
        // Update balances
        userBalances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Transfer POL
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawal(
            msg.sender,
            amount,
            block.timestamp,
            userBalances[msg.sender],
            nonce
        );
    }
    
    /**
     * @notice Get withdrawal message hash for signature verification
     * @param user User address
     * @param amount Withdrawal amount
     * @param nonce Withdrawal nonce
     * @return Message hash for signing
     */
    function getWithdrawalMessageHash(
        address user,
        uint256 amount,
        uint256 nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            user,
            amount,
            nonce
        ));
    }
    
    /**
     * @notice Verify backend signature
     * @param messageHash Hash of withdrawal message
     * @param signature Backend signature
     * @return True if signature is valid
     */
    function _verifySignature(
        bytes32 messageHash,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        address signer = _recoverSigner(ethSignedMessageHash, signature);
        return signer == backendSigner;
    }
    
    /**
     * @notice Recover signer address from signature
     * @param ethSignedMessageHash Signed message hash
     * @param signature Signature bytes
     * @return Recovered signer address
     */
    function _recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes calldata signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update backend signer address
     * @param newSigner New backend signer address
     */
    function updateBackendSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();
        
        address oldSigner = backendSigner;
        backendSigner = newSigner;
        
        emit BackendSignerUpdated(oldSigner, newSigner);
    }
    
    /**
     * @notice Pause contract (emergency stop)
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
     * @notice Withdraw platform fees (contract balance - user deposits)
     * @dev Only owner can withdraw excess funds
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 contractBalance = address(this).balance;
        uint256 fees = contractBalance > totalDeposits ? contractBalance - totalDeposits : 0;
        
        if (fees == 0) revert InvalidAmount();
        
        (bool success, ) = owner().call{value: fees}("");
        if (!success) revert TransferFailed();
        
        emit FeeWithdrawal(owner(), fees);
    }
    
    /**
     * @notice Get contract statistics
     * @return totalDeposited Total POL deposited
     * @return contractBalance Current contract balance
     */
    function getStats() external view returns (
        uint256 totalDeposited,
        uint256 contractBalance
    ) {
        return (
            totalDeposits,
            address(this).balance
        );
    }
    
    // ============ FALLBACK ============
    
    /// @notice Receive POL directly (counts as deposit)
    receive() external payable {
        if (msg.value >= MIN_DEPOSIT && msg.value <= MAX_DEPOSIT) {
            userBalances[msg.sender] += msg.value;
            totalDeposits += msg.value;
            
            emit Deposit(
                msg.sender,
                msg.value,
                block.timestamp,
                userBalances[msg.sender]
            );
        }
    }
}