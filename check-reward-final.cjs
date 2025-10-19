const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkRewardFinal() {
    try {
        console.log('🔍 Final Reward Status Check for GammaDragon8467...\n');

        // Get user info
        const userQuery = `
            SELECT id, username, balance, total_rewards
            FROM users 
            WHERE username = 'GammaDragon8467'
        `;
        const userResult = await pool.query(userQuery);

        if (userResult.rows.length === 0) {
            console.log('❌ User not found');
            return;
        }

        const user = userResult.rows[0];
        console.log('👤 User Info:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Current Balance: ${user.balance || 0} NTIQ`);
        console.log(`   Total Rewards: ${user.total_rewards || 0} NTIQ\n`);

        // Check rewards table
        const rewardQuery = `
            SELECT 
                id,
                user_id,
                prediction_id,
                amount,
                cryptocurrency,
                accuracy,
                description,
                created_at
            FROM rewards 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const rewardResult = await pool.query(rewardQuery, [user.id]);

        console.log('💰 Rewards Table:');
        if (rewardResult.rows.length === 0) {
            console.log('   ❌ No reward records found');
        } else {
            rewardResult.rows.forEach((reward, index) => {
                console.log(`   📝 Reward #${index + 1}:`);
                console.log(`      Prediction ID: ${reward.prediction_id}`);
                console.log(`      Amount: ${reward.amount} NTIQ`);
                console.log(`      Cryptocurrency: ${reward.cryptocurrency}`);
                console.log(`      Accuracy: ${reward.accuracy}%`);
                console.log(`      Description: ${reward.description}`);
                console.log(`      Created: ${new Date(reward.created_at).toLocaleString()}`);
            });
        }

        // Check transaction logs
        const transactionQuery = `
            SELECT 
                id,
                user_id,
                type,
                amount,
                token,
                status,
                hash,
                created_at
            FROM transaction_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const transactionResult = await pool.query(transactionQuery, [user.id]);

        console.log('\n💳 Transaction Logs:');
        if (transactionResult.rows.length === 0) {
            console.log('   ❌ No transaction logs found');
        } else {
            transactionResult.rows.forEach((transaction, index) => {
                console.log(`   📝 Transaction #${index + 1}:`);
                console.log(`      Type: ${transaction.type}`);
                console.log(`      Amount: ${transaction.amount} NTIQ`);
                console.log(`      Token: ${transaction.token || 'NTIQ'}`);
                console.log(`      Status: ${transaction.status}`);
                console.log(`      Hash: ${transaction.hash || 'None'}`);
                console.log(`      Created: ${new Date(transaction.created_at).toLocaleString()}`);
            });
        }

        // Check prediction details
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

        if (predictionResult.rows.length > 0) {
            const prediction = predictionResult.rows[0];
            console.log('\n📊 BNB Prediction Details:');
            console.log(`   ID: ${prediction.id}`);
            console.log(`   Status: ${prediction.status}`);
            console.log(`   Blockchain Status: ${prediction.blockchain_status}`);
            console.log(`   Predicted Price: $${prediction.predicted_price}`);
            console.log(`   Actual Price: $${prediction.actual_price}`);
            console.log(`   Accuracy: ${prediction.accuracy}%`);
            console.log(`   Stake Amount: ${prediction.stake_amount} NTIQ`);
            console.log(`   Reward Amount: ${prediction.reward_amount} NTIQ`);
            console.log(`   Completed At: ${new Date(prediction.completed_at).toLocaleString()}`);
            console.log(`   Blockchain Stake Hash: ${prediction.blockchain_stake_hash}`);
            console.log(`   Blockchain Reward Hash: ${prediction.blockchain_reward_hash || 'None'}`);
        }

        // Final analysis
        console.log('\n🎯 FINAL ANALYSIS:');

        if (user.balance >= 100 && user.total_rewards >= 100) {
            console.log('   ✅ User balance and total rewards are correct');
            console.log('   ✅ Reward has been processed in database');

            if (predictionResult.rows.length > 0) {
                const prediction = predictionResult.rows[0];
                if (!prediction.blockchain_reward_hash) {
                    console.log('   ⚠️  ISSUE: No blockchain reward hash found');
                    console.log('   🔄 This means reward is in database but not released on blockchain');
                    console.log('   💡 User sees balance in app but tokens not in actual wallet');
                } else {
                    console.log('   ✅ Blockchain reward hash exists');
                    console.log('   ✅ Reward fully processed on blockchain');
                }
            }
        } else {
            console.log('   ❌ User balance or total rewards incorrect');
            console.log('   🔄 Reward may not have been processed properly');
        }

    } catch (error) {
        console.error('❌ Error checking reward status:', error);
    } finally {
        await pool.end();
    }
}

checkRewardFinal();
