const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getDashboard } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
