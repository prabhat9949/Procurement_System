import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  AlertTriangle,
  FileText,
  Clock,
  HelpCircle,
  Download,
} from "lucide-react";

const initialPillars = [
  { id: "PIL-01", title: "Procurement Approval Policy", score: "99.1% Compliant", status: "Optimal", desc: "Dual signatures verified for orders > $25k." },
  { id: "PIL-02", title: "Financial Remittance SLA", score: "99.4% Compliant", status: "Optimal", desc: "Payments posted within net-day intervals." },
  { id: "PIL-03", title: "Vendor Commercial Term SLA", score: "98.2% Compliant", status: "Optimal", desc: "RFQ pricing competes with catalog benchmarks." },
  { id: "PIL-04", title: "Warehouse Stock Barcode Tagging", score: "97.8% Compliant", status: "Good", desc: "RFID tag updates mapped onto server layouts." },
];

const initialViolations = [
  { id: "VIO-202", date: "2026-07-25", pillar: "Procurement Approval Policy", details: "competitive bidding bypassed for custom desks", severity: "Medium Warning", recommendation: "Enforce digital RFQ competitor constraints in sourcing desks." },
  { id: "VIO-199", date: "2026-07-20", pillar: "Warehouse Stock Tagging", details: "unreconciled stock deficit in Cisco Catalyst switch counts", severity: "Critical Risk", recommendation: "Perform physical warehouse barcode verification audit." }
];

const ComplianceMonitoring = () => {
  const [pillars, setPillars] = useState(initialPillars);
  const [violations, setViolations] = useState(initialViolations);
  const [activeSubTab, setActiveSubTab] = useState("pillars"); // pillars, violations

  const triggerDownload = (report) => {
    alert(`Downloading compliance documentation report: ${report}`);
  };

  return (
    <div className="aud-compliance-mon-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ShieldCheck color="#f8b400" size={28} /> Policy & Regulatory Compliance Monitoring
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Verify organizational policy standing, identify regulatory violations, and review auditor-recommended settings overrides.
          </p>
        </div>

        <button
          className="aud-btn-primary-sm"
          onClick={() => triggerDownload("Regulatory_SOX_Compliance_Form.pdf")}
        >
          <Download size={16} /> Export Regulatory SOX Report
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("pillars")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "pillars" ? "700" : "500",
            color: activeSubTab === "pillars" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "pillars" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Compliance Pillars Status
        </button>
        <button
          onClick={() => setActiveSubTab("violations")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "violations" ? "700" : "500",
            color: activeSubTab === "violations" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "violations" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Compliance Violations & Recommendations ({violations.length})
        </button>
      </div>

      {/* 1. Pillars Grid */}
      {activeSubTab === "pillars" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {pillars.map((c, idx) => (
            <div key={c.id} className="aud-card aud-card-gold-glow" style={{ padding: "20px" }}>
              <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>COMPLIANCE PILLAR #{idx + 1}</span>
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>{c.title}</h3>
              <p style={{ fontSize: "24px", color: "#059669", fontWeight: "800", marginTop: "8px", marginBottom: "4px" }}>{c.score}</p>
              <span style={{ fontSize: "13px", color: "#666" }}>{c.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Violations List */}
      {activeSubTab === "violations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {violations.map((v) => (
            <div
              key={v.id}
              style={{
                border: "1px solid #ececec",
                borderRadius: "12px",
                padding: "20px",
                background: "#ffffff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>
                  ALERT CODE: {v.id} • Date: {v.date}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    background: v.severity.includes("Critical") ? "rgba(220, 38, 38, 0.12)" : "rgba(217, 119, 6, 0.12)",
                    color: v.severity.includes("Critical") ? "#dc2626" : "#d97706",
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {v.severity}
                </span>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", marginTop: "10px", marginBottom: "4px" }}>
                Pillar: {v.pillar}
              </h3>
              <p style={{ fontSize: "14px", color: "#555" }}>
                <strong>Violation Details:</strong> {v.details}
              </p>

              <div style={{ marginTop: "14px", padding: "12px 14px", background: "#f8f9fb", borderLeft: "4px solid #f8b400", borderRadius: "0 8px 8px 0" }}>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>Auditor Action Recommendation</span>
                <p style={{ fontSize: "13px", color: "#333", margin: "2px 0 0" }}>{v.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ComplianceMonitoring;
