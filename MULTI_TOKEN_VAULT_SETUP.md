# Multi-Token Vault Setup Guide

## 🎉 Deployment Complete!

**Contract Address:** `0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2`  
**Network:** Polygon Amoy Testnet (Chain ID: 80002)  
**Explorer:** https://amoy.polygonscan.com/address/0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2

---

## 📊 Supported Tokens

| Token | Address | Decimals | Min Deposit | Max Deposit |
|-------|---------|----------|-------------|-------------|
| POL | `0x0000000000000000000000000000000000000000` (native) | 18 | 0.01 POL | 1000 POL |
| WETH | `0x52eF3d68BaB452a294342DC3e5f464d7f610f72E` | 18 | 0.001 WETH | 10 WETH |
| USDC | `0x8B0180f2101c8260d49339abfEe87927412494B4` | 6 | 1 USDC | 10,000 USDC |
| LINK | `0x0fd9E8d3Af1aAeE056eb9e902c3A762a667b1904` | 18 | 0.1 LINK | 1000 LINK |

---

## 🔄 How It Works

### Deposit Flow
1. User calls `depositPOL()` or `depositToken(token, amount)` on contract
2. Smart contract emits `Deposit` event
3. Backend listener catches event and creates deposit record
4. User's NTIQ balance increases (1 token = 1000 NTIQ)
5. Transaction appears in admin panel

### Withdrawal Flow
1. User requests withdrawal from frontend
2. Backend signs withdrawal request (using `BACKEND_SIGNER_PRIVATE_KEY`)
3. User calls `withdrawPOL()` or `withdrawToken()` with signature
4. Smart contract emits `Withdrawal` event
5. Backend listener catches event and creates withdrawal record
6. User's NTIQ balance decreases
7. Transaction appears in admin panel

---

## 🛠️ Backend Integration

### Files Created/Modified

#### 1. `contracts/MultiTokenVault.sol` (494 lines)
- Supports POL (native), WETH, USDC, LINK
- Secure backend-signed withdrawals
- ReentrancyGuard, Pausable, Ownable
- SafeERC20 for token transfers

#### 2. `server/services/multiTokenVaultEventListener.ts` (340 lines)
- Monitors `Deposit` events for all tokens
- Monitors `Withdrawal` events for all tokens
- Auto-creates deposit/withdrawal records in database
- Converts token amounts to NTIQ (1 token = 1000 NTIQ)

#### 3. `server/index.ts`
- Imports `multiTokenVaultEventListener`
- Starts listener on server startup
- Conditional initialization (requires `MULTI_TOKEN_VAULT_ADDRESS`)

#### 4. `.env` and `.env.example`
```bash
MULTI_TOKEN_VAULT_ADDRESS=0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2
VITE_MULTI_TOKEN_VAULT_ADDRESS=0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2
AMOY_WETH_ADDRESS=0x52eF3d68BaB452a294342DC3e5f464d7f610f72E
AMOY_USDC_ADDRESS=0x8B0180f2101c8260d49339abfEe87927412494B4
AMOY_LINK_ADDRESS=0x0fd9E8d3Af1aAeE056eb9e902c3A762a667b1904
```

---

## 🧪 Testing Guide

### 1. Start the Server
```bash
npm run dev
```

You should see:
```
🔧 Initializing Multi-Token Vault Event Listener...
✅ Multi-token vault event listener started successfully
```

### 2. Get Test Tokens

#### POL (Native):
- Visit: https://faucet.polygon.technology
- Connect wallet
- Request POL

#### WETH:
- Wrap POL at WETH contract: https://amoy.polygonscan.com/address/0x52eF3d68BaB452a294342DC3e5f464d7f610f72E#writeContract
- Call `deposit()` with POL amount

#### USDC:
- Visit: https://faucet.circle.com
- Select "Polygon Amoy"
- Request USDC

#### LINK:
- Visit: https://faucets.chain.link/polygon-amoy
- Request LINK

### 3. Test Deposit (via Polygonscan)

1. Go to contract: https://amoy.polygonscan.com/address/0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2#writeContract
2. Connect wallet
3. For POL:
   - Call `depositPOL()`
   - Enter amount in POL field (e.g., 0.1)
