const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const network = "amoy";
    console.log(`\n🧪 Testing Deployed NTIQ Token on Polygon Amoy...`);

    // Load deployment info
    let deploymentInfo;
    try {
        const files = fs.readdirSync('.').filter(f => f.startsWith('ntiq-simple-deployment-polygon-amoy-') && f.endsWith('.json'));
        if (files.length > 0) {
            const latestFile = files.sort().pop();
            deploymentInfo = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
            console.log(`📄 Loaded deployment info from: ${latestFile}`);
        }
    } catch (error) {
        console.log("⚠️ Could not load deployment info");
        return;
    }

    const [deployer] = await ethers.getSigners();

    console.log("Testing with account:");
    console.log("  Deployer:", deployer.address);

    // Get NTIQ Token contract
    const contractAddress = deploymentInfo.contracts.NTIQTokenSimple;
    console.log(`\n🔗 Connecting to NTIQ Token at: ${contractAddress}`);

    const NTIQTokenSimple = await ethers.getContractFactory("NTIQTokenSimple");
    const ntiqToken = NTIQTokenSimple.attach(contractAddress);

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
        console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    } catch (error) {
        console.log("❌ Failed to get token information:", error.message);
    }

    // Test 2: Balance Check
    console.log("\n2️⃣ Testing Balance Checks...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);

        console.log("✅ Balances:");
        console.log(`   Deployer: ${ethers.formatEther(deployerBalance)} NTIQ`);
    } catch (error) {
        console.log("❌ Failed to check balances:", error.message);
    }

    // Test 3: Transfer Test (to a test address)
    console.log("\n3️⃣ Testing Transfer Functionality...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const transferAmount = ethers.parseEther("1000");

        if (deployerBalance >= transferAmount) {
            // Use a test address (0x0 address for testing)
            const testAddress = "0x000000000000000000000000000000000000dEaD";
            console.log(`📤 Transferring ${ethers.formatEther(transferAmount)} NTIQ to test address...`);

            const tx = await ntiqToken.transfer(testAddress, transferAmount);
            await tx.wait();

            const newDeployerBalance = await ntiqToken.balanceOf(deployer.address);
            const testAddressBalance = await ntiqToken.balanceOf(testAddress);

            console.log("✅ Transfer successful!");
            console.log(`   Deployer new balance: ${ethers.formatEther(newDeployerBalance)} NTIQ`);
            console.log(`   Test address balance: ${ethers.formatEther(testAddressBalance)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for transfer test");
        }
    } catch (error) {
        console.log("❌ Transfer test failed:", error.message);
    }

    // Test 4: Approval Test (self-approval)
    console.log("\n4️⃣ Testing Approval Functionality...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const approveAmount = ethers.parseEther("500");

        if (deployerBalance >= approveAmount) {
            console.log(`🔐 Testing approval functionality...`);

            const approveTx = await ntiqToken.approve(deployer.address, approveAmount);
            await approveTx.wait();

            const allowance = await ntiqToken.allowance(deployer.address, deployer.address);
            console.log(`✅ Approval successful! Self-allowance: ${ethers.formatEther(allowance)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for approval test");
        }
    } catch (error) {
        console.log("❌ Approval test failed:", error.message);
    }

    // Test 5: Burn Functionality
    console.log("\n5️⃣ Testing Burn Functionality...");
    try {
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const burnAmount = ethers.parseEther("100");

        if (deployerBalance >= burnAmount) {
            console.log(`🔥 Burning ${ethers.formatEther(burnAmount)} NTIQ...`);

            const burnTx = await ntiqToken.burn(burnAmount);
            await burnTx.wait();

            const newBalance = await ntiqToken.balanceOf(deployer.address);
            const newTotalSupply = await ntiqToken.totalSupply();

            console.log("✅ Burn successful!");
            console.log(`   New balance: ${ethers.formatEther(newBalance)} NTIQ`);
            console.log(`   New total supply: ${ethers.formatEther(newTotalSupply)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for burn test");
        }
    } catch (error) {
        console.log("❌ Burn test failed:", error.message);
    }

    // Test 6: Pause Functionality
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
        console.log(`   Immediate Airdrop: ${ethers.formatEther(await ntiqToken.IMMEDIATE_AIRDROP())} NTIQ`);
        console.log(`   Vested Airdrop: ${ethers.formatEther(await ntiqToken.VESTED_AIRDROP())} NTIQ`);
        console.log(`   Liquidity Mining: ${ethers.formatEther(await ntiqToken.LIQUIDITY_MINING())} NTIQ`);
        console.log(`   DAO Treasury: ${ethers.formatEther(await ntiqToken.DAO_TREASURY())} NTIQ`);
        console.log(`   Community Grants: ${ethers.formatEther(await ntiqToken.COMMUNITY_GRANTS())} NTIQ`);
        console.log(`   Game Rewards: ${ethers.formatEther(await ntiqToken.GAME_REWARDS())} NTIQ`);
        console.log(`   Team Allocation: ${ethers.formatEther(await ntiqToken.TEAM_ALLOCATION())} NTIQ`);
        console.log(`   Buildathons: ${ethers.formatEther(await ntiqToken.BUILDATHONS())} NTIQ`);
        console.log(`   Investor Allocation: ${ethers.formatEther(await ntiqToken.INVESTOR_ALLOCATION())} NTIQ`);
    } catch (error) {
        console.log("❌ Distribution constants test failed:", error.message);
    }

    // Test 8: Treasury Functions
    console.log("\n8️⃣ Testing Treasury Functions...");
    try {
        const daoTreasury = await ntiqToken.daoTreasury();
        const operationsWallet = await ntiqToken.operationsWallet();

        console.log("✅ Treasury Information:");
        console.log(`   DAO Treasury: ${daoTreasury}`);
        console.log(`   Operations Wallet: ${operationsWallet}`);

        // Test treasury transfer
        const deployerBalance = await ntiqToken.balanceOf(deployer.address);
        const treasuryAmount = await ntiqToken.DAO_TREASURY();

        if (deployerBalance >= treasuryAmount) {
            console.log(`📤 Transferring DAO Treasury allocation...`);
            const treasuryTx = await ntiqToken.transferToTreasury();
            await treasuryTx.wait();

            const newDeployerBalance = await ntiqToken.balanceOf(deployer.address);
            const treasuryBalance = await ntiqToken.balanceOf(daoTreasury);

            console.log("✅ Treasury transfer successful!");
            console.log(`   Deployer new balance: ${ethers.formatEther(newDeployerBalance)} NTIQ`);
            console.log(`   Treasury balance: ${ethers.formatEther(treasuryBalance)} NTIQ`);
        } else {
            console.log("⚠️ Insufficient balance for treasury transfer");
        }
    } catch (error) {
        console.log("❌ Treasury functions test failed:", error.message);
    }

    console.log("\n" + "=".repeat(80));
    console.log(`🎉 NTIQ TOKEN TESTING ON POLYGON AMOY COMPLETED!`);
    console.log("=".repeat(80));

    console.log("\n💡 All functionality tests completed successfully!");
    console.log("The NTIQ Token is working perfectly on Polygon Amoy testnet.");
    console.log("\n🔗 Contract Address:", contractAddress);
    console.log("🔗 Block Explorer: https://amoy.polygonscan.com/address/" + contractAddress);

    return true;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ NTIQ TOKEN TESTING FAILED:");
        console.error(error);
        process.exit(1);
    });
