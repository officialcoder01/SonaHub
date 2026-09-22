////////////////////////////////////
// Request validation middleware.
// This middleware stops invalid requests early and forwards only
// the validated fields to the controller/service layer.
///////////////////////////////////

import { matchedData, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : undefined,
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
