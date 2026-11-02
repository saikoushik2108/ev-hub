import express from 'express';
import {
  getPlans,
  createSubscription,
  verifySubscriptionPayment,
  getSubscriptionStatus,
} from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOwner } from '../middleware/role.js';

const router = express.Router();

// Public plans
router.get('/plans', getPlans);

// Protected owner subscription routes
router.use(authenticate, requireOwner);
router.post('/create', createSubscription);
router.post('/verify', verifySubscriptionPayment);
router.get('/status', getSubscriptionStatus);

export default router;

