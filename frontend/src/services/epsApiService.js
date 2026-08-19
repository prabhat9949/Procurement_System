// EPS API & Real-Time Sync Service
import { apiGet, apiPost } from "./apiClient";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const LOCAL_STORAGE_KEY = "eps_enterprise_master_requests";
const BUDGET_STORAGE_KEY = "eps_dept_budget_analytics";
const backendOnlyError = () => { throw new Error("This operation requires the live backend and cannot use local demo data."); };

// Custom Event Bus for instant cross-component updates
class Emitter {
  constructor() {
    this.listeners = new Set();
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(data) {
    this.listeners.forEach((fn) => fn(data));
  }
  publish(data) {
    this.emit(data);
  }
}

export const epsEventBus = new Emitter();

const INITIAL_MASTER_REQUESTS = [];

export const getStoredMasterRequests = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading localStorage requests", e);
  }
  return INITIAL_MASTER_REQUESTS;
};

export const saveStoredMasterRequests = (requests) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
  epsEventBus.emit({ type: "REQUESTS_UPDATED", data: requests });
};

// PO Code → REQ ID mapping for cross-portal sync
const PO_REQ_MAP = {};

// Global Shipment Events store
const SHIPMENT_EVENTS_KEY = "eps_shipment_events_v1";

export const getShipmentEvents = () => {
  try {
    const saved = localStorage.getItem(SHIPMENT_EVENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {};
};

export const initiateGlobalShipment = (poIdOrReqId) => {
  // Resolve the real reqId from POs
  const currentPos = getStoredPurchaseOrders();
  const matchingPo = currentPos.find(p => p.id === poIdOrReqId);

  let poId = poIdOrReqId;
  let reqId = poIdOrReqId;
  if (matchingPo) {
    poId = matchingPo.id;
    reqId = matchingPo.reqId || poIdOrReqId;
  } else {
    const poForReq = currentPos.find(p => p.reqId === poIdOrReqId);
    if (poForReq) {
      poId = poForReq.id;
      reqId = poIdOrReqId;
    }
  }

  // Persist shipment event by poId in localStorage
  const events = getShipmentEvents();
  events[poId] = { reqId, poId, initiatedAt: new Date().toISOString(), phase: "Shipment Initiated" };
  localStorage.setItem(SHIPMENT_EVENTS_KEY, JSON.stringify(events));

  // Also advance the matching request's currentStep to 6 ("Goods Delivered" step = active)
  const requests = getStoredMasterRequests();
  const index = requests.findIndex((r) => r.id === reqId || r.poCode === poId || r.numericId === reqId);
  if (index !== -1) {
    requests[index].currentStep = 6;
    saveStoredMasterRequests(requests);
  }
};

// Advance a request to a specific step by matching PO ID or Request ID
export const advanceRequestStep = (poId, step) => {
  const currentPos = getStoredPurchaseOrders();
  const matchingPo = currentPos.find(p => p.id === poId);
  let reqId = matchingPo ? matchingPo.reqId : null;

  const requests = getStoredMasterRequests();
  let updated = false;
  const updatedReqs = requests.map((r) => {
    const matches =
      (reqId && (r.id === reqId || r.numericId === parseInt(reqId?.replace("REQ-2026-", "")))) ||
      r.id === poId ||
      r.poNumber === poId ||
      r.poCode === poId;
    if (matches) {
      updated = true;
      const newStep = Math.max(r.currentStep || 1, step);
      const isCompleted = step >= 8;
      return {
        ...r,
        currentStep: newStep,
        status: isCompleted ? "completed" : (r.status === "rejected" ? "rejected" : "approved"),
        lastUpdated: new Date().toISOString()
      };
    }
    return r;
  });
  if (updated) {
    saveStoredMasterRequests(updatedReqs);
    epsEventBus.publish({ type: "REQUESTS_UPDATED", data: updatedReqs });
  }
};

// ---- PAYMENT REQUESTS STORAGE ----
const PAYMENT_REQUESTS_KEY = "eps_payment_requests_v1";

export const getStoredPaymentRequests = () => {
  try {
    const saved = localStorage.getItem(PAYMENT_REQUESTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const saveStoredPaymentRequests = (list) => {
  localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(list));
  epsEventBus.publish({ type: "PAYMENT_REQUESTS_UPDATED", data: list });
};

export const createPaymentRequestFromInvoice = (invoice) => {
  const existing = getStoredPaymentRequests();
  // Avoid duplicate
  if (existing.some(p => p.invId === invoice.id)) return;

  const amt = typeof invoice.totalAmount === "number"
    ? invoice.totalAmount
    : (typeof invoice.amount === "number" ? invoice.amount * 1.18 : 0);

  const payId = `PAY-${invoice.id}`;
  const newPay = {
    payId,
    poId: invoice.poId || "N/A",
    invId: invoice.id,
    vendor: invoice.vendor || "Vendor",
    item: invoice.item || invoice.product || "Procurement Item",
    amount: amt,
    terms: invoice.paymentTerms || "Net 30 Days",
    dueDate: invoice.dueDate || "2026-09-30",
    status: "Awaiting CFO Sign-off",
    bankDetails: invoice.bankDetails || "Bank details on file",
    submittedAt: new Date().toLocaleString(),
    invoiceDate: invoice.date || new Date().toISOString().split("T")[0],
  };

  const updated = [newPay, ...existing];
  saveStoredPaymentRequests(updated);
  epsEventBus.publish({ type: "PAYMENT_REQUEST_CREATED", data: newPay });
  return newPay;
};

// ==========================================
// API SERVICE METHODS
// ==========================================

export const fetchApprovalQueue = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/approvals/pending`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.content && data.data.content.length > 0) {
        return data.data.content;
      }
    }
  } catch (err) {
    throw new Error("Unable to load approval queue from the backend.");
  }
};

export const fetchTeamRequisitions = async (deptId = 1) => {
  try {
    const res = await fetch(`${API_BASE_URL}/purchase-requests?departmentId=${deptId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.content) {
        return data.data.content;
      }
    }
  } catch (err) {
    throw new Error("Unable to load requisitions from the backend.");
  }
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

export const fetchBudgetAnalytics = async (deptId = 1) => {
  const requests = getStoredMasterRequests();
  const approvedSpend = requests
    .filter((r) => r.status === "approved" || r.status === "completed")
    .reduce((acc, r) => acc + (r.rawCost || 0), 0);

  const baseBudget = 120000;
  const actualSpend = 75000 + approvedSpend;

  return {
    totalBudgetCap: baseBudget,
    allocatedBudget: 98000,
    spentBudget: actualSpend,
    remainingBudget: Math.max(0, baseBudget - actualSpend),
    monthlyBudgetData: [
      { month: "Jan", budgetCap: 120000, actualSpend: 78000 },
      { month: "Feb", budgetCap: 120000, actualSpend: 84000 },
      { month: "Mar", budgetCap: 120000, actualSpend: 91000 },
      { month: "Apr", budgetCap: 120000, actualSpend: 86000 },
      { month: "May", budgetCap: 120000, actualSpend: 98000 },
      { month: "Jun", budgetCap: 120000, actualSpend: 89000 },
      { month: "Jul", budgetCap: 120000, actualSpend: actualSpend }
    ],
    subTeamSpend: [
      { team: "DevOps & Cloud", spend: 32500 },
      { team: "Frontend Arch", spend: 21400 },
      { team: "Backend Systems", spend: 18600 },
      { team: "QA Automation", spend: 7200 },
      { team: "IT Desk Support", spend: 4500 }
    ],
    categoryData: [
      { name: "Cloud Infrastructure", value: 38, color: "#f8b400" },
      { name: "Hardware & Workstations", value: 26, color: "#059669" },
      { name: "SaaS & Subscriptions", value: 24, color: "#3b82f6" },
      { name: "Office Supplies", value: 12, color: "#7c3aed" }
    ]
  };
};

export const submitApprovalDecision = async (reqId, decision, remarks = "", approver = "") => {
  const response = await apiPost(`/api/approval-tasks/${reqId}/decision`, { decision: decision.toUpperCase(), remarks });
  return response;
  /* legacy local implementation intentionally unreachable */
  const current = getStoredMasterRequests();
  const updated = current.map((r) => {
    if (r.id === reqId || r.numericId === reqId) {
      const isApproved = decision === "approved";
      return {
        ...r,
        status: isApproved ? "approved" : "rejected",
        currentStep: isApproved ? 3 : 2,
        managerDecision: decision,
        remarks: remarks || (isApproved ? "Approved by Department Manager" : "Rejected by Department Manager"),
        approver: approver
      };
    }
    return r;
  });

  saveStoredMasterRequests(updated);
  return updated;
};

export const fetchProcurementRequests = async () => {
  try {
    const page = await apiGet("/api/purchase-requests?page=0&size=100&sort=createdAt&direction=desc");
    // A PR remains UNDER_REVIEW while later approval/assignment stages run.
    // Procurement must receive it as soon as it is routed to procurement,
    // rather than waiting for the entire approval chain to become APPROVED.
    return (page?.content || [])
      .filter((r) => !["DRAFT", "CANCELLED", "REJECTED", "COMPLETED"].includes(String(r.status || "").toUpperCase()))
      .map(normalizeProcurementRequest);
  } catch (err) {
    // Failover
  }
  const all = getStoredMasterRequests();
  return all.filter((r) => r.status === "approved" || r.currentStep >= 3);
};

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

const POS_STORAGE_KEY = "eps_purchase_orders_store_v1";

const INITIAL_POS = [];

export const getStoredPurchaseOrders = () => {
  const data = localStorage.getItem(POS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(INITIAL_POS));
    return INITIAL_POS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_POS;
  }
};

export const saveStoredPurchaseOrders = (posList) => {
  localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(posList));
  epsEventBus.publish({ type: "POS_UPDATED", data: posList });
};

