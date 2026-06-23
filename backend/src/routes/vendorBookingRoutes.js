import express from "express";
import {
  acceptBookingRequest,
  completeBookingRequest,
  listVendorBookings,
  rejectBookingRequest,
} from "../controllers/bookingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, listVendorBookings);
router.patch("/:id/accept", requireAuth, acceptBookingRequest);
router.patch("/:id/reject", requireAuth, rejectBookingRequest);
router.patch("/:id/complete", requireAuth, completeBookingRequest);

export default router;
