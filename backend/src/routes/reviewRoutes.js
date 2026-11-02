import express from 'express';
import { createReview, getStationReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/station/:stationId', getStationReviews);
router.post('/', authenticate, createReview);

export default router;

