#!/usr/bin/env node

/**
 * Debug Withdrawal History Issue
 * 
 * This script helps debug why withdrawal history is not showing
 */

const fs = require('fs');

async function debugWithdrawalHistory() {
    try {
        console.log('🔍 Debugging Withdrawal History Issue');
        console.log('====================================');
        console.log('Status: Deposit history working, withdrawal history not showing');
        console.log('');

        // Check 1: Server logs for withdrawal activity
        console.log('🔍 Check 1: Withdrawal Activity in Server Logs');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');

            // Search for withdrawal related logs
            const withdrawalLogs = lines.filter(line =>
                line.toLowerCase().includes('withdrawal') ||
                line.includes('WITHDRAWAL') ||
                line.includes('withdraw')
            );

            if (withdrawalLogs.length > 0) {
                console.log(`   📋 Found ${withdrawalLogs.length} withdrawal related logs:`);
                withdrawalLogs.slice(-10).forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No withdrawal related logs found');
            }

            // Search for MultiTokenVault withdrawal processing
            const multiTokenWithdrawalLogs = lines.filter(line =>
                line.includes('MULTI-TOKEN-VAULT') &&
                (line.includes('withdrawal') || line.includes('Withdrawal'))
            );

            if (multiTokenWithdrawalLogs.length > 0) {
                console.log(`\n   📋 Found ${multiTokenWithdrawalLogs.length} MultiTokenVault withdrawal logs:`);
                multiTokenWithdrawalLogs.slice(-5).forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No MultiTokenVault withdrawal processing logs found');
            }
        } else {
            console.log('   ❌ Server log file not found');
        }

        // Check 2: Withdrawal API endpoint
        console.log('\n🔍 Check 2: Withdrawal API Endpoint');
        if (fs.existsSync('server/routes.ts')) {
            const routesContent = fs.readFileSync('server/routes.ts', 'utf8');

            if (routesContent.includes('/api/user/withdrawals')) {
                console.log('   ✅ /api/user/withdrawals endpoint exists');

                // Check if it's properly implemented
                const withdrawalEndpoint = routesContent.match(/app\.get\("\/api\/user\/withdrawals".*?res\.json\(.*?\);/s);
                if (withdrawalEndpoint) {
                    console.log('   ✅ Withdrawal endpoint implementation found');
                } else {
                    console.log('   ⚠️  Withdrawal endpoint implementation unclear');
                }
            } else {
                console.log('   ❌ /api/user/withdrawals endpoint not found');
            }
        } else {
            console.log('   ❌ server/routes.ts not found');
        }

        // Check 3: Storage withdrawal methods
        console.log('\n🔍 Check 3: Storage Withdrawal Methods');
        if (fs.existsSync('server/storage.ts')) {
            const storageContent = fs.readFileSync('server/storage.ts', 'utf8');

            if (storageContent.includes('getUserWithdrawals')) {
                console.log('   ✅ getUserWithdrawals method exists');
            } else {
                console.log('   ❌ getUserWithdrawals method not found');
            }

            if (storageContent.includes('createWithdrawal')) {
                console.log('   ✅ createWithdrawal method exists');
            } else {
                console.log('   ❌ createWithdrawal method not found');
            }
        } else {
            console.log('   ❌ server/storage.ts not found');
        }

        // Check 4: MultiTokenVaultEventListener withdrawal processing
        console.log('\n🔍 Check 4: MultiTokenVaultEventListener Withdrawal Processing');
        if (fs.existsSync('server/services/multiTokenVaultEventListener.ts')) {
            const listenerContent = fs.readFileSync('server/services/multiTokenVaultEventListener.ts', 'utf8');

            if (listenerContent.includes('processWithdrawal')) {
                console.log('   ✅ processWithdrawal method exists');
            } else {
                console.log('   ❌ processWithdrawal method not found');
            }

            if (listenerContent.includes('Withdrawal')) {
                console.log('   ✅ Withdrawal event handling exists');
            } else {
                console.log('   ❌ Withdrawal event handling not found');
            }

            // Check for the fixed function call
            if (listenerContent.includes('storage.getUserByWalletAddress')) {
                console.log('   ✅ Fixed getUserByWalletAddress function call');
            } else {
                console.log('   ❌ getUserByWalletAddress function call not found');
            }
        } else {
            console.log('   ❌ MultiTokenVaultEventListener not found');
        }

        // Check 5: Recent withdrawal activity
        console.log('\n🔍 Check 5: Recent Withdrawal Activity');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');
            const recentLogs = lines.slice(-100); // Last 100 lines

            const recentWithdrawalLogs = recentLogs.filter(line =>
                line.includes('withdrawal') ||
                line.includes('WITHDRAWAL') ||
                line.includes('withdraw')
            );

            if (recentWithdrawalLogs.length > 0) {
                console.log(`   📋 Found ${recentWithdrawalLogs.length} recent withdrawal logs:`);
                recentWithdrawalLogs.forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No recent withdrawal activity found');
            }
        }

        // Recommendations
        console.log('\n💡 Troubleshooting Recommendations:');
        console.log('   1. Check if any withdrawals have been made through Multi Token Vault');
        console.log('   2. Verify withdrawal events are being caught by MultiTokenVaultEventListener');
        console.log('   3. Check if withdrawal records are being created in database');
        console.log('   4. Test withdrawal API endpoint directly');
        console.log('   5. Check browser console for withdrawal API errors');

        console.log('\n🔧 Debug Steps:');
        console.log('   1. Make a test withdrawal through Multi Token Vault');
        console.log('   2. Monitor server logs for withdrawal processing');
        console.log('   3. Check Transaction History component debug info');
        console.log('   4. Verify API calls to /api/user/withdrawals');
        console.log('   5. Check database for withdrawal records');

        console.log('\n📊 Expected Withdrawal Flow:');
        console.log('   1. User requests withdrawal from frontend');
        console.log('   2. Backend generates signature');
        console.log('   3. Frontend calls withdrawToken() with signature');
        console.log('   4. Smart contract processes withdrawal');
        console.log('   5. MultiTokenVaultEventListener catches withdrawal event');
        console.log('   6. Withdrawal record created in database');
        console.log('   7. Transaction appears in Transaction History');

        console.log('\n🎯 Next Steps:');
        console.log('   1. Test withdrawal functionality');
        console.log('   2. Check server logs for withdrawal events');
        console.log('   3. Verify withdrawal API returns data');
        console.log('   4. Check Transaction History component debug panel');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Main execution
async function main() {
    await debugWithdrawalHistory();
}

main().catch(console.error);
