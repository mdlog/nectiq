const https = require('https');

async function testPredictionsAPI() {
    try {
        console.log('🧪 Testing Predictions API...\n');

        // Test server health
        console.log('1. Testing server health...');
        try {
            const healthResponse = await fetch('http://localhost:5003/api/health');
            if (healthResponse.ok) {
                console.log('✅ Server is running');
            } else {
                console.log('❌ Server health check failed');
                return;
            }
        } catch (error) {
            console.log('❌ Server not accessible:', error.message);
            return;
        }

        // Test active predictions endpoint (will fail without auth, but we can see the response)
        console.log('\n2. Testing /api/predictions/active endpoint...');
        try {
            const activeResponse = await fetch('http://localhost:5003/api/predictions/active');
            const activeData = await activeResponse.text();
            console.log('Response status:', activeResponse.status);
            console.log('Response:', activeData);
        } catch (error) {
            console.log('❌ Active predictions endpoint error:', error.message);
        }

        // Test user endpoint
        console.log('\n3. Testing /api/user endpoint...');
        try {
            const userResponse = await fetch('http://localhost:5003/api/user');
            const userData = await userResponse.text();
            console.log('Response status:', userResponse.status);
            console.log('Response:', userData);
        } catch (error) {
            console.log('❌ User endpoint error:', error.message);
        }

        console.log('\n📝 Debugging Instructions:');
        console.log('1. Open browser to http://localhost:5003');
        console.log('2. Connect wallet as UltraWolf5637');
        console.log('3. Open Developer Tools (F12)');
        console.log('4. Go to Console tab');
        console.log('5. Try making a prediction');
        console.log('6. Look for logs starting with:');
        console.log('   - ✅ [PREDICTION-BLOCKCHAIN]');
        console.log('   - ✅ [ACTIVE-PREDICTIONS]');
        console.log('   - ❌ [Any error messages]');
        console.log('\n7. Try clicking the refresh button in Active Predictions');
        console.log('8. Check if prediction appears');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testPredictionsAPI();
