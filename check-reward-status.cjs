const { Pool } = require
    ('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkRewardStatus() {
    try {
        console.log('🔍 Checking Reward Status for GammaDragon8467...\n');

        // Get user info
        const userQuery = `
            SELECT id, username, total_predictions, correct_predictions, total_rewards, balance
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
        console.log(`   Total Rewards: ${user.total_rewards}`);
        console.log(`   Current Balance: ${user.balance || 0} NTIQ\n`);

        // Get the specific BNB prediction
        const predictionQuery = `
            SELECT 
                id,
                cryptocurrency,
                predicted_price,
                actual_price,
                stake_amount,
                blockchain_status,
                blockchain_stake_hash,
                blockchain_reward_hash,
                status,
                accuracy,
                reward_amount,
                completed_at
            FROM predictions 
            WHERE user_id = $1 AND cryptocurrency = 'binancecoin'
            ORDER BY created_at DESC
        `;
        const predictionResult = await pool.query(predictionQuery, [user.id]);

        if (predictionResult.rows.length === 0) {
            console.log('❌ No BNB predictions found');
            return;
        }

        const prediction = predictionResult.rows[0];
        console.log('📊 BNB Prediction Details:');
        console.log(`   ID: ${prediction.id}`);
        console.log(`   Status: ${prediction.status}`);
        console.log(`   Blockchain Status: ${prediction.blockchain_status}`);
        console.log(`   Predicted Price: $${prediction.predicted_price}`);
        console.log(`   Actual Price: $${prediction.actual_price || 'Not set'}`);
        console.log(`   Accuracy: ${prediction.accuracy || 'Not calculated'}`);
        console.log(`   Stake Amount: ${prediction.stake_amount} NTIQ`);
        console.log(`   Reward Amount: ${prediction.reward_amount || 0} NTIQ`);
        console.log(`   Completed At: ${prediction.completed_at || 'Not completed'}`);
        console.log(`   Blockchain Stake Hash: ${prediction.blockchain_stake_hash || 'None'}`);
        console.log(`   Blockchain Reward Hash: ${prediction.blockchain_reward_hash || 'None'}\n`);

        // Check if reward was processed
        if (prediction.status === 'completed' && prediction.reward_amount > 0) {
            console.log('🔍 Reward Processing Analysis:');

            if (prediction.blockchain_reward_hash) {
                console.log('   ✅ Blockchain reward hash exists');
                console.log(`   📝 Reward Hash: ${prediction.blockchain_reward_hash}`);
            } else {
                console.log('   ⚠️  No blockchain reward hash found');
                console.log('   🔄 Reward may not have been released on blockchain');
            }

            // Check if user balance was updated
            if (user.balance >= prediction.reward_amount) {
                console.log('   ✅ User balance updated correctly');
            } else {
                console.log('   ❌ User balance not updated properly');
                console.log(`   📊 Expected balance: ≥${prediction.reward_amount} NTIQ`);
                console.log(`   📊 Actual balance: ${user.balance || 0} NTIQ`);
            }
        }

        // Check reward records
        const rewardQuery = `
            SELECT 
                id,
                amount,
                description,
                created_at
            FROM rewards 
            WHERE user_id = $1 AND prediction_id = $2
            ORDER BY created_at DESC
        `;
        const rewardResult = await pool.query(rewardQuery, [user.id, prediction.id]);

        console.log('\n💰 Reward Records:');
        if (rewardResult.rows.length === 0) {
            console.log('   ❌ No reward records found');
        } else {
            rewardResult.rows.forEach((reward, index) => {
                console.log(`   📝 Reward #${index + 1}:`);
                console.log(`      Amount: ${reward.amount} NTIQ`);
                console.log(`      Description: ${reward.description}`);
                console.log(`      Created: ${new Date(reward.created_at).toLocaleString()}`);
            });
        }

        // Check balance transactions
        const balanceQuery = `
            SELECT 
                id,
                type,
                amount,
                description,
                created_at
            FROM balance_transactions 
            WHERE user_id = $1 
            AND description LIKE '%prediction%' OR description LIKE '%reward%'
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const balanceResult = await pool.query(balanceQuery, [user.id]);

        console.log('\n💳 Recent Balance Transactions:');
        if (balanceResult.rows.length === 0) {
            console.log('   ❌ No balance transactions found');
        } else {
            balanceResult.rows.forEach((transaction, index) => {
                console.log(`   📝 Transaction #${index + 1}:`);
                console.log(`      Type: ${transaction.type}`);
                console.log(`      Amount: ${transaction.amount} NTIQ`);
                console.log(`      Description: ${transaction.description}`);
                console.log(`      Created: ${new Date(transaction.created_at).toLocaleString()}`);
            });
        }

        // Final assessment
        console.log('\n🎯 FINAL ASSESSMENT:');

        if (prediction.status === 'completed' && prediction.reward_amount > 0) {
            if (user.balance >= prediction.reward_amount) {
                console.log('   ✅ Reward successfully processed and added to user balance');
            } else {
                console.log('   ❌ Reward processed but not added to user balance');
                console.log('   🔄 This may require manual intervention');
            }
        } else if (prediction.status === 'completed' && prediction.reward_amount === 0) {
            console.log('   ⚠️  Prediction completed but no reward (accuracy below threshold)');
        } else {
            console.log('   ⏳ Prediction not yet completed or processed');
        }

    } catch (error) {
        console.error('❌ Error checking reward status:', error);
    } finally {
        await pool.end();
    }
}

checkRewardStatus();
