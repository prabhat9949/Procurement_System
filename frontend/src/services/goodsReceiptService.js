// Goods Receipt (GRN) API Service — wraps /api/goods-receipts endpoints
import { apiGet, apiPost, buildQuery } from "./apiClient";

/** Search / list goods receipt notes (paginated) */
export const searchGoodsReceipts = (params = {}) => {
  const q = buildQuery({
    purchaseOrderId: params.purchaseOrderId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
  });
  return apiGet(`/api/goods-receipts${q}`);
};

/** Get a single GRN by ID */
export const getGoodsReceipt = (id) =>
  apiGet(`/api/goods-receipts/${id}`);

/** Create a new GRN */
export const createGoodsReceipt = (body) =>
  apiPost("/api/goods-receipts", body);

/** Add a line item to a GRN */
export const addGrnLine = (grnId, body) =>
  apiPost(`/api/goods-receipts/${grnId}/lines`, body);

/** Get GRN line items */
export const getGrnLines = (grnId, page = 0, size = 20) =>
  apiGet(`/api/goods-receipts/${grnId}/lines?page=${page}&size=${size}`);

/** Complete / finalize a GRN (triggers inventory update) */
export const completeGoodsReceipt = (grnId) =>
  apiPost(`/api/goods-receipts/${grnId}/complete`);
