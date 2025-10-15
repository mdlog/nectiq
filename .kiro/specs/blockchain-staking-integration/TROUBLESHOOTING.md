# Troubleshooting Guide

## Common Errors & Solutions

### Error 1: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Cause:** Backend returning HTML instead of JSON (usually authentication error)

**Solutions:**
1. **Check if user is logged in**
   ```javascript
   // Check in browser console
   fetch('/api/user').then(r => r.json()).then(console.log)
   ```

2. **Connect wallet first**
   - User must connect wallet via MetaMask/WalletConnect
   - Wallet address must be stored in session

3. **Check session**
   ```javascript
   // In browser console
   document.cookie // Should show session cookie
   ```

---

### Error 2: "Please connect your wallet first"

**Cause:** User wallet not connected

**Solution:**
```javascript
// Connect wallet
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});

// Login with wallet
await fetch('/api/auth/wallet-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: accounts[0] })
});
```

---

### Error 3: "Insufficient NTIQ balance"

**Cause:** User doesn't have enough NTIQ tokens

**Solution:**
```javascript
// Request airdrop
await fetch('/api/user/request-ntiq', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000 })
});
```

---

### Error 4: "Failed to lock stake on blockchain"

**Cause:** Contract not approved to spend NTIQ

**Solution:**
```javascript
// Get contract addresses
const statusRes = await fetch('/api/user/ntiq-status');
const { contracts } = await statusRes.json();

// Approve contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const ntiqABI = ['function approve(address spender, uint256 amount) returns (bool)'];
const ntiqContract = new ethers.Contract(contracts.ntiqToken, ntiqABI, signer);

const tx = await ntiqContract.approve(
  contracts.predictionStaking,
  ethers.MaxUint256
);
await tx.wait();

console.log('Contract approved!');
```

---

## Step-by-Step Testing

### 1. Check Authentication
```javascript
// Should return user data
fetch('/api/user')
  .then(r => r.json())
  .then(console.log)
```

### 2. Check Wallet Connection
```javascript
// Should return wallet address
fetch('/api/user')
  .then(r => r.json())
  .then(data => console.log('Wallet:', data.walletAddress))
```

### 3. Check NTIQ Balance
```javascript
fetch('/api/user/ntiq-status')
  .then(r => r.json())
  .then(console.log)
```

### 4. Request Airdrop (if needed)
```javascript
fetch('/api/user/request-ntiq', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000 })
})
  .then(r => r.json())
  .then(console.log)
```

### 5. Check Approval Status
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
const ntiqAddress = "0x..."; // From /api/user/ntiq-status
const stakingAddress = "0x..."; // From /api/user/ntiq-status
const userAddress = "0x..."; // Your wallet

const ntiqABI = ['function allowance(address owner, address spender) view returns (uint256)'];
const ntiqContract = new ethers.Contract(ntiqAddress, ntiqABI, provider);

const allowance = await ntiqContract.allowance(userAddress, stakingAddress);
console.log('Allowance:', ethers.formatEther(allowance), 'NTIQ');
```

### 6. Approve Contract (if needed)
```javascript
const signer = await provider.getSigner();
const ntiqContract = new ethers.Contract(ntiqAddress, ntiqABI, signer);

const tx = await ntiqContract.approve(stakingAddress, ethers.MaxUint256);
await tx.wait();
console.log('Approved!');
```

### 7. Create Prediction
```javascript
fetch('/api/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cryptocurrency: 'bitcoin',
    predictedPrice: 50000,
    stakeAmount: 100,
    timeframe: '24h'
  })
})
  .then(r => r.json())
  .then(console.log)
```

---

## Backend Logs to Check

### Successful Flow:
```
💰 [PREDICTION] User 1 blockchain balance: 1000 NTIQ
✅ [PREDICTION] Balance check passed. Proceeding to lock stake on blockchain...
🔗 [BLOCKCHAIN] Stake locked on blockchain: 0x...
✅ [PREDICTION] Created successfully: ID 123, Blockchain TX: 0x...
```

### Failed - No Wallet:
```
⚠️ [PREDICTION] User has no wallet address
```

### Failed - Insufficient Balance:
```
💰 [PREDICTION] User 1 blockchain balance: 10 NTIQ
❌ Insufficient NTIQ balance. Required: 100, Available: 10
```

### Failed - Not Approved:
```
✅ [PREDICTION] Balance check passed. Proceeding to lock stake on blockchain...
❌ [BLOCKCHAIN] Failed to lock stake on blockchain: execution reverted: ERC20: insufficient allowance
```

---

## Quick Fix Commands

### Complete Setup (Run in Browser Console):
```javascript
// 1. Connect wallet
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
console.log('Connected:', accounts[0]);

// 2. Login
await fetch('/api/auth/wallet-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: accounts[0] })
});
console.log('Logged in');

// 3. Request NTIQ
const airdropRes = await fetch('/api/user/request-ntiq', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000 })
});
const airdropData = await airdropRes.json();
console.log('Airdrop:', airdropData);

// 4. Get contract addresses
const statusRes = await fetch('/api/user/ntiq-status');
const { contracts } = await statusRes.json();
console.log('Contracts:', contracts);

// 5. Approve contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const ntiqABI = ['function approve(address spender, uint256 amount) returns (bool)'];
const ntiqContract = new ethers.Contract(contracts.ntiqToken, ntiqABI, signer);
const tx = await ntiqContract.approve(contracts.predictionStaking, ethers.MaxUint256);
await tx.wait();
console.log('Approved!');

// 6. Now you can create predictions!
console.log('✅ Setup complete! You can now create predictions.');
```

---

## Environment Variables to Check

### Backend (.env):
```bash
NTIQ_TOKEN_SIMPLE_ADDRESS=0x...
PREDICTION_STAKING_ADDRESS=0x...
BATTLE_ESCROW_ADDRESS=0x...
PARLAY_STAKING_ADDRESS=0x...
TOURNAMENT_POOL_ADDRESS=0x...
DEPLOYER_PRIVATE_KEY=0x...
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

---

## Network Configuration

### Polygon Amoy Testnet:
- **Chain ID:** 80002
- **RPC URL:** https://rpc-amoy.polygon.technology
- **Explorer:** https://amoy.polygonscan.com
- **Currency:** POL (formerly MATIC)

### Add to MetaMask:
```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com']
  }]
});
```

---

## Status: Ready for Testing! ✅

All systems are integrated and ready. Follow the troubleshooting steps above if you encounter any issues.
