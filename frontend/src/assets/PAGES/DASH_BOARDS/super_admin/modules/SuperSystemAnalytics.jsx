import React, { useState } from "react";
import {
  Activity,
  Download,
  Users,
  Globe,
  TrendingUp,
  Boxes,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const growthTrendData = [
  { month: "Jan", userCount: 1100, activeOrgs: 10 },
  { month: "Feb", userCount: 1150, activeOrgs: 10 },
  { month: "Mar", userCount: 1240, activeOrgs: 11 },
  { month: "Apr", userCount: 1290, activeOrgs: 11 },
  { month: "May", userCount: 1350, activeOrgs: 12 },
  { month: "Jun", userCount: 1410, activeOrgs: 12 },
  { month: "Jul", userCount: 1480, activeOrgs: 12 },
];

const SuperSystemAnalytics = () => {
  const [activeSubTab, setActiveSubTab] = useState("growth");

  return (
    <div className="sadmin-sys-analytics-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Activity color="#f8b400" size={28} /> Global System Analytics Visualizer
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Track tenant organization counts growth, monthly active sessions, module transaction trends, and system KPIs.
          </p>
        </div>

        <button
          className="sadmin-btn-primary-sm"
          onClick={() => alert("Exporting Global System Telemetry (CSV)...")}
        >
          <Download size={16} /> Export Telemetry Report (CSV)
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("growth")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "growth" ? "700" : "500",
            color: activeSubTab === "growth" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "growth" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          User Growth & Tenant Analytics
        </button>
        <button
          onClick={() => setActiveSubTab("modules")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "modules" ? "700" : "500",
            color: activeSubTab === "modules" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "modules" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Module Transaction Metrics
        </button>
      </div>

      {/* 1. Growth Tab */}
      {activeSubTab === "growth" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Growth KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div className="sadmin-kpi-card">
              <div className="sadmin-kpi-info">
                <span className="sadmin-kpi-label">Active Headcount Growth</span>
                <span className="sadmin-kpi-value">+34.5%</span>
                <span className="sadmin-kpi-change positive"><Users size={14} /> Mapped vs Q1 YTD</span>
              </div>
            </div>
            
            <div className="sadmin-kpi-card">
              <div className="sadmin-kpi-info">
                <span className="sadmin-kpi-label">Tenant Subsidiaries Growth</span>
                <span className="sadmin-kpi-value">+20.0%</span>
                <span className="sadmin-kpi-change positive"><Globe size={14} /> New global clusters</span>
              </div>
            </div>

            <div className="sadmin-kpi-card">
              <div className="sadmin-kpi-info">
                <span className="sadmin-kpi-label">Concurrent Sessions Peak</span>
                <span className="sadmin-kpi-value">412 Users</span>
                <span className="sadmin-kpi-change positive"><TrendingUp size={14} /> Live concurrent load</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="sadmin-card" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", marginBottom: "16px" }}>Monthly User & Organization Growth Metrics</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="userCount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="activeOrgs" stroke="#f8b400" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modules Tab */}
      {activeSubTab === "modules" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          
          <div className="sadmin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
              Module Transaction API Rates
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Procurement Desk (Requisitions / RFQs)</span>
                  <strong>14,200 requests (58%)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "58%", height: "100%", background: "#f8b400", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Inventory Tracking (Stock Updates)</span>
                  <strong>8,450 requests (28%)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "28%", height: "100%", background: "#059669", borderRadius: "4px" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Financial Treasury (Wire Clearing API)</span>
                  <strong>2,840 requests (14%)</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div style={{ width: "14%", height: "100%", background: "#3b82f6", borderRadius: "4px" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="sadmin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", height: "fit-content" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Overall performance metrics
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Average API Response:</span>
                <strong>125ms (Optimal)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>SQL Query Execution latency:</span>
                <strong>14ms</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Database Index Hit Rate:</span>
                <strong>99.8% Passed</strong>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SuperSystemAnalytics;
