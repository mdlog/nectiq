# 🚀 MULTI-TOKEN VAULT DEPLOYMENT & TESTING GUIDE

Complete step-by-step guide to deploy and test the MultiTokenVault smart contract on Polygon Amoy with real NTIQ token integration.

---

## ✅ FILES CREATED

All necessary files have been created:

### Smart Contract & Deployment
- ✅ `hardhat.config.cjs` - Hardhat configuration for Polygon Amoy
- ✅ `contracts/MultiTokenVault.sol` - Multi-token vault smart contract
- ✅ `contracts/NTIQToken.sol` - NTIQ token smart contract (deployed)
- ✅ `scripts/deploy-multi-token-vault.cjs` - Deployment script with verification
- ✅ `scripts/deploy-ntiq-polygon-amoy.cjs` - NTIQ token deployment script
- ✅ `VAULT_ENV_SETUP.txt` - Environment variables guide

### Backend Integration
- ✅ `server/services/multiTokenVaultEventListener.ts` - Event listener service
- ✅ `server/services/ntiqTokenService.ts` - NTIQ token interaction service
- ✅ `server/routes.ts` - Added `/api/user/real-balance` endpoint
- ✅ `server/storage.ts` - Real token balance integration

### Frontend Components
- ✅ `client/src/components/MultiTokenVaultDepositModal.tsx` - Deposit UI
- ✅ `client/src/components/MultiTokenVaultWithdrawalModal.tsx` - Withdrawal UI
- ✅ `client/src/components/transaction-history.tsx` - Transaction history
- ✅ `client/src/pages/user-dashboard.tsx` - Real balance integration

---

## 📋 DEPLOYMENT STEPS

### **STEP 1: Install Hardhat Dependencies**

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

**Expected output:**
```
added 200+ packages in 30s
```

---

### **STEP 2: Setup Environment Variables**

1. Open your `.env` file
2. Add the following variables (see `VAULT_ENV_SETUP.txt` for detailed guide):

```bash
# Smart Contract Deployment
DEPLOYER_PRIVATE_KEY="your-deployer-wallet-private-key"
BACKEND_SIGNER_ADDRESS="0xYourBackendSignerAddress"
BACKEND_SIGNER_PRIVATE_KEY="your-backend-signer-private-key"

# Polygonscan API
POLYGONSCAN_API_KEY="your-polygonscan-api-key"

# Will be filled after deployment
VAULT_CONTRACT_ADDRESS=""
VITE_VAULT_CONTRACT_ADDRESS=""
```

---

### **STEP 3: Get Testnet POL from Faucet**

1. Go to: https://faucet.polygon.technology/
2. Select **"Polygon Amoy"**
3. Enter your **deployer wallet address**
4. Click **"Submit"**
5. Wait 1-2 minutes
6. Verify balance: https://amoy.polygonscan.com/address/YOUR_ADDRESS

**You need:**
- Deployer wallet: **0.5 POL** (for gas fees)
- Backend signer: **0.1 POL** (optional, for testing)

---

### **STEP 4: Compile Smart Contract**

```bash
npx hardhat compile
```

**Expected output:**
```
Compiled 10 Solidity files successfully
```

---

### **STEP 5: Deploy to Polygon Amoy**

```bash
npx hardhat run scripts/deploy-vault.cjs --network amoy
```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║  🚀 Deploying NectiqVault to Polygon Amoy Testnet    ║
╚════════════════════════════════════════════════════════╝

📋 Configuration:
   Backend Signer: 0xYourBackendSignerAddress
   Network: amoy
   Chain ID: 80002

💰 Deployer Account:
   Address: 0xYourDeployerAddress
   Balance: 0.5 POL

🔨 Deploying NectiqVault contract...
✅ NectiqVault deployed to: 0xABC123...

⏳ Waiting for 5 block confirmations...
✅ Confirmed!

💾 Deployment info saved to: deployment-vault.json

🔍 Verifying contract on Polygonscan...
✅ Contract verified on Polygonscan!

╔════════════════════════════════════════════════════════╗
║             ✅ DEPLOYMENT SUCCESSFUL!                 ║
╚════════════════════════════════════════════════════════╝

