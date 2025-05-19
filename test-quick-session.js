const axios = require('axios');

const API_URL = 'http://localhost:3000';
const username = 'admin';
const password = 'admin123';

async function testQuickSession() {
  try {
    console.log('1. Getting auth token...');
    const authResponse = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    const token = authResponse.data.token;
    console.log('Auth token obtained');

    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n2. Listing sessions BEFORE creation...');
    const beforeList = await api.get('/api/sessions');
    console.log('Sessions before:', beforeList.data.sessions);

    console.log('\n3. Creating session...');
    // Don't wait for the response - it will timeout
    api.post('/api/sessions', {
      sessionName: 'test-quick'
    }).catch(err => {
      console.log('Creation error (expected):', err.message);
    });

    console.log('\n4. Immediately checking sessions while creation is happening...');
    // Check sessions immediately
    await new Promise(resolve => setTimeout(resolve, 1000));
    const duringList = await api.get('/api/sessions');
    console.log('Sessions during creation:', duringList.data.sessions);

    console.log('\n5. Checking QR availability...');
    try {
      const qrResponse = await api.get('/api/sessions/test-quick/qr');
      console.log('QR code available:', !!qrResponse.data.qr);
    } catch (error) {
      console.log('QR error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testQuickSession();