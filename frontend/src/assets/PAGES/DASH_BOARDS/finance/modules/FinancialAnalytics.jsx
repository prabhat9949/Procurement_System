import React from "react";
import { BarChart3, TrendingUp, DollarSign, Download, PieChart as PieIcon } from "lucide-react";
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

const expVsBudgetData = [
  { month: "Jan", spend: 180000, budget: 350000 },
  { month: "Feb", spend: 220000, budget: 350000 },
  { month: "Mar", spend: 290000, budget: 350000 },
  { month: "Apr", spend: 260000, budget: 350000 },
  { month: "May", spend: 340000, budget: 350000 },
  { month: "Jun", spend: 310000, budget: 350000 },
  { month: "Jul", spend: 480000, budget: 500000 },
];

const categorySpending = [
  { name: "Hardware & IT", value: 42, color: "#f8b400" },
  { name: "SaaS Subscriptions", value: 28, color: "#059669" },
  { name: "Cloud Infrastructure", value: 18, color: "#3b82f6" },
  { name: "Office Facilities", value: 12, color: "#7c3aed" },
];

const FinancialAnalytics = () => {
  return (
    <div className="fin-analytics-container">
      {/* Header */}
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title">
            <BarChart3 color="#f8b400" /> Enterprise Financial Analytics & Cost Optimization
          </h1>
          <p className="fin-page-subtitle">
            Procurement expenditure vs monthly budget ceiling, category spending ratios, and treasury cash flow analysis.
          </p>
        </div>

        <button
          className="fin-btn-primary-sm"
          onClick={() => alert("Exporting Financial Analytics Briefing (PDF)...")}
        >
          <Download size={16} /> Export Treasury Briefing (PDF)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="fin-kpi-grid" style={{ marginBottom: "28px" }}>
        <div className="fin-kpi-card">
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Total Outflow YTD</span>
            <span className="fin-kpi-value" style={{ color: "#111111" }}>
              $1,240,000
            </span>
            <span className="fin-kpi-change positive">
              <DollarSign size={14} /> $480k in July
            </span>
          </div>
          <div className="fin-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="fin-kpi-card">
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Commercial Cost Savings</span>
            <span className="fin-kpi-value" style={{ color: "#059669" }}>
              $98,400
            </span>
            <span className="fin-kpi-change positive">
              <TrendingUp size={14} /> 7.9% Discount Savings
            </span>
          </div>
          <div className="fin-kpi-icon-wrapper" style={{ color: "#059669" }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Exp vs Budget Bar Chart */}
        <div className="fin-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Monthly Expenditure vs Budget Ceiling ($USD)
          </h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expVsBudgetData}>
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
                <Bar dataKey="spend" fill="#f8b400" name="Actual Spend" radius={[6, 6, 0, 0]} />
                <Bar dataKey="budget" fill="#d9d9d9" name="Budget Cap" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="fin-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Category Spending Allocation (%)
          </h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
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

export default FinancialAnalytics;
