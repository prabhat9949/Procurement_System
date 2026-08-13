import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getApprovalTasks = (filters = {}) => apiGet(withQuery("/api/approval-tasks", filters));
export const getApprovalTask = (id) => apiGet(`/api/approval-tasks/${id}`);
export const approveApprovalTask = (id, comments = "") => apiPost(`/api/approval-tasks/${id}/approve`, { comments });
export const rejectApprovalTask = (id, comments = "") => apiPost(`/api/approval-tasks/${id}/reject`, { comments });
export const returnApprovalTask = (id, comments = "") => apiPost(`/api/approval-tasks/${id}/return`, { comments });
export const getApprovalHistories = (filters = {}) => apiGet(withQuery("/api/approval-histories", filters));
