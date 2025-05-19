const axios = require('axios');

const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ3NTIzMTA3LCJleHAiOjE3NDgxMjc5MDd9.Cq_T8PJKTK27GP1JG2qj70QDwjHUmoife-uM_dadMPI";

async function createSession() {
  try {
    const response = await axios.post('http://localhost:3000/api/sessions', {
      sessionName: 'test-session-from-script'
    }, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Session created successfully:', response.data);
  } catch (error) {
    console.error('Failed to create session:', error.response?.data || error.message);
  }
}

createSession();