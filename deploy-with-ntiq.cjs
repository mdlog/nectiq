// Deployment Script with NTIQ Token
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Starting Complete Contract Deployment...");
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");
    
    try {
        // ============ PHASE 1: DEPLOY NTIQ TOKEN FIRST ============
        console.log("\n🏗️  PHASE 1: Deploying NTIQ Token...");
        const NTIQToken = await ethers.getContractFactory("NTIQToken");
        const ntiqToken = await NTIQToken.deploy();
        await ntiqToken.waitForDeployment();
        const ntiqTokenAddress = await ntiqToken.getAddress();
        console.log("✅ NTIQ Token deployed to:", ntiqTokenAddress);
        
        // ============ PHASE 2: DEPLOY ENHANCED STAKING CONTRACTS ============
        console.log("\n🏗️  PHASE 2: Deploying Enhanced Staking Contracts...");
        
        console.log("\n1️⃣ Deploying Enhanced Prediction Staking...");
        const PredictionStaking = await ethers.getContractFactory("PredictionStaking");
        const predictionStaking = await PredictionStaking.deploy(
            ntiqTokenAddress, // NTIQ Token
            deployer.address, // Treasury
            deployer.address  // Oracle
        );
        await predictionStaking.waitForDeployment();
        const predictionAddress = await predictionStaking.getAddress();
        console.log("✅ Enhanced Prediction Staking deployed to:", predictionAddress);
        
        console.log("\n2️⃣ Deploying Enhanced Parlay Staking...");
        const ParlayStaking = await ethers.getContractFactory("ParlayStaking");
        const parlayStaking = await ParlayStaking.deploy(
            ntiqTokenAddress, // NTIQ Token
            deployer.address  // Treasury
        );
        await parlayStaking.waitForDeployment();
        const parlayAddress = await parlayStaking.getAddress();
        console.log("✅ Enhanced Parlay Staking deployed to:", parlayAddress);
        
        // ============ PHASE 3: DEPLOY NEW FEATURE CONTRACTS ============
        console.log("\n🏗️  PHASE 3: Deploying New Feature Contracts...");
        
        console.log("\n3️⃣ Deploying Prediction Insurance System...");
        const PredictionInsurance = await ethers.getContractFactory("PredictionInsurance");
        const predictionInsurance = await PredictionInsurance.deploy(
            ntiqTokenAddress, // NTIQ Token
            deployer.address  // Treasury
        );
        await predictionInsurance.waitForDeployment();
        const insuranceAddress = await predictionInsurance.getAddress();
        console.log("✅ Prediction Insurance deployed to:", insuranceAddress);
        
        console.log("\n4️⃣ Deploying Referral Reward System...");
        const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
        const referralSystem = await ReferralSystem.deploy(
            ntiqTokenAddress, // NTIQ Token
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
        
        // ============ PHASE 4: DEPLOY MULTI-TOKEN VAULT ============
        console.log("\n🏗️  PHASE 4: Deploying Multi-Token Vault...");
        const MultiTokenVault = await ethers.getContractFactory("MultiTokenVault");
        const multiTokenVault = await MultiTokenVault.deploy(
            deployer.address, // Backend signer
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
            "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", // LINK
            ntiqTokenAddress  // NTIQ Token (real address)
        );
        await multiTokenVault.waitForDeployment();
        const vaultAddress = await multiTokenVault.getAddress();
        console.log("✅ Multi-Token Vault deployed to:", vaultAddress);
        
        // ============ SAVE DEPLOYMENT DATA ============
        const deployedContracts = {
            network: "hardhat",
            chainId: 1337,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: {
                // Core Infrastructure
                NTIQToken: ntiqTokenAddress,
                MultiTokenVault: vaultAddress,
                
                // Enhanced Staking
                EnhancedPredictionStaking: predictionAddress,
                EnhancedParlayStaking: parlayAddress,
                
                // New Features
                PredictionInsuranceSystem: insuranceAddress,
                ReferralRewardSystem: referralAddress,
                NFTAchievementSystem: achievementAddress
            },
            contractNames: {
                // Blockchain Display Names
                [ntiqTokenAddress]: "Nectiq Token (NTIQ)",
                [vaultAddress]: "Multi-Token Vault",
                [predictionAddress]: "Enhanced Prediction Staking",
                [parlayAddress]: "Enhanced Parlay Staking", 
                [insuranceAddress]: "Prediction Insurance System",
                [referralAddress]: "Referral Reward System",
                [achievementAddress]: "NFT Achievement System"
            }
        };
        
        fs.writeFileSync('./deployed-contracts.json', JSON.stringify(deployedContracts, null, 2));
        
        // ============ DEPLOYMENT SUMMARY ============
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("=====================================");
        console.log("📋 Contract Names & Addresses:");
        console.log("1. Nectiq Token (NTIQ):", ntiqTokenAddress);
        console.log("2. Multi-Token Vault:", vaultAddress);
        console.log("3. Enhanced Prediction Staking:", predictionAddress);
        console.log("4. Enhanced Parlay Staking:", parlayAddress);
        console.log("5. Prediction Insurance System:", insuranceAddress);
        console.log("6. Referral Reward System:", referralAddress);
        console.log("7. NFT Achievement System:", achievementAddress);
        
        console.log("\n💾 Deployment data saved to: deployed-contracts.json");
        console.log("\n🔍 Next Steps:");
        console.log("1. ✅ Local deployment successful");
        console.log("2. 🚀 Deploy to Polygon Amoy testnet");
        console.log("3. 🔍 Verify contracts on Polygonscan");
        console.log("4. 🔗 Update backend integration");
        console.log("5. 🎯 Test all contract functions");
        
        // ============ TESTING SUGGESTIONS ============
        console.log("\n🧪 Testing Suggestions:");
        console.log("- Test NTIQ token minting and transfers");
        console.log("- Test vault deposits/withdrawals");
        console.log("- Test prediction staking with different durations");
        console.log("- Test parlay staking with compound rewards");
        console.log("- Test insurance purchase and claims");
        console.log("- Test referral registration and rewards");
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
