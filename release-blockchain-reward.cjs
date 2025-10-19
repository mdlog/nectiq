const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function releaseBlockchainReward() {
    try {
        console.log('🔍 Releasing Blockchain Reward for GammaDragon8467...\n');

        // Get user and prediction info
        const query = `
            SELECT 
                u.id as user_id,
                u.username,
                u.balance,
                p.id as prediction_id,
                p.cryptocurrency,
                p.predicted_price,
                p.actual_price,
                p.stake_amount,
                p.reward_amount,
                p.blockchain_stake_hash,
                p.blockchain_reward_hash
            FROM users u
            JOIN predictions p ON u.id = p.user_id
            WHERE u.username = 'GammaDragon8467' 
            AND p.cryptocurrency = 'binancecoin'
            ORDER BY p.created_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            console.log('❌ User or prediction not found');
            return;
        }

        const data = result.rows[0];
        console.log('📊 Data Found:');
        console.log(`   User: ${data.username} (ID: ${data.user_id})`);
        console.log(`   Prediction ID: ${data.prediction_id}`);
        console.log(`   Cryptocurrency: ${data.cryptocurrency}`);
        console.log(`   Predicted Price: $${data.predicted_price}`);
        console.log(`   Actual Price: $${data.actual_price}`);
        console.log(`   Stake Amount: ${data.stake_amount} NTIQ`);
        console.log(`   Reward Amount: ${data.reward_amount} NTIQ`);
        console.log(`   Current Balance: ${data.balance} NTIQ`);
        console.log(`   Blockchain Stake Hash: ${data.blockchain_stake_hash}`);
        console.log(`   Blockchain Reward Hash: ${data.blockchain_reward_hash || 'None'}\n`);

        if (data.blockchain_reward_hash) {
            console.log('✅ Blockchain reward already released');
            console.log(`   Hash: ${data.blockchain_reward_hash}`);
            return;
        }

        if (!data.blockchain_stake_hash) {
            console.log('❌ No blockchain stake hash found');
            console.log('   Cannot release reward without stake hash');
            return;
        }

        if (!data.actual_price) {
            console.log('❌ No actual price found');
            console.log('   Cannot release reward without actual price');
            return;
        }

        console.log('🚀 Attempting to release blockchain reward...');

        // Call the API to release reward
        const response = await fetch('http://localhost:5003/api/predictions/release-reward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Buffer.from('admin').toString('base64')}`
            },
            body: JSON.stringify({
                predictionId: data.prediction_id,
                actualPrice: data.actual_price
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Blockchain reward release successful!');
            console.log(`   Transaction Hash: ${result.transactionHash || result.hash}`);
            console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
        } else {
            const error = await response.text();
            console.log('❌ Blockchain reward release failed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${error}`);
        }

    } catch (error) {
        console.error('❌ Error releasing blockchain reward:', error);
    } finally {
        await pool.end();
    }
}

releaseBlockchainReward();
