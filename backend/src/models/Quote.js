const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    carrierName: {
      type: String,
      required: true,
      trim: true,
    },
    freightCharges: {
      type: Number,
      required: true,
      min: 0,
    },
    originCharges: {
      type: Number,
      required: true,
      min: 0,
    },
    destinationCharges: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    transitTime: {
      type: Number,
      required: true,
      min: 1,
    },
    quoteValidity: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

quoteSchema.pre('validate', function () {
  this.totalPrice =
    Number(this.freightCharges) + Number(this.originCharges) + Number(this.destinationCharges);

});

module.exports = mongoose.model('Quote', quoteSchema);