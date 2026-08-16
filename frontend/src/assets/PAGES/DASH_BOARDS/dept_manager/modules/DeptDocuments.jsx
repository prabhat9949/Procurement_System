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
import { epsEventBus, getStoredVendorInvoices } from "../../../../../services/epsApiService";

const mockDeptDocs = [
  {
    id: "DOC-2026-ENG-01",
    title: "Engineering_H2_2026_Budget_Authorization.pdf",
    category: "Authorization",
    size: "3.8 MB",
    date: "2026-07-01",
    author: "Sarah Jenkins (VP Eng)",
  },
  {
    id: "DOC-2026-ENG-02",
    title: "Apple_MacBook_Pro_Quote_2026.pdf",
    category: "Quotations",
    size: "2.4 MB",
    date: "2026-07-24",
    author: "Apple Business Direct",
  },
  {
    id: "DOC-2026-ENG-03",
    title: "Datadog_Enterprise_Renewal_Agreement.pdf",
    category: "Contracts",
    size: "4.1 MB",
    date: "2026-07-25",
    author: "Datadog Legal",
  },
  {
    id: "DOC-2026-ENG-04",
    title: "Cisco_Switch_Redundancy_PO-9902.pdf",
    category: "Purchase Orders",
    size: "1.9 MB",
    date: "2026-07-26",
    author: "Procurement Mgr",
  },
];

const DeptDocuments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [invoices, setInvoices] = useState(() => getStoredVendorInvoices());

  React.useEffect(() => {
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED" || e.type === "INVOICE_SUBMITTED") {
        setInvoices(getStoredVendorInvoices());
      }
    });
    return unsub;
  }, []);

  const dynamicDocs = invoices.map((inv) => ({
    id: `DOC-2026-${inv.id}`,
    title: inv.file || `${inv.id}_Official.pdf`,
    category: "Invoices",
    size: "1.5 MB",
    date: inv.date,
    author: inv.vendor,
  }));

  const allDocs = [...mockDeptDocs, ...dynamicDocs];

  const filtered = allDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCat === "all" ||
      doc.category.toLowerCase().includes(selectedCat.toLowerCase());

    return matchesSearch && matchesCat;
  });

  return (
    <div className="dm-documents-container">
      {/* Header */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <FolderKanban color="#f8b400" /> Department Document Repository
          </h1>
          <p className="dm-page-subtitle">
            Official records, approval authorization letters, contracts, and purchase order archives.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="dm-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
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
              placeholder="Search by file name or document ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dm-form-input"
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
            {["all", "Authorization", "Quotations", "Contracts", "Purchase Orders", "Invoices"].map((cat) => (
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
        {filtered.map((doc) => (
          <div key={doc.id} className="dm-card" style={{ padding: "20px" }}>
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
                  {doc.category.toUpperCase()} • {doc.id}
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
                  title={doc.title}
                >
                  {doc.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  {doc.size} • Uploaded {doc.date}
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
              <span style={{ fontSize: "11px", color: "#555555" }}>By: {doc.author}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="dm-sidebar-toggle"
                  style={{ width: "32px", height: "32px", display: "inline-flex" }}
                  title="Preview"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <Eye size={15} />
                </button>
                <button
                  className="dm-sidebar-toggle"
                  style={{ width: "32px", height: "32px", display: "inline-flex", color: "#d97706" }}
                  title="Download File"
                  onClick={() => alert(`Downloading ${doc.title}...`)}
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="dm-modal-overlay">
          <div className="dm-modal" style={{ maxWidth: "580px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Document Preview: {previewDoc.id}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                height: "240px",
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
                {previewDoc.title}
              </h4>
              <p style={{ color: "#666666", fontSize: "13px", marginTop: "4px" }}>
                Official Department Record ({previewDoc.size})
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
                <FileCheck size={16} /> Verified Manager Signature & Audit Hash
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button
                className="dm-btn-primary-sm"
                onClick={() => alert(`Downloading ${previewDoc.title}...`)}
              >
                <Download size={16} /> Download File
              </button>
              <button
                className="dm-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewDoc(null)}
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

export default DeptDocuments;
