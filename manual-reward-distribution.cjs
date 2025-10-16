#!/usr/bin/env node

const { ethers } = require('ethers');

async function distributeManualReward() {
    try {
        console.log('🔧 [MANUAL-REWARD] Starting manual reward distribution for Prediction ID 18...');

        // Contract addresses
        const predictionStakingAddress = '0xcf62251Aa622519A1E83BE270CDfE78C073F9fd3';
        const ntiqTokenAddress = '0xE276c3634b7747c46c1aBAB4Eff6b2f046C71A6f';
        const userAddress = '0x6b7d1959867e911391807b8d764b99a7b706ff6d';

        // Provider and signer (using deployer account)
        const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
        const privateKey = process.env.PRIVATE_KEY || '0x...'; // Add your private key here
        const signer = new ethers.Wallet(privateKey, provider);

        // Contract ABIs
        const predictionStakingABI = [
            'function releaseReward(bytes32 predictionId, uint256 actualPrice) external returns (bool)',
            'function getStake(bytes32 predictionId) view returns (tuple(address user, uint256 amount, uint256 predictedPrice, uint256 duration, uint256 durationMultiplier, bool released, uint256 rewardAmount))'
        ];

        const ntiqTokenABI = [
            'function balanceOf(address account) view returns (uint256)'
        ];

        // Get contracts
        const predictionStaking = new ethers.Contract(predictionStakingAddress, predictionStakingABI, signer);
        const ntiqToken = new ethers.Contract(ntiqTokenAddress, ntiqTokenABI, provider);

        // Use the actual prediction ID from transaction
        const actualPredictionId = '0x00000000000000000000000000000000000000000000000000000199ed79fde9';
        const actualPrice = '109844.30715175'; // From database

        console.log('📊 [MANUAL-REWARD] Reward Distribution Details:');
        console.log('   Prediction ID:', actualPredictionId);
        console.log('   User Address:', userAddress);
        console.log('   Actual Price:', actualPrice);
        console.log('   Contract Address:', predictionStakingAddress);
        console.log('   Signer Address:', signer.address);

        // Check current balance before
        const balanceBefore = await ntiqToken.balanceOf(userAddress);
        console.log('💰 [MANUAL-REWARD] Balance Before:', ethers.formatEther(balanceBefore), 'NTIQ');

        // Check stake status
        try {
            const stake = await predictionStaking.getStake(actualPredictionId);
            console.log('✅ [MANUAL-REWARD] Stake Status:');
            console.log('   User:', stake.user);
            console.log('   Amount:', ethers.formatEther(stake.amount), 'NTIQ');
            console.log('   Predicted Price:', ethers.formatEther(stake.predictedPrice));
            console.log('   Released:', stake.released);
            console.log('   Reward Amount:', ethers.formatEther(stake.rewardAmount), 'NTIQ');

            if (stake.released) {
                console.log('✅ [MANUAL-REWARD] Stake already released with reward:', ethers.formatEther(stake.rewardAmount), 'NTIQ');
                return;
            }

            // Release reward
            console.log('🚀 [MANUAL-REWARD] Releasing reward...');
            const actualPriceWei = ethers.parseEther(actualPrice);

            const tx = await predictionStaking.releaseReward(actualPredictionId, actualPriceWei);
            console.log('📝 [MANUAL-REWARD] Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('✅ [MANUAL-REWARD] Transaction confirmed in block:', receipt.blockNumber);

            // Check balance after
            const balanceAfter = await ntiqToken.balanceOf(userAddress);
            const rewardReceived = parseFloat(ethers.formatEther(balanceAfter)) - parseFloat(ethers.formatEther(balanceBefore));

            console.log('💰 [MANUAL-REWARD] Balance After:', ethers.formatEther(balanceAfter), 'NTIQ');
            console.log('🎉 [MANUAL-REWARD] Reward Received:', rewardReceived, 'NTIQ');

            // Check final stake status
            const finalStake = await predictionStaking.getStake(actualPredictionId);
            console.log('✅ [MANUAL-REWARD] Final Stake Status:');
            console.log('   Released:', finalStake.released);
            console.log('   Reward Amount:', ethers.formatEther(finalStake.rewardAmount), 'NTIQ');

        } catch (error) {
            console.log('❌ [MANUAL-REWARD] Error:', error.message);
        }

    } catch (error) {
        console.error('❌ Error in manual reward distribution:', error.message);
    }
}

// Check if private key is provided
if (!process.env.PRIVATE_KEY) {
    console.log('⚠️ [MANUAL-REWARD] PRIVATE_KEY environment variable not set');
    console.log('   Please set PRIVATE_KEY to deployer account private key');
    console.log('   Example: PRIVATE_KEY=0x... node manual-reward-distribution.cjs');
    process.exit(1);
}

distributeManualReward();
