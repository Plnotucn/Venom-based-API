const whatsappService = require('../../services/whatsappService');
const logger = require('../../utils/logger');

const createSession = async (req, res, next) => {
  try {
    const { sessionName, options } = req.body;
    
    await whatsappService.createSession(sessionName, options);
    
    logger.info('Session creation initiated', { sessionName });
    
    res.status(202).json({
      success: true,
      sessionName,
      message: 'Session creation initiated. Check QR code endpoint for authentication.'
    });
  } catch (error) {
    next(error);
  }
};

const getSession = async (req, res, next) => {
  try {
    const { sessionName } = req.params;
    const session = await whatsappService.getSession(sessionName);
    
    res.json({
      success: true,
      session: {
        name: sessionName,
        status: session.status,
        createdAt: session.createdAt,
        info: session.info
      }
    });
  } catch (error) {
    next(error);
  }
};

const listSessions = async (req, res, next) => {
  try {
    const sessions = await whatsappService.listSessions();
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    const { sessionName } = req.params;
    await whatsappService.deleteSession(sessionName);
    
    logger.info('Session deleted', { sessionName });
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getSessionQR = async (req, res, next) => {
  try {
    const { sessionName } = req.params;
    const qrCode = whatsappService.getQRCode(sessionName);
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not available. Session may already be authenticated.'
      });
    }
    
    res.json({
      success: true,
      qrCode
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSession,
  listSessions,
  deleteSession,
  getSessionQR
};