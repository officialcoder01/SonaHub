////////////////////////////////////////
// Service-related routes
////////////////////////////////////

import express from "express";
import {
  createServiceListing,
  getServiceDetails,
  listMyServices,
  listServices,
  getCategories,
  deleteServiceListing,
} from "../controllers/serviceController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", requireAuth, upload.array("images", 3), createServiceListing); // create new service
router.get("/my", requireAuth, listMyServices); // list services for the authenticated vendor
router.get("/categories", getCategories); // list all categories
router.get("/:id", getServiceDetails); // fetch public details for a single service
router.delete("/:id", requireAuth, deleteServiceListing); // delete a service by ID (vendor only)
router.get("/", listServices); // list all services for public listing

export default router;
