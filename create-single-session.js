const axios = require('axios');

async function createSession() {
    try {
        // First, get the authentication token
        const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = authResponse.data.token;
        console.log('Authentication successful');
        
        // Create the session
        const sessionResponse = await axios.post('http://localhost:3000/api/sessions', {
            sessionName: 'demo-session',
            webhook: null
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Session created:', sessionResponse.data);
        
        // Get QR code for the session
        const qrResponse = await axios.get(`http://localhost:3000/api/sessions/${sessionResponse.data.sessionName}/qr`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('QR Code:', qrResponse.data.qrCode);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

createSession();