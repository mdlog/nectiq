# 🚀 Smart Contract Deployment Guide

Panduan lengkap untuk deployment smart contract Nectiq ke testnet Holesky dan Sepolia.

## 📋 Prerequisites

### 1. Setup Environment
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configure .env File
```bash
# Your wallet private key (NEVER commit this to git!)
PRIVATE_KEY=your_private_key_here

# RPC URLs (default sudah disediakan)
HOLESKY_RPC_URL=https://ethereum-holesky.blockpi.network/v1/rpc/public
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Etherscan API key (optional untuk verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Get Testnet ETH

#### Holesky Testnet
- **Faucet 1**: https://holesky-faucet.pk910.de/
- **Faucet 2**: https://cloud.google.com/application/web3/faucet/ethereum/holesky
- **Min Balance**: 0.01 ETH untuk deployment

#### Sepolia Testnet  
- **Faucet 1**: https://sepoliafaucet.com/
- **Faucet 2**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Min Balance**: 0.01 ETH untuk deployment

## 🚀 Deployment Commands

### Quick Deploy ke Holesky Testnet
```bash
npx hardhat run scripts/quick-deploy.cjs --network holesky
```

### Quick Deploy ke Sepolia Testnet
```bash
npx hardhat run scripts/quick-deploy.cjs --network sepolia
```

### Full Deploy dengan Testing
```bash
npx hardhat run scripts/deploy-testnet.cjs --network holesky
npx hardhat run scripts/deploy-testnet.cjs --network sepolia
```

### Test Local Deployment
```bash
# Start local node
npx hardhat node

# Deploy to local (terminal baru)
npx hardhat run scripts/deploy-simple.cjs --network localhost
```

## 📊 Deployment Process

Deployment script akan melakukan:

1. **✅ Deploy SimpleNTIQ Token**
   - 1 miliar token supply
   - Mint ke deployer wallet

2. **✅ Deploy SimplePriceOracle**
   - Price feed system
   - Multi-feeder authorization

3. **✅ Deploy SimplePredictionBattle**
   - Core prediction logic
   - Staking mechanism

4. **✅ Initial Setup**
   - Transfer 100k NTIQ untuk rewards
   - Set harga awal 10 cryptocurrency
   - Create test prediction

5. **✅ Verification & Testing**
   - Verify contract addresses
   - Test basic functionality

## 📋 Expected Output

```bash
🚀 Deploying to HOLESKY testnet...

Deploying with account: 0x1234...
Account balance: 0.05 ETH

📋 DEPLOYMENT PLAN:
1. Deploy SimpleNTIQ Token
2. Deploy SimplePriceOracle  
3. Deploy SimplePredictionBattle
4. Setup initial configuration
5. Create test prediction

1️⃣ Deploying SimpleNTIQ Token...
✅ SimpleNTIQ deployed to: 0xabc123...

2️⃣ Deploying SimplePriceOracle...
✅ SimplePriceOracle deployed to: 0xdef456...

3️⃣ Deploying SimplePredictionBattle...
✅ SimplePredictionBattle deployed to: 0x789xyz...

4️⃣ Setting up initial configurations...
✅ NTIQ transferred successfully
✅ Initial prices set

5️⃣ Creating test prediction...
✅ Test prediction created

🎉 DEPLOYMENT TO HOLESKY SUCCESSFUL!

📋 CONTRACT ADDRESSES:
SimpleNTIQ Token: 0xabc123...
SimplePriceOracle: 0xdef456...
SimplePredictionBattle: 0x789xyz...
```

## 🔧 Testing Deployment

### Update Contract Addresses
Setelah deployment, update addresses di `scripts/test-interaction.cjs`:

```javascript
const CONTRACT_ADDRESSES = {
  holesky: {
    SimpleNTIQ: "0xabc123...", // Address dari deployment
    SimplePriceOracle: "0xdef456...", // Address dari deployment
    SimplePredictionBattle: "0x789xyz..." // Address dari deployment
  }
};
```

### Run Tests
```bash
# Test di Holesky
npx hardhat run scripts/test-interaction.cjs --network holesky

