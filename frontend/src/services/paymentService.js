// Payment API Service — wraps /api/payments endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/** Search / list payments (paginated) */
export const searchPayments = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    vendorId: params.vendorId,
    status: params.status,
    paymentMethod: params.paymentMethod,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "paymentDate",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/payments${q}`);
};

/** Get a single payment by ID */
export const getPayment = (id) => apiGet(`/api/payments/${id}`);

/** Create a new payment */
export const createPayment = (body) => apiPost("/api/payments", body);

/** Update a payment */
export const updatePayment = (id, body) => apiPut(`/api/payments/${id}`, body);

/** Delete a payment */
export const deletePayment = (id) => apiDelete(`/api/payments/${id}`);

/** Approve a payment */
export const approvePayment = (id) => apiPost(`/api/payments/${id}/approve`);

/** Process a payment */
export const processPayment = (id) => apiPost(`/api/payments/${id}/process`);

/** Complete a payment */
export const completePayment = (id) => apiPost(`/api/payments/${id}/complete`);

/** Fail a payment */
export const failPayment = (id) => apiPost(`/api/payments/${id}/fail`);

/** Cancel a payment */
export const cancelPayment = (id) => apiPost(`/api/payments/${id}/cancel`);

/** Add payment allocation */
export const addPaymentAllocation = (id, body) =>
  apiPost(`/api/payments/${id}/allocations`, body);

/** Get payment allocations */
export const getPaymentAllocations = (id, page = 0, size = 20) =>
  apiGet(`/api/payments/${id}/allocations?page=${page}&size=${size}`);

/** Get payment history */
export const getPaymentHistory = (id, page = 0, size = 20) =>
  apiGet(`/api/payments/${id}/history?page=${page}&size=${size}`);
