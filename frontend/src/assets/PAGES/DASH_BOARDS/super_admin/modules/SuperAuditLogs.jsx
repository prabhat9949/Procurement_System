import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Search,
  Download,
  Eye,
  Filter,
} from "lucide-react";

const initialLogs = [
  { logId: "LOG-SYS-901", category: "System Log", actor: "Gideon Cross (Super Admin)", action: "System Security Policy Baseline Updated", status: "Verified", date: "2026-07-27 09:05 AM" },
  { logId: "LOG-USR-902", category: "User Activity", actor: "Alexander Vance (Org Admin)", action: "Power BI Dataset Refresh Executed", status: "Verified", date: "2026-07-27 08:45 AM" },
  { logId: "LOG-FIN-903", category: "Financial Log", actor: "Victoria Vance (CFO)", action: "Approved Payment Remittance PAY-2026-904", status: "Reconciled", date: "2026-07-26 04:30 PM" },
  { logId: "LOG-PRC-904", category: "Procurement Log", actor: "David Chen (Sourcing Exec)", action: "Dispatched Purchase Order PO-2026-4401", status: "Verified", date: "2026-07-26 11:20 AM" },
  { logId: "LOG-INV-905", category: "Inventory Log", actor: "Marcus Vance (Inventory)", action: "Wrote off damaged Cisco Switch SKU-NET-992", status: "Audited", date: "2026-07-25 03:15 PM" },
  { logId: "LOG-SEC-906", category: "Security Log", actor: "Azure Sentinel node", action: "Tor exit node login attempt blocked from IP 185.220.101.44", status: "Threat Blocked", date: "2026-07-25 11:22 PM" }
];

const SuperAuditLogs = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const triggerExport = (format) => {
    alert(`Exporting system audit logs ledger in ${format} format...`);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.logId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || l.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="sadmin-audit-logs-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FileText color="#f8b400" size={28} /> Immutable System Audit Logs
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit trace ledger recording immutable root modifications, CFO wire payments, inventory adjustments, and Sentinel block events.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="sadmin-btn-primary-sm" onClick={() => triggerExport("PDF")}>
            <Download size={14} /> Export Audit (PDF)
          </button>
          <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => triggerExport("Excel")}>
            <Download size={14} /> Export (Excel)
          </button>
        </div>
      </div>

      {/* Control Filters */}
      <div className="sadmin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search Log ID, Actor, Event..."
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

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Log Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}
          >
            <option value="All">All Categories</option>
            <option value="User Activity">User Activity</option>
            <option value="System Log">System Logs</option>
            <option value="Financial Log">Financial Logs</option>
            <option value="Procurement Log">Procurement Logs</option>
            <option value="Inventory Log">Inventory Logs</option>
            <option value="Security Log">Security Logs</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        <div className="sadmin-table-container">
          <table className="sadmin-table">
            <thead>
              <tr>
                <th>Log Code</th>
                <th>Category Area</th>
                <th>Timestamp</th>
                <th>Actioning Actor</th>
                <th>Detailed Event Checked</th>
                <th>Audit status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l) => (
                <tr key={l.logId}>
                  <td style={{ fontWeight: "800", color: l.category === "Security Log" ? "#dc2626" : "#d97706" }}>{l.logId}</td>
                  <td style={{ fontWeight: "700" }}>{l.category}</td>
                  <td style={{ color: "#777", fontSize: "13.5px" }}>{l.date}</td>
                  <td style={{ fontWeight: "600" }}>{l.actor}</td>
                  <td style={{ fontWeight: "600" }}>{l.action}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: l.status.includes("Blocked") ? "rgba(220, 38, 38, 0.12)" : "rgba(5, 150, 105, 0.12)",
                        color: l.status.includes("Blocked") ? "#dc2626" : "#059669",
                      }}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SuperAuditLogs;
