import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users in database...\n');
    
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        "walletAddress" as wallet_address,
        "isAdmin" as is_admin,
        balance,
        "authMethod" as auth_method,
        "createdAt" as created_at
      FROM users 
      WHERE "isAdmin" = true
      ORDER BY "createdAt" DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin users found in database');
    } else {
      console.log(`✅ Found ${result.rows.length} admin user(s):\n`);
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. Admin User:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Wallet: ${user.wallet_address || 'Not linked'}`);
        console.log(`   Balance: ${user.balance} NTIQ`);
        console.log(`   Auth Method: ${user.auth_method}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check all users count
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users in database: ${totalUsers.rows[0].count}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAdminUsers();
