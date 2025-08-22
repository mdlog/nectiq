const { ethers } = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`Deploying to ${network}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  
  // Deploy contracts
  const SimpleNTIQ = await ethers.getContractFactory("SimpleNTIQ");
  const ntiq = await SimpleNTIQ.deploy();
  await ntiq.deployed();
  console.log("SimpleNTIQ:", ntiq.address);
  
  const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await SimplePriceOracle.deploy();
  await priceOracle.deployed();
  console.log("SimplePriceOracle:", priceOracle.address);
  
  const SimplePredictionBattle = await ethers.getContractFactory("SimplePredictionBattle");
  const predictionBattle = await SimplePredictionBattle.deploy(ntiq.address, priceOracle.address);
  await predictionBattle.deployed();
  console.log("SimplePredictionBattle:", predictionBattle.address);
  
  // Setup
  await ntiq.transfer(predictionBattle.address, ethers.utils.parseEther("100000"));
  await priceOracle.updatePrice("bitcoin", ethers.utils.parseEther("43000"));
  await priceOracle.updatePrice("ethereum", ethers.utils.parseEther("2600"));
  
  console.log("\nDeployment complete!");
  console.log("Contract addresses saved for frontend integration.");
  
  return {
    SimpleNTIQ: ntiq.address,
    SimplePriceOracle: priceOracle.address,
    SimplePredictionBattle: predictionBattle.address
  };
}

main().catch(console.error);