# Test di Sepolia
npx hardhat run scripts/test-interaction.cjs --network sepolia
```

## 🔍 Contract Verification

### Manual Verification
```bash
# Verify SimpleNTIQ
npx hardhat verify --network holesky 0xCONTRACT_ADDRESS

# Verify SimplePriceOracle
npx hardhat verify --network holesky 0xCONTRACT_ADDRESS

# Verify SimplePredictionBattle
npx hardhat verify --network holesky 0xCONTRACT_ADDRESS "0xNTIQ_ADDRESS" "0xORACLE_ADDRESS"
```

## 📱 Frontend Integration

### Update Contract Addresses
Update addresses di frontend configuration:

```typescript
const contracts = {
  holesky: {
    SimpleNTIQ: "0xabc123...",
    SimplePriceOracle: "0xdef456...",
    SimplePredictionBattle: "0x789xyz..."
  },
  sepolia: {
    SimpleNTIQ: "0xabc123...",
    SimplePriceOracle: "0xdef456...",
    SimplePredictionBattle: "0x789xyz..."
  }
};
```

### Web3 Connection
```typescript
// Connect to Holesky
const holesky = {
  chainId: '0x4268', // 17000
  chainName: 'Holesky Testnet',
  rpcUrls: ['https://ethereum-holesky.blockpi.network/v1/rpc/public'],
  blockExplorerUrls: ['https://holesky.etherscan.io']
};

// Connect to Sepolia
const sepolia = {
  chainId: '0xaa36a7', // 11155111
  chainName: 'Sepolia Testnet', 
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};
```

## 🛠️ Core Functions

### Submit Prediction
```solidity
predictionBattle.submitPrediction(
    "bitcoin",                    // cryptocurrency
    ethers.utils.parseEther("45000"), // predicted price
    ethers.utils.parseEther("100"),   // stake amount
    3600                         // duration (1 hour)
);
```

### Resolve Prediction (Oracle)
```solidity
predictionBattle.resolvePrediction(
    1,                          // prediction ID
    ethers.utils.parseEther("44000") // actual price
);
```

### Claim Reward
```solidity
predictionBattle.claimReward(1); // prediction ID
```

## 🏆 Reward System

- **Perfect (±0.1%)**: 5x multiplier
- **High (±1%)**: 3x multiplier
- **Medium (±5%)**: 2x multiplier  
- **Low (±10%)**: 1.5x multiplier
- **Base (>10%)**: 1x multiplier

## 🚨 Troubleshooting

### Common Issues

1. **Insufficient Gas**
   ```bash
   Error: transaction underpriced
   ```
   **Solution**: Increase gas price di hardhat.config.cjs

2. **Insufficient Balance**
   ```bash
   Error: insufficient funds for gas * price + value
   ```
   **Solution**: Get more testnet ETH dari faucet

3. **Network Connection**
   ```bash
   Error: network connection timeout
   ```
   **Solution**: Check RPC URL atau ganti dengan backup RPC

4. **Private Key Issues**
   ```bash
   Error: invalid private key
   ```
   **Solution**: Check format private key di .env (harus dimulai dengan 0x)

### Gas Optimization

```javascript
// Di hardhat.config.cjs
networks: {
  holesky: {
    gasPrice: 20000000000, // 20 gwei
    gas: 5000000          // 5M gas limit
  }
}
```

## 🔗 Useful Links

### Block Explorers
- **Holesky**: https://holesky.etherscan.io
- **Sepolia**: https://sepolia.etherscan.io

### Faucets
- **Holesky**: https://holesky-faucet.pk910.de/
- **Sepolia**: https://sepoliafaucet.com/

### Documentation
- **Hardhat**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com/

## 📝 Next Steps

1. ✅ Deploy contracts ke testnet
2. ✅ Verify contracts di Etherscan
3. ✅ Test all functions
4. ✅ Update frontend configuration
5. ✅ Setup price oracle automation
6. ✅ Create production deployment plan