import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Truck,
  CheckCheck,
  Send,
  ShoppingBag,
  PackageCheck,
  Search,
  Filter,
  PauseCircle
} from "lucide-react";



import { epsEventBus, fetchTrackForms } from "../../../../../services/epsApiService";

const ProcurementTracking = () => {
  const [workflows, setWorkflows] = useState({});
  const [selectedReqId, setSelectedReqId] = useState("");
  const [activeTrackingFilter, setActiveTrackingFilter] = useState("all"); // 'all' | 'rfq' | 'po' | 'delivery'

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrackForms();
      if (data && Object.keys(data).length > 0) {
        setWorkflows(data);
      }
    };
    load();
    const unsub = epsEventBus.subscribe(async () => {
      const data = await fetchTrackForms();
      if (data && Object.keys(data).length > 0) {
        setWorkflows(data);
      }
    });
    return unsub;
  }, []);

  const activeWorkflow =
    workflows[selectedReqId] ||
    Object.values(workflows)[0] ||
    null;

  if (!activeWorkflow) {
    return (
      <div className="pe-tracking-container" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <h2>No Procurement Workflows</h2>
        <p>There are currently no active procurement workflows to track.</p>
      </div>
    );
  }

  const stepsList = activeWorkflow.steps || [];

  const filteredSteps = stepsList.filter((s) => {
    if (activeTrackingFilter === "all") return true;
    if (activeTrackingFilter === "rfq") return s.phase === "RFQ" || s.title.includes("RFQ") || s.title.includes("Request");
    if (activeTrackingFilter === "po") return s.phase === "PO" || s.title.includes("PO") || s.title.includes("Order");
    if (activeTrackingFilter === "delivery") return s.phase === "Delivery" || s.title.includes("Delivered") || s.title.includes("Goods");
    return true;
  });

  return (
    <div className="pe-tracking-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <Clock color="#f8b400" /> End-to-End Procurement & Delivery Tracker
          </h1>
          <p className="pe-page-subtitle">
            Track RFQ status, PO transmission status, and real-time shipment delivery progress.
          </p>
        </div>

        {/* Requisition Dropdown Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "13px", color: "#555555", fontWeight: "700" }}>
            SELECT PROCUREMENT:
          </label>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="pe-form-select"
            style={{ width: "240px", borderColor: "#f8b400", fontWeight: "700" }}
          >
            {Object.keys(workflows).map((id) => (
              <option key={id} value={id}>
                {id} - {(workflows[id].item || workflows[id].product || "Item").slice(0, 20)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Workflow Banner */}
      <div
        className="pe-card pe-card-gold-glow"
        style={{ marginBottom: "28px", padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ color: "#d97706", fontSize: "12px", fontWeight: "800" }}>
              TRACKING ID: {selectedReqId} • RFQ: {activeWorkflow.rfqCode} • PO: {activeWorkflow.poCode}
            </span>
            <h2 style={{ fontSize: "22px", color: "#111111", fontWeight: "800", marginTop: "2px" }}>
              {activeWorkflow.item}
            </h2>
            <p style={{ color: "#555555", fontSize: "13.5px", marginTop: "4px" }}>
              Supplier: <strong style={{ color: "#111111" }}>{activeWorkflow.vendor}</strong> • Carrier: <strong>{activeWorkflow.carrier}</strong> (Waybill #{activeWorkflow.trackingNumber})
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
              Overall Progress
            </span>
            <p style={{ fontSize: "26px", color: "#059669", fontWeight: "800" }}>
              Stage {activeWorkflow.currentStep} of 8
            </p>
          </div>
        </div>

        {/* 3 Status Summary Pills for RFQ, PO, Delivery */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #ececec",
          }}
        >
          <div
            onClick={() => setActiveTrackingFilter("rfq")}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: activeTrackingFilter === "rfq" ? "rgba(248,180,0,0.18)" : "#f8f9fb",
              border: activeTrackingFilter === "rfq" ? "2px solid #f8b400" : "1px solid #ececec",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>
              1. RFQ Status
            </span>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>
              {activeWorkflow.rfqStatus}
            </p>
          </div>

          <div
            onClick={() => setActiveTrackingFilter("po")}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: activeTrackingFilter === "po" ? "rgba(248,180,0,0.18)" : "#f8f9fb",
              border: activeTrackingFilter === "po" ? "2px solid #f8b400" : "1px solid #ececec",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>
              2. PO Status
            </span>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>
              {activeWorkflow.poStatus}
            </p>
          </div>

          <div
            onClick={() => setActiveTrackingFilter("delivery")}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: activeTrackingFilter === "delivery" ? "rgba(248,180,0,0.18)" : "#f8f9fb",
              border: activeTrackingFilter === "delivery" ? "2px solid #f8b400" : "1px solid #ececec",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>
              3. Delivery Status
            </span>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#059669", margin: "2px 0 0" }}>
              {activeWorkflow.deliveryStatus}
            </p>
          </div>
        </div>
      </div>

      {/* 8-Stage Visual Timeline */}
      <div className="pe-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "800" }}>
            Fulfillment Stage Pipeline Visualization
          </h3>

          <div style={{ display: "flex", gap: "8px" }}>
            {["all", "rfq", "po", "delivery"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveTrackingFilter(f)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTrackingFilter === f ? "#f8b400" : "#f8f9fb",
                  color: activeTrackingFilter === f ? "#000" : "#555",
                  fontWeight: activeTrackingFilter === f ? "700" : "600",
                  fontSize: "12px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {f === "all" ? "All Stages" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="emp-timeline-container">
          {filteredSteps.map((step, index) => (
            <div
              key={index}
              className={`emp-timeline-item ${step.status}`}
              style={{ opacity: step.status === "pending" ? 0.55 : 1 }}
            >
              <div className="emp-timeline-node">
                {step.status === "done" && <CheckCircle2 size={13} color="#ffffff" />}
                {step.status === "active" && (
                  <PauseCircle size={14} color="#f8b400" />
                )}
              </div>

              <div className="emp-timeline-content">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <h4
                    style={{
                      color: step.status === "active" ? "#d97706" : "#111111",
                      fontSize: "15px",
                      fontWeight: "700",
                    }}
                  >
                    {step.title}
                  </h4>
                  <span style={{ fontSize: "12px", color: "#666666" }}>{step.timestamp}</span>
                </div>

                <p style={{ fontSize: "13px", color: "#555555", marginBottom: "8px" }}>
                  {step.desc}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#d97706",
                    fontWeight: "700",
                  }}
                >
                  <UserCheck size={14} />
                  <span>
                    Actioned By: <strong>{step.actor}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcurementTracking;
