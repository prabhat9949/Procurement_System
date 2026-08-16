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
import { epsEventBus, getStoredVendorInvoices } from "../../../../../services/epsApiService";

const mockDocuments = [
  {
    id: "DOC-2026-001",
    title: "Apple_MacBook_Pro_Quote_2026.pdf",
    category: "Quotations",
    type: "PDF Document",
    size: "2.4 MB",
    date: "2026-07-24",
    uploadedBy: "Apple Business Direct",
    reqId: "REQ-2026-8921",
  },
  {
    id: "DOC-2026-002",
    title: "Figma_Enterprise_Invoice_INV-9901.pdf",
    category: "Invoices",
    type: "PDF Document",
    size: "1.8 MB",
    date: "2026-07-20",
    uploadedBy: "Figma Accounts",
    reqId: "REQ-2026-8894",
  },
  {
    id: "DOC-2026-003",
    title: "PO-2026-8850_Herman_Miller_Chairs.pdf",
    category: "Purchase Orders",
    type: "PDF Document",
    size: "3.1 MB",
    date: "2026-07-15",
    uploadedBy: "Procurement Exec",
    reqId: "REQ-2026-8850",
  },
  {
    id: "DOC-2026-004",
    title: "AWS_Enterprise_Agreement_2026_Sign.pdf",
    category: "Contracts",
    type: "PDF Document",
    size: "5.6 MB",
    date: "2026-07-10",
    uploadedBy: "Legal & Procurement",
    reqId: "REQ-2026-8812",
  },
  {
    id: "DOC-2026-005",
    title: "ErgoDesk_Quote_Ref_8902.pdf",
    category: "Quotations",
    type: "PDF Document",
    size: "940 KB",
    date: "2026-07-05",
    uploadedBy: "ErgoDesk Co.",
    reqId: "REQ-2026-8790",
  },
  {
    id: "DOC-2026-006",
    title: "Dell_UltraSharp_Delivery_Receipt_REC-102.pdf",
    category: "Invoices",
    type: "PDF Document",
    size: "1.2 MB",
    date: "2026-06-28",
    uploadedBy: "Receiving Bay Ops",
    reqId: "REQ-2026-8710",
  },
];

const DocumentsModule = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    type: "PDF Document",
    size: "1.5 MB",
    date: inv.date,
    uploadedBy: inv.vendor,
    reqId: inv.rfqId || inv.poId,
  }));

  const allDocs = [...mockDocuments, ...dynamicDocs];

  const filteredDocs = allDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.reqId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      doc.category.toLowerCase().replace(/\s+/g, "") ===
        selectedCategory.toLowerCase().replace(/\s+/g, "");
    return matchesSearch && matchesCat;
  });

  return (
    <div className="emp-documents-container">
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">
            <FolderKanban color="#f8b400" /> Procurement Document Repository
          </h1>
          <p className="emp-page-subtitle">
            Centralized hub for all official quotations, purchase orders, invoices, and contracts.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="emp-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
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
              placeholder="Search by file name, REQ ID, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="emp-form-input"
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
            {["all", "Purchase Orders", "Quotations", "Invoices", "Contracts"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: selectedCategory === cat ? "#f8b400" : "transparent",
                  color: selectedCategory === cat ? "#000000" : "#555555",
                  fontWeight: selectedCategory === cat ? "700" : "600",
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

      {/* Document Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="emp-card" style={{ padding: "20px" }}>
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
                  {doc.category.toUpperCase()} • {doc.reqId}
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
              <span style={{ fontSize: "11px", color: "#555555" }}>By: {doc.uploadedBy}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="emp-nav-icon-btn"
                  style={{ width: "32px", height: "32px" }}
                  title="Preview"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <Eye size={15} />
                </button>
                <button
                  className="emp-nav-icon-btn"
                  style={{ width: "32px", height: "32px", color: "#d97706" }}
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{ maxWidth: "600px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Document Viewer: {previewDoc.id}
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
                height: "260px",
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
                {previewDoc.type} ({previewDoc.size})
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
                <FileCheck size={16} /> Verified Encrypted Document Signature
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justify: "flex-end",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                className="emp-btn-primary-sm"
                onClick={() => alert(`Downloading ${previewDoc.title}...`)}
              >
                <Download size={16} /> Download File
              </button>
              <button
                className="emp-btn-primary-sm"
                style={{
                  background: "#f8f9fb",
                  color: "#111111",
                  border: "1px solid #d9d9d9",
                }}
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

export default DocumentsModule;
