import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  PauseCircle,
  UserCheck,
  Loader2,
  WifiOff,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatDateIN } from "../../../../../utils/format";

// Canonical procurement pipeline used to compute progress position.
const PIPELINE = [
  "PR_CREATED",
  "PR_SUBMITTED",
  "MANAGER_APPROVAL",
  "SENIOR_MANAGER_APPROVAL",
  "HEAD_APPROVAL",
  "PROCUREMENT",
  "INVENTORY",
  "RFQ",
  "QUOTATION",
  "VENDOR_SELECTION",
  "PO",
  "DELIVERY",
  "WAREHOUSE",
  "GRN",
  "AUDIT",
  "FINANCE",
  "COMPLETED",
];

const stageLabel = (s) =>
  ({
    PR_CREATED: "Request Created",
    PR_SUBMITTED: "Request Submitted",
    MANAGER_APPROVAL: "Manager Approval",
    SENIOR_MANAGER_APPROVAL: "Senior Manager Approval",
    HEAD_APPROVAL: "Head Approval",
    PROCUREMENT: "Procurement",
    INVENTORY: "Inventory Check",
    RFQ: "RFQ",
    QUOTATION: "Quotations",
    VENDOR_SELECTION: "Vendor Selection",
    PO: "Purchase Order",
    DELIVERY: "Delivery",
    WAREHOUSE: "Warehouse",
    GRN: "GRN",
    AUDIT: "Audit",
    FINANCE: "Finance",
    COMPLETED: "Completed",
  }[s] || s);

// Timeline event colouring — approval/success, rejection, return and neutral states.
const eventColor = (type = "") => {
  const t = String(type || "").toUpperCase();
  if (t.includes("REJECTED")) return "#dc2626";
  if (t.includes("RETURNED")) return "#d97706";
  if (t.includes("CANCELLED")) return "#64748b";
  if (t.includes("APPROVED") || t.includes("COMPLETED") || t.includes("CREATED") || t.includes("SUBMITTED") || t.includes("CONCLUDED")) return "#059669";
  return "#2563eb";
};

