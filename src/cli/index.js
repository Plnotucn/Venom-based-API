#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');
const logger = require('./logger');

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

program
  .version(version)
  .description('WhatsApp API CLI');

// Session management commands
program
  .command('session')
  .description('Manage WhatsApp sessions')
  .option('-l, --list', 'List all sessions')
  .option('-c, --create <name>', 'Create a new session')
  .option('-d, --delete <name>', 'Delete an existing session')
  .option('-q, --qr <name>', 'Display QR code for session')
  .action(async (options) => {
    logger.info('Session command executed', { options });
    try {
      if (options.list) {
        const spinner = ora('Fetching sessions...').start();
        const response = await api.get('/sessions');
        spinner.succeed('Sessions fetched successfully');
        
        const sessions = response.data.sessions;
        if (sessions.length === 0) {
          console.log(chalk.yellow('No sessions found'));
          logger.info('No sessions found');
        } else {
          logger.info('Sessions listed', { count: sessions.length });
          console.log(chalk.green('\\nActive Sessions:'));
          sessions.forEach(session => {
            console.log(`  - ${chalk.cyan(session.name)} (${session.status}) - Created: ${new Date(session.createdAt).toLocaleString()}`);
          });
        }
      }
      
      if (options.create) {
        const spinner = ora(`Creating session: ${options.create}`).start();
        try {
          await api.post('/sessions', { sessionName: options.create });
          spinner.succeed(`Session '${options.create}' created successfully`);
          logger.info('Session created', { sessionName: options.create });
          console.log(chalk.yellow(`\\nUse 'whatsapp-cli session -q ${options.create}' to view the QR code`));
        } catch (error) {
          spinner.fail(`Failed to create session: ${error.response?.data?.message || error.message}`);
          logger.error('Failed to create session', { error: error.message, sessionName: options.create });
        }
      }
      
      if (options.delete) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete session '${options.delete}'?`,
          default: false
        }]);
        
        if (confirm) {
          const spinner = ora(`Deleting session: ${options.delete}`).start();
          try {
            await api.delete(`/sessions/${options.delete}`);
            spinner.succeed(`Session '${options.delete}' deleted successfully`);
          } catch (error) {
            spinner.fail(`Failed to delete session: ${error.response?.data?.message || error.message}`);
          }
        }
      }
      
      if (options.qr) {
        const spinner = ora(`Fetching QR code for session: ${options.qr}`).start();
        try {
          const response = await api.get(`/sessions/${options.qr}/qr`);
          spinner.succeed('QR code fetched successfully');
          
          const qrCode = response.data.qrCode;
          console.log('\\n' + qrCode);
          console.log(chalk.yellow('\\nScan this QR code with WhatsApp to authenticate'));
        } catch (error) {
          spinner.fail(`Failed to fetch QR code: ${error.response?.data?.message || error.message}`);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Messaging commands
program
  .command('send')
  .description('Send messages')
  .option('-s, --session <name>', 'Session name', 'default')
  .option('-t, --text <message>', 'Send text message')
  .option('-i, --image <path>', 'Send image')
  .option('-f, --file <path>', 'Send file')
  .option('-v, --video <path>', 'Send video')
  .option('-a, --audio <path>', 'Send audio')
  .option('-r, --recipient <number>', 'Recipient number (with country code)')
  .option('-c, --caption <caption>', 'Caption for media')
  .action(async (options) => {
    try {
      if (!options.recipient) {
        console.error(chalk.red('Error: Recipient number is required'));
        return;
      }
      
      const spinner = ora('Sending message...').start();
      
      try {
        let response;
        
        if (options.text) {
          response = await api.post('/messages/send', {
            sessionName: options.session,
            to: options.recipient,
            message: options.text
          });
        } else if (options.image) {
          response = await api.post('/messages/send-image', {
            sessionName: options.session,
            to: options.recipient,
            imagePath: options.image,
            caption: options.caption || ''
          });
        } else if (options.file) {
          response = await api.post('/messages/send-file', {
            sessionName: options.session,
            to: options.recipient,
            filePath: options.file,
            caption: options.caption || ''
          });
        } else if (options.video) {
          response = await api.post('/messages/send-video', {
            sessionName: options.session,
            to: options.recipient,
            videoPath: options.video,
            caption: options.caption || ''
          });
        } else if (options.audio) {
          response = await api.post('/messages/send-audio', {
            sessionName: options.session,
            to: options.recipient,
            audioPath: options.audio
          });
        } else {
          spinner.fail('No message content specified');
          return;
        }
        
        spinner.succeed(`Message sent successfully! ID: ${response.data.messageId}`);
      } catch (error) {
        spinner.fail(`Failed to send message: ${error.response?.data?.message || error.message}`);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Bulk messaging
program
  .command('bulk')
  .description('Send bulk messages from file')
  .option('-s, --session <name>', 'Session name', 'default')
  .option('-f, --file <path>', 'CSV or JSON file with messages')
  .action(async (options) => {
    try {
      if (!options.file) {
        console.error(chalk.red('Error: File path is required'));
        return;
      }
      
      const fileContent = fs.readFileSync(options.file, 'utf-8');
      let messages;
      
      if (options.file.endsWith('.json')) {
        messages = JSON.parse(fileContent);
      } else if (options.file.endsWith('.csv')) {
        // Simple CSV parsing (assuming: to,type,content format)
        const lines = fileContent.split('\\n').filter(line => line.trim());
        messages = lines.slice(1).map(line => {
          const [to, type, content] = line.split(',');
          return { to: to.trim(), type: type.trim(), content: content.trim() };
        });
      } else {
        console.error(chalk.red('Error: Unsupported file format. Use JSON or CSV'));
        return;
      }
      
      const spinner = ora(`Sending ${messages.length} messages...`).start();
      
      try {
        const response = await api.post('/messages/send-bulk', {
          sessionName: options.session,
          messages
        });
        
        spinner.succeed(`Bulk messages queued successfully! Batch ID: ${response.data.batchId}`);
        console.log(chalk.yellow(`Queued: ${response.data.queued} messages`));
        console.log(chalk.yellow(`Total in queue: ${response.data.queueLength}`));
      } catch (error) {
        spinner.fail(`Failed to send bulk messages: ${error.response?.data?.message || error.message}`);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Webhook management
program
  .command('webhooks')
  .description('Manage webhooks')
  .option('-l, --list', 'List all webhooks')
  .option('-a, --add <url>', 'Add a new webhook')
  .option('-d, --delete <id>', 'Delete webhook')
  .option('-t, --test <id>', 'Test webhook')
  .action(async (options) => {
    try {
      if (options.list) {
        const spinner = ora('Fetching webhooks...').start();
        const response = await api.get('/webhooks');
        spinner.succeed('Webhooks fetched successfully');
        
        const webhooks = response.data.webhooks;
        if (webhooks.length === 0) {
          console.log(chalk.yellow('No webhooks found'));
        } else {
          console.log(chalk.green('\\nRegistered Webhooks:'));
          webhooks.forEach(webhook => {
            console.log(`  - ${chalk.cyan(webhook.id)}`);
            console.log(`    URL: ${webhook.url}`);
            console.log(`    Events: ${webhook.events.join(', ')}`);
            console.log(`    Active: ${webhook.active ? chalk.green('Yes') : chalk.red('No')}`);
            console.log(`    Created: ${new Date(webhook.createdAt).toLocaleString()}`);
            console.log();
          });
        }
      }
      
      if (options.add) {
        const { events, secret } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'events',
            message: 'Select events to listen for:',
            choices: [
              { name: 'All Events', value: '*' },
              { name: 'Message Received', value: 'message:received' },
              { name: 'Message Status', value: 'message:status' },
              { name: 'Session Connected', value: 'session:connected' },
              { name: 'Session Disconnected', value: 'session:disconnected' }
            ],
            default: ['*']
          },
          {
            type: 'password',
            name: 'secret',
            message: 'Webhook secret (optional):',
            mask: '*'
          }
        ]);
        
        const spinner = ora('Adding webhook...').start();
        try {
          const response = await api.post('/webhooks', {
            url: options.add,
            events: events.includes('*') ? ['*'] : events,
            secret: secret || undefined
          });
          
          spinner.succeed(`Webhook added successfully! ID: ${response.data.id}`);
        } catch (error) {
          spinner.fail(`Failed to add webhook: ${error.response?.data?.message || error.message}`);
        }
      }
      
      if (options.delete) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete webhook '${options.delete}'?`,
          default: false
        }]);
        
        if (confirm) {
          const spinner = ora(`Deleting webhook: ${options.delete}`).start();
          try {
            await api.delete(`/webhooks/${options.delete}`);
            spinner.succeed(`Webhook '${options.delete}' deleted successfully`);
          } catch (error) {
            spinner.fail(`Failed to delete webhook: ${error.response?.data?.message || error.message}`);
          }
        }
      }
      
      if (options.test) {
        const spinner = ora(`Testing webhook: ${options.test}`).start();
        try {
          const response = await api.post(`/webhooks/${options.test}/test`);
          if (response.data.success) {
            spinner.succeed(`Webhook test successful: ${response.data.message}`);
          } else {
            spinner.fail(`Webhook test failed: ${response.data.message}`);
          }
        } catch (error) {
          spinner.fail(`Failed to test webhook: ${error.response?.data?.message || error.message}`);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Interactive mode
program
  .command('interactive')
  .description('Start interactive mode')
  .action(async () => {
    console.log(chalk.green('Starting interactive mode...'));
    logger.info('Interactive mode started');
    
    while (true) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Manage Sessions', value: 'sessions' },
          { name: 'Send Message', value: 'send' },
          { name: 'Send Bulk Messages', value: 'bulk' },
          { name: 'Manage Webhooks', value: 'webhooks' },
          { name: 'Exit', value: 'exit' }
        ]
      }]);
      
      logger.info('Interactive action selected', { action });
      
      if (action === 'exit') {
        console.log(chalk.yellow('Goodbye!'));
        process.exit(0);
      }
      
      // Handle each action interactively
      switch (action) {
        case 'sessions':
          await handleSessionsInteractive();
          break;
        case 'send':
          await handleSendInteractive();
          break;
        case 'bulk':
          await handleBulkInteractive();
          break;
        case 'webhooks':
          await handleWebhooksInteractive();
          break;
      }
    }
  });

