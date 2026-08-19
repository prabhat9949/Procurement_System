import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Loader2,
  FileText,
  Package,
  UserCheck,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Truck,
  IndianRupee,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const ACTION_LABEL = {
  SUBMITTED: { label: "Submitted", icon: Send, color: "#059669" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "#059669" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "#dc2626" },
  RETURNED: { label: "Returned for Correction", icon: RotateCcw, color: "#2563eb" },
  CREATED: { label: "PR Submitted", icon: Send, color: "#059669" },
  MANAGER_APPROVAL: { label: "Manager Approved", icon: CheckCircle2, color: "#059669" },
  SENIOR_APPROVAL: { label: "Senior Manager Approved", icon: CheckCircle2, color: "#059669" },
  HEAD_APPROVAL: { label: "Head Approved", icon: CheckCircle2, color: "#059669" },
  ASSIGNMENT: { label: "Assigned", icon: UserCheck, color: "#059669" },
  PROCUREMENT_ASSIGNMENT: { label: "Procurement Assignment", icon: UserCheck, color: "#059669" },
  RFQ_CREATED: { label: "RFQ Created", icon: FileText, color: "#059669" },
  VENDOR_INVITED: { label: "Vendor Invited", icon: Send, color: "#059669" },
  QUOTATION_RECEIVED: { label: "Quotation Received", icon: FileText, color: "#059669" },
  QUOTATION_SELECTED: { label: "Quotation Selected", icon: CheckCircle2, color: "#059669" },
  PO_CREATED: { label: "PO Created", icon: FileText, color: "#059669" },
  WAREHOUSE_RECEIPT: { label: "Warehouse Receipt", icon: Truck, color: "#059669" },
  GRN: { label: "GRN Completed", icon: CheckCircle2, color: "#059669" },
  AUDIT: { label: "Audit Completed", icon: CheckCircle2, color: "#059669" },
  FINANCE: { label: "Finance Completed", icon: CheckCircle2, color: "#059669" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, color: "#059669" },
};

