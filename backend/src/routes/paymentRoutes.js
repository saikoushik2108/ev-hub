import express from 'express';
import { handleWebhook, getPaymentHistory } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (public with crypto signature validation)
router.post('/webhook', handleWebhook);

// Protected user payment history
router.get('/history', authenticate, getPaymentHistory);

export default router;

