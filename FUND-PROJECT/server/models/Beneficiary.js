const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Beneficiary name is required'],
    trim: true
  },
  bank: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  ifsc: {
    type: String,
    required: [true, 'IFSC code is required'],
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid mobile number']
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  nickname: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

beneficiarySchema.index({ user: 1 });
beneficiarySchema.index({ user: 1, accountNumber: 1 }, { unique: true });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
