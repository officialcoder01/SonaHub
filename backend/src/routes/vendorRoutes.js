//////////////////////////////////////////
// Vendor-related routes
////////////////////////////////////////

import express from "express";
import {
  createProfile,
  getMyProfile,
  getVendorPublicProfile,
  listVendors,
} from "../controllers/vendorController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/profile", requireAuth, createProfile);
router.get("/me", requireAuth, getMyProfile);
router.get("/", listVendors);
router.get("/:id", getVendorPublicProfile);

export default router;
