import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getGoodsReceipts = (filters = {}) => apiGet(withQuery("/api/goods-receipts", filters));
export const getGoodsReceipt = (id) => apiGet(`/api/goods-receipts/${id}`);
export const createGoodsReceipt = (request) => apiPost("/api/goods-receipts", request);
export const completeGoodsReceipt = (id) => apiPost(`/api/goods-receipts/${id}/complete`);
export const getGoodsReceiptLines = (filters = {}) => apiGet(withQuery("/api/goods-receipt-lines", filters));
export const createGoodsReceiptLine = (request) => apiPost("/api/goods-receipt-lines", request);
