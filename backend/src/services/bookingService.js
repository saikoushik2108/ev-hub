import Booking from '../models/Booking.js';
import ChargingStation from '../models/ChargingStation.js';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import OwnerProfile from '../models/OwnerProfile.js';
import User from '../models/User.js';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SETTLEMENT_STATUS,
  DEFAULT_PLATFORM_COMMISSION_PERCENTAGE,
  BOOKING_HOLD_DURATION_MINUTES,
  STATION_APPROVAL,
  SUBSCRIPTION_STATUS,
} from '../config/constants.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';
import { generateBookingQRCode } from './qrService.js';
import { createNotification } from './notificationService.js';
import { emitToStation, emitToOwner, broadcastGlobal } from '../config/socket.js';

/**
 * Check if a time interval falls within a station's operating hours
 */
export const isWithinOperatingHours = (station, startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = daysOfWeek[start.getDay()];

  if (
    station.operatingHours?.days &&
    station.operatingHours.days.length > 0 &&
    !station.operatingHours.days.includes(dayName)
  ) {
    return false;
  }

  const [openHour, openMin] = (station.operatingHours?.open || '06:00')
    .split(':')
    .map(Number);
  const [closeHour, closeMin] = (station.operatingHours?.close || '23:00')
    .split(':')
    .map(Number);

  const startTotalMinutes = start.getHours() * 60 + start.getMinutes();
  const endTotalMinutes = end.getHours() * 60 + end.getMinutes();
  const openTotalMinutes = openHour * 60 + openMin;
  const closeTotalMinutes = closeHour * 60 + closeMin;

  return startTotalMinutes >= openTotalMinutes && endTotalMinutes <= closeTotalMinutes;
};

/**
 * Check count of active overlapping bookings for a station during [startTime, endTime]
 */
