const http = require('http');

console.log('🔧 Testing React Simple Rendering...');

// Test if we can get the main HTML and check for React content
const testReactRendering = async () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: '/',
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
                // Check for React-specific content
                const hasReactRoot = data.includes('<div id="root">');
                const hasMainTsx = data.includes('main.tsx');
                const hasViteClient = data.includes('@vite/client');
                const hasScriptTags = data.includes('<script');

                // Check if there's any content in the root div
                const rootDivContent = data.match(/<div id="root">(.*?)<\/div>/s);
                const hasContentInRoot = rootDivContent && rootDivContent[1].trim().length > 0;

                resolve({
                    status: res.statusCode,
                    hasReactRoot,
                    hasMainTsx,
                    hasViteClient,
                    hasScriptTags,
                    hasContentInRoot,
                    rootDivContent: rootDivContent ? rootDivContent[1].trim().substring(0, 100) : 'No root div found',
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

async function testReact() {
    try {
        console.log('\n📡 Testing React Rendering...');

        const result = await testReactRendering();
        console.log('📄 Page Analysis:', {
            status: result.status,
            htmlSize: result.htmlSize,
            hasReactRoot: result.hasReactRoot,
            hasMainTsx: result.hasMainTsx,
            hasViteClient: result.hasViteClient,
            hasScriptTags: result.hasScriptTags,
            hasContentInRoot: result.hasContentInRoot
        });

        if (result.hasContentInRoot) {
            console.log('📝 Root div content:', result.rootDivContent);
        }

        console.log('\n📋 Analysis:');

        if (result.status === 200) {
            console.log('✅ Page loads successfully');

            if (result.hasReactRoot && result.hasMainTsx && result.hasViteClient) {
                console.log('✅ React infrastructure is present');

                if (result.hasContentInRoot) {
                    console.log('✅ React content is rendering');
                } else {
                    console.log('❌ React is not rendering content');
                    console.log('💡 This suggests a JavaScript error preventing React from mounting');
                    console.log('🔍 Check browser console for errors');
                }
            } else {
                console.log('❌ React infrastructure missing');
            }
        } else {
            console.log('❌ Page load failed');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReact();
