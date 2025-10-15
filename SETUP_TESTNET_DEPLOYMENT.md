# 🚀 Setup Polygon Amoy Testnet Deployment

## 📋 **PRE-DEPLOYMENT SETUP**

### **1. Environment Variables Setup**

Buat file `.env` di root project:

```bash
# Copy dari .env.example atau buat file baru
cp .env.example .env
```

Isi file `.env` dengan:

```env
# Private key untuk deployment (tanpa 0x prefix)
PRIVATE_KEY=your_private_key_here

# Polygon API Keys untuk contract verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Network URLs
NETWORK_URL_AMOY=https://rpc-amoy.polygon.technology
NETWORK_URL_POLYGON=https://polygon-rpc.com

# Admin Addresses
BACKEND_SIGNER_ADDRESS=your_backend_signer_address
TREASURY_ADDRESS=0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4
ORACLE_ADDRESS=your_oracle_address

# Token Addresses on Polygon Amoy Testnet
WETH_ADDRESS=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
USDC_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
LINK_ADDRESS=0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39

# NFT Metadata Base URI
NFT_BASE_URI=https://api.nectiq.com/nft-metadata/
```

### **2. Get Testnet MATIC**

**Polygon Amoy Faucets:**
- https://faucet.polygon.technology/
- https://mumbaifaucet.com/
- https://stakely.io/en/faucet/polygon-amoy

**Minimum Required:** 0.1 MATIC untuk deployment

### **3. Get Polygonscan API Key**

1. Go to https://polygonscan.com/
2. Create account and login
3. Go to API Keys section
4. Create new API key
5. Copy API key to `.env` file

---

## 🚀 **DEPLOYMENT COMMANDS**

### **Step 1: Load Environment Variables**
```bash
# Load environment variables
source .env

# Verify PRIVATE_KEY is set
echo "Private key loaded: ${PRIVATE_KEY:0:10}..."
```

### **Step 2: Deploy to Polygon Amoy**
```bash
# Deploy enhanced contracts to Polygon Amoy
npx hardhat run deploy-to-testnet.cjs --network amoy
```

### **Step 3: Verify Contracts (Optional)**
```bash
# Verify contracts on Polygonscan
npx hardhat verify --network amoy <contract_address> <constructor_params>
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [ ] `.env` file created with PRIVATE_KEY
- [ ] Wallet has sufficient MATIC (≥0.1 MATIC)
- [ ] Polygonscan API key configured
- [ ] Network connectivity to Polygon Amoy

### **During Deployment:**
- [ ] All 6 contracts deploy successfully
- [ ] No gas estimation errors
- [ ] Contract addresses generated
- [ ] Deployment data saved

### **After Deployment:**
- [ ] Verify contracts on Polygonscan
- [ ] Test contract functions
- [ ] Update backend with new addresses
- [ ] Update frontend integration

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. "Network amoy doesn't exist"**
```bash
# Check hardhat.config.js has amoy network configured
cat hardhat.config.js | grep -A 5 "amoy:"
```

#### **2. "Insufficient funds"**
```bash
# Get testnet MATIC from faucet
echo "Get MATIC from: https://faucet.polygon.technology/"
```

#### **3. "Invalid private key"**
```bash
# Ensure private key is without 0x prefix
echo "PRIVATE_KEY=1234567890abcdef..." # Correct
echo "PRIVATE_KEY=0x1234567890abcdef..." # Wrong
```

#### **4. "Gas estimation failed"**
```bash
# Check if contracts compile successfully
npx hardhat compile
```

---

## 📊 **EXPECTED DEPLOYMENT OUTPUT**

```
🚀 Deploying Enhanced Contracts to Polygon Amoy Testnet...
=====================================
Deploying with account: 0x...
Account balance: 1.5 MATIC

📋 Using Existing Contracts:
NTIQ Token: 0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f
Treasury: 0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4

🏗️  Starting Enhanced Contracts Deployment...

1️⃣ Deploying Enhanced Prediction Staking...
✅ Enhanced Prediction Staking deployed to: 0x...

2️⃣ Deploying Enhanced Parlay Staking...
✅ Enhanced Parlay Staking deployed to: 0x...

3️⃣ Deploying Enhanced Multi-Token Vault...
✅ Enhanced Multi-Token Vault deployed to: 0x...

4️⃣ Deploying Prediction Insurance System...
✅ Prediction Insurance System deployed to: 0x...

5️⃣ Deploying Referral Reward System...
✅ Referral Reward System deployed to: 0x...

6️⃣ Deploying NFT Achievement System...
✅ NFT Achievement System deployed to: 0x...

🎉 POLYGON AMOY DEPLOYMENT COMPLETE!
```

---

## 🎯 **READY TO DEPLOY!**

Setelah setup environment variables, jalankan:

```bash
npx hardhat run deploy-to-testnet.cjs --network amoy
```

**Happy Deploying! 🚀**
