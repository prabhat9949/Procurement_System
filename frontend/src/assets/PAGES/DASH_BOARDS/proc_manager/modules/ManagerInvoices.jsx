import React, { useState, useEffect } from "react";
import {
  Receipt,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Building2,
  CalendarDays,
  DollarSign,
  QrCode,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { epsEventBus, getStoredVendorInvoices } from "../../../../../services/epsApiService";

const ManagerInvoices = () => {
  const [invoices, setInvoices] = useState(() => getStoredVendorInvoices());
  const [selectedInv, setSelectedInv] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Subscribe to new invoices from vendor portal in real-time
  useEffect(() => {
    const unsub = epsEventBus.subscribe((event) => {
      if (event.type === "INVOICE_SUBMITTED" && event.data) {
        setInvoices((prev) => {
          if (prev.some((i) => i.id === event.data.id)) return prev;
          return [event.data, ...prev];
        });
      }
    });
    return unsub;
  }, []);

  const handleAcknowledge = (invId) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invId ? { ...i, status: "Acknowledged" } : i))
    );
    setSelectedInv(null);
    triggerToast(`Invoice ${invId} acknowledged and routed to Finance for payment clearance.`);
  };

  const handleFlag = (invId) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invId ? { ...i, status: "Flagged" } : i))
    );
    setSelectedInv(null);
    triggerToast(`Invoice ${invId} has been flagged for review.`);
  };

  const pending = invoices.filter((i) => !i.status || i.status === "Pending");
  const acknowledged = invoices.filter((i) => i.status === "Acknowledged");
  const flagged = invoices.filter((i) => i.status === "Flagged");

  const displayList = activeTab === "pending" ? pending : activeTab === "acknowledged" ? acknowledged : flagged;

  const statusColor = (status) => {
    if (status === "Acknowledged") return { bg: "rgba(5,150,105,0.1)", color: "#059669", border: "#059669" };
    if (status === "Flagged") return { bg: "rgba(239,68,68,0.1)", color: "#dc2626", border: "#dc2626" };
    return { bg: "rgba(248,180,0,0.1)", color: "#d97706", border: "#f8b400" };
  };

  return (
    <div className="pman-tracking-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Receipt color="#f8b400" /> Vendor Invoice Management
          </h1>
          <p className="pman-page-subtitle">
            Review and acknowledge tax invoices submitted by vendors. All invoices are simultaneously routed to Finance for payment clearance.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ background: "rgba(5,150,105,0.1)", border: "1px solid #059669", color: "#059669", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Pending Review", count: pending.length, color: "#f8b400", icon: <Clock size={22} color="#f8b400" /> },
          { label: "Acknowledged", count: acknowledged.length, color: "#059669", icon: <CheckCircle2 size={22} color="#059669" /> },
          { label: "Flagged", count: flagged.length, color: "#dc2626", icon: <AlertTriangle size={22} color="#dc2626" /> },
        ].map((stat) => (
          <div key={stat.label} className="pman-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color }}>{stat.count}</div>
              <div style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["pending", "acknowledged", "flagged"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              background: activeTab === tab ? "#f8b400" : "#f3f4f6",
              color: activeTab === tab ? "#111" : "#555",
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices list */}
      {displayList.length === 0 ? (
        <div className="pman-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Receipt size={48} color="#ccc" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "#999", fontWeight: "600" }}>No invoices in this category yet.</p>
          <p style={{ color: "#bbb", fontSize: "13px", marginTop: "4px" }}>Invoices submitted by vendors in the Supplier Portal will appear here instantly.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {displayList.map((inv) => {
            const sc = statusColor(inv.status || "Pending");
            return (
              <div key={inv.id} className="pman-card pman-card-gold-glow">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "800", color: "#d97706", fontSize: "15px" }}>{inv.id}</span>
                      <span style={{ fontSize: "12px", color: "#666" }}>PO: <strong>{inv.poId}</strong></span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {inv.status || "Pending"}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "16px", color: "#111", fontWeight: "700" }}>{inv.item}</h4>
                    <p style={{ fontSize: "13px", color: "#555", marginTop: "2px" }}>Vendor: <strong>{inv.vendor}</strong> • Buyer: {inv.buyer}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#059669" }}>
                      ${(inv.totalAmount || inv.amount || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>Due: {inv.dueDate || "N/A"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                  <button
                    className="pman-btn-sm"
                    style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    onClick={() => setSelectedInv(inv)}
                  >
                    <Eye size={14} /> View Details
                  </button>
                  {(!inv.status || inv.status === "Pending") && (
                    <>
                      <button
                        style={{ background: "#059669", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => handleAcknowledge(inv.id)}
                      >
                        <Check size={14} /> Acknowledge
                      </button>
                      <button
                        style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => handleFlag(inv.id)}
                      >
                        <AlertTriangle size={14} /> Flag
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInv && (
        <div className="pman-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", maxWidth: "640px", width: "100%", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #f8b400" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>Invoice Detail</span>
                <h2 style={{ fontSize: "20px", color: "#111", fontWeight: "800", marginTop: "2px" }}>{selectedInv.id}</h2>
              </div>
              <button onClick={() => setSelectedInv(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
                <X size={22} />
              </button>
            </div>

            {/* Detail rows */}
            {[
              { label: "Vendor", value: selectedInv.vendor },
              { label: "Item", value: selectedInv.item },
              { label: "PO Reference", value: selectedInv.poId },
              { label: "Invoice Amount", value: `$${(selectedInv.amount || 0).toLocaleString()}` },
              { label: "Tax (9%)", value: `$${((selectedInv.taxAmount) || (selectedInv.amount || 0) * 0.09).toFixed(2)}` },
              { label: "Total Amount", value: `$${(selectedInv.totalAmount || (selectedInv.amount || 0) * 1.09).toLocaleString()}` },
              { label: "Due Date", value: selectedInv.dueDate || "N/A" },
              { label: "Bank Details", value: selectedInv.bankDetails || "N/A" },
              { label: "Notes", value: selectedInv.notes || "N/A" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "13px", color: "#777", fontWeight: "600" }}>{label}</span>
                <span style={{ fontSize: "13px", color: "#111", fontWeight: "700", textAlign: "right", maxWidth: "60%" }}>{value}</span>
              </div>
            ))}

            {/* Attachments */}
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "12px", fontWeight: "700", color: "#555", marginBottom: "10px" }}>Attachments</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #ececec" }}>
                  <FileText size={14} color="#f8b400" />
                  <span style={{ fontSize: "12px", color: "#555" }}>{selectedInv.invoicePdfName || `INV_${selectedInv.id}.pdf`}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #ececec" }}>
                  <QrCode size={14} color="#f8b400" />
                  <span style={{ fontSize: "12px", color: "#555" }}>{selectedInv.qrCodeName || `QR_${selectedInv.id}.png`}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              {(!selectedInv.status || selectedInv.status === "Pending") && (
                <>
                  <button style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }} onClick={() => handleFlag(selectedInv.id)}>
                    Flag
                  </button>
                  <button style={{ background: "#059669", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }} onClick={() => handleAcknowledge(selectedInv.id)}>
                    Acknowledge & Forward to Finance
                  </button>
                </>
              )}
              <button style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }} onClick={() => setSelectedInv(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerInvoices;
