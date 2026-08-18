// Centralized EPS API client.
// Base URL comes from VITE_API_BASE_URL (or falls back to the local dev backend).
// Every request attaches the JWT stored at login (`eps_access_token`) and maps
// backend errors to readable messages. All dashboard/CRUD code should use this
// instead of hardcoded fetch calls or fake/localStorage data.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getBaseUrl = () => API_BASE_URL;

export const getToken = () => localStorage.getItem("eps_access_token") || "";

const STATUS_MESSAGES = {
  400: "The request was invalid. Please check the entered values.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record was not found.",
  409: "A record with the same details already exists.",
  422: "Validation failed. Please review the highlighted fields.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on the server. Please try again.",
  503: "The service is temporarily unavailable. Please try again later.",
};

/**
 * Core fetch wrapper. Throws Error with a friendly message on failure.
 * Returns the parsed JSON body on success.
 */
export const apiFetch = async (path, { method = "GET", body, headers = {}, auth = true } = {}) => {
  const requestHeaders = { ...headers };
  // Only force JSON when the body isn't FormData (file uploads must set their own content type).
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (auth) requestHeaders.Authorization = `Bearer ${getToken()}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : body,
    });
  } catch {
    throw new Error("Unable to reach the backend server. Please check that it is running.");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      (payload?.errors ? Object.values(payload.errors).join(", ") : null) ||
      STATUS_MESSAGES[response.status] ||
      `Request failed (${response.status}).`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  // Backend wraps data as { success, message, data } via ApiResponse.
  if (payload && typeof payload === "object" && "data" in payload && "success" in payload) {
    return payload.data;
  }
  return payload;
};

/**
 * Build a URL query string from an object, filtering out null/undefined values.
 * Example: buildQuery({ page: 0, size: 20, keyword: null }) => "?page=0&size=20"
 */
export const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
};

export const apiGet = (path, options) => apiFetch(path, { ...options, method: "GET" });
export const apiPost = (path, body, options) =>
  apiFetch(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) =>
  apiFetch(path, { ...options, method: "PUT", body });
export const apiPatch = (path, body, options) =>
  apiFetch(path, { ...options, method: "PATCH", body });
export const apiDelete = (path, options) => apiFetch(path, { ...options, method: "DELETE" });
