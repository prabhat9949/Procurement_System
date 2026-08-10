import React from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  Clock,
  DollarSign,
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

const categoryData = [
  { name: "Hardware & IT", value: 45, color: "#f8b400" },
  { name: "Software / SaaS", value: 30, color: "#3b82f6" },
  { name: "Cloud Infrastructure", value: 15, color: "#10b981" },
  { name: "Office Supplies", value: 10, color: "#8b5cf6" },
];

const turnaroundData = [
  { stage: "Manager", hours: 14 },
  { stage: "Procurement", hours: 26 },
  { stage: "Vendor PO", hours: 38 },
  { stage: "Delivery", hours: 72 },
  { stage: "Finance", hours: 18 },
];

const ReportsModule = () => {
  return (
    <div className="emp-reports-container">
      {/* Page Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <BarChart3 color="#f8b400" /> Procurement Intelligence & Analytics
          </h1>
          <p className="emp-page-subtitle">
            Comprehensive audit reports, spend distributions, and SLA turnaround metrics.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="emp-btn-primary-sm"
            style={{
              background: "#f8f9fb",
              color: "#111111",
              border: "1px solid #d9d9d9",
            }}
            onClick={() => alert("Exporting CSV report...")}
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            className="emp-btn-primary-sm"
            onClick={() => alert("Generating Executive PDF Report...")}
          >
            <Download size={16} /> Download Executive PDF
          </button>
        </div>
      </div>

      {/* Highlights KPI Cards */}
      <div className="emp-kpi-grid" style={{ marginBottom: "28px" }}>
        <div className="emp-kpi-card">
          <div className="emp-kpi-info">
            <span className="emp-kpi-label">YTD Department Spend</span>
            <span className="emp-kpi-value" style={{ color: "#d97706" }}>
              $155,700
            </span>
            <span className="emp-kpi-change positive">
              <TrendingUp size={14} /> 6.2% under budget ceiling
            </span>
          </div>
          <div className="emp-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="emp-kpi-card">
          <div className="emp-kpi-info">
            <span className="emp-kpi-label">Avg Approval SLA</span>
            <span className="emp-kpi-value">2.4 Days</span>
            <span className="emp-kpi-change positive">
              <Clock size={14} /> 18% faster than Q2
            </span>
          </div>
          <div className="emp-kpi-icon-wrapper" style={{ color: "#10b981" }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="emp-kpi-card">
          <div className="emp-kpi-info">
            <span className="emp-kpi-label">Vendor Discount Savings</span>
            <span className="emp-kpi-value" style={{ color: "#10b981" }}>
              $14,250
            </span>
            <span className="emp-kpi-change positive">
              <Award size={14} /> Enterprise preferred pricing
            </span>
          </div>
          <div className="emp-kpi-icon-wrapper" style={{ color: "#10b981" }}>
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
        {/* Category Share Pie Chart */}
        <div className="emp-card">
          <h3
            style={{
              color: "#111111",
              fontSize: "17px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            Expenditure Share by Category
          </h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
                <Legend formatter={(value) => <span style={{ color: "#111111" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Turnaround Time Bar Chart */}
        <div className="emp-card">
          <h3
            style={{
              color: "#111111",
              fontSize: "17px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            Stage Processing Turnaround (Avg Hours)
          </h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnaroundData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis dataKey="stage" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #f8b400",
                    borderRadius: "8px",
                    color: "#111111",
                  }}
                />
                <Bar dataKey="hours" fill="#f8b400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;
