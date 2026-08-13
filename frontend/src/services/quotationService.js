import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getVendorQuotations = (filters = {}) => apiGet(withQuery("/api/vendor-quotations", filters));
export const getVendorQuotation = (id) => apiGet(`/api/vendor-quotations/${id}`);
export const createVendorQuotation = (request) => apiPost("/api/vendor-quotations", request);
export const submitVendorQuotation = (id) => apiPost(`/api/vendor-quotations/${id}/submit`);
export const withdrawVendorQuotation = (id) => apiPost(`/api/vendor-quotations/${id}/withdraw`);
export const getVendorQuotationLines = (filters = {}) => apiGet(withQuery("/api/vendor-quotation-lines", filters));
export const createVendorQuotationLine = (request) => apiPost("/api/vendor-quotation-lines", request);
