import React, { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Download,
  Building,
  Clock,
  Eye,
  X,
  FileText,
  Search,
  ArrowUpRight,
} from "lucide-react";

const initialPayments = [
  {
    txId: "TX-2026-9901",
    invId: "INV-2026-9850",
    poId: "PO-2026-4350",
    buyer: "Enterprise Global Inc.",
    amount: 7995.00,
    method: "FedWire Automated Transfer",
    bankRef: "FW-BOFA-20260725-883019",
    date: "2026-07-25",
    status: "Completed", // Completed, Pending
    notes: "Payment cleared in USD. Reference standard contractual invoices.",
  },
  {
    txId: "TX-2026-9780",
    invId: "INV-2026-9700",
    poId: "PO-2026-4200",
    buyer: "Enterprise Global Inc.",
    amount: 120000.00,
    method: "ACH Corporate Direct",
    bankRef: "ACH-WELLS-20260630-99481",
    date: "2026-06-30",
    status: "Completed",
    notes: "Direct Corporate ACH deposit.",
  },
  {
    txId: "TX-2026-9650",
    invId: "INV-2026-9520",
    poId: "PO-2026-4050",
    buyer: "Enterprise Tech Labs",
    amount: 120505.00,
    method: "FedWire Automated Transfer",
    bankRef: "FW-CHASE-20260528-771638",
    date: "2026-05-28",
    status: "Completed",
    notes: "Final billing settlement PO-2026-4050.",
  },
  {
    txId: "TX-2026-PEND-01",
    invId: "INV-2026-9901",
    poId: "PO-2026-4401",
    buyer: "Enterprise Global Inc.",
    amount: 40319.10,
    method: "FedWire Automated Transfer",
    bankRef: "Awaiting Bank Settlement",
    date: "2026-08-25", // Estimated Date
    status: "Pending",
    notes: "Invoice under Net 30 payment term. Scheduled payment release.",
  },
  {
    txId: "TX-2026-PEND-02",
    invId: "INV-2026-9899",
    poId: "PO-2026-4412",
    buyer: "Enterprise Tech Labs",
    amount: 59078.00,
    method: "ACH Corporate Direct",
    bankRef: "Processing Accounts Payable",
    date: "2026-08-20", // Estimated Date
    status: "Pending",
    notes: "Awaiting corporate controller signature.",
  },
];

import { epsEventBus } from "../../../../../services/epsApiService";

const VendorPayments = () => {
  const [payments, setPayments] = useState(initialPayments);

  useEffect(() => {
    const unsub = epsEventBus.subscribe((event) => {
      if (event.type === "PAYMENT_WIRED") {
        const newPayment = {
          txId: event.data.ref,
          invId: "INV-AUTO-GENERATED",
          poId: "PO-AUTO-GENERATED",
          buyer: event.data.vendor,
          amount: event.data.amount,
          method: event.data.route,
          bankRef: event.data.bankPerson ? `Authorized by: ${event.data.bankPerson}` : "Processing",
          date: event.data.scheduledDate,
          status: "Pending",
          notes: `Wire transfer initiated at ${event.data.time || "N/A"}.`,
        };
        setPayments(prev => [newPayment, ...prev]);
      }
    });
    return unsub;
  }, []);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleDownloadReceipt = (tx) => {
    triggerToast(`Downloading Remittance Advice / Payment Receipt: RECEIPT_${tx.txId}.pdf`);
  };

  const filtered = payments.filter((tx) => {
    const matchesSearch =
      tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.invId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.buyer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "pending"
        ? tx.status === "Pending"
        : tx.status === "Completed";

    return matchesSearch && matchesTab;
  });

  // Financial aggregates
  const totalCompleted = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="vnd-payments-container" style={{ padding: "20px" }}>
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
            <DollarSign color="#f8b400" size={28} /> Payment Tracking & Remittance
          </h1>
          <p className="vnd-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Track processed transfers, corporate direct deposits, outstanding balances, and download receipts.
          </p>
        </div>

        <button
          className="vnd-btn-primary-sm"
          onClick={() => triggerToast("Financial Ledger CSV exported successfully!")}
        >
          <Download size={16} /> Export Financial Ledger (CSV)
        </button>
      </div>

      {/* Outstanding & Total Aggregates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        <div className="vnd-kpi-card" style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "13px", color: "#666", fontWeight: "600", textTransform: "uppercase" }}>YTD Payments Cleared & Completed</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#059669", marginTop: "4px" }}>
              ${totalCompleted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} color="#059669" /> All settlement cycles fully reconciled
            </p>
          </div>
          <div style={{ background: "rgba(5, 150, 105, 0.1)", color: "#059669", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center" }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="vnd-kpi-card" style={{ background: "#ffffff", border: "1px solid #ececec", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "13px", color: "#666", fontWeight: "600", textTransform: "uppercase" }}>Outstanding Payments (Pending Remittance)</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
              ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={14} color="#d97706" /> Processing under contract payment terms
            </p>
          </div>
          <div style={{ background: "rgba(217, 119, 6, 0.1)", color: "#d97706", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center" }}>
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("all")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "all" ? "700" : "500",
            color: activeTab === "all" ? "#d97706" : "#666",
            borderBottom: activeTab === "all" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Payment History ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeTab === "completed" ? "700" : "500",
            color: activeTab === "completed" ? "#d97706" : "#666",
            borderBottom: activeTab === "completed" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Completed Payments ({payments.filter((p) => p.status === "Completed").length})
        </button>
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
          Pending Payments ({payments.filter((p) => p.status === "Pending").length})
        </button>
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
            placeholder="Search by Transaction Ref, Invoice, or PO..."
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
                <th>Transaction Ref</th>
                <th>Invoice Reference</th>
                <th>PO Reference</th>
                <th>Enterprise Buyer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Settlement/Estimated Date</th>
                <th>Payment Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.txId}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{tx.txId}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{tx.invId}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{tx.poId}</td>
                    <td style={{ fontWeight: "700", color: "#111111" }}>{tx.buyer}</td>
                    <td style={{ fontWeight: "800", color: tx.status === "Completed" ? "#059669" : "#d97706" }}>
                      ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: "#555555" }}>{tx.method}</td>
                    <td style={{ color: "#666666", fontSize: "13px" }}>{tx.date}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background:
                            tx.status === "Completed"
                              ? "rgba(5, 150, 105, 0.12)"
                              : "rgba(217, 119, 6, 0.12)",
                          color:
                            tx.status === "Completed"
                              ? "#059669"
                              : "#d97706",
                          border: `1px solid ${
                            tx.status === "Completed"
                              ? "rgba(5, 150, 105, 0.3)"
                              : "rgba(217, 119, 6, 0.3)"
                          }`,
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          className="vnd-sidebar-toggle"
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                          onClick={() => setSelectedTx(tx)}
                          title="View Transaction Details"
                        >
                          <Eye size={15} />
                        </button>
                        
                        {tx.status === "Completed" && (
                          <button
                            className="vnd-sidebar-toggle"
                            style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#d97706" }}
                            onClick={() => handleDownloadReceipt(tx)}
                            title="Download Receipt"
                          >
                            <Download size={15} />
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

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
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
              maxWidth: "520px",
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
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>TRANSACTION DETAILS</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
                  {selectedTx.txId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Status bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f2f2f2", paddingBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Payment Status</span>
                    <div style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          background: selectedTx.status === "Completed" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                          color: selectedTx.status === "Completed" ? "#059669" : "#d97706",
                        }}
                      >
                        {selectedTx.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "#888" }}>{selectedTx.status === "Completed" ? "Settlement Date" : "Estimated Date"}</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", margin: "4px 0 0" }}>{selectedTx.date}</p>
                  </div>
                </div>

                {/* Amount info */}
                <div style={{ textAlign: "center", background: "#f8f9fb", padding: "20px", borderRadius: "10px", border: "1px solid #eee" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>Total Transferred Value</span>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: selectedTx.status === "Completed" ? "#059669" : "#d97706", marginTop: "6px" }}>
                    ${selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Transaction mappings */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Invoice Reference</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{selectedTx.invId}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Purchase Order Reference</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{selectedTx.poId}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Payment Method</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111", margin: "2px 0 0" }}>{selectedTx.method}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Bank Transfer reference</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#d97706", margin: "2px 0 0" }}>{selectedTx.bankRef}</p>
                  </div>
                </div>

                {/* Transaction memo */}
                <div style={{ borderTop: "1px solid #f2f2f2", paddingTop: "14px" }}>
                  <span style={{ fontSize: "11px", color: "#888" }}>Transaction Memo / Notes</span>
                  <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0", fontStyle: "italic" }}>{selectedTx.notes}</p>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              {selectedTx.status === "Completed" && (
                <button
                  className="vnd-btn-primary-sm"
                  onClick={() => handleDownloadReceipt(selectedTx)}
                >
                  <Download size={14} /> Download Receipt
                </button>
              )}
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedTx(null)}
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

export default VendorPayments;
