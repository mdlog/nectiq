const { ethers } = require('ethers');

// Active contract addresses only
const CONTRACTS = {
    ntiqToken: '0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f',
    treasury: '0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4',
    enhancedPredictionStaking: '0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3',
    enhancedParlayStaking: '0x87D08a494D960240d3a2D5CdB155084CAF222584',
    battleEscrow: '0x65CBABb0864de26fc753F5044277644f72Df8490',
    multiTokenVault: '0xe124893F7E1d5bF82586680c590f9510b6dCf42e',
    predictionInsurance: '0x170aF9d61945c6AbD8619d6cafbd03E5fC8ae3Ce',
    referralSystem: '0x7E9F85CDDb70A0d3Ab7738B61610d1774867c8e2',
    nftAchievementSystem: '0x57c5aE2C1ed8ef90e264D165b5A7F7C750C50C3f'
};

// ABI for NTIQ Token (minimal)
const NTIQ_TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

// ABI for PredictionStaking contract
const PREDICTION_STAKING_ABI = [
    "function totalStaked() view returns (uint256)",
    "function totalRewardsDistributed() view returns (uint256)",
    "function totalFeesCollected() view returns (uint256)",
    "function getStats() view returns (uint256 _totalStaked, uint256 _totalRewardsDistributed, uint256 _totalFeesCollected)"
];

// ABI for BattleEscrow contract
const BATTLE_ESCROW_ABI = [
    "function getStats() view returns (uint256 _totalBattlesCreated, uint256 _totalBattlesCompleted, uint256 _totalFeesCollected)"
];

// ABI for ParlayStaking contract
const PARLAY_STAKING_ABI = [
    "function totalStaked() view returns (uint256)",
    "function totalRewardsDistributed() view returns (uint256)",
    "function totalFeesCollected() view returns (uint256)",
    "function getStats() view returns (uint256 _totalStaked, uint256 _totalRewardsDistributed, uint256 _totalFeesCollected)"
];

// ABI for TournamentPool contract
const TOURNAMENT_POOL_ABI = [
    "function totalPool() view returns (uint256)",
    "function totalDistributed() view returns (uint256)"
];

