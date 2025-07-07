import axios from 'axios';

async function testSurvivalStatus() {
  try {
    // Test dengan user EliteLegend3085 yang seharusnya winner (user_id 62)
    const response = await axios.post('http://localhost:5000/api/auth/wallet-login', {
      walletAddress: '0x6b7d1959867e911391807b8d764b99a7b706ff6d', // EliteLegend3085
      signature: 'test_signature_for_testing'
    });

    console.log('Authentication response:', response.status);
    
    if (response.data.success) {
      const cookies = response.headers['set-cookie'];
      console.log('Raw cookies from login:', cookies);
      
      // Extract session cookie
      let sessionCookie = '';
      if (cookies && cookies.length > 0) {
        sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid=')) || cookies[0];
        console.log('Session cookie to send:', sessionCookie);
      }
      
      // Test survival status endpoint
      const statusResponse = await axios.get('http://localhost:5000/api/user/survival-status', {
        headers: {
          'Cookie': sessionCookie
        },
        withCredentials: true
      });
      
      console.log('\n=== SURVIVAL STATUS RESPONSE ===');
      console.log(JSON.stringify(statusResponse.data, null, 2));
      
      // Check if user has winner status
      const tournaments = statusResponse.data.tournaments || [];
      const winnerTournaments = tournaments.filter(t => t.status === 'winner');
      
      console.log('\n=== WINNER TOURNAMENTS ===');
      console.log(`Found ${winnerTournaments.length} winner tournaments:`);
      winnerTournaments.forEach(t => {
        console.log(`- Tournament: ${t.title}`);
        console.log(`  Status: ${t.status}`);
        console.log(`  Prize Pool: ${t.prizePool} NTIQ`);
        console.log(`  Final Position: ${t.finalPosition || 'N/A'}`);
      });
      
    }
  } catch (error) {
    console.error('Error testing survival status:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testSurvivalStatus();