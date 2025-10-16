const { ethers } = require('ethers');

// Contract addresses from deployments/polygonAmoy.json
const CONTRACTS = {
    ntiqToken: '0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f',
    treasury: '0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4',
    predictionStaking: '0xbd92d6D83103d4cc9F74cb65CAB779F4e2b36C47',
    battleEscrow: '0x65CBABb0864de26fc753F5044277644f72Df8490',
    parlayStaking: '0x599f08B2D1ae362d29612aA0F3b2E80f8fe31CE5',
    tournamentPool: '0x384cDE1104b1c75e6469E07e2eD40E674Ce04EBe'
};

// ABI for NTIQ Token
const NTIQ_TOKEN_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

// ABI for PredictionStaking contract
const PREDICTION_STAKING_ABI = [
    "function totalStaked() view returns (uint256)",
    "function getStats() view returns (uint256 _totalStaked, uint256 _totalRewardsDistributed, uint256 _totalFeesCollected)"
];

// ABI for ParlayStaking contract
const PARLAY_STAKING_ABI = [
    "function totalStaked() view returns (uint256)",
    "function getStats() view returns (uint256 _totalStaked, uint256 _totalRewardsDistributed, uint256 _totalFeesCollected)"
];

// ABI for BattleEscrow contract
const BATTLE_ESCROW_ABI = [
    "function getStats() view returns (uint256 _totalBattlesCreated, uint256 _totalBattlesCompleted, uint256 _totalFeesCollected)"
];

