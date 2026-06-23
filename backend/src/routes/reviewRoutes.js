import express from "express";
import { createReview } from "../controllers/reviewController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateReview } from "../validators/reviewValidator.js";

const router = express.Router();

// POST /api/reviews
// Protected — requires a valid JWT.
// The validateReview array runs field-level validation before
// the controller is invoked, so the controller always receives
// clean, trusted data.
router.post("/", requireAuth, validateReview, createReview);

export default router;
