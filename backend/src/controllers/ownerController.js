import ChargingStation from '../models/ChargingStation.js';
import Booking from '../models/Booking.js';
import OwnerProfile from '../models/OwnerProfile.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';
import {
  STATION_APPROVAL,
  SUBSCRIPTION_STATUS,
  BOOKING_STATUS,
  OWNER_VERIFICATION,
} from '../config/constants.js';
import {
  createSubscriptionCheckout,
  verifyAndActivateSubscription,
  syncStationListingStatus,
} from '../services/subscriptionService.js';
import { processUploadedFile } from '../config/cloudinary.js';

/**
 * Owner Dashboard Overview Metrics
 */
export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [
      stations,
      ownerProfile,
      recentBookings,
      totalCompletedBookings,
      upcomingBookingsCount,
      allTransactions,
    ] = await Promise.all([
      ChargingStation.find({ ownerId }),
      OwnerProfile.findOne({ userId: ownerId }).populate('activeSubscriptionId'),
      Booking.find({ ownerId })
        .populate('stationId', 'name connectorType chargingCapacity')
        .populate('userId', 'name phone email')
        .sort({ startTime: -1 })
        .limit(10),
      Booking.countDocuments({ ownerId, bookingStatus: BOOKING_STATUS.COMPLETED }),
      Booking.countDocuments({
        ownerId,
        bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] },
        startTime: { $gte: new Date() },
      }),
      Transaction.find({ ownerId }),
    ]);

    const totalStations = stations.length;
    const activeStations = stations.filter(
      (st) => st.isActive && st.approvalStatus === STATION_APPROVAL.APPROVED
    ).length;

    // Monthly revenue calculation
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyBookings = await Booking.find({
      ownerId,
      bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
      createdAt: { $gte: firstDayOfMonth },
    });

    const monthlyEarnings = monthlyBookings.reduce(
      (sum, b) => sum + (b.ownerEarning || 0),
      0
    );

    // Station utilization estimate (hours booked this month / total available operating hours)
    const totalBookedHoursThisMonth = monthlyBookings.reduce(
      (sum, b) => sum + (b.durationMinutes || 60) / 60,
      0
    );
    const totalPotentialHours = Math.max(1, totalStations * 30 * 14); // 14 hours avg per day
    const stationUtilization = Math.min(
      100,
      Math.round((totalBookedHoursThisMonth / totalPotentialHours) * 100)
    );

    res.status(200).json({
      success: true,
      data: {
        totalStations,
        activeStations,
        upcomingBookingsCount,
        completedBookingsCount: totalCompletedBookings,
        monthlyEarnings,
        totalEarnings: ownerProfile?.totalEarnings || 0,
        pendingSettlement: ownerProfile?.pendingSettlement || 0,
        settledAmount: ownerProfile?.settledAmount || 0,
        stationUtilization,
        verificationStatus: ownerProfile?.verificationStatus || OWNER_VERIFICATION.PENDING,
        subscriptionStatus: ownerProfile?.subscriptionStatus || SUBSCRIPTION_STATUS.INACTIVE,
        subscription: ownerProfile?.activeSubscriptionId || null,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register New Charging Station
 * Enforces subscription limit (e.g. Basic: 1, Pro: 3, Business: 10)
 */
export const registerStation = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Check owner subscription & station limit
    const ownerProfile = await OwnerProfile.findOne({ userId: ownerId }).populate(
      'activeSubscriptionId'
    );
    const currentStationsCount = await ChargingStation.countDocuments({ ownerId });

    let allowedLimit = 1; // Default basic limit
    if (ownerProfile?.activeSubscriptionId?.planId) {
      const plan = await SubscriptionPlan.findById(ownerProfile.activeSubscriptionId.planId);
      if (plan) {
        allowedLimit = plan.stationLimit;
      }
    }

    if (currentStationsCount >= allowedLimit) {
      return res.status(403).json({
        success: false,
        message: `Your current subscription plan allows a maximum of ${allowedLimit} charging station(s). Please upgrade your subscription to add more points.`,
      });
    }

    const {
      name,
      description,
      address,
      latitude,
      longitude,
      chargerBrand,
      chargerModel,
      chargerType,
      connectorType,
      chargingCapacity,
      price,
      priceUnit,
      operatingHours,
      availabilitySettings,
      maximumCapacity,
      supportedVehicles,
      amenities,
      safetyDetails,
    } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90..90) and longitude (-180..180) are required.',
      });
    }

    // Process uploaded photos if any
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await processUploadedFile(file);
        if (url) photoUrls.push(url);
      }
    } else if (req.body.photos) {
      photoUrls = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
    }

    // Default premium EV charging photo if none provided
    if (photoUrls.length === 0) {
      photoUrls = [
        'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1200&q=80',
      ];
    }

    const station = await ChargingStation.create({
      ownerId,
      name,
      description: description || '',
      address: typeof address === 'string' ? JSON.parse(address) : address,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      chargerBrand: chargerBrand || 'Universal',
      chargerModel: chargerModel || '',
      chargerType: chargerType || 'AC',
      connectorType,
      chargingCapacity: Number(chargingCapacity),
      price: Number(price),
      priceUnit: priceUnit || 'kWh',
      operatingHours:
        typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours,
      availabilitySettings:
        typeof availabilitySettings === 'string'
          ? JSON.parse(availabilitySettings)
          : availabilitySettings,
      maximumCapacity: Number(maximumCapacity) || 1,
      supportedVehicles: supportedVehicles || ['4-Wheeler'],
      amenities: amenities || ['Covered Parking', 'CCTV Surveillance'],
      safetyDetails: safetyDetails || '',
      photos: photoUrls,
      approvalStatus: STATION_APPROVAL.PENDING,
      isActive: true,
      isPubliclyListed: false, // Requires admin approval & active subscription
    });

    res.status(201).json({
      success: true,
      message: 'Charging station registered successfully! It is now pending admin verification.',
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Owner's Stations
 */
export const getOwnerStations = async (req, res, next) => {
  try {
    const stations = await ChargingStation.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Station (Price, Operating Hours, Status)
 */
export const updateStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!station) {
      return res.status(404).json({ success: false, message: 'Charging station not found.' });
    }

    const updateFields = [
      'name',
      'description',
      'price',
      'priceUnit',
      'chargingCapacity',
      'chargerType',
      'connectorType',
      'operatingHours',
      'availabilitySettings',
      'isActive',
      'amenities',
      'safetyDetails',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        station[field] = req.body[field];
      }
    });

    if (req.body.address) {
      station.address = req.body.address;
    }

    if (req.body.latitude && req.body.longitude) {
      station.location.coordinates = [
        parseFloat(req.body.longitude),
        parseFloat(req.body.latitude),
      ];
    }

    await station.save();

    // Re-sync visibility flag
    await syncStationListingStatus(station._id);

    res.status(200).json({
      success: true,
      message: 'Station updated successfully.',
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Station
 */
export const deleteStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!station) {
      return res.status(404).json({ success: false, message: 'Charging station not found.' });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({
      stationId: station._id,
      bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] },
      startTime: { $gte: new Date() },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete station. It has ${activeBookings} upcoming confirmed booking(s). Please fulfill or cancel them first.`,
      });
    }

    await ChargingStation.findByIdAndDelete(station._id);

    res.status(200).json({
      success: true,
      message: 'Charging station removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Owner Bookings
 */
export const getOwnerBookings = async (req, res, next) => {
  try {
    const { status, stationId, page = 1, limit = 20 } = req.query;
    const query = { ownerId: req.user._id };

    if (status) {
      query.bookingStatus = status;
    }
    if (stationId) {
      query.stationId = stationId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('stationId', 'name address location chargerType connectorType')
      .populate('userId', 'name phone email vehicleDetails')
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
 * Get Owner Earnings Breakdown & Chart Analytics
 */
export const getOwnerEarnings = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [profile, transactions, bookings] = await Promise.all([
      OwnerProfile.findOne({ userId: ownerId }),
      Transaction.find({ ownerId }).sort({ createdAt: -1 }),
      Booking.find({
        ownerId,
        bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
      }).sort({ createdAt: 1 }),
    ]);

    // Aggregate monthly revenue trends for Recharts
    const monthlyDataMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    bookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: key, revenue: 0, bookings: 0 };
      }
      monthlyDataMap[key].revenue += b.ownerEarning || 0;
      monthlyDataMap[key].bookings += 1;
    });

    const monthlyTrends = Object.values(monthlyDataMap);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: profile?.totalEarnings || 0,
        pendingSettlement: profile?.pendingSettlement || 0,
        settledAmount: profile?.settledAmount || 0,
        payoutDetails: profile?.payoutDetailsReference || {},
        monthlyTrends,
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Subscription Status for Owner
 */
export const getOwnerSubscription = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const [profile, plans, currentSub] = await Promise.all([
      OwnerProfile.findOne({ userId: ownerId }),
      SubscriptionPlan.find({ isActive: true }),
      Subscription.findOne({ ownerId }).sort({ createdAt: -1 }).populate('planId'),
    ]);

    res.status(200).json({
      success: true,
      subscriptionStatus: profile?.subscriptionStatus || SUBSCRIPTION_STATUS.INACTIVE,
      currentSubscription: currentSub,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate Subscription Checkout
 */
export const checkoutSubscription = async (req, res, next) => {
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

/**
 * Verify Subscription Payment & Activate
 */
export const verifySubscription = async (req, res, next) => {
  try {
    const { planId, orderId, paymentId, signature } = req.body;

    if (!planId || !orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'planId, orderId, and paymentId are required.',
      });
    }

    const subscription = await verifyAndActivateSubscription({
      ownerId: req.user._id,
      planId,
      orderId,
      paymentId,
      signature,
    });

    res.status(200).json({
      success: true,
      message: 'Host subscription activated successfully! Your stations are now publicly listed.',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to Review
 */
export const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(id).populate('stationId');
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.stationId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to reply to this review.' });
    }

    review.ownerReply = {
      comment: reply,
      repliedAt: new Date(),
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response posted successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