async function checkContractBalances() {
    try {
        console.log('🔍 [CONTRACT-BALANCES] Checking NTIQ token balances in all contracts...\n');

        // Provider
        const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');

        // NTIQ Token contract
        const ntiqToken = new ethers.Contract(CONTRACTS.ntiqToken, NTIQ_TOKEN_ABI, provider);

        // Get token info
        const tokenName = await ntiqToken.name();
        const tokenSymbol = await ntiqToken.symbol();
        const tokenDecimals = await ntiqToken.decimals();
        const totalSupply = await ntiqToken.totalSupply();

        console.log('📊 [TOKEN-INFO] NTIQ Token Information:');
        console.log(`   Name: ${tokenName}`);
        console.log(`   Symbol: ${tokenSymbol}`);
        console.log(`   Decimals: ${tokenDecimals}`);
        console.log(`   Total Supply: ${parseFloat(ethers.formatEther(totalSupply)).toLocaleString()} NTIQ`);
        console.log(`   Contract Address: ${CONTRACTS.ntiqToken}\n`);

        // Check balances for each contract
        const contracts = [
            { name: 'Treasury', address: CONTRACTS.treasury },
            { name: 'PredictionStaking', address: CONTRACTS.predictionStaking },
            { name: 'BattleEscrow', address: CONTRACTS.battleEscrow },
            { name: 'ParlayStaking', address: CONTRACTS.parlayStaking },
            { name: 'TournamentPool', address: CONTRACTS.tournamentPool }
        ];

        console.log('💰 [BALANCES] NTIQ Token Balances:');
        console.log('='.repeat(80));

        let totalStakedInContracts = 0;

        for (const contract of contracts) {
            const balance = await ntiqToken.balanceOf(contract.address);
            const balanceFormatted = parseFloat(ethers.formatEther(balance));
            totalStakedInContracts += balanceFormatted;

            console.log(`${contract.name.padEnd(20)} | ${balanceFormatted.toLocaleString().padStart(15)} NTIQ | ${contract.address}`);
        }

        console.log('='.repeat(80));
        console.log(`Total Staked in Contracts: ${totalStakedInContracts.toLocaleString()} NTIQ\n`);

        // Get detailed stats from each contract
        console.log('📈 [STATS] Contract Statistics:');
        console.log('='.repeat(80));

        // PredictionStaking stats
        try {
            const predictionStaking = new ethers.Contract(CONTRACTS.predictionStaking, PREDICTION_STAKING_ABI, provider);
            const [totalStaked, totalRewardsDistributed, totalFeesCollected] = await predictionStaking.getStats();

            console.log('🎯 [PREDICTION-STAKING] Statistics:');
            console.log(`   Total Staked: ${parseFloat(ethers.formatEther(totalStaked)).toLocaleString()} NTIQ`);
            console.log(`   Total Rewards Distributed: ${parseFloat(ethers.formatEther(totalRewardsDistributed)).toLocaleString()} NTIQ`);
            console.log(`   Total Fees Collected: ${parseFloat(ethers.formatEther(totalFeesCollected)).toLocaleString()} NTIQ`);
            console.log(`   Contract Balance: ${parseFloat(ethers.formatEther(await ntiqToken.balanceOf(CONTRACTS.predictionStaking))).toLocaleString()} NTIQ\n`);
        } catch (error) {
            console.log('❌ [PREDICTION-STAKING] Error getting stats:', error.message);
        }

        // BattleEscrow stats
        try {
            const battleEscrow = new ethers.Contract(CONTRACTS.battleEscrow, BATTLE_ESCROW_ABI, provider);
            const [totalBattlesCreated, totalBattlesCompleted, totalFeesCollected] = await battleEscrow.getStats();

            console.log('⚔️ [BATTLE-ESCROW] Statistics:');
            console.log(`   Total Battles Created: ${totalBattlesCreated.toString()}`);
            console.log(`   Total Battles Completed: ${totalBattlesCompleted.toString()}`);
            console.log(`   Total Fees Collected: ${parseFloat(ethers.formatEther(totalFeesCollected)).toLocaleString()} NTIQ`);
            console.log(`   Contract Balance: ${parseFloat(ethers.formatEther(await ntiqToken.balanceOf(CONTRACTS.battleEscrow))).toLocaleString()} NTIQ\n`);
        } catch (error) {
            console.log('❌ [BATTLE-ESCROW] Error getting stats:', error.message);
        }

        // ParlayStaking stats
        try {
            const parlayStaking = new ethers.Contract(CONTRACTS.parlayStaking, PARLAY_STAKING_ABI, provider);
            const [totalStaked, totalRewardsDistributed, totalFeesCollected] = await parlayStaking.getStats();

            console.log('🎯 [PARLAY-STAKING] Statistics:');
            console.log(`   Total Staked: ${parseFloat(ethers.formatEther(totalStaked)).toLocaleString()} NTIQ`);
            console.log(`   Total Rewards Distributed: ${parseFloat(ethers.formatEther(totalRewardsDistributed)).toLocaleString()} NTIQ`);
            console.log(`   Total Fees Collected: ${parseFloat(ethers.formatEther(totalFeesCollected)).toLocaleString()} NTIQ`);
            console.log(`   Contract Balance: ${parseFloat(ethers.formatEther(await ntiqToken.balanceOf(CONTRACTS.parlayStaking))).toLocaleString()} NTIQ\n`);
        } catch (error) {
            console.log('❌ [PARLAY-STAKING] Error getting stats:', error.message);
        }

        // TournamentPool stats
        try {
            const tournamentPool = new ethers.Contract(CONTRACTS.tournamentPool, TOURNAMENT_POOL_ABI, provider);
            const totalPool = await tournamentPool.totalPool();
            const totalDistributed = await tournamentPool.totalDistributed();

            console.log('🏆 [TOURNAMENT-POOL] Statistics:');
            console.log(`   Total Pool: ${parseFloat(ethers.formatEther(totalPool)).toLocaleString()} NTIQ`);
            console.log(`   Total Distributed: ${parseFloat(ethers.formatEther(totalDistributed)).toLocaleString()} NTIQ`);
            console.log(`   Contract Balance: ${parseFloat(ethers.formatEther(await ntiqToken.balanceOf(CONTRACTS.tournamentPool))).toLocaleString()} NTIQ\n`);
        } catch (error) {
            console.log('❌ [TOURNAMENT-POOL] Error getting stats:', error.message);
        }

        // Summary
        console.log('📊 [SUMMARY] Token Distribution Summary:');
        console.log('='.repeat(80));
        console.log(`Total Supply: ${parseFloat(ethers.formatEther(totalSupply)).toLocaleString()} NTIQ`);
        console.log(`Total Staked in Contracts: ${totalStakedInContracts.toLocaleString()} NTIQ`);
        console.log(`Percentage Staked: ${((totalStakedInContracts / parseFloat(ethers.formatEther(totalSupply))) * 100).toFixed(2)}%`);
        console.log(`Available for Circulation: ${(parseFloat(ethers.formatEther(totalSupply)) - totalStakedInContracts).toLocaleString()} NTIQ`);

    } catch (error) {
        console.error('❌ [ERROR] Failed to check contract balances:', error);
    }
}

// Run the check
checkContractBalances();
