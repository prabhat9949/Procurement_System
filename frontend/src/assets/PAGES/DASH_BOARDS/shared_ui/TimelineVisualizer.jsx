import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

const TimelineVisualizer = ({ steps = [] }) => {
  return (
    <div className="emp-timeline-container">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className={`emp-timeline-item ${step.status}`}
          style={{ opacity: step.status === "pending" ? 0.5 : 1 }}
        >
          <div className="emp-timeline-node">
            {step.status === "done" && <CheckCircle2 size={12} color="#ffffff" />}
            {step.status === "active" && (
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#000000",
                }}
              />
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

            <p style={{ fontSize: "13px", color: "#555555", marginBottom: "4px" }}>
              {step.desc}
            </p>

            {step.actor && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#d97706",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                Actioned By: <strong>{step.actor}</strong>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineVisualizer;
