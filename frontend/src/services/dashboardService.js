import { apiGet } from "./apiClient";
export const getAdminDashboard = () => apiGet("/api/dashboard/admin");
export const getProcurementDashboard = () => apiGet("/api/dashboard/procurement");
export const getFinanceDashboard = () => apiGet("/api/dashboard/finance");
export const getWarehouseDashboard = () => apiGet("/api/dashboard/warehouse");
export const getVendorDashboard = () => apiGet("/api/dashboard/vendor");
export const getHrDashboard = () => apiGet("/api/dashboard/hr");
export const getDashboardChart = (name) => apiGet(`/api/dashboard/charts/${name}`);
