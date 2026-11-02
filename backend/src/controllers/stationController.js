import ChargingStation from '../models/ChargingStation.js';
import User from '../models/User.js';
import OwnerProfile from '../models/OwnerProfile.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import {
  STATION_APPROVAL,
  SUBSCRIPTION_STATUS,
  BOOKING_STATUS,
  ROLES,
} from '../config/constants.js';
import { calculateDistanceKm } from '../utils/geoUtils.js';
import { getAvailableSlotsForDate } from '../services/bookingService.js';
import { processUploadedFile } from '../config/cloudinary.js';

/**
 * Public Search & Filter Stations
 * Strictly enforces backend visibility rules:
 * isPubliclyListed: true, approvalStatus: 'APPROVED', isActive: true
 */
export const getStations = async (req, res, next) => {
  try {
    const {
      q,
      connectorType,
      chargerType,
      minCapacity,
      maxPrice,
      minRating,
      city,
      date,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isPubliclyListed: true,
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'address.full': { $regex: q, $options: 'i' } },
        { 'address.area': { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
      ];
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (connectorType) {
      query.connectorType = connectorType;
    }

    if (chargerType) {
      query.chargerType = chargerType;
    }

    if (minCapacity) {
      query.chargingCapacity = { $gte: Number(minCapacity) };
    }

    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ChargingStation.countDocuments(query);
    const stations = await ChargingStation.find(query)
      .populate('ownerId', 'name rating profileImage')
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 });

    // Protect exact residential address for public discovery
    const sanitizedStations = stations.map((st) => {
      const obj = st.toObject();
      obj.address = {
        city: obj.address.city,
        area: obj.address.area,
        state: obj.address.state,
        masked: obj.address.masked || `${obj.address.area || ''}, ${obj.address.city} (Exact address revealed after booking)`,
      };
      return obj;
    });

    res.status(200).json({
      success: true,
      count: sanitizedStations.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: sanitizedStations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Geospatial Nearby Search using MongoDB 2dsphere index & $geoNear
 * Returns color-coded availability for selected date
 */
export const getNearbyStations = async (req, res, next) => {
  try {
    const {
      lng,
      lat,
      maxDistance = 15, // km
      date = new Date().toISOString().split('T')[0],
      connectorType,
      chargerType,
      minCapacity,
      maxPrice,
      minRating,
    } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Longitude (lng) and Latitude (lat) are required for nearby search.',
      });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const maxDistanceMeters =
      maxDistance === 'all' || isNaN(parseFloat(maxDistance))
        ? 150000 // 150 km wide search
        : parseFloat(maxDistance) * 1000;

    const matchConditions = {
      isPubliclyListed: true,
      approvalStatus: STATION_APPROVAL.APPROVED,
      isActive: true,
    };

    if (connectorType) matchConditions.connectorType = connectorType;
    if (chargerType) matchConditions.chargerType = chargerType;
    if (minCapacity) matchConditions.chargingCapacity = { $gte: Number(minCapacity) };
    if (maxPrice) matchConditions.price = { $lte: Number(maxPrice) };
    if (minRating) matchConditions.rating = { $gte: Number(minRating) };

    const stations = await ChargingStation.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchConditions,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          location: 1,
          distanceMeters: 1,
          chargerBrand: 1,
          chargerModel: 1,
          chargerType: 1,
          connectorType: 1,
          chargingCapacity: 1,
          price: 1,
          priceUnit: 1,
          operatingHours: 1,
          availabilitySettings: 1,
          maximumCapacity: 1,
          supportedVehicles: 1,
          amenities: 1,
          photos: 1,
          rating: 1,
          totalReviews: 1,
          'address.city': 1,
          'address.area': 1,
          'address.state': 1,
          'address.masked': 1,
          'owner._id': 1,
          'owner.name': 1,
          'owner.profileImage': 1,
        },
      },
    ]);

    // Compute availability status for the chosen date for each station:
    // GREEN: has available slots
    // YELLOW: limited slots (< 3 slots remaining)
    // RED: fully booked
    const enriched = await Promise.all(
      stations.map(async (st) => {
        const slots = await getAvailableSlotsForDate(st._id, date);
        const availableSlotsCount = slots.filter((s) => s.isAvailable).length;

        let statusColor = 'RED';
        if (availableSlotsCount > 2) {
          statusColor = 'GREEN';
        } else if (availableSlotsCount > 0) {
          statusColor = 'YELLOW';
        }

        const distanceKm = Math.round((st.distanceMeters / 1000) * 10) / 10;

        return {
          ...st,
          distanceKm,
          availabilityStatus: statusColor,
          availableSlotsCount,
          totalSlotsCount: slots.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      date,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Station By ID
 */
export const getStationById = async (req, res, next) => {
  try {
    const station = await ChargingStation.findById(req.params.id).populate(
      'ownerId',
      'name phone email profileImage createdAt'
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found.',
      });
    }

    // Check if the current user has a confirmed booking for this station or is host/admin
    let canViewFullAddress = false;
    if (req.user) {
      if (
        req.user.role === ROLES.ADMIN ||
        station.ownerId._id.toString() === req.user._id.toString()
      ) {
        canViewFullAddress = true;
      } else {
        const confirmedBooking = await Booking.findOne({
          userId: req.user._id,
          stationId: station._id,
          bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] },
        });
        if (confirmedBooking) {
          canViewFullAddress = true;
        }
      }
    }

    const stationObj = station.toObject();
    if (!canViewFullAddress) {
      stationObj.address = {
        city: stationObj.address.city,
        area: stationObj.address.area,
        state: stationObj.address.state,
        pincode: stationObj.address.pincode ? `${stationObj.address.pincode.slice(0, 3)}***` : '',
        masked: stationObj.address.masked || `${stationObj.address.area || ''}, ${stationObj.address.city} (Exact house address revealed after booking confirmation)`,
      };
      // Mask host direct phone until confirmed
      if (stationObj.ownerId) {
        delete stationObj.ownerId.phone;
        delete stationObj.ownerId.email;
      }
    }

    res.status(200).json({
      success: true,
      data: stationObj,
      unlockedFullAddress: canViewFullAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Available Slots for a Station on a Specific Date
 */
export const getStationAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const dateToQuery = date || new Date().toISOString().split('T')[0];
    const slots = await getAvailableSlotsForDate(id, dateToQuery);

    res.status(200).json({
      success: true,
      stationId: id,
      date: dateToQuery,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

