# User Guide: Blockchain Staking System

## Overview
Sistem staking Nectiq sekarang menggunakan **real NTIQ tokens** dari blockchain, bukan database balance.

---

## 🎯 How It Works

### Old System (Database):
```
User Balance: 1000 NTIQ (in database)
↓
Create Prediction
↓
Database deducts 100 NTIQ
↓
New Balance: 900 NTIQ (in database)
```

### New System (Blockchain):
```
User Wallet: 1000 NTIQ (on blockchain)
↓
Approve Contract to spend NTIQ
↓
Create Prediction
↓
Smart Contract locks 100 NTIQ
↓
Wallet Balance: 900 NTIQ (on blockchain)
```

---

## 📋 Requirements

### 1. Wallet Connection ✅
- User MUST connect wallet (MetaMask, WalletConnect, etc.)
- Wallet address is stored in database

### 2. NTIQ Tokens ✅
- User MUST have NTIQ tokens in wallet
- Minimum: 50 NTIQ for predictions
- Get tokens via airdrop: `POST /api/user/request-ntiq`

### 3. Contract Approval ⚠️ CRITICAL
- User MUST approve PredictionStaking contract to spend NTIQ
- This is done via wallet (MetaMask popup)
- Only needs to be done once (or when allowance runs out)

---

## 🔄 User Flow

### Step 1: Connect Wallet
```typescript
// Frontend connects wallet
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});

// Send wallet address to backend
await fetch('/api/auth/wallet-login', {
  method: 'POST',
  body: JSON.stringify({ walletAddress: accounts[0] })
});
```

### Step 2: Check NTIQ Balance
```typescript
const response = await fetch('/api/user/ntiq-status');
const data = await response.json();

if (data.needsAirdrop) {
  // Show "Request NTIQ" button
  console.log(data.message); 
  // "You need at least 50 NTIQ to make predictions..."
}
```

### Step 3: Request NTIQ Airdrop (if needed)
```typescript
const response = await fetch('/api/user/request-ntiq', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000 })
});

const { txHash, newBalance } = await response.json();
console.log(`Received 1000 NTIQ! TX: ${txHash}`);
console.log(`New balance: ${newBalance} NTIQ`);
```

### Step 4: Approve Contract (CRITICAL!)
```typescript
// Get contract addresses
const statusResponse = await fetch('/api/user/ntiq-status');
const { contracts } = await statusResponse.json();

// Approve PredictionStaking contract to spend NTIQ
const ntiqContract = new ethers.Contract(
  contracts.ntiqToken,
  ['function approve(address spender, uint256 amount) returns (bool)'],
  signer
);

// Approve unlimited amount (or specific amount)
const tx = await ntiqContract.approve(
  contracts.predictionStaking,
  ethers.MaxUint256  // Unlimited approval
);

await tx.wait();
console.log('Contract approved!');
```

### Step 5: Create Prediction
```typescript
const response = await fetch('/api/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cryptocurrency: 'bitcoin',
    predictedPrice: 50000,
    stakeAmount: 100,
    timeframe: '24h'
  })
});

const prediction = await response.json();
console.log('Prediction created!', prediction);
// Stake is now locked on blockchain
```

---

## ⚠️ Common Errors

### Error 1: "Wallet address required"
**Cause:** User hasn't connected wallet
**Solution:** Connect wallet first

### Error 2: "Insufficient NTIQ balance"
**Cause:** User doesn't have enough NTIQ tokens
**Solution:** Request airdrop via `/api/user/request-ntiq`

### Error 3: "Failed to lock stake on blockchain"
**Cause:** User hasn't approved contract to spend NTIQ
**Solution:** Approve contract first (Step 4 above)

**Error Message:**
```json
{
  "message": "Failed to lock stake on blockchain. Please ensure you have approved the contract to spend your NTIQ tokens.",
  "error": "execution reverted: ERC20: insufficient allowance"
}
```

### Error 4: "Insufficient allowance"
**Cause:** Contract approval amount is less than stake amount
**Solution:** Approve contract again with higher amount

---

## 🔍 Checking Approval Status

### Frontend Check:
```typescript
const ntiqContract = new ethers.Contract(
  ntiqTokenAddress,
  ['function allowance(address owner, address spender) view returns (uint256)'],
  provider
);

const allowance = await ntiqContract.allowance(
  userWalletAddress,
  predictionStakingAddress
);

console.log(`Current allowance: ${ethers.formatEther(allowance)} NTIQ`);

if (allowance < stakeAmount) {
  // Need to approve
  console.log('Please approve contract first');
}
```

---

## 📊 API Endpoints

### GET /api/user/ntiq-status
Check NTIQ balance and get contract addresses

