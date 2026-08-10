import React from "react";
import { ShoppingBag, TrendingUp, Download, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const procTrendData = [
  { dept: "Engineering", reqs: 48 },
  { dept: "DevOps", reqs: 34 },
  { dept: "Product Design", reqs: 22 },
  { dept: "Marketing", reqs: 28 },
  { dept: "HR & Ops", reqs: 18 },
];

const OrgProcurementAnalytics = () => {
  return (
    <div className="org-proc-analytics-container">
      {/* Header */}
      <div className="org-page-header">
        <div>
          <h1 className="org-page-title">
            <ShoppingBag color="#f8b400" /> Organization Procurement & Requisition Analytics
          </h1>
          <p className="org-page-subtitle">
            Enterprise procurement volume, purchase requisition throughput, and department sourcing trends.
          </p>
        </div>

        <button
          className="org-btn-primary-sm"
          onClick={() => alert("Exporting Procurement Analytics (PDF)...")}
        >
          <Download size={16} /> Export Procurement Report (PDF)
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="org-card org-card-gold-glow">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "800", marginBottom: "16px" }}>
            Requisition Volume by Department
          </h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />
                <XAxis dataKey="dept" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip />
                <Bar dataKey="reqs" fill="#f8b400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="org-card">
          <h3 style={{ color: "#111111", fontSize: "17px", fontWeight: "800", marginBottom: "16px" }}>
            Key Procurement Efficiency Highlights
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
            <div style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>
                Total YTD Requisitions
              </span>
              <h4 style={{ fontSize: "20px", color: "#111", fontWeight: "800", marginTop: "2px" }}>
                1,420 Workflows
              </h4>
            </div>
            <div style={{ padding: "14px", background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: "700" }}>
                Average Requisition Lead Time
              </span>
              <h4 style={{ fontSize: "20px", color: "#059669", fontWeight: "800", marginTop: "2px" }}>
                1.8 Days SLA
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgProcurementAnalytics;
