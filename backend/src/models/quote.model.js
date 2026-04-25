import mongoose, { Schema } from "mongoose";

const quoteSchema = new Schema({
    rfqId: { type: Schema.Types.ObjectId, ref: "RFQ", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    freightCharges: { type: Number, required: true },
    originCharges: { type: Number, required: true },
    destinationCharges: { type: Number, required: true },
    
    totalAmount: { type: Number },
    transitTimeDays: { type: Number, required: true },
    quoteValidity: { type: Date, required: true },
    
    rank: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure a supplier only bids once per RFQ (they update their existing bid)
quoteSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });

quoteSchema.pre('save', function(next) {
    this.totalAmount = this.freightCharges + this.originCharges + this.destinationCharges;
    next();
});

export const Quote = mongoose.model("Quote", quoteSchema);