**Response:**
```json
{
  "hasWallet": true,
  "balance": 1000,
  "minRequired": 50,
  "needsAirdrop": false,
  "canStake": true,
  "message": "You have 1000.00 NTIQ. You can make predictions!",
  "contracts": {
    "ntiqToken": "0x...",
    "predictionStaking": "0x..."
  },
  "instructions": {
    "step1": "Request NTIQ airdrop if balance is low",
    "step2": "Approve PredictionStaking contract to spend your NTIQ",
    "step3": "Create prediction - stake will be locked on blockchain"
  }
}
```

### POST /api/user/request-ntiq
Request NTIQ airdrop

**Request:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully airdropped 1000 NTIQ to your wallet",
  "amount": 1000,
  "previousBalance": 0,
  "newBalance": 1000,
  "txHash": "0x...",
  "polygonscanUrl": "https://amoy.polygonscan.com/tx/0x..."
}
```

### POST /api/predictions
Create prediction (locks stake on blockchain)

**Request:**
```json
{
  "cryptocurrency": "bitcoin",
  "predictedPrice": 50000,
  "stakeAmount": 100,
  "timeframe": "24h"
}
```

**Success Response:**
```json
{
  "id": 123,
  "userId": 1,
  "cryptocurrency": "bitcoin",
  "predictedPrice": "50000",
  "stakeAmount": 100,
  "timeframe": "24h",
  "status": "pending",
  "blockchainStakeHash": "0x...",
  "blockchainStatus": "confirmed"
}
```

**Error Response (No Approval):**
```json
{
  "message": "Failed to lock stake on blockchain. Please ensure you have approved the contract to spend your NTIQ tokens.",
  "error": "execution reverted: ERC20: insufficient allowance"
}
```

---

## 🎯 Frontend Implementation Checklist

### Required UI Elements:

1. **Wallet Connection Button** ✅
   - Connect wallet
   - Show connected address
   - Disconnect option

2. **NTIQ Balance Display** ✅
   - Show current NTIQ balance
   - Update in real-time
   - Show "Request Airdrop" button if low

3. **Approval Status Indicator** ⚠️ IMPORTANT
   - Check if contract is approved
   - Show "Approve Contract" button if not approved
   - Show approval transaction status

4. **Prediction Form** ✅
   - Disable if no wallet
   - Disable if insufficient balance
   - Disable if not approved
   - Show clear error messages

### Example UI Flow:
```
┌─────────────────────────────────────┐
│  Connect Wallet                     │
│  [Connect MetaMask]                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  NTIQ Balance: 0 NTIQ               │
│  [Request 1000 NTIQ Airdrop]        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  NTIQ Balance: 1000 NTIQ ✅         │
│  Contract Approval: Not Approved ❌ │
│  [Approve Contract]                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  NTIQ Balance: 1000 NTIQ ✅         │
│  Contract Approval: Approved ✅     │
│  [Create Prediction] (enabled)      │
└─────────────────────────────────────┘
```

---

## 🔐 Security Notes

1. **Approval is Safe** ✅
   - Approving contract doesn't transfer tokens
   - It only gives permission to transfer
   - Can be revoked anytime

2. **Smart Contract is Audited** ✅
   - Uses OpenZeppelin standards
   - ReentrancyGuard protection
   - Pausable in emergency

3. **Transactions are Transparent** ✅
   - All transactions visible on Polygonscan
   - Users can verify everything
   - No hidden fees

---

## 🧪 Testing Checklist

- [ ] Connect wallet successfully
- [ ] Check NTIQ balance (should be 0 initially)
- [ ] Request NTIQ airdrop (should receive 1000 NTIQ)
- [ ] Verify balance updated (should show 1000 NTIQ)
- [ ] Try create prediction without approval (should fail)
- [ ] Approve contract to spend NTIQ
- [ ] Create prediction (should succeed)
- [ ] Verify stake locked on blockchain (check Polygonscan)
- [ ] Wait for prediction to complete
- [ ] Verify reward released on blockchain

---

## 📝 Summary

**Key Points:**
1. ✅ System uses real blockchain balance
2. ✅ Users need NTIQ tokens (get via airdrop)
3. ⚠️ Users MUST approve contract before staking
4. ✅ All stakes locked on blockchain
5. ✅ All rewards distributed on blockchain
6. ✅ Fully transparent and verifiable

**User Benefits:**
- 🔒 True ownership of tokens
- 🔍 Transparent transactions
- 🛡️ Smart contract security
- 📊 Verifiable on blockchain
- 💰 Real token rewards

---

**Status:** ✅ System is working correctly!
**Issue:** Users need to approve contract before creating predictions
**Solution:** Add approval flow in frontend
