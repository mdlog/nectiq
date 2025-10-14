const http = require('http');

console.log('🔧 Testing Console Errors...');

// Test if we can get the main HTML and check for any error messages
const testConsoleErrors = async () => {
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
                // Check for error messages in HTML
                const hasError = data.includes('error') || data.includes('Error');
                const hasPreambleError = data.includes('preamble') || data.includes('Preamble');
                const hasReactRefresh = data.includes('RefreshRuntime');
                const hasViteClient = data.includes('@vite/client');

                // Check for script loading issues
                const hasScriptTags = data.includes('<script');
                const hasMainTsx = data.includes('main.tsx');

                resolve({
                    status: res.statusCode,
                    hasError,
                    hasPreambleError,
                    hasReactRefresh,
                    hasViteClient,
                    hasScriptTags,
                    hasMainTsx,
                    htmlSize: data.length,
                    errorSnippets: data.match(/error[^<]*/gi) || []
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

async function testErrors() {
    try {
        console.log('\n📡 Testing Console Errors...');

        const result = await testConsoleErrors();
        console.log('📄 Error Analysis:', {
            status: result.status,
            htmlSize: result.htmlSize,
            hasError: result.hasError,
            hasPreambleError: result.hasPreambleError,
            hasReactRefresh: result.hasReactRefresh,
            hasViteClient: result.hasViteClient,
            hasScriptTags: result.hasScriptTags,
            hasMainTsx: result.hasMainTsx
        });

        if (result.errorSnippets.length > 0) {
            console.log('❌ Error snippets found:', result.errorSnippets.slice(0, 3));
        }

        console.log('\n📋 Diagnosis:');

        if (result.hasPreambleError) {
            console.log('❌ React preamble error detected');
            console.log('💡 This is preventing React from loading');
            console.log('🔧 Need to fix Vite React plugin configuration');
        }

        if (result.hasReactRefresh) {
            console.log('⚠️  React refresh is still enabled');
            console.log('💡 This might be causing the preamble error');
        }

        if (result.hasViteClient && result.hasMainTsx) {
            console.log('✅ Vite infrastructure is present');
        }

        if (result.hasError) {
            console.log('❌ General errors found in HTML');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testErrors();