export const fetchPurchaseOrders = async () => {
  let posList = getStoredPurchaseOrders();

  try {
    const res = await fetch(`${API_BASE_URL}/purchase-orders`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.content && data.data.content.length > 0) {
        posList = data.data.content;
      }
    }
  } catch (err) {
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
  return backendOnlyError();
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
  return backendOnlyError();
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

  return newPo;
};

const RFQS_STORAGE_KEY = "eps_active_rfqs_store";
const INITIAL_RFQS = [];

export const getStoredRfqs = () => {
  try {
    const saved = localStorage.getItem(RFQS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading localStorage RFQs", e);
  }
  localStorage.setItem(RFQS_STORAGE_KEY, JSON.stringify(INITIAL_RFQS));
  return INITIAL_RFQS;
};

export const saveStoredRfqs = (rfqs) => {
  localStorage.setItem(RFQS_STORAGE_KEY, JSON.stringify(rfqs));
  epsEventBus.emit({ type: "RFQS_UPDATED", data: rfqs });
};

export const fetchActiveRfqs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/rfqs`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.content) {
        return data.data.content;
      }
    }
  } catch (err) {
    // Failover
  }
  return getStoredRfqs();
};

export const createRfq = async (rfqData) => {
  return backendOnlyError();
  const rfqId = rfqData.id || `RFQ-2026-${Math.floor(900 + Math.random() * 100)}`;

  try {
    await fetch(`${API_BASE_URL}/rfq`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: 1,
        vendorId: 1,
        quotationAmount: 36990.00,
        status: "SENT"
      })
    });
  } catch (err) {
    // Failover
  }

  const newRfq = {
    id: rfqId,
    reqId: rfqData.reqId || "REQ-2026-8921",
    buyer: rfqData.buyer || "Enterprise Procurement Dept",
    item: rfqData.item || rfqData.title || "Hardware / Equipment Sourcing",
    category: rfqData.category || "General Procurement",
    qty: rfqData.quantity || rfqData.qty || 1,
    deadline: rfqData.deadline || "2026-08-10",
    specs: rfqData.specs || rfqData.description || "Technical requirements attached.",
    rfqFile: rfqData.rfqFile || `${rfqId}_Requirements.pdf`,
    bidStatus: "Open for Bids",
    submittedAmount: "Pending Vendor Quotes",
    bids: []
  };

  const currentRfqs = getStoredRfqs();
  const updatedRfqs = [newRfq, ...currentRfqs];
  saveStoredRfqs(updatedRfqs);

  // Advance purchase request step to 4 (RFQ Sourcing)
  if (rfqData.reqId) {
    const currentReqs = getStoredMasterRequests();
    const updatedReqs = currentReqs.map((r) => {
      if (r.id === rfqData.reqId) {
        return { ...r, currentStep: 4, status: "approved", rfqCode: rfqId };
      }
      return r;
    });
    saveStoredMasterRequests(updatedReqs);
  }

  return newRfq;
};

const QUOTES_STORAGE_KEY = "eps_vendor_quotations_store_v1";

const INITIAL_QUOTATIONS = [];

export const getStoredQuotations = () => {
  const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { }
  }
  return INITIAL_QUOTATIONS;
};

export const saveStoredQuotations = (quotes) => {
  localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  epsEventBus.emit({ type: "QUOTES_UPDATED", data: quotes });
};

export const submitVendorQuote = async (rfqId, quoteData) => {
  try {
    await fetch(`${API_BASE_URL}/quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfqCode: rfqId,
        vendorName: quoteData.vendorName || "Apple Business Direct",
        unitPrice: parseFloat(quoteData.unitPrice || 3699.00),
        quantity: 10,
        leadTime: quoteData.leadTime || "3 Business Days",
        warranty: quoteData.warranty || "3 Years AppleCare+"
      })
    });
  } catch (err) {
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

  epsEventBus.publish({ type: "RFQ_AWARDED", rfqId, vendorName, finalAmount });
  return updatedRfqs;
};

