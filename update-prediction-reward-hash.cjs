#!/usr/bin/env node

const { Client } = require('pg');

async function updatePredictionRewardHash() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    });

    try {
        await client.connect();
        console.log('🔗 [DATABASE] Connected to database');

        // Update prediction ID 18 with reward hash
        const predictionId = 18;
        const rewardHash = '0x...'; // Replace with actual reward transaction hash after manual distribution

        console.log('📊 [DATABASE] Updating prediction reward hash...');
        console.log('   Prediction ID:', predictionId);
        console.log('   Reward Hash:', rewardHash);

        const updateQuery = `
      UPDATE predictions 
      SET blockchain_reward_hash = $1 
      WHERE id = $2
    `;

        const result = await client.query(updateQuery, [rewardHash, predictionId]);

        if (result.rowCount > 0) {
            console.log('✅ [DATABASE] Prediction reward hash updated successfully');

            // Verify update
            const verifyQuery = 'SELECT id, blockchain_stake_hash, blockchain_reward_hash FROM predictions WHERE id = $1';
            const verifyResult = await client.query(verifyQuery, [predictionId]);

            if (verifyResult.rows.length > 0) {
                const prediction = verifyResult.rows[0];
                console.log('🔍 [DATABASE] Verification:');
                console.log('   ID:', prediction.id);
                console.log('   Stake Hash:', prediction.blockchain_stake_hash);
                console.log('   Reward Hash:', prediction.blockchain_reward_hash);
            }
        } else {
            console.log('❌ [DATABASE] No prediction found with ID:', predictionId);
        }

    } catch (error) {
        console.error('❌ [DATABASE] Error:', error.message);
    } finally {
        await client.end();
        console.log('🔗 [DATABASE] Database connection closed');
    }
}

updatePredictionRewardHash();