📋 Contract Details:
   Address: 0xABC123DEF456...
   Network: amoy (Chain ID: 80002)
   Backend Signer: 0xYourBackendSignerAddress
   Deployer: 0xYourDeployerAddress

🔗 View on Polygonscan:
   https://amoy.polygonscan.com/address/0xABC123DEF456...

📝 Next Steps:
   1. Add to .env:
      VAULT_CONTRACT_ADDRESS="0xABC123DEF456..."
      VITE_VAULT_CONTRACT_ADDRESS="0xABC123DEF456..."
   2. Restart your server
   3. Test deposit/withdrawal
```

---

### **STEP 6: Update Environment Variables**

Copy the deployed contract address and add to `.env`:

```bash
VAULT_CONTRACT_ADDRESS="0xYourDeployedContractAddress"
VITE_VAULT_CONTRACT_ADDRESS="0xYourDeployedContractAddress"
```

**⚠️ IMPORTANT:** Both variables must have the SAME address!

---

### **STEP 7: Initialize Vault Event Listener in Server**

Open `server/index.ts` and add near the top (after imports):

```typescript
import { initVaultEventListener } from './services/vaultEventListener';

// After storage initialization
const vaultListener = initVaultEventListener(storage);
vaultListener.start().catch(err => {
  console.error('Failed to start vault event listener:', err);
});
```

---

### **STEP 8: Restart Server**

```bash
# Stop server (Ctrl+C if running)
# Then restart:
npm run dev
```

**Expected output should include:**
```
🎧 [VAULT-LISTENER] Starting to listen to vault events...
📍 [VAULT-LISTENER] Contract address: 0xYourContractAddress
🌐 [VAULT-LISTENER] RPC endpoint: https://rpc-amoy.polygon.technology
✅ [VAULT-LISTENER] Now listening to vault events on Polygon Amoy
```

---

## 🧪 TESTING

### **TEST 1: Manual Deposit via Polygonscan**

1. Go to: `https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS#writeContract`
2. Click **"Connect to Web3"** → Connect MetaMask
3. Find **`depositPOL`** function
4. Enter amount: `0.01` (this is in ETH/POL units)
5. Click **"Write"**
6. Confirm transaction in MetaMask
7. Wait for confirmation (≈5 seconds)

**Expected backend logs:**
```
💰 [VAULT-LISTENER] Deposit event detected: {
  user: '0xYourAddress',
  amount: '0.01',
  timestamp: '2024-01-15T10:30:00.000Z',
  txHash: '0x123abc...',
  blockNumber: 12345678
}
🔄 [VAULT-LISTENER] Processing deposit for 0xYourAddress...
💱 [VAULT-LISTENER] Conversion: 0.01 POL → 10 NTIQ (rate: 1000)
✅ [VAULT-LISTENER] Credited 10 NTIQ to user 1
```

---

### **TEST 2: Frontend Deposit via Modal**

1. Add the component to your user dashboard:

```tsx
import { VaultDepositModal } from '@/components/VaultDepositModal';

// In your component:
const [showDepositModal, setShowDepositModal] = useState(false);

// Add button:
<Button onClick={() => setShowDepositModal(true)}>
  Deposit POL
</Button>

// Add modal:
<VaultDepositModal
  isOpen={showDepositModal}
  onClose={() => setShowDepositModal(false)}
  onSuccess={() => {
    // Refresh balance
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  }}
/>
```

2. Test deposit flow:
   - Click "Deposit POL"
   - Enter amount (e.g., 0.05)
   - Click "Deposit POL"
   - Confirm in MetaMask
   - Wait for confirmation
   - See success message

---

### **TEST 3: Frontend Withdrawal via Modal**

1. Add the component to your user dashboard:

```tsx
import { VaultWithdrawalModal } from '@/components/VaultWithdrawalModal';

// In your component:
const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

// Add button:
<Button onClick={() => setShowWithdrawalModal(true)}>
  Withdraw to Wallet
</Button>

// Add modal:
<VaultWithdrawalModal
  isOpen={showWithdrawalModal}
  onClose={() => setShowWithdrawalModal(false)}
  userBalance={user?.balance || 0}
  onSuccess={() => {
    // Refresh balance
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  }}
/>
```

