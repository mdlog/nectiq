// Deployment Script for Enhanced Contracts
// Using existing NTIQ Token address
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Starting Enhanced Contracts Deployment...");
    console.log("Using existing NTIQ Token address");
    console.log("=====================================");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    // ============ EXISTING CONTRACT ADDRESSES ============
    const NTIQ_TOKEN_ADDRESS = "0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f"; // Existing NTIQ Token
    const TREASURY_ADDRESS = "0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4"; // Existing Treasury

    console.log("\n📋 Using Existing Contracts:");
    console.log("NTIQ Token:", NTIQ_TOKEN_ADDRESS);
    console.log("Treasury:", TREASURY_ADDRESS);

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

        // ============ PHASE 1: DEPLOY ENHANCED STAKING CONTRACTS ============
        console.log("\n🏗️  PHASE 1: Deploying Enhanced Staking Contracts...");

        console.log("\n1️⃣ Deploying Enhanced Prediction Staking...");
        const PredictionStaking = await ethers.getContractFactory("PredictionStaking");
        const predictionStaking = await PredictionStaking.deploy(
            NTIQ_TOKEN_ADDRESS, // Existing NTIQ Token
            TREASURY_ADDRESS,   // Existing Treasury
            deployer.address    // Oracle (using deployer for now)
        );
        await predictionStaking.waitForDeployment();
        const predictionAddress = await predictionStaking.getAddress();
        deployedContracts.newContracts.EnhancedPredictionStaking = predictionAddress;
        console.log("✅ Enhanced Prediction Staking deployed to:", predictionAddress);

        console.log("\n2️⃣ Deploying Enhanced Parlay Staking...");
        const ParlayStaking = await ethers.getContractFactory("ParlayStaking");
        const parlayStaking = await ParlayStaking.deploy(
            NTIQ_TOKEN_ADDRESS, // Existing NTIQ Token
            TREASURY_ADDRESS    // Existing Treasury
        );
        await parlayStaking.waitForDeployment();
        const parlayAddress = await parlayStaking.getAddress();
        deployedContracts.newContracts.EnhancedParlayStaking = parlayAddress;
        console.log("✅ Enhanced Parlay Staking deployed to:", parlayAddress);

        // ============ PHASE 2: DEPLOY ENHANCED MULTI-TOKEN VAULT ============
        console.log("\n🏗️  PHASE 2: Deploying Enhanced Multi-Token Vault...");

        console.log("\n3️⃣ Deploying Enhanced Multi-Token Vault...");
        const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
        const multiTokenVault = await MultiTokenVault.deploy(
            deployer.address, // Backend signer
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
            "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", // LINK
            NTIQ_TOKEN_ADDRESS  // Existing NTIQ Token
        );
        await multiTokenVault.waitForDeployment();
        const vaultAddress = await multiTokenVault.getAddress();
        deployedContracts.newContracts.EnhancedMultiTokenVault = vaultAddress;
        console.log("✅ Enhanced Multi-Token Vault deployed to:", vaultAddress);

        // ============ PHASE 3: DEPLOY NEW FEATURE CONTRACTS ============
        console.log("\n🏗️  PHASE 3: Deploying New Feature Contracts...");

        console.log("\n4️⃣ Deploying Prediction Insurance System...");
        const PredictionInsurance = await ethers.getContractFactory("PredictionInsurance");
        const predictionInsurance = await PredictionInsurance.deploy(
            NTIQ_TOKEN_ADDRESS, // Existing NTIQ Token
            TREASURY_ADDRESS    // Existing Treasury
        );
        await predictionInsurance.waitForDeployment();
        const insuranceAddress = await predictionInsurance.getAddress();
        deployedContracts.newContracts.PredictionInsuranceSystem = insuranceAddress;
        console.log("✅ Prediction Insurance System deployed to:", insuranceAddress);

        console.log("\n5️⃣ Deploying Referral Reward System...");
        const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
        const referralSystem = await ReferralSystem.deploy(
            NTIQ_TOKEN_ADDRESS, // Existing NTIQ Token
            TREASURY_ADDRESS    // Existing Treasury
        );
        await referralSystem.waitForDeployment();
        const referralAddress = await referralSystem.getAddress();
        deployedContracts.newContracts.ReferralRewardSystem = referralAddress;
        console.log("✅ Referral Reward System deployed to:", referralAddress);

        console.log("\n6️⃣ Deploying NFT Achievement System...");
        const AchievementSystem = await ethers.getContractFactory("AchievementSystem");
        const achievementSystem = await AchievementSystem.deploy(
            "NectiqAchievements",
            "NECTIQ",
            "https://api.nectiq.com/nft-metadata/"
        );
        await achievementSystem.waitForDeployment();
        const achievementAddress = await achievementSystem.getAddress();
        deployedContracts.newContracts.NFTAchievementSystem = achievementAddress;
        console.log("✅ NFT Achievement System deployed to:", achievementAddress);

        // ============ SAVE DEPLOYMENT DATA ============
        const fileName = `enhanced-deployment-${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(deployedContracts, null, 2));

        // ============ DEPLOYMENT SUMMARY ============
        console.log("\n🎉 ENHANCED CONTRACTS DEPLOYMENT COMPLETE!");
        console.log("=====================================");
        console.log("📋 Contract Names & Addresses:");
        console.log("1. Enhanced Prediction Staking:", predictionAddress);
        console.log("2. Enhanced Parlay Staking:", parlayAddress);
        console.log("3. Enhanced Multi-Token Vault:", vaultAddress);
        console.log("4. Prediction Insurance System:", insuranceAddress);
        console.log("5. Referral Reward System:", referralAddress);
        console.log("6. NFT Achievement System:", achievementAddress);

        console.log("\n📊 Using Existing Contracts:");
        console.log("NTIQ Token:", NTIQ_TOKEN_ADDRESS);
        console.log("Treasury:", TREASURY_ADDRESS);

        console.log("\n💾 Deployment data saved to:", fileName);

        // ============ BLOCK EXPLORER LINKS ============
        console.log("\n🔗 Block Explorer Links:");
        console.log("Enhanced Prediction Staking: https://amoy.polygonscan.com/address/" + predictionAddress);
        console.log("Enhanced Parlay Staking: https://amoy.polygonscan.com/address/" + parlayAddress);
        console.log("Enhanced Multi-Token Vault: https://amoy.polygonscan.com/address/" + vaultAddress);
        console.log("Prediction Insurance: https://amoy.polygonscan.com/address/" + insuranceAddress);
        console.log("Referral System: https://amoy.polygonscan.com/address/" + referralAddress);
        console.log("Achievement System: https://amoy.polygonscan.com/address/" + achievementAddress);

        // ============ NEXT STEPS ============
        console.log("\n🔍 Next Steps:");
        console.log("1. ✅ Enhanced contracts deployed successfully");
        console.log("2. 🔍 Verify contracts on Polygonscan");
        console.log("3. 🧪 Test all contract functions");
        console.log("4. 🔗 Update backend with new contract addresses");
        console.log("5. 🎯 Update frontend integration");
        console.log("6. 📊 Update documentation");

        // ============ TESTING SUGGESTIONS ============
        console.log("\n🧪 Testing Suggestions:");
        console.log("- Test enhanced prediction staking with duration multipliers");
        console.log("- Test enhanced parlay staking with compound formula");
        console.log("- Test multi-token vault with NTIQ support");
        console.log("- Test prediction insurance purchase and claims");
        console.log("- Test referral registration and reward distribution");
        console.log("- Test NFT achievement minting");

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