// Helper functions for interactive mode
async function handleSessionsInteractive() {
  logger.info('Sessions interactive menu opened');
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Session management:',
    choices: [
      { name: 'List sessions', value: 'list' },
      { name: 'Create session', value: 'create' },
      { name: 'Delete session', value: 'delete' },
      { name: 'View QR code', value: 'qr' },
      { name: 'Back', value: 'back' }
    ]
  }]);
  
  if (action === 'back') return;
  
  logger.info('Session action selected', { action });
  
  switch (action) {
    case 'list':
      await program.commands.find(cmd => cmd.name() === 'session').action({ list: true });
      break;
    case 'create':
      const { sessionName } = await inquirer.prompt([{
        type: 'input',
        name: 'sessionName',
        message: 'Enter session name:',
        validate: (input) => input.trim() !== ''
      }]);
      await program.commands.find(cmd => cmd.name() === 'session').action({ create: sessionName });
      break;
    case 'delete':
      const sessionsResponse = await api.get('/sessions');
      const sessions = sessionsResponse.data.sessions;
      if (sessions.length === 0) {
        console.log(chalk.yellow('No sessions found'));
        return;
      }
      const { sessionToDelete } = await inquirer.prompt([{
        type: 'list',
        name: 'sessionToDelete',
        message: 'Select session to delete:',
        choices: sessions.map(s => ({ name: s.name, value: s.name }))
      }]);
      await program.commands.find(cmd => cmd.name() === 'session').action({ delete: sessionToDelete });
      break;
    case 'qr':
      const qrSessionsResponse = await api.get('/sessions');
      const qrSessions = qrSessionsResponse.data.sessions;
      if (qrSessions.length === 0) {
        console.log(chalk.yellow('No sessions found'));
        return;
      }
      const { sessionForQR } = await inquirer.prompt([{
        type: 'list',
        name: 'sessionForQR',
        message: 'Select session to view QR:',
        choices: qrSessions.map(s => ({ name: s.name, value: s.name }))
      }]);
      await program.commands.find(cmd => cmd.name() === 'session').action({ qr: sessionForQR });
      break;
  }
}

