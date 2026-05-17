const express = require('express');
const router = express.Router();
const { login, logout, refreshToken, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/change-password', protect, changePassword);

module.exports = router;
