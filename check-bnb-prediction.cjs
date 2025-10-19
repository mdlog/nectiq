const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkBNBPrediction() {
    try {
        console.log('🔍 Checking BNB prediction for user GammaDragon8467...\n');

        // Get user ID
        const userQuery = `
            SELECT id, username, total_predictions, correct_predictions, total_rewards 
            FROM users 
            WHERE username = 'GammaDragon8467'
        `;
        const userResult = await pool.query(userQuery);

        if (userResult.rows.length === 0) {
            console.log('❌ User GammaDragon8467 not found');
            return;
        }

        const user = userResult.rows[0];
        console.log('👤 User Info:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Total Predictions: ${user.total_predictions}`);
        console.log(`   Correct Predictions: ${user.correct_predictions}`);
        console.log(`   Total Rewards: ${user.total_rewards}\n`);

        // Get all predictions for this user
        const predictionQuery = `
            SELECT 
                id,
                cryptocurrency,
                predicted_price,
                timeframe,
                stake_amount,
                blockchain_status,
                blockchain_stake_hash,
                blockchain_reward_hash,
                created_at,
                target_time,
                status,
                accuracy,
                reward_amount
            FROM predictions 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const predictionResult = await pool.query(predictionQuery, [user.id]);

        if (predictionResult.rows.length === 0) {
            console.log('❌ No predictions found for this user');
            return;
        }

        console.log('🎯 All Predictions:');
        predictionResult.rows.forEach((prediction, index) => {
            const createdAt = new Date(prediction.created_at);
            const targetTime = new Date(prediction.target_time);
            const now = new Date();
            const timeLeft = Math.max(0, targetTime - now);
            const minutesLeft = Math.floor(timeLeft / (1000 * 60));

            console.log(`\n📊 Prediction #${index + 1}:`);
            console.log(`   ID: ${prediction.id}`);
            console.log(`   Cryptocurrency: ${prediction.cryptocurrency}`);
            console.log(`   Predicted Price: $${prediction.predicted_price}`);
            console.log(`   Timeframe: ${prediction.timeframe}`);
            console.log(`   Stake Amount: ${prediction.stake_amount} NTIQ`);
            console.log(`   Status: ${prediction.status}`);
            console.log(`   Blockchain Status: ${prediction.blockchain_status}`);
            console.log(`   Blockchain Stake Hash: ${prediction.blockchain_stake_hash || 'None'}`);
            console.log(`   Blockchain Reward Hash: ${prediction.blockchain_reward_hash || 'None'}`);
            console.log(`   Created: ${createdAt.toLocaleString()}`);
            console.log(`   Target Time: ${targetTime.toLocaleString()}`);
            console.log(`   Time Left: ${minutesLeft} minutes`);
            console.log(`   Accuracy: ${prediction.accuracy || 'Not calculated yet'}`);
            console.log(`   Reward Amount: ${prediction.reward_amount || 'Not calculated yet'}`);

            // Analysis for reward payment
            console.log(`\n🔍 Reward Payment Analysis:`);

            if (prediction.blockchain_status === 'confirmed' && prediction.blockchain_stake_hash) {
                console.log(`   ✅ Blockchain transaction confirmed`);
                console.log(`   ✅ Stake hash available: ${prediction.blockchain_stake_hash}`);

                if (prediction.status === 'active' && minutesLeft > 0) {
                    console.log(`   ⏳ Prediction still active (${minutesLeft} minutes left)`);
                    console.log(`   📋 Will be processed when expires`);
                } else if (prediction.status === 'completed') {
                    if (prediction.blockchain_reward_hash) {
                        console.log(`   ✅ Reward already paid: ${prediction.blockchain_reward_hash}`);
                    } else {
                        console.log(`   ⚠️  Prediction completed but no reward hash found`);
                    }
                } else if (prediction.status === 'expired') {
                    console.log(`   ⏳ Prediction expired, processing should happen soon`);
                }
            } else {
                console.log(`   ❌ Blockchain transaction not confirmed`);
                console.log(`   ❌ No stake hash available`);
                console.log(`   ⚠️  This prediction may not be eligible for rewards`);
            }

            // Check if prediction is close to expiry
            if (minutesLeft <= 5 && minutesLeft > 0) {
                console.log(`   🚨 WARNING: Prediction expires in ${minutesLeft} minutes!`);
            }
        });

    } catch (error) {
        console.error('❌ Error checking BNB prediction:', error);
    } finally {
        await pool.end();
    }
}

checkBNBPrediction();
