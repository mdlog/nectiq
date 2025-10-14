const http = require('http');

console.log('🔧 Debugging Dashboard Loading Issue...');

// Test the main page and user-dashboard route
const testRoute = async (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5003,
            path: path,
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
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    size: data.length,
                    hasReact: data.includes('React'),
                    hasVite: data.includes('vite'),
                    hasUserDashboard: data.includes('user-dashboard'),
                    hasError: data.includes('error') || data.includes('Error'),
                    title: data.match(/<title>(.*?)<\/title>/)?.[1] || 'No title'
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

async function debugDashboard() {
    try {
        console.log('\n📡 Testing Main Routes...');

        const homeResult = await testRoute('/');
        console.log('🏠 Home page (/):', {
            status: homeResult.status,
            size: homeResult.size,
            title: homeResult.title,
            hasReact: homeResult.hasReact,
            hasVite: homeResult.hasVite
        });

        const dashboardResult = await testRoute('/user-dashboard');
        console.log('👤 User Dashboard (/user-dashboard):', {
            status: dashboardResult.status,
            size: dashboardResult.size,
            title: dashboardResult.title,
            hasReact: dashboardResult.hasReact,
            hasVite: dashboardResult.hasVite,
            hasUserDashboard: dashboardResult.hasUserDashboard,
            hasError: dashboardResult.hasError
        });

        console.log('\n📋 Analysis:');

        if (homeResult.status === 200 && dashboardResult.status === 200) {
            console.log('✅ Both routes return 200 OK');

            if (homeResult.hasReact && dashboardResult.hasReact) {
                console.log('✅ React is loaded on both pages');
            } else {
                console.log('❌ React not found on one or both pages');
            }

            if (homeResult.hasVite && dashboardResult.hasVite) {
                console.log('✅ Vite dev server is working');
            } else {
                console.log('❌ Vite dev server issue');
            }

            if (dashboardResult.hasUserDashboard) {
                console.log('✅ User dashboard component is referenced');
            } else {
                console.log('❌ User dashboard component not found');
            }

            if (dashboardResult.hasError) {
                console.log('⚠️  Error text found in dashboard page');
            }

        } else {
            console.log('❌ Route access issue');
            console.log('Home:', homeResult.status);
            console.log('Dashboard:', dashboardResult.status);
        }

        // Test if it's a JavaScript error
        console.log('\n🔍 Checking for JavaScript Issues...');
        console.log('If pages load but dashboard doesn\'t work, check browser console for:');
        console.log('- JavaScript errors');
        console.log('- Network request failures');
        console.log('- Authentication errors');
        console.log('- Wallet connection issues');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugDashboard();
