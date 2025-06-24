const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying to ${network.toUpperCase()} testnet...`);
  
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying with account:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.log("❌ WARNING: Low balance! You need at least 0.01 ETH for deployment");
    console.log(`Get testnet ETH from faucet:`);
    if (network === "holesky") {
      console.log("Holesky Faucet: https://holesky-faucet.pk910.de/");
    } else if (network === "sepolia") {
      console.log("Sepolia Faucet: https://sepoliafaucet.com/");
    }
    return;
  }
  
  console.log("\n📋 DEPLOYMENT PLAN:");
  console.log("1. Deploy SimpleNTIQ Token");
  console.log("2. Deploy SimplePriceOracle");
  console.log("3. Deploy SimplePredictionBattle");
  console.log("4. Setup initial configuration");
  console.log("5. Create test prediction");
  console.log("\nStarting deployment...\n");
  
  // Deploy Simple NTIQ Token
  console.log("1️⃣ Deploying SimpleNTIQ Token...");
  const SimpleNTIQ = await ethers.getContractFactory("SimpleNTIQ");
  const ntiq = await SimpleNTIQ.deploy();
  await ntiq.deployed();
  console.log("✅ SimpleNTIQ deployed to:", ntiq.address);
  
  // Deploy Simple Price Oracle
  console.log("\n2️⃣ Deploying SimplePriceOracle...");
  const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await SimplePriceOracle.deploy();
  await priceOracle.deployed();
  console.log("✅ SimplePriceOracle deployed to:", priceOracle.address);
  
  // Deploy Simple Prediction Battle
  console.log("\n3️⃣ Deploying SimplePredictionBattle...");
  const SimplePredictionBattle = await ethers.getContractFactory("SimplePredictionBattle");
  const predictionBattle = await SimplePredictionBattle.deploy(ntiq.address, priceOracle.address);
  await predictionBattle.deployed();
  console.log("✅ SimplePredictionBattle deployed to:", predictionBattle.address);
  
  // Setup initial configurations
  console.log("\n4️⃣ Setting up initial configurations...");
  
  // Transfer NTIQ to prediction battle for rewards
  const rewardAmount = ethers.utils.parseEther("100000");
  console.log("📤 Transferring 100k NTIQ to PredictionBattle...");
  await ntiq.transfer(predictionBattle.address, rewardAmount);
  console.log("✅ NTIQ transferred successfully");
  
  // Set initial cryptocurrency prices (current market prices)
  console.log("💰 Setting initial cryptocurrency prices...");
  const initialPrices = [
    ["bitcoin", ethers.utils.parseEther("43000")],      // $43,000
    ["ethereum", ethers.utils.parseEther("2600")],      // $2,600
    ["binancecoin", ethers.utils.parseEther("315")],    // $315
    ["cardano", ethers.utils.parseEther("0.38")],       // $0.38
    ["solana", ethers.utils.parseEther("98")],          // $98
    ["chainlink", ethers.utils.parseEther("14.5")],     // $14.5
    ["polkadot", ethers.utils.parseEther("6.8")],       // $6.8
    ["litecoin", ethers.utils.parseEther("73")],        // $73
    ["matic-network", ethers.utils.parseEther("0.85")], // $0.85
    ["hyperliquid", ethers.utils.parseEther("28")]      // $28
  ];
  
  for (const [crypto, price] of initialPrices) {
    await priceOracle.updatePrice(crypto, price);
    console.log(`   ✓ Set ${crypto}: $${ethers.utils.formatEther(price)}`);
  }
  
  // Create test prediction
  console.log("\n5️⃣ Creating test prediction...");
  await ntiq.approve(predictionBattle.address, ethers.utils.parseEther("1000"));
  
  const tx = await predictionBattle.submitPrediction(
    "bitcoin",
    ethers.utils.parseEther("45000"), // Predict $45,000
    ethers.utils.parseEther("100"),   // Stake 100 NTIQ
    3600                              // 1 hour duration
  );
  await tx.wait();
  console.log("✅ Test prediction created (Bitcoin: $45,000, Stake: 100 NTIQ)");
  
  // Get deployment info
  const deploymentInfo = {
    network: network,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      SimpleNTIQ: ntiq.address,
      SimplePriceOracle: priceOracle.address,
      SimplePredictionBattle: predictionBattle.address
    },
    blockExplorerUrls: {
      holesky: `https://holesky.etherscan.io`,
      sepolia: `https://sepolia.etherscan.io`
    },
    deploymentTime: new Date().toISOString(),
    testPrediction: {
      id: 1,
      cryptocurrency: "bitcoin",
      predictedPrice: "45000",
      stakeAmount: "100",
      duration: "1 hour"
    }
  };
  
  // Save deployment info to file
  const fileName = `deployment-${network}-${Date.now()}.json`;
  fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n" + "=".repeat(80));
  console.log(`🎉 DEPLOYMENT TO ${network.toUpperCase()} SUCCESSFUL!`);
  console.log("=".repeat(80));
  
  console.log("\n📋 CONTRACT ADDRESSES:");
  console.log(`SimpleNTIQ Token: ${ntiq.address}`);
  console.log(`SimplePriceOracle: ${priceOracle.address}`);
  console.log(`SimplePredictionBattle: ${predictionBattle.address}`);
  
  console.log("\n🔗 BLOCK EXPLORER LINKS:");
  const explorerBase = network === "holesky" ? "https://holesky.etherscan.io" : "https://sepolia.etherscan.io";
  console.log(`SimpleNTIQ: ${explorerBase}/address/${ntiq.address}`);
  console.log(`SimplePriceOracle: ${explorerBase}/address/${priceOracle.address}`);
  console.log(`SimplePredictionBattle: ${explorerBase}/address/${predictionBattle.address}`);
  
  console.log("\n💡 NEXT STEPS:");
  console.log("1. Verify contracts on Etherscan (optional)");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Test prediction functionality");
  console.log("4. Set up price oracle automation");
  
  console.log("\n📄 TESTING COMMANDS:");
  console.log(`npx hardhat run scripts/test-interaction.cjs --network ${network}`);
  
  console.log("\n💾 Deployment info saved to:", fileName);
  console.log("=".repeat(80));
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  });