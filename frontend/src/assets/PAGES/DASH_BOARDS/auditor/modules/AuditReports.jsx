import React from "react";
import { FolderKanban, Download, FileText } from "lucide-react";

const mockAuditReports = [
  {
    id: "REP-AUD-2026-01",
    title: "Q2_2026_Independent_Compliance_Governance_Report.pdf",
    category: "Compliance Audit",
    size: "6.1 MB",
    date: "2026-07-01",
  },
  {
    id: "REP-AUD-2026-02",
    title: "Procurement_Financial_Risk_Matrix_Summary.pdf",
    category: "Risk Matrix",
    size: "3.2 MB",
    date: "2026-07-15",
  },
];

const AuditReports = () => {
  return (
    <div className="aud-reports-container">
      {/* Header */}
      <div className="aud-page-header">
        <div>
          <h1 className="aud-page-title">
            <FolderKanban color="#f8b400" /> Independent Certified Audit Reports Hub
          </h1>
          <p className="aud-page-subtitle">
            Download certified audit reports, compliance certificates, and risk assessment documentation.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {mockAuditReports.map((r) => (
          <div key={r.id} className="aud-card" style={{ padding: "20px" }}>
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
                className="aud-btn-primary-sm"
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

export default AuditReports;