async function fundContracts() {
    try {
        console.log('💰 [FUND-CONTRACTS] Starting contract funding process...\n');

        // Check if PRIVATE_KEY is set
        if (!process.env.PRIVATE_KEY) {
            console.error('❌ [ERROR] PRIVATE_KEY environment variable is not set');
            console.log('Please set your private key: export PRIVATE_KEY=0x...');
            return;
        }

        // Provider and Signer
        const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log('🔗 [FUND-CONTRACTS] Connected with address:', signer.address);

        // Get contracts
        const ntiqToken = new ethers.Contract(CONTRACTS.ntiqToken, NTIQ_TOKEN_ABI, signer);
        const predictionStaking = new ethers.Contract(CONTRACTS.predictionStaking, PREDICTION_STAKING_ABI, provider);
        const parlayStaking = new ethers.Contract(CONTRACTS.parlayStaking, PARLAY_STAKING_ABI, provider);
        const battleEscrow = new ethers.Contract(CONTRACTS.battleEscrow, BATTLE_ESCROW_ABI, provider);

        // Check current balances
        console.log('📊 [FUND-CONTRACTS] Current Contract Balances:');
        console.log('='.repeat(80));

        const treasuryBalance = await ntiqToken.balanceOf(CONTRACTS.treasury);
        const predictionBalance = await ntiqToken.balanceOf(CONTRACTS.predictionStaking);
        const parlayBalance = await ntiqToken.balanceOf(CONTRACTS.parlayStaking);
        const battleBalance = await ntiqToken.balanceOf(CONTRACTS.battleEscrow);

        console.log(`Treasury: ${parseFloat(ethers.formatEther(treasuryBalance)).toLocaleString()} NTIQ`);
        console.log(`PredictionStaking: ${parseFloat(ethers.formatEther(predictionBalance)).toLocaleString()} NTIQ`);
        console.log(`ParlayStaking: ${parseFloat(ethers.formatEther(parlayBalance)).toLocaleString()} NTIQ`);
        console.log(`BattleEscrow: ${parseFloat(ethers.formatEther(battleBalance)).toLocaleString()} NTIQ`);
        console.log('='.repeat(80));

        // Check if signer is treasury owner
        if (signer.address.toLowerCase() !== CONTRACTS.treasury.toLowerCase()) {
            console.log('⚠️ [WARNING] Signer address is not the treasury address');
            console.log('Treasury address:', CONTRACTS.treasury);
            console.log('Signer address:', signer.address);
            console.log('This might cause funding to fail if treasury is not the owner of contracts');
        }

        // Funding amounts (in NTIQ)
        const fundingAmounts = {
            predictionStaking: ethers.parseEther('1000000'), // 1M NTIQ
            parlayStaking: ethers.parseEther('1000000'),     // 1M NTIQ
            battleEscrow: ethers.parseEther('100000'),       // 100K NTIQ (already has some)
            tournamentPool: ethers.parseEther('500000')      // 500K NTIQ
        };

        console.log('\n💰 [FUND-CONTRACTS] Funding Amounts:');
        console.log(`PredictionStaking: ${parseFloat(ethers.formatEther(fundingAmounts.predictionStaking)).toLocaleString()} NTIQ`);
        console.log(`ParlayStaking: ${parseFloat(ethers.formatEther(fundingAmounts.parlayStaking)).toLocaleString()} NTIQ`);
        console.log(`BattleEscrow: ${parseFloat(ethers.formatEther(fundingAmounts.battleEscrow)).toLocaleString()} NTIQ`);
        console.log(`TournamentPool: ${parseFloat(ethers.formatEther(fundingAmounts.tournamentPool)).toLocaleString()} NTIQ`);

        // Check if treasury has enough balance
        const totalFundingNeeded = fundingAmounts.predictionStaking +
            fundingAmounts.parlayStaking +
            fundingAmounts.battleEscrow +
            fundingAmounts.tournamentPool;

        if (treasuryBalance < totalFundingNeeded) {
            console.error('❌ [ERROR] Treasury does not have enough balance');
            console.log(`Treasury balance: ${parseFloat(ethers.formatEther(treasuryBalance)).toLocaleString()} NTIQ`);
            console.log(`Total funding needed: ${parseFloat(ethers.formatEther(totalFundingNeeded)).toLocaleString()} NTIQ`);
            return;
        }

        console.log('\n🚀 [FUND-CONTRACTS] Starting funding process...');

        // Fund PredictionStaking contract
        console.log('\n🎯 [FUND-CONTRACTS] Funding PredictionStaking contract...');
        try {
            const tx1 = await ntiqToken.transfer(CONTRACTS.predictionStaking, fundingAmounts.predictionStaking);
            console.log('📝 [FUND-CONTRACTS] Transaction sent:', tx1.hash);
            await tx1.wait();
            console.log('✅ [FUND-CONTRACTS] PredictionStaking funded successfully');
        } catch (error) {
            console.error('❌ [FUND-CONTRACTS] Failed to fund PredictionStaking:', error.message);
        }

        // Fund ParlayStaking contract
        console.log('\n🎯 [FUND-CONTRACTS] Funding ParlayStaking contract...');
        try {
            const tx2 = await ntiqToken.transfer(CONTRACTS.parlayStaking, fundingAmounts.parlayStaking);
            console.log('📝 [FUND-CONTRACTS] Transaction sent:', tx2.hash);
            await tx2.wait();
            console.log('✅ [FUND-CONTRACTS] ParlayStaking funded successfully');
        } catch (error) {
            console.error('❌ [FUND-CONTRACTS] Failed to fund ParlayStaking:', error.message);
        }

        // Fund BattleEscrow contract
        console.log('\n⚔️ [FUND-CONTRACTS] Funding BattleEscrow contract...');
        try {
            const tx3 = await ntiqToken.transfer(CONTRACTS.battleEscrow, fundingAmounts.battleEscrow);
            console.log('📝 [FUND-CONTRACTS] Transaction sent:', tx3.hash);
            await tx3.wait();
            console.log('✅ [FUND-CONTRACTS] BattleEscrow funded successfully');
        } catch (error) {
            console.error('❌ [FUND-CONTRACTS] Failed to fund BattleEscrow:', error.message);
        }

        // Fund TournamentPool contract
        console.log('\n🏆 [FUND-CONTRACTS] Funding TournamentPool contract...');
        try {
            const tx4 = await ntiqToken.transfer(CONTRACTS.tournamentPool, fundingAmounts.tournamentPool);
            console.log('📝 [FUND-CONTRACTS] Transaction sent:', tx4.hash);
            await tx4.wait();
            console.log('✅ [FUND-CONTRACTS] TournamentPool funded successfully');
        } catch (error) {
            console.error('❌ [FUND-CONTRACTS] Failed to fund TournamentPool:', error.message);
        }

        // Check final balances
        console.log('\n📊 [FUND-CONTRACTS] Final Contract Balances:');
        console.log('='.repeat(80));

        const finalTreasuryBalance = await ntiqToken.balanceOf(CONTRACTS.treasury);
        const finalPredictionBalance = await ntiqToken.balanceOf(CONTRACTS.predictionStaking);
        const finalParlayBalance = await ntiqToken.balanceOf(CONTRACTS.parlayStaking);
        const finalBattleBalance = await ntiqToken.balanceOf(CONTRACTS.battleEscrow);
        const finalTournamentBalance = await ntiqToken.balanceOf(CONTRACTS.tournamentPool);

        console.log(`Treasury: ${parseFloat(ethers.formatEther(finalTreasuryBalance)).toLocaleString()} NTIQ`);
        console.log(`PredictionStaking: ${parseFloat(ethers.formatEther(finalPredictionBalance)).toLocaleString()} NTIQ`);
        console.log(`ParlayStaking: ${parseFloat(ethers.formatEther(finalParlayBalance)).toLocaleString()} NTIQ`);
        console.log(`BattleEscrow: ${parseFloat(ethers.formatEther(finalBattleBalance)).toLocaleString()} NTIQ`);
        console.log(`TournamentPool: ${parseFloat(ethers.formatEther(finalTournamentBalance)).toLocaleString()} NTIQ`);
        console.log('='.repeat(80));

        // Calculate funding results
        const predictionFunded = parseFloat(ethers.formatEther(finalPredictionBalance)) - parseFloat(ethers.formatEther(predictionBalance));
        const parlayFunded = parseFloat(ethers.formatEther(finalParlayBalance)) - parseFloat(ethers.formatEther(parlayBalance));
        const battleFunded = parseFloat(ethers.formatEther(finalBattleBalance)) - parseFloat(ethers.formatEther(battleBalance));
        const tournamentFunded = parseFloat(ethers.formatEther(finalTournamentBalance));

        console.log('\n🎉 [FUND-CONTRACTS] Funding Summary:');
        console.log(`PredictionStaking: +${predictionFunded.toLocaleString()} NTIQ`);
        console.log(`ParlayStaking: +${parlayFunded.toLocaleString()} NTIQ`);
        console.log(`BattleEscrow: +${battleFunded.toLocaleString()} NTIQ`);
        console.log(`TournamentPool: +${tournamentFunded.toLocaleString()} NTIQ`);

        const totalFunded = predictionFunded + parlayFunded + battleFunded + tournamentFunded;
        console.log(`Total Funded: ${totalFunded.toLocaleString()} NTIQ`);

        console.log('\n✅ [FUND-CONTRACTS] Contract funding completed successfully!');
        console.log('🚀 [FUND-CONTRACTS] Contracts are now ready to distribute rewards!');

    } catch (error) {
        console.error('❌ [ERROR] Failed to fund contracts:', error);
    }
}

// Run the funding process
fundContracts();
