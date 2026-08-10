import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Download,
  Eye,
  Check,
  Search,
  X,
  FileText,
  Truck,
  Receipt,
  Upload,
  QrCode,
  Building2,
  CalendarDays,
  DollarSign,
  CreditCard,
  Send,
} from "lucide-react";

import { initiateGlobalShipment, epsEventBus, createVendorInvoice, getStoredPurchaseOrders, saveStoredPurchaseOrders, getStoredVendorInvoices } from "../../../../../services/epsApiService";

const VendorPurchaseOrders = ({ onNavigate }) => {
  const [poList, setPoList] = useState(() => getStoredPurchaseOrders());
  const [invoices, setInvoices] = useState(() => getStoredVendorInvoices());
  const [searchTerm, setSearchTerm] = useState("");
  const [previewPo, setPreviewPo] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [invoicePo, setInvoicePo] = useState(null); // po for which invoice modal is open
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceAmount: "",
    dueDate: "",
    bankName: "",
    accountNumber: "",
    ifscSwift: "",
    accountHolder: "",
    paymentTerms: "Net 30 Days",
    notes: "",
    invoicePdfName: "",
    qrCodeName: "",
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const handleAcceptPo = (poId) => {
    const updated = poList.map((p) => (p.id === poId ? { ...p, status: "Accepted & Confirmed" } : p));
    setPoList(updated);
    saveStoredPurchaseOrders(updated);
    triggerToast(`Purchase Order ${poId} accepted & countersigned! Delivery shipment scheduled.`);
  };

  const handleShipmentInitiated = (poId) => {
    const updated = poList.map((p) => (p.id === poId ? { ...p, status: "Shipment Initiated" } : p));
    setPoList(updated);
    saveStoredPurchaseOrders(updated);
    // Pass the poId directly — initiateGlobalShipment resolves the reqId internally via PO_REQ_MAP
    initiateGlobalShipment(poId);
    epsEventBus.publish({ type: "VENDOR_SHIPMENT_INITIATED", poId });
    triggerToast(`Shipment Initiated for ${poId}! All user tracking forms updated.`);
  };

  useEffect(() => {
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED" || e.type === "INVOICE_SUBMITTED") {
        setInvoices(getStoredVendorInvoices());
      }
    });
    return unsub;
  }, []);

  const openInvoiceModal = (po) => {
    setInvoicePo(po);
    setInvoiceForm({
      invoiceAmount: po.rawAmount || "",
      dueDate: "",
      bankName: "",
      accountNumber: "",
      ifscSwift: "",
      accountHolder: po.vendor || "",
      paymentTerms: po.terms || "Net 30 Days",
      notes: `Commercial Invoice for ${po.item}. Please process payment as per PO ${po.id}.`,
      invoicePdfName: "",
      qrCodeName: "",
    });
  };

  const handleInvoiceFormChange = (field, value) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileInput = (field, e) => {
    const file = e.target.files[0];
    if (file) handleInvoiceFormChange(field, file.name);
  };

  const handleSubmitInvoice = async () => {
    if (!invoiceForm.invoiceAmount || !invoiceForm.dueDate || !invoiceForm.bankName || !invoiceForm.accountNumber || !invoiceForm.accountHolder) {
      triggerToast("⚠️ Please fill all required fields before submitting.");
      return;
    }
    setSubmittingInvoice(true);
    const invData = {
      poId: invoicePo.id,
      rfqId: invoicePo.reqId,
      buyer: invoicePo.buyer,
      vendor: invoicePo.vendor,
      item: invoicePo.item,
      amount: parseFloat(String(invoiceForm.invoiceAmount).replace(/[^0-9.]/g, "")) || invoicePo.rawAmount,
      dueDate: invoiceForm.dueDate,
      notes: invoiceForm.notes,
      bankDetails: `${invoiceForm.bankName} • Acct ${invoiceForm.accountNumber}`,
      accountHolder: invoiceForm.accountHolder,
      ifscSwift: invoiceForm.ifscSwift,
      paymentTerms: invoiceForm.paymentTerms,
      invoicePdfName: invoiceForm.invoicePdfName || `INV_${invoicePo.id}_Official.pdf`,
      qrCodeName: invoiceForm.qrCodeName || `QR_${invoicePo.id}_Payment.png`,
    };
    setTimeout(() => {
      createVendorInvoice(invData);
      setSubmittingInvoice(false);
      setInvoicePo(null);
      epsEventBus.publish({ type: "VENDOR_INVOICE_CREATED" });
      triggerToast(`✅ Invoice ${invData.invoicePdfName} successfully generated and submitted to Finance.`);
    }, 2000);
  };

  const filtered = poList.filter(
    (p) =>
      p.status !== "Pending Vendor Confirmation" &&
      (p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.buyer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="vnd-purchase-orders-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <ShoppingBag color="#f8b400" /> Buyer Purchase Orders (PO) Hub
          </h1>
          <p className="vnd-page-subtitle">
            Review, countersign, and accept legally binding Purchase Orders received from enterprise buyers.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: toastMsg.startsWith("⚠️") ? "rgba(234,179,8,0.12)" : "rgba(5, 150, 105, 0.12)",
            border: `1px solid ${toastMsg.startsWith("⚠️") ? "#ca8a04" : "#059669"}`,
            color: toastMsg.startsWith("⚠️") ? "#ca8a04" : "#059669",
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

      {/* Search */}
      <div className="vnd-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search
            size={16}
            color="#666666"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search PO Code, Buyer, or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vnd-form-input"
            style={{ paddingLeft: "42px", height: "42px" }}
          />
        </div>
      </div>

      {/* PO List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {filtered.map((po) => (
          <div key={po.id} className="vnd-card vnd-card-gold-glow">
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
                  <span style={{ fontWeight: "800", color: "#d97706", fontSize: "16px" }}>{po.id}</span>
                  <span style={{ fontSize: "12px", color: "#666666" }}>Buyer: {po.buyer}</span>
                  <span
                    className={`vnd-badge ${
                      po.status.includes("Accepted") ||
                      po.status.includes("Fulfilled") ||
                      po.status.includes("Awarded") ||
                      po.status.includes("Shipment")
                        ? "approved"
                        : "pending"
                    }`}
                  >
                    {po.status}
                  </span>
                </div>
                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                  {po.item}
                </h3>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                  PO Total Value
                </span>
                <p style={{ fontSize: "24px", color: "#059669", fontWeight: "800" }}>{po.totalAmount}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => alert(`Downloading official PO ${po.poFile}...`)}
              >
                <Download size={15} /> Download PO PDF
              </button>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewPo(po)}
              >
                <Eye size={15} /> View Line Items
              </button>
              {(po.status === "Pending Vendor Confirmation" || po.status === "Awarded") && (
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#059669", color: "#fff" }}
                  onClick={() => handleAcceptPo(po.id)}
                >
                  <Check size={16} /> Accept Purchase Order
                </button>
              )}
              {invoices.some((inv) => inv.poId === po.id) ? (
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#10b981", color: "#fff" }}
                  onClick={() => onNavigate && onNavigate("invoices")}
                >
                  <Receipt size={15} /> View Invoice
                </button>
              ) : (
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#0ea5e9", color: "#fff" }}
                  onClick={() => openInvoiceModal(po)}
                >
                  <Receipt size={15} /> Generate Invoice
                </button>
              )}
              {po.status === "Shipment Initiated" ? (
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f59e0b", color: "#fff" }}
                  onClick={() => onNavigate && onNavigate("delivery-tracking")}
                >
                  <Truck size={15} /> Track Order
                </button>
              ) : (
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#8b5cf6", color: "#fff" }}
                  onClick={() => handleShipmentInitiated(po.id)}
                >
                  <Truck size={15} /> Shipment Initiated
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PO Preview Modal */}
      {previewPo && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>PO Details: {previewPo.id}</h3>
              <button onClick={() => setPreviewPo(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #ececec", textAlign: "center" }}>
              <FileText size={48} color="#f8b400" style={{ margin: "0 auto 12px" }} />
              <h4 style={{ fontSize: "16px", color: "#111111", fontWeight: "700" }}>{previewPo.item}</h4>
              <p style={{ color: "#666666", fontSize: "13px", marginTop: "4px" }}>
                Issued by <strong>{previewPo.buyer}</strong> • Payment Terms: {previewPo.terms}
              </p>
              <div style={{ marginTop: "16px", fontSize: "22px", fontWeight: "800", color: "#059669" }}>{previewPo.totalAmount}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button className="vnd-btn-primary-sm" onClick={() => alert(`Downloading ${previewPo.poFile}...`)}>
                <Download size={15} /> Download PDF
              </button>
              <button className="vnd-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setPreviewPo(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============= GENERATE INVOICE MODAL ============= */}
      {invoicePo && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #f8b400" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Receipt size={22} color="#f8b400" />
                  <span style={{ color: "#d97706", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}>Generate Tax Invoice</span>
                </div>
                <h2 style={{ fontSize: "20px", color: "#111", fontWeight: "800", marginTop: "4px" }}>Invoice for {invoicePo.id}</h2>
                <p style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>{invoicePo.item}</p>
              </div>
              <button onClick={() => setInvoicePo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                <X size={22} />
              </button>
            </div>

            {/* PO Reference Banner */}
            <div style={{ background: "rgba(248,180,0,0.08)", border: "1px solid rgba(248,180,0,0.3)", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>PO Reference: <strong style={{ color: "#111" }}>{invoicePo.id}</strong></span>
              <span style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Buyer: <strong style={{ color: "#111" }}>{invoicePo.buyer}</strong></span>
              <span style={{ fontSize: "13px", color: "#059669", fontWeight: "800" }}>PO Value: {invoicePo.totalAmount}</span>
            </div>

            {/* Invoice Details Section */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <DollarSign size={15} color="#f8b400" /> Invoice Financial Details
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Invoice Amount (USD) *</label>
                  <input
                    type="number"
                    className="vnd-form-input"
                    value={invoiceForm.invoiceAmount}
                    onChange={(e) => handleInvoiceFormChange("invoiceAmount", e.target.value)}
                    placeholder="e.g. 36990"
                    style={{ height: "40px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Payment Due Date *</label>
                  <input
                    type="date"
                    className="vnd-form-input"
                    value={invoiceForm.dueDate}
                    onChange={(e) => handleInvoiceFormChange("dueDate", e.target.value)}
                    style={{ height: "40px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Payment Terms</label>
                  <select
                    className="vnd-form-select"
                    value={invoiceForm.paymentTerms}
                    onChange={(e) => handleInvoiceFormChange("paymentTerms", e.target.value)}
                    style={{ height: "40px" }}
                  >
                    <option>Net 15 Days</option>
                    <option>Net 30 Days</option>
                    <option>Net 45 Days</option>
                    <option>Net 60 Days</option>
                    <option>Immediate</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Account Holder Name *</label>
                  <input
                    type="text"
                    className="vnd-form-input"
                    value={invoiceForm.accountHolder}
                    onChange={(e) => handleInvoiceFormChange("accountHolder", e.target.value)}
                    placeholder="e.g. Apple Business Direct"
                    style={{ height: "40px" }}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={15} color="#f8b400" /> Bank & Payment Details
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Bank Name *</label>
                  <input
                    type="text"
                    className="vnd-form-input"
                    value={invoiceForm.bankName}
                    onChange={(e) => handleInvoiceFormChange("bankName", e.target.value)}
                    placeholder="e.g. JPMorgan Chase"
                    style={{ height: "40px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Account Number *</label>
                  <input
                    type="text"
                    className="vnd-form-input"
                    value={invoiceForm.accountNumber}
                    onChange={(e) => handleInvoiceFormChange("accountNumber", e.target.value)}
                    placeholder="e.g. ****4491"
                    style={{ height: "40px" }}
                  />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>IFSC / SWIFT Code</label>
                  <input
                    type="text"
                    className="vnd-form-input"
                    value={invoiceForm.ifscSwift}
                    onChange={(e) => handleInvoiceFormChange("ifscSwift", e.target.value)}
                    placeholder="e.g. CHASUS33 or IFSC Code"
                    style={{ height: "40px" }}
                  />
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "14px", color: "#111", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Upload size={15} color="#f8b400" /> Attachments
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Invoice PDF Upload */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>
                    Upload Invoice PDF
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      border: "2px dashed #d9d9d9",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: invoiceForm.invoicePdfName ? "rgba(5,150,105,0.06)" : "#fafafa",
                      borderColor: invoiceForm.invoicePdfName ? "#059669" : "#d9d9d9",
                      transition: "all 0.2s",
                    }}
                  >
                    <FileText size={18} color={invoiceForm.invoicePdfName ? "#059669" : "#f8b400"} />
                    <span style={{ fontSize: "12px", color: invoiceForm.invoicePdfName ? "#059669" : "#666", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {invoiceForm.invoicePdfName || "Click to upload PDF"}
                    </span>
                    <input type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleFileInput("invoicePdfName", e)} />
                  </label>
                </div>

                {/* QR Code Upload */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>
                    Upload Payment QR Code
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      border: "2px dashed #d9d9d9",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: invoiceForm.qrCodeName ? "rgba(5,150,105,0.06)" : "#fafafa",
                      borderColor: invoiceForm.qrCodeName ? "#059669" : "#d9d9d9",
                      transition: "all 0.2s",
                    }}
                  >
                    <QrCode size={18} color={invoiceForm.qrCodeName ? "#059669" : "#f8b400"} />
                    <span style={{ fontSize: "12px", color: invoiceForm.qrCodeName ? "#059669" : "#666", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {invoiceForm.qrCodeName || "Click to upload QR Image"}
                    </span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileInput("qrCodeName", e)} />
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#555", display: "block", marginBottom: "6px" }}>Invoice Notes / Remarks</label>
              <textarea
                className="vnd-form-input"
                value={invoiceForm.notes}
                onChange={(e) => handleInvoiceFormChange("notes", e.target.value)}
                rows={3}
                style={{ resize: "vertical", padding: "10px 14px", lineHeight: "1.5" }}
                placeholder="Add any additional notes for the finance team..."
              />
            </div>

            {/* Destination Info */}
            <div style={{ background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#0369a1", fontWeight: "700", marginBottom: "4px" }}>📤 This invoice will be automatically sent to:</p>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "#0369a1" }}>✅ <strong>Procurement Manager Portal</strong> — Invoice Review Queue</span>
                <span style={{ fontSize: "12px", color: "#0369a1" }}>✅ <strong>Finance Portal</strong> — Payment Approvals Section</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 20px" }}
                onClick={() => setInvoicePo(null)}
              >
                Cancel
              </button>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: submittingInvoice ? "#999" : "linear-gradient(135deg, #f8b400, #d97706)", color: "#fff", padding: "10px 28px", fontWeight: "800", fontSize: "14px" }}
                onClick={handleSubmitInvoice}
                disabled={submittingInvoice}
              >
                <Send size={15} /> {submittingInvoice ? "Submitting..." : "Generate & Confirm Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPurchaseOrders;
