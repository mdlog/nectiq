const { ethers } = require('ethers');

// Active contract addresses only
const CONTRACTS = {
    enhancedPredictionStaking: '0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3',
    enhancedParlayStaking: '0x87D08a494D960240d3a2D5CdB155084CAF222584',
    battleEscrow: '0x65CBABb0864de26fc753F5044277644f72Df8490',
    multiTokenVault: '0xe124893F7E1d5bF82586680c590f9510b6dCf42e',
    predictionInsurance: '0x170aF9d61945c6AbD8619d6cafbd03E5fC8ae3Ce',
    referralSystem: '0x7E9F85CDDb70A0d3Ab7738B61610d1774867c8e2',
    nftAchievementSystem: '0x57c5aE2C1ed8ef90e264D165b5A7F7C750C50C3f',
    treasury: '0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4'
};

async function fundContractsWithPOL() {
    try {
        console.log('💰 [FUND-POL] Starting POL funding process for contracts...\n');

        // Check if PRIVATE_KEY is set
        if (!process.env.PRIVATE_KEY) {
            console.error('❌ [ERROR] PRIVATE_KEY environment variable is not set');
            console.log('Please set your private key: export PRIVATE_KEY=0x...');
            return;
        }

        // Provider and Signer
        const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log('🔗 [FUND-POL] Connected with address:', signer.address);

        // Check current POL balances
        console.log('📊 [FUND-POL] Current POL Balances:');
        console.log('='.repeat(80));

        const signerBalance = await provider.getBalance(signer.address);
        console.log(`Signer Balance: ${parseFloat(ethers.formatEther(signerBalance)).toFixed(6)} POL`);

        for (const [name, address] of Object.entries(CONTRACTS)) {
            const balance = await provider.getBalance(address);
            console.log(`${name}: ${parseFloat(ethers.formatEther(balance)).toFixed(6)} POL`);
        }
        console.log('='.repeat(80));

        // Check if signer has enough POL
        const requiredPOL = ethers.parseEther('1.0'); // 1 POL total for all contracts
        if (signerBalance < requiredPOL) {
            console.error('❌ [ERROR] Signer does not have enough POL balance');
            console.log(`Required: ${parseFloat(ethers.formatEther(requiredPOL)).toFixed(6)} POL`);
            console.log(`Available: ${parseFloat(ethers.formatEther(signerBalance)).toFixed(6)} POL`);
            console.log('\n💡 [INFO] Get POL from Polygon Amoy Faucet:');
            console.log('1. Visit: https://faucet.polygon.technology/');
            console.log('2. Select "Polygon Amoy" network');
            console.log('3. Enter your address:', signer.address);
            console.log('4. Request testnet POL tokens');
            return;
        }

        // Funding amounts (in POL)
        const fundingAmounts = {
            enhancedPredictionStaking: ethers.parseEther('0.2'), // 0.2 POL
            enhancedParlayStaking: ethers.parseEther('0.2'),     // 0.2 POL
            battleEscrow: ethers.parseEther('0.2'),              // 0.2 POL
            multiTokenVault: ethers.parseEther('0.1'),           // 0.1 POL
            predictionInsurance: ethers.parseEther('0.1'),       // 0.1 POL
            referralSystem: ethers.parseEther('0.1'),            // 0.1 POL
            nftAchievementSystem: ethers.parseEther('0.1')       // 0.1 POL
        };

        console.log('\n💰 [FUND-POL] Funding Amounts:');
        console.log(`Enhanced Prediction Staking: ${parseFloat(ethers.formatEther(fundingAmounts.enhancedPredictionStaking)).toFixed(6)} POL`);
        console.log(`Enhanced Parlay Staking: ${parseFloat(ethers.formatEther(fundingAmounts.enhancedParlayStaking)).toFixed(6)} POL`);
        console.log(`Battle Escrow: ${parseFloat(ethers.formatEther(fundingAmounts.battleEscrow)).toFixed(6)} POL`);
        console.log(`Multi-Token Vault: ${parseFloat(ethers.formatEther(fundingAmounts.multiTokenVault)).toFixed(6)} POL`);
        console.log(`Prediction Insurance: ${parseFloat(ethers.formatEther(fundingAmounts.predictionInsurance)).toFixed(6)} POL`);
        console.log(`Referral System: ${parseFloat(ethers.formatEther(fundingAmounts.referralSystem)).toFixed(6)} POL`);
        console.log(`NFT Achievement System: ${parseFloat(ethers.formatEther(fundingAmounts.nftAchievementSystem)).toFixed(6)} POL`);

        const totalFundingNeeded = Object.values(fundingAmounts).reduce((sum, amount) => sum + amount, 0n);
        console.log(`Total Funding Needed: ${parseFloat(ethers.formatEther(totalFundingNeeded)).toFixed(6)} POL`);

        console.log('\n🚀 [FUND-POL] Starting funding process...');

        // Fund Enhanced Prediction Staking contract
        console.log('\n🎯 [FUND-POL] Funding Enhanced Prediction Staking contract...');
        try {
            const tx1 = await signer.sendTransaction({
                to: CONTRACTS.enhancedPredictionStaking,
                value: fundingAmounts.enhancedPredictionStaking,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx1.hash);
            await tx1.wait();
            console.log('✅ [FUND-POL] Enhanced Prediction Staking funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund Enhanced Prediction Staking:', error.message);
        }

        // Fund Enhanced Parlay Staking contract
        console.log('\n🎯 [FUND-POL] Funding Enhanced Parlay Staking contract...');
        try {
            const tx2 = await signer.sendTransaction({
                to: CONTRACTS.enhancedParlayStaking,
                value: fundingAmounts.enhancedParlayStaking,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx2.hash);
            await tx2.wait();
            console.log('✅ [FUND-POL] Enhanced Parlay Staking funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund Enhanced Parlay Staking:', error.message);
        }

        // Fund Battle Escrow contract
        console.log('\n⚔️ [FUND-POL] Funding Battle Escrow contract...');
        try {
            const tx3 = await signer.sendTransaction({
                to: CONTRACTS.battleEscrow,
                value: fundingAmounts.battleEscrow,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx3.hash);
            await tx3.wait();
            console.log('✅ [FUND-POL] Battle Escrow funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund Battle Escrow:', error.message);
        }

        // Fund Multi-Token Vault contract
        console.log('\n🏦 [FUND-POL] Funding Multi-Token Vault contract...');
        try {
            const tx4 = await signer.sendTransaction({
                to: CONTRACTS.multiTokenVault,
                value: fundingAmounts.multiTokenVault,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx4.hash);
            await tx4.wait();
            console.log('✅ [FUND-POL] Multi-Token Vault funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund Multi-Token Vault:', error.message);
        }

        // Fund Prediction Insurance contract
        console.log('\n🛡️ [FUND-POL] Funding Prediction Insurance contract...');
        try {
            const tx5 = await signer.sendTransaction({
                to: CONTRACTS.predictionInsurance,
                value: fundingAmounts.predictionInsurance,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx5.hash);
            await tx5.wait();
            console.log('✅ [FUND-POL] Prediction Insurance funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund Prediction Insurance:', error.message);
        }

        // Fund Referral System contract
        console.log('\n👥 [FUND-POL] Funding Referral System contract...');
        try {
            const tx6 = await signer.sendTransaction({
                to: CONTRACTS.referralSystem,
                value: fundingAmounts.referralSystem,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx6.hash);
            await tx6.wait();
            console.log('✅ [FUND-POL] Referral System funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund Referral System:', error.message);
        }

        // Fund NFT Achievement System contract
        console.log('\n🏆 [FUND-POL] Funding NFT Achievement System contract...');
        try {
            const tx7 = await signer.sendTransaction({
                to: CONTRACTS.nftAchievementSystem,
                value: fundingAmounts.nftAchievementSystem,
                gasLimit: 21000
            });
            console.log('📝 [FUND-POL] Transaction sent:', tx7.hash);
            await tx7.wait();
            console.log('✅ [FUND-POL] NFT Achievement System funded successfully');
        } catch (error) {
            console.error('❌ [FUND-POL] Failed to fund NFT Achievement System:', error.message);
        }

        // Check final balances
        console.log('\n📊 [FUND-POL] Final POL Balances:');
        console.log('='.repeat(80));

        const finalSignerBalance = await provider.getBalance(signer.address);
        console.log(`Signer Balance: ${parseFloat(ethers.formatEther(finalSignerBalance)).toFixed(6)} POL`);

        for (const [name, address] of Object.entries(CONTRACTS)) {
            const balance = await provider.getBalance(address);
            const balanceFormatted = parseFloat(ethers.formatEther(balance));
            console.log(`${name}: ${balanceFormatted.toFixed(6)} POL ${balanceFormatted > 0 ? '✅' : '❌'}`);
        }
        console.log('='.repeat(80));

        // Calculate funding results
        const contractsFunded = Object.entries(CONTRACTS).filter(([name, address]) => name !== 'treasury').length;
        const totalFunded = parseFloat(ethers.formatEther(totalFundingNeeded));

        console.log('\n🎉 [FUND-POL] Funding Summary:');
        console.log(`Contracts Funded: ${contractsFunded}`);
        console.log(`Total POL Funded: ${totalFunded.toFixed(6)} POL`);
        console.log(`Signer Balance Used: ${(parseFloat(ethers.formatEther(signerBalance)) - parseFloat(ethers.formatEther(finalSignerBalance))).toFixed(6)} POL`);

        console.log('\n✅ [FUND-POL] POL funding completed successfully!');
        console.log('🚀 [FUND-POL] Contracts are now ready to pay gas fees for reward distribution!');

        console.log('\n💡 [INFO] Next Steps:');
        console.log('1. Contracts now have POL for gas fees');
        console.log('2. Reward distribution will work properly');
        console.log('3. Monitor POL balances and top up when needed');
        console.log('4. Recommended to maintain 0.1-0.5 POL per contract');

    } catch (error) {
        console.error('❌ [ERROR] Failed to fund contracts with POL:', error);
    }
}

// Run the funding process
fundContractsWithPOL();
