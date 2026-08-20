import React, { useCallback, useEffect, useState } from "react";
import {
  Inbox,
  Loader2,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Eye,
  X,
  IndianRupee,
  Clock,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../services/apiClient";
import { hasPermission } from "../../../../utils/permissions";
import { formatINR, formatDateIN } from "../../../../utils/format";

/**
 * My Approvals & Tasks — the actionable queue for the authenticated user.
 *
 * Everything assigned to this person's employee record is surfaced here so it
 * can never be silently hidden:
 *  - Approval tasks (the PR approval chain) → Approve / Reject / Return.
 *  - Workflow assignments (procurement / fulfilment stages) → Complete (process).
 * The backend still enforces every action; this screen just makes the assignee
 * the one who can act.
 */
const MyApprovals = () => {
  const [approvalTasks, setApprovalTasks] = useState([]);
  const [workTasks, setWorkTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [decision, setDecision] = useState(null); // { kind: "approval" | "workflow", action, task }
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  // Read permissions at render time so admin grants/revocations are reflected.
  const canApprove = hasPermission("CAN_APPROVE_PR");
  const canReject = hasPermission("CAN_REJECT_PR");
  const canReturn = hasPermission("CAN_RETURN_PR");

  const toast = (t) => {
    setToastMsg(t);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [approvalPage, workPage] = await Promise.all([
        apiGet("/api/approval-tasks/my-queue?status=PENDING&page=0&size=100").catch(() => null),
        apiGet("/api/workflow/my-tasks?size=100").catch(() => null),
      ]);
      setApprovalTasks(
        (approvalPage?.content || []).filter((t) => String(t.status || "").toUpperCase() === "PENDING")
      );
      setWorkTasks(
        (workPage?.content || []).filter(
          (t) => t.entityType === "PR" && ["ASSIGNED", "IN_PROGRESS"].includes(t.status)
        )
      );
    } catch (err) {
      setError(err.message || "Unable to load your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitDecision = async () => {
    if (!decision) return;
    setBusy(true);
    setError("");
    try {
      const payload = { comments: comment.trim() || null };
      if (decision.kind === "approval") {
        const url = decision.action === "APPROVED"
          ? `/api/approval-tasks/${decision.task.id}/approve`
          : decision.action === "REJECTED"
            ? `/api/approval-tasks/${decision.task.id}/reject`
            : `/api/approval-tasks/${decision.task.id}/return`;
        await apiPost(url, payload);
        toast(`${decision.task.requestNumber} ${decision.action === "RETURNED" ? "returned for correction" : decision.action.toLowerCase()}.`);
      } else {
        await apiPost(`/api/workflow/tasks/${decision.task.id}/complete`, {
          action: "PROCESS",
          comment: comment.trim() || null,
        });
        toast(`${decision.task.requestNumber} — stage ${decision.task.stage} completed.`);
      }
      setDecision(null);
      setComment("");
      load();
    } catch (err) {
      setError(err.message || "Unable to complete the action.");
    } finally {
      setBusy(false);
    }
  };

  const sectionTitle = (icon, title, sub) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      {icon}
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111" }}>{title}</h3>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7a8999" }}>{sub}</p>}
      </div>
    </div>
  );

  const kpi = (label, value, color) => (
    <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #e7ebf0", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#7a8999", fontWeight: 600 }}>{label}</div>
    </div>
  );

  const noTasks = (text) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "38px 0", color: "#9aa8b8" }}>
      <Inbox size={26} style={{ opacity: 0.5 }} />
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{text}</span>
    </div>
  );

  return (
    <div style={{ padding: "6px 2px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>
            <ShieldCheck color="#f8b400" size={24} /> My Approvals &amp; Tasks
          </h1>
          <p style={{ color: "#666", fontSize: 13.5, marginTop: 4 }}>
            Everything assigned to your account — approvals you can approve, reject or return, and procurement tasks you need to process.
          </p>
        </div>
        <button
          onClick={load}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#444" }}
        >
          <Clock size={14} /> Refresh
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: "rgba(5,150,105,.12)", border: "1px solid #059669", color: "#059669", padding: "13px 18px", borderRadius: 10, marginBottom: 16, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 9 }}>
          <CheckCircle2 size={17} /> {toastMsg}
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        {kpi("Pending Approvals", approvalTasks.length, "#d97706")}
        {kpi("Tasks Assigned to Me", workTasks.length, "#2563eb")}
        {kpi("Total Actionable", approvalTasks.length + workTasks.length, "#059669")}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "70px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your assigned tasks...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Approval tasks */}
          <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: 20 }}>
            {sectionTitle(
              <ShieldCheck size={18} color="#d97706" />,
              "PR Approvals Assigned to You",
              "Approve, reject or return the requests routed to your approval"
            )}
            {approvalTasks.length === 0 ? (
              noTasks("No pending approvals are assigned to your account right now.")
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {approvalTasks.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid #eef1f5", borderRadius: 10, background: "#fbfcfe", flexWrap: "wrap" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(217,119,6,.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileTextIcon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontWeight: 800, color: "#111", fontSize: 13.5 }}>{t.requestNumber}</div>
                      <div style={{ fontSize: 12.5, color: "#555" }}>
                        {t.requesterName} · {t.departmentName || "—"} · <strong>{t.stageName}</strong>
                        {t.overdue && <span style={{ color: "#dc2626", fontWeight: 800 }}> · OVERDUE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#7a8999", marginTop: 2 }}>{t.purpose}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "#d97706", fontSize: 14 }}>{formatINR(t.approvedAmount)}</div>
                      <div style={{ fontSize: 11.5, color: "#7a8999" }}>{t.priority} · assigned {formatDateIN(t.assignedDate)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {canApprove && (
                        <ActionBtn color="#059669" icon={<CheckCircle2 size={13} />} label="Approve" onClick={() => setDecision({ kind: "approval", action: "APPROVED", task: t })} />
                      )}
                      {canReject && (
                        <ActionBtn color="#dc2626" icon={<XCircle size={13} />} label="Reject" onClick={() => setDecision({ kind: "approval", action: "REJECTED", task: t })} />
                      )}
                      {canReturn && (
                        <ActionBtn color="#d97706" icon={<RotateCcw size={13} />} label="Return" onClick={() => setDecision({ kind: "approval", action: "RETURNED", task: t })} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workflow assignments */}
          <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: 20 }}>
            {sectionTitle(
              <UserCheck size={18} color="#2563eb" />,
              "Procurement / Fulfilment Tasks Assigned to You",
              "Process the requests that have been routed to your account"
            )}
            {workTasks.length === 0 ? (
              noTasks("No procurement tasks are assigned to your account right now.")
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {workTasks.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid #eef1f5", borderRadius: 10, background: "#fbfcfe", flexWrap: "wrap" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(37,99,235,.12)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileTextIcon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontWeight: 800, color: "#111", fontSize: 13.5 }}>{t.requestNumber}</div>
                      <div style={{ fontSize: 12.5, color: "#555" }}>
                        {t.requesterName} · {t.departmentName || "—"} · Stage: <strong>{t.stage}</strong> ({t.assignedRoleName || t.assignedRoleCode})
                      </div>
                      <div style={{ fontSize: 12, color: "#7a8999", marginTop: 2 }}>{t.purpose || t.reason}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "#2563eb", fontSize: 14 }}>{formatINR(t.amount)}</div>
                      <div style={{ fontSize: 11.5, color: "#7a8999" }}>{t.priority} · assigned {formatDateIN(t.assignedAt)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <ActionBtn color="#2563eb" icon={<CheckCircle2 size={13} />} label="Complete / Process" onClick={() => setDecision({ kind: "workflow", action: "COMPLETE", task: t })} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision modal */}
      {decision && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "24px 12px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "26px 28px", width: "100%", maxWidth: 520, boxShadow: "0 24px 60px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: "#d97706", textTransform: "uppercase" }}>
                  {decision.kind === "approval" ? "Approval Decision" : "Task Completion"}
                </span>
                <h3 style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 800, color: "#111" }}>{decision.task.requestNumber}</h3>
                <div style={{ fontSize: 12.5, color: "#666", marginTop: 3 }}>
                  {decision.task.stageName || decision.task.stage} · {decision.task.requesterName} · {formatINR(decision.task.approvedAmount || decision.task.amount)}
                </div>
              </div>
              <button onClick={() => setDecision(null)} style={{ background: "#f8f9fb", border: "1px solid #d9dee6", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontWeight: 800, color: "#555" }}>✕</button>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#475569", marginBottom: 16 }}>
              <strong style={{ color: "#111" }}>Action:</strong>{" "}
              {decision.kind === "approval"
                ? decision.action === "APPROVED" ? "Approve this request" : decision.action === "REJECTED" ? "Reject this request" : "Return for correction"
                : "Mark this procurement stage as processed"}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Comments (optional)</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note for the requester / workflow history..."
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: 9, fontSize: 13.5, outline: "none", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDecision(null)} disabled={busy} style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid #d9dee6", background: "#f8f9fb", color: "#111", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={busy}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#fff",
                  background: decision.kind === "approval"
                    ? decision.action === "APPROVED" ? "#059669" : decision.action === "REJECTED" ? "#dc2626" : "#d97706"
                    : "#2563eb",
                }}
              >
                {busy ? <Loader2 size={15} className="login-spin" /> : <CheckCircle2 size={15} />}
                {decision.kind === "approval"
                  ? decision.action === "APPROVED" ? "Confirm Approval" : decision.action === "REJECTED" ? "Confirm Rejection" : "Confirm Return"
                  : "Confirm Completion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileTextIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ActionBtn = ({ color, icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 9, border: "1px solid", borderColor: color, background: `${color}0f`, color, fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}
  >
    {icon} {label}
  </button>
);

export default MyApprovals;
