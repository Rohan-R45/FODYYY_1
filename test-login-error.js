// Test script to verify login error handling
const axios = require('axios');

const testLoginError = async () => {
  try {
    console.log('Testing login with wrong credentials...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'wrong@email.com',
      password: 'wrongpassword'
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error Status:', error.response?.status);
    console.log('Error Message:', error.response?.data?.message);
    console.log('Error Details:', error.response?.data);
  }
};

testLoginError();