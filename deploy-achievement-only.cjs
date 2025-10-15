// Deploy NFT Achievement System only
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying NFT Achievement System to Polygon Amoy");
    console.log("==================================================");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    if (balance < ethers.parseEther("0.05")) {
        console.log("⚠️  Warning: Low balance! You need at least 0.05 MATIC for deployment.");
        console.log("Get testnet MATIC from: https://faucet.polygon.technology/");
        return;
    }

    try {
        console.log("\n🎨 Deploying NFT Achievement System...");
        const AchievementSystem = await ethers.getContractFactory("AchievementSystem");
        const achievementSystem = await AchievementSystem.deploy(
            "NectiqAchievements",
            "NECTIQ",
            "https://api.nectiq.com/nft-metadata/"
        );
        await achievementSystem.waitForDeployment();
        const achievementAddress = await achievementSystem.getAddress();

        console.log("✅ NFT Achievement System deployed to:", achievementAddress);
        console.log("🔗 Block Explorer: https://amoy.polygonscan.com/address/" + achievementAddress);

        // Save deployment data
        const deploymentData = {
            network: "polygonAmoy",
            chainId: 80002,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contract: {
                NFTAchievementSystem: achievementAddress
            }
        };

        const fileName = `achievement-deployment-${Date.now()}.json`;
        fs.writeFileSync(fileName, JSON.stringify(deploymentData, null, 2));

        console.log("\n💾 Deployment data saved to:", fileName);
        console.log("\n🔍 Verification command:");
        console.log(`npx hardhat verify --network amoy ${achievementAddress} "NectiqAchievements" "NECTIQ" "https://api.nectiq.com/nft-metadata/"`);

        console.log("\n🎉 NFT Achievement System deployment complete!");
        console.log("All 6 enhanced contracts are now deployed to Polygon Amoy!");

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check you have sufficient MATIC balance");
        console.log("2. Get more testnet MATIC from: https://faucet.polygon.technology/");
        console.log("3. Check network connectivity");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
