// Simple Deployment Script for Testing
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    console.log("🚀 Starting Simple Contract Deployment...");
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");
    
    if (balance < ethers.parseEther("0.1")) {
        console.log("⚠️  Warning: Low balance! Get testnet MATIC from faucet.");
    }
    
    try {
        // Deploy contracts one by one with descriptive names
        
        console.log("\n1️⃣ Deploying Enhanced Prediction Staking...");
        const PredictionStaking = await ethers.getContractFactory("PredictionStaking");
        const predictionStaking = await PredictionStaking.deploy(
            "0x0000000000000000000000000000000000000000", // NTIQ Token (placeholder)
            deployer.address, // Treasury
            deployer.address  // Oracle
        );
        await predictionStaking.waitForDeployment();
        const predictionAddress = await predictionStaking.getAddress();
        console.log("✅ Enhanced Prediction Staking deployed to:", predictionAddress);
        
        console.log("\n2️⃣ Deploying Enhanced Parlay Staking...");
        const ParlayStaking = await ethers.getContractFactory("ParlayStaking");
        const parlayStaking = await ParlayStaking.deploy(
            "0x0000000000000000000000000000000000000000", // NTIQ Token (placeholder)
            deployer.address  // Treasury
        );
        await parlayStaking.waitForDeployment();
        const parlayAddress = await parlayStaking.getAddress();
        console.log("✅ Enhanced Parlay Staking deployed to:", parlayAddress);
        
        console.log("\n3️⃣ Deploying Prediction Insurance System...");
        const PredictionInsurance = await ethers.getContractFactory("PredictionInsurance");
        const predictionInsurance = await PredictionInsurance.deploy(
            "0x0000000000000000000000000000000000000000", // NTIQ Token (placeholder)
            deployer.address  // Treasury
        );
        await predictionInsurance.waitForDeployment();
        const insuranceAddress = await predictionInsurance.getAddress();
        console.log("✅ Prediction Insurance deployed to:", insuranceAddress);
        
        console.log("\n4️⃣ Deploying Referral Reward System...");
        const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
        const referralSystem = await ReferralSystem.deploy(
            "0x0000000000000000000000000000000000000000", // NTIQ Token (placeholder)
            deployer.address  // Treasury
        );
        await referralSystem.waitForDeployment();
        const referralAddress = await referralSystem.getAddress();
        console.log("✅ Referral System deployed to:", referralAddress);
        
        console.log("\n5️⃣ Deploying NFT Achievement System...");
        const AchievementSystem = await ethers.getContractFactory("AchievementSystem");
        const achievementSystem = await AchievementSystem.deploy(
            "NectiqAchievements",
            "NECTIQ", 
            "https://api.nectiq.com/nft-metadata/"
        );
        await achievementSystem.waitForDeployment();
        const achievementAddress = await achievementSystem.getAddress();
        console.log("✅ Achievement System deployed to:", achievementAddress);
        
        console.log("\n6️⃣ Deploying Multi-Token Vault...");
        const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
        const multiTokenVault = await MultiTokenVault.deploy(
            deployer.address, // Backend signer
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
            "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", // LINK
            "0x0000000000000000000000000000000000000000"  // NTIQ (placeholder)
        );
        await multiTokenVault.waitForDeployment();
        const vaultAddress = await multiTokenVault.getAddress();
        console.log("✅ Multi-Token Vault deployed to:", vaultAddress);
        
        // Save addresses
        const deployedContracts = {
            network: "hardhat",
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: {
                EnhancedPredictionStaking: predictionAddress,
                EnhancedParlayStaking: parlayAddress,
                PredictionInsuranceSystem: insuranceAddress,
                ReferralRewardSystem: referralAddress,
                NFTAchievementSystem: achievementAddress,
                MultiTokenVault: vaultAddress
            }
        };
        
        fs.writeFileSync('./deployed-contracts.json', JSON.stringify(deployedContracts, null, 2));
        
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("=====================================");
        console.log("📋 Contract Names & Addresses:");
        console.log("1. Enhanced Prediction Staking:", predictionAddress);
        console.log("2. Enhanced Parlay Staking:", parlayAddress);
        console.log("3. Prediction Insurance System:", insuranceAddress);
        console.log("4. Referral Reward System:", referralAddress);
        console.log("5. NFT Achievement System:", achievementAddress);
        console.log("6. Multi-Token Vault:", vaultAddress);
        
        console.log("\n💾 Addresses saved to: deployed-contracts.json");
        console.log("\n🔍 Next Steps:");
        console.log("1. Test contracts on local network");
        console.log("2. Deploy to Polygon Amoy testnet");
        console.log("3. Verify on Polygonscan");
        console.log("4. Update backend integration");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
