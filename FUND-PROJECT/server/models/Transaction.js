const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    name: { type: String, required: true },
    accountNumber: { type: String, default: 'N/A' },
    bank: { type: String, default: 'Fund Transfer Bank' },
    ifsc: { type: String },
    mobile: { type: String }
  },
  beneficiary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiary'
  },
  type: {
    type: String,
    enum: ['NEFT', 'RTGS', 'IMPS', 'MOBILE'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least ₹1']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'flagged'],
    default: 'pending'
  },
  reference: {
    type: String,
    unique: true
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 200
  },
  failureReason: {
    type: String
  },
  receiverCredited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate unique reference number before saving
transactionSchema.pre('validate', function(next) {
  if (!this.reference) {
    const type = this.type || 'TXN';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.reference = `${type}${timestamp}${random}`;
  }
  next();
});

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
