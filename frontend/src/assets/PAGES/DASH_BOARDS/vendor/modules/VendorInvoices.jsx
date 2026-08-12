import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  PlusCircle,
  Search,
  Download,
  Eye,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  Upload,
  Clock,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  epsEventBus,
  createVendorInvoice,
  getStoredVendorInvoices,
  fetchPurchaseOrders
} from "../../../../../services/epsApiService";

const initialInvoices = [
  {
    id: "INV-2026-9901",
    poId: "PO-2026-4401",
    buyer: "Enterprise Global Inc.",
    amount: 36990.00,
    taxAmount: 3329.10,
    totalAmount: 40319.10,
    status: "Pending", // Pending, Approved, Paid
    date: "2026-07-26",
    dueDate: "2026-08-25",
    file: "INV_2026_9901_Apple.pdf",
    notes: "IT hardware supply terms: Net 30 standard billing terms.",
    trackingTimeline: [
      { step: "Invoice Submitted", date: "2026-07-26 09:30 AM", status: "completed" },
      { step: "Under Audit Review", date: "2026-07-26 11:15 AM", status: "completed" },
      { step: "Payment Processing", date: "Pending", status: "active" },
      { step: "Disbursement", date: "Pending", status: "pending" },
    ]
  },
  {
    id: "INV-2026-9850",
    poId: "PO-2026-4350",
    buyer: "Enterprise Global Inc.",
    amount: 7995.00,
    taxAmount: 719.55,
    totalAmount: 8714.55,
    status: "Paid", // Pending, Approved, Paid
    date: "2026-07-12",
    dueDate: "2026-07-25",
    file: "INV_2026_9850_Apple.pdf",
    notes: "Monitors supply: Net 15 billing terms.",
    trackingTimeline: [
      { step: "Invoice Submitted", date: "2026-07-12 10:00 AM", status: "completed" },
      { step: "Under Audit Review", date: "2026-07-13 02:30 PM", status: "completed" },
      { step: "Invoice Approved", date: "2026-07-14 09:00 AM", status: "completed" },
      { step: "Paid & Settled", date: "2026-07-25 11:00 AM", status: "completed" },
    ]
  },
  {
    id: "INV-2026-9899",
    poId: "PO-2026-4412",
    buyer: "Enterprise Tech Labs",
    amount: 54200.00,
    taxAmount: 4878.00,
    totalAmount: 59078.00,
    status: "Approved", // Pending, Approved, Paid
    date: "2026-07-20",
    dueDate: "2026-08-20",
    file: "INV_2026_9899_Dell.pdf",
    notes: "Server equipment supply: Net 30 standard billing terms.",
    trackingTimeline: [
      { step: "Invoice Submitted", date: "2026-07-20 03:00 PM", status: "completed" },
      { step: "Under Audit Review", date: "2026-07-21 10:45 AM", status: "completed" },
      { step: "Invoice Approved", date: "2026-07-22 04:15 PM", status: "completed" },
      { step: "Payment Processing", date: "Pending", status: "active" },
    ]
  }
];

const safeNum = (val, fallback = 0) => {
  if (!val) return fallback;
  const parsed = parseFloat(val.toString().replace(/[^0-9.]/g, ""));
  return isNaN(parsed) ? fallback : parsed;
};

