const http = require('http');

console.log('🔧 Testing Real Balance API with Authentication...');

// Test with a mock session cookie
const options = {
    hostname: 'localhost',
    port: 5003,
    path: '/api/user/real-balance',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=mock_session_id'
    }
};

const req = http.request(options, (res) => {
    console.log(`📡 API Response Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('📋 API Response Body:');
        try {
            const response = JSON.parse(data);
            console.log(JSON.stringify(response, null, 2));

            if (response.realNTIQBalance !== undefined) {
                console.log('\n✅ Real balance API is working!');
                console.log(`Real NTIQ Balance: ${response.realNTIQBalance}`);
                console.log(`Database Balance: ${response.databaseBalance}`);
            }
        } catch (error) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ API Error:', error.message);
});

req.setTimeout(5000, () => {
    console.error('❌ API Request timeout');
    req.destroy();
});

req.end();
