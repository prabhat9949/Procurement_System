import React, { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  Zap,
  Activity,
  Layers,
  Globe,
  Award,
  Download,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

const biMonthlyTrendData = [
  { month: "Q1 Jan", spend: 180000, forecast: 175000, efficiency: 95.2 },
  { month: "Q1 Feb", spend: 220000, forecast: 215000, efficiency: 96.0 },
  { month: "Q1 Mar", spend: 290000, forecast: 285000, efficiency: 97.1 },
  { month: "Q2 Apr", spend: 260000, forecast: 270000, efficiency: 96.8 },
  { month: "Q2 May", spend: 340000, forecast: 330000, efficiency: 97.9 },
  { month: "Q2 Jun", spend: 310000, forecast: 315000, efficiency: 98.2 },
  { month: "Q3 Jul", spend: 480000, forecast: 460000, efficiency: 98.8 },
];

const biSpendAllocation = [
  { name: "Hardware & IT Equipment", value: 42, color: "#f8b400" },
  { name: "SaaS & Cloud Services", value: 28, color: "#059669" },
  { name: "Cloud Infra & Servers", value: 18, color: "#3b82f6" },
  { name: "Office Facilities", value: 12, color: "#7c3aed" },
];

const BusinessIntelligence = () => {
  const [activeBiTab, setActiveBiTab] = useState("executive");

  return (
    <div className="org-bi-container">
      {/* Header Bar styled like Power BI / SAP Analytics Cloud */}
      <div
        className="org-card"
        style={{
          marginBottom: "28px",
          background: "#111111",
          color: "#ffffff",
          padding: "20px 24px",
          borderRadius: "16px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
        }}
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
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(248, 180, 0, 0.2)",
                color: "#f8b400",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              <Zap size={14} /> SAP ANALYTICS CLOUD & POWER BI ENTERPRISE SUITE
            </div>
            <h2 style={{ fontSize: "24px", color: "#ffffff", fontWeight: "800" }}>
              Enterprise Executive Intelligence Control Room
            </h2>
            <p style={{ color: "#aaaaaa", fontSize: "13px", marginTop: "2px" }}>
              Real-time executive decision intelligence, cross-domain spend correlation, and predictive analytics.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="org-btn-primary-sm"
              style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid #333333" }}
            >
              <Filter size={15} /> Filter FY2026
            </button>
            <button className="org-btn-primary-sm" onClick={() => alert("Exporting BI Analytics Dashboard (Power BI .pbix)...")}>
              <Download size={15} /> Export BI Report (PDF)
            </button>
          </div>
        </div>

        {/* BI Navigation Bar */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #222222",
            overflowX: "auto",
          }}
        >
          {[
            { id: "executive", label: "Executive Summary" },
            { id: "procurement", label: "Procurement Intelligence" },
            { id: "financial", label: "Financial Intelligence" },
            { id: "inventory", label: "Inventory Intelligence" },
            { id: "trends", label: "Predictive Trends" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveBiTab(tab.id)}
              style={{
                background: activeBiTab === tab.id ? "#f8b400" : "rgba(255,255,255,0.05)",
                color: activeBiTab === tab.id ? "#000000" : "#cccccc",
                fontWeight: "700",
                fontSize: "13px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Dashboard Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Actual Spend vs Predictive Forecast Line Chart */}
        <div className="org-card org-card-gold-glow">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>POWER BI VISUALIZER</span>
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "800" }}>
                Actual Expenditure vs AI Predictive Forecast ($USD)
              </h3>
            </div>
            <span style={{ fontSize: "12px", color: "#059669", fontWeight: "800" }}>
              +14.2% YoY Growth Trajectory
            </span>
          </div>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={biMonthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis dataKey="month" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spend" stroke="#f8b400" strokeWidth={3} name="Actual Spend YTD" />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="AI Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Allocation Donut Chart */}
        <div className="org-card">
          <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>SAP ANALYTICS CLOUD</span>
          <h3 style={{ fontSize: "17px", color: "#111111", fontWeight: "800", marginBottom: "16px" }}>
            Spend Allocation Breakdown (%)
          </h3>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={biSpendAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {biSpendAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(value) => <span style={{ color: "#111", fontSize: "11px" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Executive Insights Box */}
      <div className="org-card" style={{ background: "#f8f9fb", border: "1px solid #d9d9d9" }}>
        <h3 style={{ fontSize: "17px", color: "#111111", fontWeight: "800", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Award size={18} color="#f8b400" /> Executive Business Insights Summary
        </h3>
        <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#555555", lineHeight: "1.6" }}>
          <li><strong>Procurement Efficiency:</strong> Requisition turnarounds achieved 1.8 Days SLA (96.4% efficiency rate).</li>
          <li><strong>Treasury Control:</strong> $1.24M processed with 0% payment SLA breaches. $98.4k achieved in vendor volume discounts.</li>
          <li><strong>Risk & Compliance Index:</strong> Organization-wide compliance maintained at 98.4% with a low risk index of 1.2/10.</li>
        </ul>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
