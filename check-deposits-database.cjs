#!/usr/bin/env node

/**
 * Check Deposits in Database
 * 
 * This script checks if there are deposits in the database
 */

const postgres = require('postgres');

// Load environment variables
require('dotenv').config();

async function checkDepositsInDatabase() {
    let sql;

    try {
        console.log('🔍 Checking Deposits in Database');
        console.log('================================');

        // Connect to database
        sql = postgres({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'nectiq',
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
        });

        console.log('✅ Connected to database');

        // Check deposits table
        console.log('\n🔍 Checking deposits table...');
        const deposits = await sql`
            SELECT 
                id,
                "userId",
                "tokenType",
                "amountUSD",
                status,
                "transactionHash",
                "createdAt",
                "processedAt"
            FROM deposits 
            ORDER BY "createdAt" DESC 
            LIMIT 10
        `;

        console.log(`📊 Found ${deposits.length} deposits in database`);

        if (deposits.length > 0) {
            console.log('\n📋 Recent deposits:');
            deposits.forEach((deposit, index) => {
                console.log(`   ${index + 1}. ID: ${deposit.id}`);
                console.log(`      User ID: ${deposit.userId}`);
                console.log(`      Token: ${deposit.tokenType}`);
                console.log(`      Amount: ${deposit.amountUSD} USD`);
                console.log(`      Status: ${deposit.status}`);
                console.log(`      Hash: ${deposit.transactionHash || 'N/A'}`);
                console.log(`      Created: ${deposit.createdAt}`);
                console.log(`      Processed: ${deposit.processedAt || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('   ⚠️  No deposits found in database');
        }

        // Check withdrawals table
        console.log('\n🔍 Checking withdrawals table...');
        const withdrawals = await sql`
            SELECT 
                id,
                "userId",
                "tokenType",
                amount,
                status,
                "transactionHash",
                "createdAt"
            FROM withdrawals 
            ORDER BY "createdAt" DESC 
            LIMIT 10
        `;

        console.log(`📊 Found ${withdrawals.length} withdrawals in database`);

        if (withdrawals.length > 0) {
            console.log('\n📋 Recent withdrawals:');
            withdrawals.forEach((withdrawal, index) => {
                console.log(`   ${index + 1}. ID: ${withdrawal.id}`);
                console.log(`      User ID: ${withdrawal.userId}`);
                console.log(`      Token: ${withdrawal.tokenType}`);
                console.log(`      Amount: ${withdrawal.amount}`);
                console.log(`      Status: ${withdrawal.status}`);
                console.log(`      Hash: ${withdrawal.transactionHash || 'N/A'}`);
                console.log(`      Created: ${withdrawal.createdAt}`);
                console.log('');
            });
        } else {
            console.log('   ⚠️  No withdrawals found in database');
        }

        // Check users table
        console.log('\n🔍 Checking users table...');
        const users = await sql`
            SELECT 
                id,
                username,
                uid,
                "walletAddress",
                "createdAt"
            FROM users 
            ORDER BY "createdAt" DESC 
            LIMIT 5
        `;

        console.log(`📊 Found ${users.length} users in database`);

        if (users.length > 0) {
            console.log('\n📋 Recent users:');
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ID: ${user.id}`);
                console.log(`      Username: ${user.username}`);
                console.log(`      UID: ${user.uid}`);
                console.log(`      Wallet: ${user.walletAddress}`);
                console.log(`      Created: ${user.createdAt}`);
                console.log('');
            });
        }

        // Summary
        console.log('\n📊 Database Summary:');
        console.log(`   Deposits: ${deposits.length}`);
        console.log(`   Withdrawals: ${withdrawals.length}`);
        console.log(`   Users: ${users.length}`);

        if (deposits.length === 0 && withdrawals.length === 0) {
            console.log('\n💡 Recommendations:');
            console.log('   1. Make a test deposit to create data');
            console.log('   2. Check if MultiTokenVaultEventListener is working');
            console.log('   3. Verify deposit events are being processed');
        } else {
            console.log('\n✅ Database has transaction data');
            console.log('   Transaction History component should display this data');
        }

    } catch (error) {
        console.error('\n❌ Database Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Check database connection settings');
        console.log('   2. Verify database is running');
        console.log('   3. Check environment variables');
    } finally {
        if (sql) {
            await sql.end();
        }
    }
}

// Main execution
async function main() {
    await checkDepositsInDatabase();
}

main().catch(console.error);
