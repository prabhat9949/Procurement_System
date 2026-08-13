import React from "react";
import { FolderKanban, Search, Download, Eye, FileText } from "lucide-react";

const mockVendorReports = [
  {
    id: "REP-VND-2026-01",
    title: "Q2_2026_Apple_Direct_Commercial_Performance.pdf",
    category: "Sales Briefing",
    size: "3.8 MB",
    date: "2026-07-01",
  },
  {
    id: "REP-VND-2026-02",
    title: "Tier_1_Preferred_Supplier_Rating_Certificate.pdf",
    category: "Vendor Performance",
    size: "1.9 MB",
    date: "2026-07-15",
  },
];

const VendorReports = () => {
  return (
    <div className="vnd-reports-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <FolderKanban color="#f8b400" /> Supplier Commercial Reports Hub
          </h1>
          <p className="vnd-page-subtitle">
            Download certified supplier performance ratings, monthly sales summaries, and SLA certificates.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {mockVendorReports.map((r) => (
          <div key={r.id} className="vnd-card" style={{ padding: "20px" }}>
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
                className="vnd-btn-primary-sm"
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

export default VendorReports;
