import { API_BASE_URL, authHeaders, handleResponse } from "../config/api";

const ADMIN_URL = `${API_BASE_URL}/admin`;

// Keep admin requests in the shared service layer, alongside the other role-specific APIs.
export const getAdminDashboard = async (token) => {
  const response = await fetch(`${ADMIN_URL}/dashboard`, {
    headers: authHeaders(token),
  });

  return handleResponse(response);
};
