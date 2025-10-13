const { run } = require("hardhat");

async function main() {
    const network = "amoy"; // Polygon Amoy testnet

    console.log(`\n🔍 Verifying NTIQ Token Contract on Polygonscan...`);

    // Try to load deployment info
    let deploymentInfo;
    try {
        const files = require('fs').readdirSync('.').filter(f => f.startsWith('ntiq-deployment-polygon-amoy-') && f.endsWith('.json'));
        if (files.length > 0) {
            const latestFile = files.sort().pop();
            deploymentInfo = JSON.parse(require('fs').readFileSync(latestFile, 'utf8'));
            console.log(`📄 Loaded deployment info from: ${latestFile}`);
        }
    } catch (error) {
        console.log("⚠️ Could not load deployment info");
    }

    let contractAddress;
    if (deploymentInfo && deploymentInfo.contracts.NTIQToken) {
        contractAddress = deploymentInfo.contracts.NTIQToken;
    } else {
        console.log("❌ No contract address found. Please provide the contract address:");
        console.log("Usage: npx hardhat run scripts/verify-ntiq-contract.cjs --network amoy --contract <address>");
        return;
    }

    console.log(`\n🔗 Verifying contract at: ${contractAddress}`);

    try {
        console.log("⏳ Starting verification process...");

        await run("verify:verify", {
            address: contractAddress,
            network: network,
            constructorArguments: [], // NTIQToken has no constructor arguments
        });

        console.log("✅ Contract verified successfully!");
        console.log(`🔗 View on Polygonscan: https://amoy.polygonscan.com/address/${contractAddress}`);

    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified!");
            console.log(`🔗 View on Polygonscan: https://amoy.polygonscan.com/address/${contractAddress}`);
        } else {
            console.log("❌ Verification failed:", error.message);
            console.log("\n💡 Manual verification steps:");
            console.log("1. Go to https://amoy.polygonscan.com/");
            console.log(`2. Search for contract: ${contractAddress}`);
            console.log("3. Click 'Contract' tab");
            console.log("4. Click 'Verify and Publish'");
            console.log("5. Select 'Solidity (Single file)'");
            console.log("6. Enter contract name: NTIQToken");
            console.log("7. Select compiler version: 0.8.20");
            console.log("8. Select optimization: Yes, 200 runs");
            console.log("9. Paste the contract source code");
            console.log("10. Click 'Verify and Publish'");
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 NTIQ TOKEN VERIFICATION COMPLETED!`);
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ VERIFICATION FAILED:");
        console.error(error);
        process.exit(1);
    });
