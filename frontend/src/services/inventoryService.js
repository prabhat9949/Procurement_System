import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getInventory = (filters = {}) => apiGet(withQuery("/api/inventory", filters));
export const getLowStockInventory = () => apiGet("/api/inventory/low-stock");
export const getOutOfStockInventory = () => apiGet("/api/inventory/out-of-stock");
export const getReorderInventory = () => apiGet("/api/inventory/reorder");
export const createInventory = (request) => apiPost("/api/inventory", request);
export const updateInventory = (id, request) => apiPut(`/api/inventory/${id}`, request);
export const deleteInventory = (id) => apiDelete(`/api/inventory/${id}`);
