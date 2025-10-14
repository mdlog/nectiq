const http = require('http');

console.log('🔧 Testing Dashboard Debug...');

// Test authentication endpoints
const testAuth = async () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: '/api/user',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Test-Agent'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        message: response.message,
                        hasUser: response.user !== undefined
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        message: 'Invalid JSON',
                        data: data.substring(0, 100)
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Test wallet connect endpoint
const testWalletConnect = async () => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            walletAddress: '0x1234567890123456789012345678901234567890'
        });

        const options = {
            hostname: 'localhost',
            port: 5003,
            path: '/api/auth/wallet-connect',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Test-Agent'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        success: response.success,
                        hasUser: response.user !== undefined,
                        message: response.message
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        message: 'Invalid JSON',
                        data: data.substring(0, 100)
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            reject(new Error('Timeout'));
        });

        req.write(postData);
        req.end();
    });
};

async function runTests() {
    try {
        console.log('\n📡 Testing Authentication Endpoints...');

        const authResult = await testAuth();
        console.log('🔐 /api/user:', authResult);

        const walletResult = await testWalletConnect();
        console.log('🔗 /api/auth/wallet-connect:', walletResult);

        console.log('\n📋 Analysis:');
        if (authResult.status === 401) {
            console.log('✅ Authentication working correctly - requires login');
        } else if (authResult.status === 200) {
            console.log('⚠️  User already authenticated - this might be the issue');
        } else {
            console.log('❌ Unexpected authentication status');
        }

        if (walletResult.status === 200 && walletResult.success) {
            console.log('✅ Wallet connect working - new user created');
        } else if (walletResult.status === 200) {
            console.log('⚠️  Wallet connect responded but no success');
        } else {
            console.log('❌ Wallet connect failed');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTests();
