import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
import { epsEventBus, fetchBudgetAnalytics } from "../../../../../services/epsApiService";

const BudgetAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchBudgetAnalytics(1);
      setAnalytics(data);
    };
    load();
    const unsub = epsEventBus.subscribe(async () => {
      const data = await fetchBudgetAnalytics(1);
      setAnalytics(data);
    });
    return unsub;
  }, []);

  const totalCap = analytics?.totalBudgetCap || 120000;
  const spent = analytics?.spentBudget || 84200;
  const remaining = analytics?.remainingBudget || (totalCap - spent);
  const monthlyData = analytics?.monthlyBudgetData || [
    { month: "Jan", budgetCap: 120000, actualSpend: 78000 },
    { month: "Feb", budgetCap: 120000, actualSpend: 84000 },
    { month: "Mar", budgetCap: 120000, actualSpend: 91000 },
    { month: "Apr", budgetCap: 120000, actualSpend: 86000 },
    { month: "May", budgetCap: 120000, actualSpend: 98000 },
    { month: "Jun", budgetCap: 120000, actualSpend: 89000 },
    { month: "Jul", budgetCap: 120000, actualSpend: spent },
  ];
  const subTeams = analytics?.subTeamSpend || [
    { team: "DevOps & Cloud", spend: 32500 },
    { team: "Frontend Arch", spend: 21400 },
    { team: "Backend Systems", spend: 18600 },
    { team: "QA Automation", spend: 7200 },
    { team: "IT Desk Support", spend: 4500 },
  ];
  const categoryData = analytics?.categoryData || [
    { name: "Cloud Infrastructure", value: 38, color: "#f8b400" },
    { name: "Hardware & Workstations", value: 26, color: "#059669" },
    { name: "SaaS & Subscriptions", value: 24, color: "#3b82f6" },
    { name: "Office Supplies", value: 12, color: "#7c3aed" },
  ];
  return (
    <div className="dm-budget-analytics-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <BarChart3 color="#f8b400" /> Department Financial & Spend Analytics
          </h1>
          <p className="dm-page-subtitle">
            Cost center CC-8902-ENG budget allocation, sub-team expenditure, and variance reports.
          </p>
        </div>

        <button
          className="dm-btn-primary-sm"
          onClick={() => alert("Downloading Department Financial Summary Report...")}
        >
          <Download size={16} /> Download Budget Report (PDF)
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="dm-kpi-grid" style={{ marginBottom: "28px" }}>
        <div className="dm-kpi-card">
          <div className="dm-kpi-info">
            <span className="dm-kpi-label">Annual Budget Allocated</span>
            <span className="dm-kpi-value" style={{ color: "#111111" }}>
              $1,440,000
            </span>
            <span className="dm-kpi-change positive">
              <DollarSign size={14} /> $120,000 / Month Cap
            </span>
          </div>
          <div className="dm-kpi-icon-wrapper" style={{ color: "#f8b400" }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="dm-kpi-card">
          <div className="dm-kpi-info">
            <span className="dm-kpi-label">YTD Actual Expenditure</span>
            <span className="dm-kpi-value" style={{ color: "#d97706" }}>
              $610,600
            </span>
            <span className="dm-kpi-change positive">
              <TrendingUp size={14} /> 8.4% Below Forecasted Ceiling
            </span>
          </div>
          <div className="dm-kpi-icon-wrapper" style={{ color: "#d97706" }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="dm-kpi-card">
          <div className="dm-kpi-info">
            <span className="dm-kpi-label">July Remaining Budget</span>
            <span className="dm-kpi-value" style={{ color: "#059669" }}>
              $35,800
            </span>
            <span className="dm-kpi-change positive">
              <Award size={14} /> 29.8% Available for Q3
            </span>
          </div>
          <div className="dm-kpi-icon-wrapper" style={{ color: "#059669" }}>
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
        {/* Sub-Team Spend Bar Chart */}
        <div className="dm-card">
          <h3
            style={{
              color: "#111111",
              fontSize: "17px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            July Spend Breakdown by Sub-Team ($USD)
          </h3>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subTeams} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis type="number" stroke="#666666" fontSize={12} />
                <YAxis dataKey="team" type="category" stroke="#666666" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #f8b400",
                    borderRadius: "8px",
                    color: "#111111",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="spend" fill="#f8b400" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="dm-card">
          <h3
            style={{
              color: "#111111",
              fontSize: "17px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            Expense Allocation by Category (%)
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
                <Legend formatter={(value) => <span style={{ color: "#111" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalytics;
