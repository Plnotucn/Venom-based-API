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

async function quickSession(sessionName) {
  console.log(chalk.cyan(`\n=== Quick WhatsApp Session: ${sessionName} ===\n`));
  
  // Step 1: Create session
  console.log(chalk.blue('1. Creating session...'));
  try {
    await api.post('/sessions', { sessionName });
    console.log(chalk.green('   ✓ Session created'));
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(chalk.yellow('   ! Session already exists'));
    } else {
      console.log(chalk.red(`   ✗ Error: ${error.response?.data?.message || error.message}`));
      return;
    }
  }
  
  // Wait for QR to be generated
  console.log(chalk.blue('\n2. Waiting for QR code...'));
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 2: Get QR code
  console.log(chalk.blue('\n3. Fetching QR code...'));
  try {
    const response = await api.get(`/sessions/${sessionName}/qr`);
    if (response.data.qr) {
      console.log(chalk.green('   ✓ QR code received!'));
      console.log(chalk.yellow('\n4. Scan this QR code with WhatsApp:'));
      console.log(chalk.white('\n' + response.data.qr + '\n'));
      console.log(chalk.yellow('   Or open this link in your browser to see the QR image:'));
      console.log(chalk.white(`   data:image/png;base64,${response.data.qr}\n`));
    } else {
      console.log(chalk.yellow('   ! No QR code available - session might already be authenticated'));
    }
  } catch (error) {
    console.log(chalk.red(`   ✗ Error: ${error.response?.data?.message || error.message}`));
  }
  
  console.log(chalk.cyan('=== End ===\n'));
}

// Main
const sessionName = process.argv[2] || 'quick-session';
quickSession(sessionName).catch(console.error);