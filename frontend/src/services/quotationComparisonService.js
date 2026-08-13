import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getQuotationComparisons = (filters = {}) => apiGet(withQuery("/api/quotation-comparisons", filters));
export const createQuotationComparison = (request) => apiPost("/api/quotation-comparisons", request);
export const recommendQuotationComparison = (id, request) => apiPost(`/api/quotation-comparisons/${id}/recommend`, request);
export const approveQuotationComparison = (id, request) => apiPost(`/api/quotation-comparisons/${id}/approve`, request);
export const rejectQuotationComparison = (id, request) => apiPost(`/api/quotation-comparisons/${id}/reject`, request);
