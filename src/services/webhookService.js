const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class WebhookService {
  constructor() {
    this.webhooks = new Map();
    this.retryQueue = [];
    this.processing = false;
    
    // Start retry processor
    setInterval(() => this.processRetryQueue(), config.webhook.retryDelay);
  }

  registerWebhook(url, events = ['*'], options = {}) {
    const id = options.id || uuidv4();
    
    this.webhooks.set(id, {
      id,
      url,
      events,
      secret: options.secret,
      headers: options.headers || {},
      active: true,
      createdAt: new Date(),
      failureCount: 0
    });
    
    logger.info('Webhook registered', { id, url, events });
    return id;
  }

  unregisterWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      this.webhooks.delete(id);
      logger.info('Webhook unregistered', { id, url: webhook.url });
      return true;
    }
    return false;
  }

  getWebhook(id) {
    return this.webhooks.get(id);
  }

  listWebhooks() {
    return Array.from(this.webhooks.values());
  }

  async triggerWebhook(event, data) {
    const webhooksToTrigger = this.getWebhooksForEvent(event);
    
    for (const webhook of webhooksToTrigger) {
      if (!webhook.active) continue;
      
      try {
        await this.sendWebhook(webhook, event, data);
      } catch (error) {
        logger.error('Webhook send failed', {
          webhookId: webhook.id,
          url: webhook.url,
          event,
          error: error.message
        });
        
        // Add to retry queue
        this.addToRetryQueue(webhook, event, data);
      }
    }
  }

  getWebhooksForEvent(event) {
    const webhooks = [];
    
    for (const webhook of this.webhooks.values()) {
      if (webhook.events.includes('*') || webhook.events.includes(event)) {
        webhooks.push(webhook);
      }
    }
    
    return webhooks;
  }

  async sendWebhook(webhook, event, data) {
    const payload = {
      id: uuidv4(),
      event,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Add signature if secret is configured
    let headers = { ...webhook.headers };
    if (webhook.secret) {
      const signature = this.generateSignature(payload, webhook.secret);
      headers['X-Webhook-Signature'] = signature;
    }
    
    const timer = logger.startTimer();
    
    try {
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      timer.done('Webhook sent successfully', {
        webhookId: webhook.id,
        url: webhook.url,
        event,
        statusCode: response.status
      });
      
      // Reset failure count on success
      webhook.failureCount = 0;
      
      return response;
    } catch (error) {
      webhook.failureCount++;
      
      // Disable webhook if too many failures
      if (webhook.failureCount >= 10) {
        webhook.active = false;
        logger.warn('Webhook disabled due to too many failures', {
          webhookId: webhook.id,
          url: webhook.url
        });
      }
      
      throw error;
    }
  }

  generateSignature(payload, secret) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  addToRetryQueue(webhook, event, data, retryCount = 0) {
    if (retryCount >= config.webhook.retryCount) {
      logger.error('Webhook max retries exceeded', {
        webhookId: webhook.id,
        url: webhook.url,
        event
      });
      return;
    }
    
    this.retryQueue.push({
      webhook,
      event,
      data,
      retryCount,
      nextRetry: Date.now() + (config.webhook.retryDelay * Math.pow(2, retryCount))
    });
  }

  async processRetryQueue() {
    if (this.processing || this.retryQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    const now = Date.now();
    const toProcess = [];
    
    // Get items ready for retry
    this.retryQueue = this.retryQueue.filter(item => {
      if (item.nextRetry <= now) {
        toProcess.push(item);
        return false;
      }
      return true;
    });
    
    // Process retries
    for (const item of toProcess) {
      try {
        await this.sendWebhook(item.webhook, item.event, item.data);
        logger.info('Webhook retry successful', {
          webhookId: item.webhook.id,
          url: item.webhook.url,
          event: item.event,
          retryCount: item.retryCount
        });
      } catch (error) {
        logger.error('Webhook retry failed', {
          webhookId: item.webhook.id,
          url: item.webhook.url,
          event: item.event,
          retryCount: item.retryCount,
          error: error.message
        });
        
        // Re-add to retry queue with incremented count
        this.addToRetryQueue(
          item.webhook,
          item.event,
          item.data,
          item.retryCount + 1
        );
      }
    }
    
    this.processing = false;
  }

  async testWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    
    const testData = {
      test: true,
      message: 'This is a test webhook event',
      timestamp: new Date().toISOString()
    };
    
    try {
      await this.sendWebhook(webhook, 'test', testData);
      return { success: true, message: 'Webhook test successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new WebhookService();