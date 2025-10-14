const http = require('http');

console.log('🔧 Testing Dashboard Access...');

// Test different routes
const routes = [
    '/',
    '/user-dashboard',
    '/api/user',
    '/api/user/real-balance'
];

routes.forEach(route => {
    const options = {
        hostname: 'localhost',
        port: 5003,
        path: route,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Test-Agent'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 ${route}: ${res.statusCode} ${res.statusMessage}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (data.includes('<!DOCTYPE html>')) {
                console.log(`   → Returns HTML (${data.length} bytes)`);
                if (data.includes('user-dashboard')) {
                    console.log(`   → Contains user-dashboard reference`);
                }
                if (data.includes('error') || data.includes('Error')) {
                    console.log(`   → Contains error text`);
                }
            } else if (data.includes('{')) {
                try {
                    const response = JSON.parse(data);
                    console.log(`   → Returns JSON:`, Object.keys(response));
                } catch (error) {
                    console.log(`   → Invalid JSON:`, data.substring(0, 100));
                }
            } else {
                console.log(`   → Raw response:`, data.substring(0, 100));
            }
        });
    });

    req.on('error', (error) => {
        console.error(`❌ ${route}:`, error.message);
    });

    req.setTimeout(5000, () => {
        console.error(`❌ ${route}: Timeout`);
        req.destroy();
    });

    req.end();

    // Small delay between requests
    setTimeout(() => { }, 200);
});