async function handleSendInteractive() {
  const sessionsResponse = await api.get('/sessions');
  const sessions = sessionsResponse.data.sessions;
  
  if (sessions.length === 0) {
    console.log(chalk.yellow('No sessions found. Create a session first.'));
    return;
  }
  
  const { session, recipient, messageType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'session',
      message: 'Select session:',
      choices: sessions.map(s => ({ name: s.name, value: s.name })),
      default: sessions.find(s => s.name === 'default')?.name || sessions[0].name
    },
    {
      type: 'input',
      name: 'recipient',
      message: 'Enter recipient number (with country code):',
      validate: (input) => /^\\d+$/.test(input.trim())
    },
    {
      type: 'list',
      name: 'messageType',
      message: 'Select message type:',
      choices: [
        { name: 'Text', value: 'text' },
        { name: 'Image', value: 'image' },
        { name: 'File', value: 'file' },
        { name: 'Video', value: 'video' },
        { name: 'Audio', value: 'audio' }
      ]
    }
  ]);
  
  const options = {
    session,
    recipient
  };
  
  switch (messageType) {
    case 'text':
      const { text } = await inquirer.prompt([{
        type: 'input',
        name: 'text',
        message: 'Enter message text:',
        validate: (input) => input.trim() !== ''
      }]);
      options.text = text;
      break;
    case 'image':
      const { imagePath, imageCaption } = await inquirer.prompt([
        {
          type: 'input',
          name: 'imagePath',
          message: 'Enter image path:',
          validate: (input) => fs.existsSync(input)
        },
        {
          type: 'input',
          name: 'imageCaption',
          message: 'Enter caption (optional):'
        }
      ]);
      options.image = imagePath;
      if (imageCaption) options.caption = imageCaption;
      break;
    // Handle other message types similarly
    default:
      console.log(chalk.yellow('Message type not implemented in interactive mode yet'));
      return;
  }
  
  await program.commands.find(cmd => cmd.name() === 'send').action(options);
}

