// Simple test script to verify API endpoints
const http = require('http');

const testEndpoints = [
  {
    name: 'Root endpoint',
    path: '/',
    method: 'GET'
  },
  {
    name: 'Health check',
    path: '/api/health',
    method: 'GET'
  },
  {
    name: '404 test',
    path: '/api/nonexistent',
    method: 'GET'
  }
];

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(data)
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const result = await makeRequest(endpoint.path, endpoint.method);
      console.log(`✅ ${endpoint.name}: ${result.statusCode}`);
      console.log(`   Response:`, result.data);
      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
      console.log('');
    }
  }
}

// Wait a bit for the server to start, then run tests
setTimeout(runTests, 2000);

console.log('Please start the server with: npm run dev');
console.log('Then run this test script with: node test-api.js\n');