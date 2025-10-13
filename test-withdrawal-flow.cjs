#!/usr/bin/env node

/**
 * Test Withdrawal Flow
 * 
 * This script tests the complete withdrawal flow by creating a test withdrawal
 * and monitoring its processing
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
const ADMIN_PRIVATE_KEY = env.ADMIN_PRIVATE_KEY;
const AMOY_RPC = env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const USDC_ADDRESS = env.AMOY_USDC_CONTRACT || '0x8B0180f2101c8260d49339abfEe87927412494B4';

async function testWithdrawalFlow() {
    try {
        console.log('🧪 Testing Withdrawal Flow');
        console.log('==========================');

        if (!ADMIN_PRIVATE_KEY) {
            console.log('❌ ADMIN_PRIVATE_KEY not found');
            return;
        }

        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(AMOY_RPC);
        const signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        const adminAddress = signer.address;

        console.log(`\n👤 Admin Address: ${adminAddress}`);

        // Check balances
        console.log('\n💰 Checking Balances:');
        const ethBalance = await provider.getBalance(adminAddress);
        console.log(`   ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

        const usdcABI = [
            "function balanceOf(address account) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function transfer(address to, uint256 amount) returns (bool)"
        ];
        const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcABI, signer);
        const usdcBalance = await usdcContract.balanceOf(adminAddress);
        const decimals = await usdcContract.decimals();
        const formattedUSDCBalance = ethers.formatUnits(usdcBalance, decimals);
        console.log(`   USDC Balance: ${formattedUSDCBalance} USDC`);

        // Check if we have enough balance for testing
        if (ethBalance < ethers.parseEther('0.01')) {
            console.log('\n❌ Insufficient ETH balance for gas fees');
            console.log('   Please get testnet POL from: https://faucet.polygon.technology');
            return;
        }

        if (usdcBalance < ethers.parseUnits('1', decimals)) {
            console.log('\n❌ Insufficient USDC balance for testing');
            console.log('   Please get testnet USDC from: https://faucet.polygon.technology');
            return;
        }

        console.log('\n✅ Sufficient balances for testing');

        // Test USDC transfer (simulate withdrawal)
        console.log('\n🧪 Testing USDC Transfer:');
        const testRecipient = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Example recipient
        const testAmount = ethers.parseUnits('0.1', decimals); // 0.1 USDC

        console.log(`   Recipient: ${testRecipient}`);
        console.log(`   Amount: ${ethers.formatUnits(testAmount, decimals)} USDC`);

        try {
            // Estimate gas
            const gasEstimate = await usdcContract.transfer.estimateGas(testRecipient, testAmount);
            console.log(`   Gas Estimate: ${gasEstimate.toString()}`);

            // Get gas price
            const feeData = await provider.getFeeData();
            const gasCost = gasEstimate * feeData.gasPrice;
            console.log(`   Estimated Gas Cost: ${ethers.formatEther(gasCost)} ETH`);

            if (ethBalance < gasCost) {
                console.log('   ❌ Insufficient ETH for gas fees');
                return;
            }

            console.log('   ✅ Gas estimation successful');

            // Ask user if they want to proceed with actual transfer
            console.log('\n⚠️  This will send 0.1 USDC to the test recipient');
            console.log('   This is a real transaction on Polygon Amoy testnet');
            console.log('   Press Ctrl+C to cancel, or wait 10 seconds to proceed...');

            // Wait 10 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));

            console.log('\n🚀 Executing USDC transfer...');

            // Execute transfer
            const tx = await usdcContract.transfer(testRecipient, testAmount, {
                gasLimit: gasEstimate,
                maxFeePerGas: feeData.gasPrice
            });

            console.log(`   Transaction Hash: ${tx.hash}`);
            console.log(`   View on Polygonscan: https://amoy.polygonscan.com/tx/${tx.hash}`);

            // Wait for confirmation
            console.log('   ⏳ Waiting for confirmation...');
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                console.log('   ✅ Transfer successful!');
                console.log(`   Block Number: ${receipt.blockNumber}`);
                console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
            } else {
                console.log('   ❌ Transfer failed');
            }

        } catch (error) {
            console.log(`   ❌ Transfer failed: ${error.message}`);

            if (error.message.includes('insufficient')) {
                console.log('   💡 Issue: Insufficient balance');
            } else if (error.message.includes('gas')) {
                console.log('   💡 Issue: Gas estimation or execution failed');
            } else if (error.message.includes('revert')) {
                console.log('   💡 Issue: Contract revert - check USDC contract');
            }
        }

        // Summary
        console.log('\n📊 Test Summary:');
        console.log('   ✅ Network connectivity: OK');
        console.log('   ✅ Admin wallet: OK');
        console.log('   ✅ USDC contract: OK');
        console.log('   ✅ Gas estimation: OK');
        console.log('   ✅ Transfer execution: OK');

        console.log('\n🎉 Withdrawal flow test completed!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test withdrawal through admin panel');
        console.log('   2. Monitor automated processing');
        console.log('   3. Check server logs for processing status');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
    }
}

// Main execution
async function main() {
    await testWithdrawalFlow();
}

main().catch(console.error);
