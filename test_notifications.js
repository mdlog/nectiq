// Test script to create sample notifications
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createTestNotifications() {
  try {
    await client.connect();
    
    // Get a test user ID (assuming user with ID 1 exists)
    const userId = 4; // DeltaMaster9658
    
    // Create sample notifications
    const notifications = [
      {
        userId,
        type: 'deposit',
        status: 'completed',
        amount: 10000,
        token: 'USDC',
        message: 'Deposit successful! Your USDC funds have been credited to your account.',
        relatedId: 12
      },
      {
        userId,
        type: 'withdrawal',
        status: 'processing',
        amount: 5000,
        token: null,
        message: 'Withdrawal is being processed. Funds will be sent to your wallet within minutes.',
        relatedId: null
      },
      {
        userId,
        type: 'purchase',
        status: 'completed',
        amount: 100,
        token: null,
        message: 'Prediction purchase successful! Battle prediction has been created.',
        relatedId: 5
      },
      {
        userId,
        type: 'deposit',
        status: 'failed',
        amount: 2500,
        token: 'USDT',
        message: 'Deposit failed! Please try again or contact customer service.',
        relatedId: null
      },
      {
        userId,
        type: 'withdrawal',
        status: 'completed',
        amount: 15000,
        token: null,
        message: 'Withdrawal successful! Funds have been sent to your wallet.',
        relatedId: 8
      }
    ];
    
    for (const notification of notifications) {
      const query = `
        INSERT INTO notifications (user_id, type, status, amount, token, message, is_read, related_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `;
      
      await client.query(query, [
        notification.userId,
        notification.type,
        notification.status,
        notification.amount,
        notification.token,
        notification.message,
        false, // is_read
        notification.relatedId
      ]);
      
      console.log(`✅ Created notification: ${notification.message}`);
    }
    
    console.log('\n🎉 All test notifications created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await client.end();
  }
}

createTestNotifications();