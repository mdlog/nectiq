const { ethers } = require('ethers');

async function checkUserStatus() {
    console.log('🔍 Checking User Status...');
    
    // Contract details
    const VAULT_ADDRESS = '0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2';
    const USDC_ADDRESS = '0x8B0180f2101c8260d49339abfEe87927412494B4';
    const USER_ADDRESS = '0x3e4d881819768fab30c5a79f3a9a7e69f0a935a4'; // CryptoPrince7298
    const RPC_URL = 'https://rpc-amoy.polygon.technology';
    
    try {
        // Connect to RPC
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        console.log('✅ Connected to RPC');
        
        // USDC ERC20 ABI
        const usdcABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcABI, provider);
        
        console.log('👤 User Address:', USER_ADDRESS);
        console.log('🏦 Vault Address:', VAULT_ADDRESS);
        console.log('💰 USDC Address:', USDC_ADDRESS);
        
        // Check USDC balance
        const balance = await usdcContract.balanceOf(USER_ADDRESS);
        const decimals = await usdcContract.decimals();
        const symbol = await usdcContract.symbol();
        
        console.log('💵 User USDC Balance:', ethers.formatUnits(balance, decimals), symbol);
        
        // Check allowance
        const allowance = await usdcContract.allowance(USER_ADDRESS, VAULT_ADDRESS);
        console.log('🔐 USDC Allowance:', ethers.formatUnits(allowance, decimals), symbol);
        
        // Check if balance is sufficient for 1 USDC
        const oneUSDC = ethers.parseUnits('1', decimals);
        const hasEnoughBalance = balance >= oneUSDC;
        console.log('✅ Sufficient Balance for 1 USDC:', hasEnoughBalance);
        
        // Check if allowance is sufficient for 1 USDC
        const hasEnoughAllowance = allowance >= oneUSDC;
        console.log('✅ Sufficient Allowance for 1 USDC:', hasEnoughAllowance);
        
        // Summary
        console.log('\n📋 SUMMARY:');
        if (!hasEnoughBalance) {
            console.log('❌ ISSUE: User does not have enough USDC balance');
        } else if (!hasEnoughAllowance) {
            console.log('❌ ISSUE: User has not approved USDC spending');
            console.log('💡 SOLUTION: User needs to approve USDC first');
        } else {
            console.log('✅ User is ready to deposit 1 USDC');
        }
        
    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

checkUserStatus();
