// Approval Task API Service — wraps /api/approval-tasks endpoints
import { apiGet, apiPost, buildQuery } from "./apiClient";

/**
 * Search approval tasks (paginated).
 * For EMPLOYEE role, backend returns only tasks related to own purchase requests.
 * For managers, returns tasks assigned to them.
 */
export const searchApprovalTasks = (params = {}) => {
  const q = buildQuery({
    purchaseRequestId: params.purchaseRequestId,
    assignedEmployeeId: params.assignedEmployeeId,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "assignedDate",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/approval-tasks${q}`);
};

/** Get a single approval task by ID */
export const getApprovalTask = (id) =>
  apiGet(`/api/approval-tasks/${id}`);

/** Approve an approval task */
export const approveTask = (id, comments = "") =>
  apiPost(`/api/approval-tasks/${id}/approve`, comments ? { comments } : {});

/** Reject an approval task */
export const rejectTask = (id, comments = "") =>
  apiPost(`/api/approval-tasks/${id}/reject`, comments ? { comments } : {});

/** Return an approval task (send back for correction) */
export const returnTask = (id, comments = "") =>
  apiPost(`/api/approval-tasks/${id}/return`, comments ? { comments } : {});
