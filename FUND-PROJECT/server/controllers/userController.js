const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const Beneficiary = require('../models/Beneficiary');
    const Notification = require('../models/Notification');
    const userId = req.user._id;

    let user = await User.findById(userId);

    // ★ RECONCILE: Credit any received transactions that weren't credited yet
    const uncreditedTxns = await Transaction.find({
      $or: [
        { 'receiver.accountNumber': user.accountNumber },
        ...(user.phone ? [{ 'receiver.mobile': user.phone }] : [])
      ],
      sender: { $ne: userId },
      receiverCredited: { $ne: true },
      status: { $in: ['completed', 'pending'] }
    });

    if (uncreditedTxns.length > 0) {
      let totalToCredit = 0;
      for (const tx of uncreditedTxns) {
        totalToCredit += tx.amount;
        tx.receiverCredited = true;
        await tx.save();
      }
      user.balance += totalToCredit;
      await user.save();
      user = await User.findById(userId); // refresh
      console.log(`\n🔄 Reconciled ${uncreditedTxns.length} transactions. Credited ₹${totalToCredit} to ${user.name}. New balance: ₹${user.balance}\n`);
    }

    // Get both sent and received transactions
    const recentSent = await Transaction.find({ sender: userId }).sort({ createdAt: -1 }).limit(5);
    const recentReceived = await Transaction.find({
      $or: [
        { 'receiver.accountNumber': user.accountNumber },
        { 'receiver.mobile': user.phone }
      ],
      sender: { $ne: userId }
    }).populate('sender', 'name accountNumber').sort({ createdAt: -1 }).limit(5);

    // Merge and sort recent transactions, mark direction
    const sentWithDir = recentSent.map(t => ({ ...t.toObject(), direction: 'sent' }));
    const recvWithDir = recentReceived.map(t => ({ ...t.toObject(), direction: 'received' }));
    const recentTransactions = [...sentWithDir, ...recvWithDir]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    const beneficiaries = await Beneficiary.find({ user: userId }).sort({ isFavorite: -1 }).limit(5);
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await Transaction.aggregate([
      { $match: { sender: userId, status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const typeBreakdown = await Transaction.aggregate([
      { $match: { sender: userId, status: 'completed' } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalResult = await Transaction.aggregate([
      { $match: { sender: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total received
    const totalReceivedResult = await Transaction.aggregate([
      { $match: { 
        $or: [
          { 'receiver.accountNumber': user.accountNumber },
          { 'receiver.mobile': user.phone }
        ],
        sender: { $ne: userId },
        status: 'completed'
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: { user, recentTransactions, beneficiaries, notifications, unreadCount, monthlySpending, typeBreakdown, totalTransferred: totalResult[0]?.total || 0, totalReceived: totalReceivedResult[0]?.total || 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