export const revokeVendorContract = async (rfqId) => {
  const currentRfqs = getStoredRfqs();
  let matchedReqId = null;

  const updatedRfqs = currentRfqs.map((rfq) => {
    if (rfq.id === rfqId) {
      matchedReqId = rfq.reqId;
      const updatedBids = (rfq.bids || []).map((bid) => ({ ...bid, status: "Submitted" }));
      return {
        ...rfq,
        status: "Active Bidding",
        bidStatus: "Bids Received",
        winnerVendor: null,
        awardedVendor: null,
        awardedAmount: null,
        bids: updatedBids
      };
    }
    return rfq;
  });
  saveStoredRfqs(updatedRfqs);

  // Revoke PO status
  const currentPos = getStoredPurchaseOrders();
  const updatedPos = currentPos.map((p) => {
    if (p.rfqId === rfqId) {
      return { ...p, status: "Revoked / Cancelled" };
    }
    return p;
  });
  saveStoredPurchaseOrders(updatedPos);

  if (matchedReqId) {
    const currentReqs = getStoredMasterRequests();
    const updatedReqs = currentReqs.map((r) => {
      const cleanReqId = matchedReqId.toString().replace("REQ-2026-", "");
      const cleanRId = r.id.toString().replace("REQ-2026-", "");
      if (r.id === matchedReqId || r.numericId === matchedReqId || cleanRId === cleanReqId || r.numericId?.toString() === cleanReqId) {
        return {
          ...r,
          currentStep: 3,
          status: "pending",
          vendor: "Pending Vendor Award",
          awardedVendor: null,
          lastUpdated: new Date().toISOString()
        };
      }
      return r;
    });
    saveStoredMasterRequests(updatedReqs);
  }

  epsEventBus.publish({ type: "RFQ_APPROVAL_CANCELLED", rfqId });
  return updatedRfqs;
};

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
    await fetch(`${API_BASE_URL}/purchase-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId: 1,
        title: formattedReq.product,
        description: formattedReq.justification,
        quantity: formattedReq.qty,
        estimatedCost: formattedReq.rawCost,
        priority: formattedReq.priority.toUpperCase()
      })
    });
  } catch (err) {
    // Local fallback
  }

  const current = getStoredMasterRequests();
  const updated = [formattedReq, ...current];
  saveStoredMasterRequests(updated);
  return formattedReq;
};

function generateWorkflowTimelineSteps(req, activeStep, isRejected) {
  const dateStr = req.date || "July 24, 2026";
  const isCompleted = req.status === "completed";
  const requesterName = req.requester || "Alex Morgan";

  return [
    {
      title: "1. Request Submitted",
      desc: "Requisition form created and logged in system.",
      actor: `${requesterName} (Requester)`,
      timestamp: `${dateStr} - 10:00 AM`,
      status: "done"
    },
    {
      title: "2. Department Manager Approval",
      desc: isRejected ? "Rejected by Department Manager." : "Approved budget sign-off and cost center verification.",
      actor: req.approver || "Sarah Jenkins (VP Eng)",
      timestamp: activeStep >= 2 ? `${dateStr} - 01:20 PM` : "Pending",
      status: isRejected ? "rejected" : activeStep > 2 ? "done" : activeStep === 2 ? "active" : "pending"
    },
    {
      title: "3. Procurement Approval",
      desc: "SaaS/Hardware agreement and policy compliance audit.",
      actor: "David Chen (Procurement Exec)",
      timestamp: activeStep >= 3 ? `${dateStr} - 03:45 PM` : "Pending",
      status: isRejected ? "pending" : activeStep > 3 ? "done" : activeStep === 3 ? "active" : "pending"
    },
    {
      title: "4. Vendor Selection & Sourcing",
      desc: req.vendor && req.vendor !== "Pending Vendor Award" && req.vendor !== "Pending Vendor Selection"
        ? `Quotation Approved. Winner vendor selected: ${req.vendor}.`
        : "Direct vendor contract and quote verification.",
      actor: req.vendor && req.vendor !== "Pending Vendor Award" && req.vendor !== "Pending Vendor Selection" ? `${req.vendor} (Awarded)` : "Vendor Representative",
      timestamp: activeStep >= 4 ? `${dateStr} - 05:00 PM` : "Pending",
      status: (activeStep > 4 || (req.vendor && req.vendor !== "Pending Vendor Award" && req.vendor !== "Pending Vendor Selection")) ? "done" : activeStep === 4 ? "active" : "pending"
    },
      {
        title: "5. Purchase Order Generated",
        desc: "PO generated and sent to supplier.",
        actor: "Finance & Purchasing Lead",
        timestamp: activeStep >= 5 ? `${dateStr} - 06:15 PM` : "Pending",
        status: activeStep > 5 ? "done" : activeStep === 5 ? "active" : "pending"
      },
    {
      title: "6. Goods Delivered",
      desc: "Physical receipt at Receiving Bay & inspection.",
      actor: "Inventory Operations",
      timestamp: activeStep >= 6 ? `${dateStr} - 07:30 PM` : "Pending",
      status: activeStep > 6 ? "done" : activeStep === 6 ? "active" : "pending"
    },
    {
      title: "7. Finance Approval & Invoice Match",
      desc: "3-way invoice matching and payment clearance.",
      actor: "Accounts Payable",
      timestamp: activeStep >= 7 ? `${dateStr} - 08:00 PM` : "Pending",
      status: activeStep > 7 ? "done" : activeStep === 7 ? "active" : "pending"
    },
    {
      title: "8. Completed & Handover",
      desc: "Asset tagged and delivered to requester.",
      actor: "IT Asset Management",
      timestamp: isCompleted ? `${dateStr} - 08:30 PM` : "Pending",
      status: isCompleted ? "done" : activeStep === 8 ? "active" : "pending"
    }
  ];
}

// INVENTORY PERSISTENCE KEYS
const GRN_HISTORY_KEY = "eps_grn_history_v1";
const STOCK_ITEMS_KEY = "eps_stock_items_v1";
const STOCK_HISTORY_KEY = "eps_stock_history_v1";

const INITIAL_GRN_HISTORY = [
  {
    grnId: "GRN-2026-041",
    poId: "PO-2026-4350",
    vendor: "Apple Business Direct",
    item: "Studio Display 27'' Monitors",
    receivedQty: 5,
    rejectedQty: 0,
    inspectedBy: "Marcus Vance",
    date: "2026-07-24",
    status: "Completed",
    document: "GRN_041_StudioDisplays.pdf",
  },
  {
    grnId: "GRN-2026-039",
    poId: "PO-2026-4299",
    vendor: "Logitech Logistics",
    item: "Logitech MX Master 3S Mouse",
    receivedQty: 48,
    rejectedQty: 2,
    inspectedBy: "QA Inspector John",
    date: "2026-07-20",
    status: "Discrepancy Logged",
    document: "GRN_039_MXMaster.pdf",
  },
];

const INITIAL_STOCK_ITEMS = [
  {
    sku: "SKU-MAC-101",
    name: "MacBook Pro M3 Max 64GB Workstation",
    category: "Laptops",
    available: 24,
    reserved: 10,
    incoming: 10,
    reorderLevel: 5,
    status: "Healthy",
    damagedCount: 0,
    returnedCount: 2,
  },
  {
    sku: "SKU-NET-992",
    name: "Cisco Catalyst 9300 Switch Module",
    category: "Networking",
    available: 2,
    reserved: 2,
    incoming: 4,
    reorderLevel: 5,
    status: "Low Stock Alert",
    damagedCount: 1,
    returnedCount: 0,
  },
  {
    sku: "SKU-DISP-401",
    name: "Dell UltraSharp 32'' 4K Monitor",
    category: "Displays",
    available: 1,
    reserved: 1,
    incoming: 0,
    reorderLevel: 3,
    status: "Critical Stock Alert",
    damagedCount: 0,
    returnedCount: 1,
  },
  {
    sku: "SKU-SERV-502",
    name: "Dell PowerEdge R760 Rack Server",
    category: "Servers",
    available: 8,
    reserved: 2,
    incoming: 2,
    reorderLevel: 2,
    status: "Healthy",
    damagedCount: 0,
    returnedCount: 0,
  },
];

const INITIAL_STOCK_HISTORY = [
  { id: "LOG-1001", sku: "SKU-MAC-101", name: "MacBook Pro M3 Max 64GB Workstation", type: "Stock In", qty: 10, reason: "Vendor Delivery Received", date: "2026-07-26 10:15 AM", operator: "Robert V." },
  { id: "LOG-1002", sku: "SKU-NET-992", name: "Cisco Catalyst 9300 Switch Module", type: "Stock Out", qty: 2, reason: "Dispatched to IT Dept", date: "2026-07-25 03:00 PM", operator: "Sarah K." },
  { id: "LOG-1003", sku: "SKU-DISP-401", name: "Dell UltraSharp 32'' 4K Monitor", type: "Adjustment", qty: -1, reason: "Damaged during handling", date: "2026-07-24 09:30 AM", operator: "John D." },
  { id: "LOG-1004", sku: "SKU-MAC-101", name: "MacBook Pro M3 Max 64GB Workstation", type: "Returned", qty: 2, reason: "Unused department surplus", date: "2026-07-23 04:00 PM", operator: "Robert V." },
];

export const getStoredGrnHistory = () => {
  const saved = localStorage.getItem(GRN_HISTORY_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return INITIAL_GRN_HISTORY;
};

export const saveStoredGrnHistory = (history) => {
  localStorage.setItem(GRN_HISTORY_KEY, JSON.stringify(history));
  epsEventBus.publish({ type: "GRN_UPDATED", data: history });
};

export const getStoredStockItems = () => {
  const saved = localStorage.getItem(STOCK_ITEMS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return INITIAL_STOCK_ITEMS;
};

export const saveStoredStockItems = (items) => {
  localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(items));
};

export const getStoredStockHistory = () => {
  const saved = localStorage.getItem(STOCK_HISTORY_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return INITIAL_STOCK_HISTORY;
};

export const saveStoredStockHistory = (history) => {
  localStorage.setItem(STOCK_HISTORY_KEY, JSON.stringify(history));
};

export const addStockItemAfterGrn = (itemTitle, receivedQty, poId, grnId) => {
  const stockItems = getStoredStockItems();
  const historyLogs = getStoredStockHistory();

  // Find standard items by checking keywords
  let matchedSku = null;
  const titleLower = itemTitle.toLowerCase();

  if (titleLower.includes("macbook")) {
    matchedSku = "SKU-MAC-101";
  } else if (titleLower.includes("switch")) {
    matchedSku = "SKU-NET-992";
  } else if (titleLower.includes("monitor") || titleLower.includes("display")) {
    matchedSku = "SKU-DISP-401";
  } else if (titleLower.includes("server") || titleLower.includes("poweredge")) {
    matchedSku = "SKU-SERV-502";
  } else if (titleLower.includes("asus")) {
    matchedSku = "SKU-ASUS-102";
  }

  let updatedStockItems = [...stockItems];
  let finalSku = matchedSku;
  let finalItemName = itemTitle;

  // Clean item title from quantity indicator (e.g. "(x10)", "(x1)")
  const cleanTitle = itemTitle.replace(/\s*\(x\d+\)\s*/i, "").trim();
  finalItemName = cleanTitle;

  if (matchedSku) {
    const exists = stockItems.some(i => i.sku === matchedSku);
    if (exists) {
      updatedStockItems = stockItems.map((item) => {
        if (item.sku === matchedSku) {
          const newAvail = item.available + receivedQty;
          const newIncoming = Math.max(0, item.incoming - receivedQty);
          return {
            ...item,
            available: newAvail,
            incoming: newIncoming,
            status: newAvail <= item.reorderLevel ? (newAvail === 0 ? "Critical Stock Alert" : "Low Stock Alert") : "Healthy"
          };
        }
        return item;
      });
    } else {
      // Asus laptop or matching SKU but doesn't exist in stockItems yet
      const category = titleLower.includes("laptop") ? "Laptops" : "General";
      const newItem = {
        sku: matchedSku,
        name: cleanTitle,
        category,
        available: receivedQty,
        reserved: 0,
        incoming: 0,
        reorderLevel: 2,
        status: "Healthy",
        damagedCount: 0,
        returnedCount: 0,
      };
      updatedStockItems.push(newItem);
    }
  } else {
    // Generate dynamic SKU
    const prefix = cleanTitle.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) || "GEN";
    finalSku = `SKU-${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    let category = "General";
    if (titleLower.includes("laptop")) category = "Laptops";
    else if (titleLower.includes("switch")) category = "Networking";
    else if (titleLower.includes("monitor")) category = "Displays";
    else if (titleLower.includes("server")) category = "Servers";

    const newItem = {
      sku: finalSku,
      name: cleanTitle,
      category,
      available: receivedQty,
      reserved: 0,
      incoming: 0,
      reorderLevel: 2,
      status: "Healthy",
      damagedCount: 0,
      returnedCount: 0,
    };
    updatedStockItems.push(newItem);
  }

  // Create Stock Log
  const newLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    sku: finalSku,
    name: finalItemName,
    type: "Stock In",
    qty: receivedQty,
    reason: `Vendor Delivery (PO: ${poId}, GRN: ${grnId})`,
    date: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
    operator: "Marcus Vance (Mgr)"
  };

  const updatedHistoryLogs = [newLog, ...historyLogs];

  saveStoredStockItems(updatedStockItems);
  saveStoredStockHistory(updatedHistoryLogs);
  epsEventBus.publish({ type: "STOCK_UPDATED", data: updatedStockItems });
};

