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

async function quickQR(sessionName) {
  try {
    console.log(chalk.blue(`\n=== Creating session: ${sessionName} ===\n`));
    
    // Create session
    try {
      const createResponse = await api.post('/sessions', { sessionName });
      console.log(chalk.green('✓ Session created successfully'));
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log(chalk.yellow('! Session already exists'));
      } else {
        console.log(chalk.red('✗ Failed to create session'));
        throw error;
      }
    }
    
    // Wait for QR generation
    console.log(chalk.yellow('\nWaiting for QR code...'));
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get QR code
    const qrResponse = await api.get(`/sessions/${sessionName}/qr`);
    
    if (qrResponse.data.qrCode || qrResponse.data.qr) {
      const qrCode = qrResponse.data.qrCode || qrResponse.data.qr;
      console.log(chalk.green('\n✓ QR Code received!\n'));
      console.log(chalk.white('Base64 QR Code:'));
      console.log(chalk.gray(qrCode));
      console.log(chalk.yellow('\n\nTo view this QR code:'));
      console.log('1. Copy the base64 string above');
      console.log('2. Visit: https://base64.guru/converter/decode/image');
      console.log('3. Paste the string to see the QR code');
      console.log(chalk.cyan(`\nOr use CLI: node src/cli/index.js session --qr ${sessionName}`));
    } else {
      console.log(chalk.yellow('No QR code available'));
    }
    
  } catch (error) {
    console.error(chalk.red('\nError:'), error.response?.data || error.message);
  }
}

// Main
const sessionName = process.argv[2] || 'quick-test';
quickQR(sessionName);