import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, UserCheck } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatDateIN, formatINR } from "../../../../../utils/format";

const STATUS_COPY = {
  DRAFT: "Draft — not yet submitted for approval",
  SUBMITTED: "Submitted — waiting for the configured approval route",
  UNDER_REVIEW: "Under review by an assigned approver",
  APPROVED: "Approved — ready for procurement processing",
  REJECTED: "Rejected — see the approval history for comments",
  RFQ_CREATED: "RFQ created — procurement sourcing is in progress",
};

const RequestTracking = ({ initialTrackingId }) => {
  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(initialTrackingId || "");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await apiGet("/api/auth/me");
      if (!me?.employeeId) throw new Error("Your account is not linked to an employee record.");
      const page = await apiGet(`/api/purchase-requests?requesterId=${me.employeeId}&page=0&size=100&sort=createdAt&direction=desc`);
      const data = page?.content || [];
      setRequests(data);
      setSelectedReqId((current) => data.some((item) => String(item.id) === String(initialTrackingId || current))
        ? String(initialTrackingId || current)
        : String(data[0]?.id || ""));
    } catch (err) {
      setError(err.message || "Unable to load your requisitions.");
    } finally {
      setLoading(false);
    }
  }, [initialTrackingId]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  useEffect(() => {
    if (!selectedReqId) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    apiGet(`/api/approval-histories?purchaseRequestId=${selectedReqId}&page=0&size=100&sort=performedAt&direction=asc`)
      .then((page) => setHistory(page?.content || []))
      .catch((err) => setError(err.message || "Unable to load approval history."))
      .finally(() => setHistoryLoading(false));
  }, [selectedReqId]);

  const request = requests.find((item) => String(item.id) === String(selectedReqId));

  return (
    <div className="emp-tracking-container">
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title"><Clock color="#f8b400" /> Requisition Tracker</h1>
          <p className="emp-page-subtitle">Current status and approval history from the procurement system.</p>
        </div>
        <select value={selectedReqId} onChange={(event) => setSelectedReqId(event.target.value)} className="emp-form-select" style={{ width: "280px" }} disabled={loading || !requests.length}>
          {requests.map((item) => <option key={item.id} value={item.id}>{item.requestNumber} — {item.purpose}</option>)}
        </select>
      </div>

      {error && <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px", padding: "14px 18px", borderRadius: "10px", background: "#fef2f2", color: "#991b1b" }}><AlertCircle size={18} />{error}<button className="emp-btn-primary-sm" style={{ marginLeft: "auto" }} onClick={loadRequests}>Retry</button></div>}
      {loading ? <div className="emp-card" style={{ textAlign: "center", padding: "56px", color: "#666" }}><Loader2 className="login-spin" size={24} /> Loading requisitions…</div> : !request ? <div className="emp-card" style={{ textAlign: "center", padding: "56px", color: "#666" }}>No requisitions are available to track.</div> : <>
        <div className="emp-card emp-card-gold-glow" style={{ marginBottom: "24px", padding: "22px 24px" }}>
          <span style={{ color: "#d97706", fontSize: "12px", fontWeight: 800 }}>REQUEST {request.requestNumber}</span>
          <h2 style={{ fontSize: "20px", color: "#111", marginTop: "4px" }}>{request.purpose}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginTop: "18px", fontSize: "13px" }}>
            <div><small>Current status</small><strong style={{ display: "block", color: "#d97706" }}>{request.status}</strong></div>
            <div><small>Approval status</small><strong style={{ display: "block" }}>{request.approvalStatus || "—"}</strong></div>
            <div><small>Estimated amount</small><strong style={{ display: "block" }}>{formatINR(request.estimatedAmount)}</strong></div>
            <div><small>Required date</small><strong style={{ display: "block" }}>{formatDateIN(request.requiredDate, { withTime: false })}</strong></div>
          </div>
          <p style={{ marginTop: "18px", color: "#555", fontSize: "13px" }}>{STATUS_COPY[request.status] || "Status supplied by the procurement backend."}</p>
        </div>

        <div className="emp-card">
          <h3 style={{ color: "#111", fontSize: "18px", marginBottom: "20px" }}>Approval History</h3>
          {historyLoading ? <div style={{ color: "#666", padding: "20px 0" }}><Loader2 className="login-spin" size={18} /> Loading approval history…</div> : history.length === 0 ? <p style={{ color: "#666" }}>No approval action has been recorded yet.</p> : <div className="emp-timeline-container">{history.map((entry) => <div className="emp-timeline-item done" key={entry.id}><div className="emp-timeline-node"><CheckCircle2 size={13} color="#fff" /></div><div className="emp-timeline-content"><div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><h4 style={{ color: "#111", fontSize: "15px" }}>{entry.action}</h4><span style={{ color: "#666", fontSize: "12px" }}>{formatDateIN(entry.performedAt)}</span></div><p style={{ color: "#555", fontSize: "13px" }}>{entry.comments || "No comment provided."}</p><span style={{ color: "#d97706", fontSize: "12px", fontWeight: 600 }}><UserCheck size={14} /> {entry.performedByName || "System"}</span></div></div>)}</div>}
        </div>
      </>}
    </div>
  );
};

export default RequestTracking;
