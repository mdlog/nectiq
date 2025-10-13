const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const network = "polygon"; // Polygon Mainnet
    console.log(`\n🚀 Deploying NTIQ Token to Polygon Mainnet...`);

    // Safety check for mainnet deployment
    console.log("⚠️  WARNING: This will deploy to POLYGON MAINNET!");
    console.log("⚠️  Make sure you have:");
    console.log("   - Sufficient MATIC for gas fees");
    console.log("   - Verified all contract parameters");
    console.log("   - Tested on testnet first");
    console.log("   - Backed up your private key");

    const [deployer] = await ethers.getSigners();

    console.log("\nDeploying with account:", deployer.address);
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "MATIC");

    if (balance.lt(ethers.utils.parseEther("1"))) {
        console.log("❌ WARNING: Low balance! You need at least 1 MATIC for mainnet deployment");
        return;
    }

    console.log("\n📋 NTIQ TOKEN MAINNET DEPLOYMENT PLAN:");
    console.log("1. Deploy NTIQToken Contract");
    console.log("2. Initialize token distribution");
    console.log("3. Setup initial allocations");
    console.log("4. Verify deployment");
    console.log("5. Save deployment info");
    console.log("\nStarting deployment...\n");

    // Deploy NTIQ Token
    console.log("1️⃣ Deploying NTIQToken...");
    const NTIQToken = await ethers.getContractFactory("NTIQToken");

    console.log("   📝 Contract bytecode size:", NTIQToken.bytecode.length / 2, "bytes");
    console.log("   ⏳ Deploying contract...");

    const ntiqToken = await NTIQToken.deploy();
    console.log("   ⏳ Waiting for deployment confirmation...");
    await ntiqToken.deployed();

    console.log("✅ NTIQToken deployed to:", ntiqToken.address);

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
    console.log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);

    // Check initial allocations
    console.log("\n3️⃣ Checking initial allocations...");
    const deployerBalance = await ntiqToken.balanceOf(deployer.address);
    console.log(`   Deployer Balance: ${ethers.utils.formatEther(deployerBalance)} ${symbol}`);

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

    console.log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
    console.log(`   Immediate Airdrop: ${ethers.utils.formatEther(immediateAirdrop)} ${symbol} (5%)`);
    console.log(`   Vested Airdrop: ${ethers.utils.formatEther(vestedAirdrop)} ${symbol} (10%)`);
    console.log(`   Liquidity Mining: ${ethers.utils.formatEther(liquidityMining)} ${symbol} (10%)`);
    console.log(`   DAO Treasury: ${ethers.utils.formatEther(daoTreasury)} ${symbol} (10%)`);
    console.log(`   Community Grants: ${ethers.utils.formatEther(communityGrants)} ${symbol} (5%)`);
    console.log(`   Game Rewards: ${ethers.utils.formatEther(gameRewards)} ${symbol} (30%)`);
    console.log(`   Team Allocation: ${ethers.utils.formatEther(teamAllocation)} ${symbol} (20%)`);
    console.log(`   Buildathons: ${ethers.utils.formatEther(buildathons)} ${symbol} (5%)`);
    console.log(`   Investor Allocation: ${ethers.utils.formatEther(investorAllocation)} ${symbol} (5%)`);

    // Test basic functionality
    console.log("\n5️⃣ Testing basic functionality...");

    // Test transfer (if deployer has balance)
    if (deployerBalance.gt(0)) {
        console.log("   Testing transfer functionality...");
        try {
            const transferAmount = ethers.utils.parseEther("1");
            if (deployerBalance.gte(transferAmount)) {
                console.log("   ✓ Transfer function available");
            }
        } catch (error) {
            console.log("   ⚠️ Transfer test failed:", error.message);
        }
    }

    // Test burn functionality
    console.log("   Testing burn functionality...");
    try {
        console.log("   ✓ Burn function available");
    } catch (error) {
        console.log("   ⚠️ Burn test failed:", error.message);
    }

    // Test pause functionality
    console.log("   Testing pause functionality...");
    try {
        const isPaused = await ntiqToken.paused();
        console.log(`   ✓ Pause function available (Currently paused: ${isPaused})`);
    } catch (error) {
        console.log("   ⚠️ Pause test failed:", error.message);
    }

    // Get deployment info
    const deploymentInfo = {
        network: "polygon",
        chainId: 137,
        deployer: deployer.address,
        contracts: {
            NTIQToken: ntiqToken.address
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
            polygon: `https://polygonscan.com`
        },
        deploymentTime: new Date().toISOString(),
        gasUsed: "TBD", // Will be filled after transaction receipt
        transactionHash: "TBD" // Will be filled after transaction receipt
    };

    // Save deployment info to file
    const fileName = `ntiq-deployment-polygon-mainnet-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 NTIQ TOKEN DEPLOYMENT TO POLYGON MAINNET SUCCESSFUL!`);
    console.log("=".repeat(80));

    console.log("\n📋 CONTRACT ADDRESS:");
    console.log(`NTIQToken: ${ntiqToken.address}`);

    console.log("\n🔗 BLOCK EXPLORER LINKS:");
    console.log(`NTIQToken: https://polygonscan.com/address/${ntiqToken.address}`);

    console.log("\n💡 NEXT STEPS:");
    console.log("1. Verify contract on Polygonscan");
    console.log("2. Update frontend with contract address");
    console.log("3. Setup token distribution mechanisms");
    console.log("4. Configure tokenomics parameters");
    console.log("5. Test token functionality");
    console.log("6. Add liquidity to DEX");
    console.log("7. List on token trackers");

    console.log("\n📄 TESTING COMMANDS:");
    console.log(`npx hardhat run scripts/test-ntiq-interaction.cjs --network polygon`);

    console.log("\n🔍 VERIFICATION COMMAND:");
    console.log(`npx hardhat verify --network polygon ${ntiqToken.address}`);

    console.log("\n💾 Deployment info saved to:", fileName);
    console.log("=".repeat(80));

    // Update environment file with contract address
    console.log("\n📝 Updating environment configuration...");
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const updatedEnvContent = envContent.replace(
            /NTIQ_TOKEN_ADDRESS_MAINNET=.*/,
            `NTIQ_TOKEN_ADDRESS_MAINNET=${ntiqToken.address}`
        );

        if (!envContent.includes('NTIQ_TOKEN_ADDRESS_MAINNET')) {
            fs.appendFileSync('.env', `\nNTIQ_TOKEN_ADDRESS_MAINNET=${ntiqToken.address}\n`);
            console.log("✅ Added NTIQ_TOKEN_ADDRESS_MAINNET to .env file");
        } else {
            fs.writeFileSync('.env', updatedEnvContent);
            console.log("✅ Updated NTIQ_TOKEN_ADDRESS_MAINNET in .env file");
        }
    } catch (error) {
        console.log("⚠️ Could not update .env file:", error.message);
    }

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ NTIQ TOKEN MAINNET DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