async function handleBulkInteractive() {
  const { filePath } = await inquirer.prompt([{
    type: 'input',
    name: 'filePath',
    message: 'Enter path to CSV or JSON file:',
    validate: (input) => {
      if (!fs.existsSync(input)) return 'File not found';
      if (!input.endsWith('.csv') && !input.endsWith('.json')) {
        return 'File must be CSV or JSON';
      }
      return true;
    }
  }]);
  
  const sessionsResponse = await api.get('/sessions');
  const sessions = sessionsResponse.data.sessions;
  
  if (sessions.length === 0) {
    console.log(chalk.yellow('No sessions found. Create a session first.'));
    return;
  }
  
  const { session } = await inquirer.prompt([{
    type: 'list',
    name: 'session',
    message: 'Select session:',
    choices: sessions.map(s => ({ name: s.name, value: s.name })),
    default: sessions.find(s => s.name === 'default')?.name || sessions[0].name
  }]);
  
  await program.commands.find(cmd => cmd.name() === 'bulk').action({
    session,
    file: filePath
  });
}

async function handleWebhooksInteractive() {
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Webhook management:',
    choices: [
      { name: 'List webhooks', value: 'list' },
      { name: 'Add webhook', value: 'add' },
      { name: 'Delete webhook', value: 'delete' },
      { name: 'Test webhook', value: 'test' },
      { name: 'Back', value: 'back' }
    ]
  }]);
  
  if (action === 'back') return;
  
  switch (action) {
    case 'list':
      await program.commands.find(cmd => cmd.name() === 'webhooks').action({ list: true });
      break;
    case 'add':
      const { url } = await inquirer.prompt([{
        type: 'input',
        name: 'url',
        message: 'Enter webhook URL:',
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      }]);
      await program.commands.find(cmd => cmd.name() === 'webhooks').action({ add: url });
      break;
    case 'delete':
    case 'test':
      const webhooksResponse = await api.get('/webhooks');
      const webhooks = webhooksResponse.data.webhooks;
      if (webhooks.length === 0) {
        console.log(chalk.yellow('No webhooks found'));
        return;
      }
      const { webhookId } = await inquirer.prompt([{
        type: 'list',
        name: 'webhookId',
        message: `Select webhook to ${action}:`,
        choices: webhooks.map(w => ({ 
          name: `${w.id} - ${w.url}`, 
          value: w.id 
        }))
      }]);
      const options = {};
      options[action] = webhookId;
      await program.commands.find(cmd => cmd.name() === 'webhooks').action(options);
      break;
  }
}

// Setup the program
program.parse(process.argv);

// Show help if no command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}