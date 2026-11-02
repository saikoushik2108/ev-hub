import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    gateway: {
      type: String,
      default: 'RAZORPAY',
    },
    gatewayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    gatewaySignature: {
      type: String,
      default: '',
    },
    signatureVerificationStatus: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'PROCESSED', 'FAILED'],
      default: 'NONE',
    },
    refundId: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    rawMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

