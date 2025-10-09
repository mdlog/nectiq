# 🚀 Deploy NectiqVault via Remix IDE

## Panduan Lengkap Deploy Smart Contract ke Polygon Amoy menggunakan Remix

---

## ✅ Persiapan

Sebelum mulai, pastikan Anda punya:
- [ ] MetaMask installed
- [ ] Polygon Amoy testnet configured in MetaMask
- [ ] 0.5 POL in your wallet (from faucet: https://faucet.polygon.technology/)
- [ ] Backend signer wallet address ready

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **Step 1: Open Remix IDE**

1. Go to: **https://remix.ethereum.org/**
2. Wait for Remix to load

### **Step 2: Create New File**

1. In the left sidebar, click **"File Explorer"** tab
2. Right-click on **"contracts"** folder
3. Click **"New File"**
4. Name it: **`NectiqVault.sol`**

### **Step 3: Copy Smart Contract**

1. Open your project's `contracts/NectiqVault.sol`
2. Copy the ENTIRE content (all 308 lines)
3. Paste into Remix's `NectiqVault.sol`

**Contract location:** `/home/mdlog/Project-MDlabs/nectiq/contracts/NectiqVault.sol`

### **Step 4: Compile Contract**

1. Click **"Solidity Compiler"** tab (left sidebar, looks like an "S" icon)
2. Select compiler version: **`0.8.20`**
3. Click **"Compile NectiqVault.sol"**
4. Wait for green checkmark ✅
5. You should see: **"Compilation successful"**

### **Step 5: Configure MetaMask**

1. Open MetaMask extension
2. Click network dropdown (top)
3. Select **"Polygon Amoy Testnet"**
   - If not listed, add manually:
     - Network Name: `Polygon Amoy Testnet`
     - RPC URL: `https://rpc-amoy.polygon.technology`
     - Chain ID: `80002`
     - Currency Symbol: `POL`
     - Block Explorer: `https://amoy.polygonscan.com`
4. Ensure you have at least **0.5 POL** balance

### **Step 6: Connect Wallet to Remix**

1. Click **"Deploy & Run Transactions"** tab (left sidebar, looks like an Ethereum logo)
2. In **"ENVIRONMENT"** dropdown, select:
   - **"Injected Provider - MetaMask"**
3. MetaMask will popup asking to connect
4. Click **"Next"** → **"Connect"**
5. Verify in Remix:
   - You should see your wallet address under "ACCOUNT"
   - Network should show: "Custom (80002) network"

### **Step 7: Deploy Contract**

1. In **"CONTRACT"** dropdown, select: **`NectiqVault - contracts/NectiqVault.sol`**
2. You'll see a **Deploy** button with a text input field above it
3. In the text input field (constructor parameter), enter:
   ```
   YOUR_BACKEND_SIGNER_ADDRESS
   ```
   **Example:** `0x1234567890abcdef1234567890abcdef12345678`
   
   **⚠️ IMPORTANT:** Use the wallet address from your `.env`:
   ```bash
   BACKEND_SIGNER_ADDRESS=0x...
   ```

4. Click **"Deploy"** (orange button)
5. MetaMask will popup for transaction confirmation
6. Review gas fees (should be ~$0.02)
7. Click **"Confirm"**
8. Wait for transaction to be mined (5-10 seconds)

### **Step 8: Confirm Deployment**

1. After deployment, you'll see the contract under **"Deployed Contracts"** section
2. Click the **dropdown arrow** to expand
3. You should see all contract functions
4. Copy the **contract address** (shown at the top, looks like: `0xABC123...`)

**Example:**
```
NECTIQVAULT AT 0x1234567890ABCDEF1234567890ABCDEF12345678 (MEMORY)
```

Copy: `0x1234567890ABCDEF1234567890ABCDEF12345678`

### **Step 9: Verify Contract on Polygonscan**

1. Copy your contract address
2. Go to: **https://amoy.polygonscan.com/**
3. Paste address in search bar
4. Click on the contract address
5. Go to **"Contract"** tab
6. Click **"Verify and Publish"**
7. Fill in:
   - Compiler Type: `Solidity (Single file)`
   - Compiler Version: `v0.8.20+commit.a1b79de6`
   - License Type: `MIT`
8. Click **"Continue"**
9. Paste the full NectiqVault.sol code
10. Constructor Arguments ABI-encoded:
    - In Remix, go to "Deploy & Run" tab
    - Under "Deployed Contracts", click on your contract
    - Scroll to bottom, you'll see constructor parameters
    - Or use this tool: https://abi.hashex.org/
11. Click **"Verify and Publish"**
12. Wait for verification (30 seconds)
13. You should see: **"Successfully verified"** ✅

### **Step 10: Update .env**

1. Open your project's `.env` file
2. Add these lines (using the contract address from Step 8):
   ```bash
   VAULT_CONTRACT_ADDRESS="0xYourContractAddressHere"
   VITE_VAULT_CONTRACT_ADDRESS="0xYourContractAddressHere"
   ```

**Example:**
```bash
VAULT_CONTRACT_ADDRESS="0x1234567890ABCDEF1234567890ABCDEF12345678"
VITE_VAULT_CONTRACT_ADDRESS="0x1234567890ABCDEF1234567890ABCDEF12345678"
```

**⚠️ IMPORTANT:** Both variables must have the SAME address!

### **Step 11: Initialize Backend Event Listener**

1. Open `server/index.ts`
2. Add near the top (after other imports):
   ```typescript
   import { initVaultEventListener } from './services/vaultEventListener';
   ```

3. Find where `storage` is initialized
4. Add after it:
   ```typescript
   // Initialize Vault Event Listener
   const vaultListener = initVaultEventListener(storage);
   vaultListener.start().catch(err => {
     console.error('Failed to start vault event listener:', err);
   });
   ```

### **Step 12: Restart Server**

```bash
# Stop server if running (Ctrl+C)
# Then restart:
npm run dev
```

**Expected output should include:**
```
🎧 [VAULT-LISTENER] Starting to listen to vault events...
📍 [VAULT-LISTENER] Contract address: 0xYourContractAddress
✅ [VAULT-LISTENER] Now listening to vault events on Polygon Amoy
```

---

## ✅ SUCCESS!

Your NectiqVault is now **LIVE** on Polygon Amoy! 🎉

### **What's Working:**
- ✅ Smart contract deployed
- ✅ Contract verified on Polygonscan
- ✅ Backend listening to events
- ✅ Ready for deposits & withdrawals

---

## 🧪 TESTING

### **Test 1: Manual Deposit via Polygonscan**

1. Go to: `https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS#writeContract`
2. Click **"Connect to Web3"**
3. Connect MetaMask
4. Find **`depositPOL`** function
5. Enter **`depositPOL payableAmount (ether)`**: `0.01`
6. Click **"Write"**
7. Confirm in MetaMask
8. Wait for confirmation (5 seconds)

**Check backend logs:**
```
💰 [VAULT-LISTENER] Deposit event detected
✅ [VAULT-LISTENER] Credited 10 NTIQ to user
```

### **Test 2: Check Contract Balance**

1. In Polygonscan, go to **"Read Contract"** tab
2. Find **`getBalance`** function
3. Enter your wallet address
4. Click **"Query"**
5. Should show your POL balance in the contract (in Wei)

---

## 📊 VERIFICATION CHECKLIST

- [ ] Contract deployed to Polygon Amoy
- [ ] Contract verified on Polygonscan
- [ ] Contract address added to `.env`
- [ ] Backend restarted and showing vault listener logs
- [ ] Manual deposit test successful
- [ ] NTIQ balance credited automatically
- [ ] No errors in backend logs

---

## 🔗 USEFUL LINKS

- **Polygon Amoy Faucet:** https://faucet.polygon.technology/
- **Polygon Amoy Explorer:** https://amoy.polygonscan.com/
- **Remix IDE:** https://remix.ethereum.org/
- **ABI Encoder (for verification):** https://abi.hashex.org/

---

## ⚠️ TROUBLESHOOTING

### Problem: "Insufficient funds"
**Solution:** Get more POL from faucet

### Problem: "Transaction failed"
**Solution:** 
- Check you're on Polygon Amoy network
- Ensure gas limit is sufficient (default is fine)
- Verify backend signer address is correct

### Problem: "Verification failed"
**Solution:**
- Make sure compiler version matches exactly: `v0.8.20+commit.a1b79de6`
- Optimization must be enabled with 200 runs
- Constructor arguments must be ABI-encoded correctly

### Problem: "Event listener not starting"
**Solution:**
- Check `VAULT_CONTRACT_ADDRESS` in `.env`
- Ensure contract address is correct (with 0x prefix)
- Restart server

---

## 🎉 NEXT STEPS

1. ✅ Integrate `VaultDepositModal` into user dashboard
2. ✅ Integrate `VaultWithdrawalModal` into user dashboard
3. ✅ Test deposit flow with UI
4. ✅ Test withdrawal flow with UI
5. ✅ Monitor backend logs for events
6. ✅ Update `ROADMAP.md` to mark Wave 2-3 complete

---

**🚀 Congratulations! Your vault is production-ready on Polygon Amoy!**

