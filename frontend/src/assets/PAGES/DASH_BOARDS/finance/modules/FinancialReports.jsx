import React from "react";
import { FolderKanban, Download, FileText } from "lucide-react";

const mockFinancialReports = [
  {
    id: "REP-FIN-2026-01",
    title: "Q2_2026_Enterprise_Procurement_Financial_Audit.pdf",
    category: "Treasury Audit",
    size: "5.8 MB",
    date: "2026-07-01",
  },
  {
    id: "REP-FIN-2026-02",
    title: "Departmental_Budget_Utilization_Statement_July.pdf",
    category: "Budget Statement",
    size: "3.4 MB",
    date: "2026-07-20",
  },
];

const FinancialReports = () => {
  return (
    <div className="fin-reports-container">
      {/* Header */}
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title">
            <FolderKanban color="#f8b400" /> Enterprise Financial Reports Hub
          </h1>
          <p className="fin-page-subtitle">
            Download certified Treasury audit statements, Accounts Payable ledgers, and budget reports.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {mockFinancialReports.map((r) => (
          <div key={r.id} className="fin-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(248, 180, 0, 0.15)",
                  border: "1px solid #f8b400",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileText size={22} />
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                  {r.category.toUpperCase()} • {r.id}
                </span>
                <h4 style={{ color: "#111111", fontSize: "14px", fontWeight: "700", margin: "4px 0" }}>
                  {r.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  {r.size} • Generated {r.date}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #ececec", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="fin-btn-primary-sm"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => alert(`Downloading ${r.title}...`)}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialReports;
