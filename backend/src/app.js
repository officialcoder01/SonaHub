import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRouter.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import vendorBookingRoutes from "./routes/vendorBookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import recommendationRoutes from "./routes/recommendationRoute.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

// Detect whether the server is running in its deployed configuration.
const isProduction = process.env.NODE_ENV === 'production';
function sanitizeOriginValue(origin) {
    return origin.trim().replace(/^['"]+|['"]+$/g, '');
}

// Allow one or more frontend origins to be supplied from the environment.
const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => sanitizeOriginValue(origin))
    .filter(Boolean);
// Include configured production origins plus the local dev URLs we commonly use.
const allowedOrigins = [
    ...configuredOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
].filter(Boolean);

function normalizeOrigin(origin) {
    // Reduce origins to a stable form so trailing slashes or full URLs do not break matching.
    if (!origin) {
        return null;
    }

    const cleanedOrigin = sanitizeOriginValue(origin);

    try {
        return new URL(cleanedOrigin).origin;
    } catch {
        return cleanedOrigin.replace(/\/+$/, '');
    }
}

function isAllowedOrigin(origin) {
    // Accept same-origin/server-side requests and approved browser origins.
    if (!origin) {
        return true;
    }

    // Compare normalized origins so environment formatting differences do not cause false rejections.
    const normalizedOrigin = normalizeOrigin(origin);
    const normalizedAllowedOrigins = allowedOrigins
        .map((allowedOrigin) => normalizeOrigin(allowedOrigin))
        .filter(Boolean);

    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
        return true;
    }

    if (!isProduction) {
        try {
            // In development, allow any localhost-style origin regardless of port.
            const { hostname } = new URL(normalizedOrigin);
            return (
                hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname.endsWith('.localhost')
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many login attempts, please try again later."
        });
    }
})

app.use(cors({
    origin(origin, callback) {
        // Let CORS decide request-by-request whether the browser origin is allowed.
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        console.error('Blocked by CORS:', {
            requestOrigin: origin,
            normalizedRequestOrigin: normalizeOrigin(origin),
            allowedOrigins: allowedOrigins.map((allowedOrigin) => normalizeOrigin(allowedOrigin)),
        });
        callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
}));

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

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down server...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

export default app;
