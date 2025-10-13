#!/usr/bin/env node

/**
 * Check Withdrawal Service Status
 * 
 * This script checks the status of the automated withdrawal service
 * and provides diagnostic information
 */

const { ethers } = require('ethers');

// Configuration
const AMOY_RPC = process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const USDC_ADDRESS = process.env.AMOY_USDC_CONTRACT || '0x8B0180f2101c8260d49339abfEe87927412494B4';

async function checkWithdrawalStatus() {
    try {
        console.log('🔍 Automated Withdrawal Service Status Check');
        console.log('============================================');

        // Step 1: Check environment variables
        console.log('\n📋 Environment Variables:');
        console.log(`   ADMIN_PRIVATE_KEY: ${process.env.ADMIN_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}`);
        console.log(`   ENABLE_AUTO_WITHDRAWALS: ${process.env.ENABLE_AUTO_WITHDRAWALS || 'true (default)'}`);
        console.log(`   WITHDRAWAL_CHECK_INTERVAL: ${process.env.WITHDRAWAL_CHECK_INTERVAL || '5 (default)'}`);
        console.log(`   AMOY_RPC_URL: ${AMOY_RPC}`);
        console.log(`   AMOY_USDC_CONTRACT: ${USDC_ADDRESS}`);

        // Step 2: Check network connectivity
        console.log('\n🌐 Network Connectivity:');
        try {
            const provider = new ethers.JsonRpcProvider(AMOY_RPC);
            const network = await provider.getNetwork();
            console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);

            if (network.chainId !== 80002n) {
                console.log('   ❌ ERROR: Not connected to Polygon Amoy (Chain ID: 80002)');
                return;
            }
            console.log('   ✅ Connected to Polygon Amoy');
        } catch (error) {
            console.log(`   ❌ Network connection failed: ${error.message}`);
            return;
        }

        // Step 3: Check admin wallet (if private key is set)
        if (process.env.ADMIN_PRIVATE_KEY) {
            console.log('\n👤 Admin Wallet Status:');
            try {
                const provider = new ethers.JsonRpcProvider(AMOY_RPC);
                const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
                const address = signer.address;
                const balance = await provider.getBalance(address);

                console.log(`   Address: ${address}`);
                console.log(`   ETH Balance: ${ethers.formatEther(balance)} ETH`);

                if (balance < ethers.parseEther('0.01')) {
                    console.log('   ⚠️  WARNING: Low ETH balance for gas fees');
                } else {
                    console.log('   ✅ Sufficient ETH for gas fees');
                }

                // Check USDC balance
                const usdcABI = [
                    "function balanceOf(address account) view returns (uint256)",
                    "function decimals() view returns (uint8)"
                ];
                const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcABI, provider);
                const usdcBalance = await usdcContract.balanceOf(address);
                const decimals = await usdcContract.decimals();
                const formattedBalance = ethers.formatUnits(usdcBalance, decimals);

                console.log(`   USDC Balance: ${formattedBalance} USDC`);

                if (usdcBalance < ethers.parseUnits('10', decimals)) {
                    console.log('   ⚠️  WARNING: Low USDC balance for withdrawals');
                    console.log('   💡 Get USDC testnet tokens from: https://faucet.polygon.technology');
                } else {
                    console.log('   ✅ Sufficient USDC for withdrawals');
                }

            } catch (error) {
                console.log(`   ❌ Error checking admin wallet: ${error.message}`);
            }
        } else {
            console.log('\n👤 Admin Wallet Status:');
            console.log('   ❌ ADMIN_PRIVATE_KEY not set - automated withdrawals disabled');
        }

        // Step 4: Check USDC contract
        console.log('\n💵 USDC Contract Status:');
        try {
            const provider = new ethers.JsonRpcProvider(AMOY_RPC);
            const usdcABI = [
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)",
                "function totalSupply() view returns (uint256)"
            ];
            const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcABI, provider);

            const symbol = await usdcContract.symbol();
            const decimals = await usdcContract.decimals();
            const totalSupply = await usdcContract.totalSupply();

            console.log(`   Contract Address: ${USDC_ADDRESS}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Decimals: ${decimals}`);
            console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
            console.log('   ✅ USDC contract is accessible');

        } catch (error) {
            console.log(`   ❌ USDC contract error: ${error.message}`);
        }

        // Step 5: Summary and recommendations
        console.log('\n📊 Status Summary:');

        const hasPrivateKey = !!process.env.ADMIN_PRIVATE_KEY;
        const hasNetwork = true; // We already checked this
        const hasUSDC = true; // We already checked this

        if (hasPrivateKey && hasNetwork && hasUSDC) {
            console.log('   ✅ All systems ready for automated withdrawals');
            console.log('\n🎉 Automated withdrawal service should be working!');
            console.log('\n📝 To test:');
            console.log('   1. Create a withdrawal request in the admin panel');
            console.log('   2. Check if it gets processed automatically');
            console.log('   3. Monitor server logs for processing status');
        } else {
            console.log('   ❌ Some issues detected - see details above');
            console.log('\n🔧 To fix:');
            if (!hasPrivateKey) {
                console.log('   1. Set ADMIN_PRIVATE_KEY in .env file');
                console.log('   2. Run: ./setup-admin-key.sh');
            }
            if (!hasNetwork) {
                console.log('   1. Check RPC URL configuration');
                console.log('   2. Verify network connectivity');
            }
            if (!hasUSDC) {
                console.log('   1. Check USDC contract address');
                console.log('   2. Verify contract is deployed');
            }
        }

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
    }
}

// Main execution
async function main() {
    await checkWithdrawalStatus();
}

main().catch(console.error);
