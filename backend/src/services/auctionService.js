const RFQ = require('../models/RFQ');
const Quote = require('../models/Quote');

const getSupplierRankings = async (rfqId) => {
  const rankings = await Quote.aggregate([
    { $match: { rfqId: rfqId } },
    { $sort: { totalPrice: 1, submittedAt: 1 } },
    {
      $group: {
        _id: '$carrierName',
        lowestBid: { $first: '$totalPrice' },
        supplierId: { $first: '$supplierId' },
        latestQuote: { $first: '$$ROOT' },
      },
    },
    { $sort: { lowestBid: 1 } },
  ]);

  return rankings.map((r, index) => ({
    rank: index + 1,
    carrierName: r._id,
    totalPrice: r.lowestBid,
    supplierId: r.supplierId,
    quote: r.latestQuote,
  }));
};

const checkAndExtendAuction = async (rfqId, previousRankings) => {
  const rfq = await RFQ.findById(rfqId);
  if (!rfq) return null;

  const now = new Date();

  if (rfq.status !== 'ACTIVE') return rfq;
  if (now >= rfq.forcedBidCloseTime) return rfq;

  const currentCloseTime = new Date(rfq.currentBidCloseTime);
  const triggerWindowStart = new Date(
    currentCloseTime.getTime() - rfq.triggerWindowMinutes * 60 * 1000
  );

  if (now < triggerWindowStart || now > currentCloseTime) {
    return rfq;
  }

  const currentRankings = await getSupplierRankings(rfq._id);
  let shouldExtend = false;
  let reason = '';

  switch (rfq.extensionTriggerType) {
    case 'BID_RECEIVED':
      shouldExtend = true;
      reason = `Bid received within last ${rfq.triggerWindowMinutes} minutes of auction close`;
      break;

    case 'ANY_RANK_CHANGE':
      if (previousRankings.length !== currentRankings.length) {
        shouldExtend = true;
        reason = `New supplier entered rankings within last ${rfq.triggerWindowMinutes} minutes`;
      } else {
        for (let i = 0; i < currentRankings.length; i++) {
          const prev = previousRankings[i];
          const curr = currentRankings[i];
          if (
            !prev ||
            prev.carrierName !== curr.carrierName ||
            prev.totalPrice !== curr.totalPrice
          ) {
            shouldExtend = true;
            reason = `Supplier rank change detected within last ${rfq.triggerWindowMinutes} minutes`;
            break;
          }
        }
      }
      break;

    case 'L1_RANK_CHANGE':
      const prevL1 = previousRankings.length > 0 ? previousRankings[0] : null;
      const currL1 = currentRankings.length > 0 ? currentRankings[0] : null;

      if (prevL1 && currL1 && prevL1.carrierName !== currL1.carrierName) {
        shouldExtend = true;
        reason = `Lowest bidder (L1) changed from "${prevL1.carrierName}" to "${currL1.carrierName}" within last ${rfq.triggerWindowMinutes} minutes`;
      }
      break;
  }

  if (shouldExtend) {
    const newCloseTime = new Date(
      currentCloseTime.getTime() + rfq.extensionDurationMinutes * 60 * 1000
    );

    const effectiveNewCloseTime =
      newCloseTime > rfq.forcedBidCloseTime ? rfq.forcedBidCloseTime : newCloseTime;

    rfq.currentBidCloseTime = effectiveNewCloseTime;

    rfq.activityLog.push({
      type: 'TIME_EXTENDED',
      message: `Auction extended by ${rfq.extensionDurationMinutes} min. New close: ${effectiveNewCloseTime.toISOString()}`,
      reason: reason,
      timestamp: now,
    });

    await rfq.save();
  }

  return rfq;
};

const updateAuctionStatuses = async () => {
  const now = new Date();

  // UPCOMING -> ACTIVE
  await RFQ.updateMany(
    { status: 'UPCOMING', bidStartTime: { $lte: now } },
    {
      $set: { status: 'ACTIVE' },
      $push: {
        activityLog: {
          type: 'AUCTION_STARTED',
          message: 'Auction has started',
          timestamp: now,
        },
      },
    }
  );

  // Force close past forced time
  const forceCloseRFQs = await RFQ.find({
    status: 'ACTIVE',
    forcedBidCloseTime: { $lte: now },
  });

  for (const rfq of forceCloseRFQs) {
    rfq.status = 'FORCE_CLOSED';
    rfq.activityLog.push({
      type: 'AUCTION_FORCE_CLOSED',
      message: 'Auction force closed - reached forced bid close time',
      timestamp: now,
    });
    await rfq.save();
  }

  // Close past current bid close time
  const closeRFQs = await RFQ.find({
    status: 'ACTIVE',
    currentBidCloseTime: { $lte: now },
    forcedBidCloseTime: { $gt: now },
  });

  for (const rfq of closeRFQs) {
    rfq.status = 'CLOSED';
    rfq.activityLog.push({
      type: 'AUCTION_CLOSED',
      message: 'Auction closed - bid close time reached',
      timestamp: now,
    });
    await rfq.save();
  }
};

module.exports = {
  getSupplierRankings,
  checkAndExtendAuction,
  updateAuctionStatuses,
};