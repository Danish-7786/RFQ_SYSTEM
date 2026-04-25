import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RFQ } from "../models/rfq.model.js";
import { Quote } from "../models/quote.model.js";

// @desc    Submit or Update a Bid (Supplier Only)
export const submitQuote = asyncHandler(async (req, res) => {
    const { rfqId, freightCharges, originCharges, destinationCharges, transitTimeDays, quoteValidity } = req.body;
   const supplierId = req.user._id;

    if (!supplierId) throw new ApiError(401, "Unauthorized");

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) throw new ApiError(404, "RFQ not found");

    const currentTime = new Date();
    if (currentTime > rfq.bidEndTime) {
        throw new ApiError(400, "Auction has ended");
    }

    // 1. Identify current L1 before saving new quote
    const previousL1 = await Quote.findOne({ rfqId }).sort({ totalAmount: 1 });

    // 2. Upsert the Quote (Update if exists, Create if new)
    const newTotal = freightCharges + originCharges + destinationCharges;
    await Quote.findOneAndUpdate(
        { rfqId, supplierId },
        { freightCharges, originCharges, destinationCharges, totalAmount: newTotal, transitTimeDays, quoteValidity },
        { upsert: true, new: true }
    );

    // 3. Recalculate Ranks for all suppliers
    const allQuotes = await Quote.find({ rfqId }).sort({ totalAmount: 1 });
    let rankChanged = false;

    for (let i = 0; i < allQuotes.length; i++) {
        const currentRank = i + 1;
        if (allQuotes[i].rank !== currentRank) {
            rankChanged = true;
            await Quote.updateOne({ _id: allQuotes[i]._id }, { rank: currentRank });
        }
    }

    // 4. British Auction Extension Logic
    const windowStart = new Date(rfq.bidEndTime.getTime() - rfq.triggerWindowMins * 60000);
    let extended = false;

    if (currentTime >= windowStart && currentTime <= rfq.bidEndTime) {
        let shouldExtend = false;
        
        // Check triggers
        if (rfq.extensionTrigger === 'ANY_BID') shouldExtend = true;
        if (rfq.extensionTrigger === 'RANK_CHANGE' && rankChanged) shouldExtend = true;
        
        const newL1 = allQuotes[0]; // After sorting
        if (rfq.extensionTrigger === 'L1_CHANGE') {
            if (!previousL1 || previousL1.supplierId.toString() !== newL1.supplierId.toString()) {
                shouldExtend = true;
            }
        }

        // Apply extension
        if (shouldExtend) {
            rfq.bidEndTime = new Date(rfq.bidEndTime.getTime() + rfq.extensionDurationMins * 60000);
            await rfq.save(); // pre-save hook caps it at forcedCloseTime
            extended = true;
            // TODO: Emit Socket.io event here: io.to(rfqId).emit('timerUpdate', rfq.bidEndTime)
        }
    }

    return res.status(200).json(
        new ApiResponse(200, { extended, newEndTime: rfq.bidEndTime }, "Bid submitted successfully")
    );
});