import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { withQuery } from "./serviceUtils";

export const getPurchaseRequests = (filters = {}) =>
  apiGet(withQuery("/api/purchase-requests", filters));
export const getPurchaseRequest = (id) => apiGet(`/api/purchase-requests/${id}`);
export const createPurchaseRequest = (request) => apiPost("/api/purchase-requests", request);
export const updatePurchaseRequest = (id, request) => apiPut(`/api/purchase-requests/${id}`, request);
export const deletePurchaseRequest = (id) => apiDelete(`/api/purchase-requests/${id}`);
export const submitPurchaseRequest = (id) => apiPost(`/api/purchase-requests/${id}/submit`);
export const getPurchaseRequestLines = (filters = {}) =>
  apiGet(withQuery("/api/purchase-request-lines", filters));
export const createPurchaseRequestLine = (line) => apiPost("/api/purchase-request-lines", line);

// The backend records approval progression; the UI must display that data rather
// than deriving a fabricated workflow from a local request shape.
export const getRequestApprovalHistory = (purchaseRequestId) =>
  apiGet(withQuery("/api/approval-histories", { purchaseRequestId }));
