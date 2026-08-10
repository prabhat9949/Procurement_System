import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  Download,
  Eye,
  CheckCircle2,
  DollarSign,
  Check,
  X,
  XCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  epsEventBus,
  getStoredVendorInvoices,
  saveStoredVendorInvoices,
} from "../../../../../services/epsApiService";

const initialInvoices = [
  {
    id: "INV-2026-9901",
    poId: "PO-2026-4401",
    vendor: "Apple Business Direct",
    vendorAddress: "One Apple Park Way, Cupertino, CA",
    baseAmount: 31347.46,
    taxRate: "18% GST",
    taxAmount: 5642.54,
    totalAmount: 36990.00,
    status: "Pending Verification",
    date: "2026-07-26",
    dueDate: "2026-08-25",
  },
  {
    id: "INV-2026-9912",
    poId: "PO-2026-4412",
    vendor: "Dell Technologies",
    vendorAddress: "One Dell Way, Round Rock, TX",
    baseAmount: 45932.20,
    taxRate: "18% GST",
    taxAmount: 8267.80,
    totalAmount: 54200.00,
    status: "Pending Verification",
    date: "2026-07-26",
    dueDate: "2026-09-10",
  },
  {
    id: "INV-2026-9850",
    poId: "PO-2026-4350",
    vendor: "Apple Business Direct",
    vendorAddress: "One Apple Park Way, Cupertino, CA",
    baseAmount: 6775.42,
    taxRate: "18% GST",
    taxAmount: 1219.58,
    totalAmount: 7995.00,
    status: "Approved",
    date: "2026-07-12",
    dueDate: "2026-07-25",
  },
  {
    id: "INV-2026-9810",
    poId: "PO-2026-4250",
    vendor: "Custom Office Designs",
    vendorAddress: "Industrial Phase II, Chennai, TN",
    baseAmount: 12881.36,
    taxRate: "18% GST",
    taxAmount: 2318.64,
    totalAmount: 15200.00,
    status: "Rejected",
    date: "2026-07-10",
    dueDate: "2026-07-22",
    rejectionReason: "Line items description mismatch with delivery checklist."
  }
];

