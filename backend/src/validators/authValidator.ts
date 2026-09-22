import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";

const allowedRoles = ["CUSTOMER", "VENDOR"];

// These rules protect registration from malformed input and from
// privilege escalation attempts such as sending ADMIN as a role.
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .customSanitizer((value) => value.toUpperCase())
    .isIn(allowedRoles)
    .withMessage("Role must be either CUSTOMER or VENDOR"),

  validateRequest,
];

// Login has fewer fields, but we still trim and validate them before
// they reach the authentication service.
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),

  validateRequest,
];
