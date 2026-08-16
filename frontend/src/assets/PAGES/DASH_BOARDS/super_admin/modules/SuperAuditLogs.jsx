import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

const SuperAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [moduleFilter, setModuleFilter] = useState("");
  const [operationFilter, setOperationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const PAGE_SIZE = 15;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      sort: "performedAt",
      direction: "desc",
    });
    if (moduleFilter) params.set("moduleName", moduleFilter);
    if (operationFilter) params.set("operation", operationFilter);
    if (searchTerm) params.set("referenceNumber", searchTerm);

    try {
      const data = await apiGet(`/api/audit-logs?${params.toString()}`);
      setLogs(data?.content || []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalElements(data?.totalElements ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page, moduleFilter, operationFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetAndLoad = () => {
    setPage(0);
    loadData();
  };

  const modules = [
    "Auth", "User", "Role", "Permission", "Department", "CostCenter", "Category",
    "Product", "Vendor", "Warehouse", "ApprovalRule", "Budget", "PurchaseRequest",
    "PurchaseOrder", "Invoice", "Payment", "Audit", "System",
  ];

  return (
    <div className="sadmin-audit-logs-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FileText color="#f8b400" size={28} /> Audit Log Trail
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Append-only audit events recorded by the backend for every important state change. {totalElements.toLocaleString()} events total.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={resetAndLoad} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="sadmin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && resetAndLoad()}
            style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Module:</span>
          <select value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}>
            <option value="">All Modules</option>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Action:</span>
          <select value={operationFilter} onChange={(e) => { setOperationFilter(e.target.value); setPage(0); }} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff" }}>
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="STATUS_CHANGE">STATUS CHANGE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
            <Loader2 size={20} className="login-spin" /> Loading audit events...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>
            No audit events match the current filters.
          </div>
        ) : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Reference</th>
                  <th>Actor</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ color: "#777", fontSize: "13px", whiteSpace: "nowrap" }}>{formatDateIN(l.performedAt)}</td>
                    <td><span style={{ fontWeight: "800", color: "#d97706" }}>{l.moduleName}</span></td>
                    <td><span style={{ fontWeight: "700", fontSize: "12.5px", background: "rgba(37,99,235,0.08)", color: "#2563eb", padding: "2px 8px", borderRadius: "10px" }}>{l.operation}</span></td>
                    <td style={{ fontWeight: "600" }}>{l.referenceNumber || "—"}</td>
                    <td style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                      <UserIcon size={13} color="#666" /> {l.performedBy || l.username || "System"}
                    </td>
                    <td style={{ fontSize: "13px", color: "#555", maxWidth: "260px" }}>{l.details || l.newValue || "—"}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: l.success ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: l.success ? "#059669" : "#dc2626" }}>
                        {l.success ? "SUCCESS" : "FAILED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #ececec", background: "#f8f9fb" }}>
            <span style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>
              Page {page + 1} of {Math.max(totalPages, 1)} · {totalElements.toLocaleString()} events
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="sadmin-btn-primary-sm" style={{ background: "#fff", color: "#111", border: "1px solid #d9d9d9", padding: "6px 12px" }} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                <ChevronLeft size={15} /> Prev
              </button>
              <button className="sadmin-btn-primary-sm" style={{ background: "#fff", color: "#111", border: "1px solid #d9d9d9", padding: "6px 12px" }} disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", color: "#888", fontSize: "12.5px" }}>
        <ShieldCheck size={14} color="#059669" /> Audit records are append-only and cannot be edited or deleted from the application.
      </div>
    </div>
  );
};

export default SuperAuditLogs;
