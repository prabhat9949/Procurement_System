import React, { useState, useEffect } from "react";
import {
  Truck,
  CheckCircle2,
  UserCheck,
  PauseCircle,
} from "lucide-react";
import { epsEventBus, fetchTrackForms } from "../../../../../services/epsApiService";

const VendorDeliveryTracking = () => {
  const [workflows, setWorkflows] = useState({});
  const [selectedPoCode, setSelectedPoCode] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrackForms();
      // Filter only workflows that have a PO assigned
      const vendorData = {};
      Object.keys(data).forEach((key) => {
        if (data[key].poCode && data[key].poCode !== "Pending PO Generation") {
          vendorData[key] = data[key];
        }
      });
      if (Object.keys(vendorData).length > 0) {
        setWorkflows(vendorData);
      }
    };
    load();
    
    const unsub = epsEventBus.subscribe(async () => {
      const data = await fetchTrackForms();
      const vendorData = {};
      Object.keys(data).forEach((key) => {
        if (data[key].poCode && data[key].poCode !== "Pending PO Generation") {
          vendorData[key] = data[key];
        }
      });
      if (Object.keys(vendorData).length > 0) {
        setWorkflows(vendorData);
      }
    });
    return unsub;
  }, []);

  const activeWorkflow = workflows[selectedPoCode] || Object.values(workflows)[0] || null;

  let displayWorkflow = null;
  if (activeWorkflow) {
    displayWorkflow = JSON.parse(JSON.stringify(activeWorkflow));
    if (displayWorkflow.steps && displayWorkflow.steps.length > 4) {
      displayWorkflow.steps[4].title = "5. Purchase Order Issued";
    }
  }

  if (!displayWorkflow) {
    return (
      <div className="vnd-tracking-container" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <h2>No Active Deliveries</h2>
        <p>You have no active purchase orders or shipments to track at this time.</p>
      </div>
    );
  }

  return (
    <div className="vnd-tracking-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <Truck color="#f8b400" /> 9-Stage Organizational Procurement Tracker
          </h1>
          <p className="vnd-page-subtitle">
            End-to-end lifecycle tracking across all 9 stages of enterprise procurement.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "13px", color: "#555555", fontWeight: "700" }}>
            SELECT PROCUREMENT:
          </label>
          <select
            value={selectedPoCode}
            onChange={(e) => setSelectedPoCode(e.target.value)}
            className="vnd-form-select"
            style={{ width: "240px", borderColor: "#f8b400", fontWeight: "700" }}
          >
            {Object.keys(workflows).map((id) => (
              <option key={id} value={id}>
                {id} - {(workflows[id]?.item || "Item").slice(0, 20)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Banner */}
      <div
        className="vnd-card vnd-card-gold-glow"
        style={{ marginBottom: "28px", padding: "20px 24px" }}
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
              TRACKING ID: {displayWorkflow.id} • PO: {displayWorkflow.poCode}
            </span>
            <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>
              {displayWorkflow.item}
            </h2>
            <p style={{ color: "#555555", fontSize: "13px", marginTop: "2px" }}>
              Awarded Supplier: <strong style={{ color: "#111111" }}>{displayWorkflow.vendor}</strong>
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
              Progress Status
            </span>
            <p style={{ fontSize: "24px", color: "#d97706", fontWeight: "800" }}>
              Stage {displayWorkflow.currentStep} of 9
            </p>
          </div>
        </div>

        {/* Progress Line */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#ececec",
            borderRadius: "4px",
            marginTop: "18px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(displayWorkflow.currentStep / 9) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #f8b400, #059669)",
              borderRadius: "4px",
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>
      </div>

      {/* 9-Stage Timeline */}
      <div className="vnd-card">
        <h3
          style={{
            color: "#111111",
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "28px",
          }}
        >
          9-Stage Executive Workflow Pipeline
        </h3>

        <div className="emp-timeline-container">
          {displayWorkflow.steps && displayWorkflow.steps.map((step, index) => (
            <div
              key={index}
              className={`emp-timeline-item ${step.status}`}
              style={{ opacity: step.status === "pending" ? 0.5 : 1 }}
            >
              <div className="emp-timeline-node">
                {step.status === "done" && <CheckCircle2 size={12} color="#ffffff" />}
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
                    fontWeight: "600",
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

export default VendorDeliveryTracking;
