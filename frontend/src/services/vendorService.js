import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getVendors = (filters = {}) => apiGet(withQuery("/api/vendors", filters));
export const getVendor = (id) => apiGet(`/api/vendors/${id}`);
export const createVendor = (request) => apiPost("/api/vendors", request);
export const updateVendor = (id, request) => apiPut(`/api/vendors/${id}`, request);
export const deleteVendor = (id) => apiDelete(`/api/vendors/${id}`);
