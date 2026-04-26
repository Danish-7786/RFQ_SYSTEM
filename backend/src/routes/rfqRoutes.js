const express = require('express');
const router = express.Router();
const { createRFQ, getAllRFQs, getRFQById } = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('buyer'), createRFQ);
router.get('/', protect, getAllRFQs);
router.get('/:id', protect, getRFQById);

module.exports = router;