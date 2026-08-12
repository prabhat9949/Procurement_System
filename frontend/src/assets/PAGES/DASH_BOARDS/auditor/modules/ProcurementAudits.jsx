import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Eye,
  Download,
  X,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Filter,
  CheckCircle,
} from "lucide-react";

const initialProcurementAudits = [
  {
    id: "AUD-PRC-301",
    reqId: "REQ-2026-8921",
    poId: "PO-2026-4401",
    item: "MacBook Pro M3 Max 64GB Workstations (x10)",
    dept: "Engineering & IT",
    vendor: "Apple Business Direct",
    amount: 36990.00,
    status: "Verified - Compliant",
    date: "2026-07-26",
    timeline: [
      { step: "REQ Raised", date: "2026-07-24", actor: "Engineering Manager" },
      { step: "RFQ Issued", date: "2026-07-25", actor: "Procurement Executive" },
      { step: "CFO Approved", date: "2026-07-26", actor: "Victoria Vance (CFO)" },
    ],
    violations: "None",
  },
  {
    id: "AUD-PRC-302",
    reqId: "REQ-2026-8955",
    poId: "PO-2026-4409",
    item: "Office Ergonomic Desks (x15)",
    dept: "HR & Operations",
    vendor: "Custom Office Designs",
    amount: 15200.00,
    status: "Policy Violation Flagged",
    date: "2026-07-25",
    timeline: [
      { step: "REQ Raised", date: "2026-07-22", actor: "HR Admin" },
      { step: "RFQ Bypassed", date: "2026-07-23", actor: "Sourcing Executive" },
      { step: "Disbursed", date: "2026-07-24", actor: "System Auto-Release" },
    ],
    violations: "Single quote sourcing limit exceeded without justification approval.",
  },
  {
    id: "AUD-PRC-303",
    reqId: "REQ-2026-8990",
    poId: "PO-2026-4412",
    item: "Dell PowerEdge R760 Rack Servers (x4)",
    dept: "Engineering & IT",
    vendor: "Dell Technologies",
    amount: 54200.00,
    status: "Verified - Compliant",
    date: "2026-07-26",
    timeline: [
      { step: "REQ Raised", date: "2026-07-23", actor: "IT Lead" },
      { step: "RFQ Competed", date: "2026-07-24", actor: "Procurement Desk" },
      { step: "CFO Approved", date: "2026-07-26", actor: "Victoria Vance (CFO)" },
    ],
    violations: "None",
  }
];

const initialAuditTrailLogs = [
  { logId: "TRL-9901", reqId: "REQ-2026-8921", event: "Workflow signature verified", status: "Pass", timestamp: "2026-07-26 10:15 AM", auditor: "Arthur Sterling" },
  { logId: "TRL-9902", reqId: "REQ-2026-8955", event: "Policy ceiling threshold violation detected", status: "Fail", timestamp: "2026-07-25 04:30 PM", auditor: "System Rule Engine" },
  { logId: "TRL-9903", reqId: "REQ-2026-8990", event: "RFQ competitor log match check", status: "Pass", timestamp: "2026-07-26 11:45 AM", auditor: "Arthur Sterling" },
];

