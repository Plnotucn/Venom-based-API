const webhookService = require('../../services/webhookService');
const logger = require('../../utils/logger');

const registerWebhook = async (req, res, next) => {
  try {
    const { url, events, secret, headers } = req.body;
    
    const id = webhookService.registerWebhook(url, events, { secret, headers });
    
    res.status(201).json({
      success: true,
      id,
      message: 'Webhook registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

const listWebhooks = async (req, res, next) => {
  try {
    const webhooks = webhookService.listWebhooks();
    
    res.json({
      success: true,
      webhooks
    });
  } catch (error) {
    next(error);
  }
};

const getWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const webhook = webhookService.getWebhook(id);
    
    if (!webhook) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }
    
    res.json({
      success: true,
      webhook
    });
  } catch (error) {
    next(error);
  }
};

const deleteWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = webhookService.unregisterWebhook(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Webhook not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const testWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await webhookService.testWebhook(id);
    
    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerWebhook,
  listWebhooks,
  getWebhook,
  deleteWebhook,
  testWebhook
};