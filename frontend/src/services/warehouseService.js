import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
export const getWarehouses = () => apiGet("/api/warehouses");
export const getWarehouse = (id) => apiGet(`/api/warehouses/${id}`);
export const createWarehouse = (request) => apiPost("/api/warehouses", request);
export const updateWarehouse = (id, request) => apiPut(`/api/warehouses/${id}`, request);
export const deleteWarehouse = (id) => apiDelete(`/api/warehouses/${id}`);
