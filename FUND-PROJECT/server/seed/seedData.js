require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Beneficiary = require('../models/Beneficiary');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Beneficiary.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@fundtransfer.com',
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
      balance: 0,
      isFirstLogin: false,
      accountNumber: 'FTSADMIN001'
    });
    console.log('✅ Admin created: admin@fundtransfer.com / Admin@123');

    // Create sample users (as if admin created them)
    const users = await User.create([
      { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', password: 'User@123', balance: 75000, isFirstLogin: false },
      { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', password: 'User@123', balance: 120000, isFirstLogin: false },
      { name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', password: 'User@123', balance: 45000, isFirstLogin: false },
      { name: 'Sneha Gupta', email: 'sneha@example.com', phone: '9876543213', password: 'User@123', balance: 90000, isFirstLogin: false },
      { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', password: 'User@123', balance: 200000, isFirstLogin: false }
    ]);
    console.log('✅ 5 sample users created (password: User@123)');

    // Create beneficiaries for Rahul
    const beneficiaries = await Beneficiary.create([
      { user: users[0]._id, name: 'Priya Patel', bank: 'HDFC Bank', accountNumber: users[1].accountNumber, ifsc: 'HDFC0001234', mobile: '9876543211', isFavorite: true },
      { user: users[0]._id, name: 'Amit Kumar', bank: 'SBI', accountNumber: users[2].accountNumber, ifsc: 'SBIN0005678', mobile: '9876543212' },
      { user: users[0]._id, name: 'External Person', bank: 'ICICI Bank', accountNumber: 'ICICI00012345', ifsc: 'ICIC0009876', mobile: '9876500000' }
    ]);
    console.log('✅ Beneficiaries created');

    // Create sample transactions
    const txns = await Transaction.create([
      { sender: users[0]._id, receiver: { name: 'Priya Patel', accountNumber: users[1].accountNumber, bank: 'HDFC Bank', ifsc: 'HDFC0001234' }, type: 'NEFT', amount: 5000, status: 'completed', remarks: 'Monthly rent' },
      { sender: users[0]._id, receiver: { name: 'Amit Kumar', accountNumber: users[2].accountNumber, bank: 'SBI', ifsc: 'SBIN0005678' }, type: 'IMPS', amount: 2500, status: 'completed', remarks: 'Dinner split' },
      { sender: users[0]._id, receiver: { name: 'External Person', accountNumber: 'ICICI00012345', bank: 'ICICI Bank', ifsc: 'ICIC0009876' }, type: 'RTGS', amount: 250000, status: 'pending', remarks: 'Business payment' },
      { sender: users[1]._id, receiver: { name: 'Rahul Sharma', accountNumber: users[0].accountNumber, bank: 'Fund Transfer Bank' }, type: 'NEFT', amount: 10000, status: 'completed', remarks: 'Refund' },
      { sender: users[0]._id, receiver: { name: 'Sneha Gupta', accountNumber: users[3].accountNumber, bank: 'Axis Bank', mobile: '9876543213' }, type: 'MOBILE', amount: 1500, status: 'completed', remarks: 'Gift' },
      { sender: users[2]._id, receiver: { name: 'Vikram Singh', accountNumber: users[4].accountNumber, bank: 'PNB' }, type: 'NEFT', amount: 8000, status: 'flagged', remarks: 'Suspicious transfer' },
    ]);
    console.log('✅ Sample transactions created');

    // Welcome notifications
    for (const user of users) {
      await Notification.create({ user: user._id, title: 'Welcome to Fund Transfer System', message: `Your account ${user.accountNumber} is ready. Enjoy secure banking!`, type: 'welcome' });
    }
    await Notification.create({ user: users[0]._id, title: 'NEFT Transfer Completed', message: '₹5,000 sent to Priya Patel successfully.', type: 'transfer' });
    await Notification.create({ user: users[0]._id, title: 'IMPS Transfer Completed', message: '₹2,500 sent to Amit Kumar instantly.', type: 'transfer' });
    console.log('✅ Notifications created');

    console.log('\n🎉 Seed data loaded successfully!\n');
    console.log('Admin Login: admin@fundtransfer.com / Admin@123');
    console.log('User Login:  rahul@example.com / User@123');
    console.log('             priya@example.com / User@123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
