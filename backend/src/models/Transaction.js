import mongoose from 'mongoose';
import { SETTLEMENT_STATUS } from '../config/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['BOOKING_REVENUE', 'SUBSCRIPTION_PAYMENT', 'OWNER_SETTLEMENT', 'REFUND'],
      default: 'BOOKING_REVENUE',
      index: true,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    platformCommission: {
      type: Number,
      default: 0,
    },
    gatewayFee: {
      type: Number,
      default: 0,
    },
    ownerNetAmount: {
      type: Number,
      default: 0,
    },
    settlementStatus: {
      type: String,
      enum: Object.values(SETTLEMENT_STATUS),
      default: SETTLEMENT_STATUS.PENDING,
      index: true,
    },
    settlementReference: {
      type: String,
      default: '',
    },
    settledAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

