const Beneficiary = require('../models/Beneficiary');

// @desc    Add beneficiary
// @route   POST /api/beneficiaries
exports.addBeneficiary = async (req, res) => {
  try {
    const { name, bank, accountNumber, ifsc, mobile, nickname } = req.body;
    const existing = await Beneficiary.findOne({ user: req.user._id, accountNumber });
    if (existing) return res.status(400).json({ success: false, message: 'Beneficiary already exists' });

    const beneficiary = await Beneficiary.create({ user: req.user._id, name, bank, accountNumber, ifsc, mobile, nickname });
    res.status(201).json({ success: true, message: 'Beneficiary added', data: { beneficiary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all beneficiaries
// @route   GET /api/beneficiaries
exports.getBeneficiaries = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = { user: req.user._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bank: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const beneficiaries = await Beneficiary.find(query).sort({ isFavorite: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: { beneficiaries } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update beneficiary
// @route   PUT /api/beneficiaries/:id
exports.updateBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({ _id: req.params.id, user: req.user._id });
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    Object.assign(beneficiary, req.body);
    await beneficiary.save();
    res.status(200).json({ success: true, message: 'Beneficiary updated', data: { beneficiary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete beneficiary
// @route   DELETE /api/beneficiaries/:id
exports.deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    res.status(200).json({ success: true, message: 'Beneficiary deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle favorite
// @route   PUT /api/beneficiaries/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({ _id: req.params.id, user: req.user._id });
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });

    beneficiary.isFavorite = !beneficiary.isFavorite;
    await beneficiary.save();
    res.status(200).json({ success: true, data: { beneficiary } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
