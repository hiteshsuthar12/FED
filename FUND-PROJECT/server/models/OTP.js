const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['transfer', 'login', 'reset-password'],
    required: true
  },
  transactionData: {
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash OTP before saving
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) return next();
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  next();
});

// Compare OTP
otpSchema.methods.compareOTP = async function(candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

// Auto-expire TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ user: 1, purpose: 1 });

module.exports = mongoose.model('OTP', otpSchema);
