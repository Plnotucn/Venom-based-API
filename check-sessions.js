const axios = require('axios');

async function checkSessions() {
    try {
        // First, get the authentication token
        const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = authResponse.data.token;
        console.log('Authentication successful');
        
        // Get all sessions
        const sessionsResponse = await axios.get('http://localhost:3000/api/sessions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Current sessions:', sessionsResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkSessions();