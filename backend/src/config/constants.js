/**
 * System Constants and Enums for EV Hub
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  USER: 'USER',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
};

export const OWNER_VERIFICATION = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

export const STATION_APPROVAL = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

export const BOOKING_STATUS = {
  AVAILABLE: 'AVAILABLE',
  TEMPORARILY_HELD: 'TEMPORARILY_HELD',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  HOLD_EXPIRED: 'HOLD_EXPIRED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
  NO_SHOW: 'NO_SHOW',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const SUBSCRIPTION_STATUS = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  HALTED: 'HALTED',
  CANCELLED: 'CANCELLED',
};

export const SETTLEMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SETTLED: 'SETTLED',
  FAILED: 'FAILED',
};

export const CONNECTOR_TYPES = [
  'Type 2 AC',
  'CCS 2 DC',
  'CHAdeMO DC',
  'GB/T DC',
  '15A 3-Pin Socket',
  'Bharat AC001',
  'Bharat DC001',
];

export const CHARGER_TYPES = ['AC', 'DC'];

export const VEHICLE_TYPES = ['2-Wheeler', '3-Wheeler', '4-Wheeler'];

export const DEFAULT_PLATFORM_COMMISSION_PERCENTAGE = 10; // 10%
export const BOOKING_HOLD_DURATION_MINUTES = 5; // 5-minute concurrency hold

export const DEFAULT_PLANS = [
  {
    name: 'Basic Host',
    code: 'BASIC',
    price: 199,
    billingInterval: 'monthly',
    stationLimit: 1,
    features: [
      '1 Charging Point Listing',
      'Basic Booking Management',
      'Standard Availability Calendar',
      'Direct User Directions after Booking',
      'Community Support',
    ],
    isActive: true,
  },
  {
    name: 'Pro Host',
    code: 'PRO',
    price: 399,
    billingInterval: 'monthly',
    stationLimit: 3,
    features: [
      'Up to 3 Charging Points',
      'Advanced Booking Analytics',
      'Dynamic Hourly Pricing',
      'Priority Search Placement',
      'Faster 24-hr Settlements',
      'Dedicated Email Support',
    ],
    isActive: true,
  },
  {
    name: 'Business Network',
    code: 'BUSINESS',
    price: 799,
    billingInterval: 'monthly',
    stationLimit: 10,
    features: [
      'Unlimited Charging Points',
      'Multi-connector Load Management',
      'Real-time Utilization Heatmaps',
      'Automated Payout Engine',
      'Instant Emergency Blockout',
      '24/7 Dedicated Account Manager',
    ],
    isActive: true,
  },
];

