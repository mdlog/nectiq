# NTIQ Token Deployment Guide

## 🎯 **Overview**

This guide provides comprehensive instructions for deploying the NTIQ Token to Polygon networks (testnet and mainnet).

## 📋 **Prerequisites**

### **1. Environment Setup**
- Node.js (v16 or higher)
- npm or yarn
- Git
- Hardhat installed globally: `npm install -g hardhat`

### **2. Required Environment Variables**
Create a `.env` file in the project root with:
```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### **3. Testnet MATIC**
For testnet deployment, get testnet MATIC from:
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Mumbai Faucet](https://mumbaifaucet.com/)

### **4. Mainnet MATIC**
For mainnet deployment, ensure you have sufficient MATIC for gas fees (recommended: 5+ MATIC).

## 🚀 **Quick Start**

### **Option 1: Interactive Script (Recommended)**
```bash
./deploy-ntiq.sh
```

### **Option 2: Direct Commands**

#### **Deploy to Testnet (Polygon Amoy)**
```bash
npx hardhat run scripts/deploy-ntiq-polygon-amoy.cjs --network amoy
```

#### **Deploy to Mainnet (Polygon)**
```bash
npx hardhat run scripts/deploy-ntiq-polygon-mainnet.cjs --network polygon
```

## 📊 **Token Specifications**

### **Basic Information**
- **Name**: NECTIQ Token
- **Symbol**: NTIQ
- **Decimals**: 18
- **Total Supply**: 1,000,000,000 NTIQ (1 Billion)

### **Token Distribution**
- **Community & Ecosystem**: 40% (400M NTIQ)
  - Immediate Airdrop: 5% (50M NTIQ)
  - Vested Airdrop: 10% (100M NTIQ)
  - Liquidity Mining: 10% (100M NTIQ)
  - DAO Treasury: 10% (100M NTIQ)
  - Community Grants: 5% (50M NTIQ)
- **Game Rewards**: 30% (300M NTIQ)
- **Team & Advisors**: 20% (200M NTIQ)
- **Buildathons**: 5% (50M NTIQ)
- **Investors**: 5% (50M NTIQ)

### **Key Features**
- ✅ ERC-20 compliant
- ✅ Burnable tokens
- ✅ Pausable functionality
- ✅ Ownable contract
- ✅ Reentrancy protection
- ✅ Deflationary mechanics

## 🔧 **Deployment Scripts**

### **1. deploy-ntiq-polygon-amoy.cjs**
Deploys NTIQ Token to Polygon Amoy testnet.

**Features:**
- Automatic deployment
- Token information display
- Distribution summary
- Basic functionality testing
- Environment file update
- Deployment info saving

### **2. deploy-ntiq-polygon-mainnet.cjs**
Deploys NTIQ Token to Polygon mainnet.

**Features:**
- Mainnet safety checks
- Comprehensive testing
- Gas optimization
- Deployment verification
- Environment configuration

### **3. test-ntiq-interaction.cjs**
Tests deployed NTIQ Token functionality.

**Tests:**
- Basic token information
- Balance checks
- Transfer functionality
- Approval and transferFrom
- Burn functionality
- Pause functionality
- Distribution constants

### **4. verify-ntiq-contract.cjs**
Verifies contract on Polygonscan.

**Features:**
- Automatic verification
- Manual verification instructions
- Block explorer links

## 📝 **Step-by-Step Deployment**

### **Step 1: Prepare Environment**
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your private key and API key
```

### **Step 2: Deploy to Testnet**
```bash
# Deploy to Polygon Amoy
npx hardhat run scripts/deploy-ntiq-polygon-amoy.cjs --network amoy

# Test deployment
npx hardhat run scripts/test-ntiq-interaction.cjs --network amoy

# Verify contract
npx hardhat run scripts/verify-ntiq-contract.cjs --network amoy
```

### **Step 3: Deploy to Mainnet**
```bash
# Deploy to Polygon Mainnet
npx hardhat run scripts/deploy-ntiq-polygon-mainnet.cjs --network polygon

# Test deployment
npx hardhat run scripts/test-ntiq-interaction.cjs --network polygon

# Verify contract
npx hardhat verify --network polygon <contract_address>
```

## 🔍 **Verification Process**

### **Automatic Verification**
```bash
npx hardhat run scripts/verify-ntiq-contract.cjs --network amoy
```

