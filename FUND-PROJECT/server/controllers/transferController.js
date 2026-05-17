const User = require('../models/User');
const Transaction = require('../models/Transaction');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const { generateOTP, TRANSFER_LIMITS } = require('../utils/helpers');

// Initiate transfer - generates OTP
const initiateTransfer = async (req, res, type) => {
  try {
    const { accountNumber, ifsc, amount, remarks, receiverName, bank, mobile } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const limits = TRANSFER_LIMITS[type];
    if (amount < limits.min) return res.status(400).json({ success: false, message: `Minimum ${type} amount is ₹${limits.min.toLocaleString()}` });
    if (amount > limits.max) return res.status(400).json({ success: false, message: `Maximum ${type} amount is ₹${limits.max.toLocaleString()}` });

    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Delete old OTPs
    await OTP.deleteMany({ user: user._id, purpose: 'transfer' });

    const otpCode = generateOTP();
    console.log(`\n🔐 Transfer OTP for ${user.email}: ${otpCode}\n`);

    const transactionData = { type, accountNumber, ifsc, amount, remarks, receiverName: receiverName || 'Unknown', bank: bank || 'Fund Transfer Bank', mobile };

    await OTP.create({ user: user._id, otp: otpCode, purpose: 'transfer', transactionData });

    res.status(200).json({ success: true, message: 'OTP sent for verification', data: { otpSent: true, amount, type } });
  } catch (error) {
    console.error('Transfer initiation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    NEFT Transfer
exports.neftTransfer = (req, res) => initiateTransfer(req, res, 'NEFT');

// @desc    RTGS Transfer
exports.rtgsTransfer = (req, res) => initiateTransfer(req, res, 'RTGS');

// @desc    IMPS Transfer
exports.impsTransfer = (req, res) => initiateTransfer(req, res, 'IMPS');

// @desc    Mobile Pay
exports.mobilePay = (req, res) => initiateTransfer(req, res, 'MOBILE');

// @desc    Verify OTP and complete transfer
// @route   POST /api/transfer/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' });

    const otpRecord = await OTP.findOne({ user: req.user._id, purpose: 'transfer', isUsed: false, expiresAt: { $gt: new Date() } });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'No pending transfer or OTP expired' });

    const isValid = await otpRecord.compareOTP(otp);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const txData = otpRecord.transactionData;

    // Deduct balance
    const user = await User.findById(req.user._id);
    if (user.balance < txData.amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    user.balance -= txData.amount;
    await user.save();

    // Credit receiver's account if they exist in our system
    const receiverAccountNum = txData.accountNumber || '';
    const receiverMobile = txData.mobile || '';
    let receiverUser = null;

    // Try finding receiver by account number
    if (receiverAccountNum) {
      receiverUser = await User.findOne({ accountNumber: receiverAccountNum, _id: { $ne: user._id } });
    }
    // Try finding receiver by phone number
    if (!receiverUser && receiverMobile) {
      receiverUser = await User.findOne({ phone: receiverMobile, _id: { $ne: user._id } });
    }
    // Try finding receiver by name (partial match, last resort)
    if (!receiverUser && txData.receiverName && txData.receiverName !== 'Unknown') {
      receiverUser = await User.findOne({ 
        name: { $regex: new RegExp(txData.receiverName, 'i') }, 
        _id: { $ne: user._id } 
      });
    }

    if (receiverUser) {
      receiverUser.balance += txData.amount;
      await receiverUser.save();
      console.log(`\n💰 ₹${txData.amount} credited to ${receiverUser.name} (${receiverUser.accountNumber}). New balance: ₹${receiverUser.balance}\n`);
    } else {
      console.log(`\n⚠️ Receiver not found in system. Account: "${receiverAccountNum}", Mobile: "${receiverMobile}", Name: "${txData.receiverName}". No credit applied.\n`);
    }

    // Create transaction
    const transaction = await Transaction.create({
      sender: user._id,
      receiver: { name: txData.receiverName, accountNumber: receiverAccountNum || receiverMobile || 'N/A', bank: txData.bank, ifsc: txData.ifsc || '', mobile: receiverMobile },
      type: txData.type,
      amount: txData.amount,
      remarks: txData.remarks || '',
      status: txData.type === 'IMPS' ? 'completed' : 'pending',
      receiverCredited: !!receiverUser
    });

    // Mark OTP used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Notification to sender
    await Notification.create({
      user: user._id,
      title: `${txData.type} Transfer ${txData.type === 'IMPS' ? 'Completed' : 'Initiated'}`,
      message: `₹${txData.amount.toLocaleString('en-IN')} sent to ${txData.receiverName}. Ref: ${transaction.reference}`,
      type: 'transfer'
    });

    // Notification to receiver (if they exist in our system)
    if (receiverUser) {
      await Notification.create({
        user: receiverUser._id,
        title: 'Money Received',
        message: `₹${txData.amount.toLocaleString('en-IN')} received from ${user.name}. Ref: ${transaction.reference}`,
        type: 'transfer'
      });
    }

    // Auto-complete NEFT/MOBILE after 2s simulation
    if (txData.type === 'NEFT' || txData.type === 'MOBILE') {
      setTimeout(async () => {
        await Transaction.findByIdAndUpdate(transaction._id, { status: 'completed' });
      }, 2000);
    }

    res.status(200).json({
      success: true,
      message: `${txData.type} transfer ${txData.type === 'IMPS' ? 'completed' : 'initiated'} successfully`,
      data: { transaction, newBalance: user.balance }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
