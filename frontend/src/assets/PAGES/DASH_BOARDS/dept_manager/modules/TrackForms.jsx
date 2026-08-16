import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Building,
  IndianRupee,
  ArrowRight,
  ChevronRight,
  PackageCheck,
  AlertCircle
} from "lucide-react";

export const mockApprovedWorkflows = {
  "REQ-2026-8894": {
    id: "REQ-2026-8894",
    product: "Figma Enterprise License (20 Seats)",
    requester: "Hannah Lee",
    role: "UI/UX Designer",
    dept: "Engineering & IT",
    cost: "₹4,500.00",
    vendor: "Figma Inc.",
    approvedDate: "2026-07-20",
    priority: "High",
    currentStep: 6,
    steps: [
      {
        title: "1. Request Submitted",
        desc: "Requisition form created and logged in system.",
        actor: "Hannah Lee (Requester)",
        timestamp: "July 20, 2026 - 10:00 AM",
        status: "done",
      },
      {
        title: "2. Department Manager Approval",
        desc: "Approved budget sign-off and cost center verification.",
        actor: "Sarah Jenkins (VP Eng)",
        timestamp: "July 20, 2026 - 01:20 PM",
        status: "done",
      },
      {
        title: "3. Procurement Approval",
        desc: "SaaS Enterprise agreement and policy compliance audit.",
        actor: "David Chen (Procurement Exec)",
        timestamp: "July 21, 2026 - 09:00 AM",
        status: "done",
      },
      {
        title: "4. Vendor Selection & Licensing",
        desc: "Direct SaaS subscription contract verified.",
        actor: "Figma Account Mgr",
        timestamp: "July 21, 2026 - 11:15 AM",
        status: "done",
      },
      {
        title: "5. Purchase Order Issued",
        desc: "PO-2026-9901 issued and transmitted to vendor.",
        actor: "Procurement Ops",
        timestamp: "July 22, 2026 - 03:00 PM",
        status: "done",
      },
      {
        title: "6. Goods / Service Provisioning",
        desc: "Digital license seats being provisioned to workspace.",
        actor: "IT Systems Administrator",
        timestamp: "July 23, 2026 - 10:30 AM",
        status: "active",
      },
      {
        title: "7. Finance Approval & Reconciliation",
        desc: "Awaiting final invoice matching and 3-way check.",
        actor: "Accounts Payable",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "8. Completed & Delivered",
        desc: "Final audit clearance & asset tag registration.",
        actor: "IT Asset Desk",
        timestamp: "Pending",
        status: "pending",
      },
    ],
  },
  "REQ-2026-8921": {
    id: "REQ-2026-8921",
    product: "MacBook Pro M3 Max 64GB",
    requester: "Alex Morgan",
    role: "Senior Architect",
    dept: "Engineering & IT",
    cost: "₹3,899.00",
    vendor: "Apple Business Direct",
    approvedDate: "2026-07-24",
    priority: "Urgent",
    currentStep: 3,
    steps: [
      {
        title: "1. Request Submitted",
        desc: "Requisition logged for high-performance workstation.",
        actor: "Alex Morgan (Requester)",
        timestamp: "July 24, 2026 - 09:15 AM",
        status: "done",
      },
      {
        title: "2. Department Manager Approval",
        desc: "Budget sign-off granted by Sarah Jenkins.",
        actor: "Sarah Jenkins (VP Eng)",
        timestamp: "July 24, 2026 - 11:30 AM",
        status: "done",
      },
      {
        title: "3. Procurement Approval",
        desc: "Hardware quote and specs validation under review.",
        actor: "David Chen (Procurement Exec)",
        timestamp: "July 25, 2026 - 02:45 PM",
        status: "active",
      },
      {
        title: "4. Vendor Selection",
        desc: "Commercial quotation review with Apple Direct.",
        actor: "Global Supply Chain Team",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "5. Purchase Order Issued",
        desc: "Formal PO creation and manager sign-off.",
        actor: "Procurement Manager",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "6. Goods Delivered",
        desc: "Physical receipt at Receiving Bay & inspection.",
        actor: "Inventory Desk",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "7. Finance Approval",
        desc: "Payment clearance and ledger entry.",
        actor: "Finance Team",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "8. Completed & Handover",
        desc: "Asset tagging and device delivery to architect.",
        actor: "IT Asset Management",
        timestamp: "Pending",
        status: "pending",
      },
    ],
  },
  "REQ-2026-8812": {
    id: "REQ-2026-8812",
    product: "AWS Cloud Infrastructure Upgrade",
    requester: "Alex Morgan",
    role: "Senior Architect",
    dept: "Engineering & IT",
    cost: "₹12,000.00",
    vendor: "Amazon Web Services",
    approvedDate: "2026-07-10",
    priority: "High",
    currentStep: 7,
    steps: [
      {
        title: "1. Request Submitted",
        desc: "Infrastructure expansion request submitted.",
        actor: "Alex Morgan",
        timestamp: "July 10, 2026 - 08:30 AM",
        status: "done",
      },
      {
        title: "2. Department Manager Approval",
        desc: "Quarterly cloud budget sign-off approved.",
        actor: "Sarah Jenkins",
        timestamp: "July 10, 2026 - 10:15 AM",
        status: "done",
      },
      {
        title: "3. Procurement Approval",
        desc: "Enterprise discount tier verified.",
        actor: "David Chen",
        timestamp: "July 11, 2026 - 02:00 PM",
        status: "done",
      },
      {
        title: "4. Vendor Selection",
        desc: "AWS Enterprise Agreement applied.",
        actor: "AWS Account Team",
        timestamp: "July 11, 2026 - 04:30 PM",
        status: "done",
      },
      {
        title: "5. Purchase Order Issued",
        desc: "PO-2026-7780 issued for AWS cloud credits.",
        actor: "Procurement Ops",
        timestamp: "July 12, 2026 - 09:00 AM",
        status: "done",
      },
      {
        title: "6. Goods / Service Provisioning",
        desc: "Cloud instance limits and compute credits applied.",
        actor: "DevOps Lead",
        timestamp: "July 12, 2026 - 01:00 PM",
        status: "done",
      },
      {
        title: "7. Finance Approval",
        desc: "Monthly billing cycle invoice matching in progress.",
        actor: "Finance Accounts Payable",
        timestamp: "July 15, 2026 - 11:00 AM",
        status: "active",
      },
      {
        title: "8. Completed & Handover",
        desc: "Final expenditure logged in ER system.",
        actor: "Audit & Finance Desk",
        timestamp: "Pending",
        status: "pending",
      },
    ],
  },
  "REQ-2026-8850": {
    id: "REQ-2026-8850",
    product: "Ergonomic Office Chairs (x5)",
    requester: "James Kim",
    role: "QA Engineer",
    dept: "Engineering & IT",
    cost: "₹1,250.00",
    vendor: "Herman Miller Direct",
    approvedDate: "2026-07-15",
    priority: "Medium",
    currentStep: 8,
    steps: [
      {
        title: "1. Request Submitted",
        desc: "Requisition logged for pod seating.",
        actor: "James Kim",
        timestamp: "July 15, 2026 - 09:00 AM",
        status: "done",
      },
      {
        title: "2. Department Manager Approval",
        desc: "Ergonomic health initiative budget approved.",
        actor: "Sarah Jenkins",
        timestamp: "July 15, 2026 - 11:00 AM",
        status: "done",
      },
      {
        title: "3. Procurement Approval",
        desc: "Office furniture vendor rate verified.",
        actor: "David Chen",
        timestamp: "July 16, 2026 - 10:00 AM",
        status: "done",
      },
      {
        title: "4. Vendor Selection",
        desc: "Herman Miller order placed.",
        actor: "Procurement Ops",
        timestamp: "July 16, 2026 - 02:00 PM",
        status: "done",
      },
      {
        title: "5. Purchase Order Issued",
        desc: "PO-2026-8812 issued.",
        actor: "Procurement Ops",
        timestamp: "July 17, 2026 - 09:00 AM",
        status: "done",
      },
      {
        title: "6. Goods Delivered",
        desc: "Delivered to HQ Warehouse Bay 4.",
        actor: "Inventory Manager",
        timestamp: "July 18, 2026 - 03:30 PM",
        status: "done",
      },
      {
        title: "7. Finance Approval",
        desc: "Invoice matching cleared.",
        actor: "Accounts Payable",
        timestamp: "July 19, 2026 - 10:00 AM",
        status: "done",
      },
      {
        title: "8. Completed & Handover",
        desc: "Chairs assembled and placed at QA pod.",
        actor: "Facilities & IT Desk",
        timestamp: "July 19, 2026 - 04:00 PM",
        status: "done",
      },
    ],
  },
  "REQ-2026-8710": {
    id: "REQ-2026-8710",
    product: "Dell UltraSharp 32'' 4K Monitors (x3)",
    requester: "Priya Sharma",
    role: "Lead QA Engineer",
    dept: "Engineering & IT",
    cost: "₹2,400.00",
    vendor: "Dell Commercial Direct",
    approvedDate: "2026-06-28",
    priority: "Medium",
    currentStep: 5,
    steps: [
      {
        title: "1. Request Submitted",
        desc: "Display request created.",
        actor: "Priya Sharma",
        timestamp: "June 28, 2026 - 11:20 AM",
        status: "done",
      },
      {
        title: "2. Department Manager Approval",
        desc: "Department Manager approved.",
        actor: "Sarah Jenkins",
        timestamp: "June 28, 2026 - 03:00 PM",
        status: "done",
      },
      {
        title: "3. Procurement Approval",
        desc: "Hardware spec approved.",
        actor: "David Chen",
        timestamp: "June 29, 2026 - 09:30 AM",
        status: "done",
      },
      {
        title: "4. Vendor Selection",
        desc: "Dell commercial pricing applied.",
        actor: "Procurement Exec",
        timestamp: "June 29, 2026 - 01:15 PM",
        status: "done",
      },
      {
        title: "5. Purchase Order Issued",
        desc: "PO-2026-6610 dispatched to Dell.",
        actor: "Procurement Manager",
        timestamp: "June 30, 2026 - 10:00 AM",
        status: "active",
      },
      {
        title: "6. Goods Delivered",
        desc: "Awaiting shipment arrival.",
        actor: "Inventory Desk",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "7. Finance Approval",
        desc: "Pending delivery confirmation.",
        actor: "Accounts Payable",
        timestamp: "Pending",
        status: "pending",
      },
      {
        title: "8. Completed & Handover",
        desc: "Asset tagging pending.",
        actor: "IT Asset Desk",
        timestamp: "Pending",
        status: "pending",
      },
    ],
  },
};

