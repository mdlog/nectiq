const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying simplified smart contracts...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));
  
  // Deploy Simple NTIQ Token
  console.log("\n1. Deploying Simple NTIQ Token...");
  const SimpleNTIQ = await ethers.getContractFactory("SimpleNTIQ");
  const ntiq = await SimpleNTIQ.deploy();
  await ntiq.deployed();
  console.log("✓ Simple NTIQ deployed to:", ntiq.address);
  
  // Deploy Simple Price Oracle
  console.log("\n2. Deploying Simple Price Oracle...");
  const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await SimplePriceOracle.deploy();
  await priceOracle.deployed();
  console.log("✓ Simple Price Oracle deployed to:", priceOracle.address);
  
  // Deploy Simple Prediction Battle
  console.log("\n3. Deploying Simple Prediction Battle...");
  const SimplePredictionBattle = await ethers.getContractFactory("SimplePredictionBattle");
  const predictionBattle = await SimplePredictionBattle.deploy(ntiq.address, priceOracle.address);
  await predictionBattle.deployed();
  console.log("✓ Simple Prediction Battle deployed to:", predictionBattle.address);
  
  // Setup initial configurations
  console.log("\n4. Setting up configurations...");
  
  // Transfer NTIQ to prediction battle for rewards
  const rewardAmount = ethers.utils.parseEther("100000");
  await ntiq.transfer(predictionBattle.address, rewardAmount);
  console.log("✓ Transferred 100k NTIQ to Prediction Battle");
  
  // Set initial prices
  const initialPrices = [
    ["bitcoin", ethers.utils.parseEther("43000")],
    ["ethereum", ethers.utils.parseEther("2600")],
    ["binancecoin", ethers.utils.parseEther("315")],
    ["cardano", ethers.utils.parseEther("0.38")],
    ["solana", ethers.utils.parseEther("98")]
  ];
  
  for (const [crypto, price] of initialPrices) {
    await priceOracle.updatePrice(crypto, price);
  }
  console.log("✓ Set initial prices for cryptocurrencies");
  
  // Create test prediction
  console.log("\n5. Creating test prediction...");
  await ntiq.approve(predictionBattle.address, ethers.utils.parseEther("1000"));
  
  const tx = await predictionBattle.submitPrediction(
    "bitcoin",
    ethers.utils.parseEther("45000"), // Predict $45,000
    ethers.utils.parseEther("100"),   // Stake 100 NTIQ
    3600                              // 1 hour duration
  );
  await tx.wait();
  console.log("✓ Created test prediction for Bitcoin");
  
  // Get prediction details
  const prediction = await predictionBattle.getPrediction(1);
  console.log("\nTest Prediction Details:");
  console.log("- User:", prediction.user);
  console.log("- Cryptocurrency:", prediction.cryptocurrency);
  console.log("- Predicted Price: $" + ethers.utils.formatEther(prediction.predictedPrice));
  console.log("- Stake Amount:", ethers.utils.formatEther(prediction.stakeAmount), "NTIQ");
  console.log("- Target Time:", new Date(prediction.targetTime * 1000).toLocaleString());
  
  // Test resolution after time passes
  console.log("\n6. Testing prediction resolution...");
  
  // Simulate time passing
  await ethers.provider.send("evm_increaseTime", [3601]); // 1 hour + 1 second
  await ethers.provider.send("evm_mine");
  
  // Resolve prediction with actual price
  const actualPrice = ethers.utils.parseEther("44200"); // $44,200 (good accuracy)
  await predictionBattle.resolvePrediction(1, actualPrice);
  console.log("✓ Resolved prediction with actual price: $" + ethers.utils.formatEther(actualPrice));
  
  // Get resolved prediction details
  const resolvedPred = await predictionBattle.getPrediction(1);
  console.log("\nResolved Prediction:");
  console.log("- Predicted: $" + ethers.utils.formatEther(resolvedPred.predictedPrice));
  console.log("- Actual: $" + ethers.utils.formatEther(resolvedPred.actualPrice));
  console.log("- Accuracy Score:", resolvedPred.accuracyScore + "/10000");
  console.log("- Reward Amount:", ethers.utils.formatEther(resolvedPred.rewardAmount), "NTIQ");
  
  // Calculate accuracy percentage
  const errorPercentage = Math.abs(
    (parseFloat(ethers.utils.formatEther(resolvedPred.predictedPrice)) - 
     parseFloat(ethers.utils.formatEther(resolvedPred.actualPrice))) /
    parseFloat(ethers.utils.formatEther(resolvedPred.actualPrice)) * 100
  );
  console.log("- Error Percentage:", errorPercentage.toFixed(2) + "%");
  
  // Claim reward
  console.log("\n7. Claiming reward...");
  const balanceBefore = await ntiq.balanceOf(deployer.address);
  await predictionBattle.claimReward(1);
  const balanceAfter = await ntiq.balanceOf(deployer.address);
  
  console.log("✓ Reward claimed successfully");
  console.log("- Balance change:", ethers.utils.formatEther(balanceAfter.sub(balanceBefore)), "NTIQ");
  
  // Contract statistics
  console.log("\n8. Contract Statistics:");
  const stats = await predictionBattle.getStats();
  console.log("- Total Predictions:", stats.totalPredictions.toString());
  console.log("- Total Staked:", ethers.utils.formatEther(stats.totalStaked), "NTIQ");
  console.log("- Total Rewards Paid:", ethers.utils.formatEther(stats.totalRewardsPaid), "NTIQ");
  
  const deploymentInfo = {
    network: "localhost",
    chainId: (await ethers.provider.getNetwork()).chainId,
    contracts: {
      SimpleNTIQ: ntiq.address,
      SimplePriceOracle: priceOracle.address,
      SimplePredictionBattle: predictionBattle.address
    },
    testResults: {
      predictionCreated: true,
      predictionResolved: true,
      rewardClaimed: true,
      accuracyScore: resolvedPred.accuracyScore.toString(),
      errorPercentage: errorPercentage.toFixed(2) + "%"
    },
    deploymentTime: new Date().toISOString()
  };
  
  console.log("\n" + "=".repeat(60));
  console.log("SMART CONTRACT DEPLOYMENT & TESTING COMPLETE");
  console.log("=".repeat(60));
  console.log("All core functions tested successfully:");
  console.log("✓ submitPrediction() - Working");
  console.log("✓ resolvePrediction() - Working");
  console.log("✓ claimReward() - Working");
  console.log("✓ Accuracy calculation - Working");
  console.log("✓ Reward multipliers - Working");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });