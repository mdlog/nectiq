# Nectiq Smart Contracts

Smart contracts untuk platform prediksi cryptocurrency Nectiq, dibangun dengan Solidity dan Hardhat.

## Kontrak Utama

### 1. NTIQ Token (ERC-20)
- Token utility untuk staking dan rewards
- Supply awal: 1 miliar token
- Fungsi: mint, burn, transfer

### 2. PriceOracle
- Oracle untuk feed harga cryptocurrency dari CoinGecko
- Multi-feeder authorization system
- Batch price update capability

### 3. PredictionBattle
- Kontrak utama untuk prediction battles
- Staking mechanism dengan NTIQ token
- Automatic accuracy calculation dan reward distribution
- Support multiple timeframes (1h, 6h, 24h, 7d)

## Setup & Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

## Environment Setup

1. Copy `.env.example` ke `.env`
2. Isi private key dan API keys:

```bash
PRIVATE_KEY=your_private_key_here
HOLESKY_RPC_URL=https://ethereum-holesky.blockpi.network/v1/rpc/public
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Deployment

### Holesky Testnet
```bash
npm run deploy:holesky
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Local Development
```bash
# Start local node
npm run node

# Deploy to local (in another terminal)
npm run deploy:local
```

## Testing

### Unit Tests
```bash
npm run test
```

### Testnet Testing
```bash
npm run test:holesky
npm run test:sepolia
```

## Contract Addresses

### Holesky Testnet
- NTIQ Token: `0x...` (update setelah deployment)
- Price Oracle: `0x...` (update setelah deployment)  
- Prediction Battle: `0x...` (update setelah deployment)

### Sepolia Testnet
- NTIQ Token: `0x...` (update setelah deployment)
- Price Oracle: `0x...` (update setelah deployment)
- Prediction Battle: `0x...` (update setelah deployment)

## Cara Penggunaan

### 1. Submit Prediction
```solidity
predictionBattle.submitPrediction(
    "bitcoin",                    // cryptocurrency
    ethers.utils.parseEther("45000"), // predicted price (in wei)
    ethers.utils.parseEther("100"),   // stake amount  
    3600                         // duration (1 hour)
);
```

### 2. Resolve Prediction (Oracle Only)
```solidity
predictionBattle.resolvePrediction(
    1,                          // prediction ID
    ethers.utils.parseEther("44000") // actual price
);
```

### 3. Claim Reward
```solidity
predictionBattle.claimReward(1); // prediction ID
```

## Reward System

- **Perfect Accuracy (±0.1%)**: 5x multiplier
- **High Accuracy (±1%)**: 3x multiplier  
- **Medium Accuracy (±5%)**: 2x multiplier
- **Low Accuracy (±10%)**: 1.5x multiplier
- **Base (>10% error)**: 1x multiplier (stake back)

## Testing Scenarios

### Scenario 1: Akurasi Tinggi
```javascript
// Prediksi: $45,000
// Aktual: $44,550 (~1% error)
// Reward: 3x stake = 300 NTIQ
```

### Scenario 2: Akurasi Perfect
```javascript
// Prediksi: $45,000  
// Aktual: $45,040 (~0.089% error)
// Reward: 5x stake = 500 NTIQ
```

### Scenario 3: Akurasi Rendah
```javascript
// Prediksi: $45,000
// Aktual: $40,000 (~11% error)  
// Reward: 1x stake = 100 NTIQ (stake back)
```

## Security Features

- ReentrancyGuard untuk mencegah reentrancy attacks
- Ownable untuk admin functions
- Pausable untuk emergency stops
- Input validation untuk semua parameters
- Authorized feeder system untuk price oracle

## Gas Optimization

- Batch operations untuk multiple predictions
- Optimized storage layout
- Efficient calculation algorithms
- Minimal external calls

## Verification

Setelah deployment, contract akan otomatis diverifikasi di Etherscan:

```bash
npm run verify:holesky ADDRESS
npm run verify:sepolia ADDRESS
```

## Integration dengan Frontend

Update contract addresses di frontend configuration:

```typescript
const contracts = {
  holesky: {
    NTIQ: "0x...",
    PriceOracle: "0x...", 
    PredictionBattle: "0x..."
  },
  sepolia: {
    NTIQ: "0x...",
    PriceOracle: "0x...",
    PredictionBattle: "0x..."
  }
};
```

## Monitoring & Analytics

- Event logging untuk semua major actions
- Contract statistics tracking
- User prediction history
- Reward distribution metrics

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Increase gas limit
2. **Price Not Updated**: Check oracle authorization
3. **Prediction Not Expired**: Wait for target time
4. **Insufficient Allowance**: Approve more NTIQ tokens

### Debug Commands

```bash
# Check contract status
npx hardhat console --network holesky

# View transaction details
npx hardhat run scripts/debug.js --network holesky
```

## Roadmap

- [ ] Cross-chain deployment (Polygon, BSC)
- [ ] Advanced prediction types (price ranges, volatility)
- [ ] Governance token integration
- [ ] Liquidity mining rewards
- [ ] Insurance mechanism untuk large predictions