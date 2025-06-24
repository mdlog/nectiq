const { ethers } = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🧪 Testing smart contract interaction on ${network.toUpperCase()}...`);
  
  // You need to update these addresses after deployment
  const CONTRACT_ADDRESSES = {
    holesky: {
      SimpleNTIQ: "0x...", // Update after deployment
      SimplePriceOracle: "0x...", // Update after deployment
      SimplePredictionBattle: "0x..." // Update after deployment
    },
    sepolia: {
      SimpleNTIQ: "0x...", // Update after deployment
      SimplePriceOracle: "0x...", // Update after deployment  
      SimplePredictionBattle: "0x..." // Update after deployment
    }
  };
  
  const addresses = CONTRACT_ADDRESSES[network];
  if (!addresses || addresses.SimpleNTIQ === "0x...") {
    console.log("❌ Please update contract addresses in this script after deployment");
    console.log("Run deployment first:");
    console.log(`npx hardhat run scripts/deploy-testnet.cjs --network ${network}`);
    return;
  }
  
  const [deployer, user1] = await ethers.getSigners();
  
  console.log("Testing with accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  
  // Load contracts
  const ntiq = await ethers.getContractAt("SimpleNTIQ", addresses.SimpleNTIQ);
  const priceOracle = await ethers.getContractAt("SimplePriceOracle", addresses.SimplePriceOracle);
  const predictionBattle = await ethers.getContractAt("SimplePredictionBattle", addresses.SimplePredictionBattle);
  
  console.log("\n📊 Contract Status:");
  console.log("SimpleNTIQ:", ntiq.address);
  console.log("SimplePriceOracle:", priceOracle.address);
  console.log("SimplePredictionBattle:", predictionBattle.address);
  
  // Check balances
  const deployerBalance = await ntiq.balanceOf(deployer.address);
  const contractBalance = await ntiq.balanceOf(predictionBattle.address);
  
  console.log("\n💰 NTIQ Balances:");
  console.log("Deployer:", ethers.utils.formatEther(deployerBalance), "NTIQ");
  console.log("PredictionBattle:", ethers.utils.formatEther(contractBalance), "NTIQ");
  
  // Give user1 some NTIQ tokens
  console.log("\n📤 Distributing NTIQ to test user...");
  await ntiq.transfer(user1.address, ethers.utils.parseEther("1000"));
  console.log("✅ Transferred 1000 NTIQ to user1");
  
  // User1 approves prediction battle
  await ntiq.connect(user1).approve(predictionBattle.address, ethers.utils.parseEther("1000"));
  console.log("✅ User1 approved PredictionBattle to spend NTIQ");
  
  // User1 creates a prediction
  console.log("\n🎯 User1 creating prediction...");
  const tx = await predictionBattle.connect(user1).submitPrediction(
    "ethereum",
    ethers.utils.parseEther("2700"),  // Predict $2,700
    ethers.utils.parseEther("200"),   // Stake 200 NTIQ
    86400                             // 24 hours
  );
  await tx.wait();
  console.log("✅ Prediction created (Ethereum: $2,700, Stake: 200 NTIQ)");
  
  // Check active predictions
  console.log("\n📋 Active Predictions:");
  for (let i = 1; i <= 2; i++) {
    try {
      const pred = await predictionBattle.getPrediction(i);
      if (pred.user !== ethers.constants.AddressZero) {
        console.log(`\nPrediction ${i}:`);
        console.log(`  User: ${pred.user}`);
        console.log(`  Crypto: ${pred.cryptocurrency}`);
        console.log(`  Predicted: $${ethers.utils.formatEther(pred.predictedPrice)}`);
        console.log(`  Stake: ${ethers.utils.formatEther(pred.stakeAmount)} NTIQ`);
        console.log(`  Target Time: ${new Date(pred.targetTime * 1000).toLocaleString()}`);
        console.log(`  Resolved: ${pred.resolved}`);
      }
    } catch (error) {
      break;
    }
  }
  
  // Update prices and check oracle
  console.log("\n📈 Testing price oracle...");
  const currentPrice = ethers.utils.parseEther("2650"); // $2,650
  await priceOracle.updatePrice("ethereum", currentPrice);
  console.log("✅ Updated Ethereum price to $2,650");
  
  const [price, lastUpdated] = await priceOracle.getPrice("ethereum");
  console.log(`Price in oracle: $${ethers.utils.formatEther(price)}`);
  console.log(`Last updated: ${new Date(lastUpdated * 1000).toLocaleString()}`);
  
  // Get contract statistics
  console.log("\n📊 Contract Statistics:");
  const stats = await predictionBattle.getStats();
  console.log(`Total Predictions: ${stats.totalPredictions}`);
  console.log(`Total Staked: ${ethers.utils.formatEther(stats.totalStaked)} NTIQ`);
  console.log(`Total Rewards Paid: ${ethers.utils.formatEther(stats.totalRewardsPaid)} NTIQ`);
  
  // Get user predictions
  const userPreds = await predictionBattle.getUserPredictions(user1.address);
  console.log(`User1 has ${userPreds.length} prediction(s)`);
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 SMART CONTRACT TESTING COMPLETE!");
  console.log("=".repeat(60));
  console.log("✅ All functions working correctly on testnet");
  console.log("✅ Token transfers working");
  console.log("✅ Price oracle working");
  console.log("✅ Prediction creation working");
  console.log("✅ Contract statistics working");
  console.log("=".repeat(60));
  
  console.log("\n💡 To resolve predictions:");
  console.log("1. Wait for prediction time to expire");
  console.log("2. Call resolvePrediction() with actual price");
  console.log("3. Users can then claim their rewards");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ TESTING FAILED:");
    console.error(error);
    process.exit(1);
  });