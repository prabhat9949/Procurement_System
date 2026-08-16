import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Truck,
  Send,
  ShoppingBag,
  Loader2,
  AlertTriangle,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const PO_PIPELINE = ["DRAFT", "GENERATED", "SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED"];

const ProcurementTracking = () => {
  const [pos, setPos] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [poRes, rfqRes] = await Promise.all([
        apiGet("/api/purchase-orders?page=0&size=100&sort=orderDate&direction=desc").catch(() => null),
        apiGet("/api/rfqs?page=0&size=100").catch(() => null),
      ]);
      setPos(poRes?.content || []);
      setRfqs(rfqRes?.content || []);
      setSelectedPoId((prev) => prev || poRes?.content?.[0]?.id || "");
    } catch (err) {
      setError(err.message || "Unable to load procurement data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadDetail = useCallback(async (poId) => {
    if (!poId) return;
    setDetailLoading(true);
    setError("");
    try {
      const po = pos.find((p) => String(p.id) === String(poId));
      if (!po) return;
      const [histRes, prRes] = await Promise.all([
        apiGet(`/api/approval-histories?purchaseRequestId=${po.purchaseRequestId}&size=50&sort=performedAt&direction=asc`).catch(() => null),
        apiGet(`/api/purchase-requests/${po.purchaseRequestId}`).catch(() => null),
      ]);
      setDetail({
        po,
        pr: prRes || null,
        history: histRes?.content || [],
        rfq: rfqs.find((r) => String(r.purchaseRequestId) === String(po.purchaseRequestId)) || null,
      });
    } catch (err) {
      setError(err.message || "Unable to load tracking details.");
    } finally {
      setDetailLoading(false);
    }
  }, [pos, rfqs]);

  useEffect(() => {
    if (selectedPoId) loadDetail(selectedPoId);
  }, [selectedPoId, loadDetail]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "100px 0", color: "#888", fontWeight: 600 }}>
        <Loader2 size={22} className="login-spin" /> Loading procurement workflows...
      </div>
    );
  }

  if (pos.length === 0) {
    return (
      <div className="pe-tracking-container" style={{ padding: 40, textAlign: "center", color: "#666" }}>
        <h2>No Purchase Orders</h2>
        <p>There are currently no purchase orders to track. Generate a PO from an approved vendor selection to start tracking.</p>
      </div>
    );
  }

  const currentIndex = detail ? PO_PIPELINE.indexOf(detail.po.status) : -1;

  return (
    <div className="pe-tracking-container">
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Clock color="#f8b400" /> Procurement &amp; Delivery Tracker
          </h1>
          <p className="pe-page-subtitle">
            Track the full journey of each purchase order — approvals, RFQ, PO status and delivery — from the database.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 700 }}>SELECT PURCHASE ORDER:</label>
          <select
            value={selectedPoId}
            onChange={(e) => setSelectedPoId(e.target.value)}
            className="pe-form-select"
            style={{ width: 280, borderColor: "#f8b400", fontWeight: 700 }}
          >
            {pos.map((p) => (
              <option key={p.id} value={p.id}>{p.poNumber} — {p.vendorName} ({p.status})</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      {detailLoading || !detail ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={20} className="login-spin" /> Loading tracking details...
        </div>
      ) : (
        <>
          <div className="pe-card pe-card-gold-glow" style={{ marginBottom: 24, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span style={{ color: "#d97706", fontSize: 12, fontWeight: 800 }}>
                  PO: {detail.po.poNumber} {detail.rfq ? `· RFQ: ${detail.rfq.rfqNumber}` : ""} {detail.pr ? `· ${detail.pr.requestNumber}` : ""}
                </span>
                <h2 style={{ fontSize: 20, color: "#111", fontWeight: 800, marginTop: 2 }}>
                  {detail.po.vendorName}
                </h2>
                <p style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
                  Amount: <strong style={{ color: "#059669" }}>{formatINR(detail.po.grandTotal)}</strong> · Expected delivery: <strong>{formatDateIN(detail.po.expectedDeliveryDate, { withTime: false })}</strong> · Payment: {detail.po.paymentTerms || "—"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 12, color: "#666", textTransform: "uppercase", fontWeight: 700 }}>PO Status</span>
                <p style={{ fontSize: 22, color: detail.po.status === "FULLY_RECEIVED" || detail.po.status === "CLOSED" ? "#059669" : "#d97706", fontWeight: 800 }}>{detail.po.status}</p>
              </div>
            </div>
          </div>

          {/* PO pipeline */}
          <div className="pe-card" style={{ marginBottom: 24, padding: 22 }}>
            <h3 style={{ fontSize: 15, color: "#111", fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={16} color="#f8b400" /> Purchase Order Pipeline
            </h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PO_PIPELINE.map((stage, idx) => {
                const state = idx < currentIndex ? "done" : idx === currentIndex ? "current" : "todo";
                return (
                  <React.Fragment key={stage}>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: state === "done" ? "rgba(5,150,105,.12)" : state === "current" ? "rgba(217,119,6,.12)" : "#f1f5f9",
                        color: state === "done" ? "#059669" : state === "current" ? "#d97706" : "#94a3b8",
                      }}
                    >
                      {state === "done" ? "✓" : state === "current" ? "⏳" : "○"} {stage}
                    </div>
                    {idx < PO_PIPELINE.length - 1 && <span style={{ color: "#cbd5e1", alignSelf: "center" }}>→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Approval + workflow timeline */}
          <div className="pe-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, color: "#111", fontWeight: 800, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <ClipboardCheck size={16} color="#d97706" /> Request Approval &amp; Workflow Timeline
            </h3>
            <div className="emp-timeline-container">
              {[
                { label: "Request Created", at: detail.pr?.createdAt, kind: "CREATED" },
                ...(detail.history || []).map((h) => ({
                  label: h.action === "SUBMITTED" ? "Submitted" : h.action === "APPROVED" ? "Approved" : h.action === "REJECTED" ? "Rejected" : h.action === "RETURNED" ? "Returned for Correction" : h.action,
                  at: h.performedAt,
                  who: h.performedByName,
                  comment: h.comments,
                  kind: h.action,
                })),
                { label: "Purchase Order Generated", at: detail.po.orderDate, kind: "PO" },
              ]
                .filter((s) => s.at || s.kind === "PO")
                .map((step, idx) => {
                  const color = step.kind === "REJECTED" ? "#dc2626" : step.kind === "RETURNED" ? "#2563eb" : step.kind === "APPROVED" || step.kind === "PO" ? "#059669" : step.kind === "CREATED" ? "#7c3aed" : "#d97706";
                  const Icon = step.kind === "REJECTED" ? XCircle : step.kind === "RETURNED" ? RotateCcw : step.kind === "APPROVED" || step.kind === "PO" ? CheckCircle2 : step.kind === "CREATED" ? FileText : Send;
                  return (
                    <div key={idx} className="emp-timeline-item" style={{ position: "relative", paddingBottom: 16 }}>
                      <div className="emp-timeline-node" style={{ position: "absolute", left: 0, top: 2, width: 30, height: 30, borderRadius: "50%", background: `${color}14`, color, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${color}` }}>
                        <Icon size={13} />
                      </div>
                      <div style={{ marginLeft: 44 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#111" }}>{step.label}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {step.at ? formatDateIN(step.at) : ""} {step.who ? `· ${step.who}` : ""}
                        </div>
                        {step.comment && (
                          <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4, background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>“{step.comment}”</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProcurementTracking;
