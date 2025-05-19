const axios = require('axios');

async function checkSessionWithQR(sessionName) {
    try {
        // First, get the authentication token
        const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = authResponse.data.token;
        console.log('Authentication successful');
        
        // Try to get QR code for the session
        try {
            const qrResponse = await axios.get(`http://localhost:3000/api/sessions/${sessionName}/qr`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (qrResponse.data.qrCode) {
                console.log(`Session ${sessionName} has an active QR code`);
                console.log('QR Code:', qrResponse.data.qrCode);
                return true;
            }
        } catch (error) {
            console.log(`Session ${sessionName} not found or no QR code available`);
            return false;
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return false;
    }
}

// Check recently created sessions
async function checkRecentSessions() {
    const sessions = [
        'demo-session',
        'my-new-session',
        'test-from-cli',
        'test-cli-session',
        'final-test',
        'my-test-session',
        'simple-test',
        'my-session'
    ];
    
    console.log('Checking for sessions with active QR codes...\n');
    
    for (const session of sessions) {
        await checkSessionWithQR(session);
        console.log('---');
    }
}

checkRecentSessions();