const { ethers } = require('ethers');

async function testContractInteraction() {
    console.log('🔍 Testing Multi-Token Vault Contract Interaction (v2)...');
    
    // Contract details
    const VAULT_ADDRESS = '0x07d47A12F2f1224e8a1bE4e25fA5Ce7d3C6812d2';
    const USDC_ADDRESS = '0x8B0180f2101c8260d49339abfEe87927412494B4';
    const RPC_URL = 'https://rpc-amoy.polygon.technology';
    
    try {
        // Connect to RPC
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        console.log('✅ Connected to RPC');
        
        // Check contract is deployed
        const code = await provider.getCode(VAULT_ADDRESS);
        if (code === '0x') {
            console.log('❌ Contract not deployed at address:', VAULT_ADDRESS);
            return;
        }
        console.log('✅ Contract deployed and verified');
        
        // Contract ABI (only functions that exist)
        const contractABI = [
            "function getUserBalance(address user, address token) public view returns (uint256)",
            "function isTokenSupported(address token) public view returns (bool)",
            "function getUserBalances(address user) public view returns (uint256 pol, uint256 weth, uint256 usdc, uint256 link)"
        ];
        
        const contract = new ethers.Contract(VAULT_ADDRESS, contractABI, provider);
        
        // Test token support
        const isUSDCSupported = await contract.isTokenSupported(USDC_ADDRESS);
        console.log('✅ USDC supported:', isUSDCSupported);
        
        // Test user balances (zero address)
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const balances = await contract.getUserBalances(zeroAddress);
        console.log('✅ Zero address balances:', {
            POL: ethers.formatEther(balances[0]),
            WETH: ethers.formatEther(balances[1]),
            USDC: ethers.formatUnits(balances[2], 6),
            LINK: ethers.formatEther(balances[3])
        });
        
        // Test specific token balance
        const usdcBalance = await contract.getUserBalance(zeroAddress, USDC_ADDRESS);
        console.log('✅ Zero address USDC balance:', ethers.formatUnits(usdcBalance, 6), 'USDC');
        
        console.log('✅ All contract interactions successful!');
        
    } catch (error) {
        console.error('❌ Contract interaction failed:', error);
    }
}

testContractInteraction();
