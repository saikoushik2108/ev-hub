import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';
import OwnerProfile from '../models/OwnerProfile.js';
import {
  createSubscriptionCheckout,
  verifyAndActivateSubscription,
} from '../services/subscriptionService.js';
import { SUBSCRIPTION_STATUS } from '../config/constants.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required.' });
    }

    const checkoutData = await createSubscriptionCheckout({
      ownerId: req.user._id,
      planId,
    });

    res.status(200).json({
      success: true,
      data: checkoutData,
    });
  } catch (error) {
    next(error);
  }
};

export const verifySubscriptionPayment = async (req, res, next) => {
  try {
    const { planId, orderId, paymentId, signature } = req.body;

    const sub = await verifyAndActivateSubscription({
      ownerId: req.user._id,
      planId,
      orderId,
      paymentId,
      signature,
    });

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully!',
      data: sub,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const profile = await OwnerProfile.findOne({ userId: req.user._id });
    const currentSub = await Subscription.findOne({ ownerId: req.user._id })
      .populate('planId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      subscriptionStatus: profile?.subscriptionStatus || SUBSCRIPTION_STATUS.INACTIVE,
      currentSubscription: currentSub,
    });
  } catch (error) {
    next(error);
  }
};

