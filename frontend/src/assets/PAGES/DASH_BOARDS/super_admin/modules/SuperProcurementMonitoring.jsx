import React, { useState } from "react";
import {
  ShoppingBag,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
} from "lucide-react";

const initialProcurementList = [
  { id: "REQ-2026-8921", poId: "PO-2026-4401", dept: "Engineering & IT", item: "MacBook Pro workstations", amount: 36990.00, status: "PO Dispatched", date: "2026-07-26", rfqCode: "RFQ-2026-701" },
  { id: "REQ-2026-8955", poId: "PO-2026-4409", dept: "HR & Operations", item: "Office Ergonomic Desks", amount: 15200.00, status: "Verification Hold", date: "2026-07-25", rfqCode: "Bypassed" },
  { id: "REQ-2026-8990", poId: "PO-2026-4412", dept: "Engineering & IT", item: "Dell PowerEdge Rack Servers", amount: 54200.00, status: "PO Dispatched", date: "2026-07-26", rfqCode: "RFQ-2026-704" }
];

const initialDeptReports = [
  { dept: "IT & Systems", cost: "₹91,190.00", requisitions: 42, slaRate: "98.8%" },
  { dept: "Human Resources", cost: "₹15,200.00", requisitions: 12, slaRate: "89.2%" },
  { dept: "Administration", cost: "₹4,500.00", requisitions: 4, slaRate: "100.0%" }
];

const SuperProcurementMonitoring = () => {
  const [tickets, setTickets] = useState(initialProcurementList);
  const [depts, setDepts] = useState(initialDeptReports);
  const [activeSubTab, setActiveSubTab] = useState("activity"); // activity, depts

  return (
    <div className="sadmin-proc-mon-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ShoppingBag color="#f8b400" size={28} /> Global Procurement Monitoring
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Real-time tracking of purchase requisitions, RFQ status counts, PO dispatch logs, and department cost reports.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("activity")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "activity" ? "700" : "500",
            color: activeSubTab === "activity" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "activity" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Procurement & PO Activity
        </button>
        <button
          onClick={() => setActiveSubTab("depts")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "depts" ? "700" : "500",
            color: activeSubTab === "depts" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "depts" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Department Cost Reports & SLA
        </button>
      </div>

      {/* 1. Activity Tab */}
      {activeSubTab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sourcing KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Requisitions YTD</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>14,200 Orders</h3>
            </div>
            <div style={{ padding: "16px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Active RFQ Bids</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", margin: "2px 0 0" }}>142 RFQs</h3>
            </div>
            <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Dispatched POs</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>12,800 POs</h3>
            </div>
          </div>

          {/* Table */}
          <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>Requisition ID</th>
                    <th>Linked PO ID</th>
                    <th>RFQ Reference</th>
                    <th>Department Node</th>
                    <th>Item Specifications</th>
                    <th>Amount Rate</th>
                    <th>Date Logged</th>
                    <th>Workflow status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{t.id}</td>
                      <td style={{ fontWeight: "700" }}>{t.poId}</td>
                      <td style={{ color: "#666", fontSize: "13.5px" }}>{t.rfqCode}</td>
                      <td>{t.dept}</td>
                      <td style={{ fontWeight: "600" }}>{t.item}</td>
                      <td style={{ fontWeight: "800", color: "#059669" }}>₹{t.amount.toLocaleString("en-IN")}</td>
                      <td>{t.date}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: t.status.includes("Hold") ? "rgba(220, 38, 38, 0.12)" : "rgba(5, 150, 105, 0.12)",
                            color: t.status.includes("Hold") ? "#dc2626" : "#059669",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Depts Tab */}
      {activeSubTab === "depts" && (
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Department Node</th>
                  <th>Total Spent (YTD)</th>
                  <th>Requisitions Dispatched</th>
                  <th>SLA Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((d, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{d.dept}</td>
                    <td style={{ fontWeight: "800", color: "#059669" }}>{d.cost}</td>
                    <td style={{ fontWeight: "600" }}>{d.requisitions} Reqs</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{d.slaRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperProcurementMonitoring;
