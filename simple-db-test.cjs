const { Client } = require('pg');

async function testDatabase() {
    const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check if prediction_battles table exists
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'prediction_battles'
      );
    `);
        console.log('📋 Table prediction_battles exists:', tableCheck.rows[0].exists);

        if (tableCheck.rows[0].exists) {
            // Get total count of battles
            const countResult = await client.query('SELECT COUNT(*) FROM prediction_battles');
            console.log('📊 Total battles in database:', countResult.rows[0].count);

            // Get recent battles
            const recentBattles = await client.query(`
        SELECT id, status, cryptocurrency, stake_amount, created_at, challenger_id, challenged_id
        FROM prediction_battles 
        ORDER BY created_at DESC 
        LIMIT 10
      `);

            console.log('📋 Recent battles:');
            recentBattles.rows.forEach((battle, index) => {
                console.log(`  ${index + 1}. ID: ${battle.id}, Status: ${battle.status}, Crypto: ${battle.cryptocurrency}, Stake: ${battle.stake_amount}, Challenger: ${battle.challenger_id}, Challenged: ${battle.challenged_id}, Created: ${battle.created_at}`);
            });

            // Get open battles specifically
            const openBattles = await client.query(`
        SELECT id, status, cryptocurrency, stake_amount, created_at, challenger_id
        FROM prediction_battles 
        WHERE status = 'open'
        ORDER BY created_at DESC
      `);

            console.log('🔓 Open battles:', openBattles.rows.length);
            openBattles.rows.forEach((battle, index) => {
                console.log(`  ${index + 1}. ID: ${battle.id}, Crypto: ${battle.cryptocurrency}, Stake: ${battle.stake_amount}, Challenger: ${battle.challenger_id}`);
            });

            // Get active battles
            const activeBattles = await client.query(`
        SELECT id, status, cryptocurrency, stake_amount, created_at, challenger_id, challenged_id
        FROM prediction_battles 
        WHERE status = 'active'
        ORDER BY created_at DESC
      `);

            console.log('⚡ Active battles:', activeBattles.rows.length);
            activeBattles.rows.forEach((battle, index) => {
                console.log(`  ${index + 1}. ID: ${battle.id}, Crypto: ${battle.cryptocurrency}, Stake: ${battle.stake_amount}, Challenger: ${battle.challenger_id}, Challenged: ${battle.challenged_id}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

testDatabase();
