import express from 'express';
import {
  getOwnerDashboard,
  registerStation,
  getOwnerStations,
  updateStation,
  deleteStation,
  getOwnerBookings,
  getOwnerEarnings,
  getOwnerSubscription,
  checkoutSubscription,
  verifySubscription,
  replyToReview,
} from '../controllers/ownerController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/role.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(authenticate, requireOwner);

router.get('/dashboard', getOwnerDashboard);
router.post('/stations', upload.array('photos', 5), registerStation);
router.get('/stations', getOwnerStations);
router.patch('/stations/:id', updateStation);
router.delete('/stations/:id', deleteStation);
router.get('/bookings', getOwnerBookings);
router.get('/earnings', getOwnerEarnings);
router.get('/subscription', getOwnerSubscription);
router.post('/subscription/checkout', checkoutSubscription);
router.post('/subscription/verify', verifySubscription);
router.post('/reviews/:id/reply', replyToReview);

export default router;