4. For ERC-20 (WETH, USDC, LINK):
   - First approve contract: Go to token contract → `approve(spender, amount)`
   - Then call `depositToken(tokenAddress, amount)`
5. Confirm transaction
6. Check backend logs for deposit event
7. Check admin panel for new transaction

### 4. Test Withdrawal

⚠️ **Withdrawal requires backend signature implementation**

Currently, withdrawals need:
1. User requests withdrawal from frontend
2. Backend API creates signature using `BACKEND_SIGNER_PRIVATE_KEY`:
   ```typescript
   const messageHash = ethers.solidityPackedKeccak256(
     ['address', 'address', 'uint256', 'uint256', 'address'],
     [userAddress, tokenAddress, amount, nonce, contractAddress]
   );
   const signature = await signer.signMessage(ethers.getBytes(messageHash));
   ```
3. Frontend calls `withdrawPOL()` or `withdrawToken()` with signature

---

## 🎯 Next Steps for Full Integration

### Frontend Updates Needed

1. **Add Multi-Token Selector**
   - Update `multi-chain-financial.tsx` or create new component
   - Token dropdown: POL, WETH, USDC, LINK
   - Display balance for each token
   - Token-specific input validation

2. **ERC-20 Approval Flow**
   - For WETH, USDC, LINK deposits
   - Check allowance before deposit
   - Approve → Deposit two-step process

3. **Withdrawal Signature API**
   - Create `/api/vault/sign-withdrawal` endpoint
   - Verify user balance
   - Generate signature
   - Return signature to frontend

4. **Contract Interaction Hooks**
   ```typescript
   // Example wagmi hooks needed
   const { write: depositPOL } = useContractWrite({
     address: MULTI_TOKEN_VAULT_ADDRESS,
     abi: MULTI_TOKEN_VAULT_ABI,
     functionName: 'depositPOL'
   });
   
   const { write: depositToken } = useContractWrite({
     address: MULTI_TOKEN_VAULT_ADDRESS,
     abi: MULTI_TOKEN_VAULT_ABI,
     functionName: 'depositToken'
   });
   ```

### Backend Updates Needed

1. **Withdrawal Signature API**
   ```typescript
   app.post('/api/vault/sign-withdrawal', async (req, res) => {
     // Verify user authentication
     // Check user balance
     // Generate signature
     // Return signature
   });
   ```

2. **Balance Verification**
   - Query contract for user balances
   - Compare with database records
   - Handle discrepancies

---

## 📝 Contract ABIs

### MultiTokenVault ABI (Essential Functions)

```json
[
  "function depositPOL() external payable",
  "function depositToken(address token, uint256 amount) external",
  "function withdrawPOL(uint256 amount, uint256 nonce, bytes memory signature) external",
  "function withdrawToken(address token, uint256 amount, uint256 nonce, bytes memory signature) external",
  "function getUserBalance(address user, address token) external view returns (uint256)",
  "function getUserBalances(address user) external view returns (uint256 pol, uint256 weth, uint256 usdc, uint256 link)",
  "event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp, uint256 newBalance)",
  "event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 timestamp, uint256 newBalance, uint256 nonce)"
]
```

---

## 🔐 Security Features

- ✅ **Backend-Signed Withdrawals**: Requires valid signature from `BACKEND_SIGNER_ADDRESS`
- ✅ **Nonce Protection**: Prevents replay attacks
- ✅ **ReentrancyGuard**: Protects against reentrancy attacks
- ✅ **Pausable**: Owner can pause in emergency
- ✅ **SafeERC20**: Secure token transfers
- ✅ **Deposit Limits**: Min/max per token
- ✅ **Emergency Withdrawals**: Owner can rescue funds

---

## 📊 NTIQ Conversion Rate

All tokens convert to NTIQ at: **1 Token = 1000 NTIQ**

Examples:
- 0.1 POL → 100 NTIQ
- 0.001 WETH → 1 NTIQ
- 5 USDC → 5000 NTIQ
- 0.5 LINK → 500 NTIQ

---

## 🚀 Ready to Use!

Backend is fully configured and ready. Complete frontend integration to enable full multi-token deposit/withdrawal functionality for users.

**Start testing:** `npm run dev`
