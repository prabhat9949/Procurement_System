import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getEmployees = (filters = {}) => apiGet(withQuery("/api/employees", filters));
export const getEmployee = (id) => apiGet(`/api/employees/${id}`);
export const createEmployee = (request) => apiPost("/api/employees", request);
export const updateEmployee = (id, request) => apiPut(`/api/employees/${id}`, request);
export const deleteEmployee = (id) => apiDelete(`/api/employees/${id}`);
export const getDepartments = () => apiGet("/api/departments");
export const getCostCenters = (filters = {}) => apiGet(withQuery("/api/cost-centers", filters));
