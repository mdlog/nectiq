const { ethers } = require('ethers');
require('dotenv').config();

const NTIQ_TOKEN_ADDRESS = process.env.NTIQ_TOKEN_SIMPLE_ADDRESS;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL;

console.log('🔧 Testing New User NTIQ Token Distribution System...');
console.log('NTIQ Token Address:', NTIQ_TOKEN_ADDRESS);
console.log('RPC URL:', POLYGON_AMOY_RPC_URL ? 'Set' : 'Not set');
console.log('Deployer Key:', DEPLOYER_PRIVATE_KEY ? 'Set' : 'Not set');

if (!NTIQ_TOKEN_ADDRESS || !DEPLOYER_PRIVATE_KEY || !POLYGON_AMOY_RPC_URL) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

// Simple NTIQ Token ABI (minimal)
const NTIQ_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

async function testNewUserTokenDistribution() {
    try {
        console.log('\n🌐 Connecting to Polygon Amoy...');
        const provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);
        const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
        const ntiqTokenContract = new ethers.Contract(NTIQ_TOKEN_ADDRESS, NTIQ_ABI, wallet);

        console.log('✅ Connected to blockchain');

        // Test contract info
        console.log('\n📋 Contract Information:');
        const name = await ntiqTokenContract.name();
        const symbol = await ntiqTokenContract.symbol();
        const decimals = await ntiqTokenContract.decimals();

        console.log('Name:', name);
        console.log('Symbol:', symbol);
        console.log('Decimals:', decimals);

        // Check deployer balance
        console.log('\n💰 Deployer Balance:');
        const deployerBalance = await ntiqTokenContract.balanceOf(wallet.address);
        const deployerBalanceFormatted = parseFloat(ethers.formatEther(deployerBalance));

        console.log('Deployer Address:', wallet.address);
        console.log('Deployer Balance:', deployerBalanceFormatted, 'NTIQ');

        // Test simulating new user token distribution
        console.log('\n🎁 Testing New User Token Distribution:');
        const testUserAddress = '0x1234567890123456789012345678901234567890';
        const distributionAmount = 1000;

        // Check if we have enough tokens to distribute
        if (deployerBalanceFormatted < distributionAmount) {
            console.log(`❌ Insufficient balance. Need ${distributionAmount} NTIQ, have ${deployerBalanceFormatted} NTIQ`);
            return;
        }

        console.log(`📤 Simulating distribution of ${distributionAmount} NTIQ to test address: ${testUserAddress}`);

        // Estimate gas for transfer
        try {
            const amountWei = ethers.parseEther(distributionAmount.toString());
            const gasEstimate = await ntiqTokenContract.transfer.estimateGas(testUserAddress, amountWei);
            console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);

            // Get current gas price
            const gasPrice = await provider.getFeeData();
            console.log(`⛽ Gas price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);

            // Calculate total cost
            const totalCost = gasEstimate * gasPrice.gasPrice;
            console.log(`💰 Estimated total cost: ${ethers.formatEther(totalCost)} ETH`);

            console.log('\n✅ Token distribution simulation successful!');
            console.log('🎯 System is ready to distribute 1000 NTIQ to new users');

        } catch (error) {
            console.error('❌ Error simulating transfer:', error.message);
        }

    } catch (error) {
        console.error('❌ Error testing token distribution:', error.message);
        console.error('Stack:', error.stack);
    }
}

testNewUserTokenDistribution();
