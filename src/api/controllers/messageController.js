const whatsappService = require('../../services/whatsappService');
const MessageQueue = require('../../services/messageQueue');
const logger = require('../../utils/logger');

// Initialize message queue
const messageQueue = new MessageQueue(whatsappService);

const sendMessage = async (req, res, next) => {
  try {
    const { sessionName, to, message, templateData } = req.body;
    
    const result = await whatsappService.sendTextMessage(sessionName, to, message);
    
    res.json({
      success: true,
      messageId: result.id._serialized,
      to,
      status: 'sent'
    });
  } catch (error) {
    next(error);
  }
};

const sendBulkMessages = async (req, res, next) => {
  try {
    const { sessionName, messages } = req.body;
    
    const result = await messageQueue.addToQueue(sessionName, messages);
    
    res.json({
      success: true,
      batchId: result.batchId,
      queued: result.queued,
      queueLength: result.totalInQueue
    });
  } catch (error) {
    next(error);
  }
};

const sendImage = async (req, res, next) => {
  try {
    const { sessionName, to, imagePath, caption } = req.body;
    
    const result = await whatsappService.sendImage(sessionName, to, imagePath, caption);
    
    res.json({
      success: true,
      messageId: result.id._serialized,
      to,
      status: 'sent'
    });
  } catch (error) {
    next(error);
  }
};

const sendFile = async (req, res, next) => {
  try {
    const { sessionName, to, filePath, caption } = req.body;
    
    const result = await whatsappService.sendFile(sessionName, to, filePath, caption);
    
    res.json({
      success: true,
      messageId: result.id._serialized,
      to,
      status: 'sent'
    });
  } catch (error) {
    next(error);
  }
};

const sendAudio = async (req, res, next) => {
  try {
    const { sessionName, to, audioPath } = req.body;
    
    const session = await whatsappService.getSession(sessionName);
    const formattedNumber = whatsappService.formatPhoneNumber(to);
    const result = await session.client.sendFile(formattedNumber, audioPath, 'audio', '');
    
    res.json({
      success: true,
      messageId: result.id._serialized,
      to,
      status: 'sent'
    });
  } catch (error) {
    next(error);
  }
};

const sendVideo = async (req, res, next) => {
  try {
    const { sessionName, to, videoPath, caption } = req.body;
    
    const session = await whatsappService.getSession(sessionName);
    const formattedNumber = whatsappService.formatPhoneNumber(to);
    const result = await session.client.sendFile(formattedNumber, videoPath, 'video', caption || '');
    
    res.json({
      success: true,
      messageId: result.id._serialized,
      to,
      status: 'sent'
    });
  } catch (error) {
    next(error);
  }
};

const sendLocation = async (req, res, next) => {
  try {
    const { sessionName, to, latitude, longitude, title } = req.body;
    
    const session = await whatsappService.getSession(sessionName);
    const formattedNumber = whatsappService.formatPhoneNumber(to);
    const result = await session.client.sendLocation(formattedNumber, latitude, longitude, title || '');
    
    res.json({
      success: true,
      messageId: result.id._serialized,
      to,
      status: 'sent'
    });
  } catch (error) {
    next(error);
  }
};

const getQueueStatus = async (req, res, next) => {
  try {
    const { sessionName } = req.params;
    
    const status = sessionName 
      ? messageQueue.getQueueStatus(sessionName)
      : messageQueue.getAllQueueStatus();
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    next(error);
  }
};

const getBatchResults = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const results = messageQueue.getResults(batchId);
    
    res.json({
      success: true,
      batchId,
      results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  sendBulkMessages,
  sendImage,
  sendFile,
  sendAudio,
  sendVideo,
  sendLocation,
  getQueueStatus,
  getBatchResults
};