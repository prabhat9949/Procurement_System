import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getInvoices = (filters = {}) => apiGet(withQuery("/api/invoices", filters));
export const getInvoice = (id) => apiGet(`/api/invoices/${id}`);
export const createInvoice = (request) => apiPost("/api/invoices", request);
export const getInvoiceLines = (id) => apiGet(`/api/invoices/${id}/lines`);
export const matchInvoice = (id, request = {}) => apiPost(`/api/invoices/${id}/match`, request);
export const approveInvoice = (id, request = {}) => apiPost(`/api/invoices/${id}/approve`, request);
