//////////////////////////////////////////
// Vendor-related routes
////////////////////////////////////////

import express from "express";
import {
  createProfile,
  getMyProfile,
  listVendors,
} from "../controllers/vendorController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/profile", requireAuth, createProfile);
router.get("/me", requireAuth, getMyProfile);
router.get("/", listVendors);

export default router;
