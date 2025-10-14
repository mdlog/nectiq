const http = require('http');

console.log('🔧 Testing Real Balance API...');

// Test API endpoint
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user/real-balance',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
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
        } catch (error) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ API Error:', error.message);
    console.log('💡 Make sure the server is running on port 3000');
});

req.setTimeout(5000, () => {
    console.error('❌ API Request timeout');
    req.destroy();
});

req.end();
