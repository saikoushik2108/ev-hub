import Booking from '../models/Booking.js';
import ChargingStation from '../models/ChargingStation.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { BOOKING_STATUS, STATION_APPROVAL } from '../config/constants.js';

/**
 * User Dashboard Overview
 */
export const getUserOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [upcomingBookings, pastBookingsCount, userWithFavs] = await Promise.all([
      Booking.find({
        userId,
        bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] },
        endTime: { $gte: new Date() },
      })
        .populate('stationId', 'name address photos chargingCapacity connectorType chargerType')
        .populate('ownerId', 'name phone')
        .sort({ startTime: 1 })
        .limit(3),
      Booking.countDocuments({
        userId,
        bookingStatus: BOOKING_STATUS.COMPLETED,
      }),
      User.findById(userId).populate({
        path: 'favorites',
        match: { isPubliclyListed: true, approvalStatus: STATION_APPROVAL.APPROVED },
      }),
    ]);

    // Calculate approximate carbon emissions saved:
    // Assumption: ~0.82 kg CO2 saved per kWh compared to internal combustion engines (Indian grid vs standard petrol car)
    const completedBookings = await Booking.find({
      userId,
      bookingStatus: BOOKING_STATUS.COMPLETED,
    });
    const totalKWhEstimated = completedBookings.reduce(
      (sum, b) => sum + (b.durationMinutes / 60) * 15,
      0
    );
    const co2SavedKg = Math.round(totalKWhEstimated * 0.82 * 10) / 10;

    res.status(200).json({
      success: true,
      data: {
        upcomingBookings,
        totalBookings: pastBookingsCount + upcomingBookings.length,
        favoritesCount: userWithFavs?.favorites?.length || 0,
        favorites: userWithFavs?.favorites || [],
        co2SavedKg,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Favorites
 */
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      match: { isPubliclyListed: true, approvalStatus: STATION_APPROVAL.APPROVED },
      populate: { path: 'ownerId', select: 'name rating' },
    });

    res.status(200).json({
      success: true,
      data: user.favorites || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Station to Favorites
 */
export const addFavorite = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.favorites.includes(stationId)) {
      user.favorites.push(stationId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Station added to your favorites.',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Station from Favorites
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter((id) => id.toString() !== stationId.toString());
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Station removed from your favorites.',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Support Ticket / Complaint
 */
export const submitComplaint = async (req, res, next) => {
  try {
    const { bookingId, stationId, subject, description, category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required.',
      });
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      bookingId: bookingId || undefined,
      stationId: stationId || undefined,
      subject,
      description,
      category: category || 'EQUIPMENT_FAULT',
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will review it shortly.',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Complaints
 */
export const getUserComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id })
      .populate('bookingId')
      .populate('stationId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

