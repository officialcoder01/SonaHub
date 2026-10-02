////////////////////////////////////////
// Service-related routes
////////////////////////////////////

import express from "express";
import {
  createServiceListing,
  pinService,
  unpinService,
  getServiceDetails,
  listMyServices,
  listServices,
  getCategories,
  updateServiceListing,
  editServiceListing,
} from "../controllers/serviceController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", requireAuth, upload.array("images", 3), createServiceListing); // create new service

router.patch("/:id/pin", requireAuth, pinService); // pin a service for the authenticated vendor
router.patch("/:id/unpin", requireAuth, unpinService); // unpin a service for the authenticated vendor

router.get("/my", requireAuth, listMyServices); // list services for the authenticated vendor
router.get("/categories", getCategories); // list all categories
router.get("/:id", getServiceDetails); // fetch public details for a single service

router.patch("/:id", requireAuth, updateServiceListing); // update a service by ID to become archieved (vendor only)
router.put("/:id", requireAuth, upload.array("images", 3), editServiceListing); // edit a service by ID (vendor only)

router.get("/", listServices); // list all services for public listing

export default router;
