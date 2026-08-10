import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  FileText,
  Search,
  Download,
  Eye,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building,
  Paperclip,
  ShieldCheck,
  ArrowRight,
  FileCheck,
  AlertCircle
} from "lucide-react";

const teamRequestsMock = [
  {
    id: "REQ-2026-8921",
    requester: "Alex Morgan",
    email: "alex.morgan@enterprise.com",
    role: "Senior Frontend Architect",
    empId: "EMP-90482",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "MacBook Pro M3 Max 64GB",
    category: "Hardware & IT",
    vendor: "Apple Business Direct",
    cost: "$3,899.00",
    rawCost: 3899,
    priority: "Urgent",
    status: "pending",
    date: "2026-07-24",
    time: "10:42 AM EST",
    justification: "Required for high-performance mobile software compilation, local LLM testing, and multi-display output.",
    projectCode: "PRJ-2026-FE-ARCH",
    attachments: ["Quotation_Apple_Direct_2026.pdf", "Tech_Architecture_Approval.pdf"],
    managerDecision: null,
  },
  {
    id: "REQ-2026-8945",
    requester: "David Miller",
    email: "david.miller@enterprise.com",
    role: "DevOps Lead",
    empId: "EMP-77102",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "Datadog APM Enterprise Renewal",
    category: "Software & SaaS",
    vendor: "Datadog Inc.",
    cost: "$8,500.00",
    rawCost: 8500,
    priority: "High",
    status: "pending",
    date: "2026-07-25",
    time: "02:15 PM EST",
    justification: "Annual renewal for production microservice observability and latency telemetry dashboards.",
    projectCode: "PRJ-2026-INFRA",
    attachments: ["Datadog_Enterprise_Quote_2026.pdf"],
    managerDecision: null,
  },
  {
    id: "REQ-2026-8894",
    requester: "Hannah Lee",
    email: "hannah.lee@enterprise.com",
    role: "UI/UX Designer",
    empId: "EMP-44810",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "Figma Enterprise License (20 Seats)",
    category: "Software & SaaS",
    vendor: "Figma Inc.",
    cost: "$4,500.00",
    rawCost: 4500,
    priority: "High",
    status: "approved",
    date: "2026-07-20",
    time: "10:00 AM EST",
    justification: "Annual UX design workspace licenses for the core product design team.",
    projectCode: "PRJ-2026-DESIGN-SYS",
    attachments: ["Figma_Enterprise_Commercial_Quote.pdf"],
    managerDecision: {
      action: "approved",
      approvedBy: "Sarah Jenkins (VP Engineering & IT)",
      decisionDate: "2026-07-20 at 01:20 PM EST",
      approvedCost: "$4,500.00",
      costCenterAllocated: "CC-8902-ENG (Engineering Operational)",
      slaTargetDate: "2026-08-05",
      notes: "Approved by VP Sarah Jenkins. Cost cleared under CC-8902-ENG. Forwarded for PO issuance.",
      verificationHash: "VERIFIED-SIG-SHA256-8894-SJ",
    },
  },
  {
    id: "REQ-2026-8850",
    requester: "James Kim",
    email: "james.kim@enterprise.com",
    role: "QA Engineer",
    empId: "EMP-55109",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "Ergonomic Office Chairs (x5)",
    category: "Office Supplies",
    vendor: "Herman Miller Direct",
    cost: "$1,250.00",
    rawCost: 1250,
    priority: "Medium",
    status: "approved",
    date: "2026-07-15",
    time: "09:00 AM EST",
    justification: "Replacement seating for QA pod to meet health & ergonomics compliance.",
    projectCode: "PRJ-2026-QA-FACILITY",
    attachments: ["Herman_Miller_Quote_8850.pdf"],
    managerDecision: {
      action: "approved",
      approvedBy: "Sarah Jenkins (VP Engineering & IT)",
      decisionDate: "2026-07-15 at 11:00 AM EST",
      approvedCost: "$1,250.00",
      costCenterAllocated: "CC-8902-ENG (Facilities & Pod Budget)",
      slaTargetDate: "2026-08-01",
      notes: "Approved by Sarah Jenkins under team wellness initiative.",
      verificationHash: "VERIFIED-SIG-SHA256-8850-SJ",
    },
  },
  {
    id: "REQ-2026-8812",
    requester: "Alex Morgan",
    email: "alex.morgan@enterprise.com",
    role: "Senior Frontend Architect",
    empId: "EMP-90482",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "AWS Cloud Infrastructure Upgrade",
    category: "Cloud Infrastructure",
    vendor: "Amazon Web Services",
    cost: "$12,000.00",
    rawCost: 12000,
    priority: "High",
    status: "approved",
    date: "2026-07-10",
    time: "08:30 AM EST",
    justification: "Production environment capacity scale-up and RDS multi-AZ cluster redundancy for Q3.",
    projectCode: "PRJ-2026-CLOUD-SCALE",
    attachments: ["AWS_Enterprise_Discount_Agreement.pdf"],
    managerDecision: {
      action: "approved",
      approvedBy: "Sarah Jenkins (VP Engineering & IT)",
      decisionDate: "2026-07-10 at 10:15 AM EST",
      approvedCost: "$12,000.00",
      costCenterAllocated: "CC-8902-ENG (Cloud Infrastructure Budget)",
      slaTargetDate: "2026-07-28",
      notes: "Approved by VP Sarah Jenkins. Essential for Q3 enterprise workload spike.",
      verificationHash: "VERIFIED-SIG-SHA256-8812-SJ",
    },
  },
  {
    id: "REQ-2026-8790",
    requester: "Marcus Vance",
    email: "marcus.vance@enterprise.com",
    role: "Systems Admin",
    empId: "EMP-33120",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "Standing Desk Converters (x2)",
    category: "Office Supplies",
    vendor: "ErgoFurniture Direct",
    cost: "$850.00",
    rawCost: 850,
    priority: "Low",
    status: "rejected",
    date: "2026-07-05",
    time: "02:20 PM EST",
    justification: "Ergonomic upgrades for QA office workstations.",
    projectCode: "PRJ-2026-OFFICE-UP",
    attachments: ["ErgoDesk_Quote.pdf"],
    managerDecision: {
      action: "rejected",
      approvedBy: "Sarah Jenkins (VP Engineering & IT)",
      decisionDate: "2026-07-05 at 04:15 PM EST",
      approvedCost: "$0.00",
      costCenterAllocated: "N/A - Non-allocated",
      slaTargetDate: "N/A",
      notes: "Rejected by Sarah Jenkins: Exceeds non-essential office supply allocation threshold for Q3. Please re-apply next fiscal quarter.",
      verificationHash: "REJECTED-DECISION-SHA256-8790-SJ",
    },
  },
  {
    id: "REQ-2026-8710",
    requester: "Priya Sharma",
    email: "priya.sharma@enterprise.com",
    role: "Lead QA Engineer",
    empId: "EMP-65981",
    dept: "Engineering & IT",
    costCenter: "CC-8902-ENG",
    product: "Dell UltraSharp 32'' 4K Monitors (x3)",
    category: "Hardware & IT",
    vendor: "Dell Commercial Direct",
    cost: "$2,400.00",
    rawCost: 2400,
    priority: "Medium",
    status: "approved",
    date: "2026-06-28",
    time: "11:20 AM EST",
    justification: "Dual monitor setup for senior frontend developers to accelerate UI testing.",
    projectCode: "PRJ-2026-QA-HARDWARE",
    attachments: ["Dell_Commercial_Quote_8710.pdf"],
    managerDecision: {
      action: "approved",
      approvedBy: "Sarah Jenkins (VP Engineering & IT)",
      decisionDate: "2026-06-28 at 03:00 PM EST",
      approvedCost: "$2,400.00",
      costCenterAllocated: "CC-8902-ENG (Hardware Capital)",
      slaTargetDate: "2026-07-20",
      notes: "Approved by VP Sarah Jenkins. Dispatched for PO generation.",
      verificationHash: "VERIFIED-SIG-SHA256-8710-SJ",
    },
  },
];

