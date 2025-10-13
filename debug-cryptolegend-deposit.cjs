#!/usr/bin/env node

/**
 * Debug CryptoLegend2798 Deposit Issue
 * 
 * This script helps debug why CryptoLegend2798's 0.1 POL deposit is not showing in history
 */

const fs = require('fs');

async function debugCryptoLegendDeposit() {
    try {
        console.log('🔍 Debugging CryptoLegend2798 Deposit Issue');
        console.log('==========================================');
        console.log('User: CryptoLegend2798');
        console.log('Amount: 0.1 POL');
        console.log('Issue: Not showing in transaction history');
        console.log('');

        // Check 1: Server logs for CryptoLegend2798
        console.log('🔍 Check 1: Server Logs for CryptoLegend2798');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');

            // Search for CryptoLegend2798 related logs
            const cryptoLegendLogs = lines.filter(line =>
                line.toLowerCase().includes('cryptolegend2798') ||
                line.includes('CryptoLegend2798')
            );

            if (cryptoLegendLogs.length > 0) {
                console.log(`   📋 Found ${cryptoLegendLogs.length} CryptoLegend2798 related logs:`);
                cryptoLegendLogs.slice(-10).forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No CryptoLegend2798 related logs found');
            }

            // Search for POL deposit logs
            const polDepositLogs = lines.filter(line =>
                line.toLowerCase().includes('pol') &&
                (line.includes('deposit') || line.includes('DEPOSIT'))
            );

            if (polDepositLogs.length > 0) {
                console.log(`\n   📋 Found ${polDepositLogs.length} POL deposit related logs:`);
                polDepositLogs.slice(-5).forEach(log => {
                    console.log(`      ${log}`);
                });
            }

            // Search for MultiTokenVault logs
            const multiTokenLogs = lines.filter(line =>
                line.includes('MULTI-TOKEN-VAULT') ||
                line.includes('MultiTokenVault')
            );

            if (multiTokenLogs.length > 0) {
                console.log(`\n   📋 Found ${multiTokenLogs.length} MultiTokenVault related logs:`);
                multiTokenLogs.slice(-5).forEach(log => {
                    console.log(`      ${log}`);
                });
            }
        } else {
            console.log('   ❌ Server log file not found');
        }

        // Check 2: Recent deposit logs
        console.log('\n🔍 Check 2: Recent Deposit Activity');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');
            const lines = logContent.split('\n');
            const recentLogs = lines.slice(-100); // Last 100 lines

            const depositLogs = recentLogs.filter(line =>
                line.includes('deposit') ||
                line.includes('DEPOSIT') ||
                line.includes('Balance credited') ||
                line.includes('deposit record created')
            );

            if (depositLogs.length > 0) {
                console.log(`   📋 Found ${depositLogs.length} recent deposit logs:`);
                depositLogs.forEach(log => {
                    console.log(`      ${log}`);
                });
            } else {
                console.log('   ⚠️  No recent deposit activity found');
            }
        }

        // Check 3: MultiTokenVaultEventListener status
        console.log('\n🔍 Check 3: MultiTokenVaultEventListener Status');
        if (fs.existsSync('server.log')) {
            const logContent = fs.readFileSync('server.log', 'utf8');

            if (logContent.includes('MULTI-TOKEN-VAULT] Event listener started successfully')) {
                console.log('   ✅ MultiTokenVaultEventListener is running');
            } else if (logContent.includes('MULTI-TOKEN-VAULT] Failed to start event listener')) {
                console.log('   ❌ MultiTokenVaultEventListener failed to start');
            } else {
                console.log('   ⚠️  MultiTokenVaultEventListener status unclear');
            }

            // Check for recent MultiTokenVault activity
            const recentLogs = logContent.split('\n').slice(-50);
            const hasRecentActivity = recentLogs.some(line =>
                line.includes('[MULTI-TOKEN-VAULT]') &&
                (line.includes('Deposit') || line.includes('Withdrawal'))
            );

            if (hasRecentActivity) {
                console.log('   ✅ Recent MultiTokenVault activity detected');
            } else {
                console.log('   ⚠️  No recent MultiTokenVault activity');
            }
        }

        // Check 4: Environment configuration
        console.log('\n🔍 Check 4: Environment Configuration');
        if (fs.existsSync('.env')) {
            const envContent = fs.readFileSync('.env', 'utf8');

            const requiredVars = [
                'MULTI_TOKEN_VAULT_ADDRESS',
                'BACKEND_SIGNER_PRIVATE_KEY',
                'AMOY_RPC_URL'
            ];

            requiredVars.forEach(varName => {
                if (envContent.includes(varName)) {
                    console.log(`   ✅ ${varName} is configured`);
                } else {
                    console.log(`   ❌ ${varName} is missing`);
                }
            });
        }

        // Recommendations
        console.log('\n💡 Troubleshooting Recommendations:');
        console.log('   1. Check if CryptoLegend2798 deposit was processed by MultiTokenVaultEventListener');
        console.log('   2. Verify the deposit transaction hash on Polygonscan');
        console.log('   3. Check if deposit record was created in database');
        console.log('   4. Verify user authentication in browser');
        console.log('   5. Test transaction history component with debug info');

        console.log('\n🔧 Debug Steps:');
        console.log('   1. Ask CryptoLegend2798 to check browser console in Transaction History');
        console.log('   2. Look for debug logs: 🔍 [TRANSACTION-HISTORY] Debug Info');
        console.log('   3. Check if API calls to /api/user/deposits return data');
        console.log('   4. Verify deposit transaction on blockchain explorer');
        console.log('   5. Check if MultiTokenVaultEventListener caught the deposit event');

        console.log('\n📊 Expected Flow:');
        console.log('   1. CryptoLegend2798 deposits 0.1 POL to Multi Token Vault');
        console.log('   2. MultiTokenVaultEventListener catches deposit event');
        console.log('   3. Balance is credited to user account');
        console.log('   4. Deposit record is created in database');
        console.log('   5. Transaction History component displays the deposit');

        console.log('\n🎯 Next Steps:');
        console.log('   1. Check server logs for MultiTokenVaultEventListener activity');
        console.log('   2. Verify deposit transaction on Polygonscan');
        console.log('   3. Test Transaction History component with debug info');
        console.log('   4. Check database for deposit record');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

// Main execution
async function main() {
    await debugCryptoLegendDeposit();
}

main().catch(console.error);
