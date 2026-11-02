import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { verifyWebhookSignature } from '../config/razorpay.js';
import { confirmBookingPayment } from '../services/bookingService.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

/**
 * Razorpay Webhook Handler
 * Uses raw request body to verify crypto signature
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Webhook] Invalid Razorpay webhook signature received.');
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Webhook] Received Razorpay event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        // Find matching booking
        const booking = await Booking.findOne({ gatewayOrderId: orderId });
        if (booking && booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
          await confirmBookingPayment({
            bookingId: booking._id,
            gatewayOrderId: orderId,
            gatewayPaymentId: paymentId,
            gatewaySignature: 'WEBHOOK_VERIFIED',
            userId: booking.userId,
          });
          console.log(`[Webhook] Confirmed booking ${booking._id} via webhook.`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Payment History for User
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

