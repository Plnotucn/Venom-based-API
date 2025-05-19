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
        const sessionName = 'my-new-session';
        console.log(`Creating session: ${sessionName}`);
        
        const sessionResponse = await axios.post('http://localhost:3000/api/sessions', {
            sessionName: sessionName,
            webhook: null
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        
        console.log('Session created successfully:', sessionResponse.data);
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.log('Request timed out, but session might still be creating...');
        } else {
            console.error('Error:', error.response?.data || error.message);
        }
    }
}

createSession();