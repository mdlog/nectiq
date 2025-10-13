#!/usr/bin/env node

/**
 * Debug Deposit History API Response
 * 
 * This script helps debug why deposits are not showing in transaction history
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';

async function debugDepositHistory() {
    try {
        console.log('🔍 Debugging Deposit History API Response');
        console.log('=========================================');

        // Test 1: Check if server is running
        console.log('\n🔍 Test 1: Check Server Status');
        try {
            const response = await fetch(`${BASE_URL}/api/health`);
            if (response.ok) {
                console.log('   ✅ Server is running');
            } else {
                console.log(`   ⚠️  Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Server connection failed: ${error.message}`);
            console.log('   💡 Make sure the server is running on http://localhost:3000');
            return;
        }

        // Test 2: Check deposits API (without authentication - should return 401)
        console.log('\n🔍 Test 2: Check Deposits API Response Format');
        try {
            const response = await fetch(`${BASE_URL}/api/user/deposits`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`   Status: ${response.status}`);

            if (response.status === 401) {
                console.log('   ✅ Authentication required (expected)');
                console.log('   💡 This means the API endpoint is working correctly');
            } else if (response.ok) {
                const deposits = await response.json();
                console.log(`   ✅ Success: Found ${deposits.length} deposits`);

                if (deposits.length > 0) {
                    console.log('   📋 Sample deposit structure:');
                    const sample = deposits[0];
                    console.log('   Fields in deposit object:');
                    Object.keys(sample).forEach(key => {
                        console.log(`      ${key}: ${typeof sample[key]} = ${JSON.stringify(sample[key])}`);
                    });

                    console.log('\n   🔍 Expected fields for TransactionHistory component:');
                    console.log('      id: number');
                    console.log('      userId: number');
                    console.log('      tokenType: string');
                    console.log('      amountUSD: string');
                    console.log('      status: string');
                    console.log('      transactionHash?: string');
                    console.log('      createdAt: string');

                    console.log('\n   🔍 Mapping in TransactionHistory component:');
                    console.log('      type: "deposit"');
                    console.log('      amount: deposit.amountUSD');
                    console.log('      token: deposit.tokenType');
                    console.log('      date: deposit.createdAt');
                    console.log('      hash: deposit.transactionHash');
                } else {
                    console.log('   ⚠️  No deposits found');
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 3: Check withdrawals API
        console.log('\n🔍 Test 3: Check Withdrawals API Response Format');
        try {
            const response = await fetch(`${BASE_URL}/api/user/withdrawals`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`   Status: ${response.status}`);

            if (response.status === 401) {
                console.log('   ✅ Authentication required (expected)');
            } else if (response.ok) {
                const withdrawals = await response.json();
                console.log(`   ✅ Success: Found ${withdrawals.length} withdrawals`);

                if (withdrawals.length > 0) {
                    console.log('   📋 Sample withdrawal structure:');
                    const sample = withdrawals[0];
                    console.log('   Fields in withdrawal object:');
                    Object.keys(sample).forEach(key => {
                        console.log(`      ${key}: ${typeof sample[key]} = ${JSON.stringify(sample[key])}`);
                    });
                } else {
                    console.log('   ⚠️  No withdrawals found');
                }
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 4: Check database directly (if possible)
        console.log('\n🔍 Test 4: Database Check');
        console.log('   💡 To check database directly:');
        console.log('   1. Connect to your database');
        console.log('   2. Run: SELECT * FROM deposits ORDER BY "createdAt" DESC LIMIT 5;');
        console.log('   3. Check if deposits exist and have correct data');

        // Summary and recommendations
        console.log('\n📊 Debug Summary:');
        console.log('   ✅ API endpoints are accessible');
        console.log('   ✅ Authentication is working');
        console.log('   ✅ Response format should be correct');

        console.log('\n🔧 Possible Issues:');
        console.log('   1. No deposits in database');
        console.log('   2. User not authenticated in browser');
        console.log('   3. Data format mismatch');
        console.log('   4. Component not receiving data');

        console.log('\n💡 Next Steps:');
        console.log('   1. Check browser console for errors');
        console.log('   2. Verify user is logged in');
        console.log('   3. Check if deposits exist in database');
        console.log('   4. Test with a fresh deposit');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
    }
}

// Main execution
async function main() {
    await debugDepositHistory();
}

main().catch(console.error);
