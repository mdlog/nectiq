const { ethers } = require('ethers');

async function testDepositSimulation() {
    console.log('🔍 Testing Deposit Simulation...');
    
    // Contract details
    const VAULT_ADDRESS = '0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2';
    const USDC_ADDRESS = '0x8B0180f2101c8260d49339abfEe87927412494B4';
    const RPC_URL = 'https://rpc-amoy.polygon.technology';
    
    try {
        // Connect to RPC
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        console.log('✅ Connected to RPC');
        
        // Contract ABI for deposit function
        const contractABI = [
            "function depositToken(address token, uint256 amount) external nonReentrant whenNotPaused"
        ];
        
        const contract = new ethers.Contract(VAULT_ADDRESS, contractABI, provider);
        
        // Simulate deposit parameters (same as error message)
        const tokenAddress = USDC_ADDRESS;
        const amount = ethers.parseUnits('1', 6); // 1 USDC (6 decimals)
        
        console.log('📝 Deposit Parameters:');
        console.log('  Token Address:', tokenAddress);
        console.log('  Amount (wei):', amount.toString());
        console.log('  Amount (USDC):', ethers.formatUnits(amount, 6));
        
        // Try to estimate gas (this will fail if there's an issue)
        try {
            const gasEstimate = await contract.depositToken.estimateGas(tokenAddress, amount);
            console.log('✅ Gas estimate successful:', gasEstimate.toString());
        } catch (gasError) {
            console.log('❌ Gas estimation failed:', gasError.message);
            
            // Check if it's an allowance issue
            if (gasError.message.includes('ERC20: insufficient allowance')) {
                console.log('💡 ISSUE IDENTIFIED: Insufficient allowance!');
                console.log('   User needs to approve USDC spending first.');
            } else if (gasError.message.includes('ERC20: transfer amount exceeds balance')) {
                console.log('💡 ISSUE IDENTIFIED: Insufficient balance!');
                console.log('   User does not have enough USDC.');
            } else {
                console.log('💡 Other issue detected:', gasError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testDepositSimulation();
