// Smart Contract Deployment Script
// Polygon Amoy Testnet Deployment

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Smart Contract Deployment...");
    console.log("Network:", network.name);
    console.log("=====================================");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // ============ DEPLOYMENT PARAMETERS ============
    
    // Token addresses on Polygon Amoy Testnet
    const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH on Amoy
    const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Amoy  
    const LINK_ADDRESS = "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39"; // LINK on Amoy
    
    // Admin addresses (update these with actual addresses)
    const BACKEND_SIGNER = deployer.address; // Update with actual backend signer
    const TREASURY_ADDRESS = deployer.address; // Update with actual treasury address
    const ORACLE_ADDRESS = deployer.address; // Update with actual oracle address
    
    // NFT metadata base URI
    const BASE_URI = "https://api.nectiq.com/nft-metadata/";

    console.log("\n📋 Deployment Parameters:");
    console.log("WETH:", WETH_ADDRESS);
    console.log("USDC:", USDC_ADDRESS);
    console.log("LINK:", LINK_ADDRESS);
    console.log("Backend Signer:", BACKEND_SIGNER);
    console.log("Treasury:", TREASURY_ADDRESS);
    console.log("Oracle:", ORACLE_ADDRESS);

    const deployedContracts = {};

    try {
        // ============ PHASE 1: CORE INFRASTRUCTURE ============
        console.log("\n🏗️  PHASE 1: Deploying Core Infrastructure...");

        // 1. Deploy NTIQ Token (if not already deployed)
        console.log("\n1️⃣ Deploying NTIQ Token...");
        const NTIQToken = await ethers.getContractFactory("NTIQToken");
        const ntiqToken = await NTIQToken.deploy();
        await ntiqToken.waitForDeployment();
        const ntiqTokenAddress = await ntiqToken.getAddress();
        deployedContracts.NTIQToken = ntiqTokenAddress;
        console.log("✅ NTIQ Token deployed to:", ntiqTokenAddress);

        // 2. Deploy Multi-Token Vault with NTIQ Support
        console.log("\n2️⃣ Deploying Multi-Token Vault...");
        const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
        const multiTokenVault = await MultiTokenVault.deploy(
            BACKEND_SIGNER,
            WETH_ADDRESS,
            USDC_ADDRESS,
            LINK_ADDRESS,
            ntiqTokenAddress
        );
        await multiTokenVault.waitForDeployment();
        const multiTokenVaultAddress = await multiTokenVault.getAddress();
        deployedContracts.MultiTokenVault = multiTokenVaultAddress;
        console.log("✅ Multi-Token Vault deployed to:", multiTokenVaultAddress);

        // ============ PHASE 2: ENHANCED STAKING ============
        console.log("\n🏗️  PHASE 2: Deploying Enhanced Staking Contracts...");

        // 3. Deploy Enhanced Prediction Staking
        console.log("\n3️⃣ Deploying Enhanced Prediction Staking...");
        const PredictionStaking = await ethers.getContractFactory("PredictionStaking");
        const predictionStaking = await PredictionStaking.deploy(
            ntiqTokenAddress,
            TREASURY_ADDRESS,
            ORACLE_ADDRESS
        );
        await predictionStaking.waitForDeployment();
        const predictionStakingAddress = await predictionStaking.getAddress();
        deployedContracts.PredictionStaking = predictionStakingAddress;
        console.log("✅ Enhanced Prediction Staking deployed to:", predictionStakingAddress);

        // 4. Deploy Enhanced Parlay Staking
        console.log("\n4️⃣ Deploying Enhanced Parlay Staking...");
        const ParlayStaking = await ethers.getContractFactory("ParlayStaking");
        const parlayStaking = await ParlayStaking.deploy(
            ntiqTokenAddress,
            TREASURY_ADDRESS
        );
        await parlayStaking.waitForDeployment();
        const parlayStakingAddress = await parlayStaking.getAddress();
        deployedContracts.ParlayStaking = parlayStakingAddress;
        console.log("✅ Enhanced Parlay Staking deployed to:", parlayStakingAddress);

        // ============ PHASE 3: NEW FEATURE CONTRACTS ============
        console.log("\n🏗️  PHASE 3: Deploying New Feature Contracts...");

        // 5. Deploy Prediction Insurance
        console.log("\n5️⃣ Deploying Prediction Insurance System...");
        const PredictionInsurance = await ethers.getContractFactory("PredictionInsurance");
        const predictionInsurance = await PredictionInsurance.deploy(
            ntiqTokenAddress,
            TREASURY_ADDRESS
        );
        await predictionInsurance.waitForDeployment();
        const predictionInsuranceAddress = await predictionInsurance.getAddress();
        deployedContracts.PredictionInsurance = predictionInsuranceAddress;
        console.log("✅ Prediction Insurance deployed to:", predictionInsuranceAddress);

        // 6. Deploy Referral System
        console.log("\n6️⃣ Deploying Referral Reward System...");
        const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
        const referralSystem = await ReferralSystem.deploy(
            ntiqTokenAddress,
            TREASURY_ADDRESS
        );
        await referralSystem.waitForDeployment();
        const referralSystemAddress = await referralSystem.getAddress();
        deployedContracts.ReferralSystem = referralSystemAddress;
        console.log("✅ Referral System deployed to:", referralSystemAddress);

        // 7. Deploy Achievement System (NFT)
        console.log("\n7️⃣ Deploying NFT Achievement System...");
        const AchievementSystem = await ethers.getContractFactory("AchievementSystem");
        const achievementSystem = await AchievementSystem.deploy(
            "NectiqAchievements",
            "NECTIQ",
            BASE_URI
        );
        await achievementSystem.waitForDeployment();
        const achievementSystemAddress = await achievementSystem.getAddress();
        deployedContracts.AchievementSystem = achievementSystemAddress;
        console.log("✅ Achievement System deployed to:", achievementSystemAddress);

        // ============ DEPLOYMENT SUMMARY ============
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("=====================================");
        console.log("📋 Deployed Contracts:");
        console.log("1. NTIQ Token:", deployedContracts.NTIQToken);
        console.log("2. Multi-Token Vault:", deployedContracts.MultiTokenVault);
        console.log("3. Enhanced Prediction Staking:", deployedContracts.PredictionStaking);
        console.log("4. Enhanced Parlay Staking:", deployedContracts.ParlayStaking);
        console.log("5. Prediction Insurance System:", deployedContracts.PredictionInsurance);
        console.log("6. Referral Reward System:", deployedContracts.ReferralSystem);
        console.log("7. NFT Achievement System:", deployedContracts.AchievementSystem);

        // ============ SAVE CONTRACT ADDRESSES ============
        const fs = require('fs');
        const deploymentData = {
            network: network.name,
            chainId: network.config.chainId,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: deployedContracts
        };

        fs.writeFileSync(
            './deployed-contracts.json',
            JSON.stringify(deploymentData, null, 2)
        );

        console.log("\n💾 Contract addresses saved to: deployed-contracts.json");
        console.log("\n🔍 Next Steps:");
        console.log("1. Verify contracts on Polygonscan");
        console.log("2. Test all functions with small amounts");
        console.log("3. Update backend with new contract addresses");
        console.log("4. Update frontend integration");

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
