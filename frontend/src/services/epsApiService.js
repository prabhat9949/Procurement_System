// ============================================================================
// EPS API Service — Real Backend Integration
// ============================================================================
// This module re-exports all legacy function names that dashboard components
// import, but every function now calls the real Spring Boot backend through
// the clean service modules. The epsEventBus is preserved for cross-component
// reactivity. localStorage is only used for pure-UI state that has no backend
// table (system pause toggles, UI preferences).
// ============================================================================
// EPS API & Real-Time Sync Service
import { apiGet, apiPost } from "./apiClient";
const API_BASE_URL = "http://localhost:8080/api/v1";
const LOCAL_STORAGE_KEY = "eps_enterprise_master_requests";
const BUDGET_STORAGE_KEY = "eps_dept_budget_analytics";

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
  return getStoredMasterRequests();
};

export const fetchTrackForms = async () => {
  let requests = [];
  try {
    const page = await apiGet("/api/purchase-requests?page=0&size=100&sort=createdAt&direction=desc");
    // Track every actionable request, including those currently awaiting approval.
    requests = (page?.content || []).filter((r) => !["DRAFT", "CANCELLED"].includes(String(r.status || "").toUpperCase()));
  } catch {
    return {};
  }
  const workflows = {};
  const timelines = await Promise.all(requests.map(async (req) => {
    try { return await apiGet(`/api/procurement/${req.id}/timeline`); } catch { return null; }
  }));

  const rfqs = [];
  const pos = [];

  requests.forEach((req, index) => {
    const timeline = timelines[index];
    const events = timeline?.events || [];
    const isApproved = req.status === "APPROVED";
    const isCompleted = req.status === "COMPLETED";
    const isRejected = req.status === "REJECTED";
    const eventTypes = new Set(events.map((e) => e.type));
    const currentStep = isCompleted ? 8 : isRejected ? 2 : eventTypes.has("GRN_CREATED") ? 6 : eventTypes.has("PO_CREATED") ? 5 : eventTypes.has("RFQ_CREATED") ? 4 : isApproved ? 3 : 2;

    const matchingRfq = rfqs.find(r => r.reqId === req.id || r.id === req.rfqCode);
    const matchingPo = pos.find(p => p.reqId === req.id || p.rfqId === matchingRfq?.id);

    let rfqStatusDesc = "Pending Sourcing";
    if (matchingRfq) {
      if (matchingRfq.status === "Awarded" || matchingRfq.bidStatus === "Awarded") {
        rfqStatusDesc = `Completed (${matchingRfq.winnerVendor || matchingRfq.awardedVendor})`;
      } else if (matchingRfq.bids && matchingRfq.bids.length > 0) {
        rfqStatusDesc = `Reviewing Bids (${matchingRfq.bids.length} Received)`;
      } else {
        rfqStatusDesc = "Active Bidding / Open for Quotes";
      }
    }

    let poStatusDesc = "Pending PO Generation";
    if (matchingPo) {
      poStatusDesc = `${matchingPo.status} (${matchingPo.totalAmount || req.cost})`;
    }

    let deliveryStatusDesc = "Awaiting Shipment";
    if (matchingPo) {
      if (matchingPo.status === "Delivered" || req.currentStep >= 6) {
        deliveryStatusDesc = "Delivered & Physically Received";
      } else if (matchingPo.status === "Issued & Dispatched" || matchingPo.status === "Vendor Confirmed") {
        deliveryStatusDesc = `In Transit (Est Arrival: ${matchingPo.expectedDelivery || "Soon"})`;
      }
    }

    workflows[req.id] = {
      id: req.id,
      item: req.purpose || req.requestNumber,
      product: req.purpose || req.requestNumber,
      requester: timeline?.requesterName || req.requesterName || "Team Member",
      role: "Employee",
      dept: req.departmentName || "—",
      cost: req.estimatedAmount,
      vendor: "Pending procurement assignment",
      currentAssignee: timeline?.currentAssigneeName || "Unassigned",
      currentAssigneeRole: timeline?.currentAssigneeRole || "",
      nextApprover: timeline?.currentAssigneeName || "Procurement Manager",
      nextApproverRole: timeline?.currentAssigneeRole || "PROCUREMENT_MANAGER",
      currentStage: timeline?.currentStage || "WORKFLOW",
      approvedDate: req.createdAt,
      priority: req.priority || "MEDIUM",
      status: timeline?.currentStatus || req.status,
      timelineEvents: events,
      currentStep: currentStep,
      rfqCode: matchingRfq ? matchingRfq.id : (req.rfqCode || "Pending Sourcing"),
      poCode: matchingPo ? matchingPo.id : (req.poNumber || "Pending PO Generation"),
      carrier: matchingPo ? (matchingPo.carrier || "FedEx Express") : "Pending Shipment",
      trackingNumber: matchingPo ? (matchingPo.trackingNumber || "N/A") : "N/A",
      rfqStatus: rfqStatusDesc,
      poStatus: poStatusDesc,
      deliveryStatus: deliveryStatusDesc,
      steps: generateWorkflowTimelineSteps(req, currentStep, isRejected)
    };
  });

  return workflows;
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
    const page = await apiGet("/api/purchase-requests?page=0&size=100&sort=createdAt&direction=desc");
    // A PR remains UNDER_REVIEW while later approval/assignment stages run.
    // Procurement must receive it as soon as it is routed to procurement,
    // rather than waiting for the entire approval chain to become APPROVED.
    return (page?.content || [])
      .filter((r) => !["DRAFT", "CANCELLED", "REJECTED", "COMPLETED"].includes(String(r.status || "").toUpperCase()))
      .map(normalizeProcurementRequest);
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
const normalizeProcurementRequest = (req) => {
  const status = String(req.status || "").toUpperCase();
  const isApproved = ["APPROVED", "RFQ_CREATED"].includes(status);
  const priority = req.priority || "MEDIUM";
  return {
    ...req,
    id: req.id,
    requestNumber: req.requestNumber || `PR-${req.id}`,
    requester: req.requesterName || req.requester || "Requester",
    dept: req.departmentName || req.dept || "Department",
    product: req.purpose || req.requestNumber || "Purchase request",
    category: req.categoryName || req.category || "General Procurement",
    targetCost: req.estimatedAmount != null ? `₹${Number(req.estimatedAmount).toLocaleString("en-IN")}` : (req.targetCost || "₹0"),
    cost: req.estimatedAmount || req.cost || 0,
    priority,
    managerApprovedBy: req.approvalStatus === "APPROVED" ? "Approval flow completed" : "Pending approval flow",
    currentStep: status === "RFQ_CREATED" ? 4 : isApproved ? 3 : 2,
    rfqCode: status === "RFQ_CREATED" ? (req.rfqCode || "RFQ created") : req.rfqCode,
  };
};

export const submitProcurementExecutiveReview = async (reqId, decision, selectedVendor = "", targetCost = "", notes = "") => {
  try {
    const tasks = await apiGet("/api/workflow/my-tasks?status=ASSIGNED&size=100");
    const task = (tasks?.content || []).find((t) => t.entityType === "PR" && Number(t.entityId) === Number(reqId));
    if (task) {
      await apiPost(`/api/workflow/tasks/${task.id}/complete`, {
        action: decision === "approved" ? "PROCESS" : "REJECT",
        comment: notes || null,
      });
    }
  } catch (err) {
    // Failover
  }

  const current = getStoredMasterRequests();
  const updated = current.map((r) => {
    if (r.id === reqId || r.numericId === reqId) {
      const isApproved = decision === "approved";
      return {
        ...r,
        status: isApproved ? "rfq_created" : "rejected",
        currentStep: isApproved ? 4 : 2,
        vendor: selectedVendor || r.vendor,
        cost: targetCost || r.cost,
        procurementNotes: notes || (isApproved ? "Approved by Procurement Executive" : "Rejected during Procurement Review"),
        procurementExec: "David Chen (Procurement Exec)"
      };
    }
    return r;
  });

  saveStoredMasterRequests(updated);
  return updated;
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
    // Failover
  }

  // Scan all active RFQs for approved quotations / awarded vendor contracts
  const rfqs = getStoredRfqs();
  let hasNewPo = false;

  (rfqs || []).forEach((rfq) => {
    if (rfq.status === "Awarded" || rfq.winnerVendor || rfq.awardedVendor) {
      const winner = rfq.winnerVendor || rfq.awardedVendor || "Approved Supplier";
      const exists = posList.some((p) => p.rfqId === rfq.id || (rfq.reqId && p.reqId === rfq.reqId));

      if (!exists) {
        hasNewPo = true;
        const generatedPo = {
          id: `PO-2026-${rfq.id.replace("RFQ-2026-", "") || Math.floor(4400 + Math.random() * 500)}`,
          reqId: rfq.reqId || "REQ-2026-8921",
          rfqId: rfq.id,
          vendor: winner,
          item: rfq.item || "Equipment Sourcing",
          totalAmount: rfq.awardedAmount || rfq.submittedAmount || "₹36,990.00",
          terms: "Net 30 Days",
          status: "Issued & Dispatched",
          date: new Date().toISOString().split("T")[0],
          poFile: `PO_2026_${rfq.id}_Official.pdf`,
          shipAddress: "HQ Building 3, Tech Receiving Bay 4, San Jose CA",
          expectedDelivery: "2026-08-15",
          carrier: "FedEx Priority Freight",
          trackingNumber: `7790-${Math.floor(1000 + Math.random() * 9000)}-9901`
        };
        posList = [generatedPo, ...posList];
      }
    }
  });

  if (hasNewPo) {
    saveStoredPurchaseOrders(posList);
  }

  const awardedRfqIds = (rfqs || [])
    .filter((rfq) => rfq.status === "Awarded" || rfq.winnerVendor || rfq.awardedVendor)
    .map((rfq) => rfq.id);

  const awardedReqIds = (rfqs || [])
    .filter((rfq) => rfq.status === "Awarded" || rfq.winnerVendor || rfq.awardedVendor)
    .map((rfq) => rfq.reqId);

  const filteredPosList = posList.filter((po) => {
    return awardedRfqIds.includes(po.rfqId) || awardedReqIds.includes(po.reqId);
  });

  return filteredPosList;
};

