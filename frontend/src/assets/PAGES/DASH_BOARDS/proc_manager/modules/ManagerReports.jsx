import React, { useState } from "react";
import {
  FolderKanban,
  Search,
  Download,
  Eye,
  FileText,
  FileCheck,
  X,
} from "lucide-react";

const mockManagerReports = [
  {
    id: "REP-2026-ORG-01",
    title: "Q2_2026_Organizational_Procurement_Performance.pdf",
    category: "Organizational Reports",
    size: "5.4 MB",
    date: "2026-07-01",
    author: "Robert Vance (Chief Manager)",
  },
  {
    id: "REP-2026-ORG-02",
    title: "Vendor_Rating_Scorecard_July_2026.pdf",
    category: "Vendor Reports",
    size: "3.2 MB",
    date: "2026-07-20",
    author: "Supply Chain Analytics",
  },
  {
    id: "REP-2026-ORG-03",
    title: "Purchase_Order_Signoff_Audit_Log.pdf",
    category: "PO Reports",
    size: "2.9 MB",
    date: "2026-07-25",
    author: "Robert Vance",
  },
];

const ManagerReports = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mockManagerReports.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pman-reports-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <FolderKanban color="#f8b400" /> Organizational Reports Hub
          </h1>
          <p className="pman-page-subtitle">
            Executive procurement summaries, vendor rating scorecards, and purchase order audit archives.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search
            size={16}
            color="#666666"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pman-form-input"
            style={{ paddingLeft: "42px", height: "42px" }}
          />
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
        {filtered.map((r) => (
          <div key={r.id} className="pman-card" style={{ padding: "20px" }}>
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
                <h4
                  style={{
                    color: "#111111",
                    fontSize: "14px",
                    fontWeight: "700",
                    margin: "4px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={r.title}
                >
                  {r.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  {r.size} • Generated {r.date}
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #ececec",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "11px", color: "#555555" }}>By: {r.author}</span>
              <button
                className="pman-btn-primary-sm"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => alert(`Downloading ${r.title}...`)}
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerReports;
