#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const qrcode = require('qrcode-terminal');

// Load environment variables
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const API_TOKEN = process.env.API_TOKEN;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function createSessionAndShowQR(sessionName) {
  console.log(chalk.blue(`\nCreating session: ${sessionName}`));
  
  try {
    // First create the session
    const spinner = ora('Creating session...').start();
    
    try {
      await api.post('/sessions', { sessionName });
      spinner.succeed('Session created successfully');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        spinner.warn('Session already exists, fetching QR code...');
      } else {
        spinner.fail(`Failed to create session: ${error.response?.data?.message || error.message}`);
        return;
      }
    }
    
    // Wait a moment for QR to be generated
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now fetch and display the QR code
    const qrSpinner = ora('Fetching QR code...').start();
    
    try {
      const response = await api.get(`/sessions/${sessionName}/qr`);
      qrSpinner.succeed('QR code fetched successfully');
      
      if (response.data.qr) {
        console.log(chalk.green('\nQR Code received! Scan this with WhatsApp:\n'));
        
        // Display QR code in terminal
        qrcode.generate(response.data.qr, { small: true });
        
        console.log(chalk.yellow('\nWaiting for authentication... (5 minutes timeout)'));
        console.log(chalk.gray('Press Ctrl+C to exit'));
        
        // Keep checking session status
        let authenticated = false;
        for (let i = 0; i < 60; i++) { // Check for 5 minutes
          await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
          
          try {
            const statusResponse = await api.get(`/sessions/${sessionName}`);
            if (statusResponse.data.session?.status === 'connected') {
              console.log(chalk.green('\n✓ Session authenticated successfully!'));
              authenticated = true;
              break;
            }
          } catch (error) {
            // Session might not exist yet, continue waiting
          }
        }
        
        if (!authenticated) {
          console.log(chalk.red('\n✗ Session authentication timed out'));
        }
      } else {
        console.log(chalk.yellow('No QR code available - session might already be authenticated'));
      }
    } catch (error) {
      qrSpinner.fail(`Failed to fetch QR code: ${error.response?.data?.message || error.message}`);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
}

// Main execution
const sessionName = process.argv[2] || 'interactive-session';

console.log(chalk.cyan('WhatsApp Session Interactive Setup'));
console.log(chalk.gray('==================================\n'));

createSessionAndShowQR(sessionName).catch(console.error);