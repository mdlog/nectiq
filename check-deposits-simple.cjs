#!/usr/bin/env node

/**
 * Simple Check for Deposits
 * 
 * This script provides troubleshooting steps for deposit history issues
 */

const fs = require('fs');

async function checkDepositsSimple() {
    try {
        console.log('🔍 Troubleshooting Deposit History Issues');
        console.log('=========================================');

        // Check 1: Server logs
        console.log('\n🔍 Check 1: Server Logs');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const recentLogs = logContent.split('\n').slice(-50);

            console.log('   ✅ Server log file exists');

            // Check for deposit-related logs
            const depositLogs = recentLogs.filter(line =>
                line.includes('deposit') ||
                line.includes('DEPOSIT') ||
                line.includes('MULTI-TOKEN-VAULT')
            );

            if (depositLogs.length > 0) {
                console.log(`   📋 Found ${depositLogs.length} deposit-related log entries:`);
                depositLogs.slice(-5).forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No recent deposit-related logs found');
            }
        } else {
            console.log('   ❌ Server log file not found');
        }

        // Check 2: Environment variables
        console.log('\n🔍 Check 2: Environment Variables');
        if (fs.existsSync('.env')) {
            const envContent = fs.readFileSync('.env', 'utf8');
            const envVars = envContent.split('\n').filter(line =>
                line.includes('DB_') ||
                line.includes('MULTI_TOKEN_VAULT') ||
                line.includes('BACKEND_SIGNER')
            );

            console.log('   ✅ .env file exists');
            console.log('   📋 Relevant environment variables:');
            envVars.forEach(envVar => {
                const [key, value] = envVar.split('=');
                if (key && value) {
                    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
                    console.log(`      ${key}: ${displayValue}`);
                }
            });
        } else {
            console.log('   ❌ .env file not found');
        }

        // Check 3: Component files
        console.log('\n🔍 Check 3: Component Files');
        const componentFiles = [
            'client/src/components/transaction-history.tsx',
            'client/src/pages/user-dashboard.tsx'
        ];

        componentFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`   ✅ ${file} exists`);
            } else {
                console.log(`   ❌ ${file} not found`);
            }
        });

        // Check 4: API endpoints
        console.log('\n🔍 Check 4: API Endpoints');
        const apiFiles = [
            'server/routes.ts',
            'server/storage.ts'
        ];

        apiFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`   ✅ ${file} exists`);

                // Check for specific API endpoints
                const content = fs.readFileSync(file, 'utf8');
                if (file.includes('routes.ts')) {
                    if (content.includes('/api/user/deposits')) {
                        console.log('      ✅ /api/user/deposits endpoint found');
                    } else {
                        console.log('      ❌ /api/user/deposits endpoint not found');
                    }

                    if (content.includes('/api/user/withdrawals')) {
                        console.log('      ✅ /api/user/withdrawals endpoint found');
                    } else {
                        console.log('      ❌ /api/user/withdrawals endpoint not found');
                    }
                }
            } else {
                console.log(`   ❌ ${file} not found`);
            }
        });

        // Recommendations
        console.log('\n💡 Troubleshooting Recommendations:');
        console.log('   1. Check browser console for errors when loading transaction history');
        console.log('   2. Verify user is logged in and authenticated');
        console.log('   3. Check if deposits exist in database (run database query)');
        console.log('   4. Test with a fresh deposit transaction');
        console.log('   5. Check MultiTokenVaultEventListener is running');
        console.log('   6. Verify API endpoints are accessible');

        console.log('\n🔧 Debug Steps:');
        console.log('   1. Open browser developer tools');
        console.log('   2. Go to User Dashboard → Financial → History');
        console.log('   3. Check Console tab for error messages');
        console.log('   4. Check Network tab for API calls');
        console.log('   5. Look for debug info in the component');

        console.log('\n📊 Expected Behavior:');
        console.log('   - Component should show debug info in development mode');
        console.log('   - API calls should return deposit/withdrawal data');
        console.log('   - Transactions should be displayed in chronological order');
        console.log('   - Filters and search should work properly');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Main execution
async function main() {
    await checkDepositsSimple();
}

main().catch(console.error);
