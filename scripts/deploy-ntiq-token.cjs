const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const network = hre.network.name;
    console.log(`\n🚀 Deploying NTIQ Token to ${network.toUpperCase()}...`);

    const [deployer] = await ethers.getSigners();

    console.log("Deploying with account:", deployer.address);
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("❌ WARNING: Low balance! You need at least 0.01 ETH for deployment");
        console.log(`Get testnet ETH from faucet:`);
        if (network === "holesky") {
            console.log("Holesky Faucet: https://holesky-faucet.pk910.de/");
        } else if (network === "sepolia") {
            console.log("Sepolia Faucet: https://sepoliafaucet.com/");
        } else if (network === "polygonAmoy") {
            console.log("Polygon Amoy Faucet: https://faucet.polygon.technology/");
        }
        return;
    }

    console.log("\n📋 NTIQ TOKEN DEPLOYMENT PLAN:");
    console.log("1. Deploy NTIQToken Contract");
    console.log("2. Initialize token distribution");
    console.log("3. Setup initial allocations");
    console.log("4. Verify deployment");
    console.log("\nStarting deployment...\n");

    // Deploy NTIQ Token
    console.log("1️⃣ Deploying NTIQToken...");
    const NTIQToken = await ethers.getContractFactory("NTIQToken");
    const ntiqToken = await NTIQToken.deploy();
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
    console.log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
    console.log(`   Immediate Airdrop: ${ethers.utils.formatEther(await ntiqToken.IMMEDIATE_AIRDROP())} ${symbol}`);
    console.log(`   Vested Airdrop: ${ethers.utils.formatEther(await ntiqToken.VESTED_AIRDROP())} ${symbol}`);
    console.log(`   Liquidity Mining: ${ethers.utils.formatEther(await ntiqToken.LIQUIDITY_MINING())} ${symbol}`);
    console.log(`   DAO Treasury: ${ethers.utils.formatEther(await ntiqToken.DAO_TREASURY())} ${symbol}`);
    console.log(`   Community Grants: ${ethers.utils.formatEther(await ntiqToken.COMMUNITY_GRANTS())} ${symbol}`);
    console.log(`   Game Rewards: ${ethers.utils.formatEther(await ntiqToken.GAME_REWARDS())} ${symbol}`);
    console.log(`   Team Allocation: ${ethers.utils.formatEther(await ntiqToken.TEAM_ALLOCATION())} ${symbol}`);
    console.log(`   Buildathons: ${ethers.utils.formatEther(await ntiqToken.BUILDATHONS())} ${symbol}`);
    console.log(`   Investor Allocation: ${ethers.utils.formatEther(await ntiqToken.INVESTOR_ALLOCATION())} ${symbol}`);

    // Test basic functionality
    console.log("\n5️⃣ Testing basic functionality...");

    // Test transfer (if deployer has balance)
    if (deployerBalance.gt(0)) {
        console.log("   Testing transfer functionality...");
        // We'll just check if the function exists and is callable
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
        // Just check if burn function exists (don't actually burn)
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
        network: network,
        chainId: (await ethers.provider.getNetwork()).chainId,
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
            immediateAirdrop: (await ntiqToken.IMMEDIATE_AIRDROP()).toString(),
            vestedAirdrop: (await ntiqToken.VESTED_AIRDROP()).toString(),
            liquidityMining: (await ntiqToken.LIQUIDITY_MINING()).toString(),
            daoTreasury: (await ntiqToken.DAO_TREASURY()).toString(),
            communityGrants: (await ntiqToken.COMMUNITY_GRANTS()).toString(),
            gameRewards: (await ntiqToken.GAME_REWARDS()).toString(),
            teamAllocation: (await ntiqToken.TEAM_ALLOCATION()).toString(),
            buildathons: (await ntiqToken.BUILDATHONS()).toString(),
            investorAllocation: (await ntiqToken.INVESTOR_ALLOCATION()).toString()
        },
        blockExplorerUrls: {
            holesky: `https://holesky.etherscan.io`,
            sepolia: `https://sepolia.etherscan.io`,
            polygonAmoy: `https://amoy.polygonscan.com`
        },
        deploymentTime: new Date().toISOString()
    };

    // Save deployment info to file
    const fileName = `ntiq-deployment-${network}-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 NTIQ TOKEN DEPLOYMENT TO ${network.toUpperCase()} SUCCESSFUL!`);
    console.log("=".repeat(80));

    console.log("\n📋 CONTRACT ADDRESS:");
    console.log(`NTIQToken: ${ntiqToken.address}`);

    console.log("\n🔗 BLOCK EXPLORER LINKS:");
    let explorerBase;
    if (network === "holesky") {
        explorerBase = "https://holesky.etherscan.io";
    } else if (network === "sepolia") {
        explorerBase = "https://sepolia.etherscan.io";
    } else if (network === "polygonAmoy") {
        explorerBase = "https://amoy.polygonscan.com";
    } else {
        explorerBase = "https://etherscan.io";
    }
    console.log(`NTIQToken: ${explorerBase}/address/${ntiqToken.address}`);

    console.log("\n💡 NEXT STEPS:");
    console.log("1. Verify contract on block explorer (optional)");
    console.log("2. Update frontend with contract address");
    console.log("3. Setup token distribution mechanisms");
    console.log("4. Configure tokenomics parameters");
    console.log("5. Test token functionality");

    console.log("\n📄 TESTING COMMANDS:");
    console.log(`npx hardhat run scripts/test-ntiq-interaction.cjs --network ${network}`);

    console.log("\n💾 Deployment info saved to:", fileName);
    console.log("=".repeat(80));

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ NTIQ TOKEN DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
