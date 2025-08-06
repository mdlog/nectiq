// Test script to verify reward history endpoint functionality
import axios from 'axios';

const BASE_URL = 'https://47d29634-f8f3-4946-b3c4-6997a7be5fab-00-3emxal5465s4.picard.replit.dev';

async function testRewardEndpoint() {
  try {
    console.log('🔍 Testing reward history endpoint...');
    
    // Test with dummy session to see authentication behavior
    const response = await axios.get(`${BASE_URL}/api/user/rewards/history`, {
      headers: {
        'Cookie': 'nectiq.session=s%3ApO-GXL_TDfpylSnoTXS-KnzKyc5LSuaA.HWgtdN0DEn2%2BSfvgL2IvgqWZoXbdPfGEH4zDCIf0Ktg',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('📊 Response data:', response.data);
    console.log('🎁 Number of rewards:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('🔍 Sample reward:', response.data[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing reward endpoint:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testRewardEndpoint();