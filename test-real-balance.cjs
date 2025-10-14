const { ethers } = require('ethers');
require('dotenv').config();

const NTIQ_TOKEN_ADDRESS = process.env.NTIQ_TOKEN_SIMPLE_ADDRESS;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL;

console.log('🔧 Testing Real NTIQ Balance Service...');
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
    "function decimals() view returns (uint8)"
];

async function testRealBalance() {
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

        // Test balance for deployer
        console.log('\n💰 Testing Balance:');
        const deployerBalance = await ntiqTokenContract.balanceOf(wallet.address);
        const deployerBalanceFormatted = parseFloat(ethers.formatEther(deployerBalance));

        console.log('Deployer Address:', wallet.address);
        console.log('Deployer Balance:', deployerBalanceFormatted, 'NTIQ');

        // Test balance for a random address (should be 0)
        const testAddress = '0x6b7d123456789abcdef123456789abcdef123456';
        const testBalance = await ntiqTokenContract.balanceOf(testAddress);
        const testBalanceFormatted = parseFloat(ethers.formatEther(testBalance));

        console.log('Test Address:', testAddress);
        console.log('Test Balance:', testBalanceFormatted, 'NTIQ');

        console.log('\n✅ Real balance service is working correctly!');

    } catch (error) {
        console.error('❌ Error testing real balance:', error.message);
        console.error('Stack:', error.stack);
    }
}

testRealBalance();
