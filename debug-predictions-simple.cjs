const https = require('https');

async function checkPredictions() {
    try {
        console.log('🔍 Checking recent predictions via API...\n');

        // Check if server is running
        const healthCheck = await fetch('http://localhost:5003/api/health');
        if (!healthCheck.ok) {
            console.log('❌ Server not running or health check failed');
            return;
        }

        console.log('✅ Server is running');

        // We can't directly access the database, but we can check the logs
        // Let's create a simple test to see what's happening

        console.log('\n📝 Debugging Steps:');
        console.log('1. Check browser console for any errors');
        console.log('2. Check if prediction form is submitting correctly');
        console.log('3. Check if blockchain transaction is confirmed');
        console.log('4. Check if backend endpoint is receiving the data');

        console.log('\n🔧 Potential Issues:');
        console.log('- Query invalidation might not be working');
        console.log('- Database transaction might not be committed');
        console.log('- Frontend cache might be stale');
        console.log('- User authentication might be lost');

        console.log('\n💡 Solutions to try:');
        console.log('1. Refresh the page manually');
        console.log('2. Click the refresh button in Active Predictions');
        console.log('3. Check browser network tab for API calls');
        console.log('4. Clear browser cache and cookies');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPredictions();