### **Manual Verification**
1. Go to [Polygonscan](https://polygonscan.com/) or [Amoy Polygonscan](https://amoy.polygonscan.com/)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Select "Solidity (Single file)"
6. Enter contract name: `NTIQToken`
7. Select compiler version: `0.8.20`
8. Select optimization: `Yes, 200 runs`
9. Paste the contract source code
10. Click "Verify and Publish"

## 📄 **Deployment Files**

After successful deployment, the following files are created:

### **Testnet Deployment**
- `ntiq-deployment-polygon-amoy-<timestamp>.json`

### **Mainnet Deployment**
- `ntiq-deployment-polygon-mainnet-<timestamp>.json`

### **File Contents**
```json
{
  "network": "polygonAmoy",
  "chainId": 80002,
  "deployer": "0x...",
  "contracts": {
    "NTIQToken": "0x..."
  },
  "tokenInfo": {
    "name": "NECTIQ Token",
    "symbol": "NTIQ",
    "decimals": "18",
    "totalSupply": "1000000000000000000000000000"
  },
  "distribution": {
    "immediateAirdrop": "50000000000000000000000000",
    "vestedAirdrop": "100000000000000000000000000",
    "liquidityMining": "100000000000000000000000000",
    "daoTreasury": "100000000000000000000000000",
    "communityGrants": "50000000000000000000000000",
    "gameRewards": "300000000000000000000000000",
    "teamAllocation": "200000000000000000000000000",
    "buildathons": "50000000000000000000000000",
    "investorAllocation": "50000000000000000000000000"
  },
  "deploymentTime": "2024-01-01T00:00:00.000Z"
}
```

## 🔗 **Block Explorer Links**

### **Testnet (Polygon Amoy)**
- [Amoy Polygonscan](https://amoy.polygonscan.com/)
- Contract: `https://amoy.polygonscan.com/address/<contract_address>`

### **Mainnet (Polygon)**
- [Polygonscan](https://polygonscan.com/)
- Contract: `https://polygonscan.com/address/<contract_address>`

## 🧪 **Testing Commands**

### **Test Token Functionality**
```bash
# Test on testnet
npx hardhat run scripts/test-ntiq-interaction.cjs --network amoy

# Test on mainnet
npx hardhat run scripts/test-ntiq-interaction.cjs --network polygon
```

### **Test Specific Functions**
```bash
# Test transfer
npx hardhat console --network amoy
> const NTIQ = await ethers.getContractAt("NTIQToken", "0x...")
> await NTIQ.transfer("0x...", ethers.utils.parseEther("100"))

# Test burn
> await NTIQ.burn(ethers.utils.parseEther("10"))

# Test pause
> await NTIQ.pause()
> await NTIQ.unpause()
```

## ⚠️ **Important Notes**

### **Security Considerations**
- Never share your private key
- Use hardware wallets for mainnet deployments
- Test thoroughly on testnet first
- Verify contract source code
- Keep deployment files secure

### **Gas Optimization**
- Current gas price: 30 gwei
- Estimated deployment cost: 0.01-0.05 MATIC
- Monitor gas prices before deployment

### **Network Configuration**
- **Polygon Amoy**: Chain ID 80002
- **Polygon Mainnet**: Chain ID 137
- **RPC URLs**: Configured in hardhat.config.cjs

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Insufficient Balance**
```
❌ WARNING: Low balance! You need at least 0.01 MATIC for deployment
```
**Solution**: Get testnet MATIC from faucet or add more MATIC to your wallet.

#### **2. Private Key Error**
```
❌ DEPLOYER_PRIVATE_KEY not set in .env file
```
**Solution**: Add your private key to the `.env` file.

#### **3. Network Connection Error**
```
❌ Network connection failed
```
**Solution**: Check your internet connection and RPC URL.

#### **4. Contract Verification Failed**
```
❌ Verification failed
```
**Solution**: Use manual verification process or check contract source code.

### **Debug Commands**
```bash
# Check network connection
npx hardhat console --network amoy
> await ethers.provider.getNetwork()

# Check account balance
> await ethers.provider.getBalance("0x...")

# Check contract deployment
> await ethers.getContractAt("NTIQToken", "0x...")
```

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section
2. Review deployment logs
3. Verify environment variables
4. Test on testnet first
5. Check network status

## 🎉 **Success Checklist**

After successful deployment:
- [ ] Contract deployed successfully
- [ ] Token information displayed correctly
- [ ] Basic functionality tested
- [ ] Contract verified on block explorer
- [ ] Deployment file saved
- [ ] Environment variables updated
- [ ] Frontend integration ready

## 🔄 **Next Steps**

After deployment:
1. **Frontend Integration**: Update frontend with contract address
2. **Token Distribution**: Setup distribution mechanisms
3. **Liquidity**: Add liquidity to DEX
4. **Listing**: List on token trackers
5. **Marketing**: Announce token launch
6. **Community**: Setup community channels

**The NTIQ Token is now ready for production use!** 🚀
