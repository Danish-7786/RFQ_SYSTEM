const RFQ = require('../models/RFQ');
const Quote = require('../models/Quote');
const { getSupplierRankings, updateAuctionStatuses } = require('../services/auctionService');

const generateReferenceId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RFQ-${timestamp}-${random}`;
};

// @desc    Create RFQ (Buyer only)
// @route   POST /api/rfqs
const createRFQ = async (req, res) => {
  try {
    const {
      name,
      bidStartTime,
      bidCloseTime,
      forcedBidCloseTime,
      pickupServiceDate,
      triggerWindowMinutes,
      extensionDurationMinutes,
      extensionTriggerType,
    } = req.body;

    if (
      !name ||
      !bidStartTime ||
      !bidCloseTime ||
      !forcedBidCloseTime ||
      !pickupServiceDate ||
      !triggerWindowMinutes ||
      !extensionDurationMinutes ||
      !extensionTriggerType
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const bidStartDate = new Date(bidStartTime);
    const bidCloseDate = new Date(bidCloseTime);
    const forcedCloseDate = new Date(forcedBidCloseTime);

    if (forcedCloseDate <= bidCloseDate) {
      return res
        .status(400)
        .json({ error: 'Forced Bid Close Time must be later than Bid Close Time' });
    }

    if (bidStartDate >= bidCloseDate) {
      return res.status(400).json({ error: 'Bid Start Time must be before Bid Close Time' });
    }

    const now = new Date();
    let status = 'UPCOMING';
    const activityLog = [];

    if (now >= bidStartDate && now < forcedCloseDate && now < bidCloseDate) {
      status = 'ACTIVE';
      activityLog.push({
        type: 'AUCTION_STARTED',
        message: 'Auction has started',
        timestamp: now,
      });
    } else if (now >= forcedCloseDate) {
      status = 'FORCE_CLOSED';
    } else if (now >= bidCloseDate) {
      status = 'CLOSED';
    }

    const rfq = new RFQ({
      name,
      referenceId: generateReferenceId(),
      createdBy: req.user._id,
      bidStartTime: bidStartDate,
      bidCloseTime: bidCloseDate,
      currentBidCloseTime: bidCloseDate,
      forcedBidCloseTime: forcedCloseDate,
      pickupServiceDate: new Date(pickupServiceDate),
      triggerWindowMinutes: Number(triggerWindowMinutes),
      extensionDurationMinutes: Number(extensionDurationMinutes),
      extensionTriggerType,
      status,
      activityLog,
    });

    const savedRFQ = await rfq.save();
    const populated = await RFQ.findById(savedRFQ._id).populate('createdBy', 'name companyName');
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all RFQs
// @route   GET /api/rfqs
const getAllRFQs = async (req, res) => {
  try {
    await updateAuctionStatuses();

    let filter = {};
    // Buyers see their own RFQs, suppliers see all active/closed
    if (req.user.role === 'buyer') {
      filter = { createdBy: req.user._id };
    }

    const rfqs = await RFQ.find(filter)
      .populate('createdBy', 'name companyName')
      .sort({ createdAt: -1 });

    const rfqsWithBids = await Promise.all(
      rfqs.map(async (rfq) => {
        const lowestQuote = await Quote.findOne({ rfqId: rfq._id })
          .sort({ totalPrice: 1 })
          .limit(1);

        const bidCount = await Quote.countDocuments({ rfqId: rfq._id });

        return {
          ...rfq.toObject(),
          currentLowestBid: lowestQuote ? lowestQuote.totalPrice : null,
          lowestBidCarrier: lowestQuote ? lowestQuote.carrierName : null,
          bidCount,
        };
      })
    );

    res.json(rfqsWithBids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single RFQ detail
// @route   GET /api/rfqs/:id
const getRFQById = async (req, res) => {
  try {
    await updateAuctionStatuses();

    const rfq = await RFQ.findById(req.params.id).populate('createdBy', 'name companyName');
    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    let quotes;
    if (req.user.role === 'buyer') {
      // Buyer sees all quotes
      quotes = await Quote.find({ rfqId: rfq._id })
        .populate('supplierId', 'name companyName')
        .sort({ totalPrice: 1, submittedAt: 1 });
    } else {
      // Supplier sees only their own quotes plus rankings (anonymous)
      quotes = await Quote.find({ rfqId: rfq._id, supplierId: req.user._id }).sort({
        totalPrice: 1,
        submittedAt: 1,
      });
    }

    const rankings = await getSupplierRankings(rfq._id);

    // For suppliers, mask other supplier names in rankings
    let sanitizedRankings = rankings;
    if (req.user.role === 'supplier') {
      sanitizedRankings = rankings.map((r) => ({
        rank: r.rank,
        carrierName:
          r.supplierId.toString() === req.user._id.toString()
            ? r.carrierName
            : `Supplier L${r.rank}`,
        totalPrice: r.totalPrice,
        isYou: r.supplierId.toString() === req.user._id.toString(),
      }));
    }

    res.json({
      rfq,
      quotes,
      rankings: sanitizedRankings,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createRFQ, getAllRFQs, getRFQById };