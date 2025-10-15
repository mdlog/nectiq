const { Client } = require('pg');

async function testDetailedBattle() {
    const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Get detailed battle information
        const battleDetails = await client.query(`
      SELECT 
        id, status, cryptocurrency, timeframe, stake_amount, 
        challenger_prediction, challenged_prediction, 
        target_time, created_at, accepted_at, completed_at,
        challenger_id, challenged_id, battle_type, is_public,
        join_deadline, minimum_join_time, price_at_creation,
        price_movement_penalty, fairness_multiplier, join_time_bonus,
        blockchain_battle_hash, blockchain_accept_hash, blockchain_status
      FROM prediction_battles 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

        if (battleDetails.rows.length > 0) {
            const battle = battleDetails.rows[0];
            console.log('📋 Detailed battle information:');
            console.log('  ID:', battle.id);
            console.log('  Status:', battle.status);
            console.log('  Cryptocurrency:', battle.cryptocurrency);
            console.log('  Timeframe:', battle.timeframe);
            console.log('  Stake Amount:', battle.stake_amount);
            console.log('  Challenger Prediction:', battle.challenger_prediction);
            console.log('  Challenged Prediction:', battle.challenged_prediction);
            console.log('  Target Time:', battle.target_time);
            console.log('  Created At:', battle.created_at);
            console.log('  Challenger ID:', battle.challenger_id);
            console.log('  Challenged ID:', battle.challenged_id);
            console.log('  Battle Type:', battle.battle_type);
            console.log('  Is Public:', battle.is_public);
            console.log('  Join Deadline:', battle.join_deadline);
            console.log('  Minimum Join Time:', battle.minimum_join_time);
            console.log('  Price At Creation:', battle.price_at_creation);
            console.log('  Price Movement Penalty:', battle.price_movement_penalty);
            console.log('  Fairness Multiplier:', battle.fairness_multiplier);
            console.log('  Join Time Bonus:', battle.join_time_bonus);
            console.log('  Blockchain Battle Hash:', battle.blockchain_battle_hash);
            console.log('  Blockchain Accept Hash:', battle.blockchain_accept_hash);
            console.log('  Blockchain Status:', battle.blockchain_status);
        }

        // Check table structure
        const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'prediction_battles'
      ORDER BY ordinal_position
    `);

        console.log('\n📋 Table structure:');
        tableStructure.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

testDetailedBattle();
