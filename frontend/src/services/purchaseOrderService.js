// Purchase Order API Service — wraps /api/purchase-orders endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/** Search / list purchase orders (paginated) */
export const searchPurchaseOrders = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    vendorId: params.vendorId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "orderDate",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/purchase-orders${q}`);
};

/** Get purchase orders linked to a specific purchase request */
export const getPurchaseOrdersByRequest = (purchaseRequestId, page = 0, size = 5) =>
  apiGet(`/api/purchase-orders/by-request/${purchaseRequestId}?page=${page}&size=${size}`);

/** Get a single purchase order by ID */
export const getPurchaseOrder = (id) =>
  apiGet(`/api/purchase-orders/${id}`);

/** Generate a purchase order from a quotation comparison */
export const generatePurchaseOrder = (comparisonId, body) =>
  apiPost(`/api/purchase-orders/generate/${comparisonId}`, body);

/** Create a purchase order */
export const createPurchaseOrder = (body) =>
  apiPost("/api/purchase-orders", body);

/** Update a purchase order */
export const updatePurchaseOrder = (id, body) =>
  apiPut(`/api/purchase-orders/${id}`, body);

/** Delete a purchase order */
export const deletePurchaseOrder = (id) =>
  apiDelete(`/api/purchase-orders/${id}`);

/** Send PO to vendor */
export const sendPurchaseOrder = (id) =>
  apiPost(`/api/purchase-orders/${id}/send`);

/** Vendor acknowledges PO */
export const acknowledgePurchaseOrder = (id) =>
  apiPost(`/api/purchase-orders/${id}/acknowledge`);

/** Cancel a PO */
export const cancelPurchaseOrder = (id) =>
  apiPost(`/api/purchase-orders/${id}/cancel`);

/** Close a PO (after delivery + payment) */
export const closePurchaseOrder = (id) =>
  apiPost(`/api/purchase-orders/${id}/close`);

/** Get PO history */
export const getPurchaseOrderHistory = (id, page = 0, size = 20) =>
  apiGet(`/api/purchase-orders/${id}/history?page=${page}&size=${size}`);

/** Add attachment to PO */
export const addPurchaseOrderAttachment = (id, body) =>
  apiPost(`/api/purchase-orders/${id}/attachments`, body);

/** Get PO attachments */
export const getPurchaseOrderAttachments = (id, page = 0, size = 20) =>
  apiGet(`/api/purchase-orders/${id}/attachments?page=${page}&size=${size}`);
