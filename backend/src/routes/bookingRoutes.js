import express from 'express';
import {
  holdBooking,
  confirmPayment,
  getMyBookings,
  getBookingById,
  cancelBooking,
  verifyBookingQR,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/hold', holdBooking);
router.post('/confirm', confirmPayment);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/verify-qr', verifyBookingQR);

export default router;

