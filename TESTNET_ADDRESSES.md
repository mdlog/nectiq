# Smart Contract Addresses

## Holesky Testnet
```
Network: Holesky Ethereum Testnet
Chain ID: 17000
Block Explorer: https://holesky.etherscan.io

SimpleNTIQ Token: 0x... (Update after deployment)
SimplePriceOracle: 0x... (Update after deployment)
SimplePredictionBattle: 0x... (Update after deployment)

Deployment Status: Pending
```

## Sepolia Testnet
```
Network: Sepolia Ethereum Testnet  
Chain ID: 11155111
Block Explorer: https://sepolia.etherscan.io

SimpleNTIQ Token: 0x... (Update after deployment)
SimplePriceOracle: 0x... (Update after deployment) 
SimplePredictionBattle: 0x... (Update after deployment)

Deployment Status: Pending
```

## Local Development
```
Network: Hardhat Local
Chain ID: 31337

SimpleNTIQ Token: 0x5FbDB2315678afecb367f032d93F642f64180aa3
SimplePriceOracle: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SimplePredictionBattle: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

Deployment Status: Ready for Testing
```

## How to Deploy

1. **Get Testnet ETH**
   - Holesky: https://holesky-faucet.pk910.de/
   - Sepolia: https://sepoliafaucet.com/

2. **Set Private Key in .env**
   ```bash
   PRIVATE_KEY=your_private_key_here
   ```

3. **Deploy to Testnet**
   ```bash
   # Holesky
   npx hardhat run scripts/quick-deploy.cjs --network holesky
   
   # Sepolia
   npx hardhat run scripts/quick-deploy.cjs --network sepolia
   ```

4. **Update This File**
   - Copy contract addresses from deployment output
   - Update status to "Deployed"
   - Commit changes to repository

## Frontend Integration

Update these addresses in your frontend configuration:

```typescript
const contractAddresses = {
  17000: { // Holesky
    SimpleNTIQ: "0x...",
    SimplePriceOracle: "0x...",
    SimplePredictionBattle: "0x..."
  },
  11155111: { // Sepolia
    SimpleNTIQ: "0x...",
    SimplePriceOracle: "0x...", 
    SimplePredictionBattle: "0x..."
  }
};
```