import { epsEventBus, fetchTrackForms } from "../../../../../services/epsApiService";

const TrackForms = ({ initialReqId }) => {
  const [workflows, setWorkflows] = useState(() => mockApprovedWorkflows);
  const [selectedReqId, setSelectedReqId] = useState(initialReqId || "REQ-2026-8894");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadWorkflows = async () => {
      const liveData = await fetchTrackForms();
      if (liveData && Object.keys(liveData).length > 0) {
        setWorkflows(liveData);
        if (!liveData[selectedReqId]) {
          setSelectedReqId(Object.keys(liveData)[0]);
        }
      }
    };
    loadWorkflows();
    const unsub = epsEventBus.subscribe(async () => {
      const liveData = await fetchTrackForms();
      setWorkflows(liveData);
    });
    return unsub;
  }, [selectedReqId]);

  const approvedList = Object.values(workflows);

  const filteredList = approvedList.filter((req) => {
    const term = searchTerm.toLowerCase();
    return (
      req.id.toLowerCase().includes(term) ||
      req.requester.toLowerCase().includes(term) ||
      req.product.toLowerCase().includes(term) ||
      req.vendor.toLowerCase().includes(term)
    );
  });

  const activeWorkflow =
    workflows[selectedReqId] ||
    Object.values(workflows)[0] ||
    mockApprovedWorkflows["REQ-2026-8894"];

  return (
    <div className="dm-track-forms-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <Clock color="#f8b400" /> Approved Requisitions Workflow Tracker
          </h1>
          <p className="dm-page-subtitle">
            Real-time 8-stage pipeline tracking for employee forms approved by Department Management.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              background: "rgba(5, 150, 105, 0.12)",
              color: "#059669",
              border: "1px solid rgba(5, 150, 105, 0.3)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={16} /> Filtered: Approved Forms Only
          </span>
        </div>
      </div>

      {/* Info Alert Box */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fef3c7",
          borderLeft: "4px solid #f8b400",
          borderRadius: "12px",
          padding: "14px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "13px", color: "#92400e" }}>
          <strong>Tracking Scope Notice:</strong> As a Department Manager, you can track live progress for <strong>approved forms only</strong>. Requisitions pending approval remain in your Approval Queue until decision sign-off.
        </div>
      </div>

      {/* Control Bar: Selector & Search */}
      <div
        className="dm-card"
        style={{
          marginBottom: "24px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Requisition Dropdown Selector */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", color: "#555555", fontWeight: "800", textTransform: "uppercase" }}>
            Select Approved Requisition to Track:
          </label>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="dm-form-input"
            style={{
              borderColor: "#f8b400",
              fontWeight: "700",
              height: "44px",
              fontSize: "14px",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            {filteredList.map((req) => (
              <option key={req.id} value={req.id}>
                {req.id} - {req.product} ({req.requester})
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", color: "#555555", fontWeight: "800", textTransform: "uppercase" }}>
            Search Approved Forms:
          </label>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              color="#666666"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by ID, Requester, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dm-form-input"
              style={{ paddingLeft: "42px", height: "44px", fontSize: "14px" }}
            />
          </div>
        </div>
      </div>

      {/* Selected Request Tracking Overview Banner */}
      <div
        className="dm-card"
        style={{
          marginBottom: "28px",
          padding: "24px 28px",
          borderLeft: "5px solid #059669",
          background: "linear-gradient(135deg, #ffffff 0%, #f4fbf7 100%)",
          boxShadow: "0 10px 30px rgba(5, 150, 105, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  background:
                    activeWorkflow.status === "rejected"
                      ? "#dc2626"
                      : activeWorkflow.status === "pending"
                      ? "#d97706"
                      : "#059669",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                }}
              >
                {activeWorkflow.status === "rejected"
                  ? "Manager Rejected"
                  : activeWorkflow.status === "pending"
                  ? "Pending Approval"
                  : "Manager Approved"}
              </span>
              <span style={{ color: "#555555", fontSize: "13px", fontWeight: "700" }}>
                TRACKING ID: {activeWorkflow.id}
              </span>
            </div>

            <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "800", margin: "4px 0 8px" }}>
              {activeWorkflow.product}
            </h2>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "13px", color: "#444444" }}>
              <div>
                Requester: <strong style={{ color: "#111111" }}>{activeWorkflow.requester}</strong> ({activeWorkflow.role})
              </div>
              <div>
                Supplier: <strong style={{ color: "#111111" }}>{activeWorkflow.vendor}</strong>
              </div>
              <div>
                Approved Cost: <strong style={{ color: "#059669", fontSize: "15px" }}>{activeWorkflow.cost}</strong>
              </div>
              <div>
                Manager Approval Date: <strong style={{ color: "#111111" }}>{activeWorkflow.approvedDate}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right", minWidth: "160px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#666666",
                textTransform: "uppercase",
                display: "block",
                fontWeight: "700",
              }}
            >
              Current Status
            </span>
            <span style={{ fontSize: "24px", color: "#059669", fontWeight: "800" }}>
              Stage {activeWorkflow.currentStep} of 8
            </span>
            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: activeWorkflow.currentStep === 8 ? "#059669" : "#d97706",
                fontWeight: "700",
                marginTop: "2px",
              }}
            >
              {activeWorkflow.currentStep === 8 ? "Fulfillment Completed" : "In Sourcing & Delivery Pipeline"}
            </span>
          </div>
        </div>

        {/* Progress Line Bar */}
        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#e2e8f0",
            borderRadius: "6px",
            marginTop: "22px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(activeWorkflow.currentStep / 8) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #f8b400 0%, #059669 100%)",
              borderRadius: "6px",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>

      {/* 8-Stage Interactive Timeline Container */}
      <div className="dm-card" style={{ padding: "28px" }}>
        <h3
          style={{
            color: "#111111",
            fontSize: "18px",
            fontWeight: "800",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <PackageCheck color="#059669" size={22} /> Requisition Fulfillment & Approval Pipeline
        </h3>

        <div className="dm-timeline-container">
          {activeWorkflow.steps.map((step, index) => (
            <div
              key={index}
              className={`dm-timeline-item ${step.status}`}
              style={{ opacity: step.status === "pending" ? 0.55 : 1 }}
            >
              <div className="dm-timeline-node">
                {step.status === "done" && <CheckCircle2 size={13} color="#ffffff" />}
                {step.status === "active" && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#000000",
                    }}
                  />
                )}
              </div>

              <div className="dm-timeline-content">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <h4
                    style={{
                      color:
                        step.status === "done"
                          ? "#059669"
                          : step.status === "active"
                          ? "#d97706"
                          : "#111111",
                      fontSize: "15px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {step.title}
                  </h4>
                  <span style={{ fontSize: "12px", color: "#666666", fontWeight: "600" }}>
                    {step.timestamp}
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "#555555", marginBottom: "8px", lineHeight: "1.4" }}>
                  {step.desc}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: step.status === "done" ? "#059669" : "#d97706",
                    fontWeight: "700",
                  }}
                >
                  <UserCheck size={14} />
                  <span>
                    Actioned By: <strong>{step.actor}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackForms;