// ============================================================================
// MASSIVE VIEWS & GLOBAL SYSTEM CONTROL STATES (SUPER ADMIN & ORG ADMIN)
// ============================================================================

export const SYSTEM_PAUSE_KEY = "eps_system_paused_state";
export const USERS_LIST_KEY = "eps_users_list_state";
export const BUDGET_ALLOCATIONS_KEY = "eps_budget_allocations_state";

export const getSystemPauseState = () => {
  const saved = localStorage.getItem(SYSTEM_PAUSE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {
    purchaseRequests: false,
    rfqBidding: false,
    poGeneration: false,
    payments: false,
    inventory: false
  };
};

export const setSystemPauseState = (state) => {
  localStorage.setItem(SYSTEM_PAUSE_KEY, JSON.stringify(state));
  epsEventBus.publish({ type: "SYSTEM_PAUSE_UPDATED", data: state });
};

export const getStoredUsers = () => {
  const saved = localStorage.getItem(USERS_LIST_KEY);
  if (saved) {
    try {
      const users = JSON.parse(saved).map((user) => ({
        ...user,
        username: user.username || (
          user.role === "super_admin" ? "admin" :
          user.role === "org_admin" ? "orgadmin" :
          (user.email || "").split("@")[0]
        )
      }));
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
      return users;
    } catch (e) {}
  }
  const initial = [
    { id: "USR-ADMIN-1", name: "Super Admin", username: "admin", role: "super_admin", department: "IT", email: "admin@company.com", password: "admin123", status: "Active" },
    { id: "USR-ADMIN-2", name: "Org Admin", username: "orgadmin", role: "org_admin", department: "Management", email: "orgadmin@company.com", password: "admin123", status: "Active" },
    { id: "USR-001", name: "David Chen", username: "david.chen", role: "proc_executive", department: "Procurement", email: "david.c@enterprise.com", password: "password", status: "Active" },
    { id: "USR-002", name: "Sarah Jenkins", username: "sarah.jenkins", role: "dept_manager", department: "Engineering & IT", email: "sarah.j@enterprise.com", password: "password", status: "Active" },
    { id: "USR-003", name: "Marcus Vance", username: "marcus.vance", role: "inventory_manager", department: "Warehouse & Inventory", email: "marcus.v@enterprise.com", password: "password", status: "Active" },
    { id: "USR-004", name: "Elena Rostova", username: "elena.rostova", role: "employee", department: "Engineering & IT", email: "elena.r@enterprise.com", password: "password", status: "Active" }
  ];
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(initial));
  return initial;
};

