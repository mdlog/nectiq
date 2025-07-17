/**
 * CRITICAL BUG FIX - Manual Balance Correction
 * 
 * Problem: Withdrawal ID 3 and 4 were marked "rejected" but ETH was sent to blockchain
 * This means user received ETH without balance deduction - causing financial loss
 * 
 * Solution: Manually deduct user balance and create proper transaction logs
 */

import { db } from './server/db.js';
import { users, transactionLogs } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function fixWithdrawalBug() {
  console.log('🚨 FIXING CRITICAL WITHDRAWAL BUG');
  console.log('Withdrawals ID 3 & 4: ETH sent but balance not deducted');
  
  try {
    // Get current user balance
    const user = await db.select().from(users).where(eq(users.id, 2)).limit(1);
    if (!user.length) {
      console.error('❌ User ID 2 not found!');
      return;
    }
    
    const currentBalance = user[0].balance;
    console.log(`👤 User ${user[0].username} current balance: ${currentBalance} NTIQ`);
    
    // Withdrawal ID 3: 1000 NTIQ
    // Withdrawal ID 4: 500 NTIQ
    // Total to deduct: 1500 NTIQ
    
    const totalDeduction = 1500;
    const newBalance = currentBalance - totalDeduction;
    
    console.log(`💰 Deducting ${totalDeduction} NTIQ from balance`);
    console.log(`💰 New balance will be: ${newBalance} NTIQ`);
    
    // Update user balance
    await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, 2));
    
    // Create transaction logs for audit trail
    const now = new Date();
    
    // Transaction log for withdrawal ID 3
    await db.insert(transactionLogs).values({
      userId: 2,
      type: 'withdrawal_completed',
      amount: -1000,
      token: 'NTIQ',
      hash: '0xbf24dee507c167f9e77873aa248f49e9bfb0f3e1dcb02f6192ee000786edc01d',
      description: 'Manual balance correction - Withdrawal ID 3 (Bug fix)',
      createdAt: now
    });
    
    // Transaction log for withdrawal ID 4  
    await db.insert(transactionLogs).values({
      userId: 2,
      type: 'withdrawal_completed',
      amount: -500,
      token: 'NTIQ', 
      hash: '0xc0e78eeb85c0e5fe1444c7831baa8a7a91cecec542259568ed14b654c202ad33',
      description: 'Manual balance correction - Withdrawal ID 4 (Bug fix)',
      createdAt: now
    });
    
    console.log('✅ Balance corrected successfully!');
    console.log('✅ Transaction logs created for audit trail');
    console.log(`✅ User balance: ${currentBalance} → ${newBalance} NTIQ`);
    console.log('✅ Financial integrity restored!');
    
  } catch (error) {
    console.error('❌ Error fixing withdrawal bug:', error);
  }
}

// Run the fix
fixWithdrawalBug().then(() => {
  console.log('🏁 Manual withdrawal fix completed');
  process.exit(0);
}).catch(console.error);