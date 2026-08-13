import { apiGet, apiPost } from "./apiClient";
export const login = (credentials) => apiPost("/api/auth/login", credentials, { auth: false });
export const getCurrentUser = () => apiGet("/api/auth/me");
export const changePassword = (request) => apiPost("/api/auth/change-password", request);
export const logout = () => apiPost("/api/auth/logout");
