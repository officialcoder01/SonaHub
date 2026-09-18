export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok) {
    const validationMessage = result.errors?.[0]?.message;
    throw new Error(validationMessage || result.message || "Request failed");
  }

  return result;
};

export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});
