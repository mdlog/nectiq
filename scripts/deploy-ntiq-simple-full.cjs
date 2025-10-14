const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const network = "amoy"; // Polygon Amoy testnet
    console.log(`\n🚀 Deploying NTIQ Token Simple to Polygon Amoy Testnet...`);

    const [deployer] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    if (balance < ethers.parseEther("0.01")) {
        console.log("❌ WARNING: Low balance! You need at least 0.01 MATIC for deployment");
        console.log("Get testnet MATIC from Polygon Amoy Faucet:");
        console.log("https://faucet.polygon.technology/");
        console.log("https://mumbaifaucet.com/");
        return;
    }

    console.log("\n📋 NTIQ TOKEN SIMPLE DEPLOYMENT PLAN:");
    console.log("1. Deploy NTIQTokenSimple Contract");
    console.log("2. Initialize token distribution");
    console.log("3. Setup initial allocations");
    console.log("4. Verify deployment");
    console.log("5. Save deployment info");
    console.log("\nStarting deployment...\n");

    // Deploy NTIQ Token Simple
    console.log("1️⃣ Deploying NTIQTokenSimple...");
    const NTIQTokenSimple = await ethers.getContractFactory("NTIQTokenSimple");

    console.log("   📝 Contract bytecode size:", NTIQTokenSimple.bytecode.length / 2, "bytes");
    console.log("   ⏳ Deploying contract...");

    // Set treasury and operations wallet addresses
    const treasuryAddress = deployer.address; // Use deployer as treasury for now
    const opsWalletAddress = deployer.address; // Use deployer as operations wallet for now

    console.log(`   DAO Treasury: ${treasuryAddress}`);
    console.log(`   Operations Wallet: ${opsWalletAddress}`);

    const ntiqToken = await NTIQTokenSimple.deploy(treasuryAddress, opsWalletAddress);
    console.log("   ⏳ Waiting for deployment confirmation...");
    await ntiqToken.waitForDeployment();

    console.log("✅ NTIQTokenSimple deployed to:", await ntiqToken.getAddress());

    // Get token info
    console.log("\n2️⃣ Getting token information...");
    const name = await ntiqToken.name();
    const symbol = await ntiqToken.symbol();
    const decimals = await ntiqToken.decimals();
    const totalSupply = await ntiqToken.totalSupply();

    console.log("📊 Token Information:");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);

    // Check initial allocations
    console.log("\n3️⃣ Checking initial allocations...");
    const deployerBalance = await ntiqToken.balanceOf(deployer.address);
    console.log(`   Deployer Balance: ${ethers.formatEther(deployerBalance)} ${symbol}`);

    // Get distribution constants
    console.log("\n4️⃣ Token Distribution Summary:");
    const immediateAirdrop = await ntiqToken.IMMEDIATE_AIRDROP();
    const vestedAirdrop = await ntiqToken.VESTED_AIRDROP();
    const liquidityMining = await ntiqToken.LIQUIDITY_MINING();
    const daoTreasury = await ntiqToken.DAO_TREASURY();
    const communityGrants = await ntiqToken.COMMUNITY_GRANTS();
    const gameRewards = await ntiqToken.GAME_REWARDS();
    const teamAllocation = await ntiqToken.TEAM_ALLOCATION();
    const buildathons = await ntiqToken.BUILDATHONS();
    const investorAllocation = await ntiqToken.INVESTOR_ALLOCATION();

    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`   Immediate Airdrop: ${ethers.formatEther(immediateAirdrop)} ${symbol} (5%)`);
    console.log(`   Vested Airdrop: ${ethers.formatEther(vestedAirdrop)} ${symbol} (10%)`);
    console.log(`   Liquidity Mining: ${ethers.formatEther(liquidityMining)} ${symbol} (10%)`);
    console.log(`   DAO Treasury: ${ethers.formatEther(daoTreasury)} ${symbol} (10%)`);
    console.log(`   Community Grants: ${ethers.formatEther(communityGrants)} ${symbol} (5%)`);
    console.log(`   Game Rewards: ${ethers.formatEther(gameRewards)} ${symbol} (30%)`);
    console.log(`   Team Allocation: ${ethers.formatEther(teamAllocation)} ${symbol} (20%)`);
    console.log(`   Buildathons: ${ethers.formatEther(buildathons)} ${symbol} (5%)`);
    console.log(`   Investor Allocation: ${ethers.formatEther(investorAllocation)} ${symbol} (5%)`);

    // Test basic functionality
    console.log("\n5️⃣ Testing basic functionality...");

    // Test transfer (if deployer has balance)
    if (deployerBalance > 0n) {
        console.log("   Testing transfer functionality...");
        try {
            const transferAmount = ethers.parseEther("100");
            if (deployerBalance >= transferAmount) {
                console.log("   ✓ Transfer function available");

                // Create a test recipient (using a valid address)
                const testRecipient = "0x742d35Cc6634C0532925a3b8D5B8E0e7B8C8F8F8";
                console.log(`   📤 Transferring ${ethers.formatEther(transferAmount)} ${symbol} to test recipient...`);

                try {
                    const transferTx = await ntiqToken.transfer(testRecipient, transferAmount);
                    await transferTx.wait();

                    const newBalance = await ntiqToken.balanceOf(deployer.address);
                    const recipientBalance = await ntiqToken.balanceOf(testRecipient);

                    console.log(`   ✅ Transfer successful!`);
                    console.log(`   Deployer new balance: ${ethers.formatEther(newBalance)} ${symbol}`);
                    console.log(`   Recipient balance: ${ethers.formatEther(recipientBalance)} ${symbol}`);
                } catch (transferError) {
                    console.log("   ⚠️ Transfer failed (likely address checksum issue):", transferError.message);
                }
            }
        } catch (error) {
            console.log("   ⚠️ Transfer test failed:", error.message);
        }
    }

    // Test burn functionality
    console.log("   Testing burn functionality...");
    try {
        const burnAmount = ethers.parseEther("10");
        const currentBalance = await ntiqToken.balanceOf(deployer.address);

        if (currentBalance >= burnAmount) {
            console.log(`   🔥 Burning ${ethers.formatEther(burnAmount)} ${symbol}...`);

            const burnTx = await ntiqToken.burn(burnAmount);
            await burnTx.wait();

            const newBalance = await ntiqToken.balanceOf(deployer.address);
            const newTotalSupply = await ntiqToken.totalSupply();

            console.log("   ✅ Burn successful!");
            console.log(`   New balance: ${ethers.formatEther(newBalance)} ${symbol}`);
            console.log(`   New total supply: ${ethers.formatEther(newTotalSupply)} ${symbol}`);
        } else {
            console.log("   ⚠️ Insufficient balance for burn test");
        }
    } catch (error) {
        console.log("   ⚠️ Burn test failed:", error.message);
    }

    // Test pause functionality
    console.log("   Testing pause functionality...");
    try {
        const isPaused = await ntiqToken.paused();
        console.log(`   ✓ Pause function available (Currently paused: ${isPaused})`);

        if (!isPaused) {
            console.log("   ⏸️ Testing pause...");
            const pauseTx = await ntiqToken.pause();
            await pauseTx.wait();

            const pausedState = await ntiqToken.paused();
            console.log(`   ✅ Token paused successfully! Paused: ${pausedState}`);

            console.log("   ▶️ Testing unpause...");
            const unpauseTx = await ntiqToken.unpause();
            await unpauseTx.wait();

            const finalPausedState = await ntiqToken.paused();
            console.log(`   ✅ Token unpaused successfully! Paused: ${finalPausedState}`);
        }
    } catch (error) {
        console.log("   ⚠️ Pause test failed:", error.message);
    }

    // Get deployment info
    const deploymentInfo = {
        network: "polygonAmoy",
        chainId: 80002,
        deployer: deployer.address,
        contracts: {
            NTIQTokenSimple: await ntiqToken.getAddress()
        },
        tokenInfo: {
            name: name,
            symbol: symbol,
            decimals: decimals.toString(),
            totalSupply: totalSupply.toString(),
            deployerBalance: deployerBalance.toString()
        },
        distribution: {
            immediateAirdrop: immediateAirdrop.toString(),
            vestedAirdrop: vestedAirdrop.toString(),
            liquidityMining: liquidityMining.toString(),
            daoTreasury: daoTreasury.toString(),
            communityGrants: communityGrants.toString(),
            gameRewards: gameRewards.toString(),
            teamAllocation: teamAllocation.toString(),
            buildathons: buildathons.toString(),
            investorAllocation: investorAllocation.toString()
        },
        blockExplorerUrls: {
            polygonAmoy: `https://amoy.polygonscan.com`
        },
        deploymentTime: new Date().toISOString()
    };

    // Save deployment info to file
    const fileName = `ntiq-simple-deployment-polygon-amoy-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 NTIQ TOKEN SIMPLE DEPLOYMENT TO POLYGON AMOY SUCCESSFUL!`);
    console.log("=".repeat(80));

    console.log("\n📋 CONTRACT ADDRESS:");
    console.log(`NTIQTokenSimple: ${await ntiqToken.getAddress()}`);

    console.log("\n🔗 BLOCK EXPLORER LINKS:");
    console.log(`NTIQTokenSimple: https://amoy.polygonscan.com/address/${await ntiqToken.getAddress()}`);

    console.log("\n💡 NEXT STEPS:");
    console.log("1. Verify contract on Polygonscan (optional)");
    console.log("2. Update frontend with contract address");
    console.log("3. Setup token distribution mechanisms");
    console.log("4. Configure tokenomics parameters");
    console.log("5. Test token functionality");
    console.log("6. Deploy to Polygon Mainnet when ready");

    console.log("\n📄 TESTING COMMANDS:");
    console.log(`npx hardhat run scripts/test-ntiq-interaction.cjs --network amoy`);

    console.log("\n🔍 VERIFICATION COMMAND:");
    console.log(`npx hardhat verify --network amoy ${await ntiqToken.getAddress()} "${treasuryAddress}" "${opsWalletAddress}"`);

    console.log("\n💾 Deployment info saved to:", fileName);
    console.log("=".repeat(80));

    // Update environment file with contract address
    console.log("\n📝 Updating environment configuration...");
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const updatedEnvContent = envContent.replace(
            /NTIQ_TOKEN_SIMPLE_ADDRESS=.*/,
            `NTIQ_TOKEN_SIMPLE_ADDRESS=${await ntiqToken.getAddress()}`
        );

        if (!envContent.includes('NTIQ_TOKEN_SIMPLE_ADDRESS')) {
            fs.appendFileSync('.env', `\nNTIQ_TOKEN_SIMPLE_ADDRESS=${await ntiqToken.getAddress()}\n`);
            console.log("✅ Added NTIQ_TOKEN_SIMPLE_ADDRESS to .env file");
        } else {
            fs.writeFileSync('.env', updatedEnvContent);
            console.log("✅ Updated NTIQ_TOKEN_SIMPLE_ADDRESS in .env file");
        }
    } catch (error) {
        console.log("⚠️ Could not update .env file:", error.message);
    }

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ NTIQ TOKEN SIMPLE DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
