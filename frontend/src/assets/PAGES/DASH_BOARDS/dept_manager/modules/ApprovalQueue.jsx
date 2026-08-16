import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck,
  Search,
  Loader2,
  WifiOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  ArrowRight,
  FileText,
  User,
  IndianRupee,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const canApprove = hasPermission("CAN_APPROVE_PR");
const canReject = hasPermission("CAN_REJECT_PR");
const canReturn = hasPermission("CAN_RETURN_PR");

const ApprovalQueue = ({ onTrackForm }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [targetTask, setTargetTask] = useState(null);
  const [decision, setDecision] = useState("APPROVED");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Scope the queue to the authenticated manager's own employee record.
      const me = await apiGet("/api/auth/me").catch(() => null);
      const query = me?.employeeId
        ? `?assignedEmployeeId=${me.employeeId}&status=PENDING&page=0&size=50&sort=assignedDate&direction=desc`
        : "?status=PENDING&page=0&size=50&sort=assignedDate&direction=desc";
      const page = await apiGet(`/api/approval-tasks${query}`);
      setTasks(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load the approval queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = tasks.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      (t.taskNumber || "").toLowerCase().includes(q) ||
      (t.requestNumber || "").toLowerCase().includes(q) ||
      (t.assignedEmployeeName || "").toLowerCase().includes(q) ||
      (t.stageName || "").toLowerCase().includes(q)
    );
  });

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!targetTask) return;
    setSubmitting(true);
    setError("");
    try {
      const body = comments ? { comments } : {};
      if (decision === "APPROVED") {
        await apiPost(`/api/approval-tasks/${targetTask.id}/approve`, body);
      } else if (decision === "REJECTED") {
        await apiPost(`/api/approval-tasks/${targetTask.id}/reject`, body);
      } else {
        await apiPost(`/api/approval-tasks/${targetTask.id}/return`, body);
      }
      setToast({ type: decision === "APPROVED" ? "success" : decision === "REJECTED" ? "danger" : "info", text: `${targetTask.taskNumber} ${decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "returned for correction"}.` });
      setTargetTask(null);
      setComments("");
      loadData();
    } catch (err) {
      setError(err.message || "Unable to submit the decision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dm-approval-queue-container">
      {/* Toast */}
      {toast.text && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderRadius: "10px", marginBottom: "24px", fontSize: "14px", fontWeight: 700, background: toast.type === "danger" ? "rgba(220,38,38,.12)" : toast.type === "info" ? "rgba(37,99,235,.12)" : "rgba(5,150,105,.12)", border: `1px solid ${toast.type === "danger" ? "#fca5a5" : toast.type === "info" ? "#93c5fd" : "#6ee7b7"}`, color: toast.type === "danger" ? "#dc2626" : toast.type === "info" ? "#2563eb" : "#059669" }}>
          <CheckCircle2 size={18} /> {toast.text}
          {onTrackForm && targetTask?.purchaseRequestId && (
            <button
              className="dm-btn-primary-sm"
              style={{ background: "#059669", border: "none", color: "#ffffff", marginLeft: "auto" }}
              onClick={() => { setToast({ type: "", text: "" }); onTrackForm(targetTask.purchaseRequestId); }}
            >
              <Clock size={15} /> Track Request
            </button>
          )}
          <button onClick={() => setToast({ type: "", text: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <FileCheck color="#f8b400" /> Manager Approval Center
          </h1>
          <p className="dm-page-subtitle">
            Review and act on purchase requests assigned to you — decisions are saved to the database.
          </p>
        </div>
        <span style={{ background: "rgba(248, 180, 0, 0.15)", color: "#d97706", padding: "8px 16px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={16} /> {tasks.length} Pending
        </span>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Search */}
      <div className="dm-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", maxWidth: "420px" }}>
          <Search size={18} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by task, request, or assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dm-form-input"
            style={{ paddingLeft: "42px", height: "42px", fontSize: "14px", width: "100%" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading approval queue...
        </div>
      ) : filtered.length === 0 ? (
        <div className="dm-card" style={{ textAlign: "center", padding: "48px" }}>
          <CheckCircle2 size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>Approval Queue Clear!</h3>
          <p style={{ color: "#666666", fontSize: "14px", marginTop: "4px" }}>All purchase requests assigned to you have been processed.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filtered.map((t) => (
            <div key={t.id} className="dm-card dm-card-gold-glow">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "800", color: "#d97706", fontSize: "15px" }}>{t.taskNumber}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111" }}>{t.stageName}</span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>Request: {t.requestNumber}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#555", marginTop: "6px" }}>
                    {t.comments || "Awaiting your review."}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: 700 }}>Assigned To</span>
                  <p style={{ fontSize: "14px", color: "#111111", fontWeight: 700 }}>{t.assignedEmployeeName}</p>
                  <p style={{ fontSize: "11px", color: "#7a8999" }}>{formatDateIN(t.assignedDate)}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", padding: "14px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec", marginBottom: "16px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Approved Amount</span>
                  <p style={{ fontWeight: "800", color: "#059669", fontSize: "16px" }}>{formatINR(t.approvedAmount)}</p>
                </div>
                <div>
                  <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Approver Role</span>
                  <p style={{ fontWeight: "600", color: "#111111" }}>{t.assignedRoleName}</p>
                </div>
                <div>
                  <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Status</span>
                  <p style={{ marginTop: "2px" }}>
                    <span className="lro-badge" style={{ background: "rgba(217,119,6,.12)", color: "#d97706" }}>{t.status}</span>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", borderTop: "1px solid #ececec", paddingTop: "14px" }}>
                <button
                  className="dm-btn-primary-sm"
                  style={{ background: "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)", color: "#000000", fontWeight: "800", fontSize: "13px", padding: "9px 20px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  onClick={() => { setTargetTask(t); setDecision(canApprove ? "APPROVED" : canReject ? "REJECTED" : "RETURNED"); setComments(""); }}
                >
                  <ArrowRight size={16} /> Review & Decide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {targetTask && (
        <div className="dm-modal-overlay">
          <div className="dm-modal" style={{ maxWidth: "560px" }}>
            <div style={{ borderBottom: "1px solid #ececec", paddingBottom: "16px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 800, letterSpacing: "0.5px" }}>APPROVAL DECISION</span>
              <h3 style={{ fontSize: "20px", color: "#111111", fontWeight: 800, marginTop: "4px" }}>
                {targetTask.taskNumber} — {targetTask.stageName}
              </h3>
              <p style={{ fontSize: "13px", color: "#555" }}>Request {targetTask.requestNumber} · Assigned to {targetTask.assignedEmployeeName}</p>
            </div>

            <form onSubmit={submitDecision}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                {[
                  { value: "APPROVED", label: "Approve", icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,.08)", visible: canApprove },
                  { value: "REJECTED", label: "Reject", icon: XCircle, color: "#dc2626", bg: "rgba(220,38,38,.08)", visible: canReject },
                  { value: "RETURNED", label: "Return", icon: AlertCircle, color: "#2563eb", bg: "rgba(37,99,235,.08)", visible: canReturn },
                ].filter((o) => o.visible).map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setDecision(opt.value)}
                      style={{
                        padding: "14px 10px",
                        borderRadius: "10px",
                        border: decision === opt.value ? `2px solid ${opt.color}` : "1px solid #ececec",
                        background: decision === opt.value ? opt.bg : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: 800,
                        color: decision === opt.value ? opt.color : "#111111",
                      }}
                    >
                      <Icon size={20} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="dm-form-group" style={{ marginBottom: "20px" }}>
                <label className="dm-form-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700 }}>
                  <MessageSquare size={14} /> Comments / Notes
                </label>
                <textarea rows={4} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Add remarks for the requester (recommended)..." className="dm-form-textarea" />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" className="dm-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setTargetTask(null)}>
                  Cancel
                </button>
                {(canApprove || canReject || canReturn) && (
                  <button type="submit" disabled={submitting} className="dm-btn-primary-sm" style={{ background: decision === "REJECTED" ? "#dc2626" : decision === "RETURNED" ? "#2563eb" : "linear-gradient(135deg, #f8b400 0%, #e2a000 100%)", color: decision === "REJECTED" || decision === "RETURNED" ? "#fff" : "#000", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="login-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        {decision === "APPROVED" ? "Approve" : decision === "REJECTED" ? "Reject" : "Return for Correction"}
                      </>
                    )}
                  </button>
                )}
              {!canApprove && !canReject && !canReturn && (
                <div style={{ fontSize: "12.5px", color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={15} /> You do not have permission to approve, reject or return requests. Contact your administrator.
                </div>
              )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
