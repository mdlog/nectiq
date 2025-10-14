const http = require('http');

console.log('🔧 Final Dashboard Test...');

// Test dashboard rendering
const testDashboard = async () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: '/user-dashboard',
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Test Browser)'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                // Check for React content
                const hasReactRoot = data.includes('<div id="root">');
                const hasMainTsx = data.includes('main.tsx');
                const hasViteClient = data.includes('@vite/client');

                // Check if there's any content in the root div
                const rootDivContent = data.match(/<div id="root">(.*?)<\/div>/s);
                const hasContentInRoot = rootDivContent && rootDivContent[1].trim().length > 0;

                // Check for error messages
                const hasError = data.includes('error') || data.includes('Error');

                resolve({
                    status: res.statusCode,
                    hasReactRoot,
                    hasMainTsx,
                    hasViteClient,
                    hasContentInRoot,
                    hasError,
                    rootDivContent: rootDivContent ? rootDivContent[1].trim().substring(0, 200) : 'No root div found',
                    htmlSize: data.length
                });
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

async function runTest() {
    try {
        console.log('\n📡 Testing User Dashboard...');

        const result = await testDashboard();
        console.log('📄 Dashboard Analysis:', {
            status: result.status,
            htmlSize: result.htmlSize,
            hasReactRoot: result.hasReactRoot,
            hasMainTsx: result.hasMainTsx,
            hasViteClient: result.hasViteClient,
            hasContentInRoot: result.hasContentInRoot,
            hasError: result.hasError
        });

        if (result.hasContentInRoot) {
            console.log('✅ React content found:', result.rootDivContent);
        } else {
            console.log('❌ No React content in root div');
        }

        console.log('\n📋 Diagnosis:');

        if (result.status === 200) {
            console.log('✅ Server responds correctly');

            if (result.hasReactRoot && result.hasMainTsx && result.hasViteClient) {
                console.log('✅ React infrastructure present');

                if (result.hasContentInRoot) {
                    console.log('✅ React is rendering content');
                    console.log('🎉 Dashboard should be working!');
                } else {
                    console.log('❌ React not rendering content');
                    console.log('💡 Problem: JavaScript error preventing React mounting');
                    console.log('🔧 Solution: Check browser console for errors');
                    console.log('🌐 Try opening http://localhost:5003/user-dashboard in browser');
                }
            } else {
                console.log('❌ React infrastructure missing');
            }
        } else {
            console.log('❌ Server error:', result.status);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

runTest();
