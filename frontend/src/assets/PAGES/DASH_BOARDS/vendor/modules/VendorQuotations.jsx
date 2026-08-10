import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  Download,
  Eye,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Plus,
  Edit2,
  Upload,
  Calendar,
  Layers,
  Trash2,
} from "lucide-react";

// Mock RFQ options for creating new quotes
const mockRFQs = [
  { id: "RFQ-2026-901", buyer: "Enterprise Global Inc.", item: "MacBook Pro M3 Max 64GB Workstations", qty: 10, deadline: "2026-08-10" },
  { id: "RFQ-2026-890", buyer: "Enterprise Tech Labs", item: "Mac Studio M2 Ultra", qty: 4, deadline: "2026-08-15" },
  { id: "RFQ-2026-850", buyer: "Enterprise Global Inc.", item: "Studio Display 27'' Monitors", qty: 5, deadline: "2026-08-20" },
  { id: "RFQ-2026-992", buyer: "Global Logistics Ltd.", item: "Industrial Label Printers", qty: 8, deadline: "2026-08-05" },
];

const initialQuotations = [
  {
    id: "QUOTE-2026-001",
    rfqId: "RFQ-2026-901",
    buyer: "Enterprise Global Inc.",
    item: "MacBook Pro M3 Max 64GB Workstations (x10)",
    unitPrice: 3699,
    qty: 10,
    totalPrice: 36990,
    leadTime: "3 Business Days",
    shippingMethod: "Standard Express Air",
    warranty: "3 Years AppleCare+ Enterprise",
    status: "Awarded",
    date: "2026-07-25",
    file: "Apple_Direct_Official_Quote_2026.pdf",
    isDraft: false,
    deadline: "2026-08-10",
  },
  {
    id: "QUOTE-2026-008",
    rfqId: "RFQ-2026-890",
    buyer: "Enterprise Tech Labs",
    item: "Mac Studio M2 Ultra (x4)",
    unitPrice: 3999,
    qty: 4,
    totalPrice: 15996,
    leadTime: "2 Business Days",
    shippingMethod: "Next-Day Air Priority",
    warranty: "3 Years AppleCare+",
    status: "Under Review",
    date: "2026-07-20",
    file: "Mac_Studio_Quote.pdf",
    isDraft: false,
    deadline: "2026-08-15",
  },
  {
    id: "QUOTE-2026-005",
    rfqId: "RFQ-2026-850",
    buyer: "Enterprise Global Inc.",
    item: "Studio Display 27'' Monitors (x5)",
    unitPrice: 1599,
    qty: 5,
    totalPrice: 7995,
    leadTime: "4 Business Days",
    shippingMethod: "Ground Freight Protected",
    warranty: "3 Years Standard",
    status: "Awarded",
    date: "2026-07-10",
    file: "Studio_Display_Quote.pdf",
    isDraft: false,
    deadline: "2026-08-20",
  },
  {
    id: "QUOTE-2026-009",
    rfqId: "RFQ-2026-992",
    buyer: "Global Logistics Ltd.",
    item: "Industrial Label Printers (x8)",
    unitPrice: 450,
    qty: 8,
    totalPrice: 3600,
    leadTime: "5 Business Days",
    shippingMethod: "Standard Ground Logistics",
    warranty: "1 Year Manufacturer",
    status: "Draft",
    date: "2026-07-26",
    file: "Draft_Printers_Bid_Rev1.pdf",
    isDraft: true,
    deadline: "2026-08-05",
  },
];

import {
  epsEventBus,
  submitVendorQuote,
  getStoredQuotations,
  saveStoredQuotations
} from "../../../../../services/epsApiService";

const VendorQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("submitted"); // 'submitted' | 'drafts'
  const [viewState, setViewState] = useState("list"); // 'list' | 'create' | 'edit'
  const [previewQuote, setPreviewQuote] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  const loadQuotations = () => {
    const saved = getStoredQuotations();
    setQuotations(saved || []);
  };

  useEffect(() => {
    loadQuotations();
    const unsub = epsEventBus.subscribe((event) => {
      if (!event || event.type === "QUOTES_UPDATED") {
        loadQuotations();
      }
    });
    return unsub;
  }, []);

  // Form State
  const [selectedRfqId, setSelectedRfqId] = useState(mockRFQs[0].id);
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [formLeadTime, setFormLeadTime] = useState("");
  const [formShippingMethod, setFormShippingMethod] = useState("");
  const [formWarranty, setFormWarranty] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTaxAllocation, setFormTaxAllocation] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const selectedRfq = mockRFQs.find((r) => r.id === selectedRfqId) || mockRFQs[0];

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleOpenCreateForm = () => {
    setSelectedRfqId(mockRFQs[0].id);
    setFormUnitPrice(mockRFQs[0].unitPrice || "");
    setFormQty(mockRFQs[0].qty || 1);
    setFormLeadTime("3 Business Days");
    setFormShippingMethod("Standard Express Cargo");
    setFormWarranty("2 Year Comprehensive Warranty");
    setFormDescription("MacBook Pro units equipped with standard enterprise software images, pre-registered under corporate Apple Business Manager account.");
    setFormTaxAllocation("9% Standard GST");
    setUploadedFileName("");
    setViewState("create");
  };

  const handleOpenEditForm = (quote) => {
    setEditingQuoteId(quote.id);
    setSelectedRfqId(quote.rfqId);
    setFormUnitPrice(quote.unitPrice);
    setFormQty(quote.qty);
    setFormLeadTime(quote.leadTime);
    setFormShippingMethod(quote.shippingMethod || "");
    setFormWarranty(quote.warranty);
    setFormDescription(quote.description || "");
    setFormTaxAllocation(quote.taxAllocation || "");
    setUploadedFileName(quote.file);
    setViewState("edit");
  };

  const handleFormSubmit = (isSaveDraft) => {
    const total = Number(formUnitPrice) * Number(formQty);
    const rfq = mockRFQs.find((r) => r.id === selectedRfqId) || selectedRfq;

    if (viewState === "create") {
      const newQuote = {
        id: `QUOTE-2026-0${quotations.length + 1}`,
        rfqId: rfq.id,
        buyer: rfq.buyer,
        item: `${rfq.item} (x${formQty})`,
        unitPrice: Number(formUnitPrice),
        qty: Number(formQty),
        totalPrice: total,
        leadTime: formLeadTime,
        shippingMethod: formShippingMethod,
        warranty: formWarranty,
        description: formDescription,
        taxAllocation: formTaxAllocation,
        status: isSaveDraft ? "Draft" : "Submitted",
        date: new Date().toISOString().split("T")[0],
        file: uploadedFileName || `${rfq.item.toLowerCase().replace(/ /g, "_")}_quote.pdf`,
        isDraft: isSaveDraft,
        deadline: rfq.deadline,
      };

      const updatedList = [newQuote, ...quotations];
      saveStoredQuotations(updatedList);
      triggerToast(isSaveDraft ? "Quotation saved as Draft!" : "Quotation submitted successfully!");
    } else if (viewState === "edit") {
      const updatedList = quotations.map((q) => {
        if (q.id === editingQuoteId) {
          return {
            ...q,
            rfqId: rfq.id,
            buyer: rfq.buyer,
            item: `${rfq.item} (x${formQty})`,
            unitPrice: Number(formUnitPrice),
            qty: Number(formQty),
            totalPrice: total,
            leadTime: formLeadTime,
            shippingMethod: formShippingMethod,
            warranty: formWarranty,
            description: formDescription,
            taxAllocation: formTaxAllocation,
            status: isSaveDraft ? "Draft" : "Submitted",
            file: uploadedFileName || q.file,
            isDraft: isSaveDraft,
          };
        }
        return q;
      });
      saveStoredQuotations(updatedList);
      triggerToast(isSaveDraft ? "Quotation updated as Draft!" : "Quotation updated and submitted!");
    }

    setViewState("list");
  };

  const handleDeleteDraft = (id) => {
    const updatedList = quotations.filter((q) => q.id !== id);
    saveStoredQuotations(updatedList);
    triggerToast("Draft quotation deleted.");
  };

  const handleDownload = (quote) => {
    triggerToast(`Downloading PDF document: ${quote.file}`);
  };

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.buyer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "submitted" ? !q.isDraft : q.isDraft;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="vnd-quotations-container" style={{ padding: "20px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: "4px solid #f8b400",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="vnd-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FileCheck2 color="#f8b400" size={28} /> Supplier Bidding & Quotations Hub
          </h1>
          <p className="vnd-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Prepare, save as draft, submit commercial proposals, and track real-time RFQ statuses.
          </p>
        </div>

        {viewState === "list" && (
          <button className="vnd-btn-primary-sm" onClick={handleOpenCreateForm}>
            <Plus size={16} /> Create New Quotation
          </button>
        )}
      </div>

      {viewState === "list" ? (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "20px" }}>
            <button
              onClick={() => setActiveTab("submitted")}
              style={{
                background: "none",
                border: "none",
                padding: "10px 16px",
                fontSize: "15px",
                fontWeight: activeTab === "submitted" ? "700" : "500",
                color: activeTab === "submitted" ? "#d97706" : "#666",
                borderBottom: activeTab === "submitted" ? "3px solid #f8b400" : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              Submitted Quotations ({quotations.filter((q) => !q.isDraft).length})
            </button>
            <button
              onClick={() => setActiveTab("drafts")}
              style={{
                background: "none",
                border: "none",
                padding: "10px 16px",
                fontSize: "15px",
                fontWeight: activeTab === "drafts" ? "700" : "500",
                color: activeTab === "drafts" ? "#d97706" : "#666",
                borderBottom: activeTab === "drafts" ? "3px solid #f8b400" : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              Draft Quotations ({quotations.filter((q) => q.isDraft).length})
            </button>
          </div>

          {/* Search bar */}
          <div className="vnd-card" style={{ marginBottom: "24px", padding: "18px 24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search
                size={16}
                color="#666666"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search by quote, product, or buyer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 42px",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="vnd-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="vnd-table-container">
              <table className="vnd-table">
                <thead>
                  <tr>
                    <th style={{ whiteSpace: "nowrap" }}>Quote ID</th>
                    <th style={{ whiteSpace: "nowrap" }}>RFQ Reference</th>
                    <th style={{ whiteSpace: "nowrap" }}>Enterprise Buyer</th>
                    <th>Product Description</th>
                    <th style={{ whiteSpace: "nowrap" }}>Total Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                        No quotations found in this category.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q) => (
                      <tr key={q.id}>
                        <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{q.id}</td>
                        <td style={{ color: "#666666", fontSize: "13px", whiteSpace: "nowrap" }}>{q.rfqId}</td>
                        <td style={{ fontWeight: "700", color: "#111111", whiteSpace: "nowrap" }}>{q.buyer}</td>
                        <td style={{ fontWeight: "600", minWidth: "200px" }}>{q.item}</td>
                        <td style={{ fontWeight: "800", color: "#059669", whiteSpace: "nowrap" }}>${q.totalPrice.toLocaleString()}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background:
                                q.status === "Awarded"
                                  ? "rgba(5, 150, 105, 0.12)"
                                  : q.status === "Under Review" || q.status === "Submitted"
                                    ? "rgba(217, 119, 6, 0.12)"
                                    : q.status === "Draft"
                                      ? "rgba(100, 116, 139, 0.12)"
                                      : "rgba(220, 38, 38, 0.12)",
                              color:
                                q.status === "Awarded"
                                  ? "#059669"
                                  : q.status === "Under Review" || q.status === "Submitted"
                                    ? "#d97706"
                                    : q.status === "Draft"
                                      ? "#475569"
                                      : "#dc2626",
                              border: `1px solid ${q.status === "Awarded"
                                  ? "rgba(5, 150, 105, 0.3)"
                                  : q.status === "Under Review" || q.status === "Submitted"
                                    ? "rgba(217, 119, 6, 0.3)"
                                    : q.status === "Draft"
                                      ? "rgba(100, 116, 139, 0.3)"
                                      : "rgba(220, 38, 38, 0.3)"
                                }`,
                            }}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              className="vnd-sidebar-toggle"
                              style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                              onClick={() => setPreviewQuote(q)}
                              title="View Details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="vnd-sidebar-toggle"
                              style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#d97706" }}
                              onClick={() => handleDownload(q)}
                              title="Download Quotation"
                            >
                              <Download size={15} />
                            </button>

                            {(q.isDraft || q.status === "Submitted" || q.status === "Under Review") && (
                              <button
                                className="vnd-sidebar-toggle"
                                style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#3b82f6" }}
                                onClick={() => handleOpenEditForm(q)}
                                title="Edit Quotation"
                              >
                                <Edit2 size={14} />
                              </button>
                            )}

                            {q.isDraft && (
                              <button
                                className="vnd-sidebar-toggle"
                                style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "6px", color: "#dc2626", background: "rgba(220,38,38,0.05)" }}
                                onClick={() => handleDeleteDraft(q.id)}
                                title="Delete Draft"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Create / Edit Form View */
        <div className="vnd-card" style={{ padding: "28px", background: "#ffffff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #f2f2f2", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111" }}>
              {viewState === "create" ? "Prepare Commercial Quotation" : `Edit Quotations - ${editingQuoteId}`}
            </h2>
            <button
              onClick={() => setViewState("list")}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <X size={18} /> Cancel
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flexWrap: "wrap" }}>

            {/* Left side */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="vnd-form-group">
                <label className="vnd-form-label">Select RFQ Opportunity Reference</label>
                <select
                  value={selectedRfqId}
                  onChange={(e) => setSelectedRfqId(e.target.value)}
                  className="vnd-form-select"
                  disabled={viewState === "edit"}
                >
                  {mockRFQs.map((rfq) => (
                    <option key={rfq.id} value={rfq.id}>
                      {rfq.id} - {rfq.item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Unit Price ($ USD)</label>
                  <input
                    type="number"
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(e.target.value)}
                    className="vnd-form-input"
                    placeholder="Enter bid unit price"
                    required
                  />
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Quantity Offered</label>
                  <input
                    type="number"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    className="vnd-form-input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="vnd-form-group" style={{ background: "#f8f9fb", padding: "16px", borderRadius: "8px", border: "1px dashed #d9d9d9" }}>
                <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>TOTAL BID CALCULATION</span>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#059669", marginTop: "4px" }}>
                  ${(Number(formUnitPrice || 0) * Number(formQty || 0)).toLocaleString()} USD
                </div>
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Supporting Document Upload</label>
                <div style={{ border: "2px dashed #d9d9d9", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer", background: "#fafafa" }} onClick={() => {
                  const name = prompt("Enter mock document file name (e.g. quote_sheets_v3.pdf):", "Quote_Specification_Offer.pdf");
                  if (name) setUploadedFileName(name);
                }}>
                  <Upload size={24} color="#888" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>
                    {uploadedFileName ? `Uploaded: ${uploadedFileName}` : "Click to select or upload PDF files"}
                  </p>
                  <span style={{ fontSize: "11px", color: "#888" }}>Max upload size: 15MB (.pdf, .xls, .doc)</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="vnd-form-group">
                <label className="vnd-form-label">Target Buyer Info (Read-Only)</label>
                <div style={{ background: "#f8f9fb", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" }}>
                  <strong>Client Organization:</strong> {selectedRfq.buyer} <br />
                  <strong>Item Required:</strong> {selectedRfq.item} <br />
                  <strong>Response Deadline:</strong> <span style={{ color: "#dc2626", fontWeight: "700" }}>{selectedRfq.deadline}</span>
                </div>
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Delivery Commitment / Lead Time</label>
                <input
                  type="text"
                  value={formLeadTime}
                  onChange={(e) => setFormLeadTime(e.target.value)}
                  className="vnd-form-input"
                  placeholder="e.g. 3 Business Days"
                  required
                />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Proposed Shipping & Delivery Method</label>
                <input
                  type="text"
                  value={formShippingMethod}
                  onChange={(e) => setFormShippingMethod(e.target.value)}
                  className="vnd-form-input"
                  placeholder="e.g. Standard Freight / Courier Ground"
                />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Warranty & SLA Information</label>
                <textarea
                  value={formWarranty}
                  onChange={(e) => setFormWarranty(e.target.value)}
                  className="vnd-form-textarea"
                  placeholder="Describe warranty terms, support level agreement details..."
                  style={{ minHeight: "90px" }}
                  required
                />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Tax Allocation / GST (%)</label>
                <input
                  type="text"
                  value={formTaxAllocation}
                  onChange={(e) => setFormTaxAllocation(e.target.value)}
                  className="vnd-form-input"
                  placeholder="e.g. 9% Standard GST"
                />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Quotation Description / Remarks</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="vnd-form-textarea"
                  placeholder="Enter detailed technical or service specifications..."
                  style={{ minHeight: "90px", resize: "none" }}
                />
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f2f2f2", marginTop: "24px", paddingTop: "20px" }}>
            <button
              onClick={() => setViewState("list")}
              style={{
                background: "#f8f9fb",
                color: "#111",
                border: "1px solid #d9d9d9",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleFormSubmit(true)}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Save as Draft
            </button>
            <button
              className="vnd-btn-primary-sm"
              onClick={() => handleFormSubmit(false)}
              style={{ padding: "10px 24px" }}
            >
              Submit Quotation
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuote && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                background: "#f8f9fb",
                borderBottom: "1px solid #ececec",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>QUOTATION OVERVIEW</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
                  {previewQuote.id}
                </h3>
              </div>
              <button
                onClick={() => setPreviewQuote(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f2f2f2", paddingBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#666" }}>Quotation Status</span>
                    <div style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background:
                            previewQuote.status === "Awarded"
                              ? "rgba(5, 150, 105, 0.12)"
                              : previewQuote.status === "Under Review" || previewQuote.status === "Submitted"
                                ? "rgba(217, 119, 6, 0.12)"
                                : "rgba(100, 116, 139, 0.12)",
                          color:
                            previewQuote.status === "Awarded"
                              ? "#059669"
                              : previewQuote.status === "Under Review" || previewQuote.status === "Submitted"
                                ? "#d97706"
                                : "#475569",
                          border: `1px solid ${previewQuote.status === "Awarded"
                              ? "rgba(5, 150, 105, 0.3)"
                              : previewQuote.status === "Under Review" || previewQuote.status === "Submitted"
                                ? "rgba(217, 119, 6, 0.3)"
                                : "rgba(100, 116, 139, 0.3)"
                            }`,
                        }}
                      >
                        {previewQuote.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>Submitted Date</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginTop: "4px" }}>{previewQuote.date}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "12px", color: "#777" }}>Target Client / Buyer</span>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{previewQuote.buyer}</p>
                </div>

                <div>
                  <span style={{ fontSize: "12px", color: "#777" }}>Product Description</span>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#111" }}>{previewQuote.item}</p>
                </div>

                {/* Pricing Details */}
                <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Pricing Details</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "6px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Unit Price</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>${previewQuote.unitPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Quantity</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{previewQuote.qty} units</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Total Bid Price</span>
                      <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669" }}>${previewQuote.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Commitments & Warranty */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Delivery Commitments</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{previewQuote.leadTime}</p>
                    {previewQuote.shippingMethod && (
                      <span style={{ fontSize: "11px", color: "#888" }}>Method: {previewQuote.shippingMethod}</span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Warranty Information</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{previewQuote.warranty}</p>
                  </div>
                </div>

                {/* Supporting Document */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid rgba(5,150,105,0.15)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} color="#059669" />
                    <div>
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "700" }}>Supporting Document</span>
                      <p style={{ fontSize: "13px", color: "#333", margin: 0 }}>{previewQuote.file}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(previewQuote)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#059669" }}
                    title="Download Submitted Quotation"
                  >
                    <Download size={18} />
                  </button>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="vnd-btn-primary-sm"
                onClick={() => handleDownload(previewQuote)}
              >
                <Download size={15} /> Download Quote
              </button>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#11", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewQuote(null)}
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

export default VendorQuotations;
