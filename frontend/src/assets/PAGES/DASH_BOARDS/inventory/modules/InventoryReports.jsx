import React from "react";
import { FolderKanban, Download, FileText } from "lucide-react";

const mockInventoryReports = [
  {
    id: "REP-INV-2026-01",
    title: "Q2_2026_Physical_Inventory_Audit_Valuation.pdf",
    category: "Valuation Audit",
    size: "4.2 MB",
    date: "2026-07-01",
  },
  {
    id: "REP-INV-2026-02",
    title: "Low_Stock_Reorder_Threshold_Analysis.pdf",
    category: "Reorder Analysis",
    size: "2.1 MB",
    date: "2026-07-18",
  },
];

const InventoryReports = () => {
  return (
    <div className="inv-reports-container">
      {/* Header */}
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title">
            <FolderKanban color="#f8b400" /> Inventory Audit & Valuation Reports
          </h1>
          <p className="inv-page-subtitle">
            Download verified warehouse asset valuation reports, stock audit logs, and reorder statistics.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {mockInventoryReports.map((r) => (
          <div key={r.id} className="inv-card" style={{ padding: "20px" }}>
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
                className="inv-btn-primary-sm"
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

export default InventoryReports;
