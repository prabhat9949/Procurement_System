import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
export const getCategories = () => apiGet("/api/categories");
export const getCategory = (id) => apiGet(`/api/categories/${id}`);
export const createCategory = (request) => apiPost("/api/categories", request);
export const updateCategory = (id, request) => apiPut(`/api/categories/${id}`, request);
export const deleteCategory = (id) => apiDelete(`/api/categories/${id}`);
