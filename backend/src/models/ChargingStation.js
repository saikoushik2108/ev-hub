import mongoose from 'mongoose';
import {
  STATION_APPROVAL,
  CONNECTOR_TYPES,
  CHARGER_TYPES,
  VEHICLE_TYPES,
} from '../config/constants.js';

const chargingStationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      full: { type: String, required: true },
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, default: 'Hyderabad' },
      state: { type: String, default: 'Telangana' },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      // Masked address shown to public before booking confirmation
      masked: { type: String, default: '' },
    },
    // GeoJSON Point for geospatial queries: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (coords) =>
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Invalid coordinates. Must be [longitude (-180..180), latitude (-90..90)].',
        },
      },
    },
    chargerBrand: {
      type: String,
      default: 'Universal',
    },
    chargerModel: {
      type: String,
      default: '',
    },
    chargerType: {
      type: String,
      enum: CHARGER_TYPES,
      default: 'AC',
      index: true,
    },
    connectorType: {
      type: String,
      enum: CONNECTOR_TYPES,
      required: true,
      index: true,
    },
    chargingCapacity: {
      type: Number,
      required: [true, 'Charging capacity (kW) is required'],
      min: 1,
      max: 350,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
      index: true,
    },
    priceUnit: {
      type: String,
      enum: ['kWh', 'hour'],
      default: 'kWh',
    },
    operatingHours: {
      open: { type: String, default: '06:00' }, // HH:mm format
      close: { type: String, default: '23:00' },
      days: {
        type: [String],
        default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    },
    availabilitySettings: {
      slotDurationMinutes: { type: Number, default: 60 },
      bufferTimeMinutes: { type: Number, default: 15 },
      advanceBookingDays: { type: Number, default: 7 },
      blockedDates: [{ type: String }], // 'YYYY-MM-DD'
    },
    maximumCapacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    supportedVehicles: {
      type: [String],
      enum: VEHICLE_TYPES,
      default: ['4-Wheeler'],
    },
    amenities: {
      type: [String],
      default: ['Covered Parking', 'CCTV Surveillance', 'Waiting Area'],
    },
    photos: {
      type: [String],
      default: [],
    },
    safetyDetails: {
      type: String,
      default: 'Equipped with Type B RCBO, dedicated earthing pit, and surge protector.',
    },
    approvalStatus: {
      type: String,
      enum: Object.values(STATION_APPROVAL),
      default: STATION_APPROVAL.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Controlled by the mandatory Owner Subscription Visibility Rule:
    // Requires: approved station + active status + verified owner + active owner subscription
    isPubliclyListed: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for high-speed spatial distance & radius queries
chargingStationSchema.index({ location: '2dsphere' });
// Compound indexes for public map & search discovery
chargingStationSchema.index({
  isPubliclyListed: 1,
  approvalStatus: 1,
  isActive: 1,
  price: 1,
  connectorType: 1,
});

// Helper to mask residential address prior to booking confirmation
chargingStationSchema.pre('save', function (next) {
  if (this.address?.area && this.address?.city) {
    this.address.masked = `${this.address.area}, ${this.address.city} (Exact address unlocked upon confirmation)`;
  } else if (this.address?.city) {
    this.address.masked = `${this.address.city} (Exact address unlocked upon confirmation)`;
  } else {
    this.address.masked = 'Location details revealed upon booking confirmation';
  }
  next();
});

const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);
export default ChargingStation;

