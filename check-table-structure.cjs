const { Client } = require('pg');

async function checkTableStructure() {
    const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check table structure
        const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'prediction_battles'
      ORDER BY ordinal_position
    `);

        console.log('📋 prediction_battles table structure:');
        tableStructure.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
        });

        // Check if blockchain fields exist
        const blockchainFields = tableStructure.rows.filter(row =>
            row.column_name.includes('blockchain') ||
            row.column_name.includes('join_deadline') ||
            row.column_name.includes('price_at_creation')
        );

        console.log('\n🔗 Blockchain and related fields:');
        if (blockchainFields.length > 0) {
            blockchainFields.forEach(row => {
                console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
            });
        } else {
            console.log('  ❌ No blockchain fields found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkTableStructure();
