import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getProducts = (filters = {}) => apiGet(withQuery("/api/products", filters));
export const getProduct = (id) => apiGet(`/api/products/${id}`);
export const createProduct = (request) => apiPost("/api/products", request);
export const updateProduct = (id, request) => apiPut(`/api/products/${id}`, request);
export const deleteProduct = (id) => apiDelete(`/api/products/${id}`);
