const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'BID_SUBMITTED',
      'TIME_EXTENDED',
      'AUCTION_CLOSED',
      'AUCTION_FORCE_CLOSED',
      'AUCTION_STARTED',
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const rfqSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bidStartTime: {
      type: Date,
      required: true,
    },
    bidCloseTime: {
      type: Date,
      required: true,
    },
    currentBidCloseTime: {
      type: Date,
      required: true,
    },
    forcedBidCloseTime: {
      type: Date,
      required: true,
    },
    pickupServiceDate: {
      type: Date,
      required: true,
    },
    triggerWindowMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    extensionDurationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    extensionTriggerType: {
      type: String,
      enum: ['BID_RECEIVED', 'ANY_RANK_CHANGE', 'L1_RANK_CHANGE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'CLOSED', 'FORCE_CLOSED'],
      default: 'UPCOMING',
    },
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

rfqSchema.pre('validate', function () {
  if (this.forcedBidCloseTime <= this.bidCloseTime) {
    this.invalidate(
      'forcedBidCloseTime',
      'Forced Bid Close Time must be later than Bid Close Time'
    );
  }
  if (this.bidStartTime >= this.bidCloseTime) {
    this.invalidate('bidStartTime', 'Bid Start Time must be before Bid Close Time');
  }

});

module.exports = mongoose.model('RFQ', rfqSchema);