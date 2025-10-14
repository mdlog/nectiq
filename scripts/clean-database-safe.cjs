const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function cleanDatabaseSafe() {
    console.log('🧹 Starting SAFE database cleanup...');
    console.log('🛡️  This will preserve cryptocurrencies table (Pyth ID data)');

    // Database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });

    try {
        // Step 1: Show current data counts
        console.log('\n📊 Current database status:');

        const tablesToClean = [
            'users',
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
            'custom_tournament_predictions'
        ];

        let totalRecords = 0;
        let cryptoCount = 0;

        console.log('\n📋 Tables to be cleaned:');
        for (const table of tablesToClean) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = parseInt(result.rows[0]?.count || 0);
                totalRecords += count;
                if (count > 0) {
                    console.log(`   ❌ ${table}: ${count.toLocaleString()} records`);
                } else {
                    console.log(`   ✅ ${table}: 0 records (already clean)`);
                }
            } catch (error) {
                console.log(`   ⚠️  ${table}: Table doesn't exist or error - ${error.message}`);
            }
        }

        // Check cryptocurrencies table
        try {
            const cryptoResult = await pool.query(`SELECT COUNT(*) as count FROM cryptocurrencies`);
            cryptoCount = parseInt(cryptoResult.rows[0]?.count || 0);
            console.log(`\n🛡️  Table to preserve:`);
            console.log(`   ✅ cryptocurrencies: ${cryptoCount.toLocaleString()} records (PRESERVED - contains Pyth ID data)`);
        } catch (error) {
            console.log(`\n❌ cryptocurrencies: Error getting count - ${error.message}`);
        }

        console.log(`\n📊 Total records to be deleted: ${totalRecords.toLocaleString()}`);
        console.log(`📊 Cryptocurrencies records preserved: ${cryptoCount.toLocaleString()}`);

        if (totalRecords === 0) {
            console.log('\n✅ Database is already clean! No data to delete.');
            await client.end();
            return;
        }

        // Step 2: Confirmation
        console.log('\n🚨 WARNING: This will permanently delete all data from the above tables!');
        console.log('🛡️  Only the cryptocurrencies table will be preserved.');
        console.log('💡 This action cannot be undone!');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise((resolve) => {
            rl.question('\n❓ Are you sure you want to proceed? Type "CLEAN" to confirm: ', resolve);
        });

        rl.close();

        if (answer !== 'CLEAN') {
            console.log('❌ Database cleanup cancelled.');
            await client.end();
            return;
        }

        // Step 3: Clean tables in correct order
        console.log('\n🧹 Starting cleanup...');

        // Define cleanup order to respect foreign key constraints
        const cleanupOrder = [
            // Child tables first
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
            'crypto_transactions',

            // Parent tables
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
            'withdrawals',

            // Users table last
            'users'
        ];

        let cleanedCount = 0;
        let errorCount = 0;

        for (const table of cleanupOrder) {
            try {
                // Check if table has data
                const checkResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                const recordCount = parseInt(checkResult.rows[0]?.count || 0);

                if (recordCount > 0) {
                    console.log(`   🗑️  Cleaning ${table} (${recordCount.toLocaleString()} records)...`);
                    const result = await pool.query(`DELETE FROM ${table}`);
                    console.log(`      ✅ ${table} cleaned successfully`);
                    cleanedCount++;
                } else {
                    console.log(`   ✅ ${table} already clean`);
                }
            } catch (error) {
                console.log(`      ❌ Error cleaning ${table}: ${error.message}`);
                errorCount++;
            }
        }

        // Step 4: Verify cleanup
        console.log('\n📊 Cleanup verification:');
        let totalRemaining = 0;

        for (const table of tablesToClean) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = parseInt(result.rows[0]?.count || 0);
                totalRemaining += count;

                if (count > 0) {
                    console.log(`   ⚠️  ${table}: ${count} records remaining`);
                } else {
                    console.log(`   ✅ ${table}: 0 records`);
                }
            } catch (error) {
                console.log(`   ❌ ${table}: Error checking - ${error.message}`);
            }
        }

        // Verify cryptocurrencies table is preserved
        try {
            const cryptoResult = await pool.query(`SELECT COUNT(*) as count FROM cryptocurrencies`);
            const finalCryptoCount = parseInt(cryptoResult.rows[0]?.count || 0);
            console.log(`\n🛡️  cryptocurrencies: ${finalCryptoCount.toLocaleString()} records (PRESERVED ✅)`);

            if (finalCryptoCount === cryptoCount) {
                console.log('   ✅ Pyth ID data successfully preserved');
            } else {
                console.log('   ⚠️  Cryptocurrencies count changed - please check!');
            }
        } catch (error) {
            console.log(`   ❌ Error verifying cryptocurrencies table: ${error.message}`);
        }

        // Summary
        console.log('\n📋 Cleanup Summary:');
        console.log(`   ✅ Tables cleaned successfully: ${cleanedCount}`);
        console.log(`   ❌ Tables with errors: ${errorCount}`);
        console.log(`   📊 Records remaining: ${totalRemaining.toLocaleString()}`);
        console.log(`   🛡️  Cryptocurrencies preserved: ${cryptoCount.toLocaleString()}`);

        if (totalRemaining === 0 && errorCount === 0) {
            console.log('\n🎉 Database cleanup completed successfully!');
            console.log('✅ All user data has been cleared');
            console.log('🛡️  Pyth ID data has been preserved');
            console.log('🚀 Database is now clean and ready for fresh start');
        } else if (totalRemaining > 0) {
            console.log('\n⚠️  Some records remain in the database');
            console.log('   You may need to manually clean remaining data');
        } else {
            console.log('\n⚠️  Some tables had errors during cleanup');
            console.log('   Please check the error messages above');
        }

    } catch (error) {
        console.error('\n❌ Database cleanup failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the cleanup
cleanDatabaseSafe()
    .then(() => {
        console.log('\n✅ Database cleanup script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Database cleanup script failed:', error);
        process.exit(1);
    });
