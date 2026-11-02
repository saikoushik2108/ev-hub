import express from 'express';
import {
  getUserOverview,
  getFavorites,
  addFavorite,
  removeFavorite,
  submitComplaint,
  getUserComplaints,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', getUserOverview);
router.get('/favorites', getFavorites);
router.post('/favorites/:stationId', addFavorite);
router.delete('/favorites/:stationId', removeFavorite);
router.post('/complaints', submitComplaint);
router.get('/complaints', getUserComplaints);

export default router;

