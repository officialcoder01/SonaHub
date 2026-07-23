const API_ROOT_URL = "http://localhost:3000/api";
const API_URL = `${API_ROOT_URL}/services`;

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(result.message || result.error || "An error occurred");
  }

  return result;
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);

  if (response.status !== 404) {
    return handleResponse(response);
  }
};

export const getServices = async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.set(key, String(value));
        }
    });

    const requestUrl = queryParams.toString()
        ? `${API_URL}?${queryParams.toString()}`
        : API_URL;

    const response = await fetch(requestUrl);
    return handleResponse(response);
};

// Fetch the full public payload needed by the Service Details page.
export const getServiceDetails = async (serviceId) => {
  const response = await fetch(`${API_URL}/${serviceId}`);
  return handleResponse(response);
};

// Create a new service with optional image uploads
export const createService = async (data, token) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("categoryId", data.categoryId);

    if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
            formData.append("images", file);
        });
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(token),
        body: formData,
    });

    return handleResponse(response);
};

export const getMyServices = async (token) => {
    const response = await fetch(`${API_URL}/my`, {
        headers: authHeaders(token),
    });

    return handleResponse(response);
};

export const pinMyService = async (serviceId, token) => {
  const response = await fetch(`${API_URL}/${serviceId}/pin`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const unpinMyService = async (serviceId, token) => {
  const response = await fetch(`${API_URL}/${serviceId}/unpin`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};

export const deleteService = async (serviceId, token) => {
  const response = await fetch(`${API_URL}/${serviceId}`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  return handleResponse(response);
};
