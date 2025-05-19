const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validate, schemas } = require('../middleware/validation');

router.post('/send', validate(schemas.sendMessage), messageController.sendMessage);
router.post('/send-bulk', validate(schemas.sendBulkMessages), messageController.sendBulkMessages);
router.post('/send-image', messageController.sendImage);
router.post('/send-file', messageController.sendFile);
router.post('/send-audio', messageController.sendAudio);
router.post('/send-video', messageController.sendVideo);
router.post('/send-location', messageController.sendLocation);
router.get('/queue/:sessionName', messageController.getQueueStatus);
router.get('/queue', messageController.getQueueStatus);
router.get('/batch/:batchId', messageController.getBatchResults);

module.exports = router;