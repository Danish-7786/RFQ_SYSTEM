import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Charge Breakdown
  freightCharges: { type: Number, required: true },
  originCharges: { type: Number, required: true },
  destinationCharges: { type: Number, required: true },
  
  // Computed & Meta
  totalAmount: { type: Number }, 
  rank: { type: Number, default: 0 },
  transitTimeDays: { type: Number, required: true },
  quoteValidity: { type: Date, required: true }
}, { timestamps: true });

// Prevent duplicate quotes from the same supplier on one RFQ
quoteSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });
// Optimize sorting by price
quoteSchema.index({ rfqId: 1, totalAmount: 1 });

quoteSchema.pre('save', function(next) {
  this.totalAmount = this.freightCharges + this.originCharges + this.destinationCharges;
  next();
});

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;