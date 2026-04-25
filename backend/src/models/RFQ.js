import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Timing
  bidStartTime: { type: Date, required: true },
  bidEndTime: { type: Date, required: true },
  forcedCloseTime: { type: Date, required: true },
  
  // British Auction Config
  triggerWindowMins: { type: Number, default: 10 },
  extensionDurationMins: { type: Number, default: 5 },
  extensionTrigger: { 
    type: String, 
    enum: ['ANY_BID', 'RANK_CHANGE', 'L1_CHANGE'], 
    default: 'L1_CHANGE' 
  },

  status: { 
    type: String, 
    enum: ['ACTIVE', 'CLOSED', 'FORCE_CLOSED'], 
    default: 'ACTIVE' 
  }
}, { timestamps: true });

// Index for the Listing Page performance
rfqSchema.index({ bidEndTime: 1, status: 1 });

// Logic to prevent extension beyond hard cap
rfqSchema.pre('save', function(next) {
  if (this.bidEndTime > this.forcedCloseTime) {
    this.bidEndTime = this.forcedCloseTime;
  }
  next();
});

const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;