import type { Request, Response } from "express";
import { submitReview } from "../services/reviewService.js";

export const createReview = async (req: Request, res:Response) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const user = req.user;

    if (!user) {
      throw new Error("Authentication required");
    }

    const review = await submitReview({
      userId: user.id,
      bookingId,
      rating,
      comment,
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to submit review";
    const status = typeof err === "object" &&
      err !== null && "status" in err &&
      typeof err.status === "number" 
        ? err.status 
        : 500;
    
    return res.status(status).json({
      message: message || "Unable to submit review",
    });
  }
};
