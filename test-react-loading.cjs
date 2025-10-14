const http = require('http');

console.log('🔧 Testing React Loading...');

// Test if React scripts are accessible
const testScript = async (scriptPath) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: scriptPath,
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Test-Agent'
            }
        };

        const req = http.request(options, (res) => {
            resolve({
                status: res.statusCode,
                contentType: res.headers['content-type'],
                size: res.headers['content-length'] || 'unknown'
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

async function testReactScripts() {
    try {
        console.log('\n📡 Testing React Scripts...');

        // Test main React scripts
        const scripts = [
            '/src/main.tsx',
            '/@vite/client',
            '/src/App.tsx'
        ];

        for (const script of scripts) {
            try {
                const result = await testScript(script);
                console.log(`📄 ${script}: ${result.status} (${result.contentType})`);
            } catch (error) {
                console.log(`❌ ${script}: ${error.message}`);
            }
        }

        // Test if the HTML contains proper script tags
        console.log('\n🔍 Checking HTML Structure...');

        const htmlResponse = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 5003,
                path: '/',
                method: 'GET'
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(data);
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

        console.log('HTML Analysis:');
        console.log('- Has root div:', htmlResponse.includes('<div id="root">'));
        console.log('- Has script tags:', htmlResponse.includes('<script'));
        console.log('- Has main.tsx:', htmlResponse.includes('main.tsx'));
        console.log('- Has vite client:', htmlResponse.includes('@vite/client'));

        if (htmlResponse.includes('<div id="root">') && htmlResponse.includes('main.tsx')) {
            console.log('✅ HTML structure looks correct');
            console.log('🔍 Issue might be in JavaScript execution');
            console.log('💡 Check browser console for JavaScript errors');
        } else {
            console.log('❌ HTML structure issue detected');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReactScripts();
