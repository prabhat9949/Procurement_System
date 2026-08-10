import React, { useState } from "react";
import {
  DollarSign,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Building2,
} from "lucide-react";

const initialTransactions = [
  { ref: "PAY-2026-901", invRef: "INV-2026-9901", org: "ORG-GLOBAL-HQ", amount: 36990.00, route: "JPMorgan Chase ACH", status: "Cleared & Posted", date: "2026-07-26" },
  { ref: "PAY-2026-904", invRef: "INV-2026-9912", org: "ORG-EU-SUBSIDIARY", amount: 54200.00, route: "Deutsche Bank Wire", status: "Cleared & Posted", date: "2026-07-26" },
  { ref: "PAY-2026-908", invRef: "INV-2026-9877", org: "ORG-GLOBAL-HQ", amount: 4750.00, route: "Wells Fargo ACH", status: "Pending Settlement", date: "2026-07-27" }
];

const initialBudgets = [
  { name: "Engineering & IT Cost Center", allocated: 1500000, spent: 1250000, percentage: 83 },
  { name: "HR & Operations Cost Center", allocated: 500000, spent: 220000, percentage: 44 },
  { name: "Corporate Marketing Cost Center", allocated: 300000, spent: 45000, percentage: 15 }
];

const SuperFinancialMonitoring = () => {
  const [txns, setTxns] = useState(initialTransactions);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [activeSubTab, setActiveSubTab] = useState("txns"); // txns, budgets

  return (
    <div className="sadmin-fin-mon-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <DollarSign color="#f8b400" size={28} /> Global Financial & Treasury Monitoring
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Monitor corporate transactions volume, tax invoice match status, remaining departmental budgets, and disbursement statistics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("txns")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "txns" ? "700" : "500",
            color: activeSubTab === "txns" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "txns" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Remittance Transactions & Invoices
        </button>
        <button
          onClick={() => setActiveSubTab("budgets")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "budgets" ? "700" : "500",
            color: activeSubTab === "budgets" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "budgets" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Budget Utilization Analytics
        </button>
      </div>

      {/* 1. Transactions Tab */}
      {activeSubTab === "txns" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Stats Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", background: "#f6faf8", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Total Disbursed Volume</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>₹12,43,98,000</h3>
            </div>
            <div style={{ padding: "16px", background: "#fafafa", border: "1px solid #eee", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Active Invoices Reconciled</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#111", margin: "2px 0 0" }}>1,840 Items</h3>
            </div>
            <div style={{ padding: "16px", background: "#fcf8f2", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Awaiting Wire Release</span>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#d97706", margin: "2px 0 0" }}>₹4,75,000</h3>
            </div>
          </div>

          {/* Table */}
          <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>Payment Code</th>
                    <th>Linked Invoice</th>
                    <th>Tenant Subsidiary</th>
                    <th>Outflow Amount</th>
                    <th>Bank Settlement Route</th>
                    <th>Reconciliation Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t) => (
                    <tr key={t.ref}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{t.ref}</td>
                      <td>{t.invRef}</td>
                      <td style={{ fontWeight: "700" }}>{t.org}</td>
                      <td style={{ fontWeight: "800", color: "#059669" }}>₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td>{t.route}</td>
                      <td>{t.date}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: t.status.includes("Cleared") ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: t.status.includes("Cleared") ? "#059669" : "#d97706",
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

      {/* 2. Budgets Tab */}
      {activeSubTab === "budgets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {budgets.map((b, idx) => {
            const isNearCeiling = b.percentage >= 80;
            return (
              <div key={idx} className="sadmin-card" style={{ padding: "20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: 0 }}>{b.name}</h3>
                    <p style={{ margin: "2px 0 0", color: "#666", fontSize: "13px" }}>
                      Allocated Cap: <strong>₹{b.allocated.toLocaleString("en-IN")}</strong> | YTD Consumption: <strong>₹{b.spent.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      background: isNearCeiling ? "rgba(220, 38, 38, 0.12)" : "rgba(5, 150, 105, 0.12)",
                      color: isNearCeiling ? "#dc2626" : "#059669",
                      padding: "4px 12px",
                      borderRadius: "12px",
                    }}
                  >
                    {b.percentage}% Spent {isNearCeiling && "• Warning ceiling"}
                  </span>
                </div>

                <div style={{ width: "100%", height: "8px", background: "#eee", borderRadius: "4px" }}>
                  <div
                    style={{
                      width: `${b.percentage}%`,
                      height: "100%",
                      background: isNearCeiling ? "#dc2626" : "#059669",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default SuperFinancialMonitoring;
