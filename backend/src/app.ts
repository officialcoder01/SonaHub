import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { CorsOptions } from "cors";
import type { ErrorRequestHandler } from "express";
import authRoutes from "./routes/authRouter.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import vendorBookingRoutes from "./routes/vendorBookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import recommendationRoutes from "./routes/recommendationRoute.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Detect whether the server is running in its deployed configuration.
const isProduction = process.env.NODE_ENV === "production";

function sanitizeOriginValue(origin: string): string {
  return origin.trim().replace(/^['"]+|['"]+$/g, "");
}

// Allow one or more frontend origins to be supplied from the environment.
const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => sanitizeOriginValue(origin))
    .filter(Boolean);
// Include configured production origins plus the local dev URLs we commonly use.
const allowedOrigins = [
  ...configuredOrigins,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
].filter(Boolean);

function normalizeOrigin(origin?: string): string | null {
  // Reduce origins to a stable form so trailing slashes or full URLs do not break matching.
  if (!origin) {
    return null;
  }

  const cleanedOrigin = sanitizeOriginValue(origin);

  try {
    return new URL(cleanedOrigin).origin;
  } catch {
    return cleanedOrigin.replace(/\/+$/, "");
  }
}

function isAllowedOrigin(origin?: string): boolean {
  // Accept same-origin/server-side requests and approved browser origins.
  if (!origin) {
    return true;
  }

  // Compare normalized origins so environment formatting differences do not cause false rejections.
  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedAllowedOrigins = allowedOrigins
    .map(normalizeOrigin)
    .filter((allowedOrigin): allowedOrigin is string => allowedOrigin !== null);

  if (normalizedOrigin && normalizedAllowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  if (!isProduction && normalizedOrigin) {
    try {
      // In development, allow any localhost-style origin regardless of port.
      const { hostname } = new URL(normalizedOrigin);
      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".localhost")
      );
    } catch {
      return false;
    }
  }

  return false;
}

if (isProduction) {
    // Trust the reverse proxy in production so secure cookies work correctly behind Vercel.
    app.set('trust proxy', 1);
}

app.use(express.json());

// Strict rules for authentication endpoint
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again in 1 minute.",
    });
  },
});

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Let CORS decide request-by-request whether the browser origin is allowed.
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend server is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Multi-vendor marketing platform backend is up and running!!",
  });
});

// API routes
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vendor/bookings", vendorBookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;
  const message = error instanceof Error ? error.message : "Internal server error";

    response.status(status).json({
    error: message,
  });
};

app.use(errorHandler);

export default app;
