const API_URL = "http://localhost:3000/api/recommendations";

const handleResponse = async (response) => {
    const result = await response.json();

    if (!result.ok) {
        throw new Error(result.message || "Request failed");
    };

    return result;
}

export const topRatedVendors = async () => {
    const response = await fetch(`${API_URL}/top-rated-vendors`);

    return handleResponse(response);
}