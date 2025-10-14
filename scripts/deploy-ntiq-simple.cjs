const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const network = "amoy"; // Polygon Amoy testnet
    console.log(`\n🚀 Deploying Simple NTIQ Token to Polygon Amoy Testnet...`);

    const [deployer] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    if (balance < ethers.parseEther("0.01")) {
        console.log("❌ WARNING: Low balance! You need at least 0.01 MATIC for deployment");
        return;
    }

    console.log("\n📋 SIMPLE NTIQ TOKEN DEPLOYMENT PLAN:");
    console.log("1. Deploy SimpleNTIQ Contract (from SimpleContracts.sol)");
    console.log("2. Get token information");
    console.log("3. Test basic functionality");
    console.log("4. Save deployment info");
    console.log("\nStarting deployment...\n");

    // Deploy Simple NTIQ Token
    console.log("1️⃣ Deploying SimpleNTIQ...");
    const SimpleNTIQ = await ethers.getContractFactory("SimpleNTIQ");

    console.log("   📝 Contract bytecode size:", SimpleNTIQ.bytecode.length / 2, "bytes");
    console.log("   ⏳ Deploying contract...");

    const simpleNTIQ = await SimpleNTIQ.deploy();
    console.log("   ⏳ Waiting for deployment confirmation...");
    await simpleNTIQ.waitForDeployment();

    console.log("✅ SimpleNTIQ deployed to:", await simpleNTIQ.getAddress());

    // Get token info
    console.log("\n2️⃣ Getting token information...");
    const name = await simpleNTIQ.name();
    const symbol = await simpleNTIQ.symbol();
    const decimals = await simpleNTIQ.decimals();
    const totalSupply = await simpleNTIQ.totalSupply();
    const deployerBalance = await simpleNTIQ.balanceOf(deployer.address);

    console.log("📊 Token Information:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`   Deployer Balance: ${ethers.formatEther(deployerBalance)} ${symbol}`);

    // Test basic functionality
    console.log("\n3️⃣ Testing basic functionality...");

    // Test transfer (if deployer has balance)
    if (deployerBalance > 0n) {
        console.log("   Testing transfer functionality...");
        try {
            const transferAmount = ethers.parseEther("100");
            if (deployerBalance >= transferAmount) {
                console.log("   ✓ Transfer function available");

                // Create a test recipient (using a random address)
                const testRecipient = "0x742d35Cc6634C0532925a3b8D5B8E0e7B8C8F8F8";
                console.log(`   📤 Transferring ${ethers.formatEther(transferAmount)} ${symbol} to test recipient...`);

                const transferTx = await simpleNTIQ.transfer(testRecipient, transferAmount);
                await transferTx.wait();

                const newBalance = await simpleNTIQ.balanceOf(deployer.address);
                const recipientBalance = await simpleNTIQ.balanceOf(testRecipient);

                console.log(`   ✅ Transfer successful!`);
                console.log(`   Deployer new balance: ${ethers.formatEther(newBalance)} ${symbol}`);
                console.log(`   Recipient balance: ${ethers.formatEther(recipientBalance)} ${symbol}`);
            }
        } catch (error) {
            console.log("   ⚠️ Transfer test failed:", error.message);
        }
    }

    // Test burn functionality
    console.log("   Testing burn functionality...");
    try {
        const burnAmount = ethers.parseEther("10");
        const currentBalance = await simpleNTIQ.balanceOf(deployer.address);

        if (currentBalance >= burnAmount) {
            console.log(`   🔥 Burning ${ethers.formatEther(burnAmount)} ${symbol}...`);

            const burnTx = await simpleNTIQ.burn(burnAmount);
            await burnTx.wait();

            const newBalance = await simpleNTIQ.balanceOf(deployer.address);
            const newTotalSupply = await simpleNTIQ.totalSupply();

            console.log("   ✅ Burn successful!");
            console.log(`   New balance: ${ethers.formatEther(newBalance)} ${symbol}`);
            console.log(`   New total supply: ${ethers.formatEther(newTotalSupply)} ${symbol}`);
        } else {
            console.log("   ⚠️ Insufficient balance for burn test");
        }
    } catch (error) {
        console.log("   ⚠️ Burn test failed:", error.message);
    }

    // Get deployment info
    const deploymentInfo = {
        network: "polygonAmoy",
        chainId: 80002,
        deployer: deployer.address,
        contracts: {
            SimpleNTIQ: await simpleNTIQ.getAddress()
        },
        tokenInfo: {
            name: name,
            symbol: symbol,
            decimals: decimals.toString(),
            totalSupply: totalSupply.toString(),
            deployerBalance: deployerBalance.toString()
        },
        blockExplorerUrls: {
            polygonAmoy: `https://amoy.polygonscan.com`
        },
        deploymentTime: new Date().toISOString()
    };

    // Save deployment info to file
    const fileName = `simple-ntiq-deployment-polygon-amoy-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 SIMPLE NTIQ TOKEN DEPLOYMENT TO POLYGON AMOY SUCCESSFUL!`);
    console.log("=".repeat(80));

    console.log("\n📋 CONTRACT ADDRESS:");
    console.log(`SimpleNTIQ: ${await simpleNTIQ.getAddress()}`);

    console.log("\n🔗 BLOCK EXPLORER LINKS:");
    console.log(`SimpleNTIQ: https://amoy.polygonscan.com/address/${await simpleNTIQ.getAddress()}`);

    console.log("\n💡 NEXT STEPS:");
    console.log("1. Verify contract on Polygonscan (optional)");
    console.log("2. Update frontend with contract address");
    console.log("3. Test token functionality");
    console.log("4. Deploy full NTIQ Token when ready");

    console.log("\n📄 TESTING COMMANDS:");
    console.log(`npx hardhat console --network amoy`);
    console.log(`const SimpleNTIQ = await ethers.getContractAt("SimpleNTIQ", "${await simpleNTIQ.getAddress()}")`);

    console.log("\n💾 Deployment info saved to:", fileName);
    console.log("=".repeat(80));

    // Update environment file with contract address
    console.log("\n📝 Updating environment configuration...");
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const updatedEnvContent = envContent.replace(
            /SIMPLE_NTIQ_TOKEN_ADDRESS=.*/,
            `SIMPLE_NTIQ_TOKEN_ADDRESS=${await simpleNTIQ.getAddress()}`
        );

        if (!envContent.includes('SIMPLE_NTIQ_TOKEN_ADDRESS')) {
            fs.appendFileSync('.env', `\nSIMPLE_NTIQ_TOKEN_ADDRESS=${await simpleNTIQ.getAddress()}\n`);
            console.log("✅ Added SIMPLE_NTIQ_TOKEN_ADDRESS to .env file");
        } else {
            fs.writeFileSync('.env', updatedEnvContent);
            console.log("✅ Updated SIMPLE_NTIQ_TOKEN_ADDRESS in .env file");
        }
    } catch (error) {
        console.log("⚠️ Could not update .env file:", error.message);
    }

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ SIMPLE NTIQ TOKEN DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
