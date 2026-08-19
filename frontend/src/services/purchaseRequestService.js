import {
  createEmployeeRequest,
  submitApprovalDecision,
  epsEventBus
} from "./epsApiService";

const LOCAL_STORAGE_KEY = "eps_enterprise_master_requests";

const INITIAL_MOCK_REQUESTS = [];

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

export const saveNewRequest = (newReqData) => {
  return createEmployeeRequest(newReqData);
};

export const updateRequestStatus = (reqId, newStatus, managerNotes = "", approverName = "Sarah Jenkins (VP Eng)") => {
  return submitApprovalDecision(reqId, newStatus, managerNotes, approverName);
};

export const generateWorkflowSteps = (req) => {
  const isRejected = req.status === "rejected";
  const isApproved = req.status === "approved" || req.status === "completed";
  const isCompleted = req.status === "completed";
  const isDraft = req.status === "draft";

  const currentStep = req.currentStep || (isCompleted ? 8 : isApproved ? 5 : isRejected ? 2 : isDraft ? 1 : 2);

  return {
    id: req.id,
    product: req.product,
    cost: req.cost,
    currentStep: currentStep,
    status: req.status,
    steps: [
      {
        title: "1. Submitted",
        desc: `Requisition created for ${req.product}.`,
        actor: `${req.requester || "Alex Morgan"} (Requester)`,
        timestamp: `${req.date} - Submitted`,
        status: "done",
      },
      {
        title: "2. Manager Approval",
        desc: isRejected
          ? "Department Manager reviewed and rejected budget allocation."
          : currentStep > 2
          ? "Department Manager budget review and sign-off completed."
          : "Awaiting Department Manager review & sign-off.",
        actor: req.approver || "Department Manager",
        timestamp: currentStep >= 2 ? `${req.date}` : "Pending",
        status: isRejected ? "rejected" : currentStep > 2 ? "done" : currentStep === 2 ? "active" : "pending",
      },
      {
        title: "3. Procurement Review",
        desc: "Sourcing verification and spending policy review.",
        actor: "David Chen (Procurement Exec)",
        timestamp: currentStep >= 3 ? `${req.date}` : "Pending",
        status: currentStep > 3 ? "done" : currentStep === 3 ? "active" : "pending",
      },
      {
        title: "4. Vendor Selection & RFQ",
        desc: req.vendor && req.vendor !== "Pending Vendor Award" && req.vendor !== "Pending Vendor Selection"
          ? `Quotation Approved. Winner vendor selected: ${req.vendor}.`
          : `Sourcing quotes with ${req.vendor || "preferred suppliers"}.`,
        actor: req.vendor && req.vendor !== "Pending Vendor Award" && req.vendor !== "Pending Vendor Selection" ? `${req.vendor} (Awarded)` : "Global Procurement Team",
        timestamp: currentStep >= 4 ? `${req.date}` : "Pending",
        status: (currentStep > 4 || (req.vendor && req.vendor !== "Pending Vendor Award" && req.vendor !== "Pending Vendor Selection")) ? "done" : currentStep === 4 ? "active" : "pending",
      },
      {
        title: "5. Purchase Order Generated",
        desc: `Formal Purchase Order issued to vendor.`,
        actor: "Procurement Manager",
        timestamp: currentStep >= 5 ? `${req.date}` : "Pending",
        status: currentStep > 5 ? "done" : currentStep === 5 ? "active" : "pending",
      },
      {
        title: "6. Goods / Service Delivery",
        desc: `Item scheduled for receiving by ${req.deliveryDate || "target date"}.`,
        actor: "Inventory & Receiving Manager",
        timestamp: currentStep >= 6 ? `${req.date}` : "Pending",
        status: currentStep > 6 ? "done" : currentStep === 6 ? "active" : "pending",
      },
      {
        title: "7. Finance Approval & Invoice Match",
        desc: "3-way invoice matching and payment clearance.",
        actor: "Accounts Payable / Finance Team",
        timestamp: currentStep >= 7 ? `${req.date}` : "Pending",
        status: currentStep > 7 ? "done" : currentStep === 7 ? "active" : "pending",
      },
      {
        title: "8. Completed & Fulfilled",
        desc: "Asset tagged and delivered to requester.",
        actor: "IT Asset Desk / Procurement",
        timestamp: isCompleted ? `${req.date}` : "Pending",
        status: isCompleted ? "done" : currentStep === 8 ? "active" : "pending",
      },
    ],
  };
};

export { epsEventBus };
