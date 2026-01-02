// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout (protected or accept token in body/header)
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
