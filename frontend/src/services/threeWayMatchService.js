import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getThreeWayMatches = (filters = {}) => apiGet(withQuery("/api/three-way-matches", filters));
export const getThreeWayMatch = (id) => apiGet(`/api/three-way-matches/${id}`);
export const createThreeWayMatch = (request) => apiPost("/api/three-way-matches", request);
export const generateThreeWayMatch = (id) => apiPost(`/api/three-way-matches/${id}/generate`);
export const approveThreeWayMatch = (id) => apiPost(`/api/three-way-matches/${id}/approve`);
export const rejectThreeWayMatch = (id) => apiPost(`/api/three-way-matches/${id}/reject`);
export const getThreeWayMatchLines = (filters = {}) => apiGet(withQuery("/api/three-way-match-lines", filters));
