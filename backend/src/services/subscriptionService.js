import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import OwnerProfile from '../models/OwnerProfile.js';
import ChargingStation from '../models/ChargingStation.js';
import User from '../models/User.js';
import {
  SUBSCRIPTION_STATUS,
  OWNER_VERIFICATION,
  STATION_APPROVAL,
} from '../config/constants.js';
import { createNotification } from './notificationService.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import { broadcastGlobal } from '../config/socket.js';

/**
 * Reconciles and syncs a station's isPubliclyListed flag based on platform rules:
 * Rule: Station is publicly listed iff:
 *   1. Station approvalStatus === 'APPROVED'
 *   2. Station isActive === true
 *   3. Owner verificationStatus === 'VERIFIED'
 *   4. Owner subscriptionStatus === 'ACTIVE'
 */
export const syncStationListingStatus = async (stationId) => {
  const station = await ChargingStation.findById(stationId);
  if (!station) return false;

  const ownerProfile = await OwnerProfile.findOne({ userId: station.ownerId });
  const isEligible =
    station.approvalStatus === STATION_APPROVAL.APPROVED &&
    station.isActive === true &&
    ownerProfile &&
    ownerProfile.verificationStatus === OWNER_VERIFICATION.VERIFIED &&
    ownerProfile.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE;

  if (station.isPubliclyListed !== isEligible) {
    station.isPubliclyListed = isEligible;
    await station.save();
    broadcastGlobal('stationAvailabilityUpdated', {
      stationId: station._id,
      isPubliclyListed: isEligible,
    });
  }

  return isEligible;
};

/**
 * Syncs all stations for a given owner
 */
export const syncAllOwnerStations = async (ownerUserId) => {
  const stations = await ChargingStation.find({ ownerId: ownerUserId });
  const results = [];
  for (const station of stations) {
    const isListed = await syncStationListingStatus(station._id);
    results.push({ stationId: station._id, isListed });
  }
  return results;
};

/**
 * Background job: Checks all active subscriptions and expires any past their endDate
 */
export const reconcileExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    const expiredSubs = await Subscription.find({
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { $lte: now },
    });

    for (const sub of expiredSubs) {
      sub.status = SUBSCRIPTION_STATUS.EXPIRED;
      await sub.save();

      // Update owner profile status
      await OwnerProfile.findOneAndUpdate(
        { userId: sub.ownerId },
        { subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED }
      );

      // Hide all owner stations from public discovery
      await syncAllOwnerStations(sub.ownerId);

      // Send owner notification
      await createNotification({
        userId: sub.ownerId,
        title: 'Subscription Expired',
        message:
          'Your host subscription has expired. Your charging points are temporarily hidden from public discovery. Renew now to resume bookings.',
        type: 'SUBSCRIPTION',
        link: '/owner/subscriptions',
        isOwner: true,
      });

      console.log(`[Subscription Engine] Expired subscription ${sub._id} for owner ${sub.ownerId}. Stations unlisted.`);
    }
  } catch (err) {
    console.error('[Subscription Engine] Error reconciling expired subscriptions:', err);
  }
};

/**
 * Initiates subscription checkout
 */
export const createSubscriptionCheckout = async ({ ownerId, planId }) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    throw new Error('Selected subscription plan is not active or available.');
  }

  const order = await createRazorpayOrder({
    amount: plan.price,
    currency: 'INR',
    receipt: `sub_${ownerId.toString().slice(-6)}_${Date.now()}`,
    notes: {
      type: 'OWNER_SUBSCRIPTION',
      ownerId: ownerId.toString(),
      planId: planId.toString(),
      planCode: plan.code,
    },
  });

  return {
    orderId: order.orderId,
    amount: plan.price,
    currency: 'INR',
    plan,
    isSandbox: order.isSandbox,
  };
};

/**
 * Verifies subscription payment and activates owner subscription
 */
export const verifyAndActivateSubscription = async ({
  ownerId,
  planId,
  orderId,
  paymentId,
  signature,
}) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new Error('Subscription plan not found');

  const isValid = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!isValid) {
    throw new Error('Payment signature verification failed.');
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30); // 30-day monthly cycle

  // Create or update subscription record
  const subscription = await Subscription.create({
    ownerId,
    planId,
    razorpaySubscriptionId: orderId,
    razorpayPaymentId: paymentId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    startDate: now,
    endDate,
    nextBillingDate: endDate,
    amount: plan.price,
    invoices: [
      {
        invoiceId: `INV-${Date.now()}`,
        amount: plan.price,
        paidAt: now,
      },
    ],
  });

  // Update Owner Profile
  await OwnerProfile.findOneAndUpdate(
    { userId: ownerId },
    {
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      activeSubscriptionId: subscription._id,
    },
    { upsert: true }
  );

  // Sync owner stations - newly approved stations will now become publicly visible
  await syncAllOwnerStations(ownerId);

  // Notify owner
  await createNotification({
    userId: ownerId,
    title: 'Subscription Activated! ⚡',
    message: `Your ${plan.name} subscription is now active through ${endDate.toLocaleDateString()}. Your stations are live on the map!`,
    type: 'SUBSCRIPTION',
    link: '/owner/subscriptions',
    isOwner: true,
  });

  return subscription;
};

