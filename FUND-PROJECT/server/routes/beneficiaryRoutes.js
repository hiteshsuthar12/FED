const express = require('express');
const router = express.Router();
const { addBeneficiary, getBeneficiaries, updateBeneficiary, deleteBeneficiary, toggleFavorite } = require('../controllers/beneficiaryController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, addBeneficiary);
router.get('/', protect, getBeneficiaries);
router.put('/:id', protect, updateBeneficiary);
router.delete('/:id', protect, deleteBeneficiary);
router.put('/:id/favorite', protect, toggleFavorite);

module.exports = router;
