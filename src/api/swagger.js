const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp API',
      version: '1.0.0',
      description: 'WhatsApp automation API built with venom-bot',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Session: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            info: { type: 'object' }
          }
        },
        Message: {
          type: 'object',
          required: ['sessionName', 'to', 'message'],
          properties: {
            sessionName: { type: 'string' },
            to: { type: 'string' },
            message: { type: 'string' },
            templateData: { type: 'object' }
          }
        },
        BulkMessage: {
          type: 'object',
          required: ['sessionName', 'messages'],
          properties: {
            sessionName: { type: 'string' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  to: { type: 'string' },
                  type: { type: 'string', enum: ['text', 'image', 'file', 'video', 'audio', 'location'] },
                  content: { type: 'string' },
                  path: { type: 'string' },
                  caption: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  title: { type: 'string' },
                  templateData: { type: 'object' }
                }
              }
            }
          }
        },
        Webhook: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri' },
            events: { type: 'array', items: { type: 'string' } },
            secret: { type: 'string' },
            headers: { type: 'object' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [__dirname + '/routes/*.js'] // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };