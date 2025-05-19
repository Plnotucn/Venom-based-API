const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { validate, schemas } = require('../middleware/validation');

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new WhatsApp session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionName
 *             properties:
 *               sessionName:
 *                 type: string
 *                 description: Unique name for the session
 *               options:
 *                 type: object
 *                 description: Additional session options
 *     responses:
 *       202:
 *         description: Session creation initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionName:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(schemas.createSession), sessionController.createSession);

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: List all sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 */
router.get('/', sessionController.listSessions);

/**
 * @swagger
 * /sessions/{sessionName}:
 *   get:
 *     summary: Get session details
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *         description: Session name
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:sessionName', sessionController.getSession);

/**
 * @swagger
 * /sessions/{sessionName}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *         description: Session name
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Session not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:sessionName', sessionController.deleteSession);

/**
 * @swagger
 * /sessions/{sessionName}/qr:
 *   get:
 *     summary: Get QR code for session authentication
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionName
 *         required: true
 *         schema:
 *           type: string
 *         description: Session name
 *     responses:
 *       200:
 *         description: QR code data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 qrCode:
 *                   type: string
 *                   description: Base64 encoded QR code
 *       404:
 *         description: QR code not available (session may already be authenticated)
 *       401:
 *         description: Unauthorized
 */
router.get('/:sessionName/qr', sessionController.getSessionQR);

module.exports = router;