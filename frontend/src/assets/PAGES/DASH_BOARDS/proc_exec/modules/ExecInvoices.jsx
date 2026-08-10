import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  Download,
  Eye,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  Clock,
  Filter,
} from "lucide-react";
import {
  epsEventBus,
  getStoredVendorInvoices
} from "../../../../../services/epsApiService";

const initialInvoices = [
  {
    id: "INV-2026-9901",
    poId: "PO-2026-4401",
    buyer: "Enterprise Global Inc.",
    amount: 36990.00,
    taxAmount: 3329.10,
    totalAmount: 40319.10,
    status: "Pending",
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
    status: "Paid",
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
    status: "Approved",
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

const ExecInvoices = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadInvoices = () => {
    const saved = getStoredVendorInvoices();
    const combined = [...(saved || []), ...initialInvoices];
    const unique = Array.from(new Map(combined.map(i => [i.id, i])).values());
    setInvoices(unique);
  };

  useEffect(() => {
    loadInvoices();
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED") {
        loadInvoices();
      }
    });
    return unsub;
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const handleDownloadInvoice = (inv) => {
    triggerToast(`Downloading PDF document: ${inv.file}`);
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      (inv.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.poId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.buyer || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pe-invoices-container" style={{ padding: "20px" }}>
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

      <div className="pe-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="pe-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111111" }}>
            <FileCheck2 color="#f8b400" size={28} /> Commercial Invoices & Billing
          </h1>
          <p className="pe-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Monitor, review and audit all vendor-submitted invoices mapped to active purchase orders.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "20px" }}>
        {["All", "Pending", "Approved", "Paid"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "none",
              borderBottom: filterStatus === status ? "2px solid #f8b400" : "none",
              fontWeight: filterStatus === status ? "800" : "600",
              color: filterStatus === status ? "#111" : "#666",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            {status === "All" ? "All Invoices" : `${status} Invoices`} ({status === "All" ? invoices.length : invoices.filter(i => i.status === status).length})
          </button>
        ))}
      </div>

      <div className="pe-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", width: "340px" }}>
          <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by Invoice ID, PO ID or Buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pe-form-input"
            style={{ paddingLeft: "42px", height: "42px", width: "100%", border: "1px solid #d9d9d9", borderRadius: "8px" }}
          />
        </div>
      </div>

      <div className="pe-card" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #ececec", overflow: "hidden" }}>
        <div className="pe-table-container">
          <table className="pe-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Invoice ID</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>PO ID</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Buyer</th>
                <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Tax Amt</th>
                <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Total Amount</th>
                <th style={{ textAlign: "center", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Status</th>
                <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Issue Date</th>
                <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #ececec" }}>
                    <td style={{ padding: "14px 20px", fontWeight: "700", color: "#111" }}>{inv.id}</td>
                    <td style={{ padding: "14px 20px", color: "#f8b400", fontWeight: "700" }}>{inv.poId}</td>
                    <td style={{ padding: "14px 20px", color: "#555" }}>{inv.buyer}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right", color: "#666" }}>{formatCurrency(inv.taxAmount || inv.amount * 0.09)}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700", color: "#111" }}>{formatCurrency(inv.totalAmount || inv.amount * 1.09)}</td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "800",
                          background: inv.status === "Paid" ? "#ecfdf5" : inv.status === "Approved" ? "#eff6ff" : "#fff7ed",
                          color: inv.status === "Paid" ? "#047857" : inv.status === "Approved" ? "#1d4ed8" : "#c2410c",
                          border: `1px solid ${inv.status === "Paid" ? "#10b981" : inv.status === "Approved" ? "#3b82f6" : "#f97316"}`
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#666" }}>{inv.date}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #d9d9d9",
                            borderRadius: "6px",
                            background: "#fff",
                            cursor: "pointer"
                          }}
                          onClick={() => setSelectedInvoice(inv)}
                          title="View Invoice Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #d9d9d9",
                            borderRadius: "6px",
                            background: "#fff",
                            color: "#d97706",
                            cursor: "pointer"
                          }}
                          onClick={() => handleDownloadInvoice(inv)}
                          title="Download Invoice PDF"
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

      {selectedInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", width: "550px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #ececec", background: "#f8f9fb" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#111" }}>Invoice Detailed Audit Review: {selectedInvoice.id}</h3>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#777" }}>Purchase Order Reference</span>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#f8b400", margin: 0 }}>{selectedInvoice.poId}</p>
              </div>
              <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee" }}>
                <span style={{ fontSize: "11px", color: "#666", fontWeight: "700" }}>Financial Summary</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "6px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Base Amount</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", margin: 0 }}>{formatCurrency(selectedInvoice.amount)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>GST (9%)</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", margin: 0 }}>{formatCurrency(selectedInvoice.taxAmount || selectedInvoice.amount * 0.09)}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#888" }}>Total Bill Value</span>
                    <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669", margin: 0 }}>{formatCurrency(selectedInvoice.totalAmount || selectedInvoice.amount * 1.09)}</p>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Issue Date</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", margin: 0 }}>{selectedInvoice.date}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Due Date</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626", margin: 0 }}>{selectedInvoice.dueDate}</p>
                  </div>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#777" }}>Billing Notes</span>
                  <p style={{ fontSize: "13px", color: "#555", margin: "2px 0 0 0", fontStyle: "italic" }}>{selectedInvoice.notes}</p>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#333", marginBottom: "10px" }}>Timeline Tracking</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(selectedInvoice.trackingTimeline || [
                    { step: "Invoice Submitted", date: selectedInvoice.date, status: "completed" },
                    { step: "Under Audit Review", date: "Pending", status: "active" },
                    { step: "Payment Processing", date: "Pending", status: "pending" }
                  ]).map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: step.status === "completed" ? "#059669" : step.status === "active" ? "#f8b400" : "#e2e8f0",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "800"
                        }}
                      >
                        {step.status === "completed" ? "✓" : idx + 1}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "700", color: "#111", margin: 0 }}>{step.step}</p>
                        <span style={{ fontSize: "11px", color: "#666" }}>{step.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button onClick={() => setSelectedInvoice(null)} style={{ padding: "8px 16px", background: "#f8f9fb", border: "1px solid #d9d9d9", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecInvoices;
