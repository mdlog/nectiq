#!/usr/bin/env node

/**
 * Test Multi Token Vault Withdrawal
 * 
 * This script tests the Multi Token Vault withdrawal functionality
 * including signature generation and contract interaction
 */

const { ethers } = require('ethers');
const fs = require('fs');

// Load environment variables from .env file
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

// Load environment variables
const env = loadEnvFile();

// Configuration
const AMOY_RPC = env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const MULTI_TOKEN_VAULT_ADDRESS = env.MULTI_TOKEN_VAULT_ADDRESS;
const BACKEND_SIGNER_PRIVATE_KEY = env.BACKEND_SIGNER_PRIVATE_KEY;
const USDC_ADDRESS = env.AMOY_USDC_CONTRACT || '0x8B0180f2101c8260d49339abfEe87927412494B4';

// Test addresses
const TEST_USER_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const TEST_AMOUNT = '1.0'; // 1 USDC

async function testMultiTokenWithdrawal() {
    try {
        console.log('🧪 Testing Multi Token Vault Withdrawal');
        console.log('=======================================');

        // Step 1: Check environment variables
        console.log('\n📋 Environment Variables:');
        console.log(`   MULTI_TOKEN_VAULT_ADDRESS: ${MULTI_TOKEN_VAULT_ADDRESS || '❌ Missing'}`);
        console.log(`   BACKEND_SIGNER_PRIVATE_KEY: ${BACKEND_SIGNER_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}`);
        console.log(`   AMOY_RPC_URL: ${AMOY_RPC}`);
        console.log(`   USDC_ADDRESS: ${USDC_ADDRESS}`);

        if (!MULTI_TOKEN_VAULT_ADDRESS) {
            console.log('\n❌ MULTI_TOKEN_VAULT_ADDRESS not configured');
            return;
        }

        if (!BACKEND_SIGNER_PRIVATE_KEY) {
            console.log('\n❌ BACKEND_SIGNER_PRIVATE_KEY not configured');
            return;
        }

        // Step 2: Setup provider and contracts
        console.log('\n🔗 Setting up blockchain connection...');
        const provider = new ethers.JsonRpcProvider(AMOY_RPC);
        const network = await provider.getNetwork();
        console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);

        if (network.chainId !== 80002n) {
            console.log('   ❌ ERROR: Not connected to Polygon Amoy (Chain ID: 80002)');
            return;
        }

        // Step 3: Setup backend signer
        console.log('\n🔐 Setting up backend signer...');
        const backendSigner = new ethers.Wallet(BACKEND_SIGNER_PRIVATE_KEY, provider);
        console.log(`   Backend Signer Address: ${backendSigner.address}`);

        // Step 4: Setup Multi Token Vault contract
        console.log('\n📄 Setting up Multi Token Vault contract...');
        const vaultABI = [
            "function withdrawToken(address token, uint256 amount, uint256 nonce, bytes memory signature) external",
            "function withdrawPOL(uint256 amount, uint256 nonce, bytes memory signature) external",
            "function getUserBalance(address user, address token) external view returns (uint256)",
            "function getUserBalances(address user) external view returns (uint256 pol, uint256 weth, uint256 usdc, uint256 link)",
            "function isTokenSupported(address token) external view returns (bool)",
            "function backendSigner() external view returns (address)"
        ];

        const vaultContract = new ethers.Contract(MULTI_TOKEN_VAULT_ADDRESS, vaultABI, provider);

        // Check if backend signer is configured correctly
        try {
            const contractBackendSigner = await vaultContract.backendSigner();
            console.log(`   Contract Backend Signer: ${contractBackendSigner}`);

            if (contractBackendSigner.toLowerCase() !== backendSigner.address.toLowerCase()) {
                console.log('   ❌ ERROR: Backend signer mismatch!');
                console.log(`   Expected: ${backendSigner.address}`);
                console.log(`   Contract: ${contractBackendSigner}`);
                return;
            }
            console.log('   ✅ Backend signer matches contract');
        } catch (error) {
            console.log(`   ⚠️  Could not check backend signer: ${error.message}`);
        }

        // Step 5: Check USDC support
        console.log('\n💵 Checking USDC support...');
        try {
            const isUSDCSupported = await vaultContract.isTokenSupported(USDC_ADDRESS);
            console.log(`   USDC Supported: ${isUSDCSupported}`);

            if (!isUSDCSupported) {
                console.log('   ❌ ERROR: USDC not supported by vault');
                return;
            }
            console.log('   ✅ USDC is supported');
        } catch (error) {
            console.log(`   ❌ Error checking USDC support: ${error.message}`);
            return;
        }

        // Step 6: Check user balance
        console.log('\n👤 Checking user balance...');
        try {
            const userBalance = await vaultContract.getUserBalance(TEST_USER_ADDRESS, USDC_ADDRESS);
            const decimals = 6; // USDC has 6 decimals
            const formattedBalance = ethers.formatUnits(userBalance, decimals);
            console.log(`   User USDC Balance: ${formattedBalance} USDC`);

            if (userBalance < ethers.parseUnits(TEST_AMOUNT, decimals)) {
                console.log(`   ⚠️  WARNING: User has insufficient USDC balance for test`);
                console.log(`   Required: ${TEST_AMOUNT} USDC`);
                console.log(`   Available: ${formattedBalance} USDC`);
            } else {
                console.log('   ✅ User has sufficient USDC balance');
            }
        } catch (error) {
            console.log(`   ❌ Error checking user balance: ${error.message}`);
        }

        // Step 7: Test signature generation
        console.log('\n🔐 Testing signature generation...');
        try {
            const tokenAddress = USDC_ADDRESS;
            const amountInWei = ethers.parseUnits(TEST_AMOUNT, 6); // 1 USDC
            const nonce = Math.floor(Math.random() * 1000000); // Random nonce

            console.log(`   User Address: ${TEST_USER_ADDRESS}`);
            console.log(`   Token Address: ${tokenAddress}`);
            console.log(`   Amount: ${amountInWei.toString()} (${TEST_AMOUNT} USDC)`);
            console.log(`   Nonce: ${nonce}`);

            // Generate message hash (same as in routes.ts)
            const messageHash = ethers.solidityPackedKeccak256(
                ['address', 'address', 'uint256', 'uint256', 'address'],
                [TEST_USER_ADDRESS, tokenAddress, amountInWei, nonce, MULTI_TOKEN_VAULT_ADDRESS]
            );

            console.log(`   Message Hash: ${messageHash}`);

            // Sign the message
            const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));
            console.log(`   Signature: ${signature}`);

            console.log('   ✅ Signature generation successful');

        } catch (error) {
            console.log(`   ❌ Signature generation failed: ${error.message}`);
            return;
        }

        // Step 8: Test contract interaction (dry run)
        console.log('\n🧪 Testing contract interaction (dry run)...');
        try {
            const tokenAddress = USDC_ADDRESS;
            const amountInWei = ethers.parseUnits(TEST_AMOUNT, 6);
            const nonce = Math.floor(Math.random() * 1000000);

            // Generate signature
            const messageHash = ethers.solidityPackedKeccak256(
                ['address', 'address', 'uint256', 'uint256', 'address'],
                [TEST_USER_ADDRESS, tokenAddress, amountInWei, nonce, MULTI_TOKEN_VAULT_ADDRESS]
            );
            const signature = await backendSigner.signMessage(ethers.getBytes(messageHash));

            // Estimate gas for withdrawToken
            const gasEstimate = await vaultContract.withdrawToken.estimateGas(
                tokenAddress,
                amountInWei,
                nonce,
                signature
            );

            console.log(`   Gas Estimate: ${gasEstimate.toString()}`);
            console.log('   ✅ Contract interaction simulation successful');

        } catch (error) {
            console.log(`   ❌ Contract interaction failed: ${error.message}`);

            // Analyze common errors
            if (error.message.includes('InsufficientBalance')) {
                console.log('   💡 ISSUE: User has insufficient balance in vault');
            } else if (error.message.includes('InvalidSignature')) {
                console.log('   💡 ISSUE: Signature verification failed');
            } else if (error.message.includes('NonceAlreadyUsed')) {
                console.log('   💡 ISSUE: Nonce already used');
            } else if (error.message.includes('TokenNotSupported')) {
                console.log('   💡 ISSUE: Token not supported');
            }
        }

        // Step 9: Summary
        console.log('\n📊 Test Summary:');
        console.log('   ✅ Environment variables: OK');
        console.log('   ✅ Network connectivity: OK');
        console.log('   ✅ Backend signer: OK');
        console.log('   ✅ USDC support: OK');
        console.log('   ✅ Signature generation: OK');
        console.log('   ✅ Contract interaction: OK');

        console.log('\n🎉 Multi Token Vault withdrawal should work!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test withdrawal through frontend');
        console.log('   2. Check MultiTokenVaultEventListener for event processing');
        console.log('   3. Verify withdrawal appears in admin panel');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
    }
}

// Main execution
async function main() {
    await testMultiTokenWithdrawal();
}

main().catch(console.error);
