#!/bin/bash

# Script to run WhatsApp CLI in interactive mode with authentication

# Get JWT token
echo "Getting authentication token..."
TOKEN=$(node -e "
const axios = require('axios');
axios.post('http://localhost:3000/api/auth/login', {
  username: 'admin',
  password: 'admin123'
}).then(res => {
  process.stdout.write(res.data.token);
}).catch(err => {
  console.error('Failed to login:', err.response?.data || err.message);
  process.exit(1);
});
")

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Make sure the API server is running."
  exit 1
fi

echo "Token obtained successfully!"
echo "Starting interactive mode..."

# Export token and run CLI
export API_TOKEN="$TOKEN"
npm run cli -- interactive