#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const API_TOKEN = process.env.API_TOKEN;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function createSession(sessionName) {
  try {
    console.log(chalk.blue(`Creating session: ${sessionName}...`));
    
    // Create session
    const createResponse = await api.post('/sessions', { sessionName });
    console.log(chalk.green('✓ Session created successfully'));
    console.log(createResponse.data);
    
    // Wait for QR generation
    console.log(chalk.yellow('\nWaiting for QR code generation...'));
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get QR code
    console.log(chalk.blue('Fetching QR code...'));
    const qrResponse = await api.get(`/sessions/${sessionName}/qr`);
    
    if (qrResponse.data.qrCode) {
      console.log(chalk.green('✓ QR Code received!'));
      console.log(chalk.white('\nQR Code (base64):'));
      console.log(qrResponse.data.qrCode);
      console.log(chalk.yellow('\nTo view the QR code:'));
      console.log(`1. Copy the base64 string above`);
      console.log(`2. Go to: https://base64.guru/converter/decode/image`);
      console.log(`3. Paste the string to see the QR code`);
      console.log(`4. Or use CLI: node src/cli/index.js session --qr ${sessionName}`);
    } else {
      console.log(chalk.yellow('No QR code available'));
    }
    
    // Check sessions list
    console.log(chalk.blue('\nChecking sessions list...'));
    const listResponse = await api.get('/sessions');
    console.log('Active sessions:', listResponse.data.sessions);
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.response?.data || error.message);
  }
}

// Get session name from command line
const sessionName = process.argv[2] || 'test-session';
createSession(sessionName);