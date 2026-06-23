import { submitReview } from "../services/reviewService.js";

///////////////////////////////////////////////////////////
// reviewController
//
// Responsibilities:
//   - Extract validated fields from req.body
//   - Delegate all business logic to reviewService
//   - Return the appropriate HTTP response
//
// This controller contains NO business logic. All domain
// rules live in reviewService.js.
///////////////////////////////////////////////////////////

export const createReview = async (req, res) => {
  try {
    // req.user is populated by the requireAuth middleware.
    // req.body contains only validated, sanitised fields from
    // the validateReview middleware chain.
    const { bookingId, rating, comment } = req.body;

    const review = await submitReview({
      userId: req.user.id,
      bookingId,
      rating,
      comment,
    });

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (err) {
    // Propagate the structured error status set by the service,
    // falling back to 500 for any unexpected runtime errors.
    return res.status(err.status || 500).json({
      message: err.message || "Unable to submit review",
    });
  }
};
