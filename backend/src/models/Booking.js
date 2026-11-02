import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
  {
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
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingStation',
      required: true,
      index: true,
    },
    connectorIndex: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.TEMPORARILY_HELD,
      index: true,
    },
    // Concurrency temporary hold: auto-releases if payment not confirmed in time
    holdExpiresAt: {
      type: Date,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    baseAmount: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    ownerEarning: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    gatewayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      default: '',
    },
    qrCode: {
      type: String, // Base64 data URL
      default: '',
    },
    verificationCode: {
      type: String, // 6-digit OTP/Code
      default: '',
      index: true,
    },
    sessionStartedAt: {
      type: Date,
    },
    sessionCompletedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    isReviewed: {
      type: Boolean,
      default: false,
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

// Compound index for overlap detection query speed:
// Used when checking if a station has a conflicting active booking or hold
bookingSchema.index({
  stationId: 1,
  bookingStatus: 1,
  startTime: 1,
  endTime: 1,
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

