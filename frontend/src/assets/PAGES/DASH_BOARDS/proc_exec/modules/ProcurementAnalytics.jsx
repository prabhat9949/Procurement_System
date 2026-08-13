import React from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Download,
  BarChart3,
  Award,
  Send,
  ShoppingBag,
  Users,
  CheckCircle2
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
  Line
} from "recharts";

const analyticsData = [
  { month: "Jan", rfqsCreated: 14, posIssued: 12, spend: 92000, baselineBudget: 98000 },
  { month: "Feb", rfqsCreated: 18, posIssued: 15, spend: 118000, baselineBudget: 125000 },
  { month: "Mar", rfqsCreated: 22, posIssued: 19, spend: 142000, baselineBudget: 150000 },
  { month: "Apr", rfqsCreated: 19, posIssued: 16, spend: 129000, baselineBudget: 135000 },
  { month: "May", rfqsCreated: 28, posIssued: 24, spend: 179000, baselineBudget: 188000 },
  { month: "Jun", rfqsCreated: 24, posIssued: 21, spend: 163200, baselineBudget: 170000 },
  { month: "Jul", rfqsCreated: 38, posIssued: 32, spend: 236000, baselineBudget: 245000 },
];

const vendorPerformanceSummary = [
  {
    name: "Apple Business Direct",
    category: "Hardware & IT",
    onTimeDelivery: "99.2%",
    qualityScore: "4.9 ⭐",
    totalSpendAwarded: "$185,000.00",
    bidWinRate: "78%",
    complianceGrade: "A+ Tier 1",
  },
  {
    name: "CDW Direct",
    category: "Hardware & IT",
    onTimeDelivery: "97.5%",
    qualityScore: "4.7 ⭐",
    totalSpendAwarded: "$115,000.00",
    bidWinRate: "64%",
    complianceGrade: "A Tier 1",
  },
  {
    name: "Datadog Inc.",
    category: "Software & SaaS",
    onTimeDelivery: "100.0%",
    qualityScore: "5.0 ⭐",
    totalSpendAwarded: "$68,500.00",
    bidWinRate: "90%",
    complianceGrade: "A+ SaaS",
  },
  {
    name: "Cisco Systems Direct",
    category: "Networking",
    onTimeDelivery: "95.8%",
    qualityScore: "4.9 ⭐",
    totalSpendAwarded: "$55,200.00",
    bidWinRate: "82%",
    complianceGrade: "A Primary OEM",
  },
];

const vendorMarketShare = [
  { name: "Apple Business Direct", value: 40, color: "#f8b400" },
  { name: "CDW Direct", value: 25, color: "#059669" },
  { name: "Datadog Inc.", value: 15, color: "#3b82f6" },
  { name: "Cisco Systems", value: 12, color: "#7c3aed" },
  { name: "Others", value: 8, color: "#dc2626" },
];

