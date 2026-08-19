// Notification API Service — wraps /api/notifications endpoints
import { apiGet, apiPost, buildQuery } from "./apiClient";

/** Get my notifications (paginated, sorted newest first) */
export const getMyNotifications = (page = 0, size = 20) =>
  apiGet(`/api/notifications/my?page=${page}&size=${size}`);

/** Get my unread notification count */
export const getMyUnreadCount = () =>
  apiGet("/api/notifications/my/unread-count");

/** Mark a notification as read */
export const markNotificationRead = (id) =>
  apiPost(`/api/notifications/${id}/mark-read`);

/** Archive a notification */
export const archiveNotification = (id) =>
  apiPost(`/api/notifications/${id}/archive`);

/** Get a single notification by ID */
export const getNotification = (id) =>
  apiGet(`/api/notifications/${id}`);

/** Search notifications (admin) */
export const searchNotifications = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    userId: params.userId,
    status: params.status,
    priority: params.priority,
    type: params.type,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "createdAt",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/notifications${q}`);
};
