import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, Loader2, WifiOff, Download, FileText, ClipboardList } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const AuditReports = () => {
  const [cases, setCases] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [c, l] = await Promise.all([
        apiGet("/api/audits/my-queue?page=0&size=200&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/audit-logs?page=0&size=100").catch(() => null),
      ]);
      setCases(c?.content || []);
      setLogs(l?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load audit reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const exportCSV = (filename, headers, rows) => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="aud-page-header">
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderKanban color="#dc2626" /> Audit Reports
          </h1>
          <p className="aud-page-subtitle">Generated from the live database — audit cases and the immutable audit trail.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Generating reports...
        </div>
      ) : (
        <>
          <div className="aud-card" style={{ overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #ececec" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", display: "flex", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={16} color="#dc2626" /> Audit Case Register ({cases.length})
              </h4>
              <button className="aud-btn-primary-sm" onClick={() => exportCSV("audit-case-register.csv",
                ["Case", "PR", "Requester", "Department", "Amount", "Risk", "Status", "Assigned", "Due"],
                cases.map((c) => [c.caseNumber, c.requestNumber, c.requesterName, c.department, c.estimatedAmount, c.riskLevel, c.status, c.assignedDate, c.dueDate]))}>
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="aud-table-container">
              <table className="aud-table">
                <thead>
                  <tr><th>Case</th><th>PR</th><th>Requester</th><th>Department</th><th>Amount</th><th>Risk</th><th>Status</th><th>Due</th></tr>
                </thead>
                <tbody>
                  {cases.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No audit cases yet.</td></tr>
                  ) : cases.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: "800", color: "#dc2626" }}>{c.caseNumber}</td>
                      <td style={{ fontWeight: 600 }}>{c.requestNumber}</td>
                      <td>{c.requesterName}</td>
                      <td style={{ fontSize: "13px" }}>{c.department}</td>
                      <td style={{ fontWeight: 700 }}>{formatINR(c.estimatedAmount)}</td>
                      <td>{c.riskLevel}</td>
                      <td>{c.status}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(c.dueDate, { withTime: false })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="aud-card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #ececec" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} color="#d97706" /> Audit Log Trail ({logs.length})
              </h4>
              <button className="aud-btn-primary-sm" onClick={() => exportCSV("audit-log-trail.csv",
                ["Module", "Entity", "Operation", "Reference", "Performed By", "Outcome", "Time"],
                logs.map((l) => [l.moduleName, l.entityName, l.operation, l.referenceNumber, l.performedBy, l.success ? "SUCCESS" : "FAILED", l.performedAt]))}>
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="aud-table-container">
              <table className="aud-table">
                <thead>
                  <tr><th>Module</th><th>Operation</th><th>Reference</th><th>Performed By</th><th>Outcome</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No audit events recorded.</td></tr>
                  ) : logs.map((l, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: "#dc2626" }}>{l.moduleName}</td>
                      <td style={{ fontSize: "13px" }}>{l.operation}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{l.referenceNumber || "—"}</td>
                      <td style={{ fontSize: "13px" }}>{l.performedBy}</td>
                      <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: l.success ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: l.success ? "#059669" : "#dc2626" }}>{l.success ? "SUCCESS" : "FAILED"}</span></td>
                      <td style={{ fontSize: "12.5px", color: "#888" }}>{formatDateIN(l.performedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditReports;
