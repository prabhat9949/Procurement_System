import { apiGet } from "./apiClient";
import { withQuery } from "./serviceUtils";
export const getAuditLogs = (filters = {}) => apiGet(withQuery("/api/audit-logs", filters));
