const API_BASE_URL = "http://localhost:3000/api/vendors";

const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getMyProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const getVendors = async () => {
  const response = await fetch(API_BASE_URL);
  return handleResponse(response);
};

export const createProfile = async (data, token) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};
