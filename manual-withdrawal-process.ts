import { ethers } from 'ethers';
import { storage } from './server/storage.js';
import { db } from './server/db.js';
import { withdrawals } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function processWithdrawalManually() {
  console.log('🔧 [MANUAL] Starting manual withdrawal processing...');
  
  try {
    
    // Get pending withdrawals directly from database
    const pendingWithdrawals = await db.select().from(withdrawals).where(eq(withdrawals.status, 'pending'));
    console.log(`📋 [MANUAL] Found ${pendingWithdrawals.length} pending withdrawals`);
    
    if (pendingWithdrawals.length === 0) {
      console.log('✅ [MANUAL] No pending withdrawals to process');
      return;
    }
    
    // Get environment variables
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
    // Try multiple RPC endpoints untuk reliability
    const SEPOLIA_RPC_ENDPOINTS = [
      "https://eth-sepolia.public.blastapi.io",
      "https://sepolia.gateway.tenderly.co",
      "https://rpc.sepolia.org",
      "https://ethereum-sepolia-rpc.publicnode.com"
    ];
    const SEPOLIA_RPC_URL = SEPOLIA_RPC_ENDPOINTS[0]; // Gunakan yang pertama
    
    if (!ADMIN_PRIVATE_KEY) {
      throw new Error('Missing ADMIN_PRIVATE_KEY environment variable');
    }
    
    console.log('🔑 [MANUAL] Environment variables loaded successfully');
    console.log(`🌐 [MANUAL] Using Sepolia RPC: ${SEPOLIA_RPC_URL}`);
    
    // Setup provider and wallet
    console.log('🔗 [MANUAL] Creating provider connection...');
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    console.log('🔑 [MANUAL] Creating wallet from private key...');
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    
    console.log(`💰 [MANUAL] Admin wallet: ${wallet.address}`);
    
    try {
      console.log('🌐 [MANUAL] Testing network connection...');
      const network = await provider.getNetwork();
      console.log(`✅ [MANUAL] Connected to network: ${network.name} (chainId: ${network.chainId})`);
      
      console.log('💰 [MANUAL] Checking wallet balance...');
      const balance = await provider.getBalance(wallet.address);
      console.log(`💰 [MANUAL] Wallet balance: ${ethers.formatEther(balance)} ETH`);
    } catch (error) {
      console.log(`❌ [MANUAL] Network connection failed: ${error}`);
      throw error;
    }
    
    // Process each withdrawal
    for (const withdrawal of pendingWithdrawals) {
      console.log(`\n🔄 [MANUAL] Processing withdrawal ID ${withdrawal.id}`);
      console.log(`   User: ${withdrawal.userId}`);
      console.log(`   Amount: ${withdrawal.ntiqAmount} NTIQ`);
      console.log(`   To: ${withdrawal.toWalletAddress}`);
      console.log(`   Token: ${withdrawal.tokenType}`);
      console.log(`   Network: ${withdrawal.chainName}`);
      
      try {
        if (withdrawal.tokenType === 'ETH' && withdrawal.chainName === 'sepolia') {
          // Get current ETH price for conversion
          const ethPrice = 3100; // Using fixed price for now
          const usdAmount = withdrawal.ntiqAmount * 0.01; // 1 NTIQ = $0.01
          const ethAmount = usdAmount / ethPrice;
          const netEthAmount = ethAmount * 0.975; // Deduct 2.5% fee
          
          console.log(`💱 [MANUAL] Conversion: ${withdrawal.ntiqAmount} NTIQ = $${usdAmount} = ${ethAmount.toFixed(6)} ETH`);
          console.log(`💰 [MANUAL] Net amount after 2.5% fee: ${netEthAmount.toFixed(6)} ETH`);
          
          // Check admin wallet balance
          const balance = await provider.getBalance(wallet.address);
          const balanceEth = parseFloat(ethers.formatEther(balance));
          
          console.log(`💳 [MANUAL] Admin wallet balance: ${balanceEth.toFixed(6)} ETH`);
          
          if (balanceEth < netEthAmount) {
            console.log(`❌ [MANUAL] Insufficient balance for withdrawal ID ${withdrawal.id}`);
            await storage.updateWithdrawalStatus(withdrawal.id, 'rejected', null, 'Insufficient admin wallet balance');
            continue;
          }
          
          // Send ETH transaction
          const tx = {
            to: withdrawal.toWalletAddress,
            value: ethers.parseEther(netEthAmount.toFixed(18)),
            gasLimit: 21000,
            gasPrice: ethers.parseUnits('20', 'gwei')
          };
          
          console.log(`📤 [MANUAL] Sending ETH transaction...`);
          const transaction = await wallet.sendTransaction(tx);
          
          console.log(`⏳ [MANUAL] Transaction sent: ${transaction.hash}`);
          console.log(`🔍 [MANUAL] Waiting for confirmation...`);
          
          // Wait for confirmation
          const receipt = await transaction.wait();
          
          if (receipt && receipt.status === 1) {
            console.log(`✅ [MANUAL] Transaction confirmed! Block: ${receipt.blockNumber}`);
            console.log(`🔗 [MANUAL] Sepolia Explorer: https://sepolia.etherscan.io/tx/${transaction.hash}`);
            
            // Update withdrawal status to completed
            await storage.updateWithdrawalStatus(
              withdrawal.id, 
              'completed', 
              transaction.hash, 
              `Real ETH transaction sent to Sepolia testnet | Amount: ${netEthAmount.toFixed(6)} ETH`
            );
            
            console.log(`✅ [MANUAL] Withdrawal ID ${withdrawal.id} completed successfully`);
          } else {
            console.log(`❌ [MANUAL] Transaction failed for withdrawal ID ${withdrawal.id}`);
            await storage.updateWithdrawalStatus(withdrawal.id, 'rejected', transaction.hash, 'Blockchain transaction failed');
          }
          
        } else {
          console.log(`❌ [MANUAL] Unsupported withdrawal type: ${withdrawal.tokenType} on ${withdrawal.chainName}`);
          await storage.updateWithdrawalStatus(withdrawal.id, 'rejected', null, 'Unsupported token/network combination');
        }
        
      } catch (error) {
        console.error(`❌ [MANUAL] Error processing withdrawal ID ${withdrawal.id}:`, error);
        await storage.updateWithdrawalStatus(withdrawal.id, 'rejected', null, `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\n🎉 [MANUAL] All withdrawals processed successfully!');
    
  } catch (error) {
    console.error('❌ [MANUAL] Fatal error in manual processing:', error);
    throw error;
  }
}

// Run the manual processing
processWithdrawalManually()
  .then(() => {
    console.log('✅ [MANUAL] Manual withdrawal processing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ [MANUAL] Manual withdrawal processing failed:', error);
    process.exit(1);
  });