const FinanceInvoiceMgmt = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Pending Verification, Approved, Rejected
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Verification Checklist State
  const [chkQty, setChkQty] = useState(false);
  const [chkPrice, setChkPrice] = useState(false);
  const [chkTax, setChkTax] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadInvoices = () => {
    const saved = getStoredVendorInvoices();
    const mappedSaved = (saved || []).map((inv) => {
      const amt = typeof inv.amount === "number" ? inv.amount : parseFloat((inv.amount || "0").toString().replace(/[^0-9.]/g, "")) || 0;
      return {
        ...inv,
        baseAmount: inv.baseAmount || amt,
        taxRate: inv.taxRate || "18% GST",
        taxAmount: inv.taxAmount || amt * 0.18,
        totalAmount: inv.totalAmount || amt * 1.18,
        status: inv.status || "Pending Verification"
      };
    });
    const combined = [...mappedSaved, ...initialInvoices];
    const unique = Array.from(new Map(combined.map(i => [i.id, i])).values());
    setInvoices(unique);
  };

  useEffect(() => {
    loadInvoices();
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED" || e.type === "INVOICE_SUBMITTED" || e.type === "INVOICES_UPDATED") {
        loadInvoices();
      }
    });
    return unsub;
  }, []);

  const handleOpenVerify = (inv) => {
    setSelectedInvoice(inv);
    setChkQty(false);
    setChkPrice(false);
    setChkTax(false);
    setRejectReasonInput("");
  };

  const handleApproveInvoice = () => {
    if (!chkQty || !chkPrice || !chkTax) {
      triggerToast("You must verify all check items in the matching checklist before approval!");
      return;
    }
    const updated = invoices.map((i) =>
      i.id === selectedInvoice.id ? { ...i, status: "Approved" } : i
    );
    setInvoices(updated);
    saveStoredVendorInvoices(updated);
    setSelectedInvoice(null);
    triggerToast(`Invoice ${selectedInvoice.id} approved and routed for payment release!`);
  };

  const handleRejectInvoice = () => {
    if (!rejectReasonInput.trim()) {
      triggerToast("Please provide a rejection reason comments.");
      return;
    }
    const updated = invoices.map((i) =>
      i.id === selectedInvoice.id
        ? { ...i, status: "Rejected", rejectionReason: rejectReasonInput }
        : i
    );
    setInvoices(updated);
    saveStoredVendorInvoices(updated);
    setSelectedInvoice(null);
    triggerToast(`Invoice ${selectedInvoice.id} rejected.`);
  };

  const handleDownloadInvoice = (inv) => {
    triggerToast(`Downloading PDF document for Invoice ID: ${inv.id}`);
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.poId.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "Pending Verification") {
      matchesStatus = i.status === "Pending Verification" || i.status === "Pending Finance Approval" || i.status === "Pending Auditor Verification";
    } else if (statusFilter !== "All") {
      matchesStatus = i.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fin-invoice-mgmt-container" style={{ padding: "20px" }}>
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
      <div className="fin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FileCheck2 color="#f8b400" size={28} /> Accounts Payable Invoice Verification Center
          </h1>
          <p className="fin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit tax invoices received from vendors, check physical matches against Purchase Orders, and clear them for payment release.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="fin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", width: "320px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search Invoice ID, Vendor, PO ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d9d9d9",
              fontSize: "14px",
              background: "#fff",
            }}
          >
            <option value="All">All Invoices</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="fin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Invoice Code</th>
                <th>PO Reference</th>
                <th>Supplier / Vendor</th>
                <th>Base Amount</th>
                <th>Tax Details</th>
                <th>Total Billable</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: "800", color: "#d97706" }}>{inv.id}</td>
                  <td style={{ color: "#555" }}>{inv.poId}</td>
                  <td style={{ fontWeight: "700" }}>{inv.vendor}</td>
                  <td style={{ color: "#666" }}>${inv.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ color: "#666", fontSize: "13px" }}>
                    {inv.taxRate} (${inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                  </td>
                  <td style={{ fontWeight: "800", color: "#059669" }}>
                    ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: "#dc2626", fontWeight: "700" }}>{inv.dueDate}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background:
                          inv.status === "Approved"
                            ? "rgba(5, 150, 105, 0.12)"
                            : inv.status === "Rejected"
                            ? "rgba(220, 38, 38, 0.12)"
                            : "rgba(217, 119, 6, 0.12)",
                        color:
                          inv.status === "Approved"
                            ? "#059669"
                            : inv.status === "Rejected"
                            ? "#dc2626"
                            : "#d97706",
                        border: `1px solid ${
                          inv.status === "Approved"
                            ? "rgba(5, 150, 105, 0.3)"
                            : inv.status === "Rejected"
                            ? "rgba(220, 38, 38, 0.3)"
                            : "rgba(217, 119, 6, 0.3)"
                        }`,
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        className="fin-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => handleDownloadInvoice(inv)}
                        title="Download Invoice PDF"
                      >
                        <Download size={14} />
                      </button>

                      {inv.status === "Pending Verification" || inv.status === "Pending Finance Approval" ? (
                        <button
                          className="fin-btn-approve"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleOpenVerify(inv)}
                        >
                          Verify & Match
                        </button>
                      ) : inv.status === "Pending Auditor Verification" ? (
                        <span style={{ fontSize: "12.5px", color: "#d97706", fontWeight: "600", fontStyle: "italic", alignSelf: "center" }}>
                          Awaiting Audit Clearance
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#059669", fontWeight: "700", alignSelf: "center" }}>
                          {inv.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
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
              maxWidth: "560px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>3-WAY MATCH VERIFICATION AUDIT</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Audit Invoice: {selectedInvoice.id}
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
            <div style={{ padding: "24px" }}>
              {/* Financial values details */}
              <div style={{ background: "#f8f9fb", border: "1px solid #eee", padding: "14px", borderRadius: "8px", marginBottom: "20px", fontSize: "13.5px" }}>
                <strong>Vendor Name:</strong> {selectedInvoice.vendor} <br />
                <strong>Mailing Address:</strong> {selectedInvoice.vendorAddress} <br />
                <strong>Base Billable:</strong> ${selectedInvoice.baseAmount.toLocaleString()} • <strong>Tax:</strong> {selectedInvoice.taxRate} (${selectedInvoice.taxAmount.toLocaleString()}) <br />
                <strong>Total Amount:</strong> <strong style={{ color: "#059669" }}>${selectedInvoice.totalAmount.toLocaleString()}</strong>
              </div>

              {/* Checklist */}
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "12px" }}>Invoice Validation Checklist</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkQty}
                    onChange={(e) => setChkQty(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Quantities delivered match Purchase Order & Goods Received Slip
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkPrice}
                    onChange={(e) => setChkPrice(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Unit prices match initial contract agreements
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={chkTax}
                    onChange={(e) => setChkTax(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Tax registration details (GST No/ID) verified and complete
                </label>
              </div>

              {/* Reject box if discrepancy found */}
              <div className="fin-form-group" style={{ marginBottom: "20px" }}>
                <label className="fin-form-label">Rejection Remarks (Required only for Reject action)</label>
                <input
                  type="text"
                  placeholder="e.g. GST registration incorrect / item counts discrepancy..."
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  className="fin-form-input"
                />
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={handleRejectInvoice}
                  className="fin-btn-reject"
                  style={{ padding: "10px 18px" }}
                >
                  Reject Invoice
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveInvoice}
                    className="fin-btn-approve"
                    style={{ padding: "10px 18px" }}
                  >
                    Verify & Approve
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceInvoiceMgmt;
