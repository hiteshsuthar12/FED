const express = require('express');
const router = express.Router();
const { getTransactions, getTransaction, getReceipt } = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransaction);
router.get('/:id/receipt', protect, getReceipt);

module.exports = router;
