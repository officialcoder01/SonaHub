const API_URL = "http://localhost:3000/api/recommendations";

const handleResponse = async (response) => {
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    };

    return result;
};

export const getTopRatedVendors = async () => {
    const response = await fetch(`${API_URL}/top-rated-vendors`);

    return handleResponse(response);
};

export const getVendorPinnedServices = async (vendorId) => {
    const response = await fetch(`${API_URL}/${vendorId}/pinned-services`);

    return handleResponse(response);
};