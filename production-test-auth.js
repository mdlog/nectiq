// Test production authentication in different environments
const axios = require('axios');

const TEST_WALLET = "0x3e4d881819768fab30c5a79f3a9a7e69f0a935a4";

async function testProductionAuth() {
  console.log('🔍 Testing Production Authentication...');
  
  const BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://nectiq.replit.app' 
    : 'http://localhost:3000';
    
  console.log('🌐 Testing against:', BASE_URL);
  
  try {
    // Test 1: Wallet Connect Endpoint
    console.log('\n📡 Testing wallet connect endpoint...');
    const connectResponse = await axios.post(`${BASE_URL}/api/auth/wallet-connect`, {
      walletAddress: TEST_WALLET
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Wallet Connect Status:', connectResponse.status);
    console.log('✅ Wallet Connect Response:', connectResponse.data);
    console.log('✅ Session Cookie Set:', !!connectResponse.headers['set-cookie']);
    
    // Extract session cookie
    const cookies = connectResponse.headers['set-cookie'];
    let sessionCookie = '';
    if (cookies) {
      sessionCookie = cookies.find(cookie => cookie.includes('connect.sid'));
      console.log('🍪 Session Cookie:', sessionCookie?.substring(0, 50) + '...');
    }
    
    // Test 2: User Info Endpoint with Session
    console.log('\n👤 Testing user info endpoint with session...');
    const userResponse = await axios.get(`${BASE_URL}/api/user`, {
      withCredentials: true,
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User Info Status:', userResponse.status);
    console.log('✅ User Info Response:', userResponse.data);
    
    // Test 3: Direct Database Check
    console.log('\n🗃️ Testing direct database status...');
    const dbResponse = await axios.get(`${BASE_URL}/api/health`, {
      withCredentials: true
    });
    
    console.log('✅ Database Status:', dbResponse.status);
    
    console.log('\n✨ Production Authentication Test Complete!');
    
  } catch (error) {
    console.error('❌ Production Authentication Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Connection refused - server may not be running');
    }
  }
}

// Run test
testProductionAuth().catch(console.error);