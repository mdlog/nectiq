const { Client } = require('pg');

async function testFrontendBattles() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check all battles with detailed info
    console.log('🔍 Checking all battles with detailed info...');
    
    const battlesQuery = `
      SELECT 
        pb.id,
        pb.status,
        pb.cryptocurrency,
        pb.timeframe,
        pb.stake_amount,
        pb.challenger_prediction,
        pb.created_at,
        pb.target_time,
        pb.challenger_id,
        pb.challenged_id,
        pb.battle_type,
        pb.is_public,
        pb.blockchain_status,
        u1.username as challenger_username,
        u1.profile_photo as challenger_photo,
        u2.username as challenged_username,
        u2.profile_photo as challenged_photo
      FROM prediction_battles pb
      LEFT JOIN users u1 ON pb.challenger_id = u1.id
      LEFT JOIN users u2 ON pb.challenged_id = u2.id
      ORDER BY pb.created_at DESC
    `;

    const battles = await client.query(battlesQuery);
    
    console.log(`\n📊 Total battles in database: ${battles.rows.length}`);
    
    battles.rows.forEach((battle, index) => {
      console.log(`\n${index + 1}. Battle ID: ${battle.id}`);
      console.log(`   Status: ${battle.status}`);
      console.log(`   Crypto: ${battle.cryptocurrency}`);
      console.log(`   Timeframe: ${battle.timeframe}`);
      console.log(`   Stake: ${battle.stake_amount}`);
      console.log(`   Prediction: ${battle.challenger_prediction}`);
      console.log(`   Challenger: ${battle.challenger_username} (ID: ${battle.challenger_id})`);
      console.log(`   Challenged: ${battle.challenged_username || 'None'} (ID: ${battle.challenged_id || 'None'})`);
      console.log(`   Battle Type: ${battle.battle_type}`);
      console.log(`   Is Public: ${battle.is_public}`);
      console.log(`   Blockchain Status: ${battle.blockchain_status}`);
      console.log(`   Created: ${battle.created_at}`);
      console.log(`   Target Time: ${battle.target_time}`);
    });

    // Check open battles specifically
    const openBattles = battles.rows.filter(b => b.status === 'open');
    console.log(`\n🔓 Open battles count: ${openBattles.length}`);
    
    if (openBattles.length > 0) {
      console.log('\n🔍 Open battles details:');
      openBattles.forEach((battle, index) => {
        console.log(`\n${index + 1}. Open Battle ID: ${battle.id}`);
        console.log(`   Challenger: ${battle.challenger_username} (ID: ${battle.challenger_id})`);
        console.log(`   Crypto: ${battle.cryptocurrency} - ${battle.timeframe}`);
        console.log(`   Stake: ${battle.stake_amount} NTIQ`);
        console.log(`   Prediction: $${battle.challenger_prediction}`);
        console.log(`   Created: ${battle.created_at}`);
      });
    }

    // Test the exact query that the API uses
    console.log('\n🧪 Testing API query...');
    const apiQuery = `
      SELECT 
        pb.*,
        u1.username as challenger_username,
        u1.profile_photo as challenger_photo,
        u2.username as challenged_username,
        u2.profile_photo as challenged_photo
      FROM prediction_battles pb
      LEFT JOIN users u1 ON pb.challenger_id = u1.id
      LEFT JOIN users u2 ON pb.challenged_id = u2.id
      WHERE pb.status IN ('open', 'active')
      ORDER BY pb.created_at DESC
    `;

    const apiResult = await client.query(apiQuery);
    console.log(`✅ API query returned ${apiResult.rows.length} battles`);
    
    apiResult.rows.forEach((battle, index) => {
      console.log(`  ${index + 1}. ID: ${battle.id}, Status: ${battle.status}, Crypto: ${battle.cryptocurrency}, Challenger: ${battle.challenger_username}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testFrontendBattles();
