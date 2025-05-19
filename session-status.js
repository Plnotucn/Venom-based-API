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

async function checkSessions() {
  try {
    // List all sessions
    console.log(chalk.blue('Fetching sessions...'));
    const response = await api.get('/sessions');
    
    if (response.data.sessions.length === 0) {
      console.log(chalk.yellow('No sessions found'));
      return;
    }
    
    console.log(chalk.green(`\nFound ${response.data.sessions.length} session(s):`));
    
    for (const session of response.data.sessions) {
      console.log(chalk.white(`\nSession: ${session.name}`));
      console.log(`  Status: ${session.status}`);
      console.log(`  Created: ${new Date(session.createdAt).toLocaleString()}`);
      
      // Try to get QR code
      try {
        const qrResponse = await api.get(`/sessions/${session.name}/qr`);
        if (qrResponse.data.qrCode) {
          console.log(chalk.green(`  QR Available: Yes`));
          console.log(chalk.yellow(`  To view QR: node src/cli/index.js session --qr ${session.name}`));
        } else {
          console.log(chalk.gray(`  QR Available: No`));
        }
      } catch (error) {
        console.log(chalk.gray(`  QR Available: No`));
      }
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.response?.data || error.message);
  }
}

checkSessions();