export const saveStoredUsers = (users) => {
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  epsEventBus.publish({ type: "USERS_UPDATED", data: users });
};

export const registerUser = (userData) => {
  const users = getStoredUsers();
  const newUser = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: userData.fullName,
    role: userData.role || "employee",
    department: userData.department || "Engineering & IT",
    email: userData.email,
    password: userData.password,
    status: "Pending Approval",
    isFirstTimeLogin: true
  };
  const updated = [...users, newUser];
  saveStoredUsers(updated);
  return newUser;
};

export const getBudgetAllocations = () => {
  const saved = localStorage.getItem(BUDGET_ALLOCATIONS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [
    { id: "ALLOC-001", department: "Engineering & IT", allocatedAmt: 1500000, spentAmt: 345000, remainingAmt: 1155000, lastUpdated: "2026-07-01" },
    { id: "ALLOC-002", department: "Marketing", allocatedAmt: 500000, spentAmt: 120000, remainingAmt: 380000, lastUpdated: "2026-07-01" }
  ];
};

export const saveBudgetAllocations = (allocations) => {
  localStorage.setItem(BUDGET_ALLOCATIONS_KEY, JSON.stringify(allocations));
  epsEventBus.publish({ type: "BUDGETS_UPDATED", data: allocations });
};

export const VENDOR_PROFILES_KEY = "eps_vendor_profiles_state";

export const getStoredVendorProfiles = () => {
  const saved = localStorage.getItem(VENDOR_PROFILES_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [
    { id: "V-001", name: "Apple Direct", status: "Active" },
    { id: "V-002", name: "Dell EMC", status: "Active" },
    { id: "V-003", name: "Lenovo Global", status: "Active" },
    { id: "V-004", name: "HP Enterprise", status: "Active" }
  ];
};

export const saveStoredVendorProfiles = (vendors) => {
  localStorage.setItem(VENDOR_PROFILES_KEY, JSON.stringify(vendors));
  epsEventBus.publish({ type: "VENDORS_UPDATED", data: vendors });
};
