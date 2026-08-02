import { API_BASE_URL, handleResponse, authHeaders } from "../Config/api";

const API_URL = `${API_BASE_URL}/services`;

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
        headers: { ...authHeaders(token) },
        body: formData,
    });

    return handleResponse(response);
};

export const getMyServices = async (token) => {
    const response = await fetch(`${API_URL}/my`, {
        headers: { ...authHeaders(token) },
    });

    return handleResponse(response);
};

export const pinMyService = async (serviceId, token) => {
  const response = await fetch(`${API_URL}/${serviceId}/pin`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });

  return handleResponse(response);
};

export const unpinMyService = async (serviceId, token) => {
  const response = await fetch(`${API_URL}/${serviceId}/unpin`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });

  return handleResponse(response);
};

export const updateService = async (serviceId, data, token) => {
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

  const response = await fetch(`${API_URL}/${serviceId}`, {
    method: "PUT",
    headers: { ...authHeaders(token) },
    body: formData,
  });

  return handleResponse(response);
};

export const deleteService = async (serviceId, token) => {
  const response = await fetch(`${API_URL}/${serviceId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
  });

  return handleResponse(response);
};
