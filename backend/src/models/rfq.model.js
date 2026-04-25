import mongoose, { Schema } from "mongoose";

const rfqSchema = new Schema({
    title: { type: String, required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    bidStartTime: { type: Date, required: true },
    bidEndTime: { type: Date, required: true },
    forcedCloseTime: { type: Date, required: true },
    
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

rfqSchema.pre('save', function(next) {
    if (this.bidEndTime > this.forcedCloseTime) {
        this.bidEndTime = this.forcedCloseTime;
    }
   
});

export const RFQ = mongoose.model("RFQ", rfqSchema);