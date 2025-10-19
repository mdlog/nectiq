const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTransactionLogs() {
    try {
        console.log('🔍 Checking Transaction Logs for GammaDragon8467...\n');

        // Get user ID
        const userQuery = `
            SELECT id, username, balance
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
        console.log(`   Current Balance: ${user.balance || 0} NTIQ\n`);

        // Check transaction logs
        const transactionQuery = `
            SELECT 
                id,
                user_id,
                transaction_type,
                amount,
                description,
                created_at
            FROM transaction_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const transactionResult = await pool.query(transactionQuery, [user.id]);

        console.log('💳 Transaction Logs:');
        if (transactionResult.rows.length === 0) {
            console.log('   ❌ No transaction logs found');
        } else {
            transactionResult.rows.forEach((transaction, index) => {
                console.log(`   📝 Transaction #${index + 1}:`);
                console.log(`      Type: ${transaction.transaction_type}`);
                console.log(`      Amount: ${transaction.amount} NTIQ`);
                console.log(`      Description: ${transaction.description}`);
                console.log(`      Created: ${new Date(transaction.created_at).toLocaleString()}`);
            });
        }

        // Check rewards table
        const rewardQuery = `
            SELECT 
                id,
                user_id,
                prediction_id,
                amount,
                description,
                created_at
            FROM rewards 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const rewardResult = await pool.query(rewardQuery, [user.id]);

        console.log('\n💰 Rewards Table:');
        if (rewardResult.rows.length === 0) {
            console.log('   ❌ No reward records found');
        } else {
            rewardResult.rows.forEach((reward, index) => {
                console.log(`   📝 Reward #${index + 1}:`);
                console.log(`      Prediction ID: ${reward.prediction_id}`);
                console.log(`      Amount: ${reward.amount} NTIQ`);
                console.log(`      Description: ${reward.description}`);
                console.log(`      Created: ${new Date(reward.created_at).toLocaleString()}`);
            });
        }

        // Check crypto transactions
        const cryptoQuery = `
            SELECT 
                id,
                user_id,
                transaction_type,
                amount,
                token_type,
                description,
                created_at
            FROM crypto_transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const cryptoResult = await pool.query(cryptoQuery, [user.id]);

        console.log('\n🪙 Crypto Transactions:');
        if (cryptoResult.rows.length === 0) {
            console.log('   ❌ No crypto transactions found');
        } else {
            cryptoResult.rows.forEach((transaction, index) => {
                console.log(`   📝 Transaction #${index + 1}:`);
                console.log(`      Type: ${transaction.transaction_type}`);
                console.log(`      Amount: ${transaction.amount} NTIQ`);
                console.log(`      Token: ${transaction.token_type || 'NTIQ'}`);
                console.log(`      Description: ${transaction.description}`);
                console.log(`      Created: ${new Date(transaction.created_at).toLocaleString()}`);
            });
        }

        // Check if blockchain reward was processed
        const predictionQuery = `
            SELECT 
                id,
                blockchain_reward_hash,
                reward_amount,
                status
            FROM predictions 
            WHERE user_id = $1 AND cryptocurrency = 'binancecoin'
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const predictionResult = await pool.query(predictionQuery, [user.id]);

        if (predictionResult.rows.length > 0) {
            const prediction = predictionResult.rows[0];
            console.log('\n🔗 Blockchain Status:');
            console.log(`   Prediction ID: ${prediction.id}`);
            console.log(`   Status: ${prediction.status}`);
            console.log(`   Reward Amount: ${prediction.reward_amount} NTIQ`);
            console.log(`   Blockchain Reward Hash: ${prediction.blockchain_reward_hash || 'None'}`);

            if (!prediction.blockchain_reward_hash && prediction.reward_amount > 0) {
                console.log('\n⚠️  ISSUE IDENTIFIED:');
                console.log('   ❌ Reward processed in database but NOT on blockchain');
                console.log('   🔄 Blockchain reward hash is missing');
                console.log('   💡 This means reward is in database balance but not in wallet');
            }
        }

    } catch (error) {
        console.error('❌ Error checking transaction logs:', error);
    } finally {
        await pool.end();
    }
}

checkTransactionLogs();
