const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  // Deploy NTIQ Token
  console.log("\n1. Deploying NTIQ Token...");
  const NTIQ = await ethers.getContractFactory("NTIQ");
  const ntiq = await NTIQ.deploy();
  await ntiq.deployed();
  console.log("NTIQ Token deployed to:", ntiq.address);
  
  // Deploy Price Oracle
  console.log("\n2. Deploying Price Oracle...");
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.deployed();
  console.log("Price Oracle deployed to:", priceOracle.address);
  
  // Deploy Prediction Battle
  console.log("\n3. Deploying Prediction Battle...");
  const PredictionBattle = await ethers.getContractFactory("PredictionBattle");
  const predictionBattle = await PredictionBattle.deploy(ntiq.address, priceOracle.address);
  await predictionBattle.deployed();
  console.log("Prediction Battle deployed to:", predictionBattle.address);
  
  // Setup initial configurations
  console.log("\n4. Setting up initial configurations...");
  
  // Authorize prediction battle contract as price oracle feeder
  await priceOracle.setAuthorizedFeeder(predictionBattle.address, true);
  console.log("✓ Authorized Prediction Battle as price feeder");
  
  // Transfer some NTIQ tokens to prediction battle contract for rewards
  const rewardAmount = ethers.utils.parseEther("100000"); // 100k NTIQ
  await ntiq.transfer(predictionBattle.address, rewardAmount);
  console.log("✓ Transferred 100k NTIQ to Prediction Battle for rewards");
  
  // Set up initial test prices
  const testPrices = [
    ["bitcoin", ethers.utils.parseEther("43000")],
    ["ethereum", ethers.utils.parseEther("2600")],
    ["binancecoin", ethers.utils.parseEther("315")],
    ["cardano", ethers.utils.parseEther("0.38")],
    ["solana", ethers.utils.parseEther("98")],
    ["chainlink", ethers.utils.parseEther("14.5")],
    ["polkadot", ethers.utils.parseEther("6.8")],
    ["litecoin", ethers.utils.parseEther("73")],
    ["matic-network", ethers.utils.parseEther("0.85")],
    ["hyperliquid", ethers.utils.parseEther("28")]
  ];
  
  for (const [crypto, price] of testPrices) {
    await priceOracle.updatePrice(crypto, price);
  }
  console.log("✓ Set up initial test prices for all cryptocurrencies");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      NTIQ: ntiq.address,
      PriceOracle: priceOracle.address,
      PredictionBattle: predictionBattle.address
    },
    deploymentTime: new Date().toISOString()
  };
  
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("=".repeat(50));
  
  // Verify contracts on testnet (if not local)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await ntiq.deployTransaction.wait(5);
    await priceOracle.deployTransaction.wait(5);
    await predictionBattle.deployTransaction.wait(5);
    
    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: ntiq.address,
        constructorArguments: [],
      });
      console.log("✓ NTIQ Token verified");
    } catch (error) {
      console.log("NTIQ verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: priceOracle.address,
        constructorArguments: [],
      });
      console.log("✓ Price Oracle verified");
    } catch (error) {
      console.log("Price Oracle verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: predictionBattle.address,
        constructorArguments: [ntiq.address, priceOracle.address],
      });
      console.log("✓ Prediction Battle verified");
    } catch (error) {
      console.log("Prediction Battle verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });