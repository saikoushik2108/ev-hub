import express from 'express';
import {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  getOwners,
  approveOwner,
  rejectOwner,
  getAllStations,
  approveStation,
  rejectStation,
  getAllBookings,
  getAllSubscriptions,
  getAllTransactions,
  settleTransaction,
  exportBookingsCSV,
  exportTransactionsCSV,
  getAuditLogs,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/overview', getAdminOverview);

// User routes
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

// Owner routes
router.get('/owners', getOwners);
router.patch('/owners/:id/approve', approveOwner);
router.patch('/owners/:id/reject', rejectOwner);

// Station routes
router.get('/stations', getAllStations);
router.patch('/stations/:id/approve', approveStation);
router.patch('/stations/:id/reject', rejectStation);

// Booking routes
router.get('/bookings', getAllBookings);

// Subscription routes
router.get('/subscriptions', getAllSubscriptions);

// Transaction & financial routes
router.get('/transactions', getAllTransactions);
router.patch('/transactions/:id/settle', settleTransaction);

// CSV reports
router.get('/reports/csv-bookings', exportBookingsCSV);
router.get('/reports/csv-transactions', exportTransactionsCSV);

// Audit & Settings
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;

