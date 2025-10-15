const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nectiq';
const client = postgres(connectionString);
const db = drizzle(client);

// Simple schema for debugging
const predictions = {
    id: 'id',
    userId: 'user_id',
    cryptocurrency: 'cryptocurrency',
    predictedPrice: 'predicted_price',
    stakeAmount: 'stake_amount',
    status: 'status',
    createdAt: 'created_at',
    blockchainStakeHash: 'blockchain_stake_hash'
};

const users = {
    id: 'id',
    username: 'username'
};

async function checkPredictions() {
    try {
        console.log('🔍 Checking recent predictions...\n');

        // Get recent predictions
        const recentPreds = await client`
      SELECT 
        p.id,
        p.user_id,
        u.username,
        p.cryptocurrency,
        p.predicted_price,
        p.stake_amount,
        p.status,
        p.created_at,
        p.blockchain_stake_hash
      FROM predictions p
      INNER JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

        console.log('📊 Recent Predictions:');
        if (recentPreds.length === 0) {
            console.log('❌ No predictions found');
        } else {
            recentPreds.forEach((pred, index) => {
                console.log(`${index + 1}. ID: ${pred.id} | User: ${pred.username} | Crypto: ${pred.cryptocurrency} | Status: ${pred.status} | Created: ${pred.created_at}`);
                if (pred.blockchain_stake_hash) {
                    console.log(`   Blockchain TX: ${pred.blockchain_stake_hash}`);
                }
            });
        }

        console.log('\n🔍 Checking UltraWolf5637 predictions...\n');

        // Check for UltraWolf5637 specifically
        const ultraWolfPreds = await client`
      SELECT 
        p.id,
        p.user_id,
        u.username,
        p.cryptocurrency,
        p.predicted_price,
        p.stake_amount,
        p.status,
        p.created_at,
        p.blockchain_stake_hash
      FROM predictions p
      INNER JOIN users u ON p.user_id = u.id
      WHERE u.username = 'UltraWolf5637'
      ORDER BY p.created_at DESC
    `;

        console.log('🐺 UltraWolf5637 Predictions:');
        if (ultraWolfPreds.length === 0) {
            console.log('❌ No predictions found for UltraWolf5637');
        } else {
            ultraWolfPreds.forEach((pred, index) => {
                console.log(`${index + 1}. ID: ${pred.id} | Crypto: ${pred.cryptocurrency} | Status: ${pred.status} | Created: ${pred.created_at}`);
                if (pred.blockchain_stake_hash) {
                    console.log(`   Blockchain TX: ${pred.blockchain_stake_hash}`);
                }
            });
        }

        console.log('\n🔍 Checking active predictions (status = pending)...\n');

        // Check active predictions
        const activePreds = await client`
      SELECT 
        p.id,
        p.user_id,
        u.username,
        p.cryptocurrency,
        p.predicted_price,
        p.stake_amount,
        p.status,
        p.created_at,
        p.blockchain_stake_hash
      FROM predictions p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `;

        console.log('⏰ Active Predictions:');
        if (activePreds.length === 0) {
            console.log('❌ No active predictions found');
        } else {
            activePreds.forEach((pred, index) => {
                console.log(`${index + 1}. ID: ${pred.id} | User: ${pred.username} | Crypto: ${pred.cryptocurrency} | Status: ${pred.status} | Created: ${pred.created_at}`);
                if (pred.blockchain_stake_hash) {
                    console.log(`   Blockchain TX: ${pred.blockchain_stake_hash}`);
                }
            });
        }

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPredictions();
