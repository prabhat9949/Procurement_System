import React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Award,
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
} from "recharts";

const deptSpendData = [
  { dept: "Engineering", spend: 184200 },
  { dept: "DevOps Infra", spend: 212000 },
  { dept: "Product UX", spend: 68500 },
  { dept: "Marketing", spend: 124000 },
  { dept: "Logistics", spend: 145000 },
  { dept: "HR & Admin", spend: 44200 },
];

const categoryAllocation = [
  { name: "Hardware & IT", value: 42, color: "#f8b400" },
  { name: "SaaS & Subscriptions", value: 28, color: "#059669" },
  { name: "Cloud Infrastructure", value: 18, color: "#3b82f6" },
  { name: "Office Furniture", value: 12, color: "#7c3aed" },
];

const ProcurementAnalytics = () => {
  return (
    <div className="pman-analytics-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <BarChart3 color="#f8b400" /> Organizational Procurement Analytics
          </h1>
          <p className="pman-page-subtitle">
            Cross-department expenditure comparison, category spend allocation, and sourcing efficiency reports.
          </p>
        </div>

        <button
          className="pman-btn-primary-sm"
          onClick={() => alert("Downloading Organizational Procurement Analytics Report...")}
        >
          <Download size={16} /> Export Org Briefing (PDF)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="pman-kpi-grid" style={{ marginBottom: "28px" }}>
        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">YTD Organizational Spend</span>
            <span className="pman-kpi-value" style={{ color: "#111111" }}>
              $1,240,000
            </span>
            <span className="pman-kpi-change positive">
              <DollarSign size={14} /> $480,000 in July
            </span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Org Commercial Savings</span>
            <span className="pman-kpi-value" style={{ color: "#059669" }}>
              $98,400
            </span>
            <span className="pman-kpi-change positive">
              <TrendingUp size={14} /> 7.9% Savings Ratio
            </span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#059669" }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Average Order Velocity</span>
            <span className="pman-kpi-value" style={{ color: "#3b82f6" }}>
              1.6 Days
            </span>
            <span className="pman-kpi-change positive">
              <Award size={14} /> 28% Faster than Target
            </span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#3b82f6" }}>
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* Dept Bar Chart */}
        <div className="pman-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            July Expenditure by Department ($USD)
          </h3>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptSpendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis dataKey="dept" stroke="#666666" fontSize={11} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #f8b400",
                    borderRadius: "8px",
                    color: "#111111",
                  }}
                />
                <Bar dataKey="spend" fill="#f8b400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="pman-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Sourcing Category Allocation (%)
          </h3>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categoryAllocation.map((entry, index) => (
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

export default ProcurementAnalytics;
