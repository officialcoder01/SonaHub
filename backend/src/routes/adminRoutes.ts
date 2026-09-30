import { Router } from "express";
import { adminDashboard } from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/dashboard", requireAuth, adminDashboard);

export default router;
