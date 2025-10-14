const http = require('http');

console.log('🔧 Testing Server Status...');

// Test different endpoints
const endpoints = [
    '/api/health',
    '/api/user',
    '/api/user/real-balance',
    '/api/crypto/prices'
];

endpoints.forEach(endpoint => {
    const options = {
        hostname: 'localhost',
        port: 5003,
        path: endpoint,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 ${endpoint}: ${res.statusCode} ${res.statusMessage}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (data.includes('<!DOCTYPE html>')) {
                console.log(`   → Returns HTML (frontend)`);
            } else {
                try {
                    const response = JSON.parse(data);
                    console.log(`   → Returns JSON:`, Object.keys(response));
                } catch (error) {
                    console.log(`   → Raw response:`, data.substring(0, 100));
                }
            }
        });
    });

    req.on('error', (error) => {
        console.error(`❌ ${endpoint}:`, error.message);
    });

    req.setTimeout(3000, () => {
        console.error(`❌ ${endpoint}: Timeout`);
        req.destroy();
    });

    req.end();

    // Small delay between requests
    setTimeout(() => { }, 100);
});
