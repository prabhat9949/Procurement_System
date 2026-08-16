import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck2,
  Search,
  Eye,
  X,
  FileText,
  IndianRupee,
  Loader2,
  WifiOff,
  Landmark,
  RefreshCw,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) =>
  ({
    DRAFT: "Draft", RECEIVED: "Received", UNDER_VERIFICATION: "Under Verification",
    MATCH_PENDING: "Match Pending", MATCHED: "Matched", APPROVED: "Approved",
    REJECTED: "Rejected", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", CANCELLED: "Cancelled",
  }[s] || s);

const statusColor = (s) => {
  if (["PAID", "APPROVED", "MATCHED"].includes(s)) return "#047857";
  if (["REJECTED", "CANCELLED"].includes(s)) return "#dc2626";
  if (["RECEIVED", "UNDER_VERIFICATION", "MATCH_PENDING"].includes(s)) return "#c2410c";
  return "#64748b";
};

const tabMatches = (tab, status) => {
  if (tab === "All") return true;
  if (tab === "Pending") return ["RECEIVED", "UNDER_VERIFICATION", "MATCH_PENDING", "DRAFT"].includes(status);
  if (tab === "Approved") return ["APPROVED", "MATCHED"].includes(status);
  if (tab === "Paid") return ["PAID", "PARTIALLY_PAID"].includes(status);
  return false;
};

const ExecInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, pay] = await Promise.all([
        apiGet("/api/invoices?page=0&size=100&sort=invoiceDate&direction=desc").catch(() => null),
        apiGet("/api/payments?page=0&size=100&sort=paymentDate&direction=desc").catch(() => null),
      ]);
      setInvoices(inv?.content || []);
      setPayments(pay?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load invoice data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (inv.invoiceNumber || "").toLowerCase().includes(q) ||
      (inv.vendorName || "").toLowerCase().includes(q) ||
      String(inv.purchaseOrderId || "").includes(q);
    return matchesSearch && tabMatches(filterStatus, inv.status);
  });

  const badge = (text, color) => (
    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", background: `${color}14`, color, border: `1px solid ${color}44` }}>
      {text}
    </span>
  );

  return (
    <div className="pe-invoices-container" style={{ padding: "20px" }}>
      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      <div className="pe-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="pe-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111111" }}>
            <FileCheck2 color="#f8b400" size={28} /> Commercial Invoices & Payments
          </h1>
          <p className="pe-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Vendor invoices, three-way match progress and payment status — live from the database. Finance remains the action owner.
          </p>
        </div>
        <button className="pe-btn-primary-sm" onClick={loadData}>
          <RefreshCw size={15} /> Refresh
        </button>
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
              fontSize: "14px",
            }}
          >
            {status === "All" ? "All Invoices" : `${status} Invoices`} ({status === "All" ? invoices.length : invoices.filter((i) => tabMatches(status, i.status)).length})
          </button>
        ))}
      </div>

      <div className="pe-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", width: "340px" }}>
          <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by Invoice No., Vendor or PO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pe-form-input"
            style={{ paddingLeft: "42px", height: "42px", width: "100%", border: "1px solid #d9d9d9", borderRadius: "8px" }}
          />
        </div>
      </div>

      <div className="pe-card" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #ececec", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
            <Loader2 size={20} className="login-spin" /> Loading invoices…
          </div>
        ) : (
          <div className="pe-table-container">
            <table className="pe-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Invoice</th>
                  <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Vendor</th>
                  <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>PO</th>
                  <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Total Amount</th>
                  <th style={{ textAlign: "center", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Invoice Date</th>
                  <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #ececec" }}>
                      <td style={{ padding: "14px 20px", fontWeight: "700", color: "#111" }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: "14px 20px", color: "#555" }}>{inv.vendorName}</td>
                      <td style={{ padding: "14px 20px", color: "#f8b400", fontWeight: "700" }}>{inv.purchaseOrderId || "—"}</td>
                      <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: "700", color: "#111" }}>
                        <IndianRupee size={13} style={{ verticalAlign: "middle" }} /> {formatINR(inv.grandTotal)}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>{badge(statusLabel(inv.status), statusColor(inv.status))}</td>
                      <td style={{ padding: "14px 20px", color: "#666" }}>{formatDateIN(inv.invoiceDate, { withTime: false })}</td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <button
                          style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
                          onClick={() => setSelectedInvoice(inv)}
                          title="View Invoice Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments summary */}
      <div className="pe-card" style={{ marginTop: "24px", padding: "20px 24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#111", marginBottom: "12px" }}>
          <Landmark size={17} style={{ verticalAlign: "middle", marginRight: 8, color: "#f8b400" }} />
          Payment Status ({payments.length})
        </h3>
        {payments.length === 0 ? (
          <p style={{ color: "#888", fontSize: "13.5px" }}>No payments recorded yet.</p>
        ) : (
          <div className="pe-table-container">
            <table className="pe-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Payment</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Vendor</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Invoice</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Net Amount</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "12px", color: "#666", fontWeight: "700" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 8).map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #ececec" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#111" }}>{p.paymentNumber}</td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>{p.vendorName}</td>
                    <td style={{ padding: "12px 16px", color: "#f8b400", fontWeight: "700" }}>{p.invoiceNumber || "—"}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700" }}>{formatINR(p.netAmount)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>{badge(p.status, p.status === "PAID" ? "#047857" : ["CANCELLED", "FAILED", "REFUNDED"].includes(p.status) ? "#dc2626" : "#c2410c")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInvoice && (
        <div className="pe-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div className="pe-modal" style={{ background: "#fff", borderRadius: "14px", maxWidth: "560px", width: "100%", padding: "26px", boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ececec", paddingBottom: "14px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800", textTransform: "uppercase" }}>INVOICE DETAIL</span>
                <h2 style={{ fontSize: "20px", color: "#111", fontWeight: "800", margin: 0 }}>{selectedInvoice.invoiceNumber}</h2>
              </div>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Vendor</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{selectedInvoice.vendorName}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Purchase Order</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{selectedInvoice.purchaseOrderId || "—"}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Invoice Date</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{formatDateIN(selectedInvoice.invoiceDate, { withTime: false })}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Due Date</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{selectedInvoice.dueDate ? formatDateIN(selectedInvoice.dueDate, { withTime: false }) : "—"}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Subtotal</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{formatINR(selectedInvoice.subtotal)}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Grand Total</label>
                <p style={{ fontSize: "18px", fontWeight: 800, color: "#d97706" }}>
                  <IndianRupee size={15} style={{ verticalAlign: "middle" }} /> {formatINR(selectedInvoice.grandTotal)}
                </p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Status</label>
                <p style={{ fontWeight: 700, color: statusColor(selectedInvoice.status) }}>{statusLabel(selectedInvoice.status)}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "22px" }}>
              <button className="pe-btn-primary-sm" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecInvoices;
