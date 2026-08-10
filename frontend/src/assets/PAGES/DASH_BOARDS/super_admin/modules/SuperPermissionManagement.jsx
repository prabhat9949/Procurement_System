import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  History,
} from "lucide-react";

const initialTemplates = [
  { id: "TMPL-01", name: "Standard Requester Policy", scope: "Procurement Requests (Read/Write), Catalog (Read)", orgScope: "Subsidiary-only", level: "Read/Write" },
  { id: "TMPL-02", name: "Finance Disburser Policy", scope: "Payment Approvals (Read/Write/Approve), Invoice Clearance (Read/Write)", orgScope: "Subsidiary-only", level: "Approve / Disburse" },
  { id: "TMPL-03", name: "Global Governance Auditor Policy", scope: "All Modules Audits (Read-only), compliance monitoring", orgScope: "Tenant-wide (Global)", level: "Read-only Audit" },
  { id: "TMPL-04", name: "Super Root System Control", scope: "All System Configuration Modules (Full control)", orgScope: "Tenant-wide (Global)", level: "Root Access" }
];

const initialPermissionLogs = [
  { logId: "PRM-LOG-101", date: "2026-07-27 08:30 AM", admin: "Gideon Cross", action: "Assigned Template 'Finance Disburser Policy' to Victoria Vance", status: "Pass" },
  { logId: "PRM-LOG-102", date: "2026-07-26 11:20 AM", admin: "Gideon Cross", action: "Modified Template 'Global Governance Auditor' read scope to include Warehouse C Rack layouts", status: "Pass" },
  { logId: "PRM-LOG-103", date: "2026-07-25 02:15 PM", admin: "Gideon Cross", action: "Revoked LATAM-OFFICE write access from Suspicious Sourcing Agent", status: "Pass" }
];

const SuperPermissionManagement = () => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [logs, setLogs] = useState(initialPermissionLogs);
  const [activeSubTab, setActiveSubTab] = useState("templates"); // templates, logs

  const triggerToast = (msg) => {
    alert(msg);
  };

  return (
    <div className="sadmin-perm-mgmt-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Lock color="#f8b400" size={28} /> System Permission Templates & Policies
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Manage fine-grained module access parameters, configure organization scopes, and view permissions update logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("templates")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "templates" ? "700" : "500",
            color: activeSubTab === "templates" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "templates" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Access Control Templates
        </button>
        <button
          onClick={() => setActiveSubTab("logs")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "logs" ? "700" : "500",
            color: activeSubTab === "logs" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "logs" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Permission Modification Logs
        </button>
      </div>

      {/* 1. Templates Tab */}
      {activeSubTab === "templates" && (
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Template Code</th>
                  <th>Policy Template Name</th>
                  <th>Module Scope Parameters</th>
                  <th>Subsidiary Tenant Scope</th>
                  <th>Access Clearance Level</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{t.id}</td>
                    <td style={{ fontWeight: "700" }}>{t.name}</td>
                    <td style={{ fontWeight: "600", color: "#555" }}>{t.scope}</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{t.orgScope}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          background: t.level.includes("Root") ? "rgba(220, 38, 38, 0.12)" : "rgba(5, 150, 105, 0.12)",
                          color: t.level.includes("Root") ? "#dc2626" : "#059669",
                          padding: "4px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        {t.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Logs Tab */}
      {activeSubTab === "logs" && (
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Log Code</th>
                  <th>Timestamp</th>
                  <th>Administrator</th>
                  <th>Policy Action Checked</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.logId}>
                    <td style={{ fontWeight: "800", color: "#dc2626" }}>{l.logId}</td>
                    <td>{l.date}</td>
                    <td style={{ fontWeight: "700" }}>{l.admin}</td>
                    <td style={{ fontWeight: "600" }}>{l.action}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "800", background: "rgba(5, 150, 105, 0.12)", color: "#059669", padding: "2px 8px", borderRadius: "12px" }}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperPermissionManagement;
