const { Client } = require('pg');

async function addBlockchainFields() {
    const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Add blockchain fields to prediction_battles table
        console.log('🔧 Adding blockchain fields...');

        const alterQueries = [
            `ALTER TABLE prediction_battles ADD COLUMN IF NOT EXISTS blockchain_battle_hash VARCHAR(66);`,
            `ALTER TABLE prediction_battles ADD COLUMN IF NOT EXISTS blockchain_accept_hash VARCHAR(66);`,
            `ALTER TABLE prediction_battles ADD COLUMN IF NOT EXISTS blockchain_resolve_hash VARCHAR(66);`,
            `ALTER TABLE prediction_battles ADD COLUMN IF NOT EXISTS blockchain_status VARCHAR(20) DEFAULT 'pending';`
        ];

        for (const query of alterQueries) {
            try {
                await client.query(query);
                console.log('✅ Executed:', query);
            } catch (error) {
                console.log('⚠️  Query failed (might already exist):', query);
                console.log('   Error:', error.message);
            }
        }

        // Verify the fields were added
        console.log('\n🔍 Verifying blockchain fields...');
        const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'prediction_battles' 
      AND column_name LIKE 'blockchain%'
      ORDER BY ordinal_position
    `);

        console.log('📋 Blockchain fields:');
        tableStructure.rows.forEach(row => {
            console.log(`  ✅ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
        });

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

addBlockchainFields();
