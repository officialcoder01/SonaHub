import { API_BASE_URL, authHeaders, handleResponse } from "../config/api";
  
const API_URL = `${API_BASE_URL}/vendors`;

export const getMyProfile = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const getVendors = async () => {
  const response = await fetch(API_URL);
  return handleResponse(response);
};

// Fetch a single vendor's public profile by vendor profile ID.
// Returns: { vendorProfile: { ...vendor, services, reviews, reviewStat } }
export const getVendorById = async (vendorId) => {
  const response = await fetch(`${API_URL}/${vendorId}`);
  return handleResponse(response);
};

export const createProfile = async (data, token) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};
