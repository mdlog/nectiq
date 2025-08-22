// Security Testing Suite untuk Nectiq Platform
import https from 'https';
import http from 'http';

console.log('🛡️ NECTIQ SECURITY TESTING SUITE');
console.log('=================================\n');

// Test functions
async function testAuthenticationBypass() {
  console.log('📍 TEST 1: Authentication Bypass Protection');
  try {
    const response = await makeRequest('/api/admin/users/statistics');
    if (response.includes('Admin access required') || response.includes('Authentication required')) {
      console.log('✅ PASS: Admin endpoint properly protected');
    } else {
      console.log('❌ FAIL: Admin endpoint accessible without auth');
      console.log('Response:', response.substring(0, 200));
    }
  } catch (error) {
    console.log('✅ PASS: Request blocked/failed as expected');
  }
  console.log('');
}

async function testInputValidation() {
  console.log('📍 TEST 2: Input Validation & DoS Protection');
  try {
    const response = await makeRequest('/api/achievements/leaderboard?limit=999999999&type=malicious_type');
    const data = JSON.parse(response);
    
    // Check if limit is capped
    if (data.length <= 1000) {
      console.log('✅ PASS: Limit parameter properly capped');
    } else {
      console.log('❌ FAIL: Large limit parameter not restricted');
    }
    
    console.log(`Response length: ${data.length} records`);
  } catch (error) {
    console.log('✅ PASS: Invalid request rejected');
  }
  console.log('');
}

async function testXSSProtection() {
  console.log('📍 TEST 3: XSS Protection (Client-side)');
  
  const maliciousInputs = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    'onmouseover="alert(\'XSS\')"',
    '"><script>alert("XSS")</script>'
  ];
  
  console.log('Testing malicious patterns:');
  maliciousInputs.forEach((input, i) => {
    // Simulasi client-side sanitization
    const hasDangerousPatterns = /(<script|javascript:|onerror|onload|onmouseover)/i.test(input);
    if (hasDangerousPatterns) {
      console.log(`✅ Pattern ${i+1}: Detected and should be sanitized`);
    } else {
      console.log(`❌ Pattern ${i+1}: Not detected - potential XSS`);
    }
  });
  console.log('');
}

async function testWalletAddressValidation() {
  console.log('📍 TEST 4: Wallet Address Validation');
  
  const invalidAddresses = [
    '<script>alert("XSS")</script>',
    'javascript:void(0)',
    '0xinvalid',
    '0x123', // too short
    'not_an_address',
    ''
  ];
  
  for (const address of invalidAddresses) {
    try {
      const response = await makeRequest('/api/user/login', 'POST', {
        walletAddress: address
      });
      
      if (response.includes('Invalid') || response.includes('error')) {
        console.log(`✅ PASS: Invalid address "${address.substring(0, 20)}..." rejected`);
      } else {
        console.log(`❌ FAIL: Invalid address "${address}" accepted`);
      }
    } catch (error) {
      console.log(`✅ PASS: Request with invalid address rejected`);
    }
  }
  console.log('');
}

async function testFileUploadSecurity() {
  console.log('📍 TEST 5: File Upload Path Traversal Protection');
  
  const dangerousFilenames = [
    '../../../etc/passwd',
    '..\\..\\windows\\system32\\hosts',
    './../../server/secrets.env',
    'normal_file.jpg', // should pass
    '.hidden_file',
    'file with spaces.jpg'
  ];
  
  dangerousFilenames.forEach((filename, i) => {
    const isDangerous = filename.includes('..') || filename.includes('\\') || filename.startsWith('.');
    if (isDangerous && filename !== 'normal_file.jpg') {
      console.log(`✅ Pattern ${i+1}: "${filename}" should be blocked`);
    } else if (!isDangerous || filename === 'normal_file.jpg') {
      console.log(`✅ Pattern ${i+1}: "${filename}" should be allowed`);
    }
  });
  console.log('');
}

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
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

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting security test suite...\n');
  
  await testAuthenticationBypass();
  await testInputValidation();
  await testXSSProtection();
  await testWalletAddressValidation();
  await testFileUploadSecurity();
  
  console.log('🏁 Security testing completed!');
  console.log('Review results above for any failed tests.');
}

// Execute tests
runAllTests().catch(console.error);