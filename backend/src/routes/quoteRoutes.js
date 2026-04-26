const express = require('express');
const router = express.Router();
const { submitQuote, getQuotesByRFQ } = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('supplier'), submitQuote);
router.get('/rfq/:rfqId', protect, getQuotesByRFQ);

module.exports = router;