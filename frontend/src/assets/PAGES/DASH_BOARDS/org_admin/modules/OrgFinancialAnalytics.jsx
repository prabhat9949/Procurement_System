import React from "react";
import { DollarSign, TrendingUp, Download } from "lucide-react";

const financialSummaryMock = [
  { category: "Total Org Budget Allocated", amount: "$2,500,000.00", percentage: "100.0%" },
  { category: "Total Commercial Outflow YTD", amount: "$1,240,000.00", percentage: "49.6%" },
  { category: "Commercial Sourcing Savings", amount: "$98,400.00", percentage: "7.9% Savings" },
];

const OrgFinancialAnalytics = () => {
  return (
    <div className="org-fin-analytics-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <DollarSign color="#f8b400" /> Enterprise Financial & Treasury Analytics
          </h1>
          <p className="org-page-subtitle">
            Organization-wide expenditure, wire disbursement analytics, cost optimization, and budget caps.
          </p>
        </div>

        <button
          className="org-btn-primary-sm"
          onClick={() => alert("Exporting Financial Analytics Briefing (CSV)...")}
        >
          <Download size={16} /> Export Treasury Summary (CSV)
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {financialSummaryMock.map((f, idx) => (
          <div key={idx} className="org-card org-card-gold-glow">
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>METRIC #{idx + 1}</span>
            <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "2px" }}>{f.category}</h3>
            <p style={{ fontSize: "24px", color: "#059669", fontWeight: "800", marginTop: "8px" }}>{f.amount}</p>
            <span style={{ fontSize: "13px", color: "#666666", fontWeight: "600" }}>{f.percentage} Ratio</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgFinancialAnalytics;
