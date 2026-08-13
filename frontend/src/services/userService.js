import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getUsers = (filters = {}) => apiGet(withQuery("/api/users", filters));
export const getUser = (id) => apiGet(`/api/users/${id}`);
export const createUser = (request) => apiPost("/api/users", request);
export const updateUser = (id, request) => apiPut(`/api/users/${id}`, request);
export const deleteUser = (id) => apiDelete(`/api/users/${id}`);
export const getRoles = () => apiGet("/api/roles");
export const getPermissions = () => apiGet("/api/permissions");