export const countOverlappingBookings = async (stationId, startTime, endTime, excludeBookingId = null) => {
  const now = new Date();
  const query = {
    stationId,
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
    $or: [
      { bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] } },
      {
        bookingStatus: { $in: [BOOKING_STATUS.TEMPORARILY_HELD, BOOKING_STATUS.PAYMENT_PENDING] },
        holdExpiresAt: { $gt: now },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const count = await Booking.countDocuments(query);
  return count;
};

/**
 * Creates a Temporary Booking Hold (5-minute concurrency hold) and initializes payment order
 */
export const createBookingHold = async ({
  userId,
  stationId,
  startTime,
  endTime,
  couponCode = '',
}) => {
  const station = await ChargingStation.findById(stationId);
  if (!station) {
    throw new Error('Charging station not found.');
  }

  // 1. Station eligibility checks
  if (
    !station.isActive ||
    station.approvalStatus !== STATION_APPROVAL.APPROVED ||
    !station.isPubliclyListed
  ) {
    throw new Error('This charging station is currently unavailable for booking.');
  }

  // 2. Owner cannot book their own station
  if (station.ownerId.toString() === userId.toString()) {
    throw new Error('Hosts cannot book their own charging stations.');
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // 3. Past slot check
  if (start <= now) {
    throw new Error('Cannot book time slots in the past.');
  }

  if (end <= start) {
    throw new Error('End time must be after start time.');
  }

  // 4. Operating hours check
  if (!isWithinOperatingHours(station, start, end)) {
    throw new Error(
      `Selected time is outside operating hours (${station.operatingHours.open} - ${station.operatingHours.close}).`
    );
  }

  // 5. Concurrency & Overlap Check
  const maxCapacity = station.maximumCapacity || 1;
  const currentOverlaps = await countOverlappingBookings(stationId, start, end);

  if (currentOverlaps >= maxCapacity) {
    throw new Error(
      'This time slot was just selected by another driver or is at full capacity. Please select an alternate slot.'
    );
  }

  // 6. Pricing calculation
  const durationHours = (end - start) / (1000 * 60 * 60);
  const durationMinutes = Math.round((end - start) / (1000 * 60));

  let baseAmount = 0;
  if (station.priceUnit === 'hour') {
    baseAmount = Math.round(station.price * durationHours);
  } else {
    // kWh estimate based on charging capacity kW * duration hours * 0.85 typical power factor
    const estimatedKWh = Math.round(station.chargingCapacity * durationHours * 0.85 * 10) / 10;
    baseAmount = Math.max(50, Math.round(station.price * estimatedKWh));
  }

  // Taxes (5% GST for EV charging)
  const taxAmount = Math.round(baseAmount * 0.05);

  // Discounts
  let discountAmount = 0;
  if (couponCode && couponCode.toUpperCase() === 'EVFIRST') {
    discountAmount = Math.min(50, Math.round(baseAmount * 0.2));
  } else if (couponCode && couponCode.toUpperCase() === 'GREEN10') {
    discountAmount = Math.round(baseAmount * 0.1);
  }

  const totalAmount = Math.max(10, baseAmount + taxAmount - discountAmount);

  // Commission distribution (10% platform commission on base amount)
  const platformFee = Math.round(baseAmount * (DEFAULT_PLATFORM_COMMISSION_PERCENTAGE / 100));
  const ownerEarning = baseAmount - platformFee;

  // 7. Temporary Hold Expiration (5 minutes)
  const holdExpiresAt = new Date(Date.now() + BOOKING_HOLD_DURATION_MINUTES * 60 * 1000);

  // 8. Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 9. Atomically create the hold record
  const booking = await Booking.create({
    userId,
    ownerId: station.ownerId,
    stationId,
    startTime: start,
    endTime: end,
    durationMinutes,
    bookingStatus: BOOKING_STATUS.TEMPORARILY_HELD,
    holdExpiresAt,
    totalAmount,
    baseAmount,
    taxAmount,
    discountAmount,
    couponCode: couponCode ? couponCode.toUpperCase() : '',
    platformFee,
    ownerEarning,
    paymentStatus: PAYMENT_STATUS.PENDING,
    verificationCode,
  });

  // 10. Generate Razorpay Order
  const order = await createRazorpayOrder({
    amount: totalAmount,
    currency: 'INR',
    receipt: `bkg_${booking._id.toString().slice(-8)}`,
    notes: {
      bookingId: booking._id.toString(),
      stationId: stationId.toString(),
      userId: userId.toString(),
      stationName: station.name,
    },
  });

  booking.gatewayOrderId = order.orderId;
  await booking.save();

  // 11. Broadcast slot held to update real-time availability on maps and other clients
  broadcastGlobal('stationAvailabilityUpdated', {
    stationId,
    event: 'SLOT_HELD',
    bookingId: booking._id,
  });

  return {
    booking,
    orderId: order.orderId,
    amount: totalAmount,
    currency: 'INR',
    holdExpiresAt,
    isSandbox: order.isSandbox,
  };
};

/**
 * Confirm Booking Payment: Verifies Razorpay signature, confirms booking, generates QR code,
 * writes payment & transaction accounting entries, and alerts host & driver.
 */
export const confirmBookingPayment = async ({
  bookingId,
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  userId,
}) => {
  const booking = await Booking.findById(bookingId).populate('stationId');
  if (!booking) {
    throw new Error('Booking record not found.');
  }

  if (booking.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized booking confirmation attempt.');
  }

  if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
    return { booking, alreadyConfirmed: true };
  }

  // Verify that the hold hasn't expired
  const now = new Date();
  if (
    booking.bookingStatus === BOOKING_STATUS.HOLD_EXPIRED ||
    (booking.holdExpiresAt && booking.holdExpiresAt < now && booking.bookingStatus !== BOOKING_STATUS.CONFIRMED)
  ) {
    booking.bookingStatus = BOOKING_STATUS.HOLD_EXPIRED;
    await booking.save();
    throw new Error('Your 5-minute booking hold has expired. Please select the time slot again.');
  }

  // Verify payment signature
  const isValidSignature = verifyRazorpaySignature({
    orderId: gatewayOrderId || booking.gatewayOrderId,
    paymentId: gatewayPaymentId,
    signature: gatewaySignature,
  });

  if (!isValidSignature) {
    booking.bookingStatus = BOOKING_STATUS.PAYMENT_FAILED;
    booking.paymentStatus = PAYMENT_STATUS.FAILED;
    await booking.save();
    throw new Error('Payment signature verification failed. Booking was not confirmed.');
  }

  // Generate Booking QR Code
  const qrCodeData = await generateBookingQRCode({
    bookingId: booking._id.toString(),
    verificationCode: booking.verificationCode,
    userId: booking.userId.toString(),
  });

  // Update Booking to CONFIRMED
  booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
  booking.gatewayOrderId = gatewayOrderId || booking.gatewayOrderId;
  booking.gatewayPaymentId = gatewayPaymentId;
  booking.qrCode = qrCodeData;
  booking.holdExpiresAt = null;
  await booking.save();

  // Create Payment record
  await Payment.create({
    bookingId: booking._id,
    userId: booking.userId,
    ownerId: booking.ownerId,
    amount: booking.totalAmount,
    currency: 'INR',
    gatewayOrderId: booking.gatewayOrderId,
    gatewayPaymentId: gatewayPaymentId,
    gatewaySignature: gatewaySignature || 'SIMULATED_SIG',
    signatureVerificationStatus: true,
    paymentStatus: PAYMENT_STATUS.SUCCESS,
  });

  // Create Transaction & Ledger entry
  await Transaction.create({
    bookingId: booking._id,
    ownerId: booking.ownerId,
    userId: booking.userId,
    type: 'BOOKING_REVENUE',
    grossAmount: booking.totalAmount,
    platformCommission: booking.platformFee,
    gatewayFee: Math.round(booking.totalAmount * 0.02), // 2% gateway fee estimate
    ownerNetAmount: booking.ownerEarning,
    settlementStatus: SETTLEMENT_STATUS.PENDING,
    notes: `Booking for ${booking.stationId?.name || 'EV Station'}`,
  });

  // Update Owner Profile totals
  await OwnerProfile.findOneAndUpdate(
    { userId: booking.ownerId },
    {
      $inc: {
        totalEarnings: booking.ownerEarning,
        pendingSettlement: booking.ownerEarning,
      },
    }
  );

  // Update Station total bookings count
  await ChargingStation.findByIdAndUpdate(booking.stationId._id, {
    $inc: { totalBookingsCount: 1 },
  });

  // Create Notifications
  const stationName = booking.stationId?.name || 'Charging Station';
  const slotTimeFormatted = `${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // 1. To User
  await createNotification({
    userId: booking.userId,
    title: 'Booking Confirmed! ⚡',
    message: `Your slot at ${stationName} on ${new Date(booking.startTime).toLocaleDateString()} (${slotTimeFormatted}) is confirmed! Full address unlocked.`,
    type: 'BOOKING',
    link: `/user/bookings`,
  });

  // 2. To Host / Owner
  await createNotification({
    userId: booking.ownerId,
    title: 'New Paid Booking Received! 🚗',
    message: `A driver booked ${stationName} for ${new Date(booking.startTime).toLocaleDateString()} at ${slotTimeFormatted}. Earning: ₹${booking.ownerEarning}.`,
    type: 'BOOKING',
    link: `/owner/bookings`,
    isOwner: true,
  });

  // Real-time Socket.IO alerts
  emitToStation(booking.stationId._id.toString(), 'bookingConfirmed', {
    bookingId: booking._id,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  emitToOwner(booking.ownerId.toString(), 'bookingCreated', {
    bookingId: booking._id,
    amount: booking.ownerEarning,
    stationName,
  });

  broadcastGlobal('stationAvailabilityUpdated', {
    stationId: booking.stationId._id,
    event: 'BOOKING_CONFIRMED',
  });

  return { booking, alreadyConfirmed: false };
};

/**
 * Background Concurrency Cleanup Job:
 * Automatically releases slots whose 5-minute hold expired without confirmed payment
 */
export const releaseExpiredHolds = async () => {
  try {
    const now = new Date();
    const expiredHolds = await Booking.find({
      bookingStatus: BOOKING_STATUS.TEMPORARILY_HELD,
      holdExpiresAt: { $lte: now },
    });

    if (expiredHolds.length > 0) {
      console.log(`[Concurrency Engine] Releasing ${expiredHolds.length} expired booking hold(s)...`);

      for (const booking of expiredHolds) {
        booking.bookingStatus = BOOKING_STATUS.HOLD_EXPIRED;
        await booking.save();

        broadcastGlobal('stationAvailabilityUpdated', {
          stationId: booking.stationId,
          event: 'HOLD_EXPIRED',
          bookingId: booking._id,
        });
      }
    }
  } catch (err) {
    console.error('[Concurrency Engine] Error releasing expired holds:', err);
  }
};

/**
 * Generate bookable daily slots for a station on a given date string ('YYYY-MM-DD')
 */
export const getAvailableSlotsForDate = async (stationId, dateString) => {
  const station = await ChargingStation.findById(stationId);
  if (!station) return [];

  const targetDate = new Date(`${dateString}T00:00:00`);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = daysOfWeek[targetDate.getDay()];

  // Check if station operates on this day
  if (
    station.operatingHours?.days &&
    station.operatingHours.days.length > 0 &&
    !station.operatingHours.days.includes(dayName)
  ) {
    return [];
  }

  // Check if date is explicitly blocked by host
  if (station.availabilitySettings?.blockedDates?.includes(dateString)) {
    return [];
  }

  const [openHour, openMin] = (station.operatingHours?.open || '06:00')
    .split(':')
    .map(Number);
  const [closeHour, closeMin] = (station.operatingHours?.close || '23:00')
    .split(':')
    .map(Number);

  const slotDurationMinutes = station.availabilitySettings?.slotDurationMinutes || 60;
  const bufferMinutes = station.availabilitySettings?.bufferTimeMinutes || 0;
  const maxCapacity = station.maximumCapacity || 1;

  // Day boundaries
  const dayStart = new Date(targetDate);
  dayStart.setHours(openHour, openMin, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setHours(closeHour, closeMin, 0, 0);

  // Fetch all active bookings and active holds for this day
  const now = new Date();
  const dayBookings = await Booking.find({
    stationId,
    startTime: { $lt: dayEnd },
    endTime: { $gt: dayStart },
    $or: [
      { bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] } },
      {
        bookingStatus: { $in: [BOOKING_STATUS.TEMPORARILY_HELD, BOOKING_STATUS.PAYMENT_PENDING] },
        holdExpiresAt: { $gt: now },
      },
    ],
  });

  const slots = [];
  let currentSlotStart = new Date(dayStart);

  while (currentSlotStart < dayEnd) {
    const currentSlotEnd = new Date(
      currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000
    );

    if (currentSlotEnd > dayEnd) break;

    // Is slot in the past?
    const isPast = currentSlotStart <= now;

    // Check overlaps
    const overlapCount = dayBookings.filter((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart < currentSlotEnd && bEnd > currentSlotStart;
    }).length;

    const availableCapacity = Math.max(0, maxCapacity - overlapCount);
    const isAvailable = !isPast && availableCapacity > 0;

    slots.push({
      startTime: currentSlotStart.toISOString(),
      endTime: currentSlotEnd.toISOString(),
      label: `${currentSlotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${currentSlotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isAvailable,
      availableCapacity,
      maxCapacity,
      isPast,
    });

    // Advance by slot duration + buffer
    currentSlotStart = new Date(
      currentSlotEnd.getTime() + bufferMinutes * 60 * 1000
    );
  }

  return slots;
};

