// Production API Test Script
const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://fodyyy-1.onrender.com';
const LOCAL_URL = 'http://localhost:5000';

// Use production URL by default, fallback to local for testing
const API_URL = process.argv[2] === 'local' ? LOCAL_URL : PRODUCTION_URL;
const isHttps = API_URL.startsWith('https');

console.log(`🧪 Testing API at: ${API_URL}`);
console.log(`📡 Using ${isHttps ? 'HTTPS' : 'HTTP'} protocol\n`);

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FODYYY-Test-Script/1.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  const tests = [
    {
      name: 'Root Endpoint',
      path: '/',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Health Check',
      path: '/api/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Auth Test Route',
      path: '/api/auth/test',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Restaurant Test Route',
      path: '/api/restaurants/test',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Menu Test Route',
      path: '/api/menu/test',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Order Test Route',
      path: '/api/orders/test',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Login Endpoint (Invalid Credentials)',
      path: '/api/auth/login',
      method: 'POST',
      data: {
        email: 'test@example.com',
        password: 'wrongpassword'
      },
      expectedStatus: 401
    },
    {
      name: 'Registration Validation',
      path: '/api/auth/register',
      method: 'POST',
      data: {
        email: 'invalid-email'
      },
      expectedStatus: 400
    },
    {
      name: '404 Route',
      path: '/api/nonexistent',
      method: 'GET',
      expectedStatus: 404
    }
  ];

  console.log(`Running ${tests.length} tests...\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   ${test.method} ${test.path}`);
      
      const result = await makeRequest(test.path, test.method, test.data);
      
      const statusMatch = result.statusCode === test.expectedStatus;
      const status = statusMatch ? '✅' : '❌';
      
      console.log(`   ${status} Status: ${result.statusCode} (expected: ${test.expectedStatus})`);
      
      if (result.data && typeof result.data === 'object') {
        if (result.data.success !== undefined) {
          console.log(`   📄 Success: ${result.data.success}`);
        }
        if (result.data.message) {
          console.log(`   💬 Message: ${result.data.message}`);
        }
      }
      
      if (statusMatch) {
        passed++;
      } else {
        failed++;
        console.log(`   ⚠️  Expected status ${test.expectedStatus}, got ${result.statusCode}`);
      }
      
      console.log('');
      
    } catch (error) {
      failed++;
      console.log(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('='.repeat(50));
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node test-production.js [local]');
  console.log('');
  console.log('Options:');
  console.log('  local    Test against local server (http://localhost:5000)');
  console.log('  (none)   Test against production server (https://fodyyy-1.onrender.com)');
  console.log('');
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});