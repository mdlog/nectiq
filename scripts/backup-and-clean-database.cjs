const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function backupAndCleanDatabase() {
    console.log('💾 Starting database backup and cleanup...');
    console.log('⚠️  This will backup cryptocurrencies table and clean all other data');

    // Database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    try {
        // Create backup directory
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `cryptocurrencies-backup-${timestamp}.json`);

        console.log(`📁 Backup directory: ${backupDir}`);
        console.log(`📄 Backup file: ${backupFile}`);

        // Step 1: Backup cryptocurrencies table
        console.log('\n1️⃣ Backing up cryptocurrencies table...');
        try {
            const cryptoData = await client`SELECT * FROM cryptocurrencies ORDER BY id`;
            fs.writeFileSync(backupFile, JSON.stringify(cryptoData, null, 2));
            console.log(`   ✅ Backed up ${cryptoData.length} cryptocurrency records`);
            console.log(`   📄 Saved to: ${backupFile}`);
        } catch (error) {
            console.error(`   ❌ Backup failed: ${error.message}`);
            throw error;
        }

        // Step 2: Show current data counts
        console.log('\n2️⃣ Current data counts:');
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
            'users'
        ];

        let totalRecords = 0;
        for (const table of tablesToClean) {
            try {
                const result = await client`SELECT COUNT(*) as count FROM ${client(table)}`;
                const count = parseInt(result[0]?.count || 0);
                totalRecords += count;
                console.log(`   ${table}: ${count.toLocaleString()} records`);
            } catch (error) {
                console.log(`   ${table}: Error getting count - ${error.message}`);
            }
        }

        try {
            const cryptoResult = await client`SELECT COUNT(*) as count FROM cryptocurrencies`;
            const cryptoCount = parseInt(cryptoResult[0]?.count || 0);
            console.log(`   cryptocurrencies: ${cryptoCount.toLocaleString()} records (BACKED UP & PRESERVED)`);
        } catch (error) {
            console.log(`   cryptocurrencies: Error getting count - ${error.message}`);
        }

        console.log(`\n📊 Total records to be deleted: ${totalRecords.toLocaleString()}`);

        // Step 3: Confirmation
        console.log('\n🚨 WARNING: This will permanently delete all data from the above tables!');
        console.log('🛡️  Only the cryptocurrencies table will be preserved (and backed up).');
        console.log(`💾 Backup saved to: ${backupFile}`);

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
            console.log(`💾 Backup file preserved at: ${backupFile}`);
            await client.end();
            return;
        }

        // Step 4: Clean tables in correct order (respecting foreign key constraints)
        console.log('\n3️⃣ Starting cleanup...');

        // Clean child tables first
        const childTables = [
            'prediction_reactions',
            'prediction_comments',
            'battle_spectators',
            'battle_comments',
            'battle_reactions',
            'survival_participants',
            'survival_rounds',
            'survival_predictions',
            'user_achievements',
            'user_daily_challenges',
            'monthly_tier_rewards',
            'tier_promotions',
            'parlay_prediction_coins',
            'custom_tournament_participants',
            'custom_tournament_rounds',
            'custom_tournament_predictions',
            'rewards',
            'notifications',
            'purchases',
            'referrals',
            'wallet_fingerprints',
            'abuse_detections',
            'user_analytics',
            'security_events',
            'admin_logs',
            'transaction_logs',
            'user_verifications',
            'crypto_transactions'
        ];

        // Clean parent tables
        const parentTables = [
            'predictions',
            'prediction_battles',
            'survival_tournaments',
            'parlay_predictions',
            'prediction_insurance',
            'custom_tournaments',
            'daily_challenges',
            'achievements',
            'loyalty_tiers',
            'events',
            'banners',
            'system_settings',
            'deposits',
            'withdrawals'
        ];

        // Clean users table last
        const usersTable = ['users'];

        // Clean child tables first
        console.log('   🗑️  Cleaning child tables...');
        for (const table of childTables) {
            try {
                const result = await client`DELETE FROM ${client(table)}`;
                console.log(`      ✅ ${table} cleaned`);
            } catch (error) {
                console.log(`      ❌ Error cleaning ${table}: ${error.message}`);
            }
        }

        // Clean parent tables
        console.log('   🗑️  Cleaning parent tables...');
        for (const table of parentTables) {
            try {
                const result = await client`DELETE FROM ${client(table)}`;
                console.log(`      ✅ ${table} cleaned`);
            } catch (error) {
                console.log(`      ❌ Error cleaning ${table}: ${error.message}`);
            }
        }

        // Clean users table last
        console.log('   🗑️  Cleaning users table...');
        for (const table of usersTable) {
            try {
                const result = await client`DELETE FROM ${client(table)}`;
                console.log(`      ✅ ${table} cleaned`);
            } catch (error) {
                console.log(`      ❌ Error cleaning ${table}: ${error.message}`);
            }
        }

        // Step 5: Verify cleanup
        console.log('\n4️⃣ Verifying cleanup...');
        let totalRemaining = 0;
        for (const table of tablesToClean) {
            try {
                const result = await client`SELECT COUNT(*) as count FROM ${client(table)}`;
                const count = parseInt(result[0]?.count || 0);
                totalRemaining += count;
                if (count > 0) {
                    console.log(`   ⚠️  ${table}: ${count} records remaining`);
                } else {
                    console.log(`   ✅ ${table}: 0 records`);
                }
            } catch (error) {
                console.log(`   ❌ ${table}: Error getting count - ${error.message}`);
            }
        }

        // Verify cryptocurrencies table is preserved
        try {
            const cryptoResult = await client`SELECT COUNT(*) as count FROM cryptocurrencies`;
            const cryptoCount = parseInt(cryptoResult[0]?.count || 0);
            console.log(`   ✅ cryptocurrencies: ${cryptoCount.toLocaleString()} records (PRESERVED)`);
        } catch (error) {
            console.log(`   ❌ cryptocurrencies: Error getting count - ${error.message}`);
        }

        console.log(`\n📊 Total records remaining in cleaned tables: ${totalRemaining.toLocaleString()}`);

        if (totalRemaining === 0) {
            console.log('\n🎉 Database cleanup completed successfully!');
            console.log('✅ All data has been cleared except cryptocurrencies table');
            console.log('🛡️  Pyth ID data has been preserved');
            console.log(`💾 Backup saved at: ${backupFile}`);
        } else {
            console.log('\n⚠️  Some records remain in cleaned tables');
            console.log('   You may need to manually clean remaining data');
        }

    } catch (error) {
        console.error('\n❌ Database backup and cleanup failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run the backup and cleanup
backupAndCleanDatabase()
    .then(() => {
        console.log('\n✅ Database backup and cleanup script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Database backup and cleanup script failed:', error);
        process.exit(1);
    });
