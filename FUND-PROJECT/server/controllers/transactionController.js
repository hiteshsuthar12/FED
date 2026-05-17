const Transaction = require('../models/Transaction');

// @desc    Get transaction history
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const User = require('../models/User');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);

    // Include both sent AND received transactions
    const baseFilter = {
      $or: [
        { sender: req.user._id },
        { 'receiver.accountNumber': user.accountNumber },
        ...(user.phone ? [{ 'receiver.mobile': user.phone }] : [])
      ]
    };

    const query = { ...baseFilter };
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$and = [
        { $or: baseFilter.$or },
        { $or: [
          { reference: { $regex: search, $options: 'i' } },
          { 'receiver.name': { $regex: search, $options: 'i' } },
          { remarks: { $regex: search, $options: 'i' } }
        ]}
      ];
      delete query.$or;
    }

    const transactions = await Transaction.find(query).populate('sender', 'name accountNumber').sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);
    const total = await Transaction.countDocuments(query);

    // Mark direction for each transaction
    const txWithDirection = transactions.map(t => {
      const obj = t.toObject();
      obj.direction = t.sender._id?.toString() === req.user._id.toString() || t.sender.toString() === req.user._id.toString() ? 'sent' : 'received';
      return obj;
    });

    res.status(200).json({
      success: true,
      data: { transactions: txWithDirection, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [
        { sender: req.user._id },
        { 'receiver.accountNumber': user.accountNumber },
        ...(user.phone ? [{ 'receiver.mobile': user.phone }] : [])
      ]
    }).populate('sender', 'name email accountNumber');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: { transaction } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get receipt data
// @route   GET /api/transactions/:id/receipt
exports.getReceipt = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      $or: [
        { sender: req.user._id },
        { 'receiver.accountNumber': user.accountNumber },
        ...(user.phone ? [{ 'receiver.mobile': user.phone }] : [])
      ]
    }).populate('sender', 'name email accountNumber phone');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    res.status(200).json({
      success: true,
      data: {
        receipt: {
          reference: transaction.reference,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          sender: { name: transaction.sender.name, account: transaction.sender.accountNumber, email: transaction.sender.email },
          receiver: transaction.receiver,
          remarks: transaction.remarks,
          date: transaction.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
