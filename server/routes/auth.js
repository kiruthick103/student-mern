const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], authController.login);

// Register (for student self-registration)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 1 }),
  body('role').optional().isIn(['student'])
], authController.register);

// Get current user
router.get('/me', auth, authController.getMe);

// Update profile
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
