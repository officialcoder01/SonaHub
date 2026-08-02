export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
};

export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});
