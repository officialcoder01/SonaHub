import express from "express";
import {
  cancelBookingRequest,
  createBookingRequest,
  listMyBookings,
} from "../controllers/bookingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createBookingRequest);
router.get("/my", requireAuth, listMyBookings);
router.patch("/:id/cancel", requireAuth, cancelBookingRequest);

export default router;
