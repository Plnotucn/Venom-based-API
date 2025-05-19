const axios = require('axios');

const API_URL = 'http://localhost:3000';
const username = 'admin';
const password = 'admin123';

async function testSessionTracking() {
  try {
    console.log('1. Getting auth token...');
    const authResponse = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    const token = authResponse.data.token;
    console.log('Auth token obtained:', token);

    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n2. Creating new session "test-tracking"...');
    try {
      const createResponse = await api.post('/api/sessions', {
        sessionName: 'test-tracking'
      });
      console.log('Create response:', createResponse.data);
    } catch (error) {
      console.log('Create response:', error.response?.data || error.message);
    }

    console.log('\n3. Listing sessions immediately after creation...');
    const listResponse = await api.get('/api/sessions');
    console.log('Sessions found:', listResponse.data);

    console.log('\n4. Checking QR code availability...');
    try {
      const qrResponse = await api.get('/api/sessions/test-tracking/qr');
      console.log('QR code available:', !!qrResponse.data.qr);
    } catch (error) {
      console.log('QR response:', error.response?.data || error.message);
    }

    console.log('\n5. Waiting 5 seconds and checking again...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const listResponse2 = await api.get('/api/sessions');
    console.log('Sessions after 5 seconds:', listResponse2.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSessionTracking();