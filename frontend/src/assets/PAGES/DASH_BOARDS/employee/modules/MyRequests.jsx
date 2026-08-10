import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Eye,
  Clock,
  X,
  Loader2,
  WifiOff,
  PlusCircle,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const STATUS_BADGE = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  SUBMITTED: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  UNDER_REVIEW: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  APPROVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  RFQ_CREATED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
};

const MyRequests = ({ onNavigate, onSelectTracking }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await apiGet("/api/auth/me").catch(() => null);
      const query = me?.employeeId
        ? `?requesterId=${me.employeeId}&page=0&size=50&sort=createdAt&direction=desc`
        : "?page=0&size=50&sort=createdAt&direction=desc";
      const page = await apiGet(`/api/purchase-requests${query}`);
      setRequests(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      (req.requestNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.purpose || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.departmentName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || (req.priority || "").toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="emp-my-requests-container">
      {/* Page Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <FileText color="#f8b400" /> My Requisitions
          </h1>
          <p className="emp-page-subtitle">
            All purchase requests submitted by you — live from the database.
          </p>
        </div>
        <button className="emp-btn-primary-sm" onClick={() => onNavigate("create-request")}>
          <PlusCircle size={16} /> New Requisition
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Filter Bar Card */}
      <div className="emp-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by ID, purpose, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="emp-form-input"
              style={{ paddingLeft: "42px", height: "42px", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "#f8f9fb", padding: "3px", borderRadius: "10px", border: "1px solid #d9d9d9" }}>
              {["all", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "RFQ_CREATED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedStatus === st ? "#f8b400" : "transparent",
                    color: selectedStatus === st ? "#000000" : "#555555",
                    fontWeight: selectedStatus === st ? "700" : "600",
                    fontSize: "12px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s ease",
                  }}
                >
                  {st.toLowerCase()}
                </button>
              ))}
            </div>

            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="emp-form-select" style={{ width: "150px", height: "42px", fontSize: "13px" }}>
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="emp-card">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
            <Loader2 size={22} className="login-spin" /> Loading your requests...
          </div>
        ) : (
          <div className="emp-table-container">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Purpose</th>
                  <th>Department</th>
                  <th>Est. Amount</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const badge = STATUS_BADGE[req.status] || { bg: "rgba(100,116,139,.12)", color: "#64748b" };
                    return (
                      <tr key={req.id}>
                        <td style={{ fontWeight: "700", color: "#d97706" }}>{req.requestNumber}</td>
                        <td style={{ fontWeight: "600", color: "#111111", maxWidth: "260px" }}>{req.purpose}</td>
                        <td style={{ color: "#555555" }}>{req.departmentName || "—"}</td>
                        <td style={{ fontWeight: "800", color: "#111111" }}>{formatINR(req.estimatedAmount)}</td>
                        <td>
                          <span className={`emp-priority ${(req.priority || "").toLowerCase()}`}>{req.priority}</span>
                        </td>
                        <td>
                          <span className="emp-badge" style={{ background: badge.bg, color: badge.color }}>
                            <span className="emp-badge-dot" style={{ background: badge.color }}></span>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ color: "#666666", fontSize: "13px" }}>{formatDateIN(req.createdAt)}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button title="View Details" className="emp-nav-icon-btn" style={{ width: "32px", height: "32px" }} onClick={() => setSelectedRequest(req)}>
                              <Eye size={15} />
                            </button>
                            <button title="Track Workflow" className="emp-nav-icon-btn" style={{ width: "32px", height: "32px", color: "#d97706" }} onClick={() => { if (onSelectTracking) onSelectTracking(req.id); onNavigate("request-tracking"); }}>
                              <Clock size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#666666" }}>
                      No purchase requests match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Request Detail Modal */}
      {selectedRequest && (
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{ maxWidth: "650px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ececec", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span style={{ color: "#d97706", fontSize: "12px", fontWeight: "800" }}>REQUISITION DETAILS</span>
                <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700" }}>{selectedRequest.requestNumber}</h2>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Purpose</label>
                  <p style={{ fontSize: "15px", color: "#111111", fontWeight: "700" }}>{selectedRequest.purpose}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Department</label>
                  <p style={{ fontSize: "15px", color: "#111111" }}>{selectedRequest.departmentName}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Estimated Amount</label>
                  <p style={{ fontSize: "16px", color: "#d97706", fontWeight: "800" }}>{formatINR(selectedRequest.estimatedAmount)}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Priority</label>
                  <p style={{ fontSize: "14px", color: "#111111" }}>{selectedRequest.priority}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Current Status</label>
                  <div style={{ marginTop: "4px" }}>
                    <span className="emp-badge">{selectedRequest.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Remarks / Justification</label>
                <p style={{ fontSize: "13px", color: "#333333", background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec", marginTop: "4px", lineHeight: "1.5" }}>
                  {selectedRequest.remarks || selectedRequest.purpose || "—"}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Requester</label>
                  <p style={{ fontSize: "14px", color: "#111111" }}>{selectedRequest.requesterName}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Requested Date</label>
                  <p style={{ fontSize: "14px", color: "#111111" }}>{formatDateIN(selectedRequest.requestDate, { withTime: false })}</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #ececec" }}>
              <button className="emp-btn-primary-sm" onClick={() => { setSelectedRequest(null); if (onSelectTracking) onSelectTracking(selectedRequest.id); onNavigate("request-tracking"); }}>
                Track Live Workflow
              </button>
              <button className="emp-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111111", border: "1px solid #d9d9d9" }} onClick={() => setSelectedRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
