// Helper utility functions

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate unique account number
const generateAccountNumber = () => {
  const prefix = 'FTS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

// Generate transaction reference
const generateReference = (type) => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${type}${timestamp}${random}`;
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Transfer limits configuration
const TRANSFER_LIMITS = {
  NEFT: { min: 1, max: 1000000, dailyMax: 5000000 },
  RTGS: { min: 200000, max: 10000000, dailyMax: 50000000 },
  IMPS: { min: 1, max: 500000, dailyMax: 2000000 },
  MOBILE: { min: 1, max: 100000, dailyMax: 500000 }
};

module.exports = {
  generateOTP,
  generateAccountNumber,
  generateReference,
  formatCurrency,
  TRANSFER_LIMITS
};
