import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RFQ } from "../models/rfq.model.js";

// @desc    Create an RFQ (Buyer Only)
export const createRFQ = asyncHandler(async (req, res) => {
    const { title, bidStartTime, bidEndTime, forcedCloseTime, triggerWindowMins, extensionDurationMins, extensionTrigger } = req.body;
    const buyerId = req.user._id;
    
    if (!buyerId) throw new ApiError(401, "Unauthorized request");

    const rfq = await RFQ.create({
        title,
        buyerId,
        bidStartTime,
        bidEndTime,
        forcedCloseTime,
        triggerWindowMins,
        extensionDurationMins,
        extensionTrigger
    });

    return res.status(201).json(new ApiResponse(201, rfq, "RFQ created successfully"));
});

// @desc    Get RFQ Details with Quotes (For Leaderboard)
export const getRFQDetails = asyncHandler(async (req, res) => {
    const { rfqId } = req.params;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) throw new ApiError(404, "RFQ not found");

    // Mongoose Aggregation pipeline to join quotes and sort them
    const leaderboard = await RFQ.aggregate([
        { $match: { _id: rfq._id } },
        {
            $lookup: {
                from: "quotes",
                localField: "_id",
                foreignField: "rfqId",
                as: "bids"
            }
        },
        { $unwind: { path: "$bids", preserveNullAndEmptyArrays: true } },
        { $sort: { "bids.rank": 1 } },
        {
            $group: {
                _id: "$_id",
                title: { $first: "$title" },
                bidEndTime: { $first: "$bidEndTime" },
                forcedCloseTime: { $first: "$forcedCloseTime" },
                status: { $first: "$status" },
                bids: { $push: "$bids" }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, leaderboard[0], "RFQ fetched"));
});