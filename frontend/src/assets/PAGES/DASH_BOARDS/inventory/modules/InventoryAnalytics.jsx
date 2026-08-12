import React from "react";
import { BarChart3, TrendingUp, DollarSign, Download, Boxes } from "lucide-react";
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
} from "recharts";

const turnoverData = [
  { month: "Jan", turns: 4.2 },
  { month: "Feb", turns: 4.8 },
  { month: "Mar", turns: 5.1 },
  { month: "Apr", turns: 4.9 },
  { month: "May", turns: 5.5 },
  { month: "Jun", turns: 5.8 },
  { month: "Jul", turns: 6.2 },
];

const zoneValueAllocation = [
  { name: "Zone A (Hardware)", value: 55, color: "#f8b400" },
  { name: "Zone B (Digital Vault)", value: 30, color: "#059669" },
  { name: "Zone C (Facilities)", value: 15, color: "#3b82f6" },
];

const InventoryAnalytics = () => {
  return (
    <div className="inv-analytics-container">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">
            <BarChart3 color="#f8b400" /> Enterprise Inventory Analytics & Turnover Rates
          </h1>
          <p className="inv-page-subtitle">
            Stock turnover velocity, asset valuation per zone, and fulfillment performance metrics.
          </p>
        </div>

        <button
          className="inv-btn-primary-sm"
          onClick={() => alert("Downloading Inventory Analytics Briefing (PDF)...")}
        >
          <Download size={16} /> Export Analytics Briefing (PDF)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="inv-kpi-grid" style={{ marginBottom: "28px" }}>
        <div className="inv-kpi-card">
          <div className="inv-kpi-info">
            <span className="inv-kpi-label">Annual Turnover Ratio</span>
            <span className="inv-kpi-value" style={{ color: "#111111" }}>
              6.2 Turns
            </span>
            <span className="inv-kpi-change positive">
              <TrendingUp size={14} /> +0.4 Turns vs Q2
            </span>
          </div>
          <div className="inv-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="inv-kpi-card">
          <div className="inv-kpi-info">
            <span className="inv-kpi-label">Total Asset Value</span>
            <span className="inv-kpi-value" style={{ color: "#059669" }}>
              $840,000
            </span>
            <span className="inv-kpi-change positive">
              <DollarSign size={14} /> Certified Valuation
            </span>
          </div>
          <div className="inv-kpi-icon-wrapper" style={{ color: "#059669" }}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Turnover Bar Chart */}
        <div className="inv-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Monthly Stock Turnover Ratio (Turns / Month)
          </h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis dataKey="month" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #f8b400",
                    borderRadius: "8px",
                    color: "#111111",
                  }}
                />
                <Bar dataKey="turns" fill="#f8b400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Allocation Pie Chart */}
        <div className="inv-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Asset Valuation Allocation per Zone (%)
          </h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={zoneValueAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {zoneValueAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #f8b400",
                    borderRadius: "8px",
                    color: "#111111",
                  }}
                />
                <Legend formatter={(value) => <span style={{ color: "#111" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
