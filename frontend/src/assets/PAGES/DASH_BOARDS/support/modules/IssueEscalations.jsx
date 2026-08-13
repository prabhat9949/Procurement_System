import React, { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  UserCheck,
  Clock,
  AlertTriangle,
  FileText,
  BarChart,
  Activity,
  Award,
} from "lucide-react";

const escalationWorkflowsMock = {
  "TICK-2026-104": {
    ticketId: "TICK-2026-104",
    issue: "PO-2026-4401 countersign notification email delivery delay.",
    user: "David Chen (Senior Sourcing Exec)",
    assignedDept: "DevOps & Sourcing Infrastructure",
    currentStep: 6,
    priority: "Critical Priority",
    steps: [
      { title: "1. Support Ticket Created", desc: "Ticket logged via Help Portal.", actor: "David Chen", status: "done" },
      { title: "2. Issue Assigned", desc: "Assigned to Samantha Sterling.", actor: "Help Desk Router", status: "done" },
      { title: "3. Issue Investigation", desc: "Inspected SMTP mail queue logs.", actor: "Samantha Sterling", status: "done" },
      { title: "4. Support Resolution", desc: "Standard mail resend failed due to gateway timeout.", actor: "Level 1 Desk", status: "done" },
      { title: "5. Escalation Required", desc: "Escalated to Tier 3 Lead Engineering Ops.", actor: "Samantha Sterling", status: "done" },
      { title: "6. Senior Support Review", desc: "Senior DevOps reviewing SMTP gateway routing rules.", actor: "DevOps Ops Team", status: "active" },
      { title: "7. Issue Resolved", desc: "Mail gateway route cleared.", actor: "Pending", status: "pending" },
      { title: "8. Ticket Closed", desc: "Resolution confirmation sent to requestor.", actor: "Help Desk Automated", status: "pending" },
    ],
  },
  "TICK-2026-112": {
    ticketId: "TICK-2026-112",
    issue: "Invoice INV-2026-9901 PDF upload validation error.",
    user: "Apple Business Direct (Vendor)",
    assignedDept: "Treasury Integration Team",
    currentStep: 4,
    priority: "High Priority",
    steps: [
      { title: "1. Support Ticket Created", desc: "Ticket logged via Sourcing Desk.", actor: "Apple rep", status: "done" },
      { title: "2. Issue Assigned", desc: "Assigned to Tech Support Team.", actor: "Help Desk Router", status: "done" },
      { title: "3. Issue Investigation", desc: "Verified file size is 8.4MB (less than 10MB limit).", actor: "Tech Support Team", status: "done" },
      { title: "4. Support Resolution", desc: "Triggering API validation logs check for PDF header match.", actor: "Tech Support Team", status: "active" },
      { title: "5. Escalation Required", desc: "Awaiting senior API engineer review.", actor: "Pending", status: "pending" },
      { title: "6. Senior Support Review", desc: "Reviewing JSON payload serialization schema.", actor: "Pending", status: "pending" },
      { title: "7. Issue Resolved", desc: "Upload cleared and parsed.", actor: "Pending", status: "pending" },
      { title: "8. Ticket Closed", desc: "Resolution confirmation sent to supplier.", actor: "Pending", status: "pending" },
    ],
  }
};

const initialDeptReports = [
  { dept: "Sourcing & Sourcing Executive Desk", count: 8, severity: "High" },
  { dept: "Vendor / Supplier Operations Desk", count: 12, severity: "Critical" },
  { dept: "Finance & CFO Treasury Desk", count: 4, severity: "Medium" },
  { dept: "Warehouse Inventory Dock Desk", count: 3, severity: "Low" }
];

