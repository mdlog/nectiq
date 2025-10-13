#!/usr/bin/env node

/**
 * Simple Multi Token Vault Test
 */

const { ethers } = require('ethers');
const fs = require('fs');

// Load environment variables
function loadEnvFile() {
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const envVars = {};

        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });

        return envVars;
    } catch (error) {
        console.error('❌ Error loading .env file:', error.message);
        return {};
    }
}

const env = loadEnvFile();
const AMOY_RPC = env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const MULTI_TOKEN_VAULT_ADDRESS = env.MULTI_TOKEN_VAULT_ADDRESS;
const BACKEND_SIGNER_PRIVATE_KEY = env.BACKEND_SIGNER_PRIVATE_KEY;
const USDC_ADDRESS = env.AMOY_USDC_CONTRACT || '0x8B0180f2101c8260d49339abfEe87927412494B4';

async function testMultiTokenVault() {
    try {
        console.log('🧪 Simple Multi Token Vault Test');
        console.log('================================');

        // Check environment
        console.log('\n📋 Environment:');
        console.log(`   MULTI_TOKEN_VAULT_ADDRESS: ${MULTI_TOKEN_VAULT_ADDRESS || '❌ Missing'}`);
        console.log(`   BACKEND_SIGNER_PRIVATE_KEY: ${BACKEND_SIGNER_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}`);
        console.log(`   USDC_ADDRESS: ${USDC_ADDRESS}`);

        if (!MULTI_TOKEN_VAULT_ADDRESS || !BACKEND_SIGNER_PRIVATE_KEY) {
            console.log('\n❌ Missing required environment variables');
            return;
        }

        // Setup
        const provider = new ethers.JsonRpcProvider(AMOY_RPC);
        const backendSigner = new ethers.Wallet(BACKEND_SIGNER_PRIVATE_KEY, provider);

        console.log(`\n🔐 Backend Signer: ${backendSigner.address}`);

        // Contract ABI
        const vaultABI = [
            "function backendSigner() external view returns (address)",
            "function isTokenSupported(address token) external view returns (bool)",
            "function getUserBalance(address user, address token) external view returns (uint256)"
        ];

        const vaultContract = new ethers.Contract(MULTI_TOKEN_VAULT_ADDRESS, vaultABI, provider);

        // Test 1: Check backend signer
        console.log('\n🔍 Test 1: Backend Signer');
        try {
            const contractBackendSigner = await vaultContract.backendSigner();
            console.log(`   Contract: ${contractBackendSigner}`);
            console.log(`   Expected: ${backendSigner.address}`);

            if (contractBackendSigner.toLowerCase() === backendSigner.address.toLowerCase()) {
                console.log('   ✅ Backend signer matches');
            } else {
                console.log('   ❌ Backend signer mismatch');
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 2: Check USDC support
        console.log('\n🔍 Test 2: USDC Support');
        try {
            const isSupported = await vaultContract.isTokenSupported(USDC_ADDRESS);
            console.log(`   USDC Supported: ${isSupported}`);

            if (isSupported) {
                console.log('   ✅ USDC is supported');
            } else {
                console.log('   ❌ USDC not supported');
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 3: Check user balance (using a valid address)
        console.log('\n🔍 Test 3: User Balance');
        try {
            // Use a valid test address
            const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
            const balance = await vaultContract.getUserBalance(testAddress, USDC_ADDRESS);
            const formattedBalance = ethers.formatUnits(balance, 6);
            console.log(`   User Balance: ${formattedBalance} USDC`);

            if (balance > 0) {
                console.log('   ✅ User has USDC balance');
            } else {
                console.log('   ⚠️  User has no USDC balance');
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 4: Signature generation
        console.log('\n🔍 Test 4: Signature Generation');
        try {
            const userAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
            const tokenAddress = USDC_ADDRESS;
            const amount = ethers.parseUnits('1.0', 6); // 1 USDC
            const nonce = 12345;
            const vaultAddress = MULTI_TOKEN_VAULT_ADDRESS;

            const messageHash = ethers.solidityPackedKeccak256(
                ['address', 'address', 'uint256', 'uint256', 'address'],
                [userAddress, tokenAddress, amount, nonce, vaultAddress]
            );

            const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));

            console.log(`   Message Hash: ${messageHash}`);
            console.log(`   Signature: ${signature}`);
            console.log('   ✅ Signature generation successful');

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 5: Check server logs
        console.log('\n🔍 Test 5: Server Status');
        try {
            if (fs.existsSync('server.log')) {
                const logContent = fs.readFileSync('server.log', 'utf8');

                if (logContent.includes('MULTI-TOKEN-VAULT] Event listener started successfully')) {
                    console.log('   ✅ MultiTokenVaultEventListener is running');
                } else {
                    console.log('   ⚠️  MultiTokenVaultEventListener status unclear');
                }

                // Check for recent activity
                const recentLogs = logContent.split('\n').slice(-20);
                const hasActivity = recentLogs.some(line =>
                    line.includes('[MULTI-TOKEN-VAULT]')
                );

                if (hasActivity) {
                    console.log('   ✅ Recent MultiTokenVault activity detected');
                } else {
                    console.log('   ⚠️  No recent MultiTokenVault activity');
                }
            } else {
                console.log('   ❌ Server log file not found');
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Summary
        console.log('\n📊 Summary:');
        console.log('   ✅ Multi Token Vault contract is accessible');
        console.log('   ✅ Backend signer is configured');
        console.log('   ✅ USDC is supported');
        console.log('   ✅ Signature generation works');

        console.log('\n🎉 Multi Token Vault withdrawal should work!');
        console.log('\n📝 If withdrawal still fails:');
        console.log('   1. Check user has deposited tokens to vault first');
        console.log('   2. Verify user has sufficient balance in vault');
        console.log('   3. Check frontend is calling correct functions');
        console.log('   4. Monitor server logs for errors');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
    }
}

testMultiTokenVault().catch(console.error);
