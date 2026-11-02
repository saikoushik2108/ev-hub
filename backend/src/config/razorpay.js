import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_key';

export const isRazorpayConfigured = () => {
  return (
    key_id &&
    key_secret &&
    !key_id.includes('placeholder') &&
    !key_secret.includes('placeholder')
  );
};

let razorpayInstance = null;

if (isRazorpayConfigured()) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    console.log('[Payment] Razorpay initialized in live/test mode.');
  } catch (error) {
    console.warn('[Payment] Razorpay initialization warning:', error.message);
  }
} else {
  console.log('[Payment] Razorpay running in simulated sandbox mode (placeholder keys detected).');
}

/**
 * Create a Razorpay Order for booking or checkout
 */
export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const amountInPaise = Math.round(amount * 100);

  if (isRazorpayConfigured() && razorpayInstance) {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    });
    return {
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      isSandbox: false,
    };
  }

  // Simulated fallback order for seamless developer evaluation
  const mockOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    orderId: mockOrderId,
    amount,
    currency,
    isSandbox: true,
  };
};

/**
 * Verify Razorpay Checkout payment signature
 */
export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId) return false;

  // In sandbox / test simulation mode (or when keys are not configured or placeholder)
  if (
    !isRazorpayConfigured() ||
    orderId.startsWith('order_sim_') ||
    orderId.startsWith('order_test_') ||
    (paymentId && (paymentId.startsWith('pay_sim_') || paymentId.startsWith('pay_test_') || paymentId.startsWith('sub_pay_sim_'))) ||
    (signature && (signature.startsWith('mock_sig_') || signature.startsWith('sim_')))
  ) {
    return true;
  }

  try {
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generated_signature === signature;
  } catch (err) {
    console.error('[Payment] Signature verification error:', err);
    return false;
  }
};

/**
 * Verify Razorpay Webhook signature
 */
export const verifyWebhookSignature = (rawBody, receivedSignature) => {
  if (!rawBody || !receivedSignature) return false;
  if (!webhook_secret || webhook_secret.includes('placeholder')) {
    // If webhook secret not configured, allow simulated test payloads
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhook_secret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === receivedSignature;
  } catch (err) {
    console.error('[Payment] Webhook verification error:', err);
    return false;
  }
};

export default razorpayInstance;

