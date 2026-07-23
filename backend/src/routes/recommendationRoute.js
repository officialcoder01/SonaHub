import express from 'express';
import { topRatedVendors } from '../controllers/recommendationController.js';

const router = express.Router();

// GET /api/recommendations/top-rated-vendors
router.get('/top-rated-vendors', topRatedVendors);

export default router;
