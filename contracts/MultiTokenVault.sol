// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MultiTokenVault
 * @dev Manages multi-token deposits and withdrawals for NECTIQ platform on Polygon Amoy
 * @notice Supports POL (native), WETH, USDC, and LINK tokens
 * @author NECTIQ Team
 */
contract MultiTokenVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ STATE VARIABLES ============
    
    /// @notice Mapping of user addresses to token addresses to their balances
    mapping(address => mapping(address => uint256)) public userBalances;
    
    /// @notice Total deposits per token
    mapping(address => uint256) public totalDeposits;
    
    /// @notice Supported tokens (address(0) = native POL)
    mapping(address => bool) public supportedTokens;
    
    /// @notice Token addresses
    address public constant NATIVE_TOKEN = address(0); // POL
    address public immutable WETH;
    address public immutable USDC;
    address public immutable LINK;
    
    /// @notice Minimum deposit amounts per token (in token's decimals)
    mapping(address => uint256) public minDeposit;
    
    /// @notice Maximum deposit amounts per token (in token's decimals)
    mapping(address => uint256) public maxDeposit;
    
    /// @notice Backend signer address for withdrawal authorization
    address public backendSigner;
    
    /// @notice Nonce for preventing replay attacks
    mapping(address => uint256) public withdrawalNonces;
    
    // ============ EVENTS ============
    
    /// @notice Emitted when a user deposits tokens
    event Deposit(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp,
        uint256 newBalance
    );
    
    /// @notice Emitted when a user withdraws tokens
    event Withdrawal(
        address indexed user,
        address indexed token,
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
    
    /// @notice Emitted when a token is added/removed from supported list
    event TokenSupportUpdated(
        address indexed token,
        bool supported
    );
    
    /// @notice Emitted when deposit limits are updated
    event DepositLimitsUpdated(
        address indexed token,
        uint256 minDeposit,
        uint256 maxDeposit
    );
    
    // ============ ERRORS ============
    
    error InvalidAmount();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error ZeroAddress();
    error TokenNotSupported();
    error InvalidToken();
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @notice Initialize the vault with token addresses and backend signer
     * @param _backendSigner Address authorized to sign withdrawal requests
     * @param _weth WETH token address on Polygon Amoy
     * @param _usdc USDC token address on Polygon Amoy
     * @param _link LINK token address on Polygon Amoy
     */
    constructor(
        address _backendSigner,
        address _weth,
        address _usdc,
        address _link
    ) Ownable(msg.sender) {
        if (_backendSigner == address(0)) revert ZeroAddress();
        if (_weth == address(0) || _usdc == address(0) || _link == address(0)) {
            revert InvalidToken();
        }
        
        backendSigner = _backendSigner;
        WETH = _weth;
        USDC = _usdc;
        LINK = _link;
        
        // Enable supported tokens
        supportedTokens[NATIVE_TOKEN] = true; // POL
        supportedTokens[_weth] = true;
        supportedTokens[_usdc] = true;
        supportedTokens[_link] = true;
        
        // Set default deposit limits for POL (18 decimals)
        minDeposit[NATIVE_TOKEN] = 0.01 ether; // 0.01 POL
        maxDeposit[NATIVE_TOKEN] = 1000 ether; // 1000 POL
        
        // Set default deposit limits for WETH (18 decimals)
        minDeposit[_weth] = 0.001 ether; // 0.001 WETH
        maxDeposit[_weth] = 10 ether; // 10 WETH
        
        // Set default deposit limits for USDC (6 decimals)
        minDeposit[_usdc] = 1 * 10**6; // 1 USDC
        maxDeposit[_usdc] = 10000 * 10**6; // 10,000 USDC
        
        // Set default deposit limits for LINK (18 decimals)
        minDeposit[_link] = 0.1 ether; // 0.1 LINK
        maxDeposit[_link] = 1000 ether; // 1000 LINK
    }
    
    // ============ DEPOSIT FUNCTIONS ============
    
    /**
     * @notice Deposit native POL to user's account
     * @dev Requires msg.value to be within MIN and MAX limits
     */
    function depositPOL() external payable nonReentrant whenNotPaused {
        if (msg.value < minDeposit[NATIVE_TOKEN] || msg.value > maxDeposit[NATIVE_TOKEN]) {
            revert InvalidAmount();
        }
        
        // Update balances
        userBalances[msg.sender][NATIVE_TOKEN] += msg.value;
        totalDeposits[NATIVE_TOKEN] += msg.value;
        
        emit Deposit(
            msg.sender,
            NATIVE_TOKEN,
            msg.value,
            block.timestamp,
            userBalances[msg.sender][NATIVE_TOKEN]
        );
    }
    
    /**
     * @notice Deposit ERC20 tokens to user's account
     * @param token Address of the token to deposit (WETH, USDC, or LINK)
     * @param amount Amount of tokens to deposit (in token's decimals)
     */
    function depositToken(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (!supportedTokens[token] || token == NATIVE_TOKEN) {
            revert TokenNotSupported();
        }
        
        if (amount < minDeposit[token] || amount > maxDeposit[token]) {
            revert InvalidAmount();
        }
        
        // Transfer tokens from user to vault
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update balances
        userBalances[msg.sender][token] += amount;
        totalDeposits[token] += amount;
        
        emit Deposit(
            msg.sender,
            token,
            amount,
            block.timestamp,
            userBalances[msg.sender][token]
        );
    }
    
    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @notice Withdraw native POL from user's account
     * @param amount Amount of POL to withdraw (in wei)
     * @param nonce Unique nonce for this withdrawal
     * @param signature Backend signature authorizing this withdrawal
     */
    function withdrawPOL(
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) external nonReentrant whenNotPaused {
        // Verify signature
        if (!_verifyWithdrawalSignature(msg.sender, NATIVE_TOKEN, amount, nonce, signature)) {
            revert InvalidSignature();
        }
        
        // Check nonce hasn't been used
        if (withdrawalNonces[msg.sender] >= nonce) {
            revert NonceAlreadyUsed();
        }
        
        // Check balance
        if (userBalances[msg.sender][NATIVE_TOKEN] < amount) {
            revert InsufficientBalance();
        }
        
        // Update nonce
        withdrawalNonces[msg.sender] = nonce;
        
        // Update balances
        userBalances[msg.sender][NATIVE_TOKEN] -= amount;
        totalDeposits[NATIVE_TOKEN] -= amount;
        
        // Transfer POL to user
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawal(
            msg.sender,
            NATIVE_TOKEN,
            amount,
            block.timestamp,
            userBalances[msg.sender][NATIVE_TOKEN],
            nonce
        );
    }
    
    /**
     * @notice Withdraw ERC20 tokens from user's account
     * @param token Address of the token to withdraw (WETH, USDC, or LINK)
     * @param amount Amount of tokens to withdraw (in token's decimals)
     * @param nonce Unique nonce for this withdrawal
     * @param signature Backend signature authorizing this withdrawal
     */
    function withdrawToken(
        address token,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) external nonReentrant whenNotPaused {
        if (!supportedTokens[token] || token == NATIVE_TOKEN) {
            revert TokenNotSupported();
        }
        
        // Verify signature
        if (!_verifyWithdrawalSignature(msg.sender, token, amount, nonce, signature)) {
            revert InvalidSignature();
        }
        
        // Check nonce hasn't been used
        if (withdrawalNonces[msg.sender] >= nonce) {
            revert NonceAlreadyUsed();
        }
        
        // Check balance
        if (userBalances[msg.sender][token] < amount) {
            revert InsufficientBalance();
        }
        
        // Update nonce
        withdrawalNonces[msg.sender] = nonce;
        
        // Update balances
        userBalances[msg.sender][token] -= amount;
        totalDeposits[token] -= amount;
        
        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawal(
            msg.sender,
            token,
            amount,
            block.timestamp,
            userBalances[msg.sender][token],
            nonce
        );
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @notice Verify withdrawal signature from backend
     * @param user User address requesting withdrawal
     * @param token Token address
     * @param amount Withdrawal amount
     * @param nonce Withdrawal nonce
     * @param signature Backend signature
     * @return bool True if signature is valid
     */
    function _verifyWithdrawalSignature(
        address user,
        address token,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) internal view returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(user, token, amount, nonce, address(this))
        );
        bytes32 ethSignedMessageHash = _getEthSignedMessageHash(messageHash);
        
        return _recoverSigner(ethSignedMessageHash, signature) == backendSigner;
    }
    
    /**
     * @notice Get Ethereum signed message hash
     */
    function _getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
    }
    
    /**
     * @notice Recover signer address from signature
     */
    function _recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }
    
    /**
     * @notice Split signature into r, s, v components
     */
    function _splitSignature(bytes memory sig) internal pure returns (
        bytes32 r,
        bytes32 s,
        uint8 v
    ) {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user's balance for a specific token
     * @param user User address
     * @param token Token address (address(0) for POL)
     * @return uint256 User's balance
     */
    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }
    
    /**
     * @notice Get user's balances for all supported tokens
     * @param user User address
     * @return pol POL balance
     * @return weth WETH balance
     * @return usdc USDC balance
     * @return link LINK balance
     */
    function getUserBalances(address user) external view returns (
        uint256 pol,
        uint256 weth,
        uint256 usdc,
        uint256 link
    ) {
        pol = userBalances[user][NATIVE_TOKEN];
        weth = userBalances[user][WETH];
        usdc = userBalances[user][USDC];
        link = userBalances[user][LINK];
    }
    
    /**
     * @notice Check if a token is supported
     * @param token Token address to check
     * @return bool True if token is supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
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
     * @notice Update token support status
     * @param token Token address
     * @param supported Whether token is supported
     */
    function updateTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }
    
    /**
     * @notice Update deposit limits for a token
     * @param token Token address
     * @param min Minimum deposit amount
     * @param max Maximum deposit amount
     */
    function updateDepositLimits(
        address token,
        uint256 min,
        uint256 max
    ) external onlyOwner {
        if (min >= max) revert InvalidAmount();
        
        minDeposit[token] = min;
        maxDeposit[token] = max;
        
        emit DepositLimitsUpdated(token, min, max);
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdrawal of POL (owner only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawPOL(uint256 amount) external onlyOwner {
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
    
    /**
     * @notice Emergency withdrawal of ERC20 tokens (owner only)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /// @notice Allow contract to receive POL directly
    receive() external payable {
        // Direct POL transfers go to contract balance but not credited to users
        // Users must use depositPOL() function for proper accounting
    }
}

