import React, { useState, useEffect } from "react";
import {
  Send,
  FileCheck2,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  Upload,
} from "lucide-react";
import {
  epsEventBus,
  fetchActiveRfqs,
  submitVendorQuote,
  createVendorInvoice
} from "../../../../../services/epsApiService";

const VendorRfqs = () => {
  const [rfqList, setRfqList] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null); // for quotation modal or spec view
  const [activeModal, setActiveModal] = useState(null); // 'submitQuote' | 'viewSpec'
  const [quoteForm, setQuoteForm] = useState({
    unitPrice: "3699.00",
    leadTime: "3 Business Days",
    warranty: "3 Years AppleCare+ Enterprise",
    discount: "5% Volume Tier",
    description: "MacBook Pro units equipped with standard enterprise software images, pre-registered under corporate Apple Business Manager account.",
    taxAllocation: "9% Standard GST",
    file: "Apple_Direct_Official_Quote_2026.pdf",
  });

  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await fetchActiveRfqs();
      setRfqList(data || []);
    };
    load();
    const unsub = epsEventBus.subscribe(async () => {
      const data = await fetchActiveRfqs();
      setRfqList(data || []);
    });
    return unsub;
  }, []);

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRfq) return;
    const totalCalc = `$${(parseFloat(quoteForm.unitPrice || 0) * (selectedRfq.qty || 1)).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    
    const updatedRfqs = await submitVendorQuote(selectedRfq.id, {
      unitPrice: quoteForm.unitPrice,
      leadTime: quoteForm.leadTime,
      warranty: quoteForm.warranty,
      submittedAmount: totalCalc,
      vendorName: "Apple Business Direct",
      description: quoteForm.description,
      taxAllocation: quoteForm.taxAllocation
    });

    if (updatedRfqs) {
      setRfqList(updatedRfqs);
    }

    setActiveModal(null);
    setToastMsg(`Commercial Quotation submitted successfully for ${selectedRfq.id}! (${totalCalc})`);
    setTimeout(() => setToastMsg(""), 5000);
  };

  return (
    <div className="vnd-rfqs-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <Send color="#f8b400" /> Active Buyer RFQs & Commercial Bidding
          </h1>
          <p className="vnd-page-subtitle">
            Review RFQ technical specifications, download buyer requirements, and submit commercial quotes.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* RFQ Cards Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {rfqList.map((rfq) => (
          <div key={rfq.id} className="vnd-card vnd-card-gold-glow">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: "800", color: "#d97706", fontSize: "16px" }}>
                    {rfq.id}
                  </span>
                  <span style={{ fontSize: "12px", color: "#666666" }}>Buyer: {rfq.buyer}</span>
                  {rfq.status === "Awarded" || rfq.bidStatus === "Awarded" ? (
                    <span
                      style={{
                        background: "rgba(5, 150, 105, 0.12)",
                        color: "#059669",
                        border: "1px solid #059669",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <CheckCircle2 size={13} /> Quotation Approved
                    </span>
                  ) : (
                    <span
                      className={`vnd-badge ${
                        rfq.bidStatus === "Bid Submitted" ? "approved" : "pending"
                      }`}
                    >
                      {rfq.bidStatus}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                  {rfq.item}
                </h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  Bidding Deadline
                </span>
                <p style={{ fontSize: "16px", color: "#dc2626", fontWeight: "800" }}>
                  {rfq.deadline}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                background: "#f8f9fb",
                borderRadius: "10px",
                border: "1px solid #ececec",
                marginBottom: "18px",
                fontSize: "13px",
                color: "#333333",
              }}
            >
              <strong style={{ color: "#111111" }}>Technical Specifications:</strong> {rfq.specs}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => alert(`Downloading buyer specification document ${rfq.rfqFile}...`)}
                >
                  <Download size={15} /> Download RFQ PDF
                </button>
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => {
                    setSelectedRfq(rfq);
                    setActiveModal("viewSpec");
                  }}
                >
                  <Eye size={15} /> View Requirements
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {(rfq.status === "Awarded" || rfq.bidStatus === "Awarded") && (
                  <button
                    className="vnd-btn-primary-sm"
                    style={{ background: "#059669", color: "#ffffff", border: "none", fontWeight: "800" }}
                    onClick={() => {
                      setSelectedRfq(rfq);
                      setActiveModal("generateInvoice");
                    }}
                  >
                    <FileText size={15} /> Generate Invoice
                  </button>
                )}

                <button
                  className="vnd-btn-primary-sm"
                  onClick={() => {
                    setSelectedRfq(rfq);
                    setActiveModal("submitQuote");
                  }}
                >
                  <Send size={15} /> {rfq.bidStatus === "Bid Submitted" ? "Update Quotation" : "Create Quotation"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT QUOTATION MODAL */}
      {activeModal === "submitQuote" && selectedRfq && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "600px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Submit Commercial Proposal: {selectedRfq.id}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Unit Price ($USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                    required
                    className="vnd-form-input"
                  />
                </div>

                <div className="vnd-form-group">
                  <label className="vnd-form-label">Total Commercial Bid ($USD)</label>
                  <input
                    type="text"
                    value={`$${(parseFloat(quoteForm.unitPrice || 0) * selectedRfq.qty).toLocaleString()}`}
                    readOnly
                    className="vnd-form-input"
                    style={{ background: "#f8f9fb", fontWeight: "800", color: "#059669" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Delivery Lead Time *</label>
                  <input
                    type="text"
                    value={quoteForm.leadTime}
                    onChange={(e) => setQuoteForm({ ...quoteForm, leadTime: e.target.value })}
                    required
                    className="vnd-form-input"
                  />
                </div>

                <div className="vnd-form-group">
                  <label className="vnd-form-label">Warranty & SLA Terms</label>
                  <input
                    type="text"
                    value={quoteForm.warranty}
                    onChange={(e) => setQuoteForm({ ...quoteForm, warranty: e.target.value })}
                    className="vnd-form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Tax Allocation / GST (%)</label>
                  <input
                    type="text"
                    value={quoteForm.taxAllocation}
                    onChange={(e) => setQuoteForm({ ...quoteForm, taxAllocation: e.target.value })}
                    className="vnd-form-input"
                    placeholder="e.g. 9% Standard GST"
                  />
                </div>

                <div className="vnd-form-group">
                  <label className="vnd-form-label">Commercial Incentive / Discount</label>
                  <input
                    type="text"
                    value={quoteForm.discount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, discount: e.target.value })}
                    className="vnd-form-input"
                  />
                </div>
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Quotation Description / Detailed Scope</label>
                <textarea
                  value={quoteForm.description}
                  onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                  className="vnd-form-input"
                  rows="3"
                  style={{ resize: "none", fontFamily: "inherit", padding: "10px" }}
                  placeholder="Enter detailed description of scope or specifications..."
                />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Attach Official Bid Document (PDF)</label>
                <div
                  style={{
                    padding: "12px",
                    border: "1px dashed #f8b400",
                    borderRadius: "8px",
                    background: "rgba(248,180,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                  }}
                >
                  <Upload size={18} color="#d97706" />
                  <span style={{ fontWeight: "600", color: "#111" }}>{quoteForm.file}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="vnd-btn-primary-sm">
                  <Send size={15} /> Submit Formal Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SPEC MODAL */}
      {activeModal === "viewSpec" && selectedRfq && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "560px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                RFQ Specifications: {selectedRfq.id}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <p><strong>Target Item:</strong> {selectedRfq.item}</p>
              <p><strong>Quantity Requested:</strong> {selectedRfq.qty} Units</p>
              <p><strong>Technical Requirements:</strong></p>
              <p style={{ background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec", color: "#333" }}>
                {selectedRfq.specs}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="vnd-btn-primary-sm"
                onClick={() => setActiveModal("submitQuote")}
              >
                Proceed to Create Quotation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* GENERATE INVOICE MODAL */}
      {activeModal === "generateInvoice" && selectedRfq && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "600px" }}>
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Generate Commercial Invoice for Approved Quotation
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: "rgba(5, 150, 105, 0.08)", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "10px", marginBottom: "18px", fontSize: "13px" }}>
              <span style={{ color: "#059669", fontWeight: "800" }}>✓ QUOTATION APPROVED BY PROCUREMENT EXECUTIVE</span>
              <p style={{ margin: "4px 0 0", color: "#333" }}>
                Generate your commercial invoice for <strong>{selectedRfq.item}</strong> (RFQ: {selectedRfq.id}). Upon submission, this invoice will be transmitted directly to the Finance Manager for 3-Way Invoice Matching.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const invNumber = `INV-2026-${Math.floor(9910 + Math.random() * 80)}`;
                await createVendorInvoice({
                  id: invNumber,
                  rfqId: selectedRfq.id,
                  poId: `PO-2026-${selectedRfq.id.replace("RFQ-2026-", "")}`,
                  vendor: "Apple Business Direct",
                  item: selectedRfq.item,
                  amount: selectedRfq.awardedAmount || selectedRfq.submittedAmount || "$36,990.00",
                  notes: "Commercial invoice generated upon quotation approval for 3-way matching."
                });

                setActiveModal(null);
                setToastMsg(`✓ Invoice ${invNumber} generated & submitted to Finance Manager for 3-Way Matching!`);
                setTimeout(() => setToastMsg(""), 6000);
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555" }}>INVOICE ID</label>
                  <input type="text" readOnly value={`INV-2026-${Math.floor(9910 + Math.random() * 80)}`} className="vnd-form-input" style={{ background: "#f8f9fb", fontWeight: "700" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555" }}>PO REFERENCE</label>
                  <input type="text" readOnly value={`PO-2026-${selectedRfq.id.replace("RFQ-2026-", "")}`} className="vnd-form-input" style={{ background: "#f8f9fb", fontWeight: "700" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555" }}>SUPPLIER VENDOR</label>
                  <input type="text" readOnly value="Apple Business Direct" className="vnd-form-input" style={{ background: "#f8f9fb" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555" }}>COMMERCIAL OFFER AMOUNT</label>
                  <input type="text" readOnly value={selectedRfq.awardedAmount || selectedRfq.submittedAmount || "$36,990.00"} className="vnd-form-input" style={{ background: "#f8f9fb", fontWeight: "800", color: "#059669" }} />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#555" }}>REMITTANCE NOTES & PAYMENT TERMS</label>
                <textarea
                  readOnly
                  value="Standard Net 30 Commercial Billing Terms. Goods delivered as per spec."
                  className="vnd-form-textarea"
                  style={{ height: "60px", background: "#f8f9fb" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="vnd-btn-primary-sm"
                  style={{ background: "#059669", color: "#ffffff", border: "none", fontWeight: "800" }}
                >
                  <FileText size={15} /> Submit Invoice to Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRfqs;
