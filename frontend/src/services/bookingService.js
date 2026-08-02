import { API_BASE_URL, handleResponse, authHeaders } from "../config/api.js";

const VENDOR_BOOKINGS_URL = `${API_BASE_URL}/vendor/bookings`;
const CUSTOMER_BOOKINGS_URL = `${API_BASE_URL}/bookings`;

export const getVendorBookings = async (token) => {
  const response = await fetch(VENDOR_BOOKINGS_URL, {
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const acceptVendorBooking = async (bookingId, token) => {
  const response = await fetch(`${VENDOR_BOOKINGS_URL}/${bookingId}/accept`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const rejectVendorBooking = async (bookingId, token) => {
  const response = await fetch(`${VENDOR_BOOKINGS_URL}/${bookingId}/reject`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const completeVendorBooking = async (bookingId, token) => {
  const response = await fetch(`${VENDOR_BOOKINGS_URL}/${bookingId}/complete`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

// ////////////////////////////////////////////////
// CUSTOMER BOOKING METHODS
// ////////////////////////////////////////////////

/**
 * Submits a new booking request to the backend.
 * @param {Object} bookingData - Contains serviceId and optional message.
 * @param {string} token - Customer auth token.
 */
export const createBooking = async (bookingData, token) => {
  const response = await fetch(CUSTOMER_BOOKINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(bookingData),
  });

  return handleResponse(response);
};

/**
 * Fetches bookings belonging to the currently logged in customer.
 * @param {string} token - Customer auth token.
 */
export const getCustomerBookings = async (token) => {
  const response = await fetch(`${CUSTOMER_BOOKINGS_URL}/my`, {
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

/**
 * Cancels a pending or accepted customer booking.
 * @param {string} bookingId - The ID of the booking to cancel.
 * @param {string} token - Customer auth token.
 */
export const cancelBooking = async (bookingId, token) => {
  const response = await fetch(`${CUSTOMER_BOOKINGS_URL}/${bookingId}/cancel`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};
