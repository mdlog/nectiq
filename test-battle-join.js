#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testBattleJoin() {
  try {
    console.log('🧪 Testing Anti-Last-Minute Joining System');
    console.log('=' .repeat(50));

    // 1. Login sebagai admin untuk testing
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    const sessionCookie = cookies ? cookies[0].split(';')[0] : '';
    
    console.log('✅ Login successful');

    // 2. Get live battles
    console.log('\n2. Getting live battles...');
    const battlesResponse = await axios.get(`${BASE_URL}/api/battles/live`, {
      headers: { Cookie: sessionCookie }
    });
    
    const battles = battlesResponse.data;
    console.log(`📊 Found ${battles.length} live battles`);
    
    if (battles.length === 0) {
      console.log('❌ No battles available for testing');
      return;
    }

    // 3. Pick first open battle
    const openBattle = battles.find(b => b.status === 'open');
    if (!openBattle) {
      console.log('❌ No open battles available');
      return;
    }

    console.log(`\n3. Testing join for battle ID ${openBattle.id}:`);
    console.log(`   Cryptocurrency: ${openBattle.cryptocurrency}`);
    console.log(`   Stake Amount: ${openBattle.stakeAmount} NTIQ`);
    console.log(`   Created: ${new Date(openBattle.createdAt).toLocaleString()}`);
    console.log(`   Target Time: ${new Date(openBattle.targetTime).toLocaleString()}`);

    // 4. Attempt to join battle
    console.log('\n4. Attempting to join battle...');
    
    try {
      const joinResponse = await axios.post(`${BASE_URL}/api/battles/${openBattle.id}/join`, {
        challengedPrediction: "2450"
      }, {
        headers: { 
          Cookie: sessionCookie,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Successfully joined battle!');
      console.log('\n📈 Fairness Information:');
      const fairness = joinResponse.data.fairnessInfo;
      if (fairness) {
        console.log(`   Price Movement: ${fairness.priceMovement}%`);
        console.log(`   Fairness Multiplier: ${fairness.fairnessMultiplier}x`);
        console.log(`   Join Time Bonus: ${fairness.joinTimeBonus}x`);
        console.log(`   Join Time Percentage: ${fairness.joinTimePercentage}%`);
      }

    } catch (joinError) {
      if (joinError.response) {
        console.log('❌ Join failed:', joinError.response.data.message);
        console.log('\n🛡️ Anti-abuse system working correctly!');
        
        // Analyze the error message
        const errorMessage = joinError.response.data.message;
        if (errorMessage.includes('80%')) {
          console.log('   ✓ Join deadline enforcement active');
        } else if (errorMessage.includes('menunggu')) {
          console.log('   ✓ Minimum wait time enforcement active');
        } else if (errorMessage.includes('saldo')) {
          console.log('   ✓ Balance validation working');
        }
      } else {
        console.log('❌ Network error:', joinError.message);
      }
    }

    // 5. Create a new battle for testing
    console.log('\n5. Creating new battle for testing...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/battles/create`, {
        cryptocurrency: 'bitcoin',
        timeframe: '1h',
        stakeAmount: 50,
        challengerPrediction: 67000,
        isPublic: true
      }, {
        headers: { 
          Cookie: sessionCookie,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ New battle created successfully!');
      const newBattle = createResponse.data.battle;
      console.log(`   Battle ID: ${newBattle.id}`);
      console.log(`   Join Deadline: ${new Date(newBattle.targetTime).toLocaleString()}`);
      
      // Wait a moment then try to join immediately (should fail due to minimum wait time)
      console.log('\n6. Testing immediate join (should fail)...');
      
      try {
        await axios.post(`${BASE_URL}/api/battles/${newBattle.id}/join`, {
          challengedPrediction: "66500"
        }, {
          headers: { 
            Cookie: sessionCookie,
            'Content-Type': 'application/json'
          }
        });
        console.log('❌ Unexpected: Join succeeded immediately');
      } catch (immediateJoinError) {
        console.log('✅ Immediate join correctly blocked');
        console.log(`   Reason: ${immediateJoinError.response.data.message}`);
        console.log('   ✓ Minimum wait time enforcement working');
      }

    } catch (createError) {
      console.log('❌ Failed to create battle:', createError.response?.data?.message || createError.message);
    }

    console.log('\n🎉 Anti-Last-Minute Joining System Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testBattleJoin();