const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "POL\n");

  // Contract addresses from .env
  const NTIQ_TOKEN_ADDRESS = process.env.NTIQ_TOKEN_SIMPLE_ADDRESS || "0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f";
  const TREASURY_ADDRESS = process.env.ADMIN_WALLET_ADDRESSES?.split(",")[0] || deployer.address;

  console.log("🔧 Configuration:");
  console.log("   NTIQ Token:", NTIQ_TOKEN_ADDRESS);
  console.log("   Treasury:", TREASURY_ADDRESS);
  console.log("");

  // Deploy PredictionStaking
  console.log("📦 Deploying PredictionStaking...");
  const PredictionStaking = await hre.ethers.getContractFactory("PredictionStaking");
  const predictionStaking = await PredictionStaking.deploy(
    NTIQ_TOKEN_ADDRESS,
    TREASURY_ADDRESS
  );
  await predictionStaking.waitForDeployment();
  const predictionStakingAddress = await predictionStaking.getAddress();
  console.log("✅ PredictionStaking deployed to:", predictionStakingAddress);
  console.log("");

  // Deploy BattleEscrow
  console.log("📦 Deploying BattleEscrow...");
  const BattleEscrow = await hre.ethers.getContractFactory("BattleEscrow");
  const battleEscrow = await BattleEscrow.deploy(
    NTIQ_TOKEN_ADDRESS,
    TREASURY_ADDRESS
  );
  await battleEscrow.waitForDeployment();
  const battleEscrowAddress = await battleEscrow.getAddress();
  console.log("✅ BattleEscrow deployed to:", battleEscrowAddress);
  console.log("");

  // Deploy ParlayStaking
  console.log("📦 Deploying ParlayStaking...");
  const ParlayStaking = await hre.ethers.getContractFactory("ParlayStaking");
  const parlayStaking = await ParlayStaking.deploy(
    NTIQ_TOKEN_ADDRESS,
    TREASURY_ADDRESS
  );
  await parlayStaking.waitForDeployment();
  const parlayStakingAddress = await parlayStaking.getAddress();
  console.log("✅ ParlayStaking deployed to:", parlayStakingAddress);
  console.log("");

  // Deploy TournamentPool
  console.log("📦 Deploying TournamentPool...");
  const TournamentPool = await hre.ethers.getContractFactory("TournamentPool");
  const tournamentPool = await TournamentPool.deploy(NTIQ_TOKEN_ADDRESS);
  await tournamentPool.waitForDeployment();
  const tournamentPoolAddress = await tournamentPool.getAddress();
  console.log("✅ TournamentPool deployed to:", tournamentPoolAddress);
  console.log("");

  // Save deployment addresses
  const deploymentInfo = {
    network: "polygonAmoy",
    chainId: 80002,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ntiqToken: NTIQ_TOKEN_ADDRESS,
      treasury: TREASURY_ADDRESS,
      predictionStaking: predictionStakingAddress,
      battleEscrow: battleEscrowAddress,
      parlayStaking: parlayStakingAddress,
      tournamentPool: tournamentPoolAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "polygonAmoy.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Deployment info saved to:", deploymentFile);
  console.log("");

  // Print summary
  console.log("🎉 Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("   PredictionStaking:", predictionStakingAddress);
  console.log("   BattleEscrow:", battleEscrowAddress);
  console.log("   ParlayStaking:", parlayStakingAddress);
  console.log("   TournamentPool:", tournamentPoolAddress);
  console.log("");
  console.log("🔍 Verify contracts on Polygonscan:");
  console.log(`   npx hardhat verify --network polygonAmoy ${predictionStakingAddress} ${NTIQ_TOKEN_ADDRESS} ${TREASURY_ADDRESS}`);
  console.log(`   npx hardhat verify --network polygonAmoy ${battleEscrowAddress} ${NTIQ_TOKEN_ADDRESS} ${TREASURY_ADDRESS}`);
  console.log(`   npx hardhat verify --network polygonAmoy ${parlayStakingAddress} ${NTIQ_TOKEN_ADDRESS} ${TREASURY_ADDRESS}`);
  console.log(`   npx hardhat verify --network polygonAmoy ${tournamentPoolAddress} ${NTIQ_TOKEN_ADDRESS}`);
  console.log("");
  console.log("📝 Add these to .env file:");
  console.log(`PREDICTION_STAKING_ADDRESS=${predictionStakingAddress}`);
  console.log(`BATTLE_ESCROW_ADDRESS=${battleEscrowAddress}`);
  console.log(`PARLAY_STAKING_ADDRESS=${parlayStakingAddress}`);
  console.log(`TOURNAMENT_POOL_ADDRESS=${tournamentPoolAddress}`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
