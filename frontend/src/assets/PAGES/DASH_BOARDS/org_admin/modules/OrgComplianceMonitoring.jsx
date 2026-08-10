import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

const complianceOrgMock = [
  { domain: "Procurement Approval Policy", score: "99.1% Compliant", status: "Optimal" },
  { domain: "Financial Disbursement SLA", score: "99.4% Compliant", status: "Optimal" },
  { domain: "Vendor Contract Compliance", score: "98.2% Compliant", status: "Optimal" },
  { domain: "Warehouse Barcode Tagging", score: "97.8% Compliant", status: "Optimal" },
];

const OrgComplianceMonitoring = () => {
  return (
    <div className="org-compliance-mon-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <ShieldCheck color="#f8b400" /> Organization Compliance & Policy Control
          </h1>
          <p className="org-page-subtitle">
            Executive compliance monitoring across procurement, financial disburser desks, and inventory docks.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {complianceOrgMock.map((c, idx) => (
          <div key={idx} className="org-card org-card-gold-glow">
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>GOVERNANCE PILLAR #{idx + 1}</span>
            <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>{c.domain}</h3>
            <p style={{ fontSize: "24px", color: "#059669", fontWeight: "800", marginTop: "8px" }}>{c.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgComplianceMonitoring;
