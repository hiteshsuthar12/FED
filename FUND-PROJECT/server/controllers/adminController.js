const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/helpers');

// @desc    Admin creates a new user account (like bank account opening)
// @route   POST /api/admin/users
// @access  Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, balance } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    // Create user account
    const user = await User.create({
      name,
      email,
      phone,
      password,
      balance: balance || 50000,
      role: 'user',
      isFirstLogin: true
    });

    // Create welcome notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to Fund Transfer System',
      message: `Your bank account has been created. Account Number: ${user.accountNumber}. Please login and change your password.`,
      type: 'welcome'
    });

    console.log(`\n🏦 New Account Created:\n  Name: ${name}\n  Email: ${email}\n  Account: ${user.accountNumber}\n  Temp Password: ${password}\n`);

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's transaction count and total volume
    const txStats = await Transaction.aggregate([
      { $match: { sender: user._id } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: txStats[0] || { totalTransactions: 0, totalVolume: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Admin
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    // Notify user
    await Notification.create({
      user: user._id,
      title: user.isBlocked ? 'Account Blocked' : 'Account Unblocked',
      message: user.isBlocked
        ? 'Your account has been blocked by the administrator. Contact support for assistance.'
        : 'Your account has been unblocked. You can now access all services.',
      type: 'security'
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all transactions (admin view)
// @route   GET /api/admin/transactions
// @access  Admin
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { 'receiver.name': { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query)
      .populate('sender', 'name email accountNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update transaction status (approve/reject/flag)
// @route   PUT /api/admin/transactions/:id/status
// @access  Admin
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['completed', 'failed', 'flagged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // If rejecting a completed transaction, refund the amount
    if (status === 'failed' && transaction.status === 'pending') {
      await User.findByIdAndUpdate(transaction.sender, {
        $inc: { balance: transaction.amount }
      });
      transaction.failureReason = 'Rejected by admin';
    }

    transaction.status = status;
    await transaction.save();

    // Notify user
    await Notification.create({
      user: transaction.sender,
      title: `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your transaction of ₹${transaction.amount.toLocaleString('en-IN')} (Ref: ${transaction.reference}) has been ${status}.`,
      type: 'transfer'
    });

    res.status(200).json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Admin
exports.getAnalytics = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isBlocked: false });
    const blockedUsers = await User.countDocuments({ role: 'user', isBlocked: true });

    // Transaction stats
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });
    const flaggedTransactions = await Transaction.countDocuments({ status: 'flagged' });

    // Total volume
    const volumeResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = volumeResult[0]?.total || 0;

    // Monthly transaction data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          volume: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Transfer type breakdown
    const typeBreakdown = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          volume: { $sum: '$amount' }
        }
      }
    ]);

    // Recent registrations (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: weekAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, blocked: blockedUsers, recentRegistrations: recentUsers },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          flagged: flaggedTransactions,
          totalVolume
        },
        monthlyData,
        typeBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send notification to user
// @route   POST /api/admin/notifications
// @access  Admin
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: 'userId, title, and message are required' });
    }

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: type || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user balance (admin can credit/debit)
// @route   PUT /api/admin/users/:id/balance
// @access  Admin
exports.updateUserBalance = async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'credit' or 'debit'

    if (!amount || !type) {
      return res.status(400).json({ success: false, message: 'Amount and type are required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (type === 'credit') {
      user.balance += amount;
    } else if (type === 'debit') {
      if (user.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
      user.balance -= amount;
    }

    await user.save();

    await Notification.create({
      user: user._id,
      title: `Balance ${type === 'credit' ? 'Credited' : 'Debited'}`,
      message: `₹${amount.toLocaleString('en-IN')} has been ${type}ed to your account. New balance: ₹${user.balance.toLocaleString('en-IN')}`,
      type: 'account'
    });

    res.status(200).json({
      success: true,
      message: `Balance ${type}ed successfully`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
