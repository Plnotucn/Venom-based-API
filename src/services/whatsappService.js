const venom = require('venom-bot');
const logger = require('../utils/logger');
const config = require('../config');
const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.qrCodes = new Map();
    this.sessionDir = config.whatsapp.sessionDir;
    
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async createSession(sessionName, options = {}) {
    if (this.sessions.has(sessionName)) {
      throw new Error(`Session ${sessionName} already exists`);
    }

    logger.info('Creating WhatsApp session', { sessionName });
    
    // Store the session as pending immediately
    this.sessions.set(sessionName, {
      client: null,
      status: 'pending',
      createdAt: new Date(),
      info: null
    });
    
    try {
      const client = await venom.create({
        session: sessionName,
        multidevice: true,
        headless: 'new',
        logQR: false,
        disableWelcome: true,
        debug: false,
        folderPath: this.sessionDir,
        autoClose: 300000, // 5 minutes timeout for QR scanning
        ...options
      },
      (base64Qr) => {
        this.qrCodes.set(sessionName, base64Qr);
        this.emit('qr', { sessionName, qr: base64Qr });
        logger.info('QR Code generated', { sessionName });
      },
      (statusSession) => {
        logger.info('Session status update', { sessionName, status: statusSession });
        
        // Update the session status
        const session = this.sessions.get(sessionName);
        if (session) {
          session.status = statusSession;
        }
        
        if (statusSession === 'isLogged' || statusSession === 'isConnected') {
          this.qrCodes.delete(sessionName);
          this.emit('connected', { sessionName });
        }
      });

      // Setup event handlers
      this.setupEventHandlers(client, sessionName);
      
      // Update the session with client and connected status
      const session = this.sessions.get(sessionName);
      if (session) {
        session.client = client;
        session.status = 'connected';
        session.info = await client.getHostDevice();
      }

      logger.info('WhatsApp session created successfully', { sessionName });
      return client;
      
    } catch (error) {
      logger.error('Failed to create WhatsApp session', { error: error?.message || error, sessionName });
      
      // Clean up the session on error
      this.sessions.delete(sessionName);
      this.qrCodes.delete(sessionName);
      
      throw new Error(`Failed to create session: ${error?.message || 'Unknown error'}`);
    }
  }

  setupEventHandlers(client, sessionName) {
    // Handle incoming messages
    client.onMessage(async (message) => {
      logger.info('Received message', {
        sessionName,
        from: message.from,
        type: message.type,
        body: message.body ? message.body.substring(0, 50) + '...' : ''
      });
      
      this.emit('message', { sessionName, message });
    });

    // Handle message acknowledgments
    client.onAck((ack) => {
      logger.info('Message acknowledgment', {
        sessionName,
        messageId: ack.id._serialized,
        ackLevel: ack.ack
      });
      
      this.emit('ack', { sessionName, ack });
    });

    // Handle disconnection
    client.onStateChange((state) => {
      logger.info('Session state changed', { sessionName, state });
      
      if (state === 'DISCONNECTED') {
        this.sessions.delete(sessionName);
        this.emit('disconnected', { sessionName });
      }
    });

    // Handle errors
    client.onStreamUpdate((update) => {
      logger.info('Stream update', { sessionName, update });
    });
  }

  async getSession(sessionName) {
    const session = this.sessions.get(sessionName);
    if (!session) {
      throw new Error(`Session ${sessionName} not found`);
    }
    return session;
  }

  async deleteSession(sessionName) {
    const session = this.sessions.get(sessionName);
    if (!session) {
      throw new Error(`Session ${sessionName} not found`);
    }

    try {
      await session.client.logout();
      await session.client.close();
      this.sessions.delete(sessionName);
      this.qrCodes.delete(sessionName);
      
      logger.info('Session deleted', { sessionName });
    } catch (error) {
      logger.error('Error deleting session', { sessionName, error: error.message });
      throw error;
    }
  }

  async listSessions() {
    const sessions = [];
    for (const [name, session] of this.sessions) {
      sessions.push({
        name,
        status: session.status,
        createdAt: session.createdAt,
        info: session.info
      });
    }
    return sessions;
  }

  getQRCode(sessionName) {
    return this.qrCodes.get(sessionName);
  }

  // Message sending methods
  async sendTextMessage(sessionName, to, message) {
    const session = await this.getSession(sessionName);
    const formattedNumber = this.formatPhoneNumber(to);
    
    try {
      const result = await session.client.sendText(formattedNumber, message);
      logger.info('Text message sent', { sessionName, to: formattedNumber, messageId: result.id._serialized });
      return result;
    } catch (error) {
      logger.error('Failed to send text message', { sessionName, to, error: error.message });
      throw error;
    }
  }

  async sendImage(sessionName, to, imagePath, caption = '') {
    const session = await this.getSession(sessionName);
    const formattedNumber = this.formatPhoneNumber(to);
    
    try {
      const result = await session.client.sendImage(formattedNumber, imagePath, 'image', caption);
      logger.info('Image sent', { sessionName, to: formattedNumber, messageId: result.id._serialized });
      return result;
    } catch (error) {
      logger.error('Failed to send image', { sessionName, to, error: error.message });
      throw error;
    }
  }

  async sendFile(sessionName, to, filePath, caption = '') {
    const session = await this.getSession(sessionName);
    const formattedNumber = this.formatPhoneNumber(to);
    
    try {
      const result = await session.client.sendFile(formattedNumber, filePath, 'file', caption);
      logger.info('File sent', { sessionName, to: formattedNumber, messageId: result.id._serialized });
      return result;
    } catch (error) {
      logger.error('Failed to send file', { sessionName, to, error: error.message });
      throw error;
    }
  }

  // Utility methods
  formatPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith(config.whatsapp.defaultCountryCode)) {
      cleaned = config.whatsapp.defaultCountryCode + cleaned;
    }
    
    // Add WhatsApp suffix
    return `${cleaned}@c.us`;
  }

  // Bulk messaging support
  async sendBulkMessages(sessionName, messages) {
    const session = await this.getSession(sessionName);
    const results = [];
    
    for (const msg of messages) {
      try {
        let result;
        switch (msg.type) {
          case 'text':
            result = await this.sendTextMessage(sessionName, msg.to, msg.content);
            break;
          case 'image':
            result = await this.sendImage(sessionName, msg.to, msg.path, msg.caption);
            break;
          case 'file':
            result = await this.sendFile(sessionName, msg.to, msg.path, msg.caption);
            break;
          default:
            throw new Error(`Unknown message type: ${msg.type}`);
        }
        
        results.push({ success: true, messageId: result.id._serialized, to: msg.to });
      } catch (error) {
        results.push({ success: false, error: error.message, to: msg.to });
      }
      
      // Add delay between messages
      const delay = config.whatsapp.messageMinDelay + 
        Math.random() * (config.whatsapp.messageMaxDelay - config.whatsapp.messageMinDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return results;
  }
}

module.exports = new WhatsAppService();