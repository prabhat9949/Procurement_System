// Vendor API Service — wraps /api/vendors endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/** Search / list vendors (paginated) */
export const searchVendors = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    vendorType: params.vendorType,
    status: params.status,
    approved: params.approved,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "vendorName",
    direction: params.direction ?? "asc",
  });
  return apiGet(`/api/vendors${q}`);
};

/** Get a single vendor by ID */
export const getVendor = (id) => apiGet(`/api/vendors/${id}`);

/** Create a new vendor */
export const createVendor = (body) => apiPost("/api/vendors", body);

/** Update a vendor */
export const updateVendor = (id, body) => apiPut(`/api/vendors/${id}`, body);

/** Update vendor status / approval */
export const updateVendorStatus = (id, status, approved) =>
  apiPut(`/api/vendors/${id}/status`, { status, approved });

/** KYC decision for a vendor */
export const updateVendorKyc = (id, decision, reason) =>
  apiPut(`/api/vendors/${id}/kyc`, { decision, reason });

/** Delete a vendor */
export const deleteVendor = (id) => apiDelete(`/api/vendors/${id}`);

/* ── Vendor Portal (self-service for logged-in vendor users) ── */
export const getMyVendorProfile = () => apiGet("/api/vendor/my/profile");
export const getMyRfqs = (page = 0, size = 20) =>
  apiGet(`/api/vendor/my/rfqs?page=${page}&size=${size}`);
export const getMyQuotations = (page = 0, size = 20) =>
  apiGet(`/api/vendor/my/quotations?page=${page}&size=${size}`);
export const getMyPurchaseOrders = (page = 0, size = 20) =>
  apiGet(`/api/vendor/my/purchase-orders?page=${page}&size=${size}`);
export const submitQuotation = (rfqVendorId, body) =>
  apiPost(`/api/vendor/my/rfqs/${rfqVendorId}/quote`, body);
