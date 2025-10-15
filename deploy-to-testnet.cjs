// Deployment Script for Polygon Amoy Testnet
// Enhanced Contracts with Existing NTIQ Token
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying Enhanced Contracts to Polygon Amoy Testnet...");
    console.log("=====================================");

    // Check environment variables
    if (!process.env.PRIVATE_KEY) {
        console.log("❌ Error: PRIVATE_KEY environment variable not set");
        console.log("Please set your private key:");
        console.log("export PRIVATE_KEY='your_private_key_here'");
        process.exit(1);
    }

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    if (balance < ethers.parseEther("0.1")) {
        console.log("⚠️  Warning: Low balance! Get testnet MATIC from faucet:");
        console.log("https://faucet.polygon.technology/");
        console.log("https://mumbaifaucet.com/");
        return;
    }

    // ============ CONTRACT ADDRESSES ============
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
            newContracts: {},
            contractNames: {}
        };

        console.log("\n🏗️  Starting Enhanced Contracts Deployment...");

        // ============ 1. ENHANCED PREDICTION STAKING ============
        console.log("\n1️⃣ Deploying Enhanced Prediction Staking...");
        const PredictionStaking = await ethers.getContractFactory("PredictionStaking");
        const predictionStaking = await PredictionStaking.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS,
            deployer.address // Oracle (using deployer for now)
        );
        await predictionStaking.waitForDeployment();
        const predictionAddress = await predictionStaking.getAddress();
        deployedContracts.newContracts.EnhancedPredictionStaking = predictionAddress;
        deployedContracts.contractNames[predictionAddress] = "Enhanced Prediction Staking";
        console.log("✅ Enhanced Prediction Staking deployed to:", predictionAddress);

        // ============ 2. ENHANCED PARLAY STAKING ============
        console.log("\n2️⃣ Deploying Enhanced Parlay Staking...");
        const ParlayStaking = await ethers.getContractFactory("ParlayStaking");
        const parlayStaking = await ParlayStaking.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS
        );
        await parlayStaking.waitForDeployment();
        const parlayAddress = await parlayStaking.getAddress();
        deployedContracts.newContracts.EnhancedParlayStaking = parlayAddress;
        deployedContracts.contractNames[parlayAddress] = "Enhanced Parlay Staking";
        console.log("✅ Enhanced Parlay Staking deployed to:", parlayAddress);

        // ============ 3. ENHANCED MULTI-TOKEN VAULT ============
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
        deployedContracts.contractNames[vaultAddress] = "Enhanced Multi-Token Vault";
        console.log("✅ Enhanced Multi-Token Vault deployed to:", vaultAddress);

        // ============ 4. PREDICTION INSURANCE SYSTEM ============
        console.log("\n4️⃣ Deploying Prediction Insurance System...");
        const PredictionInsurance = await ethers.getContractFactory("PredictionInsurance");
        const predictionInsurance = await PredictionInsurance.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS
        );
        await predictionInsurance.waitForDeployment();
        const insuranceAddress = await predictionInsurance.getAddress();
        deployedContracts.newContracts.PredictionInsuranceSystem = insuranceAddress;
        deployedContracts.contractNames[insuranceAddress] = "Prediction Insurance System";
        console.log("✅ Prediction Insurance System deployed to:", insuranceAddress);

        // ============ 5. REFERRAL REWARD SYSTEM ============
        console.log("\n5️⃣ Deploying Referral Reward System...");
        const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
        const referralSystem = await ReferralSystem.deploy(
            NTIQ_TOKEN_ADDRESS,
            TREASURY_ADDRESS
        );
        await referralSystem.waitForDeployment();
        const referralAddress = await referralSystem.getAddress();
        deployedContracts.newContracts.ReferralRewardSystem = referralAddress;
        deployedContracts.contractNames[referralAddress] = "Referral Reward System";
        console.log("✅ Referral Reward System deployed to:", referralAddress);

        // ============ 6. NFT ACHIEVEMENT SYSTEM ============
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
        deployedContracts.contractNames[achievementAddress] = "NFT Achievement System";
        console.log("✅ NFT Achievement System deployed to:", achievementAddress);

        // ============ SAVE DEPLOYMENT DATA ============
        const fileName = `polygon-amoy-deployment-${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(deployedContracts, null, 2));

        // ============ DEPLOYMENT SUMMARY ============
        console.log("\n🎉 POLYGON AMOY DEPLOYMENT COMPLETE!");
        console.log("=====================================");
        console.log("📋 Contract Names & Addresses:");
        console.log("1. Enhanced Prediction Staking:", predictionAddress);
        console.log("2. Enhanced Parlay Staking:", parlayAddress);
        console.log("3. Enhanced Multi-Token Vault:", vaultAddress);
        console.log("4. Prediction Insurance System:", insuranceAddress);
        console.log("5. Referral Reward System:", referralAddress);
        console.log("6. NFT Achievement System:", achievementAddress);

        // ============ BLOCK EXPLORER LINKS ============
        console.log("\n🔗 Block Explorer Links:");
        console.log("Enhanced Prediction Staking: https://amoy.polygonscan.com/address/" + predictionAddress);
        console.log("Enhanced Parlay Staking: https://amoy.polygonscan.com/address/" + parlayAddress);
        console.log("Enhanced Multi-Token Vault: https://amoy.polygonscan.com/address/" + vaultAddress);
        console.log("Prediction Insurance: https://amoy.polygonscan.com/address/" + insuranceAddress);
        console.log("Referral System: https://amoy.polygonscan.com/address/" + referralAddress);
        console.log("Achievement System: https://amoy.polygonscan.com/address/" + achievementAddress);

        console.log("\n💾 Deployment data saved to:", fileName);

        // ============ VERIFICATION COMMANDS ============
        console.log("\n🔍 Verification Commands:");
        console.log(`npx hardhat verify --network amoy ${predictionAddress} "${NTIQ_TOKEN_ADDRESS}" "${TREASURY_ADDRESS}" "${deployer.address}"`);
        console.log(`npx hardhat verify --network amoy ${parlayAddress} "${NTIQ_TOKEN_ADDRESS}" "${TREASURY_ADDRESS}"`);
        console.log(`npx hardhat verify --network amoy ${vaultAddress} "${deployer.address}" "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39" "${NTIQ_TOKEN_ADDRESS}"`);
        console.log(`npx hardhat verify --network amoy ${insuranceAddress} "${NTIQ_TOKEN_ADDRESS}" "${TREASURY_ADDRESS}"`);
        console.log(`npx hardhat verify --network amoy ${referralAddress} "${NTIQ_TOKEN_ADDRESS}" "${TREASURY_ADDRESS}"`);
        console.log(`npx hardhat verify --network amoy ${achievementAddress} "NectiqAchievements" "NECTIQ" "https://api.nectiq.com/nft-metadata/"`);

        console.log("\n🎯 Next Steps:");
        console.log("1. ✅ Contracts deployed to Polygon Amoy");
        console.log("2. 🔍 Verify contracts on Polygonscan");
        console.log("3. 🧪 Test all contract functions");
        console.log("4. 🔗 Update backend with new addresses");
        console.log("5. 🎯 Update frontend integration");

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
