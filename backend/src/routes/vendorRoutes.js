//////////////////////////////////////////
// Vendor-related routes
////////////////////////////////////////

import express from "express";
import {
  createProfile,
  updateBusinessProfile,
  getMyProfile,
  getVendorPublicProfile,
  listVendors,
} from "../controllers/vendorController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validateVendorProfile } from "../validators/vendorFormValidator.js";

const router = express.Router();

router.post("/profile", requireAuth, validateVendorProfile, createProfile);
router.put("/profile", requireAuth, validateVendorProfile, updateBusinessProfile);
router.get("/me", requireAuth, getMyProfile);
router.get("/", listVendors);
router.get("/:id", getVendorPublicProfile);

export default router;
