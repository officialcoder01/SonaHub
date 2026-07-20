import express from 'express';
import { topRatedVendors, getPinnedServicesForVendor } from '../controllers/recommendationController.js';

const router = express.Router();

// GET /api/recommendations/top-rated-vendors
router.get('/top-rated-vendors', topRatedVendors);

// GET /api/recommendations/pinned-services
router.get('/:id/pinned-services', getPinnedServicesForVendor);

export default router;