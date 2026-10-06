import prisma from "../config/prisma.js";

interface ReviewRequest {
  userId: string;
  bookingId: string;
  rating: number;
  comment: string;
}

interface ReviewError extends Error {
  status?: number;
}

const createError = (
  message: string,
  status: number
): ReviewError => {
  const error: ReviewError = new Error(message);
  error.status = status;
  return error;
};

export const submitReview = async ({
  userId,
  bookingId,
  rating,
  comment
}: ReviewRequest) => {
  // Step 1: Fetch the booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
    },
  });

  // Step 2: Verify the booking exists.
  if (!booking) {
    throw createError("Booking not found", 404);
  }

  // Step 3: Verify the authenticated user owns this booking.
  if (booking.customerId !== userId) {
    throw createError("You are not authorized to review this booking", 403);
  }

  // Step 4: Only COMPLETED bookings may be reviewed.
  if (booking.status !== "COMPLETED") {
    throw createError("Only completed bookings can be reviewed", 400);
  }

  // Step 5: Enforce the one-review-per-booking constraint.
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) {
    throw createError("You have already reviewed this booking", 409);
  }

  const { vendorId, serviceId } = booking;

  // Step 6: Create the review, linking it to all four related
  // entities: user, vendor, service, and booking.
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