const ProcurementAnalytics = () => {
  return (
    <div className="pe-analytics-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <BarChart3 color="#f8b400" /> Sourcing Performance & Procurement Analytics
          </h1>
          <p className="pe-page-subtitle">
            Executive analytics tracking RFQ volumes, Purchase Order trends, total spending, and vendor performance.
          </p>
        </div>

        <button
          className="pe-btn-primary-sm"
          onClick={() => alert("Exporting Sourcing Analytics Briefing PDF...")}
        >
          <Download size={16} /> Export Executive Briefing (PDF)
        </button>
      </div>

      {/* 4 REQUIRED ANALYTICS KPI CARDS */}
      <div className="pe-kpi-grid" style={{ marginBottom: "28px" }}>
        {/* 1. Total RFQs Created */}
        <div className="pe-kpi-card">
          <div className="pe-kpi-info">
            <span className="pe-kpi-label">Total RFQs Created</span>
            <span className="pe-kpi-value" style={{ color: "#f8b400" }}>
              163
            </span>
            <span className="pe-kpi-change positive">
              <Send size={14} /> +24% YTD Growth
            </span>
          </div>
          <div className="pe-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <Send size={24} />
          </div>
        </div>

        {/* 2. Total Purchase Orders */}
        <div className="pe-kpi-card">
          <div className="pe-kpi-info">
            <span className="pe-kpi-label">Total Purchase Orders</span>
            <span className="pe-kpi-value" style={{ color: "#d97706" }}>
              139
            </span>
            <span className="pe-kpi-change positive">
              <ShoppingBag size={14} /> 85.2% PO Issue Rate
            </span>
          </div>
          <div className="pe-kpi-icon-wrapper" style={{ color: "#d97706" }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* 3. Procurement Spending */}
        <div className="pe-kpi-card">
          <div className="pe-kpi-info">
            <span className="pe-kpi-label">Procurement Spending</span>
            <span className="pe-kpi-value" style={{ color: "#059669" }}>
              $1,058,200
            </span>
            <span className="pe-kpi-change positive">
              <TrendingUp size={14} /> $51,800 Savings Negotiated
            </span>
          </div>
          <div className="pe-kpi-icon-wrapper" style={{ color: "#059669" }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* 4. Vendor Performance Summary Rating */}
        <div className="pe-kpi-card">
          <div className="pe-kpi-info">
            <span className="pe-kpi-label">Vendor Performance Score</span>
            <span className="pe-kpi-value" style={{ color: "#3b82f6" }}>
              97.4%
            </span>
            <span className="pe-kpi-change positive">
              <Award size={14} /> Top SLA Compliance Grade
            </span>
          </div>
          <div className="pe-kpi-icon-wrapper" style={{ color: "#3b82f6" }}>
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* CHARTS ROW: RFQ Volume & Spend Trends */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* RFQs vs POs Trend Chart */}
        <div className="pe-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Total RFQs Created vs Total Purchase Orders Issued
          </h3>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis dataKey="month" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #f8b400",
                    borderRadius: "8px",
                    color: "#111111",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="rfqsCreated" name="RFQs Created" fill="#f8b400" radius={[4, 4, 0, 0]} />
                <Bar dataKey="posIssued" name="POs Issued" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Procurement Spend Breakdown */}
        <div className="pe-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>
            Procurement Spending Baseline vs Actual Spend ($USD)
          </h3>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
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
                <Legend />
                <Line type="monotone" dataKey="baselineBudget" name="Budget Baseline" stroke="#d97706" strokeWidth={2} />
                <Line type="monotone" dataKey="spend" name="Actual Spend" stroke="#059669" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* VENDOR PERFORMANCE SUMMARY TABLE */}
      <div className="pe-card">
        <h3 style={{ color: "#111111", fontSize: "18px", fontWeight: "800", marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Users color="#f8b400" size={20} /> Vendor Performance Summary Scorecards
        </h3>

        <div className="pe-table-container">
          <table className="pe-table">
            <thead>
              <tr>
                <th>Vendor / Supplier Name</th>
                <th>Category</th>
                <th>On-Time Delivery %</th>
                <th>Quality Rating</th>
                <th>Total Spend Awarded</th>
                <th>Bid Win Rate</th>
                <th>SLA Tier Grade</th>
              </tr>
            </thead>
            <tbody>
              {vendorPerformanceSummary.map((v, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "700", color: "#111111" }}>{v.name}</td>
                  <td style={{ color: "#555555" }}>{v.category}</td>
                  <td style={{ fontWeight: "700", color: "#059669" }}>{v.onTimeDelivery}</td>
                  <td style={{ fontWeight: "700", color: "#d97706" }}>{v.qualityScore}</td>
                  <td style={{ fontWeight: "800", color: "#111111" }}>{v.totalSpendAwarded}</td>
                  <td style={{ fontWeight: "700", color: "#3b82f6" }}>{v.bidWinRate}</td>
                  <td>
                    <span className="pe-badge approved">{v.complianceGrade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcurementAnalytics;