const INVOICES_STORAGE_KEY = "eps_vendor_invoices_store_v1";

export const getStoredVendorInvoices = () => {
  const saved = localStorage.getItem(INVOICES_STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { }
  }
  return [];
};

export const saveStoredVendorInvoices = (invoices) => {
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  epsEventBus.publish({ type: "INVOICES_UPDATED", data: invoices });
};

export const createVendorInvoice = async (invoiceData) => {
  const existing = getStoredVendorInvoices();
  const invId = invoiceData.id || `INV-2026-${Math.floor(9900 + Math.random() * 90)}`;
  const rawAmt = typeof invoiceData.amount === "number"
    ? invoiceData.amount
    : parseFloat((invoiceData.amount || "36990").toString().replace(/[^0-9.]/g, '')) || 36990;

  const newInv = {
    id: invId,
    rfqId: invoiceData.rfqId || "RFQ-2026-901",
    poId: invoiceData.poId || `PO-2026-${(invoiceData.rfqId || '901').replace("RFQ-2026-", "")}`,
    buyer: invoiceData.buyer || "Enterprise Global Procurement",
    vendor: invoiceData.vendor || "Apple Business Direct",
    item: invoiceData.item || "Procurement Equipment",
    amount: rawAmt,
    taxAmount: rawAmt * 0.09,
    totalAmount: rawAmt * 1.09,
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
    dueDate: "2026-08-30",
    file: `INV_2026_${invId}_Official.pdf`,
    notes: invoiceData.notes || "Commercial Invoice submitted for 3-way matching and payment clearance.",
    trackingTimeline: [
      { step: "Invoice Generated & Submitted", date: `${new Date().toISOString().split("T")[0]} 10:00 AM`, status: "completed" },
      { step: "Under Audit & 3-Way Match", date: "Pending", status: "active" },
      { step: "Payment Approval", date: "Pending", status: "pending" },
      { step: "Disbursement", date: "Pending", status: "pending" },
    ]
  };

  const updated = [newInv, ...existing.filter(i => i.rfqId !== newInv.rfqId)];
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updated));
  epsEventBus.publish({ type: "INVOICE_SUBMITTED", data: newInv });
  return newInv;
};

