import prisma from "../config/prisma.js";

///////////////////////////////////////////////////////////
// Helper: create a structured error with an HTTP status
///////////////////////////////////////////////////////////
const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

///////////////////////////////////////////////////////////
// submitReview
//
// Orchestrates all business-rule checks before persisting
// a new review record. The order of checks is intentional:
// existence → ownership → status → duplicate.
// Each guard throws early so later steps can trust their
// preconditions are already satisfied.
///////////////////////////////////////////////////////////
export const submitReview = async ({ userId, bookingId, rating, comment }) => {
  ///////////////////////////////////////////////////////////
  // Step 1: Fetch the booking and eagerly load the related
  // service and vendor so we avoid extra round-trips later.
  ///////////////////////////////////////////////////////////
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
    },
  });

  ///////////////////////////////////////////////////////////
  // Step 2: Verify the booking exists.
  // Return 404 rather than leaking whether the record belongs
  // to another user (information disclosure prevention).
  ///////////////////////////////////////////////////////////
  if (!booking) {
    throw createError("Booking not found", 404);
  }

  ///////////////////////////////////////////////////////////
  // Step 3: Verify the authenticated user owns this booking.
  // A customer must only be able to review experiences they
  // personally paid for — never someone else's transaction.
  ///////////////////////////////////////////////////////////
  if (booking.customerId !== userId) {
    throw createError("You are not authorized to review this booking", 403);
  }

  ///////////////////////////////////////////////////////////
  // Step 4: Only COMPLETED bookings may be reviewed.
  // Reviews on in-flight, rejected, or cancelled bookings
  // would be meaningless and could be abused to inflate
  // or deflate a vendor's reputation unfairly.
  ///////////////////////////////////////////////////////////
  if (booking.status !== "COMPLETED") {
    throw createError("Only completed bookings can be reviewed", 400);
  }

  ///////////////////////////////////////////////////////////
  // Step 5: Enforce the one-review-per-booking constraint.
  // The schema has a @unique on Review.bookingId but we check
  // here explicitly to return a meaningful 409 instead of
  // letting a Prisma unique-constraint error bubble up as 500.
  ///////////////////////////////////////////////////////////
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) {
    throw createError("You have already reviewed this booking", 409);
  }

  ///////////////////////////////////////////////////////////
  // Step 6: Derive the vendorId and serviceId from the booking
  // itself. These values are already trusted because they were
  // set at booking-creation time by the system, not by the
  // client submitting the review.
  ///////////////////////////////////////////////////////////
  const { vendorId, serviceId } = booking;

  ///////////////////////////////////////////////////////////
  // Step 7: Create the review, linking it to all four related
  // entities: user, vendor, service, and booking.
  // The comment field is optional — pass undefined when absent
  // so Prisma stores NULL rather than an empty string.
  ///////////////////////////////////////////////////////////
  const review = await prisma.review.create({
    data: {
      userId,
      vendorId,
      serviceId,
      bookingId,
      rating,
      // Only include comment when the caller actually provided a value.
      comment: comment ?? null,
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
      vendor: {
        select: { id: true, businessName: true },
      },
      service: {
        select: { id: true, title: true },
      },
    },
  });

  return review;
};
