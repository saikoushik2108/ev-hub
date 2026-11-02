import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ChargingStation from '../models/ChargingStation.js';
import OwnerProfile from '../models/OwnerProfile.js';
import { BOOKING_STATUS } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'bookingId, rating (1-5), and comment are required.',
      });
    }

    const booking = await Booking.findById(bookingId).populate('stationId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to review this booking.' });
    }

    if (booking.bookingStatus !== BOOKING_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Only completed charging sessions can be reviewed.',
      });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this charging session.',
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      stationId: booking.stationId._id,
      bookingId,
      rating: Number(rating),
      comment,
    });

    booking.isReviewed = true;
    await booking.save();

    // Recalculate station average rating
    const stationReviews = await Review.find({ stationId: booking.stationId._id });
    const avgRating =
      stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length;

    await ChargingStation.findByIdAndUpdate(booking.stationId._id, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: stationReviews.length,
    });

    // Notify Host
    await createNotification({
      userId: booking.ownerId,
      title: 'New Rating & Review Received! ⭐',
      message: `A driver gave your charging point ${rating} stars: "${comment.slice(0, 80)}..."`,
      type: 'REVIEW',
      link: '/owner/reviews',
      isOwner: true,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for helping the community.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getStationReviews = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const reviews = await Review.find({ stationId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

