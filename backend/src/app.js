import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRouter.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import vendorBookingRoutes from "./routes/vendorBookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
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
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vendor/bookings", vendorBookingRoutes);
app.use("/api/reviews", reviewRoutes);

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
