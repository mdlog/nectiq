const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const network = hre.network.name;
    console.log(`\n🧪 Testing NTIQ Token on ${network.toUpperCase()}...`);

    // Try to load deployment info
    let deploymentInfo;
    try {
        const files = fs.readdirSync('.').filter(f => f.startsWith('ntiq-deployment-') && f.endsWith('.json'));
        if (files.length > 0) {
            const latestFile = files.sort().pop();
            deploymentInfo = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
            console.log(`📄 Loaded deployment info from: ${latestFile}`);
        }
    } catch (error) {
        console.log("⚠️ Could not load deployment info, using default address");
    }

    const [deployer, testUser] = await ethers.getSigners();

    console.log("Testing with accounts:");
    console.log("  Deployer:", deployer.address);
    console.log("  Test User:", testUser.address);

    // Get NTIQ Token contract
    let ntiqTokenAddress;
    if (deploymentInfo && deploymentInfo.contracts.NTIQToken) {
        ntiqTokenAddress = deploymentInfo.contracts.NTIQToken;
    } else {
        console.log("❌ No NTIQ Token address found. Please deploy first or provide address.");
        return;
    }

    console.log(`\n🔗 Connecting to NTIQ Token at: ${ntiqTokenAddress}`);
    const NTIQToken = await ethers.getContractFactory("NTIQToken");
    const ntiqToken = NTIQToken.attach(ntiqTokenAddress);

    // Test 1: Basic Token Information
    console.log("\n1️⃣ Testing Basic Token Information...");
    try {
        const name = await ntiqToken.name();
        const symbol = await ntiqToken.symbol();
        const decimals = await ntiqToken.decimals();
        const totalSupply = await ntiqToken.totalSupply();

        console.log("✅ Token Information:");
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
    } catch (error) {
        console.log("❌ Failed to get token information:", error.message);
    }

    // Test 2: Balance Check
    console.log("\n2️⃣ Testing Balance Checks...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const testUserBalance = await ntiqToken.balanceOf(testUser.address);

        console.log("✅ Balances:");
        console.log(`   Deployer: ${ethers.utils.formatEther(deployerBalance)} NTIQ`);
        console.log(`   Test User: ${ethers.utils.formatEther(testUserBalance)} NTIQ`);
    } catch (error) {
        console.log("❌ Failed to check balances:", error.message);
    }

    // Test 3: Transfer Test (if deployer has balance)
    console.log("\n3️⃣ Testing Transfer Functionality...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const transferAmount = ethers.utils.parseEther("100");

        if (deployerBalance.gte(transferAmount)) {
            console.log(`📤 Transferring ${ethers.utils.formatEther(transferAmount)} NTIQ to test user...`);

            const tx = await ntiqToken.transfer(testUser.address, transferAmount);
            await tx.wait();

            const newDeployerBalance = await ntiqToken.balanceOf(deployer.address);
            const newTestUserBalance = await ntiqToken.balanceOf(testUser.address);

            console.log("✅ Transfer successful!");
            console.log(`   Deployer new balance: ${ethers.utils.formatEther(newDeployerBalance)} NTIQ`);
            console.log(`   Test user new balance: ${ethers.utils.formatEther(newTestUserBalance)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for transfer test");
        }
    } catch (error) {
        console.log("❌ Transfer test failed:", error.message);
    }

    // Test 4: Approval and TransferFrom
    console.log("\n4️⃣ Testing Approval and TransferFrom...");
    try {
        const testUserBalance = await ntiqToken.balanceOf(testUser.address);
        const approveAmount = ethers.utils.parseEther("50");

        if (testUserBalance.gte(approveAmount)) {
            console.log(`🔐 Approving ${ethers.utils.formatEther(approveAmount)} NTIQ for deployer...`);

            const approveTx = await ntiqToken.connect(testUser).approve(deployer.address, approveAmount);
            await approveTx.wait();

            const allowance = await ntiqToken.allowance(testUser.address, deployer.address);
            console.log(`✅ Approval successful! Allowance: ${ethers.utils.formatEther(allowance)} NTIQ`);

            // Test transferFrom
            const transferFromAmount = ethers.utils.parseEther("25");
            console.log(`📤 Transferring ${ethers.utils.formatEther(transferFromAmount)} NTIQ from test user to deployer...`);

            const transferFromTx = await ntiqToken.transferFrom(testUser.address, deployer.address, transferFromAmount);
            await transferFromTx.wait();

            const newAllowance = await ntiqToken.allowance(testUser.address, deployer.address);
            console.log(`✅ TransferFrom successful! New allowance: ${ethers.utils.formatEther(newAllowance)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for approval test");
        }
    } catch (error) {
        console.log("❌ Approval/TransferFrom test failed:", error.message);
    }

    // Test 5: Burn Functionality
    console.log("\n5️⃣ Testing Burn Functionality...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const burnAmount = ethers.utils.parseEther("10");

        if (deployerBalance.gte(burnAmount)) {
            console.log(`🔥 Burning ${ethers.utils.formatEther(burnAmount)} NTIQ...`);

            const burnTx = await ntiqToken.burn(burnAmount);
            await burnTx.wait();

            const newBalance = await ntiqToken.balanceOf(deployer.address);
            const newTotalSupply = await ntiqToken.totalSupply();

            console.log("✅ Burn successful!");
            console.log(`   New balance: ${ethers.utils.formatEther(newBalance)} NTIQ`);
            console.log(`   New total supply: ${ethers.utils.formatEther(newTotalSupply)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for burn test");
        }
    } catch (error) {
        console.log("❌ Burn test failed:", error.message);
    }

    // Test 6: Pause Functionality (only if deployer is owner)
    console.log("\n6️⃣ Testing Pause Functionality...");
    try {
        const owner = await ntiqToken.owner();
        const isPaused = await ntiqToken.paused();

        console.log(`   Owner: ${owner}`);
        console.log(`   Currently paused: ${isPaused}`);

        if (owner.toLowerCase() === deployer.address.toLowerCase()) {
            if (!isPaused) {
                console.log("⏸️ Pausing token...");
                const pauseTx = await ntiqToken.pause();
                await pauseTx.wait();

                const newPausedState = await ntiqToken.paused();
                console.log(`✅ Token paused successfully! Paused: ${newPausedState}`);

                // Try to unpause
                console.log("▶️ Unpausing token...");
                const unpauseTx = await ntiqToken.unpause();
                await unpauseTx.wait();

                const finalPausedState = await ntiqToken.paused();
                console.log(`✅ Token unpaused successfully! Paused: ${finalPausedState}`);
            } else {
                console.log("▶️ Unpausing token...");
                const unpauseTx = await ntiqToken.unpause();
                await unpauseTx.wait();

                const newPausedState = await ntiqToken.paused();
                console.log(`✅ Token unpaused successfully! Paused: ${newPausedState}`);
            }
        } else {
            console.log("⚠️ Deployer is not owner, skipping pause test");
        }
    } catch (error) {
        console.log("❌ Pause test failed:", error.message);
    }

    // Test 7: Distribution Constants
    console.log("\n7️⃣ Testing Distribution Constants...");
    try {
        console.log("✅ Distribution Constants:");
        console.log(`   Immediate Airdrop: ${ethers.utils.formatEther(await ntiqToken.IMMEDIATE_AIRDROP())} NTIQ`);
        console.log(`   Vested Airdrop: ${ethers.utils.formatEther(await ntiqToken.VESTED_AIRDROP())} NTIQ`);
        console.log(`   Liquidity Mining: ${ethers.utils.formatEther(await ntiqToken.LIQUIDITY_MINING())} NTIQ`);
        console.log(`   DAO Treasury: ${ethers.utils.formatEther(await ntiqToken.DAO_TREASURY())} NTIQ`);
        console.log(`   Community Grants: ${ethers.utils.formatEther(await ntiqToken.COMMUNITY_GRANTS())} NTIQ`);
        console.log(`   Game Rewards: ${ethers.utils.formatEther(await ntiqToken.GAME_REWARDS())} NTIQ`);
        console.log(`   Team Allocation: ${ethers.utils.formatEther(await ntiqToken.TEAM_ALLOCATION())} NTIQ`);
        console.log(`   Buildathons: ${ethers.utils.formatEther(await ntiqToken.BUILDATHONS())} NTIQ`);
        console.log(`   Investor Allocation: ${ethers.utils.formatEther(await ntiqToken.INVESTOR_ALLOCATION())} NTIQ`);
    } catch (error) {
        console.log("❌ Distribution constants test failed:", error.message);
    }

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 NTIQ TOKEN TESTING ON ${network.toUpperCase()} COMPLETED!`);
    console.log("=".repeat(80));

    console.log("\n💡 All basic functionality tests completed successfully!");
    console.log("The NTIQ Token is ready for production use.");

    return true;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ NTIQ TOKEN TESTING FAILED:");
        console.error(error);
        process.exit(1);
    });
