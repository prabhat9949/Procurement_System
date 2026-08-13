import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Download,
  AlertOctagon,
} from "lucide-react";

const initialFlaggedTransactions = [
  { id: "FLG-TXN-001", ref: "PO-2026-4409", type: "Procurement Bypassed RFQ", riskScore: 78, status: "Critical Alert", desc: "Order value $15,200.00 dished with single quote." },
  { id: "FLG-TXN-002", ref: "VND-TECH-88", type: "Fraud Routing Duplicate Match", riskScore: 88, status: "Critical Alert", desc: "Vendor Suspicious Tech Sourcing matched bank wire routing details with Custom Office Designs." },
  { id: "FLG-TXN-003", ref: "SKU-NET-992", type: "Inventory Deficit Discrepancy", riskScore: 45, status: "Warning", desc: "Warehouse count deficit of -1 Cisco Catalyst switch ($2,990 value)." }
];

const initialRiskCategories = [
  { area: "Supplier single sourcing", riskScore: "Medium (35%)", trend: "+5% MoM", mitigation: "Establish primary and secondary backup hardware suppliers." },
  { area: "Treasury disbursement liquidity", riskScore: "Low (12%)", trend: "-2% MoM", mitigation: "Keep reserves above 12 cost centers YTD caps." },
  { area: "Warehouse spatial layout capacity", riskScore: "Low (8%)", trend: "+12% MoM", mitigation: "Optimise rack putaways in Zone C." }
];

const RiskAnalysis = () => {
  const [flags, setFlags] = useState(initialFlaggedTransactions);
  const [categories, setCategories] = useState(initialRiskCategories);
  const [activeSubTab, setActiveSubTab] = useState("flags"); // flags, categories

  const triggerDownload = (filename) => {
    alert(`Downloading risk matrix document: ${filename}`);
  };

  return (
    <div className="aud-risk-analysis-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <AlertTriangle color="#f8b400" size={28} /> Enterprise Risk Matrix & Fraud Detection
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Evaluate commercial risk metrics, identify fraud indicators, trace duplicate account matching, and configure mitigation plans.
          </p>
        </div>

        <button
          className="aud-btn-primary-sm"
          onClick={() => triggerDownload("Enterprise_Risk_Mitigation_Matrix.pdf")}
        >
          <Download size={16} /> Export Risk Matrix (PDF)
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("flags")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "flags" ? "700" : "500",
            color: activeSubTab === "flags" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "flags" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          High Risk Transactions & Fraud Alerts ({flags.length})
        </button>
        <button
          onClick={() => setActiveSubTab("categories")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "categories" ? "700" : "500",
            color: activeSubTab === "categories" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "categories" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Risk Categories & MoM Trends
        </button>
      </div>

      {/* 1. Flags Tab */}
      {activeSubTab === "flags" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Main warning summary */}
          <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertOctagon color="#dc2626" size={24} />
            <div>
              <strong style={{ color: "#dc2626", fontSize: "14px" }}>Fraud Detection Indicators Active</strong>
              <p style={{ color: "#333", fontSize: "13px", margin: "2px 0 0" }}>
                The automated system rules engine has flagged suspicious bank wires and competitive sourcing bypasses. Immediate auditor audit sign-off review required.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="aud-table-container">
              <table className="aud-table">
                <thead>
                  <tr>
                    <th>Alert ID</th>
                    <th>Linked Reference</th>
                    <th>Risk Type / Event</th>
                    <th>Risk Score (%)</th>
                    <th>Description Summary</th>
                    <th>Standing Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => {
                    const isCritical = f.riskScore >= 70;
                    return (
                      <tr key={f.id}>
                        <td style={{ fontWeight: "800", color: "#dc2626" }}>{f.id}</td>
                        <td style={{ color: "#d97706", fontWeight: "700" }}>{f.ref}</td>
                        <td style={{ fontWeight: "700" }}>{f.type}</td>
                        <td style={{ fontWeight: "800", color: isCritical ? "#dc2626" : "#d97706" }}>{f.riskScore}% Risk</td>
                        <td style={{ color: "#555", fontSize: "13.5px" }}>{f.desc}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: isCritical ? "rgba(220, 38, 38, 0.12)" : "rgba(217, 119, 6, 0.12)",
                              color: isCritical ? "#dc2626" : "#d97706",
                            }}
                          >
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Categories Tab */}
      {activeSubTab === "categories" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {categories.map((r, idx) => {
            const isMedium = r.riskScore.includes("Medium");
            return (
              <div key={idx} className="aud-card aud-card-gold-glow" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>RISK PILLAR ASSESSMENT #{idx + 1}</span>
                    <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>{r.area}</h3>
                    <p style={{ fontSize: "13.5px", color: "#555", marginTop: "4px" }}><strong>Mitigation Protocol:</strong> {r.mitigation}</p>
                  </div>

                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "#777" }}>MoM Trend</span>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: r.trend.includes("+") && isMedium ? "#dc2626" : "#059669", margin: 0 }}>
                        {r.trend}
                      </p>
                    </div>
                    
                    <span
                      style={{
                        background: isMedium ? "rgba(217, 119, 6, 0.12)" : "rgba(5, 150, 105, 0.12)",
                        color: isMedium ? "#d97706" : "#059669",
                        padding: "6px 14px",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "13px"
                      }}
                    >
                      {r.riskScore}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default RiskAnalysis;
