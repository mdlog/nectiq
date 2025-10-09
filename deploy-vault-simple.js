require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║  🚀 Deploying NectiqVault to Polygon Amoy Testnet    ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Get backend signer address from environment
    const BACKEND_SIGNER = process.env.BACKEND_SIGNER_ADDRESS;

    if (!BACKEND_SIGNER) {
        throw new Error("❌ BACKEND_SIGNER_ADDRESS not set in .env file!");
    }

    console.log("📋 Configuration:");
    console.log(`   Backend Signer: ${BACKEND_SIGNER}`);
    console.log(`   Network: ${hre.network.name}`);
    console.log(`   Chain ID: ${hre.network.config.chainId}\n`);

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("💰 Deployer Account:");
    console.log(`   Address: ${deployer.address}`);
    console.log(`   Balance: ${hre.ethers.formatEther(balance)} POL\n`);

    if (balance < hre.ethers.parseEther("0.1")) {
        console.log("⚠️  Warning: Low balance! You may need more POL for deployment.");
        console.log("   Get free POL from: https://faucet.polygon.technology/\n");
    }

    // Deploy contract
    console.log("🔨 Deploying NectiqVault contract...");
    const NectiqVault = await hre.ethers.getContractFactory("NectiqVault");
    const vault = await NectiqVault.deploy(BACKEND_SIGNER);

    await vault.waitForDeployment();

    const address = await vault.getAddress();
    console.log(`✅ NectiqVault deployed to: ${address}\n`);

    // Wait for block confirmations
    console.log("⏳ Waiting for 5 block confirmations...");
    const deployTx = vault.deploymentTransaction();
    if (deployTx) {
        await deployTx.wait(5);
        console.log("✅ Confirmed!\n");
    }

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        contractAddress: address,
        backendSigner: BACKEND_SIGNER,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        transactionHash: deployTx?.hash || ""
    };

    const deploymentPath = path.join(__dirname, 'deployment-vault.json');
    fs.writeFileSync(
        deploymentPath,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Deployment info saved to: deployment-vault.json\n");

    // Verify contract on Polygonscan
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("🔍 Verifying contract on Polygonscan...");
        try {
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: [BACKEND_SIGNER],
            });
            console.log("✅ Contract verified on Polygonscan!\n");
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log("✅ Contract already verified on Polygonscan!\n");
            } else {
                console.log("⚠️  Verification failed:", error.message);
                console.log("   You can manually verify later using:");
                console.log(`   npx hardhat verify --network ${hre.network.name} ${address} ${BACKEND_SIGNER}\n`);
            }
        }
    }

    // Display summary
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║             ✅ DEPLOYMENT SUCCESSFUL!                 ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log("📋 Contract Details:");
    console.log(`   Address: ${address}`);
    console.log(`   Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId})`);
    console.log(`   Backend Signer: ${BACKEND_SIGNER}`);
    console.log(`   Deployer: ${deployer.address}\n`);

    console.log("🔗 View on Polygonscan:");
    console.log(`   https://amoy.polygonscan.com/address/${address}\n`);

    console.log("📝 Next Steps:");
    console.log("   1. Add to .env:");
    console.log(`      VAULT_CONTRACT_ADDRESS="${address}"`);
    console.log(`      VITE_VAULT_CONTRACT_ADDRESS="${address}"`);
    console.log("   2. Restart your server");
    console.log("   3. Test deposit/withdrawal\n");

    console.log("🎉 Ready to use! Your vault is now live on Polygon Amoy!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });

