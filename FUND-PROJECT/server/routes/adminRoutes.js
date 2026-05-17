const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUser, toggleBlockUser, deleteUser, getAllTransactions, updateTransactionStatus, getAnalytics, sendNotification, updateUserBalance } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

router.use(protect, adminOnly);

router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/balance', updateUserBalance);
router.delete('/users/:id', deleteUser);
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/status', updateTransactionStatus);
router.get('/analytics', getAnalytics);
router.post('/notifications', sendNotification);

module.exports = router;