2. Test withdrawal flow:
   - Click "Withdraw to Wallet"
   - Enter NTIQ amount (e.g., 5000)
   - Click "Withdraw POL"
   - Backend generates signature
   - Confirm in MetaMask
   - Wait for confirmation
   - See success message
   - Check POL in wallet

---

## 🔍 VERIFICATION

### Check Contract on Polygonscan

Visit: `https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS`

You should see:
- ✅ Contract verified (green checkmark)
- ✅ Contract name: `NectiqVault`
- ✅ Compiler version: `v0.8.20`
- ✅ Optimization: Enabled
- ✅ Read/Write Contract tabs visible

### Check Backend Logs

After deposit, you should see:
```
💰 [VAULT-LISTENER] Deposit event detected
🔄 [VAULT-LISTENER] Processing deposit
✅ [VAULT-LISTENER] Credited NTIQ to user
```

After withdrawal signature request:
```
✅ [VAULT] Withdrawal signature generated
```

After withdrawal confirmation:
```
💸 [VAULT-LISTENER] Withdrawal event detected
✅ [VAULT-LISTENER] Withdrawal processed
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Insufficient funds for intrinsic transaction cost"
**Solution:** Add more POL to deployer wallet from faucet.

### Problem: "Invalid signature"
**Solution:** 
- Ensure `BACKEND_SIGNER_ADDRESS` matches the wallet that signed
- Verify `BACKEND_SIGNER_PRIVATE_KEY` is correct
- Check that user is on Polygon Amoy (Chain ID: 80002)

### Problem: "Contract not verified"
**Solution:** Manually verify:
```bash
npx hardhat verify --network amoy YOUR_CONTRACT_ADDRESS "YOUR_BACKEND_SIGNER_ADDRESS"
```

### Problem: "VAULT_CONTRACT_ADDRESS not set"
**Solution:** 
- Add contract address to `.env`
- Restart server
- Clear browser cache

### Problem: "Wrong network"
**Solution:**
- User must switch to Polygon Amoy in MetaMask
- Auto-switch should trigger from `useRainbowAuth.ts`

---

## 📊 MONITORING

### Check Contract Balance

```typescript
// In backend
const stats = await vaultListener.getContractStats();
console.log('Contract stats:', stats);
```

### Check User Balance (On-Chain)

Go to Polygonscan → Read Contract → `getBalance(address)`

### Check Transaction History

Go to Polygonscan → Transactions tab

---

## ✅ SUCCESS CHECKLIST

Before considering deployment complete:

- [ ] Smart contract deployed to Polygon Amoy
- [ ] Contract verified on Polygonscan
- [ ] Environment variables updated
- [ ] Server restarted with event listener
- [ ] Manual deposit test successful
- [ ] Frontend deposit test successful
- [ ] Frontend withdrawal test successful
- [ ] NTIQ balance credited automatically
- [ ] POL withdrawal received in wallet
- [ ] Backend logs showing events
- [ ] No errors in console
- [ ] Transaction links work on Polygonscan

---

## 🎉 YOU'RE READY!

Once all tests pass, your vault is **PRODUCTION-READY** on Polygon Amoy!

### Next Steps:
1. ✅ Integrate modals into user dashboard
2. ✅ Add "Deposit" and "Withdraw" buttons
3. ✅ Test with multiple users
4. ✅ Monitor backend logs for errors
5. ✅ Update `ROADMAP.md` to mark Wave 2-3 complete

### For Production (Polygon Mainnet):
1. Audit smart contract (recommended)
2. Change `amoy` to `polygon` in hardhat.config.cjs
3. Update RPC URL to mainnet
4. Use production private keys (hardware wallet recommended)
5. Deploy with higher gas limit
6. Test thoroughly with small amounts first

---

## 📞 SUPPORT

If you encounter issues:
1. Check backend logs
2. Check browser console
3. Verify environment variables
4. Ensure wallet is on Polygon Amoy
5. Check Polygonscan for transaction status
6. Review `POLYGON_AMOY_DEPOSIT_WITHDRAWAL.md` for detailed architecture

---

**🚀 Happy deploying!**

