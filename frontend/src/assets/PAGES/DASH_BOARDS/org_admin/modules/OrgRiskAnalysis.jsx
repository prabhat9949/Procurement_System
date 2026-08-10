import React from "react";
import { AlertTriangle, Activity } from "lucide-react";

const orgRiskMock = [
  { area: "Commercial Disbursement Limits (> $25k)", riskScore: "Low Risk (1.2/10)", detail: "Mandatory CFO sign-off active." },
  { area: "Hardware Single Supplier Dependency", riskScore: "Medium Risk (3.4/10)", detail: "Secondary supplier qualified." },
  { area: "Warehouse Safety Buffer", riskScore: "Low Risk (0.8/10)", detail: "Automated reorder triggers active." },
];

const OrgRiskAnalysis = () => {
  return (
    <div className="org-risk-analysis-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <AlertTriangle color="#f8b400" /> Enterprise Risk Matrix & Vulnerability Control
          </h1>
          <p className="org-page-subtitle">
            Executive risk indicators across procurement, finance, vendor relations, and warehouse inventory.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {orgRiskMock.map((r, idx) => (
          <div key={idx} className="org-card org-card-gold-glow">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>RISK DOMAIN #{idx + 1}</span>
                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>{r.area}</h3>
                <p style={{ fontSize: "13px", color: "#666666" }}>Mitigation: {r.detail}</p>
              </div>

              <span style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669", padding: "6px 14px", borderRadius: "12px", fontWeight: "800", fontSize: "13px" }}>
                {r.riskScore}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgRiskAnalysis;
