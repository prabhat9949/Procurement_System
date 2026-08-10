import React, { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  FileCheck,
  FolderKanban,
  X,
} from "lucide-react";

const mockReports = [
  {
    id: "REP-2026-001",
    title: "Q2_2026_Enterprise_Procurement_Performance.pdf",
    category: "Performance Reports",
    type: "PDF Document",
    size: "4.2 MB",
    date: "2026-07-01",
    author: "David Chen (Procurement Exec)",
  },
  {
    id: "REP-2026-002",
    title: "Vendor_Commercial_Bidding_Yield_Report.pdf",
    category: "RFQ Statistics",
    type: "PDF Document",
    size: "2.8 MB",
    date: "2026-07-15",
    author: "Global Sourcing Team",
  },
  {
    id: "REP-2026-003",
    title: "Purchase_Order_Compliance_Audit_Log_July.pdf",
    category: "PO Analytics",
    type: "PDF Document",
    size: "3.5 MB",
    date: "2026-07-25",
    author: "David Chen",
  },
  {
    id: "REP-2026-004",
    title: "Supplier_Rating_Scorecard_2026.pdf",
    category: "Vendor Statistics",
    type: "PDF Document",
    size: "1.9 MB",
    date: "2026-07-20",
    author: "Procurement Analytics",
  },
];

const ExecReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [previewRep, setPreviewRep] = useState(null);

  const filtered = mockReports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCat === "all" ||
      rep.category.toLowerCase().includes(selectedCat.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pe-reports-container">
      {/* Header */}
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <FolderKanban color="#f8b400" /> Executive Procurement Reports Hub
          </h1>
          <p className="pe-page-subtitle">
            Formal sourcing audits, RFQ yield analysis, vendor scorecards, and purchase order reports.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="pe-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ position: "relative", width: "340px" }}>
            <Search
              size={16}
              color="#666666"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search reports by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              background: "#f8f9fb",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid #d9d9d9",
            }}
          >
            {["all", "Performance Reports", "RFQ Statistics", "PO Analytics", "Vendor Statistics"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: selectedCat === cat ? "#f8b400" : "transparent",
                  color: selectedCat === cat ? "#000000" : "#555555",
                  fontWeight: selectedCat === cat ? "700" : "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
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
        {filtered.map((rep) => (
          <div key={rep.id} className="pe-card" style={{ padding: "20px" }}>
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
                  {rep.category.toUpperCase()} • {rep.id}
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
                  title={rep.title}
                >
                  {rep.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  {rep.size} • Generated {rep.date}
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
              <span style={{ fontSize: "11px", color: "#555555" }}>By: {rep.author}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="pe-sidebar-toggle"
                  style={{ width: "32px", height: "32px", display: "inline-flex" }}
                  title="Preview Report"
                  onClick={() => setPreviewRep(rep)}
                >
                  <Eye size={15} />
                </button>
                <button
                  className="pe-sidebar-toggle"
                  style={{ width: "32px", height: "32px", display: "inline-flex", color: "#d97706" }}
                  title="Download File"
                  onClick={() => alert(`Downloading ${rep.title}...`)}
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewRep && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: "560px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Report Audit: {previewRep.id}
              </h3>
              <button
                onClick={() => setPreviewRep(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                height: "220px",
                background: "#f8f9fb",
                borderRadius: "12px",
                border: "1px solid #ececec",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <FileText size={48} color="#f8b400" style={{ marginBottom: "12px" }} />
              <h4 style={{ color: "#111111", fontSize: "15px", fontWeight: "700" }}>
                {previewRep.title}
              </h4>
              <p style={{ color: "#666666", fontSize: "13px", marginTop: "4px" }}>
                Executive Procurement Audit ({previewRep.size})
              </p>
              <span
                style={{
                  color: "#059669",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileCheck size={16} /> Verified Sourcing Cryptographic Signatures
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button
                className="pe-btn-primary-sm"
                onClick={() => alert(`Downloading ${previewRep.title}...`)}
              >
                <Download size={15} /> Download PDF
              </button>
              <button
                className="pe-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewRep(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecReports;
