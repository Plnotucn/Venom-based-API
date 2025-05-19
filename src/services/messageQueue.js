const { EventEmitter } = require('events');
const logger = require('../utils/logger');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class MessageQueue extends EventEmitter {
  constructor(whatsappService) {
    super();
    this.whatsappService = whatsappService;
    this.queues = new Map(); // Queue per session
    this.processing = new Map(); // Processing status per session
    this.results = new Map(); // Store results by batch ID
  }

  async addToQueue(sessionName, messages, options = {}) {
    const batchId = options.batchId || uuidv4();
    
    if (!this.queues.has(sessionName)) {
      this.queues.set(sessionName, []);
      this.processing.set(sessionName, false);
    }
    
    const queue = this.queues.get(sessionName);
    
    // Add messages to queue with batch ID
    const queueItems = messages.map(msg => ({
      ...msg,
      id: uuidv4(),
      batchId,
      sessionName,
      addedAt: new Date(),
      retries: 0,
      maxRetries: options.maxRetries || 3
    }));
    
    queue.push(...queueItems);
    
    logger.info('Messages added to queue', {
      sessionName,
      batchId,
      count: messages.length,
      queueLength: queue.length
    });
    
    // Start processing if not already running
    if (!this.processing.get(sessionName)) {
      this.processQueue(sessionName);
    }
    
    return {
      batchId,
      queued: messages.length,
      totalInQueue: queue.length
    };
  }

  async processQueue(sessionName) {
    const queue = this.queues.get(sessionName);
    
    if (!queue || queue.length === 0) {
      this.processing.set(sessionName, false);
      return;
    }
    
    this.processing.set(sessionName, true);
    const message = queue.shift();
    
    try {
      // Process message based on type
      let result;
      switch (message.type) {
        case 'text':
          result = await this.sendText(sessionName, message);
          break;
        case 'image':
          result = await this.sendImage(sessionName, message);
          break;
        case 'file':
          result = await this.sendFile(sessionName, message);
          break;
        case 'video':
          result = await this.sendVideo(sessionName, message);
          break;
        case 'audio':
          result = await this.sendAudio(sessionName, message);
          break;
        case 'location':
          result = await this.sendLocation(sessionName, message);
          break;
        default:
          throw new Error(`Unsupported message type: ${message.type}`);
      }
      
      // Store result
      this.storeResult(message.batchId, {
        messageId: message.id,
        to: message.to,
        type: message.type,
        status: 'sent',
        result: result.id ? result.id._serialized : null,
        timestamp: new Date()
      });
      
      // Emit success event
      this.emit('message:sent', {
        sessionName,
        messageId: message.id,
        batchId: message.batchId,
        to: message.to,
        type: message.type
      });
      
      logger.info('Message sent successfully', {
        sessionName,
        messageId: message.id,
        to: message.to,
        type: message.type
      });
      
    } catch (error) {
      logger.error('Failed to send message', {
        sessionName,
        messageId: message.id,
        to: message.to,
        error: error.message,
        retries: message.retries
      });
      
      // Retry logic
      if (message.retries < message.maxRetries) {
        message.retries++;
        queue.push(message); // Re-add to queue
        
        logger.info('Message re-queued for retry', {
          sessionName,
          messageId: message.id,
          retries: message.retries
        });
      } else {
        // Store failure result
        this.storeResult(message.batchId, {
          messageId: message.id,
          to: message.to,
          type: message.type,
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        });
        
        // Emit failure event
        this.emit('message:failed', {
          sessionName,
          messageId: message.id,
          batchId: message.batchId,
          to: message.to,
          type: message.type,
          error: error.message
        });
      }
    }
    
    // Add delay between messages
    const delay = config.whatsapp.messageMinDelay + 
      Math.random() * (config.whatsapp.messageMaxDelay - config.whatsapp.messageMinDelay);
    
    setTimeout(() => this.processQueue(sessionName), delay);
  }

  async sendText(sessionName, message) {
    const processedMessage = this.processTemplate(message.content, message.templateData);
    return await this.whatsappService.sendTextMessage(sessionName, message.to, processedMessage);
  }

  async sendImage(sessionName, message) {
    const caption = this.processTemplate(message.caption || '', message.templateData);
    return await this.whatsappService.sendImage(sessionName, message.to, message.path, caption);
  }

  async sendFile(sessionName, message) {
    const caption = this.processTemplate(message.caption || '', message.templateData);
    return await this.whatsappService.sendFile(sessionName, message.to, message.path, caption);
  }

  async sendVideo(sessionName, message) {
    const caption = this.processTemplate(message.caption || '', message.templateData);
    const session = await this.whatsappService.getSession(sessionName);
    const formattedNumber = this.whatsappService.formatPhoneNumber(message.to);
    return await session.client.sendFile(formattedNumber, message.path, 'video', caption);
  }

  async sendAudio(sessionName, message) {
    const session = await this.whatsappService.getSession(sessionName);
    const formattedNumber = this.whatsappService.formatPhoneNumber(message.to);
    return await session.client.sendFile(formattedNumber, message.path, 'audio', '');
  }

  async sendLocation(sessionName, message) {
    const session = await this.whatsappService.getSession(sessionName);
    const formattedNumber = this.whatsappService.formatPhoneNumber(message.to);
    return await session.client.sendLocation(formattedNumber, message.latitude, message.longitude, message.title);
  }

  processTemplate(template, data) {
    if (!data) return template;
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  storeResult(batchId, result) {
    if (!this.results.has(batchId)) {
      this.results.set(batchId, []);
    }
    this.results.get(batchId).push(result);
  }

  getResults(batchId) {
    return this.results.get(batchId) || [];
  }

  getQueueStatus(sessionName) {
    const queue = this.queues.get(sessionName);
    return {
      sessionName,
      queueLength: queue ? queue.length : 0,
      processing: this.processing.get(sessionName) || false
    };
  }

  getAllQueueStatus() {
    const status = [];
    for (const [sessionName] of this.queues) {
      status.push(this.getQueueStatus(sessionName));
    }
    return status;
  }
}

module.exports = MessageQueue;