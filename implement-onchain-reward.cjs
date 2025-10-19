const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function implementOnChainReward() {
    try {
        console.log('🔗 Implementing Real On-Chain Reward System...\n');

        // Get user and prediction info
        const query = `
            SELECT 
                u.id as user_id,
                u.username,
                u.wallet_address,
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
        console.log('📊 Prediction Data:');
        console.log(`   User: ${data.username}`);
        console.log(`   Wallet: ${data.wallet_address}`);
        console.log(`   Prediction ID: ${data.prediction_id}`);
        console.log(`   Actual Price: $${data.actual_price}`);
        console.log(`   Reward Amount: ${data.reward_amount} NTIQ\n`);

        // Call the actual blockchain service via API
        console.log('🚀 Calling blockchain service to release reward...');

        try {
            // Use the existing blockchain service endpoint
            const response = await fetch('http://localhost:5003/api/predictions/blockchain-release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Buffer.from('admin').toString('base64')}`
                },
                body: JSON.stringify({
                    predictionId: data.prediction_id,
                    actualPrice: data.actual_price,
                    userAddress: data.wallet_address
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ On-chain reward release successful!');
                console.log(`   Transaction Hash: ${result.transactionHash || result.hash}`);
                console.log(`   Block Number: ${result.blockNumber || 'N/A'}`);
                console.log(`   Gas Used: ${result.gasUsed || 'N/A'}`);

                // Update database with real blockchain hash
                const updateQuery = `
                    UPDATE predictions 
                    SET blockchain_reward_hash = $1
                    WHERE id = $2
                `;

                await pool.query(updateQuery, [result.transactionHash || result.hash, data.prediction_id]);
                console.log('✅ Database updated with real blockchain hash');

            } else {
                const error = await response.text();
                console.log('❌ Blockchain service call failed');
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${error}`);

                // Fallback: Use prediction processing endpoint
                console.log('\n🔄 Trying fallback method...');
                await fallbackRewardRelease(data);
            }

        } catch (fetchError) {
            console.log('❌ API call failed, trying fallback method...');
            console.log(`   Error: ${fetchError.message}`);
            await fallbackRewardRelease(data);
        }

    } catch (error) {
        console.error('❌ Error implementing on-chain reward:', error);
    } finally {
        await pool.end();
    }
}

async function fallbackRewardRelease(data) {
    try {
        console.log('🔄 Using fallback method...');

        // Call the prediction processing endpoint which includes blockchain reward release
        const response = await fetch('http://localhost:5003/api/predictions/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Fallback reward processing successful!');
            console.log(`   Message: ${result.message}`);

            // Check if reward hash was updated
            const checkQuery = `
                SELECT blockchain_reward_hash
                FROM predictions 
                WHERE id = $1
            `;
            const checkResult = await pool.query(checkQuery, [data.prediction_id]);

            if (checkResult.rows.length > 0) {
                const rewardHash = checkResult.rows[0].blockchain_reward_hash;
                if (rewardHash && rewardHash !== '0xf91d3c65ef489') {
                    console.log('✅ Real blockchain reward hash found!');
                    console.log(`   Hash: ${rewardHash}`);
                } else {
                    console.log('⚠️  Reward hash not updated by fallback method');
                }
            }

        } else {
            console.log('❌ Fallback method also failed');
            const error = await response.text();
            console.log(`   Error: ${error}`);
        }

    } catch (error) {
        console.error('❌ Fallback method error:', error);
    }
}

implementOnChainReward();
