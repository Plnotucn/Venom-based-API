const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const joi = require('joi');
const { validate } = require('../middleware/validation');

const loginSchema = joi.object({
  username: joi.string().required().min(3).max(30),
  password: joi.string().required().min(6)
});

const registerSchema = joi.object({
  username: joi.string().required().alphanum().min(3).max(30),
  password: joi.string().required().min(6)
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to get JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username
 *               password:
 *                 type: string
 *                 description: Password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 expiresIn:
 *                   type: string
 *                   description: Token expiry duration
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username (alphanumeric, 3-30 characters)
 *               password:
 *                 type: string
 *                 description: Password (minimum 6 characters)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Username already exists or validation error
 */
router.post('/register', validate(registerSchema), authController.register);

module.exports = router;