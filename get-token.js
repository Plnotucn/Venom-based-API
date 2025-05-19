const axios = require('axios');

async function getToken() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('JWT Token:', response.data.token);
    console.log('\nTo use with CLI, run:');
    console.log(`export API_TOKEN="${response.data.token}"`);
  } catch (error) {
    console.error('Failed to login:', error.response?.data || error.message);
  }
}

getToken();