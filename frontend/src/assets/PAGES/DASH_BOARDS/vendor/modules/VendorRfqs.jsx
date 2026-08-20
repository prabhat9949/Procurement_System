import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  FileCheck2,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  X,
  FileText,
  Loader2,
  WifiOff,
  IndianRupee,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const PAYMENT_TERMS = ["Net 15 Days", "Net 30 Days", "Net 45 Days", "Net 60 Days", "Advance 50% + Net 30", "Immediate"];
const DELIVERY_DAYS = [3, 5, 7, 10, 14, 21, 30, 45];
const WARRANTY_MONTHS = [0, 6, 12, 24, 36];
const CURRENCIES = ["INR", "INR"];
const DISCOUNTS = [0, 2, 5, 10, 15, 20];
const TAX_RATES = [0, 5, 9, 12, 18];

const statusLabel = (s) => {
  const map = { DRAFT: "Draft", OPEN: "Open for Bids", CLOSED: "Closed", AWARDED: "Awarded", CANCELLED: "Cancelled" };
  return map[s] || s;
};

const VendorRfqs = () => {
  const [rfqList, setRfqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRfq, setSelectedRfq] = useState(null); // for quotation modal or spec view
  const [activeModal, setActiveModal] = useState(null); // 'submitQuote' | 'viewSpec'
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    validUntil: "",
    currency: "INR",
    paymentTerms: "Net 30 Days",
    deliveryDays: "7",
    deliveryLocation: "",
    warrantyMonths: "12",
    discountPercentage: "0",
    taxPercentage: "18",
    remarks: "",
  });
  const [linePrices, setLinePrices] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/vendor/my/rfqs?page=0&size=50");
      setRfqList(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your RFQ invitations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const openQuoteModal = (rfq) => {
    setSelectedRfq(rfq);
    const initial = {};
    (rfq.lines || []).forEach((l) => {
      initial[l.rfqLineId] = l.estimatedUnitPrice != null ? String(l.estimatedUnitPrice) : "";
    });
    setLinePrices(initial);
    setQuoteForm({
      validUntil: "",
      currency: rfq.currency || "INR",
      paymentTerms: "Net 30 Days",
      deliveryDays: "7",
      deliveryLocation: "",
      warrantyMonths: "12",
      discountPercentage: "0",
      taxPercentage: "18",
      remarks: "",
    });
    setActiveModal("submitQuote");
  };

  const computeTotal = () => {
    const rfq = selectedRfq;
    if (!rfq) return 0;
    const lines = rfq.lines || [];
    if (!lines.length) return 0;
    let subtotal = 0;
    lines.forEach((l) => {
      const unit = parseFloat(linePrices[l.rfqLineId]) || 0;
      subtotal += unit * Number(l.quantity || 1);
    });
    const discount = parseFloat(quoteForm.discountPercentage) || 0;
    const tax = parseFloat(quoteForm.taxPercentage) || 0;
    const discounted = subtotal * (1 - discount / 100);
    return discounted * (1 + tax / 100);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRfq) return;
    if (!quoteForm.validUntil) {
      triggerToast("Please select the quotation validity date.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // 1. Create the quotation header (vendor is forced server-side).
      const created = await apiPost("/api/vendor/my/quotations", {
        rfqId: selectedRfq.rfqId,
        vendorId: 0, // backend overrides with the authenticated vendor
        validUntil: quoteForm.validUntil,
        currency: quoteForm.currency,
        discountAmount: null,
        taxAmount: null,
        shippingCharges: null,
        otherCharges: null,
        paymentTerms: quoteForm.paymentTerms,
        deliveryDays: parseInt(quoteForm.deliveryDays, 10),
        deliveryLocation: quoteForm.deliveryLocation.trim() || null,
        warrantyMonths: parseInt(quoteForm.warrantyMonths, 10),
        remarks: quoteForm.remarks.trim() || null,
      });

      // 2. Add one line per RFQ line with the quoted unit price.
      for (const line of selectedRfq.lines || []) {
        await apiPost(`/api/vendor/my/quotations/${created.id}/lines`, {
          vendorQuotationId: created.id,
          rfqLineId: line.rfqLineId,
          quantity: Number(line.quantity || 1),
          unitPrice: parseFloat(linePrices[line.rfqLineId]) || 0,
          discountPercentage: parseFloat(quoteForm.discountPercentage) || 0,
          taxPercentage: parseFloat(quoteForm.taxPercentage) || 0,
          remarks: null,
        });
      }

      // 3. Submit the quotation.
      await apiPost(`/api/vendor/my/quotations/${created.id}/submit`, {});

      setActiveModal(null);
      setSelectedRfq(null);
      triggerToast(`Quotation ${created.quotationNumber || created.id} submitted for ${selectedRfq.rfqNumber}!`);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to submit your quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d7dce3",
    borderRadius: "9px",
    fontSize: "13.5px",
    background: "#fff",
    outline: "none",
  };
  const fieldLabel = { display: "block", fontSize: "12.5px", fontWeight: "700", color: "#374151", marginBottom: "6px" };

  return (
    <div className="vnd-rfqs-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <Send color="#f8b400" /> My RFQ Invitations & Bidding
          </h1>
          <p className="vnd-page-subtitle">
            RFQs your company was invited to — only your own records, live from the database.
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

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your RFQ invitations...
        </div>
      ) : rfqList.length === 0 ? (
        <div className="vnd-card" style={{ textAlign: "center", padding: "48px" }}>
          <FileCheck2 size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>No Open RFQ Invitations</h3>
          <p style={{ color: "#666666", fontSize: "14px", marginTop: "4px" }}>
            You will see RFQs here once the procurement team invites your company to bid.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {rfqList.map((rfq) => {
            const lines = rfq.lines || [];
            const itemName = rfq.item || (lines[0] ? lines[0].productName : "General requirement");
            const qty = rfq.quantity || (lines.length ? lines.reduce((a, l) => a + Number(l.quantity || 0), 0) : 1);
            const isAwarded = rfq.status === "AWARDED";
            return (
              <div key={rfq.rfqId} className="vnd-card vnd-card-gold-glow">
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: "800", color: "#d97706", fontSize: "16px" }}>
                        {rfq.rfqNumber}
                      </span>
                      <span style={{ fontSize: "12px", color: "#666666" }}>
                        Status: {statusLabel(rfq.status)}
                      </span>
                      <span
                        style={{
                          background: rfq.invitationStatus === "RESPONDED" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                          color: rfq.invitationStatus === "RESPONDED" ? "#059669" : "#d97706",
                          border: "1px solid",
                          borderColor: rfq.invitationStatus === "RESPONDED" ? "#059669" : "#f8b400",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {rfq.invitationStatus === "RESPONDED" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {rfq.invitationStatus === "RESPONDED" ? "Quotation Submitted" : "Invited — Awaiting Response"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                      {itemName}
                    </h3>
                    {lines.length > 1 && (
                      <p style={{ fontSize: "12.5px", color: "#666", marginTop: "2px" }}>
                        {lines.length} line items · Total quantity {qty} units
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                      Bidding Deadline
                    </span>
                    <p style={{ fontSize: "16px", color: "#dc2626", fontWeight: "800" }}>
                      {formatDateIN(rfq.closingDate, { withTime: false })}
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
                  <strong style={{ color: "#111111" }}>Requirements:</strong>{" "}
                  {rfq.remarks || "Refer to the RFQ line items below for the full requirement."}
                  <ul style={{ margin: "10px 0 0", paddingLeft: "18px" }}>
                    {lines.map((l) => (
                      <li key={l.rfqLineId} style={{ marginBottom: "4px" }}>
                        {l.productName} ({l.sku}) — Qty {l.quantity} · Est. {formatINR(l.estimatedUnitPrice)}
                        {l.requiredDate ? ` · Required by ${formatDateIN(l.requiredDate, { withTime: false })}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px" }}>
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
                    <button
                      className="vnd-btn-primary-sm"
                      onClick={() => openQuoteModal(rfq)}
                      disabled={rfq.status === "CLOSED" || rfq.status === "AWARDED" || rfq.status === "CANCELLED"}
                    >
                      <Send size={15} /> {rfq.invitationStatus === "RESPONDED" ? "Update Quotation" : "Create Quotation"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMIT QUOTATION MODAL */}
      {activeModal === "submitQuote" && selectedRfq && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Submit Commercial Proposal: {selectedRfq.rfqNumber}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit}>
              {/* Line pricing */}
              <div className="vnd-form-group" style={{ marginBottom: "16px" }}>
                <label className="vnd-form-label">Line Item Pricing (₹) *</label>
                {(selectedRfq.lines || []).map((l) => (
                  <div key={l.rfqLineId} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ flex: 1, fontSize: "13px", color: "#111", fontWeight: 600 }}>
                      {l.productName} × {l.quantity}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      style={{ ...inputStyle, width: "180px" }}
                      value={linePrices[l.rfqLineId] || ""}
                      placeholder="Unit price"
                      onChange={(e) => setLinePrices((p) => ({ ...p, [l.rfqLineId]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Quotation Valid Until *</label>
                  <input type="date" style={inputStyle} value={quoteForm.validUntil} onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} required />
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Currency</label>
                  <select style={inputStyle} value={quoteForm.currency} onChange={(e) => setQuoteForm({ ...quoteForm, currency: e.target.value })}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Payment Terms</label>
                  <select style={inputStyle} value={quoteForm.paymentTerms} onChange={(e) => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}>
                    {PAYMENT_TERMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Delivery Lead Time (Days)</label>
                  <select style={inputStyle} value={quoteForm.deliveryDays} onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDays: e.target.value })}>
                    {DELIVERY_DAYS.map((d) => (
                      <option key={d} value={String(d)}>{d} business days</option>
                    ))}
                  </select>
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Warranty / Support (Months)</label>
                  <select style={inputStyle} value={quoteForm.warrantyMonths} onChange={(e) => setQuoteForm({ ...quoteForm, warrantyMonths: e.target.value })}>
                    {WARRANTY_MONTHS.map((m) => (
                      <option key={m} value={String(m)}>{m === 0 ? "No warranty" : `${m} months`}</option>
                    ))}
                  </select>
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Discount (%)</label>
                  <select style={inputStyle} value={quoteForm.discountPercentage} onChange={(e) => setQuoteForm({ ...quoteForm, discountPercentage: e.target.value })}>
                    {DISCOUNTS.map((d) => (
                      <option key={d} value={String(d)}>{d === 0 ? "None" : `${d}%`}</option>
                    ))}
                  </select>
                </div>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Tax / GST (%)</label>
                  <select style={inputStyle} value={quoteForm.taxPercentage} onChange={(e) => setQuoteForm({ ...quoteForm, taxPercentage: e.target.value })}>
                    {TAX_RATES.map((t) => (
                      <option key={t} value={String(t)}>{t === 0 ? "Nil" : `${t}%`}</option>
                    ))}
                  </select>
                </div>
                <div className="vnd-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="vnd-form-label">Delivery Location / Address</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={quoteForm.deliveryLocation}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryLocation: e.target.value })}
                    placeholder="Delivery address for this quotation"
                  />
                </div>
                <div className="vnd-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="vnd-form-label">Remarks / Additional Notes</label>
                  <textarea
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                    value={quoteForm.remarks}
                    onChange={(e) => setQuoteForm({ ...quoteForm, remarks: e.target.value })}
                    placeholder="Any remarks for the procurement team"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "14px",
                  padding: "10px 14px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  color: "#1e3a8a",
                }}
              >
                <IndianRupee size={16} />
                <strong>Quoted Total:</strong>&nbsp;{formatINR(computeTotal())}
                <span style={{ color: "#64748b", fontSize: 12 }}>(after discount &amp; tax)</span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="vnd-btn-primary-sm" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? <><Loader2 size={15} className="login-spin" /> Submitting...</> : <><Send size={15} /> Submit Formal Proposal</>}
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
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                RFQ Specifications: {selectedRfq.rfqNumber}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <p><strong>Status:</strong> {statusLabel(selectedRfq.status)}</p>
              <p><strong>Issued:</strong> {formatDateIN(selectedRfq.issueDate, { withTime: false })} · <strong>Closes:</strong> {formatDateIN(selectedRfq.closingDate, { withTime: false })}</p>
              {selectedRfq.remarks && (
                <>
                  <p><strong>Requirements:</strong></p>
                  <p style={{ background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec", color: "#333" }}>
                    {selectedRfq.remarks}
                  </p>
                </>
              )}
              <p><strong>Line Items:</strong></p>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {(selectedRfq.lines || []).map((l) => (
                  <li key={l.rfqLineId} style={{ marginBottom: "4px" }}>
                    {l.productName} ({l.sku}) — Qty {l.quantity} · Est. {formatINR(l.estimatedUnitPrice)}
                  </li>
                ))}
              </ul>
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
    </div>
  );
};

export default VendorRfqs;
