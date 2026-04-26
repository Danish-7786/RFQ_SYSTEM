const Quote = require('../models/Quote');
const RFQ = require('../models/RFQ');
const { getSupplierRankings, checkAndExtendAuction, updateAuctionStatuses } = require('../services/auctionService');

const submitQuote = async (req, res) => {
  try {
    const {
      rfqId,
      carrierName,
      freightCharges,
      originCharges,
      destinationCharges,
      transitTime,
      quoteValidity,
    } = req.body;

    if (
      !rfqId ||
      !carrierName ||
      freightCharges === undefined ||
      originCharges === undefined ||
      destinationCharges === undefined ||
      !transitTime ||
      !quoteValidity
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await updateAuctionStatuses();

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const now = new Date();

    if (rfq.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Cannot submit bid. Auction status is: ${rfq.status}` });
    }

    if (now < rfq.bidStartTime) {
      return res.status(400).json({ error: 'Auction has not started yet' });
    }

    if (now > rfq.currentBidCloseTime) {
      return res.status(400).json({ error: 'Auction bidding time has ended' });
    }

    if (now > rfq.forcedBidCloseTime) {
      return res.status(400).json({ error: 'Auction has been force closed' });
    }

    const previousRankings = await getSupplierRankings(rfq._id);

    const totalPrice =
      Number(freightCharges) + Number(originCharges) + Number(destinationCharges);

    const quote = new Quote({
      rfqId,
      supplierId: req.user._id,
      carrierName: carrierName.trim(),
      freightCharges: Number(freightCharges),
      originCharges: Number(originCharges),
      destinationCharges: Number(destinationCharges),
      totalPrice,
      transitTime: Number(transitTime),
      quoteValidity: new Date(quoteValidity),
      submittedAt: now,
    });

    const savedQuote = await quote.save();

  
    rfq.activityLog.push({
      type: 'BID_SUBMITTED',
      message: `Bid submitted by "${carrierName}" with total price:$ ${totalPrice.toFixed(2)}`,
      timestamp: now,
    });
    await rfq.save();

    const updatedRFQ = await checkAndExtendAuction(rfqId, previousRankings);
    const updatedRankings = await getSupplierRankings(rfq._id);

    res.status(201).json({
      quote: savedQuote,
      rfq: updatedRFQ,
      rankings: updatedRankings,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};
const getQuotesByRFQ = async (req, res) => {
  try {
    let filter = { rfqId: req.params.rfqId };

    if (req.user.role === 'supplier') {
      filter.supplierId = req.user._id;
    }

    const quotes = await Quote.find(filter)
      .populate('supplierId', 'name companyName')
      .sort({ totalPrice: 1, submittedAt: 1 });

    const rankings = await getSupplierRankings(
      require('mongoose').Types.ObjectId.createFromHexString(req.params.rfqId)
    );

    res.json({ quotes, rankings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitQuote, getQuotesByRFQ };