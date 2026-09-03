import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { adminDashboard } from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", requireAuth, adminDashboard);

export default router;