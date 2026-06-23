const REVIEWS_API_URL = "http://localhost:3000/api/reviews";

// Shared response handler — parses JSON and surfaces meaningful error messages.
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(result.message || result.error || "Review request failed");
  }

  return result;
};

/**
 * Submits a new review for a completed booking.
 *
 * @param {Object} data - { bookingId, rating, comment }
 * @param {string} token - JWT auth token for the authenticated customer.
 * @returns {Promise<{ message: string, review: Object }>}
 */
export const submitReview = async ({ bookingId, rating, comment }, token) => {
  const response = await fetch(REVIEWS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId, rating, comment }),
  });

  return handleResponse(response);
};