const ProcurementAudits = () => {
  const [audits, setAudits] = useState(initialProcurementAudits);
  const [logs, setLogs] = useState(initialAuditTrailLogs);
  const [activeSubTab, setActiveSubTab] = useState("workflows"); // workflows, trails, statistics
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuditDetail, setSelectedAuditDetail] = useState(null);

  const triggerDownload = (id) => {
    alert(`Downloading procurement audit report ${id}.pdf...`);
  };

  const filteredAudits = audits.filter(
    (a) =>
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reqId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="aud-proc-audits-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ShieldCheck color="#f8b400" size={28} /> Procurement Workflow Audits
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Verify that purchase requests, vendor competition logs, and workflow sign-offs comply with organizational rules and threshold guidelines.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("workflows")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "workflows" ? "700" : "500",
            color: activeSubTab === "workflows" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "workflows" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Procurement Requests & Workflow Verification
        </button>
        <button
          onClick={() => setActiveSubTab("trails")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "trails" ? "700" : "500",
            color: activeSubTab === "trails" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "trails" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Audit Trail Logs
        </button>
        <button
          onClick={() => setActiveSubTab("statistics")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "statistics" ? "700" : "500",
            color: activeSubTab === "statistics" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "statistics" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Department Spending & Violations
        </button>
      </div>

      {/* Search and Filters */}
      {activeSubTab !== "statistics" && (
        <div className="aud-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px" }}>
          <div style={{ position: "relative", width: "360px" }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search Audit ID, Request Code, Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                borderRadius: "8px",
                border: "1px solid #d9d9d9",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      )}

      {/* 1. Workflows Tab */}
      {activeSubTab === "workflows" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Audit Code</th>
                  <th>REQ Reference</th>
                  <th>PO Reference</th>
                  <th>Item Description</th>
                  <th>Department</th>
                  <th>Awarded Vendor</th>
                  <th>Total Amount</th>
                  <th>Compliance Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{a.id}</td>
                    <td style={{ color: "#666" }}>{a.reqId}</td>
                    <td style={{ color: "#666" }}>{a.poId}</td>
                    <td style={{ fontWeight: "700" }}>{a.item}</td>
                    <td>{a.dept}</td>
                    <td>{a.vendor}</td>
                    <td style={{ fontWeight: "800", color: "#059669" }}>${a.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: a.status.includes("Compliant") ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                          color: a.status.includes("Compliant") ? "#059669" : "#dc2626",
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          className="aud-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                          onClick={() => triggerDownload(a.id)}
                          title="Download Audit Certificate"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="aud-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                          onClick={() => setSelectedAuditDetail(a)}
                          title="View Compliance Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Trails Tab */}
      {activeSubTab === "trails" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Request ID</th>
                  <th>Event Log Description</th>
                  <th>Audit Result</th>
                  <th>Timestamp</th>
                  <th>Verified By</th>
                </tr>
              </thead>
              <tbody>
                {logs
                  .filter(l => l.reqId.toLowerCase().includes(searchTerm.toLowerCase()) || l.logId.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((l) => (
                    <tr key={l.logId}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{l.logId}</td>
                      <td>{l.reqId}</td>
                      <td style={{ fontWeight: "600" }}>{l.event}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: l.status === "Pass" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            color: l.status === "Pass" ? "#059669" : "#dc2626",
                          }}
                        >
                          {l.status === "Pass" ? "Audit Pass" : "Audit Fail"}
                        </span>
                      </td>
                      <td>{l.timestamp}</td>
                      <td style={{ fontWeight: "600" }}>{l.auditor}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Statistics & Spending Tab */}
      {activeSubTab === "statistics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "24px" }}>
          
          {/* Dept Spending report */}
          <div className="aud-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
              Department-wise Procurement Spending
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Engineering & IT</span>
                  <strong>$91,190.00</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "85%", height: "100%", background: "#059669", borderRadius: "4px" }} />
                </div>
              </div>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>HR & Operations</span>
                  <strong>$15,200.00</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "15%", height: "100%", background: "#f8b400", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Policy Violations */}
          <div className="aud-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Policy Violations Flagged
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {audits.filter(a => a.violations !== "None").map((a) => (
                <div key={a.id} style={{ padding: "12px 14px", background: "rgba(220,38,38,0.06)", border: "1px dashed rgba(220,38,38,0.25)", borderRadius: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ color: "#dc2626" }}>{a.id} - Violation</strong>
                    <span style={{ color: "#777" }}>{a.date}</span>
                  </div>
                  <p style={{ margin: "6px 0 0", color: "#333" }}>{a.violations}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Verification Detail Modal */}
      {selectedAuditDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>COMPLIANCE WORKFLOW TIMELINE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Audit Code: {selectedAuditDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditDetail(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px", fontSize: "13.5px" }}>
                <strong>Product Specification:</strong> {selectedAuditDetail.item} <br />
                <strong>Cost Center Department:</strong> {selectedAuditDetail.dept} <br />
                <strong>Vendor Supplier:</strong> {selectedAuditDetail.vendor} <br />
                <strong>Disbursement Total:</strong> <strong style={{ color: "#059669" }}>${selectedAuditDetail.amount.toLocaleString()}</strong>
              </div>

              {/* Timeline list */}
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "12px" }}>Requisition Approval Steps</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                {selectedAuditDetail.timeline.map((step, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", position: "relative" }}>
                    {idx < selectedAuditDetail.timeline.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          left: "9px",
                          top: "20px",
                          bottom: "-16px",
                          width: "2px",
                          background: "#e2e8f0",
                        }}
                      />
                    )}
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#f8b400", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "800", color: "#111", zIndex: 2 }}>
                      ✓
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "#111" }}>{step.step}</p>
                      <span style={{ fontSize: "11px", color: "#888" }}>Actioned on {step.date} by {step.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="aud-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedAuditDetail(null)}
              >
                Close Audit details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProcurementAudits;
