// Purchase Request API Service — wraps /api/purchase-requests endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/**
 * Search / list purchase requests (paginated).
 * The backend auto-filters for EMPLOYEE role (only own requests).
 */
export const searchPurchaseRequests = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    requesterId: params.requesterId,
    departmentId: params.departmentId,
    costCenterId: params.costCenterId,
    priority: params.priority,
    status: params.status,
    approvalStatus: params.approvalStatus,
    requiredDateFrom: params.requiredDateFrom,
    requiredDateTo: params.requiredDateTo,
    createdDateFrom: params.createdDateFrom,
    createdDateTo: params.createdDateTo,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "createdAt",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/purchase-requests${q}`);
};

/** Get a single purchase request by ID */
export const getPurchaseRequest = (id) =>
  apiGet(`/api/purchase-requests/${id}`);

/** Create a new purchase request (draft) */
export const createPurchaseRequest = (body) =>
  apiPost("/api/purchase-requests", body);

/** Update an existing draft purchase request */
export const updatePurchaseRequest = (id, body) =>
  apiPut(`/api/purchase-requests/${id}`, body);

/** Delete a draft purchase request */
export const deletePurchaseRequest = (id) =>
  apiDelete(`/api/purchase-requests/${id}`);

/** Submit a draft purchase request for approval (triggers budget check + workflow) */
export const submitPurchaseRequest = (id) =>
  apiPost(`/api/purchase-requests/${id}/submit`);

/** Cancel an in-progress purchase request */
export const cancelPurchaseRequest = (id) =>
  apiPost(`/api/purchase-requests/${id}/cancel`);
