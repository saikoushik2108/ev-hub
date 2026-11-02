import express from 'express';
import {
  getStations,
  getNearbyStations,
  getStationById,
  getStationAvailability,
} from '../controllers/stationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getStations);
router.get('/nearby', getNearbyStations);
router.get('/:id', optionalAuth, getStationById);
router.get('/:id/availability', getStationAvailability);

export default router;

