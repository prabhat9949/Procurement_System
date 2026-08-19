// RFQ API Service — wraps /api/rfqs and /api/rfq-vendors endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/** Search / list RFQs (paginated) */
export const searchRfqs = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    status: params.status,
    departmentId: params.departmentId,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "createdAt",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/rfqs${q}`);
};

/** Get a single RFQ by ID */
export const getRfq = (id) => apiGet(`/api/rfqs/${id}`);

/** Create / generate a new RFQ from an approved purchase request */
export const createRfq = (body) => apiPost("/api/rfqs", body);

/** Generate RFQ with explicit PR ID */
export const generateRfq = (purchaseRequestId, body) =>
  apiPost(`/api/rfqs/${purchaseRequestId}/generate`, body);

/** Update an RFQ */
export const updateRfq = (id, body) => apiPut(`/api/rfqs/${id}`, body);

/** Delete an RFQ */
export const deleteRfq = (id) => apiDelete(`/api/rfqs/${id}`);

/** Open an RFQ for vendor bidding */
export const openRfq = (id) => apiPost(`/api/rfqs/${id}/open`);

/** Close an RFQ (stop accepting bids) */
export const closeRfq = (id) => apiPost(`/api/rfqs/${id}/close`);

/** Cancel an RFQ */
export const cancelRfq = (id) => apiPost(`/api/rfqs/${id}/cancel`);

/** Invite a vendor to an RFQ */
export const inviteVendorToRfq = (rfqId, body) =>
  apiPost(`/api/rfqs/${rfqId}/vendors`, body);

/** Remove a vendor from an RFQ */
export const removeVendorFromRfq = (rfqId, vendorId) =>
  apiDelete(`/api/rfqs/${rfqId}/vendors/${vendorId}`);

/** Get vendors invited to an RFQ */
export const getRfqVendors = (rfqId, page = 0, size = 20) =>
  apiGet(`/api/rfqs/${rfqId}/vendors?page=${page}&size=${size}`);
