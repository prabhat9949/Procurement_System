import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  X,
  Loader2,
  WifiOff,
  UserCheck,
  ShieldCheck,
  Clock,
  IndianRupee,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) =>
  ({
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    RFQ_CREATED: "RFQ Created",
  }[s] || s);

const priorityLabel = (p) =>
  ({ LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent", CRITICAL: "Critical" }[p] || p);

const ProcurementRequests = () => {
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewReq, setViewReq] = useState(null);
  const [viewLines, setViewLines] = useState([]);
  const [viewApprovals, setViewApprovals] = useState([]);
  const [viewAssignments, setViewAssignments] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/purchase-requests?page=0&size=100&sort=createdAt&direction=desc");
      setReqs(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load purchase requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = reqs.filter((req) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (req.requestNumber || "").toLowerCase().includes(q) ||
      (req.requesterName || "").toLowerCase().includes(q) ||
      (req.purpose || "").toLowerCase().includes(q) ||
      (req.departmentName || "").toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const openDetail = async (req) => {
    setViewReq(req);
    setViewLines([]);
    setViewApprovals([]);
    setViewAssignments([]);
    setViewLoading(true);
    try {
      const [linesPage, history, assignPage] = await Promise.all([
        apiGet(`/api/purchase-request-lines?purchaseRequestId=${req.id}&page=0&size=50`).catch(() => null),
        apiGet(`/api/procurement/${req.id}/timeline`).catch(() => null),
        apiGet(`/api/workflow/history/PR/${req.id}`).catch(() => null),
      ]);
      setViewLines(linesPage?.content || []);
      setViewApprovals(
        (history?.events || []).filter((e) => ["APPROVED", "REJECTED", "RETURNED", "SUBMITTED", "AUTO_APPROVED"].some((t) => (e.type || "").includes(t)))
      );
      setViewAssignments(Array.isArray(assignPage) ? assignPage : assignPage?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load request details.");
    } finally {
      setViewLoading(false);
    }
  };

  const exportCsv = () => {
    if (!filtered.length) {
      triggerToast("No purchase request records to export.");
      return;
    }
    const header = ["Request Number", "Requester", "Department", "Cost Center", "Priority", "Status", "Approval Status", "Amount", "Purpose", "Created"];
    const rows = filtered.map((r) => [
      r.requestNumber,
      r.requesterName,
      r.departmentName,
      r.costCenterName,
      r.priority,
      r.status,
      r.approvalStatus,
      r.estimatedAmount,
      (r.purpose || "").replace(/"/g, '""'),
      r.createdAt,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("Purchase request CSV exported.");
  };

  const currentAssignee = (assignments) => {
    const active = assignments.find((a) => ["ASSIGNED", "IN_PROGRESS"].includes(a.status));
    return active || assignments[assignments.length - 1] || null;
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d7dce3",
    borderRadius: "9px",
    fontSize: "13.5px",
    background: "#fff",
    outline: "none",
  };

  return (
    <div className="pman-requests-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <FileText color="#f8b400" /> Procurement Requests
          </h1>
          <p className="pman-page-subtitle">
            Approved requisitions and full request directory, live from the database — scoped to your procurement authority.
          </p>
        </div>
        <button className="pman-btn-primary-sm" onClick={exportCsv}>
          <Download size={16} /> Export Requisitions CSV
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0" }}>
          {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search request number, requester, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>
          <div style={{ display: "flex", background: "#f8f9fb", padding: "3px", borderRadius: "10px", border: "1px solid #d9d9d9" }}>
            {["all", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
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
                {st.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pman-card">
        <div className="pman-table-container">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
              <Loader2 size={20} className="login-spin" /> Loading purchase requests…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
              <FileText size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No purchase requests found.</p>
              <p style={{ fontSize: "13px" }}>{selectedStatus === "all" ? "No procurement requests are currently available in your scope." : `No requests with status "${statusLabel(selectedStatus)}".`}</p>
            </div>
          ) : (
            <table className="pman-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Requester / Dept</th>
                  <th>Purpose</th>
                  <th>Priority</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{req.requestNumber}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700", color: "#111111" }}>{req.requesterName}</span>
                        <span style={{ fontSize: "11px", color: "#666666" }}>{req.departmentName}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: "600", color: "#111111", maxWidth: "260px" }}>{req.purpose}</td>
                    <td>
                      <span className={`emp-priority ${(req.priority || "").toLowerCase()}`}>
                        {priorityLabel(req.priority)}
                      </span>
                    </td>
                    <td style={{ fontWeight: "800", color: "#111111" }}>{formatINR(req.estimatedAmount)}</td>
                    <td>
                      <span className={`pman-badge ${(req.status || "").toLowerCase()}`}>
                        <span className="pman-badge-dot"></span>
                        {statusLabel(req.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px", color: req.approvalStatus === "APPROVED" ? "#059669" : "#d97706", fontWeight: 700 }}>
                      {req.approvalStatus}
                    </td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{formatDateIN(req.createdAt, { withTime: false })}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="pman-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex" }}
                        onClick={() => openDetail(req)}
                        title="View request"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {viewReq && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "720px", maxHeight: "86vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ececec", paddingBottom: "14px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>REQUEST DETAIL</span>
                <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700" }}>{viewReq.requestNumber}</h2>
              </div>
              <button onClick={() => setViewReq(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {viewLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "50px 0", gap: "12px", color: "#666666" }}>
                <Loader2 size={20} className="login-spin" /> Loading details…
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Requester</label>
                    <p style={{ fontWeight: "700", color: "#111111" }}>{viewReq.requesterName}</p>
                    <p style={{ fontSize: "12px", color: "#666666" }}>{viewReq.departmentName}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Estimated Amount</label>
                    <p style={{ fontSize: "18px", fontWeight: "800", color: "#d97706" }}>
                      <IndianRupee size={15} style={{ verticalAlign: "middle" }} /> {formatINR(viewReq.estimatedAmount)}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Cost Center</label>
                    <p style={{ fontWeight: "600", color: "#111111" }}>{viewReq.costCenterName || "—"}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Required Date</label>
                    <p style={{ fontWeight: "600", color: "#111111" }}>{formatDateIN(viewReq.requiredDate, { withTime: false })}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Priority</label>
                    <p style={{ fontWeight: "700", color: "#111111" }}>{priorityLabel(viewReq.priority)}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Status</label>
                    <p style={{ fontWeight: "700", color: viewReq.status === "APPROVED" ? "#059669" : "#d97706" }}>{statusLabel(viewReq.status)} · {viewReq.approvalStatus}</p>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Purpose</label>
                  <p style={{ fontWeight: "600", color: "#111111" }}>{viewReq.purpose}</p>
                  {viewReq.remarks && <p style={{ fontSize: "13px", color: "#666666", marginTop: "4px" }}>{viewReq.remarks}</p>}
                </div>

                {/* Lines */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Requested Items</label>
                  {viewLines.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#999" }}>No line items recorded.</p>
                  ) : (
                    <table className="pman-table" style={{ marginTop: "8px" }}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Est. Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewLines.map((l) => (
                          <tr key={l.id}>
                            <td style={{ fontWeight: 600 }}>{l.productName}</td>
                            <td>{l.quantity}</td>
                            <td>{formatINR(l.unitPrice)}</td>
                            <td style={{ fontWeight: 700 }}>{formatINR(l.estimatedAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Approval history */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Approval History</label>
                  {viewApprovals.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#999" }}>No approval events recorded yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                      {viewApprovals.slice().reverse().map((e, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <ShieldCheck size={16} style={{ color: (e.type || "").includes("REJECTED") ? "#dc2626" : (e.type || "").includes("APPROVED") ? "#059669" : "#2563eb", marginTop: 2 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>
                              {e.title}
                              <span style={{ color: "#666", fontWeight: 600 }}> — {e.performedByName || "System"}</span>
                            </p>
                            <p style={{ fontSize: "12px", color: "#888" }}>{e.description} · {formatDateIN(e.occurredAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current assignee */}
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Procurement Ownership</label>
                  {viewAssignments.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#999" }}>Not yet assigned to a procurement team.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                      {viewAssignments.slice().reverse().map((a) => (
                        <div key={a.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", opacity: a.status === "COMPLETED" || a.status === "REASSIGNED" ? 0.65 : 1 }}>
                          <UserCheck size={16} style={{ color: a.status === "ASSIGNED" || a.status === "IN_PROGRESS" ? "#d97706" : "#059669", marginTop: 2 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>
                              {a.assignedEmployeeName} <span style={{ color: "#666", fontWeight: 600 }}>({a.assignedRoleName})</span>
                              <span className={`pman-badge ${(a.status || "").toLowerCase()}`} style={{ marginLeft: "8px" }}>
                                <span className="pman-badge-dot"></span>{a.status}
                              </span>
                            </p>
                            <p style={{ fontSize: "12px", color: "#888" }}>
                              Stage: {a.stage} · {formatDateIN(a.assignedAt)}
                              {a.reason ? ` — ${a.reason}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="pman-btn-primary-sm" onClick={() => setViewReq(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementRequests;
