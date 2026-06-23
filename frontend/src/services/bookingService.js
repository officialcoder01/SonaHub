const API_BASE_URL = "http://localhost:3000/api/vendor/bookings";
const CUSTOMER_API_BASE_URL = "http://localhost:3000/api/bookings";

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(result.message || result.error || "Booking request failed");
  }

  return result;
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getVendorBookings = async (token) => {
  const response = await fetch(API_BASE_URL, {
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const acceptVendorBooking = async (bookingId, token) => {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/accept`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const rejectVendorBooking = async (bookingId, token) => {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/reject`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const completeVendorBooking = async (bookingId, token) => {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/complete`, {
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
  const response = await fetch(CUSTOMER_API_BASE_URL, {
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
  const response = await fetch(`${CUSTOMER_API_BASE_URL}/my`, {
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
  const response = await fetch(`${CUSTOMER_API_BASE_URL}/${bookingId}/cancel`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};
