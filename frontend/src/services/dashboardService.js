// Dashboard API Service — wraps /api/dashboard endpoints
import { apiGet } from "./apiClient";

/** Admin dashboard KPIs */
export const getAdminDashboard = () => apiGet("/api/dashboard/admin");

/** Procurement dashboard KPIs */
export const getProcurementDashboard = () => apiGet("/api/dashboard/procurement");

/** Finance dashboard KPIs */
export const getFinanceDashboard = () => apiGet("/api/dashboard/finance");

/** Warehouse dashboard KPIs */
export const getWarehouseDashboard = () => apiGet("/api/dashboard/warehouse");

/** Vendor dashboard KPIs */
export const getVendorDashboard = () => apiGet("/api/dashboard/vendor");

/** HR dashboard KPIs */
export const getHrDashboard = () => apiGet("/api/dashboard/hr");

/** Employee dashboard KPIs */
export const getEmployeeDashboard = () => apiGet("/api/dashboard/employee");

/* ── Chart endpoints ──────────────────────────────────── */
export const getSpendChart = () => apiGet("/api/dashboard/charts/spend");
export const getPrChart = () => apiGet("/api/dashboard/charts/pr");
export const getRfqChart = () => apiGet("/api/dashboard/charts/rfq");
export const getPoChart = () => apiGet("/api/dashboard/charts/po");
export const getGrnChart = () => apiGet("/api/dashboard/charts/grn");
export const getInvoiceChart = () => apiGet("/api/dashboard/charts/invoices");
export const getPaymentChart = () => apiGet("/api/dashboard/charts/payments");
export const getVendorChart = () => apiGet("/api/dashboard/charts/vendors");
export const getInventoryChart = () => apiGet("/api/dashboard/charts/inventory");
