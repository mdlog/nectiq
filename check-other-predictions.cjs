#!/usr/bin/env node

const { Client } = require('pg');

async function checkOtherPredictions() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    });

    try {
        await client.connect();
        console.log('🔗 [DATABASE] Connected to database');

        // Check predictions with blockchain stake hash but no reward hash
        const query = `
      SELECT 
        id, 
        user_id, 
        cryptocurrency, 
        predicted_price, 
        actual_price, 
        accuracy, 
        reward_amount, 
        blockchain_stake_hash, 
        blockchain_reward_hash, 
        status, 
        created_at
      FROM predictions 
      WHERE blockchain_stake_hash IS NOT NULL 
        AND blockchain_reward_hash IS NULL 
        AND status = 'completed'
        AND reward_amount > 0
      ORDER BY created_at DESC
    `;

        const result = await client.query(query);

        console.log('🔍 [CHECK] Predictions with missing reward distribution:');
        console.log('   Total found:', result.rows.length);

        if (result.rows.length > 0) {
            console.log('\\n📊 [CHECK] Details:');
            result.rows.forEach((prediction, index) => {
                console.log(`\\n   ${index + 1}. Prediction ID ${prediction.id}:`);
                console.log(`      User ID: ${prediction.user_id}`);
                console.log(`      Cryptocurrency: ${prediction.cryptocurrency}`);
                console.log(`      Accuracy: ${prediction.accuracy}%`);
                console.log(`      Reward Amount: ${prediction.reward_amount} NTIQ`);
                console.log(`      Stake Hash: ${prediction.blockchain_stake_hash}`);
                console.log(`      Reward Hash: ${prediction.blockchain_reward_hash || 'MISSING'}`);
                console.log(`      Created: ${prediction.created_at}`);
            });

            console.log('\\n⚠️ [CHECK] These predictions need manual reward distribution');
        } else {
            console.log('✅ [CHECK] No predictions found with missing reward distribution');
        }

        // Check predictions with blockchain stake hash
        const allBlockchainQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(blockchain_reward_hash) as with_reward_hash,
        COUNT(*) - COUNT(blockchain_reward_hash) as missing_reward_hash
      FROM predictions 
      WHERE blockchain_stake_hash IS NOT NULL
    `;

        const allResult = await client.query(allBlockchainQuery);
        const stats = allResult.rows[0];

        console.log('\\n📊 [CHECK] Blockchain Integration Statistics:');
        console.log('   Total with blockchain stake:', stats.total);
        console.log('   With reward hash:', stats.with_reward_hash);
        console.log('   Missing reward hash:', stats.missing_reward_hash);

    } catch (error) {
        console.error('❌ [DATABASE] Error:', error.message);
    } finally {
        await client.end();
        console.log('🔗 [DATABASE] Database connection closed');
    }
}

checkOtherPredictions();
