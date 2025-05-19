const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { validate, schemas } = require('../middleware/validation');

router.post('/', validate(schemas.registerWebhook), webhookController.registerWebhook);
router.get('/', webhookController.listWebhooks);
router.get('/:id', webhookController.getWebhook);
router.delete('/:id', webhookController.deleteWebhook);
router.post('/:id/test', webhookController.testWebhook);

module.exports = router;