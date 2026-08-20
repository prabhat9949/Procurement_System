// Purchase Request API Service — wraps /api/purchase-requests endpoints
import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

/**
 * Search / list purchase requests (paginated).
 * The backend auto-filters for EMPLOYEE role (only own requests).
 */
export const searchPurchaseRequests = (params = {}) => {
  const q = buildQuery({
    keyword: params.keyword,
    requesterId: params.requesterId,
    departmentId: params.departmentId,
    costCenterId: params.costCenterId,
    priority: params.priority,
    status: params.status,
    approvalStatus: params.approvalStatus,
    requiredDateFrom: params.requiredDateFrom,
    requiredDateTo: params.requiredDateTo,
    createdDateFrom: params.createdDateFrom,
    createdDateTo: params.createdDateTo,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: params.sort ?? "createdAt",
    direction: params.direction ?? "desc",
  });
  return apiGet(`/api/purchase-requests${q}`);
import {
  createEmployeeRequest,
  submitApprovalDecision,
  epsEventBus
} from "./epsApiService";

const LOCAL_STORAGE_KEY = "eps_enterprise_master_requests";

const INITIAL_MOCK_REQUESTS = [
  {
    id: "REQ-2026-8921",
    product: "MacBook Pro M3 Max 64GB",
    category: "Hardware & IT",
    vendor: "Apple Business Direct",
    qty: 1,
    cost: "₹3,899.00",
    numericCost: 3899.00,
    priority: "Urgent",
    status: "pending",
    date: "2026-07-24",
    justification: "Required for high-performance mobile software compilation and local AI model testing.",
    deliveryDate: "2026-08-01",
    approver: "Sarah Jenkins (VP Eng)",
    currentStep: 2,
  },
  {
    id: "REQ-2026-8894",
    product: "Figma Enterprise License (20 Seats)",
    category: "Software & Subscriptions",
    vendor: "Figma Inc.",
    qty: 20,
    cost: "₹4,500.00",
    numericCost: 4500.00,
    priority: "High",
    status: "approved",
    date: "2026-07-20",
    justification: "Annual renewal of UX/UI design team workspace licenses.",
    deliveryDate: "2026-07-28",
    approver: "Sarah Jenkins (VP Eng)",
    currentStep: 6,
  },
  {
    id: "REQ-2026-8850",
    product: "Ergonomic Office Chairs (x5)",
    category: "Office Supplies",
    vendor: "Herman Miller Direct",
    qty: 5,
    cost: "₹1,250.00",
    numericCost: 1250.00,
    priority: "Medium",
    status: "completed",
    date: "2026-07-15",
    justification: "Replacement seating for new engineering pods.",
    deliveryDate: "2026-07-22",
    approver: "Marcus Vance (Ops Mgr)",
    currentStep: 8,
  }
];

export const getStoredRequests = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const activeUserStr = localStorage.getItem("eps_active_user");
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);
        if (activeUser.role === "employee") {
          return parsed.filter(r => r.email === activeUser.email || r.requester === activeUser.name);
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load requests from localStorage", e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REQUESTS));
  return INITIAL_MOCK_REQUESTS;
};

/** Get a single purchase request by ID */
export const getPurchaseRequest = (id) =>
  apiGet(`/api/purchase-requests/${id}`);

/** Create a new purchase request (draft) */
export const createPurchaseRequest = (body) =>
  apiPost("/api/purchase-requests", body);

/** Update an existing draft purchase request */
export const updatePurchaseRequest = (id, body) =>
  apiPut(`/api/purchase-requests/${id}`, body);

/** Delete a draft purchase request */
export const deletePurchaseRequest = (id) =>
  apiDelete(`/api/purchase-requests/${id}`);

/** Submit a draft purchase request for approval (triggers budget check + workflow) */
export const submitPurchaseRequest = (id) =>
  apiPost(`/api/purchase-requests/${id}/submit`);

/** Cancel an in-progress purchase request */
export const cancelPurchaseRequest = (id) =>
  apiPost(`/api/purchase-requests/${id}/cancel`);
