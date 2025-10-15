// Simple Deployment Script for Polygon Amoy
// Enhanced Contracts with User-Friendly Instructions
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying Enhanced Contracts to Polygon Amoy Testnet");
    console.log("========================================================");

    // Check environment variables
    if (!process.env.PRIVATE_KEY) {
        console.log("❌ PRIVATE_KEY environment variable not set!");
        console.log("");
        console.log("📋 SETUP INSTRUCTIONS:");
        console.log("1. Open .env file in project root");
        console.log("2. Set your private key (without 0x prefix):");
        console.log("   PRIVATE_KEY=your_private_key_here");
        console.log("3. Load environment variables:");
        console.log("   source .env");
        console.log("4. Run this script again:");
        console.log("   npx hardhat run deploy-to-amoy.cjs --network amoy");
        console.log("");
        console.log("🔗 Get testnet MATIC from: https://faucet.polygon.technology/");
        console.log("📖 Full setup guide: SETUP_TESTNET_DEPLOYMENT.md");
        process.exit(1);
    }

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    if (balance < ethers.parseEther("0.1")) {
        console.log("");
        console.log("⚠️  LOW BALANCE WARNING!");
        console.log("You need at least 0.1 MATIC for deployment.");
        console.log("Get testnet MATIC from:");
        console.log("🔗 https://faucet.polygon.technology/");
        console.log("🔗 https://mumbaifaucet.com/");
        console.log("");
        console.log("After getting MATIC, run this script again.");
        return;
    }

    // Contract addresses
    const NTIQ_TOKEN_ADDRESS = "0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f";
    const TREASURY_ADDRESS = "0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4";

    console.log("");
    console.log("📋 Using Existing Contracts:");
    console.log("NTIQ Token:", NTIQ_TOKEN_ADDRESS);
    console.log("Treasury:", TREASURY_ADDRESS);
    console.log("");

    try {
        const deployedContracts = {
            network: "polygonAmoy",
            chainId: 80002,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            existingContracts: {
                NTIQToken: NTIQ_TOKEN_ADDRESS,
                Treasury: TREASURY_ADDRESS
            },
            newContracts: {}
        };

        console.log("🏗️  Starting deployment...");
        console.log("");

        // 1. Enhanced Prediction Staking
        console.log("1️⃣ Deploying Enhanced Prediction Staking...");
        const PredictionStaking = await ethers.getContractFactory("PredictionStaking");
        const predictionStaking = await PredictionStaking.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS,
            deployer.address
        );
        await predictionStaking.waitForDeployment();
        const predictionAddress = await predictionStaking.getAddress();
        deployedContracts.newContracts.EnhancedPredictionStaking = predictionAddress;
        console.log("✅ Enhanced Prediction Staking:", predictionAddress);

        // 2. Enhanced Parlay Staking
        console.log("2️⃣ Deploying Enhanced Parlay Staking...");
        const ParlayStaking = await ethers.getContractFactory("ParlayStaking");
        const parlayStaking = await ParlayStaking.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS
        );
        await parlayStaking.waitForDeployment();
        const parlayAddress = await parlayStaking.getAddress();
        deployedContracts.newContracts.EnhancedParlayStaking = parlayAddress;
        console.log("✅ Enhanced Parlay Staking:", parlayAddress);

        // 3. Enhanced Multi-Token Vault
        console.log("3️⃣ Deploying Enhanced Multi-Token Vault...");
        const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
        const multiTokenVault = await MultiTokenVault.deploy(
            deployer.address,
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
            NTIQ_TOKEN_ADDRESS
        );
        await multiTokenVault.waitForDeployment();
        const vaultAddress = await multiTokenVault.getAddress();
        deployedContracts.newContracts.EnhancedMultiTokenVault = vaultAddress;
        console.log("✅ Enhanced Multi-Token Vault:", vaultAddress);

        // 4. Prediction Insurance System
        console.log("4️⃣ Deploying Prediction Insurance System...");
        const PredictionInsurance = await ethers.getContractFactory("PredictionInsurance");
        const predictionInsurance = await PredictionInsurance.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS
        );
        await predictionInsurance.waitForDeployment();
        const insuranceAddress = await predictionInsurance.getAddress();
        deployedContracts.newContracts.PredictionInsuranceSystem = insuranceAddress;
        console.log("✅ Prediction Insurance System:", insuranceAddress);

        // 5. Referral Reward System
        console.log("5️⃣ Deploying Referral Reward System...");
        const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
        const referralSystem = await ReferralSystem.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS
        );
        await referralSystem.waitForDeployment();
        const referralAddress = await referralSystem.getAddress();
        deployedContracts.newContracts.ReferralRewardSystem = referralAddress;
        console.log("✅ Referral Reward System:", referralAddress);

        // 6. NFT Achievement System
        console.log("6️⃣ Deploying NFT Achievement System...");
        const AchievementSystem = await ethers.getContractFactory("AchievementSystem");
        const achievementSystem = await AchievementSystem.deploy(
            "NectiqAchievements",
            "NECTIQ",
            "https://api.nectiq.com/nft-metadata/"
        );
        await achievementSystem.waitForDeployment();
        const achievementAddress = await achievementSystem.getAddress();
        deployedContracts.newContracts.NFTAchievementSystem = achievementAddress;
        console.log("✅ NFT Achievement System:", achievementAddress);

        // Save deployment data
        const fileName = `polygon-amoy-deployment-${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(deployedContracts, null, 2));

        console.log("");
        console.log("🎉 DEPLOYMENT COMPLETE!");
        console.log("========================");
        console.log("");
        console.log("📋 Contract Addresses:");
        console.log("1. Enhanced Prediction Staking:", predictionAddress);
        console.log("2. Enhanced Parlay Staking:", parlayAddress);
        console.log("3. Enhanced Multi-Token Vault:", vaultAddress);
        console.log("4. Prediction Insurance System:", insuranceAddress);
        console.log("5. Referral Reward System:", referralAddress);
        console.log("6. NFT Achievement System:", achievementAddress);

        console.log("");
        console.log("🔗 Block Explorer Links:");
        console.log("Prediction Staking: https://amoy.polygonscan.com/address/" + predictionAddress);
        console.log("Parlay Staking: https://amoy.polygonscan.com/address/" + parlayAddress);
        console.log("Multi-Token Vault: https://amoy.polygonscan.com/address/" + vaultAddress);
        console.log("Prediction Insurance: https://amoy.polygonscan.com/address/" + insuranceAddress);
        console.log("Referral System: https://amoy.polygonscan.com/address/" + referralAddress);
        console.log("Achievement System: https://amoy.polygonscan.com/address/" + achievementAddress);

        console.log("");
        console.log("💾 Deployment data saved to:", fileName);

        console.log("");
        console.log("🎯 Next Steps:");
        console.log("1. ✅ Contracts deployed successfully");
        console.log("2. 🔍 Verify contracts on Polygonscan (optional)");
        console.log("3. 🧪 Test contract functions");
        console.log("4. 🔗 Update backend with new addresses");
        console.log("5. 🎯 Update frontend integration");

        console.log("");
        console.log("🔍 Verification Commands (if needed):");
        console.log(`npx hardhat verify --network amoy ${predictionAddress} "${NTIQ_TOKEN_ADDRESS}" "${TREASURY_ADDRESS}" "${deployer.address}"`);
        console.log(`npx hardhat verify --network amoy ${parlayAddress} "${NTIQ_TOKEN_ADDRESS}" "${TREASURY_ADDRESS}"`);

        console.log("");
        console.log("🚀 All enhanced contracts are now live on Polygon Amoy!");

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        console.log("");
        console.log("🔧 Troubleshooting:");
        console.log("1. Check your private key is correct");
        console.log("2. Ensure you have sufficient MATIC balance");
        console.log("3. Check network connectivity");
        console.log("4. Try running: npx hardhat compile");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
