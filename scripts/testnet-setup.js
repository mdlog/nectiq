const { ethers } = require("hardhat");

async function main() {
  console.log("Setting up testnet environment...");
  
  // Contract addresses (update these after deployment)
  const contracts = {
    holesky: {
      NTIQ: "0x...", // Update after deployment
      PriceOracle: "0x...", // Update after deployment
      PredictionBattle: "0x..." // Update after deployment
    },
    sepolia: {
      NTIQ: "0x...", // Update after deployment
      PriceOracle: "0x...", // Update after deployment  
      PredictionBattle: "0x..." // Update after deployment
    }
  };
  
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();
  
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("Deployer:", deployer.address);
  
  // Load contracts
  const ntiq = await ethers.getContractAt("NTIQ", contracts[network.name]?.NTIQ);
  const priceOracle = await ethers.getContractAt("PriceOracle", contracts[network.name]?.PriceOracle);
  const predictionBattle = await ethers.getContractAt("PredictionBattle", contracts[network.name]?.PredictionBattle);
  
  // Setup test scenarios
  console.log("\n1. Creating test predictions...");
  
  // Give deployer some tokens for testing
  const testAmount = ethers.utils.parseEther("1000");
  await ntiq.approve(predictionBattle.address, testAmount);
  
  // Submit test predictions
  const testPredictions = [
    {
      crypto: "bitcoin",
      price: ethers.utils.parseEther("44000"),
      stake: ethers.utils.parseEther("50"),
      duration: 3600 // 1 hour
    },
    {
      crypto: "ethereum", 
      price: ethers.utils.parseEther("2700"),
      stake: ethers.utils.parseEther("100"),
      duration: 86400 // 24 hours
    }
  ];
  
  for (const pred of testPredictions) {
    const tx = await predictionBattle.submitPrediction(
      pred.crypto,
      pred.price,
      pred.stake,
      pred.duration
    );
    await tx.wait();
    console.log(`✓ Created ${pred.crypto} prediction`);
  }
  
  // Update prices for immediate testing
  console.log("\n2. Updating test prices...");
  const currentPrices = [
    ["bitcoin", ethers.utils.parseEther("43500")],
    ["ethereum", ethers.utils.parseEther("2650")],
    ["binancecoin", ethers.utils.parseEther("320")],
    ["cardano", ethers.utils.parseEther("0.39")],
    ["solana", ethers.utils.parseEther("102")]
  ];
  
  for (const [crypto, price] of currentPrices) {
    await priceOracle.updatePrice(crypto, price);
    console.log(`✓ Updated ${crypto} price`);
  }
  
  // Get contract stats
  console.log("\n3. Contract Statistics:");
  const stats = await predictionBattle.getStats();
  console.log(`Total Predictions: ${stats.totalPredictions}`);
  console.log(`Total Staked: ${ethers.utils.formatEther(stats.totalStaked)} NTIQ`);
  console.log(`Total Rewards Paid: ${ethers.utils.formatEther(stats.totalRewardsPaid)} NTIQ`);
  
  // Show user predictions
  console.log("\n4. User Predictions:");
  const userPredictions = await predictionBattle.getUserPredictions(deployer.address);
  for (const predId of userPredictions) {
    const pred = await predictionBattle.getPrediction(predId);
    console.log(`Prediction ${predId}: ${pred.cryptocurrency} - ${ethers.utils.formatEther(pred.predictedPrice)} - ${pred.resolved ? 'Resolved' : 'Active'}`);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("TESTNET SETUP COMPLETE");
  console.log("=".repeat(50));
  console.log("You can now test the prediction platform!");
  console.log("Make sure to update your frontend with these contract addresses:");
  console.log(JSON.stringify(contracts[network.name], null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });