import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  X,
  MessageSquare,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  History,
  QrCode,
  Upload,
  Download,
} from "lucide-react";
import {
  epsEventBus,
  getStoredPaymentRequests,
  saveStoredPaymentRequests,
  saveStoredVendorInvoices,
  getStoredVendorInvoices,
  advanceRequestStep,
} from "../../../../../services/epsApiService";

const initialPendingPayments = [
  {
    payId: "PAY-2026-901",
    poId: "PO-2026-4401",
    invId: "INV-2026-9901",
    vendor: "Apple Business Direct",
    item: "MacBook Pro M3 Max 64GB Workstations (x10)",
    amount: 36990.00,
    terms: "Net 30 Days",
    dueDate: "2026-08-25",
    status: "Awaiting CFO Sign-off",
    bankDetails: "JPMorgan Chase • Acct Ending #4491",
  },
  {
    payId: "PAY-2026-904",
    poId: "PO-2026-4412",
    invId: "INV-2026-9912",
    vendor: "Dell Technologies",
    item: "PowerEdge R760 Rack Servers (x4)",
    amount: 54200.00,
    terms: "Net 45 Days",
    dueDate: "2026-09-10",
    status: "Awaiting CFO Sign-off",
    bankDetails: "Bank of America • Acct Ending #8802",
  },
  {
    payId: "PAY-2026-908",
    poId: "PO-2026-4389",
    invId: "INV-2026-9877",
    vendor: "HP Inc. Enterprise",
    item: "LaserJet Pro Enterprise MFP M528dn (x5)",
    amount: 4750.00,
    terms: "Net 30 Days",
    dueDate: "2026-08-15",
    status: "Awaiting CFO Sign-off",
    bankDetails: "Wells Fargo • Acct Ending #1109",
  },
];

const initialApprovedPayments = [
  {
    payId: "PAY-2026-880",
    poId: "PO-2026-4350",
    invId: "INV-2026-9799",
    vendor: "Apple Business Direct",
    item: "Studio Display 27'' Monitors (x5)",
    amount: 7995.00,
    terms: "Net 30 Days",
    dueDate: "2026-07-20",
    status: "Approved & Wired",
    bankDetails: "JPMorgan Chase • Acct Ending #4491",
    actionDate: "2026-07-24",
  },
  {
    payId: "PAY-2026-875",
    poId: "PO-2026-4299",
    invId: "INV-2026-9721",
    vendor: "Logitech Logistics",
    item: "MX Master 3S Wireless Mice (x50)",
    amount: 4995.00,
    terms: "Net 30 Days",
    dueDate: "2026-07-15",
    status: "Approved & Wired",
    bankDetails: "Citibank N.A. • Acct Ending #5521",
    actionDate: "2026-07-18",
  },
];

const initialRejectedPayments = [
  {
    payId: "PAY-2026-870",
    poId: "PO-2026-4250",
    invId: "INV-2026-9602",
    vendor: "Custom Office Designs",
    item: "Ergonomic Office Desks (x15)",
    amount: 15200.00,
    terms: "Net 30 Days",
    dueDate: "2026-07-10",
    status: "Rejected",
    bankDetails: "Chase Treasury • Acct Ending #9011",
    actionDate: "2026-07-12",
    reason: "Line items mismatch with PO budget limits.",
  }
];

const PaymentApprovals = ({ onNavigate }) => {
  const [pending, setPending] = useState(() => {
    const saved = getStoredPaymentRequests();
    // Merge saved with initial, avoid duplicates
    const combined = [...saved, ...initialPendingPayments];
    return Array.from(new Map(combined.map(p => [p.payId, p])).values())
      .filter(p => p.status === "Awaiting CFO Sign-off");
  });
  const [approved, setApproved] = useState(() => {
    const saved = getStoredPaymentRequests();
    const savedApproved = saved.filter(p => p.status === "Approved & Wired");
    return Array.from(new Map([...savedApproved, ...initialApprovedPayments].map(p => [p.payId, p])).values());
  });
  const [rejected, setRejected] = useState(() => {
    const saved = getStoredPaymentRequests();
    const savedRejected = saved.filter(p => p.status === "Rejected");
    return Array.from(new Map([...savedRejected, ...initialRejectedPayments].map(p => [p.payId, p])).values());
  });

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [targetPay, setTargetPay] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("Discrepancy in Line Item Pricing");
  const [rejectionComment, setRejectionComment] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Subscribe to payment request events (from GRN verification) and invoice events
  useEffect(() => {
    const unsub = epsEventBus.subscribe((event) => {
      if (event.type === "PAYMENT_REQUEST_CREATED" && event.data) {
        const newPay = event.data;
        setPending((prev) => {
          if (prev.some((p) => p.invId === newPay.invId || p.payId === newPay.payId)) return prev;
          return [newPay, ...prev];
        });
      }
      if (event.type === "PAYMENT_REQUESTS_UPDATED" && event.data) {
        const allReqs = event.data;
        setPending(allReqs.filter(p => p.status === "Awaiting CFO Sign-off"));
        setApproved(prev => {
          const fresh = allReqs.filter(p => p.status === "Approved & Wired");
          return Array.from(new Map([...fresh, ...prev].map(p => [p.payId, p])).values());
        });
      }
      if (event.type === "INVOICE_SUBMITTED" && event.data) {
        const inv = event.data;
        const newPay = {
          payId: `PAY-${inv.id}`,
          poId: inv.poId || "N/A",
          invId: inv.id,
          vendor: inv.vendor || "Vendor",
          item: inv.item || "Procurement Item",
          amount: inv.totalAmount || inv.amount || 0,
          terms: inv.paymentTerms || "Net 30 Days",
          dueDate: inv.dueDate || "2026-09-01",
          status: "Awaiting CFO Sign-off",
          bankDetails: inv.bankDetails || "Bank details attached",
          submittedAt: new Date().toLocaleString(),
        };
        setPending((prev) => {
          if (prev.some((p) => p.invId === newPay.invId)) return prev;
          return [newPay, ...prev];
        });
      }
    });
    return unsub;
  }, []);

  const persistAll = (pendingList, approvedList, rejectedList) => {
    const all = [
      ...pendingList,
      ...approvedList,
      ...rejectedList,
    ];
    saveStoredPaymentRequests(all);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (filteredItems) => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.payId));
    }
  };

  const handleApproveConfirm = () => {
    if (!targetPay) return;
    const verified = {
      ...targetPay,
      status: "Approved & Wired",
      actionDate: new Date().toISOString().split("T")[0]
    };
    const newApproved = [verified, ...approved];
    const newPending = pending.filter((p) => p.payId !== targetPay.payId);
    setApproved(newApproved);
    setPending(newPending);
    persistAll(newPending, newApproved, rejected);

    // Advance tracking to Step 7 — Finance Approval & Invoice Match
    if (targetPay.poId && targetPay.poId !== "N/A") {
      advanceRequestStep(targetPay.poId, 7);
    }

    // Update invoice status to "Finance Approved" in global store
    const invoices = getStoredVendorInvoices();
    const updatedInvoices = invoices.map(inv =>
      inv.id === targetPay.invId ? { ...inv, status: "Finance Approved — Pending Payment" } : inv
    );
    saveStoredVendorInvoices(updatedInvoices);
    epsEventBus.publish({ type: "INVOICES_UPDATED", data: updatedInvoices });

    setActiveModal(null);
    triggerToast(`Payment ${targetPay.payId} approved & wire authorized! Tracking step 7 updated.`);
  };

  const handleRejectConfirm = () => {
    if (!targetPay) return;
    const refused = {
      ...targetPay,
      status: "Rejected",
      actionDate: new Date().toISOString().split("T")[0],
      reason: `${rejectionReason}: ${rejectionComment}`
    };
    const newRejected = [refused, ...rejected];
    const newPending = pending.filter((p) => p.payId !== targetPay.payId);
    setRejected(newRejected);
    setPending(newPending);
    persistAll(newPending, approved, newRejected);

    // Update invoice status
    const invoices = getStoredVendorInvoices();
    const updatedInvoices = invoices.map(inv =>
      inv.id === targetPay.invId ? { ...inv, status: "Payment Rejected" } : inv
    );
    saveStoredVendorInvoices(updatedInvoices);
    epsEventBus.publish({ type: "INVOICES_UPDATED", data: updatedInvoices });

    setActiveModal(null);
    triggerToast(`Payment request ${targetPay.payId} rejected.`);
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    const itemsToApprove = pending.filter((p) => selectedIds.includes(p.payId));
    
    const approvedList = itemsToApprove.map((p) => ({
      ...p,
      status: "Approved & Wired",
      actionDate: new Date().toISOString().split("T")[0]
    }));

    const newApproved = [...approvedList, ...approved];
    const newPending = pending.filter((p) => !selectedIds.includes(p.payId));
    setApproved(newApproved);
    setPending(newPending);
    setSelectedIds([]);
    persistAll(newPending, newApproved, rejected);

    // Advance step 7 for each approved item and update invoice statuses
    const invoices = getStoredVendorInvoices();
    let updatedInvoices = [...invoices];
    itemsToApprove.forEach(p => {
      if (p.poId && p.poId !== "N/A") advanceRequestStep(p.poId, 7);
      updatedInvoices = updatedInvoices.map(inv =>
        inv.id === p.invId ? { ...inv, status: "Finance Approved — Pending Payment" } : inv
      );
    });
    saveStoredVendorInvoices(updatedInvoices);
    epsEventBus.publish({ type: "INVOICES_UPDATED", data: updatedInvoices });

    triggerToast(`Bulk authorized wire release for ${itemsToApprove.length} payment requests!`);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    const itemsToReject = pending.filter((p) => selectedIds.includes(p.payId));
    
    const rejectedList = itemsToReject.map((p) => ({
      ...p,
      status: "Rejected",
      actionDate: new Date().toISOString().split("T")[0],
      reason: "Bulk rejected by Treasury Head."
    }));

    const newRejected = [...rejectedList, ...rejected];
    const newPending = pending.filter((p) => !selectedIds.includes(p.payId));
    setRejected(newRejected);
    setPending(newPending);
    setSelectedIds([]);
    persistAll(newPending, approved, newRejected);
    triggerToast(`Bulk rejected ${itemsToReject.length} payment requests.`);
  };

  const filteredPending = pending.filter(
    (p) =>
      p.payId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fin-payment-approvals-container" style={{ padding: "20px" }}>
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
            <CreditCard color="#f8b400" size={28} /> Treasury Payment Approvals
          </h1>
          <p className="fin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Authorise wire releases for corporate procurement expenditures, manage bulk approvals, and audit historical releases.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "pending" ? "700" : "500",
            color: activeTab === "pending" ? "#d97706" : "#666",
            borderBottom: activeTab === "pending" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Pending Payment Requests ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "approved" ? "700" : "500",
            color: activeTab === "approved" ? "#d97706" : "#666",
            borderBottom: activeTab === "approved" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Approved / Disbursed History ({approved.length})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "rejected" ? "700" : "500",
            color: activeTab === "rejected" ? "#d97706" : "#666",
            borderBottom: activeTab === "rejected" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Rejected Payment Requests ({rejected.length})
        </button>
      </div>

      {/* Controls / Search Bar */}
      <div className="fin-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ position: "relative", width: "320px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search vendor, invoice, code..."
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

        {activeTab === "pending" && selectedIds.length > 0 && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#555" }}>
              {selectedIds.length} items selected for bulk action
            </span>
            <button
              onClick={handleBulkApprove}
              className="fin-btn-approve"
              style={{ padding: "8px 16px" }}
            >
              Bulk Approve Wire Release
            </button>
            <button
              onClick={handleBulkReject}
              className="fin-btn-reject"
              style={{ padding: "8px 16px" }}
            >
              Bulk Reject
            </button>
          </div>
        )}
      </div>

      {/* 1. Pending Payments Workspace */}
      {activeTab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredPending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", color: "#666" }}>
              No pending disbursement requests found.
            </div>
          ) : (
            <>
              {/* Select All Checkbox Bar */}
              <div style={{ padding: "0 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredPending.length && filteredPending.length > 0}
                  onChange={() => handleSelectAll(filteredPending)}
                  style={{ width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#666" }}>Select All for Bulk Authorization</span>
              </div>

              {filteredPending.map((pay) => (
                <div key={pay.payId} className="fin-card fin-card-gold-glow" style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(pay.payId)}
                    onChange={() => handleSelectOne(pay.payId)}
                    style={{ width: "16px", height: "16px", marginTop: "4px" }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "800", color: "#d97706", fontSize: "15px" }}>{pay.payId}</span>
                          <span style={{ fontSize: "12px", color: "#666" }}>Invoice Ref: <strong>{pay.invId}</strong></span>
                        </div>
                        <h3 style={{ fontSize: "17px", color: "#111", fontWeight: "700", marginTop: "8px", marginBottom: "4px" }}>
                          {pay.item}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#555" }}>
                          Vendor: <strong>{pay.vendor}</strong> | PO ID: <strong>{pay.poId}</strong>
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", color: "#777", textTransform: "uppercase" }}>Disbursement Amt</span>
                        <p style={{ fontSize: "22px", color: "#059669", fontWeight: "800", margin: 0 }}>
                          ${pay.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "#f8f9fb", padding: "12px 14px", borderRadius: "8px", margin: "14px 0", fontSize: "13px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#777" }}>Bank Settlement Route</span>
                        <p style={{ fontWeight: "600", margin: "2px 0 0" }}>{pay.bankDetails}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#777" }}>Due Date & Payment Terms</span>
                        <p style={{ fontWeight: "700", color: "#dc2626", margin: "2px 0 0" }}>{pay.dueDate} ({pay.terms})</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <button
                        className="fin-btn-primary-sm"
                        style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                        onClick={() => { setTargetPay(pay); setActiveModal("detail"); }}
                      >
                        <Eye size={14} /> View Details
                      </button>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="fin-btn-reject"
                          onClick={() => { setTargetPay(pay); setActiveModal("reject"); }}
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          className="fin-btn-approve"
                          onClick={() => { 
                            epsEventBus.publish({ type: "WIRE_AUTHORIZE_REQUEST", data: pay });
                            if (onNavigate) onNavigate("procurement-payments"); 
                          }}
                        >
                          <Check size={14} /> Authorize Wire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 2. Approved Payments Workspace */}
      {activeTab === "approved" && (
        <div className="fin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>PO Reference</th>
                  <th>Invoice ID</th>
                  <th>Vendor</th>
                  <th>Disbursed Item</th>
                  <th>Authorized Amt</th>
                  <th>Due Date</th>
                  <th>Date Wired</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approved
                  .filter(p => p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || p.payId.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.payId}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{p.payId}</td>
                      <td>{p.poId}</td>
                      <td>{p.invId}</td>
                      <td style={{ fontWeight: "700" }}>{p.vendor}</td>
                      <td>{p.item}</td>
                      <td style={{ fontWeight: "800", color: "#059669" }}>${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>{p.dueDate}</td>
                      <td style={{ fontWeight: "600" }}>{p.actionDate}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#059669", background: "rgba(5, 150, 105, 0.12)", padding: "2px 8px", borderRadius: "12px" }}>
                          {p.completedAt ? "Completed & Fulfilled" : p.status}
                        </span>
                      </td>
                      <td>
                        {!p.completedAt ? (
                          <button
                            onClick={() => {
                              // Mark payment as completed (Step 8)
                              const updated = approved.map(ap =>
                                ap.payId === p.payId ? { ...ap, completedAt: new Date().toISOString().split("T")[0], status: "Completed & Fulfilled" } : ap
                              );
                              setApproved(updated);
                              persistAll(pending, updated, rejected);
                              // Advance tracking step to 8 — Completed & Fulfilled
                              if (p.poId && p.poId !== "N/A") advanceRequestStep(p.poId, 8);
                              // Update invoice status to "Paid & Closed"
                              const invs = getStoredVendorInvoices();
                              const updInvs = invs.map(inv => inv.id === p.invId ? { ...inv, status: "Paid & Closed" } : inv);
                              saveStoredVendorInvoices(updInvs);
                              epsEventBus.publish({ type: "INVOICES_UPDATED", data: updInvs });
                              triggerToast(`✅ Payment ${p.payId} marked as Completed & Fulfilled! Order tracking is now Step 8.`);
                            }}
                            style={{
                              padding: "4px 10px", fontSize: "11px", fontWeight: "700",
                              background: "#059669", color: "#fff", border: "none",
                              borderRadius: "6px", cursor: "pointer"
                            }}
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>✓ Done {p.completedAt}</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 3. Rejected Payments Workspace */}
      {activeTab === "rejected" && (
        <div className="fin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>PO Reference</th>
                  <th>Invoice ID</th>
                  <th>Vendor</th>
                  <th>Item Description</th>
                  <th>Requested Amt</th>
                  <th>Date Actioned</th>
                  <th>Rejection Feedback Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rejected
                  .filter(p => p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || p.payId.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.payId}>
                      <td style={{ fontWeight: "800", color: "#dc2626" }}>{p.payId}</td>
                      <td>{p.poId}</td>
                      <td>{p.invId}</td>
                      <td style={{ fontWeight: "700" }}>{p.vendor}</td>
                      <td>{p.item}</td>
                      <td style={{ fontWeight: "800", color: "#dc2626" }}>${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: "600" }}>{p.actionDate}</td>
                      <td style={{ color: "#666", fontSize: "13px" }}>{p.reason}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626", background: "rgba(220, 38, 38, 0.12)", padding: "2px 8px", borderRadius: "12px" }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {activeModal === "approve" && targetPay && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <ShieldCheck size={28} color="#059669" />
              <div>
                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", margin: 0 }}>
                  Authorize Wire Release: {targetPay.payId}
                </h3>
                <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>
                  Beneficiary: {targetPay.vendor} • Amount: ${targetPay.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="fin-form-group" style={{ marginBottom: "20px" }}>
              <label className="fin-form-label">CFO Treasury Wire Instructions Remarks</label>
              <textarea
                rows="3"
                placeholder="Enter FedWire clearance tags or manual remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="fin-form-textarea"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                className="fin-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
              <button className="fin-btn-approve" onClick={handleApproveConfirm}>
                <Check size={16} /> Release Wire Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {activeModal === "reject" && targetPay && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <XCircle size={28} color="#dc2626" />
              <div>
                <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", margin: 0 }}>
                  Reject Payment Request: {targetPay.payId}
                </h3>
                <p style={{ fontSize: "13px", color: "#666666", margin: 0 }}>
                  Supplier: {targetPay.vendor}
                </p>
              </div>
            </div>

            <div className="fin-form-group">
              <label className="fin-form-label">Primary Rejection Reason *</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="fin-form-select"
              >
                <option value="Discrepancy in Line Item Pricing">Discrepancy in Line Item Pricing</option>
                <option value="Budget Limit Exceeded for Department">Budget Limit Exceeded for Department</option>
                <option value="Tax Invoice Documentation Incomplete">Tax Invoice Documentation Incomplete</option>
              </select>
            </div>

            <div className="fin-form-group" style={{ marginBottom: "20px" }}>
              <label className="fin-form-label">Feedback Explanation Comments *</label>
              <textarea
                rows="3"
                placeholder="Enter feedback comments..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                required
                className="fin-form-textarea"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                className="fin-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
              <button className="fin-btn-reject" onClick={handleRejectConfirm}>
                <X size={16} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {activeModal === "detail" && targetPay && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ececec", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>AUDIT DISBURSEMENT INVOICE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>{targetPay.payId}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
              <div>
                <span style={{ fontSize: "11.5px", color: "#777" }}>Product Item / PO Description</span>
                <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{targetPay.item}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "11.5px", color: "#777" }}>Vendor / Supplier</span>
                  <p style={{ fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{targetPay.vendor}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11.5px", color: "#777" }}>Invoice Amount</span>
                  <p style={{ fontWeight: "800", color: "#059669", margin: "2px 0 0" }}>${targetPay.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#777" }}>PO Code & Invoice ID References</span>
                <p style={{ margin: "2px 0 0" }}>PO: <strong>{targetPay.poId}</strong> | Invoice No: <strong>{targetPay.invId}</strong></p>
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#777" }}>Settlement Routing Details</span>
                <p style={{ margin: "2px 0 0", color: "#555" }}>{targetPay.bankDetails}</p>
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#777" }}>Payment Due Date</span>
                <p style={{ margin: "2px 0 0", color: "#dc2626", fontWeight: "700" }}>{targetPay.dueDate}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #eee", paddingTop: "16px", marginTop: "20px" }}>
              <button
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                onClick={() => setActiveModal(null)}
              >
                Close Audit
              </button>
              <button className="fin-btn-approve" onClick={() => setActiveModal("approve")}>
                Authorize release
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentApprovals;
