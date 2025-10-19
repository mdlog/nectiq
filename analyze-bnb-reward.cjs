const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeBNBReward() {
    try {
        console.log('🔍 Analyzing BNB Prediction Reward for GammaDragon8467...\n');

        // Get the specific BNB prediction
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
            WHERE id = 4
        `;
        const predictionResult = await pool.query(predictionQuery);

        if (predictionResult.rows.length === 0) {
            console.log('❌ Prediction not found');
            return;
        }

        const prediction = predictionResult.rows[0];
        const now = new Date();
        const targetTime = new Date(prediction.target_time);
        const timeLeft = Math.max(0, targetTime - now);
        const minutesLeft = Math.floor(timeLeft / (1000 * 60));
        const isExpired = timeLeft <= 0;

        console.log('📊 Prediction Details:');
        console.log(`   ID: ${prediction.id}`);
        console.log(`   Cryptocurrency: ${prediction.cryptocurrency} (BNB)`);
        console.log(`   Predicted Price: $${prediction.predicted_price}`);
        console.log(`   Timeframe: ${prediction.timeframe}`);
        console.log(`   Stake Amount: ${prediction.stake_amount} NTIQ`);
        console.log(`   Status: ${prediction.status}`);
        console.log(`   Blockchain Status: ${prediction.blockchain_status}`);
        console.log(`   Target Time: ${targetTime.toLocaleString()}`);
        console.log(`   Current Time: ${now.toLocaleString()}`);
        console.log(`   Time Left: ${minutesLeft} minutes`);
        console.log(`   Is Expired: ${isExpired ? 'Yes' : 'No'}\n`);

        // Check current BNB price from database
        const priceQuery = `
            SELECT current_price, last_updated
            FROM cryptocurrencies 
            WHERE id = 'binancecoin' OR symbol = 'BNB'
        `;
        const priceResult = await pool.query(priceQuery);

        let currentPrice = null;
        if (priceResult.rows.length > 0) {
            currentPrice = parseFloat(priceResult.rows[0].current_price);
            console.log(`💰 Current BNB Price: $${currentPrice}`);
            console.log(`   Last Updated: ${new Date(priceResult.rows[0].last_updated).toLocaleString()}\n`);
        } else {
            console.log('❌ BNB price not found in database\n');
        }

        // Calculate accuracy and potential reward
        if (currentPrice && prediction.predicted_price) {
            const predictedPrice = parseFloat(prediction.predicted_price);
            const accuracy = Math.max(0, 100 - Math.abs((currentPrice - predictedPrice) / predictedPrice) * 100);

            console.log('🎯 Accuracy Analysis:');
            console.log(`   Predicted: $${predictedPrice}`);
            console.log(`   Current: $${currentPrice}`);
            console.log(`   Difference: $${Math.abs(currentPrice - predictedPrice).toFixed(2)}`);
            console.log(`   Accuracy: ${accuracy.toFixed(2)}%\n`);

            // Determine if user will get reward
            const minAccuracyThreshold = 90; // From the code analysis
            const willGetReward = accuracy >= minAccuracyThreshold;

            console.log('🏆 Reward Eligibility Analysis:');
            console.log(`   Minimum Accuracy Required: ${minAccuracyThreshold}%`);
            console.log(`   User's Accuracy: ${accuracy.toFixed(2)}%`);
            console.log(`   Will Get Reward: ${willGetReward ? '✅ YES' : '❌ NO'}\n`);

            if (willGetReward) {
                // Calculate potential reward amount
                const stakeAmount = prediction.stake_amount;
                let multiplier = 1;

                // Basic reward calculation (simplified)
                if (accuracy >= 95) multiplier = 2;
                else if (accuracy >= 90) multiplier = 1.5;

                const potentialReward = stakeAmount * multiplier;

                console.log('💰 Potential Reward Calculation:');
                console.log(`   Stake Amount: ${stakeAmount} NTIQ`);
                console.log(`   Accuracy Multiplier: ${multiplier}x`);
                console.log(`   Potential Reward: ${potentialReward} NTIQ\n`);
            }
        }

        // Check if reward processing is needed
        console.log('⚙️ Reward Processing Status:');

        if (prediction.blockchain_status === 'confirmed' && prediction.blockchain_stake_hash) {
            console.log('   ✅ Blockchain transaction confirmed');
            console.log('   ✅ Stake hash available');

            if (isExpired && prediction.status === 'pending') {
                console.log('   ⚠️  Prediction has expired but status is still pending');
                console.log('   🔄 Reward processing should be triggered soon');
            } else if (prediction.status === 'completed') {
                if (prediction.blockchain_reward_hash) {
                    console.log('   ✅ Reward already processed and paid');
                    console.log(`   📝 Reward Hash: ${prediction.blockchain_reward_hash}`);
                } else {
                    console.log('   ⚠️  Prediction completed but reward hash missing');
                }
            } else if (prediction.status === 'pending' && !isExpired) {
                console.log('   ⏳ Prediction still active, reward processing pending');
            }
        } else {
            console.log('   ❌ Blockchain transaction not confirmed');
            console.log('   ❌ No stake hash available');
            console.log('   ⚠️  This prediction may not be eligible for rewards');
        }

        // Final assessment
        console.log('\n🎯 FINAL ASSESSMENT:');
        if (prediction.blockchain_status === 'confirmed' && prediction.blockchain_stake_hash) {
            if (isExpired) {
                console.log('   ✅ Prediction is eligible for reward processing');
                console.log('   🔄 Reward should be processed automatically by the system');
                console.log('   ⏰ Processing typically happens within a few minutes after expiry');
            } else {
                console.log('   ⏳ Prediction is still active');
                console.log('   🔄 Reward processing will happen when prediction expires');
            }
        } else {
            console.log('   ❌ Prediction is NOT eligible for rewards');
            console.log('   ⚠️  Missing blockchain confirmation or stake hash');
        }

    } catch (error) {
        console.error('❌ Error analyzing BNB reward:', error);
    } finally {
        await pool.end();
    }
}

analyzeBNBReward();
