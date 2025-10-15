# 🚀 Smart Contract Deployment Guide

## 📋 **DEPLOYMENT OVERVIEW**

### ✅ **Kontrak yang TIDAK perlu di-deploy ulang:**
1. **NTIQToken.sol** - Sudah perfect, tidak ada perubahan
2. **BattleEscrow.sol** - Sudah perfect
3. **TournamentPool.sol** - Sudah perfect

### 🔄 **Kontrak yang perlu di-deploy:**
1. **MultiTokenVault.sol** - Updated dengan NTIQ support
2. **PredictionStaking.sol** - Enhanced dengan duration multipliers
3. **ParlayStaking.sol** - Enhanced dengan compound formula
4. **PredictionInsurance.sol** - Kontrak baru
5. **AchievementSystem.sol** - Kontrak baru (NFT)
6. **ReferralSystem.sol** - Kontrak baru

---

## 🎯 **DEPLOYMENT ORDER & DEPENDENCIES**

### **Phase 1: Core Contracts (Deploy First)**
```solidity
// 1. NTIQToken.sol (jika belum ada)
// 2. MultiTokenVault.sol (updated)
```

### **Phase 2: Staking Contracts (Deploy Second)**
```solidity
// 3. PredictionStaking.sol (enhanced)
// 4. ParlayStaking.sol (enhanced)
```

### **Phase 3: Feature Contracts (Deploy Third)**
```solidity
// 5. PredictionInsurance.sol (new)
// 6. ReferralSystem.sol (new)
// 7. AchievementSystem.sol (new - NFT)
```

---

## 🔧 **DEPLOYMENT PARAMETERS**

### **1. MultiTokenVault.sol**
```solidity
constructor(
    address _backendSigner,    // Backend signer address
    address _weth,            // WETH token address
    address _usdc,            // USDC token address  
    address _link,            // LINK token address
    address _ntiq             // NTIQ token address (NEW!)
)
```

### **2. PredictionStaking.sol**
```solidity
constructor(
    address _ntiqToken,       // NTIQ token address
    address _treasury,        // Treasury address
    address _oracle           // Oracle address (NEW!)
)
```

### **3. ParlayStaking.sol**
```solidity
constructor(
    address _ntiqToken,       // NTIQ token address
    address _treasury         // Treasury address
)
```

### **4. PredictionInsurance.sol**
```solidity
constructor(
    address _ntiqToken,       // NTIQ token address
    address _treasury         // Treasury address
)
```

### **5. ReferralSystem.sol**
```solidity
constructor(
    address _ntiqToken,       // NTIQ token address
    address _treasury         // Treasury address
)
```

### **6. AchievementSystem.sol**
```solidity
constructor(
    string memory name,       // "NectiqAchievements"
    string memory symbol,     // "NECTIQ"
    string memory _baseURI    // NFT metadata base URI
)
```

---

## 🌐 **NETWORK CONFIGURATION**

### **Polygon Amoy Testnet**
```javascript
// Network: Polygon Amoy Testnet
// Chain ID: 80002
// RPC URL: https://rpc-amoy.polygon.technology
// Currency: MATIC (for gas fees)
// Block Explorer: https://amoy.polygonscan.com
```

### **Token Addresses (Polygon Amoy)**
```javascript
// WETH: 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
// USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
// LINK: 0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39
// NTIQ: [To be deployed first]
```

---

## 📝 **DEPLOYMENT STEPS**

### **Step 1: Prepare Environment**
```bash
# 1. Set up wallet with testnet MATIC
# 2. Get testnet tokens from faucet
# 3. Prepare deployment parameters
```

### **Step 2: Deploy Core Contracts**
```bash
# 1. Deploy NTIQToken.sol (if not exists)
# 2. Deploy MultiTokenVault.sol with NTIQ support
```

### **Step 3: Deploy Staking Contracts**
```bash
# 1. Deploy PredictionStaking.sol with oracle
# 2. Deploy ParlayStaking.sol
```

### **Step 4: Deploy Feature Contracts**
```bash
# 1. Deploy PredictionInsurance.sol
# 2. Deploy ReferralSystem.sol
# 3. Deploy AchievementSystem.sol
```

### **Step 5: Verification & Testing**
```bash
# 1. Verify contracts on Polygonscan
# 2. Test all functions
# 3. Update backend with new addresses
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Before Deployment:**
- ✅ **Test thoroughly** on testnet
- ✅ **Verify all parameters** are correct
- ✅ **Check gas estimates** for deployment
- ✅ **Prepare treasury addresses** for fees

### **After Deployment:**
- ✅ **Verify contracts** on block explorer
- ✅ **Test all functions** with small amounts
- ✅ **Set up monitoring** for contract events
- ✅ **Update backend** with new addresses

---

## 📊 **CONTRACT ADDRESSES TRACKING**

### **Template for Recording Addresses:**
```markdown
## Deployed Contracts (Polygon Amoy)

### Core Contracts
- NTIQToken: `0x...`
- MultiTokenVault: `0x...`

### Staking Contracts  
- PredictionStaking: `0x...`
- ParlayStaking: `0x...`

### Feature Contracts
- PredictionInsurance: `0x...`
- ReferralSystem: `0x...`
- AchievementSystem: `0x...`

### Deployment Date: [DATE]
### Deployed By: [ADDRESS]
```

---

## 🚨 **IMPORTANT NOTES**

1. **Deploy in Order**: Follow the dependency chain
2. **Save Addresses**: Record all deployed contract addresses
3. **Test First**: Always test on testnet before mainnet
4. **Gas Estimation**: Check gas costs before deployment
5. **Backup**: Keep deployment transactions and parameters

---

## 🎉 **READY TO DEPLOY!**

Semua kontrak sudah siap untuk deployment. Ikuti urutan deployment dan pastikan semua parameter sudah benar sebelum deploy ke mainnet.

**Happy Deploying! 🚀**
