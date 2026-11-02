import User from '../models/User.js';
import OwnerProfile from '../models/OwnerProfile.js';
import ChargingStation from '../models/ChargingStation.js';
import Booking from '../models/Booking.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Transaction from '../models/Transaction.js';
import AuditLog from '../models/AuditLog.js';
import Complaint from '../models/Complaint.js';
import {
  ROLES,
  USER_STATUS,
  OWNER_VERIFICATION,
  STATION_APPROVAL,
  SUBSCRIPTION_STATUS,
  BOOKING_STATUS,
  SETTLEMENT_STATUS,
} from '../config/constants.js';
import { syncStationListingStatus, syncAllOwnerStations } from '../services/subscriptionService.js';
import { createNotification } from '../services/notificationService.js';

// Platform configuration stored in memory / settings with defaults
let platformSettings = {
  commissionPercentage: 10,
  taxPercentage: 5,
  holdDurationMinutes: 5,
  cancellationFreeHours: 2,
  platformName: 'EV Hub',
  supportEmail: 'support@evhub.com',
  maintenanceMode: false,
};

/**
 * Log Administrative Action
 */
const logAudit = async (adminId, action, targetType, targetId, details, ipAddress = '') => {
  try {
    await AuditLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
};

/**
 * Admin Dashboard Overview
 */
export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalStations,
      activeStations,
      totalBookings,
      activeSubscriptions,
      pendingOwners,
      pendingStations,
      allTransactions,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.USER }),
      User.countDocuments({ role: ROLES.OWNER }),
      ChargingStation.countDocuments(),
      ChargingStation.countDocuments({
        isActive: true,
        approvalStatus: STATION_APPROVAL.APPROVED,
      }),
      Booking.countDocuments(),
      Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }),
      OwnerProfile.countDocuments({ verificationStatus: OWNER_VERIFICATION.PENDING }),
      ChargingStation.countDocuments({ approvalStatus: STATION_APPROVAL.PENDING }),
      Transaction.find(),
      Booking.find()
        .populate('userId', 'name email')
        .populate('ownerId', 'name email')
        .populate('stationId', 'name')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    // Financial aggregates
    const bookingRevenue = allTransactions
      .filter((t) => t.type === 'BOOKING_REVENUE')
      .reduce((sum, t) => sum + (t.grossAmount || 0), 0);

    const platformCommission = allTransactions
      .filter((t) => t.type === 'BOOKING_REVENUE')
      .reduce((sum, t) => sum + (t.platformCommission || 0), 0);

    const subscriptionRevenue = allTransactions
      .filter((t) => t.type === 'SUBSCRIPTION_PAYMENT')
      .reduce((sum, t) => sum + (t.grossAmount || 0), 0);

    const pendingSettlements = allTransactions
      .filter((t) => t.settlementStatus === SETTLEMENT_STATUS.PENDING)
      .reduce((sum, t) => sum + (t.ownerNetAmount || 0), 0);

    // Chart analytics (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyDataMap[key] = {
        name: key,
        bookings: 0,
        revenue: 0,
        commission: 0,
      };
    }

    allTransactions.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].revenue += t.grossAmount || 0;
        monthlyDataMap[key].commission += t.platformCommission || 0;
        if (t.type === 'BOOKING_REVENUE') {
          monthlyDataMap[key].bookings += 1;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalOwners,
          totalStations,
          activeStations,
          totalBookings,
          activeSubscriptions,
          pendingApprovals: pendingOwners + pendingStations,
          pendingOwners,
          pendingStations,
          bookingRevenue,
          platformCommission,
          subscriptionRevenue,
          pendingSettlements,
        },
        monthlyTrends: Object.values(monthlyDataMap),
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Users
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, q, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Status (Active / Suspended)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    await logAudit(req.user._id, `SET_USER_STATUS_${status}`, 'USER', user._id, { status });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Owners
 */
