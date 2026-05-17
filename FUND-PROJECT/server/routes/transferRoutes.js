const express = require('express');
const router = express.Router();
const { neftTransfer, rtgsTransfer, impsTransfer, mobilePay, verifyOTP } = require('../controllers/transferController');
const { protect } = require('../middlewares/auth');
const { transferLimiter } = require('../middlewares/rateLimiter');

router.post('/neft', protect, transferLimiter, neftTransfer);
router.post('/rtgs', protect, transferLimiter, rtgsTransfer);
router.post('/imps', protect, transferLimiter, impsTransfer);
router.post('/mobile', protect, transferLimiter, mobilePay);
router.post('/verify-otp', protect, verifyOTP);

module.exports = router;
