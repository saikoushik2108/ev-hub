import Booking from '../models/Booking.js';
import ChargingStation from '../models/ChargingStation.js';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import OwnerProfile from '../models/OwnerProfile.js';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SETTLEMENT_STATUS,
  ROLES,
} from '../config/constants.js';
import {
  createBookingHold,
  confirmBookingPayment,
} from '../services/bookingService.js';
import { createNotification } from '../services/notificationService.js';
import { emitToOwner, emitToStation, broadcastGlobal } from '../config/socket.js';

/**
 * Step 1 of Booking: Create Temporary Hold & Payment Order
 */
export const holdBooking = async (req, res, next) => {
  try {
    const { stationId, startTime, endTime, couponCode } = req.body;

    if (!stationId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stationId, startTime, and endTime.',
      });
    }

    const result = await createBookingHold({
      userId: req.user._id,
      stationId,
      startTime,
      endTime,
      couponCode,
    });

    res.status(201).json({
      success: true,
      message: 'Slot temporarily reserved for 5 minutes. Please complete payment.',
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes('outside operating hours') ||
      error.message.includes('past') ||
      error.message.includes('Hosts cannot book')
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('just selected') || error.message.includes('capacity')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Step 2 of Booking: Confirm Payment & Confirm Booking
 */
export const confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, gatewayOrderId, gatewayPaymentId, gatewaySignature } = req.body;

    if (!bookingId || !gatewayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and gatewayPaymentId are required.',
      });
    }

    const result = await confirmBookingPayment({
      bookingId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: result.booking,
      alreadyConfirmed: result.alreadyConfirmed,
    });
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(410).json({ success: false, message: error.message });
    }
    if (error.message.includes('verification failed')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Get User's Bookings
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };

    if (status) {
      if (status === 'ACTIVE') {
        query.bookingStatus = {
          $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS],
        };
      } else if (status === 'COMPLETED') {
        query.bookingStatus = BOOKING_STATUS.COMPLETED;
      } else if (status === 'CANCELLED') {
        query.bookingStatus = {
          $in: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REFUNDED],
        };
      } else {
        query.bookingStatus = status;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('stationId', 'name address location chargerType connectorType chargingCapacity photos price')
      .populate('ownerId', 'name phone email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Booking By ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('stationId')
      .populate('ownerId', 'name phone email profileImage')
      .populate('userId', 'name phone email vehicleDetails');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Permission check: User, Host, or Admin
    const isDriver = booking.userId._id.toString() === req.user._id.toString();
    const isHost = booking.ownerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isDriver && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Booking (According to Cancellation Policy)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate('stationId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isDriver = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isDriver && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (
      booking.bookingStatus !== BOOKING_STATUS.CONFIRMED &&
      booking.bookingStatus !== BOOKING_STATUS.TEMPORARILY_HELD
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking in '${booking.bookingStatus}' status.`,
      });
    }

    const now = new Date();
    const start = new Date(booking.startTime);
    const hoursRemaining = (start - now) / (1000 * 60 * 60);

    // Refund policy calculation:
    // > 2 hours before slot: 100% refund
    // 0 to 2 hours before slot: 75% refund (25% cancellation fee)
    // After start: No refund
    let refundAmount = 0;
    if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
      if (hoursRemaining >= 2) {
        refundAmount = booking.totalAmount;
      } else if (hoursRemaining > 0) {
        refundAmount = Math.round(booking.totalAmount * 0.75);
      } else {
        refundAmount = 0;
      }
    }

    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    booking.cancellationReason = reason || 'Cancelled by driver';
    booking.cancelledAt = now;
    booking.refundAmount = refundAmount;
    if (refundAmount > 0) {
      booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
    }
    await booking.save();

    // Adjust Owner Balance if refund was applied
    if (refundAmount > 0) {
      await OwnerProfile.findOneAndUpdate(
        { userId: booking.ownerId },
        {
          $inc: {
            pendingSettlement: -Math.min(booking.ownerEarning, refundAmount),
          },
        }
      );

      // Record refund transaction
      await Transaction.create({
        bookingId: booking._id,
        ownerId: booking.ownerId,
        userId: booking.userId,
        type: 'REFUND',
        grossAmount: -refundAmount,
        platformCommission: 0,
        gatewayFee: 0,
        ownerNetAmount: -Math.min(booking.ownerEarning, refundAmount),
        settlementStatus: SETTLEMENT_STATUS.SETTLED,
        notes: `Cancellation refund: ${reason || 'User cancelled'}`,
      });
    }

    // Send notifications
    await createNotification({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking at ${booking.stationId?.name} has been cancelled.${refundAmount > 0 ? ` Refund of ₹${refundAmount} initiated.` : ''}`,
      type: 'BOOKING',
      link: '/user/bookings',
    });

    await createNotification({
      userId: booking.ownerId,
      title: 'Booking Cancelled by Driver',
      message: `A booking for ${booking.stationId?.name} scheduled for ${new Date(booking.startTime).toLocaleTimeString()} was cancelled. Slot is available again.`,
      type: 'BOOKING',
      link: '/owner/bookings',
      isOwner: true,
    });

    // Real-time broadcast that slot is now released
    broadcastGlobal('stationAvailabilityUpdated', {
      stationId: booking.stationId?._id,
      event: 'SLOT_RELEASED',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      refundAmount,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify QR Code or 6-digit verification code by Host / Driver
 */
export const verifyBookingQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationCode, action = 'START_SESSION' } = req.body;

    const booking = await Booking.findById(id).populate('stationId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Must match either host of the station or admin
    const isHost = booking.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the station host can verify check-in for this booking.',
      });
    }

    if (verificationCode && booking.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check driver app.',
      });
    }

    const now = new Date();

    if (action === 'START_SESSION') {
      if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
        return res.status(400).json({
          success: false,
          message: `Cannot start session. Current booking status is ${booking.bookingStatus}.`,
        });
      }
      booking.bookingStatus = BOOKING_STATUS.IN_PROGRESS;
      booking.sessionStartedAt = now;
      await booking.save();

      await createNotification({
        userId: booking.userId,
        title: 'Charging Session Started! ⚡',
        message: `Your EV charging session at ${booking.stationId?.name} has started.`,
        type: 'BOOKING',
        link: '/user/bookings',
      });
    } else if (action === 'COMPLETE_SESSION') {
      booking.bookingStatus = BOOKING_STATUS.COMPLETED;
      booking.sessionCompletedAt = now;
      await booking.save();

      await createNotification({
        userId: booking.userId,
        title: 'Charging Session Completed! 🏁',
        message: `Your EV charging session at ${booking.stationId?.name} has completed. Thank you for charging green!`,
        type: 'BOOKING',
        link: '/user/bookings',
      });
    }

    broadcastGlobal('stationAvailabilityUpdated', {
      stationId: booking.stationId?._id,
      event: 'SESSION_STATUS_CHANGED',
      bookingStatus: booking.bookingStatus,
    });

    res.status(200).json({
      success: true,
      message: `Charging session updated to ${booking.bookingStatus}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