const ProcurementTracking = () => {
  const [prs, setPrs] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState("");
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPrs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/purchase-requests?page=0&size=100&sort=createdAt&direction=desc");
      const list = page?.content || [];
      setPrs(list);
      if (list.length > 0) setSelectedReqId((prev) => prev || list[0].id);
    } catch (err) {
      setError(err.message || "Unable to load purchase requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrs();
  }, [loadPrs]);

  useEffect(() => {
    if (!selectedReqId) return;
    const loadTimeline = async () => {
      setTimelineLoading(true);
      setError("");
      try {
        const data = await apiGet(`/api/procurement/${selectedReqId}/timeline`);
        setTimeline({ ...(data || {}), events: Array.isArray(data?.events) ? data.events : [] });
      } catch (err) {
        setError(err.message || "Unable to load workflow timeline.");
      } finally {
        setTimelineLoading(false);
      }
    };
    loadTimeline();
  }, [selectedReqId]);

  const stagePosition = timeline?.currentStage
    ? Math.max(0, PIPELINE.findIndex((s) => String(timeline.currentStage).toUpperCase().includes(s)) || 0)
    : 0;
  const progress = timeline ? Math.min(100, Math.round(((stagePosition + 1) / PIPELINE.length) * 100)) : 0;

  if (loading) {
    return (
      <div className="pman-tracking-container" style={{ padding: "60px 0", textAlign: "center", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Loader2 size={20} className="login-spin" /> Loading procurement tracking…
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="pman-tracking-container" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <Clock size={34} style={{ opacity: 0.4, marginBottom: 10 }} />
        <h2>No Procurement Workflows</h2>
        <p>There are currently no procurement workflows available in your scope to track.</p>
      </div>
    );
  }

  const selectedPr = prs.find((p) => String(p.id) === String(selectedReqId));

  return (
    <div className="pman-tracking-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Clock color="#f8b400" /> Procurement Workflow Tracker
          </h1>
          <p className="pman-page-subtitle">
            End-to-end lifecycle tracking — approvals, team routing, RFQ, PO, delivery, GRN, audit and finance — from the workflow engine.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "13px", color: "#555555", fontWeight: "700" }}>SELECT REQUEST:</label>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="pman-form-select"
            style={{ width: "260px", borderColor: "#f8b400", fontWeight: "700" }}
          >
            {prs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.requestNumber} — {(p.purpose || "Item").slice(0, 24)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      {/* Banner */}
      <div className="pman-card pman-card-gold-glow" style={{ marginBottom: "28px", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ color: "#d97706", fontSize: "12px", fontWeight: "800" }}>
              {timeline.requestNumber} • {timeline.departmentName}
            </span>
            <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>
              {selectedPr?.purpose || "Procurement Request"}
            </h2>
            <p style={{ color: "#555555", fontSize: "13px", marginTop: "2px" }}>
              Requester: <strong style={{ color: "#111111" }}>{timeline.requesterName}</strong>
              {timeline.currentAssigneeName && (
                <> · Current Owner: <strong style={{ color: "#d97706" }}>{timeline.currentAssigneeName} ({timeline.currentAssigneeRole})</strong></>
              )}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>Progress Status</span>
            <p style={{ fontSize: "20px", color: "#d97706", fontWeight: "800" }}>
              {stageLabel(timeline.currentStage) || "—"} · {progress}%
            </p>
          </div>
        </div>

        {/* Progress Line */}
        <div style={{ width: "100%", height: "8px", background: "#ececec", borderRadius: "4px", marginTop: "18px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #f8b400, #059669)",
              borderRadius: "4px",
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="pman-card">
        <h3 style={{ color: "#111111", fontSize: "18px", fontWeight: "700", marginBottom: "28px" }}>
          Complete Workflow Timeline
        </h3>

        {timelineLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 10, color: "#666" }}>
            <Loader2 size={20} className="login-spin" /> Loading timeline…
          </div>
        ) : timeline.events.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", padding: "30px 0" }}>No workflow events recorded yet.</p>
        ) : (
          <div className="emp-timeline-container">
            {timeline.events.slice().reverse().map((step, index) => {
              const color = eventColor(step.type);
              const done = ["APPROVED", "COMPLETED", "AUTO_APPROVED", "PR_CREATED", "PR_SUBMITTED", "RFQ_CREATED", "PO_CREATED", "GRN_CREATED", "AUDIT_CONCLUDED"].some((t) => (step.type || "").includes(t));
              const rejected = (step.type || "").includes("REJECTED");
              return (
                <div key={index} className="emp-timeline-item" style={{ opacity: 1 }}>
                  <div className="emp-timeline-node" style={{ background: color, borderColor: color }}>
                    {rejected ? <XCircle size={12} color="#ffffff" /> : (step.type || "").includes("RETURNED") ? <RotateCcw size={12} color="#ffffff" /> : done ? <CheckCircle2 size={12} color="#ffffff" /> : <PauseCircle size={14} color="#ffffff" />}
                  </div>

                  <div className="emp-timeline-content">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <h4 style={{ color: "#111111", fontSize: "15px", fontWeight: "700" }}>{step.title}</h4>
                      <span style={{ fontSize: "12px", color: "#666666" }}>{formatDateIN(step.occurredAt)}</span>
                    </div>

                    <p style={{ fontSize: "13px", color: "#555555", marginBottom: "8px" }}>
                      {step.description || "—"}
                      {step.reference ? ` (${step.reference})` : ""}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#d97706", fontWeight: "600" }}>
                      <UserCheck size={14} />
                      <span>
                        {step.performedByName || "System"} {step.performedByRole ? `(${step.performedByRole})` : ""} · Stage: {step.stage || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcurementTracking;
