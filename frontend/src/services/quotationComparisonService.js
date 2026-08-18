// Quotation Comparison API Service — wraps /api/quotation-comparisons endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/** Search / list quotation comparisons (paginated) */
export const searchComparisons = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    method: params.method,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "createdAt",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/quotation-comparisons${q}`);
};

/** Get a single comparison by ID */
export const getComparison = (id) =>
  apiGet(`/api/quotation-comparisons/${id}`);

/** Create a new comparison */
export const createComparison = (body) =>
  apiPost("/api/quotation-comparisons", body);

/** Update a comparison */
export const updateComparison = (id, body) =>
  apiPut(`/api/quotation-comparisons/${id}`, body);

/** Delete a comparison */
export const deleteComparison = (id) =>
  apiDelete(`/api/quotation-comparisons/${id}`);

/** Generate comparison analysis */
export const generateComparison = (id) =>
  apiPost(`/api/quotation-comparisons/${id}/generate`);

/** Recommend a specific quotation in a comparison */
export const recommendQuotation = (comparisonId, quotationId) =>
  apiPost(`/api/quotation-comparisons/${comparisonId}/recommend/${quotationId}`);

/** Approve a comparison (finalizes vendor selection) */
export const approveComparison = (id) =>
  apiPost(`/api/quotation-comparisons/${id}/approve`);

/** Reject a comparison */
export const rejectComparison = (id) =>
  apiPost(`/api/quotation-comparisons/${id}/reject`);
