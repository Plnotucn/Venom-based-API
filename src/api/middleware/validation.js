const joi = require('joi');
const logger = require('../../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      logger.warn('Validation error', {
        path: req.path,
        errors
      });
      
      return res.status(400).json({ errors });
    }
    
    req.body = value;
    next();
  };
};

// Validation schemas
const schemas = {
  createSession: joi.object({
    sessionName: joi.string().required().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(30),
    options: joi.object().optional()
  }),
  
  sendMessage: joi.object({
    sessionName: joi.string().required(),
    to: joi.string().required(),
    message: joi.string().required(),
    templateData: joi.object().optional()
  }),
  
  sendBulkMessages: joi.object({
    sessionName: joi.string().required(),
    messages: joi.array().items(joi.object({
      to: joi.string().required(),
      type: joi.string().valid('text', 'image', 'file', 'video', 'audio', 'location').required(),
      content: joi.string().when('type', { is: 'text', then: joi.required() }),
      path: joi.string().when('type', { 
        is: joi.string().valid('image', 'file', 'video', 'audio'), 
        then: joi.required() 
      }),
      caption: joi.string().optional(),
      latitude: joi.number().when('type', { is: 'location', then: joi.required() }),
      longitude: joi.number().when('type', { is: 'location', then: joi.required() }),
      title: joi.string().when('type', { is: 'location', then: joi.optional() }),
      templateData: joi.object().optional()
    })).min(1).required()
  }),
  
  registerWebhook: joi.object({
    url: joi.string().uri().required(),
    events: joi.array().items(joi.string()).optional(),
    secret: joi.string().optional(),
    headers: joi.object().optional()
  })
};

module.exports = { validate, schemas };