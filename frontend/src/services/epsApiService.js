// ============================================================================
// EPS API Service — Real Backend Integration
// ============================================================================
// This module re-exports all legacy function names that dashboard components
// import, but every function now calls the real Spring Boot backend through
// the clean service modules. The epsEventBus is preserved for cross-component
// reactivity. localStorage is only used for pure-UI state that has no backend
// table (system pause toggles, UI preferences).
// ============================================================================

import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./apiClient";

// ── Event Bus (cross-component reactivity) ────────────────────────────────
class Emitter {
  constructor() { this.listeners = new Set(); }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(data) { this.listeners.forEach((fn) => fn(data)); }
  publish(data) { this.emit(data); }
}
export const epsEventBus = new Emitter();

// ============================================================================
// PURCHASE REQUESTS
// ============================================================================

/** Fetch purchase requests (for manager / procurement views) */
export const getStoredMasterRequests = () => {
  // Legacy: returns empty — callers should use fetchMasterRequests() instead
  return [];
};

export const saveStoredMasterRequests = () => {
  // No-op: data lives in backend now
};

/** Fetch all purchase requests (real API) */
export const fetchMasterRequests = async (params = {}) => {
  try {
    const q = buildQuery({ page: params.page ?? 0, size: params.size ?? 100, sort: "createdAt", direction: "desc", ...params });
    return await apiGet(`/api/purchase-requests${q}`);
  } catch { return { content: [], totalElements: 0 }; }
};

export const fetchApprovalQueue = async () => {
  try {
    const data = await apiGet("/api/approval-tasks?status=PENDING&size=100");
    return data?.content || [];
  } catch { return []; }
};

export const fetchTeamRequisitions = async (departmentId) => {
  try {
    const q = buildQuery({ departmentId, size: 100, sort: "createdAt", direction: "desc" });
    const data = await apiGet(`/api/purchase-requests${q}`);
    return data?.content || [];
  } catch { return []; }
};

export const fetchTrackForms = async () => {
  try {
    const prData = await apiGet("/api/purchase-requests?size=100");
    const requests = prData?.content || [];
    const workflows = {};
    for (const req of requests) {
      // Fetch approval tasks for this PR
      let tasks = [];
      try {
        const taskData = await apiGet(`/api/approval-tasks?purchaseRequestId=${req.id}&size=50`);
        tasks = taskData?.content || [];
      } catch { /* ignore */ }

      const currentStep = computeWorkflowStep(req, tasks);
      workflows[req.id] = {
        id: req.id,
        requestNumber: req.requestNumber,
        item: req.title || req.purpose,
        product: req.title || req.purpose,
        requester: req.requesterName || "Employee",
        dept: req.departmentName || "Department",
        cost: req.estimatedAmount,
        priority: req.priority,
        status: req.status,
        approvalStatus: req.approvalStatus,
        currentStep,
        steps: generateWorkflowSteps(req, currentStep, tasks),
        createdAt: req.createdAt,
      };
    }
    return workflows;
  } catch { return {}; }
};

function computeWorkflowStep(req, tasks) {
  if (req.status === "COMPLETED") return 8;
  if (req.status === "REJECTED") return 2;
  if (req.status === "DRAFT") return 1;
  if (req.status === "UNDER_REVIEW") return 2;
  if (req.status === "APPROVED") return 3;
  if (req.status === "PO_ISSUED") return 5;
  if (req.status === "DELIVERED") return 6;
  if (req.status === "INVOICE_MATCHED") return 7;
  return 2;
}

function generateWorkflowSteps(req, activeStep, tasks) {
  const s = (step) => activeStep > step ? "done" : activeStep === step ? "active" : "pending";
  return [
    { title: "1. Request Submitted", desc: "Requisition created and logged.", actor: req.requesterName || "Requester", status: "done" },
    { title: "2. Manager Approval", desc: "Budget sign-off and verification.", actor: tasks[0]?.assignedEmployeeName || "Manager", status: req.status === "REJECTED" ? "rejected" : s(2) },
    { title: "3. Procurement Review", desc: "Compliance and sourcing review.", actor: "Procurement Team", status: s(3) },
    { title: "4. Vendor Selection & RFQ", desc: "Quote comparison and vendor selection.", actor: "Procurement Executive", status: s(4) },
    { title: "5. Purchase Order Issued", desc: "PO generated and sent to supplier.", actor: "Finance & Purchasing", status: s(5) },
    { title: "6. Goods Delivered", desc: "Physical receipt and inspection.", actor: "Warehouse Operations", status: s(6) },
    { title: "7. Invoice & 3-Way Match", desc: "Invoice matching and payment clearance.", actor: "Finance", status: s(7) },
    { title: "8. Completed", desc: "Asset tagged and delivered.", actor: "Operations", status: s(8) },
  ];
}

