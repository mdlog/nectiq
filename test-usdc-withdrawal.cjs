#!/usr/bin/env node

/**
 * USDC Withdrawal Diagnostic Script
 * 
 * This script tests USDC withdrawal functionality and identifies issues
 * 
 * Usage: node test-usdc-withdrawal.cjs
 */

const { ethers } = require('ethers');

// Configuration
const AMOY_RPC = process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const USDC_ADDRESS = process.env.AMOY_USDC_CONTRACT || '0x8B0180f2101c8260d49339abfEe87927412494B4';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// Test addresses
const TEST_RECIPIENT = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Example recipient
const TEST_AMOUNT = '1.0'; // 1 USDC

async function testUSDCWithdrawal() {
    try {
        console.log('🔍 USDC Withdrawal Diagnostic Test');
        console.log('=====================================');

        // Step 1: Check environment variables
        console.log('\n📋 Environment Check:');
        console.log(`   AMOY_RPC: ${AMOY_RPC}`);
        console.log(`   USDC_ADDRESS: ${USDC_ADDRESS}`);
        console.log(`   ADMIN_PRIVATE_KEY: ${ADMIN_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}`);

        if (!ADMIN_PRIVATE_KEY) {
            console.log('\n❌ ERROR: ADMIN_PRIVATE_KEY environment variable not set');
            console.log('   Please set ADMIN_PRIVATE_KEY in your .env file');
            return;
        }

        // Step 2: Setup provider and signer
        console.log('\n🔗 Setting up blockchain connection...');
        const provider = new ethers.JsonRpcProvider(AMOY_RPC);
        const signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

        const adminAddress = signer.address;
        console.log(`   Admin Address: ${adminAddress}`);

        // Step 3: Check network connection
        console.log('\n🌐 Testing network connection...');
        const network = await provider.getNetwork();
        console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);

        if (network.chainId !== 80002n) {
            console.log('❌ ERROR: Not connected to Polygon Amoy (Chain ID: 80002)');
            return;
        }

        // Step 4: Check admin balance
        console.log('\n💰 Checking admin balances...');
        const ethBalance = await provider.getBalance(adminAddress);
        console.log(`   ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

        if (ethBalance < ethers.parseEther('0.01')) {
            console.log('⚠️  WARNING: Low ETH balance for gas fees');
        }

        // Step 5: Setup USDC contract
        console.log('\n💵 Setting up USDC contract...');
        const usdcABI = [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function balanceOf(address account) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];

        const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcABI, signer);

        // Step 6: Check USDC contract info
        console.log('\n📊 USDC Contract Information:');
        try {
            const symbol = await usdcContract.symbol();
            const decimals = await usdcContract.decimals();
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Decimals: ${decimals}`);
        } catch (error) {
            console.log(`   ❌ Failed to get contract info: ${error.message}`);
            return;
        }

        // Step 7: Check admin USDC balance
        console.log('\n💳 Checking admin USDC balance...');
        try {
            const usdcBalance = await usdcContract.balanceOf(adminAddress);
            const decimals = await usdcContract.decimals();
            const formattedBalance = ethers.formatUnits(usdcBalance, decimals);
            console.log(`   USDC Balance: ${formattedBalance} USDC`);

            if (usdcBalance < ethers.parseUnits(TEST_AMOUNT, decimals)) {
                console.log(`   ❌ ERROR: Insufficient USDC balance for test withdrawal`);
                console.log(`   Required: ${TEST_AMOUNT} USDC`);
                console.log(`   Available: ${formattedBalance} USDC`);
                console.log('\n💡 SOLUTION: Get USDC testnet tokens from:');
                console.log('   1. Visit: https://faucet.polygon.technology');
                console.log('   2. Select "Polygon Amoy Testnet"');
                console.log('   3. Request USDC tokens for your admin address');
                return;
            }
        } catch (error) {
            console.log(`   ❌ Failed to check USDC balance: ${error.message}`);
            return;
        }

        // Step 8: Test USDC transfer (dry run)
        console.log('\n🧪 Testing USDC transfer (dry run)...');
        try {
            const decimals = await usdcContract.decimals();
            const amount = ethers.parseUnits(TEST_AMOUNT, decimals);

            // Estimate gas for the transfer
            const gasEstimate = await usdcContract.transfer.estimateGas(TEST_RECIPIENT, amount);
            console.log(`   Gas Estimate: ${gasEstimate.toString()}`);

            // Check if we have enough gas
            const gasPrice = await provider.getFeeData();
            const gasCost = gasEstimate * gasPrice.gasPrice;
            console.log(`   Estimated Gas Cost: ${ethers.formatEther(gasCost)} ETH`);

            if (ethBalance < gasCost) {
                console.log('   ❌ ERROR: Insufficient ETH for gas fees');
                return;
            }

            console.log('   ✅ Transfer simulation successful');

        } catch (error) {
            console.log(`   ❌ Transfer simulation failed: ${error.message}`);

            // Analyze common errors
            if (error.message.includes('insufficient')) {
                console.log('   💡 ISSUE: Insufficient balance detected');
            } else if (error.message.includes('revert')) {
                console.log('   💡 ISSUE: Contract revert - check USDC contract');
            } else if (error.message.includes('gas')) {
                console.log('   💡 ISSUE: Gas estimation failed');
            }
            return;
        }

        // Step 9: Summary
        console.log('\n✅ USDC Withdrawal Test Summary:');
        console.log('   ✓ Network connection: OK');
        console.log('   ✓ Admin wallet: OK');
        console.log('   ✓ USDC contract: OK');
        console.log('   ✓ USDC balance: OK');
        console.log('   ✓ Gas estimation: OK');
        console.log('\n🎉 USDC withdrawal should work correctly!');
        console.log('\n📝 Next steps:');
        console.log('   1. Ensure automated withdrawal service is running');
        console.log('   2. Check that Polygon Amoy is configured in withdrawal service');
        console.log('   3. Test with a small withdrawal amount');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
        console.error('\n🔍 Debug Information:');
        console.error(`   Error Type: ${error.constructor.name}`);
        console.error(`   Error Code: ${error.code || 'N/A'}`);
        console.error(`   Error Reason: ${error.reason || 'N/A'}`);

        if (error.message.includes('network')) {
            console.log('\n💡 NETWORK ISSUE: Check RPC URL and network connectivity');
        } else if (error.message.includes('private key')) {
            console.log('\n💡 WALLET ISSUE: Check ADMIN_PRIVATE_KEY configuration');
        } else if (error.message.includes('contract')) {
            console.log('\n💡 CONTRACT ISSUE: Check USDC contract address');
        }
    }
}

// Main execution
async function main() {
    await testUSDCWithdrawal();
}

main().catch(console.error);