const RequestTracking = ({ initialTrackingId, onNotifyRefresh }) => {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [lines, setLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiGet("/api/purchase-requests?page=0&size=50&sort=createdAt&direction=desc");
        const list = data.content || [];
        setRequests(list);
        setSelectedId((prev) => initialTrackingId || prev || list[0]?.id || null);
      } catch (err) {
        setError(err.message || "Unable to load your requests.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialTrackingId]);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setError("");
    try {
      const [pr, lineRes, tlRes, taskRes, assignRes] = await Promise.all([
        apiGet(`/api/purchase-requests/${id}`),
        apiGet(`/api/purchase-request-lines?purchaseRequestId=${id}&size=20`).catch(() => null),
        // Unified source-of-truth timeline: approvals + assignments + RFQ/PO/GRN + audit.
        apiGet(`/api/procurement/${id}/timeline`).catch(() => null),
        apiGet(`/api/approval-tasks?purchaseRequestId=${id}&size=20&sort=assignedDate&direction=asc`).catch(() => null),
        // Structured workflow assignment history (who owned each stage, when, why).
        apiGet(`/api/workflow/history/PR/${id}`).catch(() => null),
      ]);
      setDetail(pr);
      setLines(lineRes?.content || []);
      setHistory(
        (tlRes?.events || [])
          .filter((e) => e.type !== "PR_CREATED") // rendered as the fixed first step below
          .map((e) => ({
            action: e.type,
            performedAt: e.occurredAt,
            performedByName: e.performedByName,
            comments: e.description,
            title: e.title,
            stage: e.stage,
          }))
      );
      setTasks(taskRes?.content || []);
      setAssignments(Array.isArray(assignRes) ? assignRes : assignRes?.content || []);
      setCurrentOwner(
        tlRes?.currentAssigneeName
          ? { stage: tlRes.currentStage, name: tlRes.currentAssigneeName, role: tlRes.currentAssigneeRole }
          : null
      );
      const poRes = await apiGet(`/api/purchase-orders/by-request/${id}?size=1`).catch(() => null);
      setPo(poRes?.content?.[0] || null);
      if (onNotifyRefresh) onNotifyRefresh();
    } catch (err) {
      setError(err.message || "Unable to load request details.");
    } finally {
      setDetailLoading(false);
    }
  }, [onNotifyRefresh]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "100px 0", color: "#888", fontWeight: 600 }}>
        <Loader2 size={22} className="lro-spin" /> Loading your requests…
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "#9aa8b8" }}>
        <Package size={30} style={{ marginBottom: 10, opacity: 0.6 }} />
        <div style={{ fontWeight: 700, fontSize: 16, color: "#475569" }}>No requests to track yet</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Create a purchase request to start tracking the approval and procurement workflow.</div>
      </div>
    );
  }

  const currentTask = tasks.find((t) => t.status === "PENDING");
  const effectiveStatus = detail?.approvalStatus === "RETURNED" ? "RETURNED" : detail?.status;

  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="emp-page-header" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Clock color="#2563eb" />
        <div>
          <h1 className="emp-page-title" style={{ margin: 0, fontSize: 22 }}>Request Tracking</h1>
          <p className="emp-page-subtitle" style={{ margin: 0, color: "#666", fontSize: 13 }}>
            Live approval, procurement and delivery status for your requests.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
        {/* Request list */}
        <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid #eef1f5", fontWeight: 800, fontSize: 13.5, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={15} color="#2563eb" /> My Requests
          </div>
          {requests.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                border: "none",
                borderBottom: "1px solid #f2f4f6",
                background: r.id === selectedId ? "#eff6ff" : "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 13, color: "#111" }}>{r.requestNumber}</strong>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: r.status === "DRAFT" ? "#64748b" : r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#d97706" }}>
                  {r.status === "UNDER_REVIEW" ? "Pending" : r.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.purpose || "—"}
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, padding: "22px 24px", minHeight: 420 }}>
          {detailLoading || !detail ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "90px 0", color: "#888", fontWeight: 600 }}>
              <Loader2 size={20} className="lro-spin" /> Loading request details…
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>{detail.requestNumber}</h2>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Requested {formatDateIN(detail.requestDate, { withTime: false })} · Required by {formatDateIN(detail.requiredDate, { withTime: false })} · {detail.priority} priority
                  </div>
                </div>
                <span style={{ background: effectiveStatus === "APPROVED" ? "rgba(5,150,105,.12)" : effectiveStatus === "REJECTED" ? "rgba(220,38,38,.12)" : effectiveStatus === "DRAFT" ? "rgba(100,116,139,.12)" : effectiveStatus === "RETURNED" ? "rgba(245,158,11,.14)" : "rgba(217,119,6,.12)", color: effectiveStatus === "APPROVED" ? "#059669" : effectiveStatus === "REJECTED" ? "#dc2626" : effectiveStatus === "DRAFT" ? "#64748b" : effectiveStatus === "RETURNED" ? "#b45309" : "#d97706", fontSize: 12.5, fontWeight: 800, padding: "6px 14px", borderRadius: 999 }}>
                  {effectiveStatus === "UNDER_REVIEW" ? "PENDING APPROVAL" : effectiveStatus}
                </span>
              </div>

              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, margin: "18px 0" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11.5, color: "#7a8999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>Estimated Amount</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginTop: 3 }}>{formatINR(detail.estimatedAmount)}</div>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11.5, color: "#7a8999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>Department</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{detail.departmentName}</div>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11.5, color: "#7a8999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>Cost Center</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{detail.costCenterCode || detail.costCenterName}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ margin: "8px 0 18px" }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                  <Package size={15} color="#2563eb" /> Requested Items
                </h4>
                {lines.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#64748b" }}>{detail.purpose || "No line items recorded."}</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: "#7a8999", textTransform: "uppercase", fontSize: 11, textAlign: "left" }}>
                        <th style={{ padding: "8px 10px" }}>Item</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Qty</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Unit Price</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l.id} style={{ borderTop: "1px solid #f2f4f6" }}>
                          <td style={{ padding: "9px 10px", fontWeight: 700, color: "#111" }}>{l.productName}</td>
                          <td style={{ padding: "9px 10px", textAlign: "right", color: "#475569" }}>{l.quantity}</td>
                          <td style={{ padding: "9px 10px", textAlign: "right", color: "#475569" }}>{formatINR(l.unitPrice)}</td>
                          <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{formatINR(l.estimatedAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {detail.purpose && (
                  <div style={{ marginTop: 10, fontSize: 12.5, color: "#64748b", background: "#f8fafc", padding: "10px 12px", borderRadius: 8 }}>
                    <strong>Justification:</strong> {detail.purpose}
                  </div>
                )}
              </div>

              {/* Current owner / next action: approval task or post-approval assignment */}
              {(currentOwner?.name || currentTask) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
                  <UserCheck size={20} color="#b45309" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#92400e" }}>CURRENT OWNER — NEXT ACTION</div>
                    <div style={{ fontSize: 13.5, color: "#78350f" }}>
                      {(currentOwner?.name || currentTask?.assignedEmployeeName || "Pending assignment")}
                      {(currentOwner?.role || currentTask?.assignedRoleName) ? ` (${currentOwner?.role || currentTask?.assignedRoleName})` : ""}
                      {currentOwner?.stage || currentTask?.stageName ? ` · Stage: ${currentOwner?.stage || currentTask?.stageName}` : ""}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <h4 style={{ margin: "0 0 14px", fontSize: 13.5, fontWeight: 800, color: "#111" }}>Approval &amp; Workflow Timeline</h4>
              <div className="emp-timeline-container" style={{ position: "relative", paddingLeft: 28 }}>
                {(() => {
                  const isDraft = detail?.status === "DRAFT";
                  const timelineSteps = [
                    {
                      label: isDraft ? "Request Draft (Not Submitted)" : "Request Submitted",
                      at: detail.createdAt,
                      // DRAFT = yellow, SUBMITTED = green
                      color: isDraft ? "#d97706" : "#059669",
                      icon: isDraft ? Clock : Send,
                    },
                    ...history.map((h) => ({
                      label: h.title || ACTION_LABEL[h.action]?.label || h.action,
                      at: h.performedAt,
                      who: h.performedByName,
                      comment: h.comments,
                      color: ACTION_LABEL[h.action]?.color || "#2563eb",
                      icon: ACTION_LABEL[h.action]?.icon || FileText,
                    })),
                  ];
                  return timelineSteps.map((step, idx) => {
                    const { color, icon: Icon } = step;
                    return (
                      <div key={idx} className="emp-timeline-item" style={{ position: "relative", paddingBottom: 18 }}>
                        <div style={{ position: "absolute", left: -28, top: 2, width: 30, height: 30, borderRadius: "50%", background: `${color}14`, color, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${color}` }}>
                          <Icon size={13} />
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#111" }}>{step.label}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {formatDateIN(step.at)} {step.who ? `· ${step.who}` : ""}
                        </div>
                        {step.comment && <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4, background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>“{step.comment}”</div>}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Assignment history: who owned each stage, when, and why */}
              <h4 style={{ margin: "22px 0 12px", fontSize: 13.5, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                <UserCheck size={15} color="#7c3aed" /> Assignment History
              </h4>
              {assignments.length === 0 ? (
                <div style={{ fontSize: 13, color: "#7a8999", background: "#f8fafc", borderRadius: 10, padding: "14px" }}>
                  No team assignments have been created for this request yet.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ color: "#7a8999", textTransform: "uppercase", fontSize: 10.5, textAlign: "left" }}>
                        <th style={{ padding: "7px 8px" }}>Stage</th>
                        <th style={{ padding: "7px 8px" }}>Assigned To</th>
                        <th style={{ padding: "7px 8px" }}>Status</th>
                        <th style={{ padding: "7px 8px" }}>Assigned</th>
                        <th style={{ padding: "7px 8px" }}>Completed</th>
                        <th style={{ padding: "7px 8px" }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a) => (
                        <tr key={a.id} style={{ borderTop: "1px solid #f2f4f6" }}>
                          <td style={{ padding: "8px", fontWeight: 700, color: "#0f172a" }}>{a.stage}</td>
                          <td style={{ padding: "8px", color: "#334155" }}>
                            {a.assignedEmployeeName}
                            {a.assignedRoleName ? <div style={{ fontSize: 11, color: "#7a8999" }}>{a.assignedRoleName}</div> : null}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <span style={{
                              fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999,
                              background: a.status === "ASSIGNED" || a.status === "IN_PROGRESS" ? "rgba(245,158,11,.14)" : a.status === "COMPLETED" ? "rgba(5,150,105,.12)" : "rgba(100,116,139,.12)",
                              color: a.status === "ASSIGNED" || a.status === "IN_PROGRESS" ? "#b45309" : a.status === "COMPLETED" ? "#059669" : "#64748b",
                            }}>{a.status}</span>
                          </td>
                          <td style={{ padding: "8px", color: "#475569" }}>{formatDateIN(a.assignedAt)}</td>
                          <td style={{ padding: "8px", color: "#475569" }}>{a.completedAt ? formatDateIN(a.completedAt) : "—"}</td>
                          <td style={{ padding: "8px", color: "#64748b", maxWidth: 260 }}>{a.reason || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PO card */}
              {po ? (
                <div style={{ marginTop: 18, border: "1px solid #a7f3d0", background: "#ecfdf5", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Truck size={18} color="#059669" />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#065f46" }}>Purchase Order Issued</h4>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, fontSize: 13 }}>
                    <div><div style={{ color: "#6b7280", fontSize: 11.5 }}>PO Number</div><strong style={{ color: "#065f46" }}>{po.poNumber}</strong></div>
                    <div><div style={{ color: "#6b7280", fontSize: 11.5 }}>Vendor</div><strong style={{ color: "#065f46" }}>{po.vendorName}</strong></div>
                    <div><div style={{ color: "#6b7280", fontSize: 11.5 }}>Total Amount</div><strong style={{ color: "#065f46" }}>{formatINR(po.grandTotal)}</strong></div>
                    <div><div style={{ color: "#6b7280", fontSize: 11.5 }}>Expected Delivery</div><strong style={{ color: "#065f46" }}>{formatDateIN(po.expectedDeliveryDate, { withTime: false })}</strong></div>
                    <div><div style={{ color: "#6b7280", fontSize: 11.5 }}>Status</div><strong style={{ color: "#065f46" }}>{po.status}</strong></div>
                  </div>
                </div>
              ) : (
                detail.status !== "DRAFT" && (
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, color: "#7a8999", fontSize: 12.5, background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                    <IndianRupee size={15} /> No purchase order has been generated for this request yet. Procurement will raise one after sourcing.
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestTracking;