import { getStoredRequests } from "../../../../../services/purchaseRequestService";
import { epsEventBus, fetchTeamRequisitions } from "../../../../../services/epsApiService";

const TeamRequisitions = ({ onTrackForm }) => {
  const [teamRequests, setTeamRequests] = useState(() => getStoredRequests());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [viewReq, setViewReq] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTeamRequisitions(1);
      if (data && data.length) {
        setTeamRequests(getStoredRequests());
      }
    };
    load();
    const unsub = epsEventBus.subscribe(() => {
      setTeamRequests(getStoredRequests());
    });
    return unsub;
  }, []);

  const filtered = teamRequests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.requester && req.requester.toLowerCase().includes(searchTerm.toLowerCase())) ||
      req.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || req.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" ||
      req.priority.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="dm-team-requisitions-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <FileText color="#f8b400" /> Department Requisitions Directory
          </h1>
          <p className="dm-page-subtitle">
            Complete audit trail of all purchase requisitions submitted across Engineering & IT.
          </p>
        </div>

        <button
          className="dm-btn-primary-sm"
          onClick={() => alert("Exporting Department Requisitions CSV...")}
        >
          <Download size={16} /> Export Requisitions CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="dm-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative", width: "320px" }}>
            <Search
              size={16}
              color="#666666"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by ID, Requester, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dm-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                background: "#f8f9fb",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid #d9d9d9",
              }}
            >
              {["all", "pending", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedStatus === st ? "#f8b400" : "transparent",
                    color: selectedStatus === st ? "#000000" : "#555555",
                    fontWeight: selectedStatus === st ? "700" : "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="dm-form-select"
              style={{ width: "160px", height: "42px", fontSize: "13px" }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="dm-card">
        <div className="dm-table-container">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee / Role</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Est. Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: "700", color: "#d97706" }}>{req.id}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "700", color: "#111111" }}>{req.requester}</span>
                      <span style={{ fontSize: "11px", color: "#666666" }}>{req.role}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: "600", color: "#111111" }}>{req.product}</td>
                  <td style={{ color: "#555555" }}>{req.category}</td>
                  <td style={{ fontWeight: "800", color: "#111111" }}>{req.cost}</td>
                  <td>
                    <span className={`emp-priority ${req.priority.toLowerCase()}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`dm-badge ${req.status}`}>
                      <span className="dm-badge-dot"></span>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ color: "#666666", fontSize: "13px" }}>{req.date}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      {req.status === "approved" && onTrackForm && (
                        <button
                          className="dm-sidebar-toggle"
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "inline-flex",
                            borderColor: "#059669",
                            color: "#059669",
                            background: "rgba(5, 150, 105, 0.08)",
                          }}
                          title="Track Approved Form Status"
                          onClick={() => onTrackForm(req.id)}
                        >
                          <Clock size={15} />
                        </button>
                      )}
                      <button
                        className="dm-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex" }}
                        title="View Full Requisition & Decision Form"
                        onClick={() => setViewReq(req)}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REACT PORTAL: FULL SCREEN ENTIRE FORM & MANAGER FILLED VIEW */}
      {viewReq &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999999,
              background: "#f8f9fb",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                background: "#ffffff",
                borderBottom: "1px solid #ececec",
                padding: "16px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                zIndex: 10,
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#f8b400",
                    color: "#000000",
                    fontWeight: "800",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  EPS
                </div>
                <div>
                  <span
                    style={{
                      background: "rgba(248, 180, 0, 0.15)",
                      color: "#d97706",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "800",
                      marginRight: "8px",
                    }}
                  >
                    FULL AUDIT FORM VIEW
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: "#111111" }}>
                    {viewReq.id}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>
                Complete Purchase Requisition & Manager Decision Record
              </h3>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {viewReq.status === "approved" && onTrackForm && (
                  <button
                    className="dm-btn-primary-sm"
                    style={{ background: "#059669", border: "none", color: "#ffffff" }}
                    onClick={() => {
                      const reqId = viewReq.id;
                      setViewReq(null);
                      onTrackForm(reqId);
                    }}
                  >
                    <Clock size={16} /> Track Live Workflow
                  </button>
                )}
                <button
                  onClick={() => setViewReq(null)}
                  className="dm-btn-primary-sm"
                  style={{
                    background: "#ffffff",
                    color: "#111111",
                    border: "1px solid #d9d9d9",
                    padding: "8px 16px",
                  }}
                >
                  <X size={18} /> Close Full View
                </button>
              </div>
            </div>

            {/* Full Screen Body Content - 2 Columns */}
            <div style={{ padding: "32px", maxWidth: "1500px", margin: "0 auto", width: "100%", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "start" }}>
                
                {/* LEFT COLUMN: Entire Employee Filled Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Employee Requester Details Card */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={18} /> 1. Employee Requester Profile & Metadata
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13.5px" }}>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Employee Name:</span>
                        <p style={{ color: "#111111", fontWeight: "700", fontSize: "15px" }}>{viewReq.requester}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Job Role / Title:</span>
                        <p style={{ color: "#111111", fontWeight: "700" }}>{viewReq.role}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Employee Badge ID:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.empId || "EMP-90482"}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Official Email:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.email || `${viewReq.requester.toLowerCase().replace(" ", ".")}@enterprise.com`}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Department & Cost Center:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.dept || "Engineering & IT"} ({viewReq.costCenter || "CC-8902-ENG"})</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Submission Date & Raised Time:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.date} at {viewReq.time || "10:00 AM EST"}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Priority Urgency:</span>
                        <p style={{ marginTop: "2px" }}>
                          <span className={`emp-priority ${viewReq.priority.toLowerCase()}`}>
                            {viewReq.priority} Priority
                          </span>
                        </p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Current Form Status:</span>
                        <p style={{ marginTop: "2px" }}>
                          <span className={`dm-badge ${viewReq.status}`}>
                            <span className="dm-badge-dot"></span>
                            {viewReq.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Specs Card */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={18} /> 2. Requested Product & Financial Specifications
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13.5px" }}>
                      <div style={{ gridColumn: "span 2" }}>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Product Item Name:</span>
                        <p style={{ color: "#111111", fontWeight: "800", fontSize: "17px" }}>{viewReq.product}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Category:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.category}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Preferred Vendor:</span>
                        <p style={{ color: "#111111", fontWeight: "700" }}>{viewReq.vendor || "Apple Business Direct"}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Total Estimated Cost:</span>
                        <p style={{ color: "#059669", fontWeight: "800", fontSize: "18px" }}>{viewReq.cost}</p>
                      </div>
                      <div>
                        <span style={{ color: "#666666", fontSize: "12px" }}>Project Code:</span>
                        <p style={{ color: "#111111", fontWeight: "600" }}>{viewReq.projectCode || "PRJ-2026-FE-ARCH"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Justification Card */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building size={18} /> 3. Employee Business Justification
                    </h4>
                    <div style={{ background: "#f8f9fb", padding: "16px", borderRadius: "10px", border: "1px solid #ececec" }}>
                      <p style={{ fontSize: "14px", color: "#333333", lineHeight: "1.6", fontStyle: "italic" }}>
                        "{viewReq.justification}"
                      </p>
                    </div>
                  </div>

                  {/* Attached Vendor Documents */}
                  <div className="dm-card">
                    <h4 style={{ fontSize: "16px", color: "#d97706", fontWeight: "800", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Paperclip size={18} /> 4. Attached Vendor Quotation PDFs
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {(viewReq.attachments || ["Vendor_Quote_Approved.pdf"]).map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "#f8f9fb",
                            borderRadius: "10px",
                            border: "1px solid #ececec",
                          }}
                        >
                          <span style={{ color: "#111111", fontWeight: "700", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <Paperclip size={16} color="#f8b400" /> {att}
                          </span>
                          <button
                            className="dm-btn-primary-sm"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                            onClick={() => alert(`Downloading vendor quotation: ${att}`)}
                          >
                            Download PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Manager Filled Form & Decision Record */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "90px" }}>
                  <div className="dm-card dm-card-gold-glow" style={{ borderLeft: viewReq.status === "approved" ? "5px solid #059669" : viewReq.status === "rejected" ? "5px solid #dc2626" : "5px solid #f8b400" }}>
                    <div style={{ borderBottom: "1px solid #ececec", paddingBottom: "16px", marginBottom: "20px" }}>
                      <span style={{ fontSize: "11px", color: viewReq.status === "approved" ? "#059669" : viewReq.status === "rejected" ? "#dc2626" : "#d97706", fontWeight: "800", letterSpacing: "0.5px" }}>
                        DEPARTMENT MANAGER DECISION & SIGN-OFF RECORD
                      </span>
                      <h3 style={{ fontSize: "20px", color: "#111111", fontWeight: "800", marginTop: "4px" }}>
                        Manager Authorization Section
                      </h3>
                      <p style={{ fontSize: "13px", color: "#555555" }}>
                        Official operational sign-off and cost center clearance details.
                      </p>
                    </div>

                    {/* MANAGER DECISION STATUS BOX */}
                    {viewReq.managerDecision ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {/* Status Badge */}
                        <div
                          style={{
                            background: viewReq.status === "approved" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            border: viewReq.status === "approved" ? "1px solid #059669" : "1px solid #dc2626",
                            padding: "14px 18px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {viewReq.status === "approved" ? (
                            <CheckCircle2 size={24} color="#059669" />
                          ) : (
                            <XCircle size={24} color="#dc2626" />
                          )}
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: viewReq.status === "approved" ? "#059669" : "#dc2626" }}>
                              DECISION RESULT
                            </span>
                            <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#111111", margin: "2px 0 0" }}>
                              {viewReq.status === "approved" ? "APPROVED & AUTHORIZED" : "REJECTED & RETURNED"}
                            </h4>
                          </div>
                        </div>

                        {/* Manager Filled Fields Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                          <div style={{ gridColumn: "span 2" }}>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Sign-off Officer:</span>
                            <p style={{ fontWeight: "800", color: "#111111", fontSize: "14.5px" }}>
                              {viewReq.managerDecision.approvedBy}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Decision Timestamp:</span>
                            <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.managerDecision.decisionDate}</p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Approved Amount:</span>
                            <p style={{ fontWeight: "800", color: viewReq.status === "approved" ? "#059669" : "#dc2626", fontSize: "15px" }}>
                              {viewReq.managerDecision.approvedCost}
                            </p>
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Allocated Cost Center:</span>
                            <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.managerDecision.costCenterAllocated}</p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Target SLA Fulfillment:</span>
                            <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.managerDecision.slaTargetDate}</p>
                          </div>
                          <div>
                            <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Security Hash:</span>
                            <p style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace", fontWeight: "700" }}>
                              {viewReq.managerDecision.verificationHash}
                            </p>
                          </div>
                        </div>

                        {/* Manager Notes */}
                        <div>
                          <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>
                            Manager Remarks & Approval Instructions:
                          </span>
                          <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", marginTop: "6px" }}>
                            <p style={{ fontSize: "13.5px", color: "#222222", lineHeight: "1.5" }}>
                              {viewReq.managerDecision.notes}
                            </p>
                          </div>
                        </div>

                        {/* Track button for approved forms */}
                        {viewReq.status === "approved" && onTrackForm && (
                          <button
                            className="dm-btn-primary-sm"
                            style={{
                              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                              color: "#ffffff",
                              fontWeight: "800",
                              padding: "12px 20px",
                              width: "100%",
                              justifyContent: "center",
                              marginTop: "8px",
                            }}
                            onClick={() => {
                              const reqId = viewReq.id;
                              setViewReq(null);
                              onTrackForm(reqId);
                            }}
                          >
                            <Clock size={18} /> Track Live Workflow Pipeline
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Pending Manager Decision State */
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div
                          style={{
                            background: "rgba(248, 180, 0, 0.15)",
                            border: "1px solid #f8b400",
                            padding: "16px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <Clock size={24} color="#d97706" />
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#d97706" }}>
                              DECISION STATUS
                            </span>
                            <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#111111", margin: "2px 0 0" }}>
                              PENDING MANAGER REVIEW
                            </h4>
                          </div>
                        </div>

                        <p style={{ fontSize: "13px", color: "#555555", lineHeight: "1.5" }}>
                          This requisition has been submitted by employee <strong>{viewReq.requester}</strong> and is currently waiting for manager review and sign-off in your Approval Queue.
                        </p>

                        <div style={{ background: "#f8f9fb", padding: "14px", borderRadius: "10px", border: "1px solid #ececec", fontSize: "12.5px", color: "#666" }}>
                          <span style={{ fontWeight: "700", color: "#111" }}>Next Step:</span> Open the Approval Queue to approve, reject, or request clarification on this requisition.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TeamRequisitions;
