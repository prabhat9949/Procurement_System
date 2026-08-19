// Audit Log API Service — wraps /api/audit-logs endpoints
import { apiGet, buildQuery } from "./apiClient";

/** Search / list audit logs (paginated) */
export const searchAuditLogs = (params = {}) => {
  const q = buildQuery({
    moduleName: params.moduleName,
    entityName: params.entityName,
    operation: params.operation,
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
    success: params.success,
    referenceNumber: params.referenceNumber,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "performedAt",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/audit-logs${q}`);
};

/** Get a single audit log by ID */
export const getAuditLog = (id) => apiGet(`/api/audit-logs/${id}`);

/** Export audit logs (returns download reference) */
export const exportAuditLogs = (params = {}) => {
  const q = buildQuery({
    moduleName: params.moduleName,
    entityName: params.entityName,
    operation: params.operation,
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
    success: params.success,
    referenceNumber: params.referenceNumber,
  });
  return apiGet(`/api/audit-logs/export${q}`);
};