const IssueEscalations = () => {
  const [workflows, setWorkflows] = useState(escalationWorkflowsMock);
  const [selectedTicket, setSelectedTicket] = useState("TICK-2026-104");
  const [activeSubTab, setActiveSubTab] = useState("timeline"); // timeline, reports
  const [deptReports, setDeptReports] = useState(initialDeptReports);

  const activeFlow = workflows[selectedTicket];

  return (
    <div className="sup-escalations-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sup-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sup-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ArrowUpRight color="#dc2626" size={28} /> Tier 3 Escalations & Pipeline
          </h1>
          <p className="sup-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Monitor unresolved tickets escalated to specialized engineering, finance, or compliance departments through the 8-Stage lifecycle.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("timeline")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "timeline" ? "700" : "500",
            color: activeSubTab === "timeline" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "timeline" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          8-Stage Escalation Lifecycle Timeline
        </button>
        <button
          onClick={() => setActiveSubTab("reports")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "reports" ? "700" : "500",
            color: activeSubTab === "reports" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "reports" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Department-wise Escalation Reports
        </button>
      </div>

      {/* 1. Timeline Tab */}
      {activeSubTab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Selector & status summary card */}
          <div className="sup-card sup-card-gold-glow" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#555" }}>Escalated Ticket:</span>
                <select
                  value={selectedTicket}
                  onChange={(e) => setSelectedTicket(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff", fontWeight: "700" }}
                >
                  <option value="TICK-2026-104">TICK-2026-104 (SMTP Gateway Delay)</option>
                  <option value="TICK-2026-112">TICK-2026-112 (PDF Parsing Error)</option>
                </select>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  background: activeFlow.priority.includes("Critical") ? "rgba(220,38,38,0.12)" : "rgba(217,119,6,0.12)",
                  color: activeFlow.priority.includes("Critical") ? "#dc2626" : "#d97706",
                  padding: "4px 12px",
                  borderRadius: "12px",
                }}
              >
                {activeFlow.priority}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase" }}>Issue Description</span>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{activeFlow.issue}</h3>
                <p style={{ margin: "2px 0 0", color: "#555", fontSize: "13.5px" }}>
                  Assigned Department: <strong>{activeFlow.assignedDept}</strong> | Caller: <strong>{activeFlow.user}</strong>
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11.5px", color: "#666", textTransform: "uppercase" }}>Escalation Status</span>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626", margin: "2px 0 0" }}>Stage {activeFlow.currentStep} of 8</p>
              </div>
            </div>
          </div>

          {/* 8-Stage Timeline */}
          <div className="sup-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ color: "#111111", fontSize: "16px", fontWeight: "700", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "28px" }}>
              Escalation Resolution Lifecycle Steps
            </h3>

            <div className="emp-timeline-container">
              {activeFlow.steps.map((step, index) => (
                <div
                  key={index}
                  className={`emp-timeline-item ${step.status}`}
                  style={{ opacity: step.status === "pending" ? 0.5 : 1 }}
                >
                  <div className="emp-timeline-node">
                    {step.status === "done" && <CheckCircle2 size={12} color="#ffffff" />}
                    {step.status === "active" && (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#000000" }} />
                    )}
                  </div>

                  <div className="emp-timeline-content">
                    <h4 style={{ color: step.status === "active" ? "#dc2626" : "#111111", fontSize: "14.5px", fontWeight: "700" }}>
                      {step.title}
                    </h4>
                    <p style={{ fontSize: "13px", color: "#555555", marginTop: "2px" }}>{step.desc}</p>
                    <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "600", marginTop: "4px", display: "inline-block" }}>
                      Actioned By: <strong>{step.actor}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Reports Tab */}
      {activeSubTab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Dept stats */}
          <div className="sup-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
              Department-wise Escalation Outlays
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {deptReports.map((r, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", fontWeight: "600", marginBottom: "6px" }}>
                    <span>{r.dept}</span>
                    <strong>{r.count} Tickets ({r.severity} Risk)</strong>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                    <div
                      style={{
                        width: `${(r.count / 15) * 100}%`,
                        height: "100%",
                        background: r.severity === "Critical" ? "#dc2626" : r.severity === "High" ? "#d97706" : "#059669",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolutions summary */}
          <div className="sup-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", height: "fit-content" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Resolution Tracking Performance
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                <span>Avg Resolution Time (Tier 3)</span>
                <strong>4.5 Hours</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                <span>First Contact Resolution %</span>
                <strong>88.4% Passed</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                <span>Active escalated tickets</span>
                <strong style={{ color: "#dc2626" }}>2 Open</strong>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default IssueEscalations;
