import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";

export const validateVendorProfile = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),

  body("bio")
    .trim()
    .notEmpty()
    .withMessage("Bio is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Bio must be between 10 and 500 characters"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),

  validateRequest,
];