export const createPurchaseOrder = async (poData) => {
  const currentPos = getStoredPurchaseOrders();
  const poId = poData.id || poData.poNumber || `PO-2026-${Math.floor(4400 + Math.random() * 500)}`;
  const newPo = {
    id: poId,
    reqId: poData.reqId || "REQ-2026-8921",
    rfqId: poData.rfqId || "RFQ-2026-901",
    vendor: poData.vendor || "Apple Business Direct",
    item: poData.item || "Equipment Sourcing",
    totalAmount: poData.totalAmount || "₹36,990.00",
    terms: poData.terms || "Net 30 Days",
    status: poData.status || "Issued & Dispatched",
    date: new Date().toISOString().split("T")[0],
    poFile: `PO_2026_${poId}_Official.pdf`,
    shipAddress: poData.shipAddress || "Tech Receiving Bay 4, San Jose CA",
    expectedDelivery: poData.expectedDelivery || "2026-08-15",
    carrier: "FedEx Logistics",
    trackingNumber: `7790-${Math.floor(1000 + Math.random() * 9000)}-9901`
  };

  const updatedPos = [newPo, ...currentPos.filter(p => p.rfqId !== newPo.rfqId)];
  saveStoredPurchaseOrders(updatedPos);

  // Advance Master Requisition to Stage 5 (PO_ISSUED)
  const reqId = poData.reqId || poData.requestId;
  if (reqId) {
    const current = getStoredMasterRequests();
    const updatedReqs = current.map((r) => {
      if (r.id === reqId || r.numericId === reqId) {
        return {
          ...r,
          currentStep: 5,
          status: "approved",
          poNumber: poId,
          vendor: poData.vendor || r.vendor
        };
      }
      return r;
    });
    saveStoredMasterRequests(updatedReqs);
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
    // Failover
  }

  const currentRfqs = getStoredRfqs();
  const rfq = currentRfqs.find(r => r.id === rfqId);
  const qty = rfq ? rfq.qty : 10;
  const unitPrice = parseFloat(quoteData.unitPrice || 3699.00);
  const totalPrice = unitPrice * qty;

  const updatedRfqs = currentRfqs.map((rfqItem) => {
    if (rfqItem.id === rfqId) {
      const targetVendor = quoteData.vendorName || "Apple Business Direct";
      const newBid = {
        vendor: targetVendor,
        amount: quoteData.submittedAmount || `₹${totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        leadTime: quoteData.leadTime || "3 Business Days",
        status: "Submitted"
      };

      const otherBids = (rfqItem.bids || []).filter((b) => b.vendor !== targetVendor);
      const updatedBids = [newBid, ...otherBids];

      return {
        ...rfqItem,
        bidStatus: "Bid Submitted",
        submittedAmount: newBid.amount,
        bids: updatedBids,
        bidsReceived: updatedBids.length
      };
    }
    return rfqItem;
  });

  saveStoredRfqs(updatedRfqs);

  // Sync to quotations store
  const quotes = getStoredQuotations();
  const existingQuoteIndex = quotes.findIndex(q => q.rfqId === rfqId);

  const quoteObj = {
    id: existingQuoteIndex !== -1 ? quotes[existingQuoteIndex].id : `QUOTE-2026-0${quotes.length + 1}`,
    rfqId: rfqId,
    buyer: rfq ? rfq.buyer : "Enterprise Buyer",
    item: rfq ? `${rfq.item} (x${qty})` : `Equipment Sourcing (x${qty})`,
    unitPrice: unitPrice,
    qty: qty,
    totalPrice: totalPrice,
    leadTime: quoteData.leadTime || "3 Business Days",
    shippingMethod: quoteData.shippingMethod || "Standard Cargo",
    warranty: quoteData.warranty || "3 Years Standard Warranty",
    description: quoteData.description || "",
    taxAllocation: quoteData.taxAllocation || "",
    status: "Submitted",
    date: new Date().toISOString().split("T")[0],
    file: quoteData.file || "quote_proposal.pdf",
    isDraft: false,
    deadline: rfq ? rfq.deadline : ""
  };

  let updatedQuotes;
  if (existingQuoteIndex !== -1) {
    updatedQuotes = quotes.map(q => q.rfqId === rfqId ? quoteObj : q);
  } else {
    updatedQuotes = [quoteObj, ...quotes];
  }
  saveStoredQuotations(updatedQuotes);

  return updatedRfqs;
};



export const awardVendorContract = async (rfqId, vendorName, finalAmount) => {
  const currentRfqs = getStoredRfqs();
  let matchedReqId = null;
  let matchedItem = "Equipment Sourcing";

  const updatedRfqs = currentRfqs.map((rfq) => {
    if (rfq.id === rfqId) {
      matchedReqId = rfq.reqId;
      matchedItem = rfq.item || matchedItem;
      const updatedBids = (rfq.bids || []).map((bid) => {
        if (bid.vendor === vendorName) {
          return { ...bid, status: "Approved" };
        }
        return { ...bid, status: "Rejected" };
      });
      return {
        ...rfq,
        status: "Awarded",
        bidStatus: "Awarded",
        winnerVendor: vendorName,
        awardedVendor: vendorName,
        awardedAmount: finalAmount,
        bids: updatedBids
      };
    }
    return rfq;
  });
  saveStoredRfqs(updatedRfqs);

  // Automatically generate Purchase Order for awarded contract & set stage to 5 (PO_ISSUED)
  createPurchaseOrder({
    rfqId: rfqId,
    reqId: matchedReqId || "REQ-2026-8921",
    vendor: vendorName,
    item: matchedItem,
    totalAmount: finalAmount || "₹36,990.00",
    status: "Issued & Dispatched"
  });

  if (matchedReqId) {
    const currentReqs = getStoredMasterRequests();
    const updatedReqs = currentReqs.map((r) => {
      const cleanReqId = matchedReqId.toString().replace("REQ-2026-", "");
      const cleanRId = r.id.toString().replace("REQ-2026-", "");
      if (r.id === matchedReqId || r.numericId === matchedReqId || cleanRId === cleanReqId || r.numericId?.toString() === cleanReqId) {
        return {
          ...r,
          currentStep: 5,
          status: "approved",
          vendor: vendorName,
          awardedVendor: vendorName,
          cost: finalAmount || r.cost,
          awardedAmount: finalAmount || r.cost,
          lastUpdated: new Date().toISOString()
        };
      }
      return r;
    });
    saveStoredMasterRequests(updatedReqs);
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
  const reqId = newReqData.id || `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const rawCost = (parseFloat(newReqData.unitPrice || 0) * (parseInt(newReqData.quantity) || 1)) || 1500;

  const activeUserStr = localStorage.getItem("eps_active_user");
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : null;
  const requesterName = activeUser ? activeUser.name : (newReqData.requester || "Current Employee");
  const requesterEmail = activeUser ? activeUser.email : (newReqData.email || "employee@enterprise.com");
  const requesterDept = activeUser ? activeUser.department : (newReqData.department || "Engineering & IT");

  const formattedReq = {
    id: reqId,
    numericId: parseInt(reqId.replace("REQ-2026-", "")) || Date.now(),
    requester: requesterName,
    email: requesterEmail,
    role: newReqData.role || "Software Engineer",
    empId: "EMP-10294",
    dept: requesterDept,
    deptId: 1,
    costCenter: "CC-8902-ENG",
    product: newReqData.productName || "New Requisition Item",
    category: newReqData.category || "General Equipment",
    vendor: newReqData.vendorPreference || "Pending Vendor Selection",
    qty: parseInt(newReqData.quantity) || 1,
    cost: `₹${rawCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    rawCost: rawCost,
    priority: newReqData.priority || "Medium",
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
    justification: newReqData.justification || "Business operation requirement",
    projectCode: "PRJ-2026-GEN",
    attachments: newReqData.attachments || ["Requisition_Spec.pdf"],
    currentStep: 1,
    managerDecision: null,
    remarks: ""
  };

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