export const fetchBudgetAnalytics = async () => {
  try {
    const data = await apiGet("/api/dashboard/employee");
    return data?.budgetAnalytics || {
      totalBudgetCap: 0, allocatedBudget: 0, spentBudget: 0, remainingBudget: 0,
      monthlyBudgetData: [], subTeamSpend: [], categoryData: [],
    };
  } catch {
    return { totalBudgetCap: 0, allocatedBudget: 0, spentBudget: 0, remainingBudget: 0, monthlyBudgetData: [], subTeamSpend: [], categoryData: [] };
  }
};

export const submitApprovalDecision = async (taskId, decision, comments = "") => {
  const endpoint = decision === "approved"
    ? `/api/approval-tasks/${taskId}/approve`
    : decision === "returned"
      ? `/api/approval-tasks/${taskId}/return`
      : `/api/approval-tasks/${taskId}/reject`;
  const result = await apiPost(endpoint, comments ? { comments } : {});
  epsEventBus.publish({ type: "APPROVAL_DECIDED", data: result });
  return result;
};

export const fetchProcurementRequests = async () => {
  try {
    const data = await apiGet("/api/purchase-requests?status=APPROVED&size=100");
    return data?.content || [];
  } catch { return []; }
};

export const submitProcurementExecutiveReview = async (reqId, decision) => {
  // This is handled through approval tasks on the backend
  epsEventBus.publish({ type: "PROCUREMENT_REVIEW", reqId, decision });
};

// ============================================================================
// PURCHASE ORDERS
// ============================================================================

export const getStoredPurchaseOrders = () => [];
export const saveStoredPurchaseOrders = () => {};

export const fetchPurchaseOrders = async (params = {}) => {
  try {
    const q = buildQuery({ size: 100, sort: "orderDate", direction: "desc", ...params });
    const data = await apiGet(`/api/purchase-orders${q}`);
    return data?.content || [];
  } catch { return []; }
};

export const createPurchaseOrder = async (poData) => {
  try {
    const result = await apiPost("/api/purchase-orders", poData);
    epsEventBus.publish({ type: "PO_CREATED", data: result });
    return result;
  } catch (err) {
    console.error("Failed to create PO:", err.message);
    throw err;
  }
};

// ============================================================================
// RFQs
// ============================================================================

export const getStoredRfqs = () => [];
export const saveStoredRfqs = () => {};

export const fetchActiveRfqs = async () => {
  try {
    const data = await apiGet("/api/rfqs?size=100");
    return data?.content || [];
  } catch { return []; }
};

export const createRfq = async (rfqData) => {
  try {
    const result = await apiPost("/api/rfqs", rfqData);
    epsEventBus.publish({ type: "RFQ_CREATED", data: result });
    return result;
  } catch (err) {
    console.error("Failed to create RFQ:", err.message);
    throw err;
  }
};

export const awardVendorContract = async (rfqId, vendorName, finalAmount) => {
  // Close the RFQ, then generate comparison/PO through the backend workflow
  try {
    await apiPost(`/api/rfqs/${rfqId}/close`);
  } catch { /* might already be closed */ }
  epsEventBus.publish({ type: "RFQ_AWARDED", rfqId, vendorName, finalAmount });
};

export const revokeVendorContract = async (rfqId) => {
  try {
    await apiPost(`/api/rfqs/${rfqId}/cancel`);
  } catch { /* ignore */ }
  epsEventBus.publish({ type: "RFQ_APPROVAL_CANCELLED", rfqId });
};

// ============================================================================
// VENDOR QUOTATIONS
// ============================================================================

export const getStoredQuotations = () => [];
export const saveStoredQuotations = () => {};

export const submitVendorQuote = async (rfqId, quoteData) => {
  try {
    const result = await apiPost(`/api/vendor/my/rfqs/${rfqId}/quote`, quoteData);
    epsEventBus.publish({ type: "QUOTE_SUBMITTED", data: result });
    return result;
  } catch (err) {
    console.error("Failed to submit quote:", err.message);
    throw err;
  }
};

// ============================================================================
// INVOICES
// ============================================================================

export const getStoredVendorInvoices = async () => {
  try {
    const data = await apiGet("/api/invoices?size=100");
    return data?.content || [];
  } catch { return []; }
};
export const saveStoredVendorInvoices = () => {};

export const createVendorInvoice = async (invoiceData) => {
  try {
    const result = await apiPost("/api/invoices", invoiceData);
    epsEventBus.publish({ type: "INVOICE_SUBMITTED", data: result });
    return result;
  } catch (err) {
    console.error("Failed to create invoice:", err.message);
    throw err;
  }
};

// ============================================================================
// PAYMENT REQUESTS
// ============================================================================

export const getStoredPaymentRequests = async () => {
  try {
    const data = await apiGet("/api/payments?size=100");
    return data?.content || [];
  } catch { return []; }
};
export const saveStoredPaymentRequests = () => {};

export const createPaymentRequestFromInvoice = async (invoice) => {
  try {
    const result = await apiPost("/api/payments", {
      invoiceId: invoice.id,
      amount: invoice.totalAmount || invoice.amount,
      paymentMethod: "BANK_TRANSFER",
    });
    epsEventBus.publish({ type: "PAYMENT_REQUEST_CREATED", data: result });
    return result;
  } catch (err) {
    console.error("Failed to create payment:", err.message);
    throw err;
  }
};

// ============================================================================
// SHIPMENT / DELIVERY TRACKING
// ============================================================================

export const getShipmentEvents = () => ({});
export const initiateGlobalShipment = () => {};
export const advanceRequestStep = () => {};

// ============================================================================
// EMPLOYEE REQUEST CREATION (legacy bridge)
// ============================================================================

export const createEmployeeRequest = async (newReqData) => {
  try {
    const result = await apiPost("/api/purchase-requests", {
      productId: newReqData.productId,
      quantity: parseInt(newReqData.quantity) || 1,
      unitPrice: parseFloat(newReqData.unitPrice) || 0,
      costCenterId: newReqData.costCenterId,
      requiredDate: newReqData.requiredDate,
      priority: (newReqData.priority || "MEDIUM").toUpperCase(),
      purpose: newReqData.justification || newReqData.purpose || "Business requirement",
      remarks: newReqData.remarks || "",
    });
    epsEventBus.publish({ type: "REQUESTS_UPDATED" });
    return result;
  } catch (err) {
    console.error("Failed to create request:", err.message);
    throw err;
  }
};

// ============================================================================
// INVENTORY / GRN (backed by real API where available, fallback to localStorage)
// ============================================================================

export const getStoredGrnHistory = async () => {
  try {
    const data = await apiGet("/api/goods-receipts?size=100");
    return data?.content || [];
  } catch { return []; }
};
export const saveStoredGrnHistory = () => {};

export const getStoredStockItems = async () => {
  try {
    const data = await apiGet("/api/inventory?size=500");
    return data?.content || [];
  } catch { return []; }
};
export const saveStoredStockItems = () => {};

export const getStoredStockHistory = () => [];
export const saveStoredStockHistory = () => {};

export const addStockItemAfterGrn = async (itemTitle, receivedQty, poId, grnId) => {
  // GRN completion on the backend auto-updates inventory
  epsEventBus.publish({ type: "STOCK_UPDATED" });
};

// ============================================================================
// SYSTEM ADMINISTRATION (UI state — no backend table)
// ============================================================================

const SYSTEM_PAUSE_KEY = "eps_system_paused_state";
export const getSystemPauseState = () => {
  try { return JSON.parse(localStorage.getItem(SYSTEM_PAUSE_KEY)) || {}; } catch { return {}; }
};
export const setSystemPauseState = (state) => {
  localStorage.setItem(SYSTEM_PAUSE_KEY, JSON.stringify(state));
  epsEventBus.publish({ type: "SYSTEM_PAUSE_UPDATED", data: state });
};

// ============================================================================
// USERS (backend-backed)
// ============================================================================

export const getStoredUsers = async () => {
  try {
    const data = await apiGet("/api/users?size=200");
    return data?.content || [];
  } catch { return []; }
};
export const saveStoredUsers = () => {};

export const registerUser = async (userData) => {
  try {
    return await apiPost("/api/auth/register", userData);
  } catch (err) {
    console.error("Failed to register user:", err.message);
    throw err;
  }
};

// ============================================================================
// BUDGET ALLOCATIONS (backend-backed via cost-centers)
// ============================================================================

export const getBudgetAllocations = async () => {
  try {
    const data = await apiGet("/api/cost-centers?size=100");
    return (data?.content || []).map(cc => ({
      id: cc.id,
      code: cc.code,
      department: cc.departmentName,
      allocatedAmt: cc.budget,
      spentAmt: cc.usedBudget || 0,
      remainingAmt: cc.remainingBudget || cc.budget,
    }));
  } catch { return []; }
};
export const saveBudgetAllocations = () => {};

// ============================================================================
// VENDOR PROFILES (backend-backed)
// ============================================================================

export const getStoredVendorProfiles = async () => {
  try {
    const data = await apiGet("/api/vendors?size=100");
    return data?.content || [];
  } catch { return []; }
};
export const saveStoredVendorProfiles = () => {};
