const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

async function cleanDatabase() {
    console.log('🧹 Starting database cleanup...');
    console.log('⚠️  This will delete ALL data except cryptocurrencies table (Pyth ID data)');

    // Database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    try {
        // List of tables to clean (excluding cryptocurrencies)
        const tablesToClean = [
            'predictions',
            'rewards',
            'notifications',
            'deposits',
            'withdrawals',
            'purchases',
            'achievements',
            'user_achievements',
            'daily_challenges',
            'user_daily_challenges',
            'user_analytics',
            'security_events',
            'admin_logs',
            'system_settings',
            'transaction_logs',
            'user_verifications',
            'crypto_transactions',
            'referrals',
            'banners',
            'prediction_reactions',
            'prediction_comments',
            'events',
            'wallet_fingerprints',
            'abuse_detections',
            'prediction_battles',
            'battle_spectators',
            'battle_comments',
            'battle_reactions',
            'survival_tournaments',
            'survival_participants',
            'survival_rounds',
            'survival_predictions',
            'loyalty_tiers',
            'monthly_tier_rewards',
            'tier_promotions',
            'parlay_predictions',
            'parlay_prediction_coins',
            'prediction_insurance',
            'custom_tournaments',
            'custom_tournament_participants',
            'custom_tournament_rounds',
            'custom_tournament_predictions',
            'users' // Clean users table but keep structure
        ];

        console.log('\n📋 Tables to clean:');
        tablesToClean.forEach(table => {
            console.log(`   - ${table}`);
        });

        console.log('\n🛡️  Tables to preserve:');
        console.log('   - cryptocurrencies (contains Pyth ID data)');

        // Get current data count before cleanup
        console.log('\n📊 Current data counts:');
        for (const table of tablesToClean) {
            try {
                const result = await client`SELECT COUNT(*) as count FROM ${client(table)}`;
                const count = result[0]?.count || 0;
                console.log(`   ${table}: ${count} records`);
            } catch (error) {
                console.log(`   ${table}: Error getting count - ${error.message}`);
            }
        }

        // Check cryptocurrencies table count
        try {
            const cryptoResult = await client`SELECT COUNT(*) as count FROM cryptocurrencies`;
            const cryptoCount = cryptoResult[0]?.count || 0;
            console.log(`   cryptocurrencies: ${cryptoCount} records (PRESERVED)`);
        } catch (error) {
            console.log(`   cryptocurrencies: Error getting count - ${error.message}`);
        }

        console.log('\n🚨 WARNING: This will permanently delete all data from the above tables!');
        console.log('🛡️  Only the cryptocurrencies table will be preserved.');

        // Confirm before proceeding
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise((resolve) => {
            rl.question('\n❓ Are you sure you want to proceed? Type "YES" to confirm: ', resolve);
        });

        rl.close();

        if (answer !== 'YES') {
            console.log('❌ Database cleanup cancelled.');
            await client.end();
            return;
        }

        console.log('\n🧹 Starting cleanup...');

        // Clean tables one by one
        for (const table of tablesToClean) {
            try {
                console.log(`🗑️  Cleaning ${table}...`);

                // For tables with foreign key constraints, disable them temporarily
                if (['users'].includes(table)) {
                    // For users table, we need to clean other tables first
                    continue;
                }

                const result = await client`DELETE FROM ${client(table)}`;
                console.log(`   ✅ ${table} cleaned`);
            } catch (error) {
                console.log(`   ❌ Error cleaning ${table}: ${error.message}`);
            }
        }

        // Clean users table last (since it has foreign key references)
        try {
            console.log(`🗑️  Cleaning users table...`);
            const result = await client`DELETE FROM users`;
            console.log(`   ✅ users table cleaned`);
        } catch (error) {
            console.log(`   ❌ Error cleaning users table: ${error.message}`);
        }

        // Verify cleanup
        console.log('\n📊 Data counts after cleanup:');
        for (const table of tablesToClean) {
            try {
                const result = await client`SELECT COUNT(*) as count FROM ${client(table)}`;
                const count = result[0]?.count || 0;
                console.log(`   ${table}: ${count} records`);
            } catch (error) {
                console.log(`   ${table}: Error getting count - ${error.message}`);
            }
        }

        // Verify cryptocurrencies table is preserved
        try {
            const cryptoResult = await client`SELECT COUNT(*) as count FROM cryptocurrencies`;
            const cryptoCount = cryptoResult[0]?.count || 0;
            console.log(`   cryptocurrencies: ${cryptoCount} records (PRESERVED ✅)`);
        } catch (error) {
            console.log(`   cryptocurrencies: Error getting count - ${error.message}`);
        }

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log('✅ All data has been cleared except cryptocurrencies table');
        console.log('🛡️  Pyth ID data has been preserved');

    } catch (error) {
        console.error('\n❌ Database cleanup failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run the cleanup
cleanDatabase()
    .then(() => {
        console.log('\n✅ Database cleanup script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Database cleanup script failed:', error);
        process.exit(1);
    });
