const hre = require("hardhat");

async function main() {
    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    console.log("║   🚀 DEPLOYING MULTI-TOKEN VAULT TO POLYGON AMOY TESTNET     ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);

    console.log("📋 Deployment Information:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Deployer Address: ${deployer.address}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} POL`);
    console.log(`Network: Polygon Amoy Testnet (Chain ID: 80002)`);
    console.log(`RPC: https://rpc-amoy.polygon.technology`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check if deployer has enough balance
    if (balance < hre.ethers.parseEther("0.1")) {
        console.log("❌ ERROR: Insufficient balance!");
        console.log(`   You need at least 0.1 POL for deployment`);
        console.log(`   Get testnet POL from: https://faucet.polygon.technology\n`);
        process.exit(1);
    }

    // Get backend signer address from environment
    const backendSignerAddress = process.env.BACKEND_SIGNER_ADDRESS;

    if (!backendSignerAddress) {
        console.log("❌ ERROR: BACKEND_SIGNER_ADDRESS not found in .env");
        console.log("   Please add BACKEND_SIGNER_ADDRESS to your .env file\n");
        process.exit(1);
    }

    // Token addresses on Polygon Amoy - ensure proper checksumming
    const WETH_ADDRESS = hre.ethers.getAddress("0x52eF3d68BaB452a294342DC3e5f464d7f610f72E");
    const USDC_ADDRESS = hre.ethers.getAddress("0x8B0180f2101c8260d49339abfEe87927412494B4");
    const LINK_ADDRESS = hre.ethers.getAddress("0x0fd9e8d3af1aaee056eb9e902c3a762a667b1904");

    console.log("📝 Token Addresses (Polygon Amoy):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`WETH: ${WETH_ADDRESS}`);
    console.log(`USDC: ${USDC_ADDRESS}`);
    console.log(`LINK: ${LINK_ADDRESS}`);
    console.log(`Backend Signer: ${backendSignerAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("⏳ Deploying MultiTokenVault contract...\n");

    // Deploy MultiTokenVault
    const MultiTokenVault = await hre.ethers.getContractFactory("MultiTokenVault");
    const vault = await MultiTokenVault.deploy(
        backendSignerAddress,
        WETH_ADDRESS,
        USDC_ADDRESS,
        LINK_ADDRESS
    );

    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();

    console.log("✅ MultiTokenVault deployed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Contract Address: ${vaultAddress}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Backend Signer: ${backendSignerAddress}`);
    console.log(`Explorer: https://amoy.polygonscan.com/address/${vaultAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📊 Supported Tokens:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. POL (native) - Minimum: 0.01 POL, Maximum: 1000 POL");
    console.log("2. WETH - Minimum: 0.001 WETH, Maximum: 10 WETH");
    console.log("3. USDC - Minimum: 1 USDC, Maximum: 10,000 USDC");
    console.log("4. LINK - Minimum: 0.1 LINK, Maximum: 1000 LINK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("⏳ Waiting for block confirmations...\n");

    // Wait for 5 confirmations
    await vault.deploymentTransaction().wait(5);

    console.log("✅ Block confirmations received!\n");

    // Verify contract on Polygonscan
    if (process.env.POLYGONSCAN_API_KEY) {
        console.log("⏳ Verifying contract on Polygonscan...\n");

        try {
            await hre.run("verify:verify", {
                address: vaultAddress,
                constructorArguments: [
                    backendSignerAddress,
                    WETH_ADDRESS,
                    USDC_ADDRESS,
                    LINK_ADDRESS
                ],
                contract: "contracts/MultiTokenVault.sol:MultiTokenVault"
            });

            console.log("✅ Contract verified on Polygonscan!");
            console.log(`   View at: https://amoy.polygonscan.com/address/${vaultAddress}#code\n`);
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log("✅ Contract already verified on Polygonscan!\n");
            } else {
                console.log("⚠️  Verification failed (you can verify manually later)");
                console.log(`   Error: ${error.message}\n`);
            }
        }
    } else {
        console.log("⚠️  POLYGONSCAN_API_KEY not found - skipping verification");
        console.log("   You can verify manually at: https://amoy.polygonscan.com\n");
    }

    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    console.log("║              📋 NEXT STEPS - UPDATE .ENV FILE                 ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    console.log("Add/Update these lines in your .env file:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`MULTI_TOKEN_VAULT_ADDRESS=${vaultAddress}`);
    console.log(`VITE_MULTI_TOKEN_VAULT_ADDRESS=${vaultAddress}`);
    console.log(`AMOY_WETH_ADDRESS=${WETH_ADDRESS}`);
    console.log(`AMOY_USDC_ADDRESS=${USDC_ADDRESS}`);
    console.log(`AMOY_LINK_ADDRESS=${LINK_ADDRESS}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 Deployment complete! Multi-token support is ready.\n");
    console.log("📖 Features:");
    console.log("   - ✅ Native POL deposits/withdrawals");
    console.log("   - ✅ WETH deposits/withdrawals");
    console.log("   - ✅ USDC deposits/withdrawals");
    console.log("   - ✅ LINK deposits/withdrawals");
    console.log("   - ✅ Secure backend-signed withdrawals");
    console.log("   - ✅ Pausable for emergency");
    console.log("   - ✅ Emergency admin withdrawals\n");

    console.log("🔗 Useful Links:");
    console.log(`   Contract: https://amoy.polygonscan.com/address/${vaultAddress}`);
    console.log(`   Network: https://amoy.polygonscan.com`);
    console.log(`   Faucet: https://faucet.polygon.technology\n`);

    console.log("💡 Test Tokens:");
    console.log("   Get test WETH: https://amoy.polygonscan.com/address/${WETH_ADDRESS}#writeContract");
    console.log("   Get test USDC: https://faucet.circle.com");
    console.log("   Get test LINK: https://faucets.chain.link/polygon-amoy\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });

