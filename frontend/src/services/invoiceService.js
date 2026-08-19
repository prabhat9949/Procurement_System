// Invoice API Service — wraps /api/invoices endpoints
import { apiGet, apiPost, buildQuery } from "./apiClient";

/** Search / list invoices (paginated) */
export const searchInvoices = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    purchaseOrderId: params.purchaseOrderId,
    goodsReceiptNoteId: params.goodsReceiptNoteId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "id",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/invoices${q}`);
};

/** Get a single invoice by ID */
export const getInvoice = (id) =>
  apiGet(`/api/invoices/${id}`);

/** Create a new invoice */
export const createInvoice = (body) =>
  apiPost("/api/invoices", body);

/** Add a line item to an invoice */
export const addInvoiceLine = (invoiceId, body) =>
  apiPost(`/api/invoices/${invoiceId}/lines`, body);

/** Get invoice line items */
export const getInvoiceLines = (invoiceId, page = 0, size = 20) =>
  apiGet(`/api/invoices/${invoiceId}/lines?page=${page}&size=${size}`);

/** Perform three-way matching (PO + GRN + Invoice) */
export const matchInvoice = (invoiceId) =>
  apiPost(`/api/invoices/${invoiceId}/match`);

/** Approve an invoice */
export const approveInvoice = (invoiceId) =>
  apiPost(`/api/invoices/${invoiceId}/approve`);

/** Get invoice history */
export const getInvoiceHistory = (invoiceId, page = 0, size = 20) =>
  apiGet(`/api/invoices/${invoiceId}/history?page=${page}&size=${size}`);

/** Add invoice attachment */
export const addInvoiceAttachment = (invoiceId, fileName, filePath, fileType) =>
  apiPost(`/api/invoices/${invoiceId}/attachments?fileName=${encodeURIComponent(fileName)}&filePath=${encodeURIComponent(filePath)}&fileType=${encodeURIComponent(fileType)}`);

/** Get invoice attachments */
export const getInvoiceAttachments = (invoiceId, page = 0, size = 20) =>
  apiGet(`/api/invoices/${invoiceId}/attachments?page=${page}&size=${size}`);
