import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";

// These rules enforce the contract described in the API spec before the
// request ever reaches the service layer. Catching malformed input early
// keeps the service layer clean and prevents unnecessary database calls.
export const validateReview = [
  body("bookingId")
    .trim()
    .notEmpty()
    .withMessage("bookingId is required")
    // A UUID is the only accepted identifier format for bookings in this system.
    .isUUID()
    .withMessage("bookingId must be a valid UUID"),

  body("rating")
    .notEmpty()
    .withMessage("rating is required")
    // Ratings must be whole numbers — fractional stars are not supported.
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    // Comment is optional; when provided, trim surrounding whitespace so that
    // blank strings composed only of spaces are treated as absent.
    .optional()
    .trim(),

  validateRequest,
];