export const getOwners = async (req, res, next) => {
  try {
    const { verificationStatus, subscriptionStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (subscriptionStatus) query.subscriptionStatus = subscriptionStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await OwnerProfile.countDocuments(query);
    const owners = await OwnerProfile.find(query)
      .populate('userId', 'name email phone status profileImage createdAt')
      .populate('activeSubscriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: owners.length,
      total,
      data: owners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Owner Verification
 */
export const approveOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await OwnerProfile.findById(id);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Owner profile not found' });
    }

    profile.verificationStatus = OWNER_VERIFICATION.VERIFIED;
    profile.rejectionReason = '';
    await profile.save();

    // Check if any stations should become publicly listed now
    await syncAllOwnerStations(profile.userId);

    await createNotification({
      userId: profile.userId,
      title: 'Host Profile Verified! 🎉',
      message: 'Your host credentials have been approved by the EV Hub team.',
      type: 'STATION',
      link: '/owner/profile',
      isOwner: true,
    });

    await logAudit(req.user._id, 'APPROVE_OWNER', 'OWNER', profile._id);

    res.status(200).json({
      success: true,
      message: 'Owner profile approved successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Owner Verification
 */
export const rejectOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const profile = await OwnerProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Owner profile not found' });
    }

    profile.verificationStatus = OWNER_VERIFICATION.REJECTED;
    profile.rejectionReason = reason || 'Documentation could not be verified.';
    await profile.save();

    await syncAllOwnerStations(profile.userId);

    await createNotification({
      userId: profile.userId,
      title: 'Host Verification Update',
      message: `Your host profile verification was not approved: ${profile.rejectionReason}. Please re-submit documents.`,
      type: 'STATION',
      link: '/owner/profile',
      isOwner: true,
    });

    await logAudit(req.user._id, 'REJECT_OWNER', 'OWNER', profile._id, { reason });

    res.status(200).json({
      success: true,
      message: 'Owner profile rejected.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Charging Stations
 */
export const getAllStations = async (req, res, next) => {
  try {
    const { approvalStatus, isActive, page = 1, limit = 20 } = req.query;
    const query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ChargingStation.countDocuments(query);
    const stations = await ChargingStation.find(query)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: stations.length,
      total,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Charging Station
 */
export const approveStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await ChargingStation.findById(id);

    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    station.approvalStatus = STATION_APPROVAL.APPROVED;
    station.rejectionReason = '';
    await station.save();

    // Re-check public listing conditions
    const isListed = await syncStationListingStatus(station._id);

    await createNotification({
      userId: station.ownerId,
      title: 'Charging Station Approved! ⚡',
      message: `Your charging point '${station.name}' has been approved.${isListed ? ' It is now live on the map!' : ' Activate a host subscription to list it publicly.'}`,
      type: 'STATION',
      link: '/owner/stations',
      isOwner: true,
    });

    await logAudit(req.user._id, 'APPROVE_STATION', 'STATION', station._id);

    res.status(200).json({
      success: true,
      message: 'Charging station approved successfully.',
      isPubliclyListed: isListed,
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Charging Station
 */
export const rejectStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const station = await ChargingStation.findById(id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    station.approvalStatus = STATION_APPROVAL.REJECTED;
    station.rejectionReason = reason || 'Station specifications or safety details need correction.';
    station.isPubliclyListed = false;
    await station.save();

    await createNotification({
      userId: station.ownerId,
      title: 'Station Verification Update',
      message: `Your station '${station.name}' was rejected: ${station.rejectionReason}`,
      type: 'STATION',
      link: '/owner/stations',
      isOwner: true,
    });

    await logAudit(req.user._id, 'REJECT_STATION', 'STATION', station._id, { reason });

    res.status(200).json({
      success: true,
      message: 'Station rejected.',
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Bookings across platform
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.bookingStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('ownerId', 'name email phone')
      .populate('stationId', 'name address location')
      .sort({ createdAt: -1 })
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
 * Manage Subscriptions
 */
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('ownerId', 'name email phone')
      .populate('planId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Financial Transactions
 */
export const getAllTransactions = async (req, res, next) => {
  try {
    const { settlementStatus, page = 1, limit = 25 } = req.query;
    const query = {};

    if (settlementStatus) query.settlementStatus = settlementStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('ownerId', 'name email')
      .populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Settlement as Settled
 */
export const settleTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reference } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.settlementStatus = SETTLEMENT_STATUS.SETTLED;
    transaction.settlementReference = reference || `PAYOUT_${Date.now()}`;
    transaction.settledAt = new Date();
    await transaction.save();

    // Adjust Owner Profile pending vs settled
    await OwnerProfile.findOneAndUpdate(
      { userId: transaction.ownerId },
      {
        $inc: {
          pendingSettlement: -transaction.ownerNetAmount,
          settledAmount: transaction.ownerNetAmount,
        },
      }
    );

    await logAudit(req.user._id, 'SETTLE_TRANSACTION', 'FINANCIAL', transaction._id, {
      amount: transaction.ownerNetAmount,
      reference: transaction.settlementReference,
    });

    res.status(200).json({
      success: true,
      message: 'Transaction marked as settled.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export Bookings to CSV
 */
export const exportBookingsCSV = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('ownerId', 'name email')
      .populate('stationId', 'name')
      .sort({ createdAt: -1 });

    let csv = 'BookingID,Date,Driver,Host,Station,StartTime,EndTime,TotalAmount(INR),PlatformFee,HostEarning,Status\n';

    bookings.forEach((b) => {
      csv += `"${b._id}","${new Date(b.createdAt).toISOString()}","${b.userId?.name || ''}","${b.ownerId?.name || ''}","${b.stationId?.name || ''}","${new Date(b.startTime).toISOString()}","${new Date(b.endTime).toISOString()}",${b.totalAmount},${b.platformFee},${b.ownerEarning},"${b.bookingStatus}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`evhub_bookings_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Export Transactions to CSV
 */
export const exportTransactionsCSV = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    let csv = 'TransactionID,Date,HostName,Type,GrossAmount(INR),PlatformCommission,HostNetAmount,SettlementStatus,Reference\n';

    transactions.forEach((t) => {
      csv += `"${t._id}","${new Date(t.createdAt).toISOString()}","${t.ownerId?.name || ''}","${t.type}",${t.grossAmount},${t.platformCommission},${t.ownerNetAmount},"${t.settlementStatus}","${t.settlementReference || ''}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`evhub_transactions_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Audit Logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Platform Settings
 */
export const getSettings = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformSettings,
  });
};

export const updateSettings = async (req, res) => {
  platformSettings = {
    ...platformSettings,
    ...req.body,
  };

  await logAudit(req.user._id, 'UPDATE_SETTINGS', 'SETTING', null, platformSettings);

  res.status(200).json({
    success: true,
    message: 'Platform settings updated successfully.',
    data: platformSettings,
  });
};

