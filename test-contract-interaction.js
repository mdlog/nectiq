const { ethers } = require('ethers');

async function testContractInteraction() {
    console.log('🔍 Testing Multi-Token Vault Contract Interaction...');
    
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
        
        // Contract ABI (minimal)
        const contractABI = [
            "function getUserBalance(address user, address token) public view returns (uint256)",
            "function isTokenSupported(address token) public view returns (bool)",
            "function getTokenInfo(address token) public view returns (string memory name, string memory symbol, uint8 decimals, uint256 minDeposit, uint256 maxDeposit, uint256 minWithdrawal)"
        ];
        
        const contract = new ethers.Contract(VAULT_ADDRESS, contractABI, provider);
        
        // Test token support
        const isUSDCSupported = await contract.isTokenSupported(USDC_ADDRESS);
        console.log('✅ USDC supported:', isUSDCSupported);
        
        // Test token info
        const tokenInfo = await contract.getTokenInfo(USDC_ADDRESS);
        console.log('✅ USDC Token Info:', {
            name: tokenInfo[0],
            symbol: tokenInfo[1],
            decimals: tokenInfo[2].toString(),
            minDeposit: ethers.formatUnits(tokenInfo[3], tokenInfo[2]),
            maxDeposit: ethers.formatUnits(tokenInfo[4], tokenInfo[2]),
            minWithdrawal: ethers.formatUnits(tokenInfo[5], tokenInfo[2])
        });
        
        // Test user balance (zero address)
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        const balance = await contract.getUserBalance(zeroAddress, USDC_ADDRESS);
        console.log('✅ Zero address USDC balance:', ethers.formatUnits(balance, 6), 'USDC');
        
        console.log('✅ All contract interactions successful!');
        
    } catch (error) {
        console.error('❌ Contract interaction failed:', error);
    }
}

testContractInteraction();
