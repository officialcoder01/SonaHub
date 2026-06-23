////////////////////////////////////
// Request validation middleware.
// This middleware stops invalid requests early and forwards only
// the validated fields to the controller/service layer.
///////////////////////////////////

import { matchedData, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  req.body = matchedData(req, {
    locations: ["body"],
    includeOptionals: true,
    onlyValidData: true,
  });

  next();
};
