# 🚀 Deploy to Polygon Amoy - Simple Guide

## 📋 **QUICK DEPLOYMENT STEPS**

### **Step 1: Setup Environment**
```bash
# 1. Set your private key in .env file
nano .env
# Add: PRIVATE_KEY=your_private_key_without_0x_prefix

# 2. Load environment variables
source .env

# 3. Get testnet MATIC from faucet
# Visit: https://faucet.polygon.technology/
```

### **Step 2: Deploy Contracts**
```bash
# Deploy all enhanced contracts to Polygon Amoy
npx hardhat run deploy-to-amoy.cjs --network amoy
```

### **Step 3: Verify Contracts (Optional)**
```bash
# Verify contracts on Polygonscan
npx hardhat verify --network amoy <contract_address> <constructor_params>
```

---

## 🎯 **WHAT WILL BE DEPLOYED**

### **Enhanced Contracts (6 contracts):**
1. **Enhanced Prediction Staking** - Duration multipliers + Oracle integration
2. **Enhanced Parlay Staking** - Compound formula + Duration multipliers  
3. **Enhanced Multi-Token Vault** - NTIQ token support added
4. **Prediction Insurance System** - 10% cost, 50% refund insurance
5. **Referral Reward System** - 10% referral bonus system
6. **NFT Achievement System** - 6 achievement categories

### **Using Existing Contracts:**
- **NTIQ Token:** `0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f`
- **Treasury:** `0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4`

---

## 📊 **EXPECTED OUTPUT**

```
🚀 Deploying Enhanced Contracts to Polygon Amoy Testnet
========================================================
Deploying with account: 0x...
Account balance: 1.5 MATIC

📋 Using Existing Contracts:
NTIQ Token: 0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f
Treasury: 0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4

🏗️  Starting deployment...

1️⃣ Deploying Enhanced Prediction Staking...
✅ Enhanced Prediction Staking: 0x...

2️⃣ Deploying Enhanced Parlay Staking...
✅ Enhanced Parlay Staking: 0x...

3️⃣ Deploying Enhanced Multi-Token Vault...
✅ Enhanced Multi-Token Vault: 0x...

4️⃣ Deploying Prediction Insurance System...
✅ Prediction Insurance System: 0x...

5️⃣ Deploying Referral Reward System...
✅ Referral Reward System: 0x...

6️⃣ Deploying NFT Achievement System...
✅ NFT Achievement System: 0x...

🎉 DEPLOYMENT COMPLETE!
========================

📋 Contract Addresses:
1. Enhanced Prediction Staking: 0x...
2. Enhanced Parlay Staking: 0x...
3. Enhanced Multi-Token Vault: 0x...
4. Prediction Insurance System: 0x...
5. Referral Reward System: 0x...
6. NFT Achievement System: 0x...

🔗 Block Explorer Links:
[Links to Polygonscan for each contract]

🚀 All enhanced contracts are now live on Polygon Amoy!
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

#### **"PRIVATE_KEY environment variable not set"**
```bash
# Solution: Set private key in .env file
echo "PRIVATE_KEY=your_private_key_here" >> .env
source .env
```

#### **"LOW BALANCE WARNING"**
```bash
# Solution: Get testnet MATIC from faucet
# Visit: https://faucet.polygon.technology/
```

#### **"Network amoy doesn't exist"**
```bash
# Solution: Check hardhat.config.js
cat hardhat.config.js | grep -A 5 "amoy:"
```

#### **"Gas estimation failed"**
```bash
# Solution: Compile contracts first
npx hardhat compile
```

---

## 🎯 **READY TO DEPLOY!**

**Command to run:**
```bash
npx hardhat run deploy-to-amoy.cjs --network amoy
```

**This will deploy all 6 enhanced contracts to Polygon Amoy testnet! 🚀**
