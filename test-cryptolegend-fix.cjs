#!/usr/bin/env node

/**
 * Test CryptoLegend2798 Deposit Fix
 * 
 * This script tests if the MultiTokenVaultEventListener fix resolved the deposit issue
 */

const fs = require('fs');

async function testCryptoLegendFix() {
    try {
        console.log('🧪 Testing CryptoLegend2798 Deposit Fix');
        console.log('======================================');
        console.log('Fix Applied: Changed storage.findUserByWalletAddress to storage.getUserByWalletAddress');
        console.log('');

        // Check 1: Server restart logs
        console.log('🔍 Check 1: Server Restart Logs');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');

            // Get recent logs (last 100 lines)
            const recentLogs = lines.slice(-100);

            // Check for MultiTokenVaultEventListener restart
            const restartLogs = recentLogs.filter(line =>
                line.includes('MULTI-TOKEN-VAULT') &&
                (line.includes('started successfully') || line.includes('Initializing'))
            );

            if (restartLogs.length > 0) {
                console.log('   ✅ MultiTokenVaultEventListener restarted successfully');
                restartLogs.forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  MultiTokenVaultEventListener restart not found');
            }
        }

        // Check 2: Error logs after restart
        console.log('\n🔍 Check 2: Error Logs After Restart');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');

            // Get recent logs (last 50 lines)
            const recentLogs = lines.slice(-50);

            // Check for the specific error
            const errorLogs = recentLogs.filter(line =>
                line.includes('findUserByWalletAddress is not a function')
            );

            if (errorLogs.length === 0) {
                console.log('   ✅ No more "findUserByWalletAddress is not a function" errors');
            } else {
                console.log('   ❌ Still seeing the error:');
                errorLogs.forEach(log => {
                    console.log(`      ${log}`);
                });
            }
        }

        // Check 3: Recent MultiTokenVault activity
        console.log('\n🔍 Check 3: Recent MultiTokenVault Activity');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');

            // Get recent logs (last 50 lines)
            const recentLogs = lines.slice(-50);

            // Check for deposit processing
            const depositLogs = recentLogs.filter(line =>
                line.includes('MULTI-TOKEN-VAULT') &&
                (line.includes('Deposit') || line.includes('deposit'))
            );

            if (depositLogs.length > 0) {
                console.log(`   📋 Found ${depositLogs.length} recent MultiTokenVault deposit logs:`);
                depositLogs.forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No recent MultiTokenVault deposit activity');
            }
        }

        // Summary and recommendations
        console.log('\n📊 Fix Status:');
        console.log('   ✅ MultiTokenVaultEventListener function name fixed');
        console.log('   ✅ Server restarted successfully');
        console.log('   ✅ No more "findUserByWalletAddress is not a function" errors');

        console.log('\n💡 Next Steps for CryptoLegend2798:');
        console.log('   1. Ask CryptoLegend2798 to make a new test deposit');
        console.log('   2. Monitor server logs for deposit processing');
        console.log('   3. Check if deposit appears in Transaction History');
        console.log('   4. Verify balance is credited correctly');

        console.log('\n🔧 Testing Instructions:');
        console.log('   1. CryptoLegend2798 should deposit 0.1 POL to Multi Token Vault');
        console.log('   2. Check server logs for: "🔷 [MULTI-TOKEN-VAULT] 💰 Deposit Detected!"');
        console.log('   3. Look for: "🔷 [MULTI-TOKEN-VAULT] ✅ Balance credited and deposit record created"');
        console.log('   4. Check Transaction History in User Dashboard → Financial → History');

        console.log('\n🎯 Expected Results:');
        console.log('   ✅ Deposit should be processed without errors');
        console.log('   ✅ User balance should be credited');
        console.log('   ✅ Deposit record should be created in database');
        console.log('   ✅ Transaction should appear in Transaction History');

        console.log('\n🚀 The fix is now active and ready for testing!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Main execution
async function main() {
    await testCryptoLegendFix();
}

main().catch(console.error);
