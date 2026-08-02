import { API_BASE_URL, handleResponse } from "../config/api";

const API_URL = `${API_BASE_URL}/recommendations`;

export const getTopRatedVendors = async () => {
    const response = await fetch(`${API_URL}/top-rated-vendors`);

    return handleResponse(response);
};