import { API_BASE_URL, handleResponse, authHeaders } from "../config/api";

const REVIEWS_API_URL = `${API_BASE_URL}/reviews`;

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
      ...authHeaders(token),
    },
    body: JSON.stringify({ bookingId, rating, comment }),
  });

  return handleResponse(response);
};