const formatCurrency = (val) => {
  const num = safeNum(val);
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const VendorInvoices = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All, Pending, Approved, Paid
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Create Form State
  const [formPoId, setFormPoId] = useState("PO-2026-4401");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [sendToExecAndManager, setSendToExecAndManager] = useState(true);
  
  const [toastMsg, setToastMsg] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const loadLiveInvoices = () => {
    const saved = getStoredVendorInvoices();
    const combined = [...(saved || []), ...initialInvoices];
    const unique = Array.from(new Map(combined.map(i => [i.id, i])).values());
    setInvoices(unique);
  };

  useEffect(() => {
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED") {
        loadLiveInvoices();
      }
    });
    return unsub;
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      const pos = await fetchPurchaseOrders();
      setPurchaseOrders(pos || []);
      if (pos && pos.length > 0) {
        if (!pos.some(p => p.id === formPoId)) {
          setFormPoId(pos[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading purchase orders", e);
    }
  };

  useEffect(() => {
    loadLiveInvoices();
    loadPurchaseOrders();
    const unsub = epsEventBus.subscribe(() => {
      loadLiveInvoices();
      loadPurchaseOrders();
    });
    return unsub;
  }, []);

  // Auto-fill amount based on selected PO
  useEffect(() => {
    if (formPoId && purchaseOrders.length > 0) {
      const selectedPo = purchaseOrders.find(p => p.id === formPoId);
      if (selectedPo && selectedPo.totalAmount) {
        const cleanAmount = selectedPo.totalAmount.replace(/[^0-9.]/g, "");
        setFormAmount(cleanAmount);
      }
    }
  }, [formPoId, purchaseOrders]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount || 0);
    const tax = parseFloat((parsedAmount * 0.09).toFixed(2));
    const total = parseFloat((parsedAmount + tax).toFixed(2));
    const createdId = `INV-2026-${Math.floor(9910 + Math.random() * 80)}`;
    const fileName = uploadedFileName || `inv_${createdId.toLowerCase().replace(/-/g, "_")}_certified.pdf`;

    const selectedPo = purchaseOrders.find(p => p.id === formPoId);
    const buyerName = selectedPo ? selectedPo.buyer : "Enterprise Global Inc.";

    const newInvoice = await createVendorInvoice({
      id: createdId,
      poId: formPoId,
      buyer: buyerName,
      amount: `$${parsedAmount.toLocaleString()}`,
      vendor: "Apple Business Direct",
      file: fileName,
      notes: formNotes || "Commercial Invoice generated & transmitted."
    });

    if (sendToExecAndManager) {
      epsEventBus.publish({
        type: "INVOICE_SENT_TO_EXEC_AND_MANAGER",
        invoice: newInvoice,
        recipient: "Procurement Executive & Procurement Manager"
      });
    }

    loadLiveInvoices();
    setShowUploadModal(false);
    triggerToast(`✓ Commercial Invoice ${createdId} generated & PDF (${fileName}) transmitted to Procurement Executive & Procurement Manager!`);
    
    // Clear Form
    setFormAmount("");
    setFormDueDate("");
    setFormNotes("");
    setUploadedFileName("");
  };

  const handleDownloadInvoice = (inv) => {
    triggerToast(`Downloading PDF document: ${inv.file}`);
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      (inv.id || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (inv.poId || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (inv.buyer || "").toLowerCase().includes((searchTerm || "").toLowerCase());
      
    const matchesStatus = filterStatus === "All" || inv.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vnd-invoices-container" style={{ padding: "20px" }}>
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
            <FileCheck2 color="#f8b400" size={28} /> Commercial Invoices & Billing
          </h1>
          <p className="vnd-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Generate new invoices against active Purchase Orders, track approval statuses, and download receipts.
          </p>
        </div>

        <button
          className="vnd-btn-primary-sm"
          onClick={() => setShowUploadModal(true)}
        >
          <PlusCircle size={16} /> Create Invoice
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "20px" }}>
        {["All", "Pending", "Approved", "Paid"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              background: "none",
              border: "none",
              padding: "10px 16px",
              fontSize: "15px",
              fontWeight: filterStatus === status ? "700" : "500",
              color: filterStatus === status ? "#d97706" : "#666",
              borderBottom: filterStatus === status ? "3px solid #f8b400" : "3px solid transparent",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {status === "All" ? "All Invoices" : `${status} Invoices`} ({status === "All" ? invoices.length : invoices.filter(i => i.status === status).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="vnd-card" style={{ marginBottom: "24px", padding: "18px 24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search
            size={16}
            color="#666666"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search Invoice Code or PO Reference..."
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
                <th>Invoice Code</th>
                <th>PO Reference</th>
                <th>Enterprise Buyer</th>
                <th>Tax Included</th>
                <th>Total Bill Value</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Date Submitted</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                    No invoices found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{inv.id}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{inv.poId}</td>
                    <td style={{ fontWeight: "700", color: "#111111" }}>{inv.buyer}</td>
                    <td style={{ color: "#555555", fontSize: "13px" }}>{formatCurrency(inv.taxAmount || safeNum(inv.amount) * 0.09)}</td>
                    <td style={{ fontWeight: "800", color: "#059669" }}>{formatCurrency(inv.totalAmount || safeNum(inv.amount) * 1.09)}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background:
                            inv.status === "Paid"
                              ? "rgba(5, 150, 105, 0.12)"
                              : inv.status === "Approved"
                              ? "rgba(59, 130, 246, 0.12)"
                              : "rgba(217, 119, 6, 0.12)",
                          color:
                            inv.status === "Paid"
                              ? "#059669"
                              : inv.status === "Approved"
                              ? "#3b82f6"
                              : "#d97706",
                          border: `1px solid ${
                            inv.status === "Paid"
                              ? "rgba(5, 150, 105, 0.3)"
                              : inv.status === "Approved"
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(217, 119, 6, 0.3)"
                          }`,
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ color: "#dc2626", fontWeight: "700", fontSize: "13px" }}>
                      {inv.dueDate}
                    </td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{inv.date}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          className="vnd-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                          onClick={() => setSelectedInvoice(inv)}
                          title="View Invoice Tracking Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="vnd-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#d97706" }}
                          onClick={() => handleDownloadInvoice(inv)}
                          title="Download Invoice"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / UPLOAD INVOICE MODAL */}
      {showUploadModal && (
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
              maxWidth: "540px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
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
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>
                Generate & Submit Invoice
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: "24px" }}>
              <div className="vnd-form-group">
                <label className="vnd-form-label">Select Associated PO Reference</label>
                <select
                  value={formPoId}
                  onChange={(e) => setFormPoId(e.target.value)}
                  className="vnd-form-select"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.id} - {po.item} ({po.totalAmount})
                    </option>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <option value="">No active Purchase Orders found</option>
                  )}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="vnd-form-group">
                  <label className="vnd-form-label">Pre-Tax Amount ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="vnd-form-input"
                    placeholder="e.g. 36990.00"
                  />
                </div>

                <div className="vnd-form-group">
                  <label className="vnd-form-label">Payment Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="vnd-form-input"
                  />
                </div>
              </div>

              {/* Tax & Total Auto Calculation Preview */}
              {formAmount && (
                <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid rgba(5,150,105,0.15)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666" }}>
                    <span>Estimated 9% Standard GST:</span>
                    <span>${(parseFloat(formAmount) * 0.09).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "700", color: "#059669", marginTop: "4px", borderTop: "1px dashed rgba(5,150,105,0.3)", paddingTop: "4px" }}>
                    <span>Total Billable Amount:</span>
                    <span>${(parseFloat(formAmount) * 1.09).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</span>
                  </div>
                </div>
              )}

              <div className="vnd-form-group">
                <label className="vnd-form-label">Invoice Memo / Billing Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Net 30 billing terms - Bank Account: standard routing"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="vnd-form-input"
                />
              </div>

              <div className="vnd-form-group">
                <label className="vnd-form-label">Upload Certified Tax Invoice PDF</label>
                <div
                  style={{
                    border: "2px dashed #f8b400",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(248,180,0,0.02)"
                  }}
                  onClick={() => {
                    const name = prompt("Select file path / name to upload:", "TAX_INVOICE_SUBMIT.pdf");
                    if (name) setUploadedFileName(name);
                  }}
                >
                  <Upload size={22} color="#d97706" style={{ margin: "0 auto 6px" }} />
                  <p style={{ fontSize: "13px", color: "#333", fontWeight: "600", margin: 0 }}>
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : "Click to mock upload certified tax document"}
                  </p>
                </div>
              </div>

              <div style={{ background: "#f0fdf4", padding: "12px 14px", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#059669", fontWeight: "700", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={sendToExecAndManager}
                    onChange={(e) => setSendToExecAndManager(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#059669" }}
                  />
                  Send Invoice PDF & notification to Procurement Executive & Procurement Manager
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px", borderTop: "1px solid #f2f2f2", paddingTop: "16px" }}>
                <button
                  type="button"
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="vnd-btn-primary-sm" style={{ background: "#059669", color: "#fff", border: "none", fontWeight: "800" }}>
                  <FileText size={15} /> Generate & Send Invoice PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE DETAILS & STATUS TRACKING MODAL */}
      {selectedInvoice && (
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
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>INVOICE AUDIT & DETAILS</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
                  {selectedInvoice.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Meta details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid #eee", paddingBottom: "14px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Associated Purchase Order</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", marginTop: "2px" }}>{selectedInvoice.poId}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Enterprise Buyer</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", marginTop: "2px" }}>{selectedInvoice.buyer}</p>
                  </div>
                </div>

                {/* Price Summary */}
                <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Financial Summary</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "6px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Base Amount</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{formatCurrency(selectedInvoice.amount)}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>GST (9%)</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{formatCurrency(selectedInvoice.taxAmount || safeNum(selectedInvoice.amount) * 0.09)}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Total Bill Value</span>
                      <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669" }}>{formatCurrency(selectedInvoice.totalAmount || safeNum(selectedInvoice.amount) * 1.09)}</p>
                    </div>
                  </div>
                </div>

                {/* Dates & Notes */}
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "10px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Issue Date</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{selectedInvoice.date}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#777" }}>Payment Due Date</span>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626" }}>{selectedInvoice.dueDate}</p>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Billing Notes</span>
                    <p style={{ fontSize: "13px", color: "#555", marginTop: "2px", fontStyle: "italic" }}>{selectedInvoice.notes}</p>
                  </div>
                </div>

                {/* Invoice Status Tracking Timeline */}
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "12px" }}>
                    Invoice Status Tracking Timeline
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                    {(() => {
                      const timeline = selectedInvoice.trackingTimeline || [
                        { step: "Invoice Submitted", date: selectedInvoice.date || "Today", status: "completed" },
                        { step: "Under Audit Review", date: "Pending", status: "active" },
                        { step: "Payment Processing", date: "Pending", status: "pending" },
                      ];
                      return timeline.map((step, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "flex-start", position: "relative" }}>
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background:
                                step.status === "completed"
                                  ? "#059669"
                                  : step.status === "active"
                                  ? "#f8b400"
                                  : "#e2e8f0",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: "800",
                              zIndex: 2,
                            }}
                          >
                            {step.status === "completed" ? "✓" : idx + 1}
                          </div>
                          
                          {/* Connecting Line */}
                          {idx < timeline.length - 1 && (
                            <div
                              style={{
                                position: "absolute",
                                left: "9px",
                                top: "20px",
                                bottom: "-12px",
                                width: "2px",
                                background: "#e2e8f0",
                                zIndex: 1,
                              }}
                            />
                          )}

                          <div>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>{step.step}</p>
                            <span style={{ fontSize: "11px", color: "#666" }}>{step.date}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Uploaded Document Info */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid rgba(5,150,105,0.15)", padding: "12px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} color="#059669" />
                    <div>
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: "700" }}>Uploaded Invoice Document</span>
                      <p style={{ fontSize: "13px", color: "#333", margin: 0 }}>{selectedInvoice.file}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#059669" }}
                    title="Download Submitted Invoice"
                  >
                    <Download size={18} />
                  </button>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="vnd-btn-primary-sm"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                <Download size={15} /> Download PDF
              </button>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedInvoice(null)}
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

export default VendorInvoices;
