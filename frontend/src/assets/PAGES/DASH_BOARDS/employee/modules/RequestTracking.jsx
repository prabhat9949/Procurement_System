import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  PauseCircle,
} from "lucide-react";


import { getStoredMasterRequests, epsEventBus } from "../../../../../services/epsApiService";
import { generateWorkflowSteps } from "../../../../../services/purchaseRequestService";

const RequestTracking = ({ initialTrackingId }) => {
  const [requests, setRequests] = useState(() => getStoredMasterRequests());
  const [selectedReqId, setSelectedReqId] = useState(
    initialTrackingId || (requests.length > 0 ? requests[0].id : "")
  );

  useEffect(() => {
    const loadReqs = () => {
      const data = getStoredMasterRequests();
      setRequests(data);
    };
    loadReqs();
    const unsub = epsEventBus.subscribe(() => {
      loadReqs();
    });
    return unsub;
  }, []);

  const activeReq = requests.find((r) => r.id === selectedReqId) || requests[0] || null;

  if (!activeReq) {
    return (
      <div className="emp-tracking-container" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <h2>No Requisitions Found</h2>
        <p>You haven't submitted any requisitions yet. Track your orders here once they are submitted.</p>
      </div>
    );
  }

  const activeWorkflow = generateWorkflowSteps(activeReq);

  return (
    <div className="emp-tracking-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <Clock color="#f8b400" /> Requisition Workflow Tracker
          </h1>
          <p className="emp-page-subtitle">
            Real-time stage visualizer tracing your requisition through the 8-step enterprise approval chain.
          </p>
        </div>

        {/* Request Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "13px", color: "#555555", fontWeight: "700" }}>
            SELECT REQUISITION:
          </label>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="emp-form-select"
            style={{ width: "260px", borderColor: "#f8b400", fontWeight: "700" }}
          >
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} - {r.product.slice(0, 20)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Request Info Banner */}
      <div
        className="emp-card emp-card-gold-glow"
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
              TRACKING ID: {selectedReqId}
            </span>
            <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>
              {activeWorkflow.product}
            </h2>
            <p style={{ color: "#555555", fontSize: "13px", marginTop: "2px" }}>
              Est. Total Cost: <strong style={{ color: "#111111" }}>{activeWorkflow.cost}</strong>
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#666666",
                textTransform: "uppercase",
                display: "block",
                fontWeight: "700",
              }}
            >
              Workflow Progress
            </span>
            <span style={{ fontSize: "24px", color: "#d97706", fontWeight: "800" }}>
              Stage {activeWorkflow.currentStep} of 8
            </span>
          </div>
        </div>

        {/* Progress Line Bar */}
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
              width: `${(activeWorkflow.currentStep / 8) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #f8b400, #059669)",
              borderRadius: "4px",
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>
      </div>

      {/* 8-Stage Interactive Timeline */}
      <div className="emp-card">
        <h3
          style={{
            color: "#111111",
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "28px",
          }}
        >
          Approval & Delivery Pipeline
        </h3>

        <div className="emp-timeline-container">
          {activeWorkflow.steps.map((step, index) => (
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

export default RequestTracking;
