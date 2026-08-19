import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck2,
  Search,
  Eye,
  X,
  CheckCircle2,
  IndianRupee,
  Loader2,
  WifiOff,
  FileText,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) => ({
  DRAFT: "Draft", RECEIVED: "Received", UNDER_VERIFICATION: "Under Verification",
  MATCH_PENDING: "Match Pending", MATCHED: "Matched", APPROVED: "Approved",
  REJECTED: "Rejected", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", CANCELLED: "Cancelled",
}[s] || s);

const statusColor = (s) => {
  if (s === "PAID" || s === "APPROVED" || s === "MATCHED") return "#059669";
  if (s === "REJECTED" || s === "CANCELLED") return "#dc2626";
  if (s === "MATCH_PENDING" || s === "UNDER_VERIFICATION" || s === "RECEIVED") return "#d97706";
  return "#64748b";
};

const FinanceInvoiceMgmt = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [lines, setLines] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const triggerToast = (m) => { setToast(m); setTimeout(() => setToast(""), 4500); };

  const loadData = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const q = status ? `&status=${status}` : "";
      const page = await apiGet(`/api/invoices?page=0&size=100&sort=invoiceDate&direction=desc${q}`);
      setInvoices(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(""); }, [loadData]);

  const openDetail = async (inv) => {
    setSelected(inv);
    setLines([]);
    try {
      const lpage = await apiGet(`/api/invoices/${inv.id}/lines?page=0&size=50`).catch(() => null);
      setLines(lpage?.content || []);
    } catch { /* non-fatal */ }
  };

  const action = async (inv, act) => {
    setBusy(true);
    setError("");
    try {
      const res = await apiPost(`/api/invoices/${inv.id}/${act}`);
      triggerToast(`Invoice ${inv.invoiceNumber} ${act === "match" ? "matched" : "approved"}.`);
      loadData(statusFilter);
      setSelected(null);
    } catch (err) {
      setError(err.message || `Unable to ${act} the invoice.`);
    } finally {
      setBusy(false);
    }
  };

  const filtered = invoices.filter((i) => {
    const s = search.toLowerCase();
    return !s || (i.invoiceNumber || "").toLowerCase().includes(s) || (i.vendorName || "").toLowerCase().includes(s);
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileCheck2 color="#f8b400" /> Invoice Management
          </h1>
          <p className="fin-page-subtitle">Invoice verification, 3-way matching and approval — live from the database.</p>
        </div>
      </div>

      {toast && (
        <div style={{ background: "rgba(5, 150, 105, 0.12)", border: "1px solid #059669", color: "#059669", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => loadData("")} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="fin-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search invoice number or vendor..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); loadData(e.target.value); }} style={{ ...inputStyle, width: "220px" }}>
          <option value="">All statuses</option>
          {["RECEIVED", "UNDER_VERIFICATION", "MATCH_PENDING", "MATCHED", "APPROVED", "REJECTED", "PAID", "PARTIALLY_PAID"].map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="fin-card" style={{ textAlign: "center", padding: "48px" }}>
          <FileText size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Invoices</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No invoices are currently pending Finance review.</p>
        </div>
      ) : (
        <div className="fin-card" style={{ overflow: "hidden" }}>
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Invoice</th><th>Vendor</th><th>Invoice Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{i.invoiceNumber}</td>
                    <td style={{ fontWeight: 600 }}>{i.vendorName}</td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{formatDateIN(i.invoiceDate, { withTime: false })}</td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{formatDateIN(i.dueDate, { withTime: false })}</td>
                    <td style={{ fontWeight: "800" }}>{formatINR(i.grandTotal)}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(i.status)}14`, color: statusColor(i.status) }}>{statusLabel(i.status)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button className="fin-btn-primary-sm" onClick={() => openDetail(i)}><Eye size={14} /> Review</button>
                        {(i.status === "RECEIVED" || i.status === "UNDER_VERIFICATION" || i.status === "MATCH_PENDING") && (
                          <button className="fin-btn-primary-sm" onClick={() => action(i, "match")} disabled={busy}><RefreshCw size={14} /> 3-Way Match</button>
                        )}
                        {i.status === "MATCHED" && (
                          <button className="fin-btn-primary-sm" onClick={() => action(i, "approve")} disabled={busy}><CheckCircle2 size={14} /> Approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Invoice {selected.invoiceNumber}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px", marginBottom: "16px" }}>
              <div><span style={{ color: "#888" }}>Vendor:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.vendorName}</p></div>
              <div><span style={{ color: "#888" }}>Status:</span><p style={{ fontWeight: 700, margin: "2px 0", color: statusColor(selected.status) }}>{statusLabel(selected.status)}</p></div>
              <div><span style={{ color: "#888" }}>Vendor Invoice No:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.vendorInvoiceNumber}</p></div>
              <div><span style={{ color: "#888" }}>Due Date:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{formatDateIN(selected.dueDate, { withTime: false })}</p></div>
              <div><span style={{ color: "#888" }}>PO ID:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.purchaseOrderId || "—"}</p></div>
              <div><span style={{ color: "#888" }}>GRN ID:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.goodsReceiptNoteId || "—"}</p></div>
            </div>
            <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Amounts (INR)</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                <div><span style={{ color: "#888" }}>Subtotal</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(selected.subtotal)}</p></div>
                <div><span style={{ color: "#888" }}>Discount</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(selected.discountAmount)}</p></div>
                <div><span style={{ color: "#888" }}>Tax</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(selected.taxAmount)}</p></div>
                <div><span style={{ color: "#888" }}>Shipping</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(selected.shippingCharges)}</p></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#888" }}>Grand Total</span>
                  <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669", margin: 0 }}>{formatINR(selected.grandTotal)}</p>
                </div>
              </div>
            </div>
            {lines.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Line Items</span>
                <div style={{ marginTop: "6px", fontSize: "13px" }}>
                  {lines.map((l) => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f2f2f2" }}>
                      <span>Product #{l.productId || "—"} × {l.quantity}</span>
                      <strong>{formatINR(l.lineAmount)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.status === "MATCH_PENDING" && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "12px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
                <AlertTriangle size={16} /> This invoice requires a 3-way match against its PO and GRN before approval.
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="fin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setSelected(null)}>Close</button>
              {(selected.status === "RECEIVED" || selected.status === "UNDER_VERIFICATION" || selected.status === "MATCH_PENDING") && (
                <button className="fin-btn-primary-sm" onClick={() => action(selected, "match")} disabled={busy}><RefreshCw size={14} /> Run 3-Way Match</button>
              )}
              {selected.status === "MATCHED" && (
                <button className="fin-btn-primary-sm" onClick={() => action(selected, "approve")} disabled={busy}><CheckCircle2 size={14} /> Approve for Payment</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceInvoiceMgmt;
