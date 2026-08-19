import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Check,
  X,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Loader2,
  WifiOff,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) => ({
  DRAFT: "Draft", SCHEDULED: "Scheduled", APPROVED: "Approved", PROCESSING: "Processing",
  PARTIALLY_PAID: "Partially Paid", PAID: "Paid", FAILED: "Failed", CANCELLED: "Cancelled", REFUNDED: "Refunded",
}[s] || s);

const statusColor = (s) => {
  if (s === "PAID") return "#059669";
  if (s === "FAILED" || s === "CANCELLED") return "#dc2626";
  if (s === "PROCESSING" || s === "SCHEDULED") return "#7c3aed";
  if (s === "APPROVED") return "#2563eb";
  return "#64748b";
};

const PaymentApprovals = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [failReason, setFailReason] = useState("");
  const [showFail, setShowFail] = useState(false);

  const triggerToast = (m) => { setToast(m); setTimeout(() => setToast(""), 4500); };

  const loadData = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const q = status ? `&status=${status}` : "";
      const page = await apiGet(`/api/payments?page=0&size=100&sort=paymentDate&direction=desc${q}`);
      setPayments(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(""); }, [loadData]);

  const act = async (p, action) => {
    setBusy(true);
    setError("");
    try {
      await apiPost(`/api/payments/${p.id}/${action}`);
      triggerToast(`Payment ${p.paymentNumber} ${action === "approve" ? "approved" : action === "process" ? "moved to processing" : action === "complete" ? "completed" : "marked failed"}.`);
      loadData(statusFilter);
      setSelected(null);
      setShowFail(false);
      setFailReason("");
    } catch (err) {
      setError(err.message || `Unable to ${action} the payment.`);
    } finally {
      setBusy(false);
    }
  };

  const filtered = payments.filter((p) => {
    const s = search.toLowerCase();
    return !s || (p.paymentNumber || "").toLowerCase().includes(s) || (p.vendorName || "").toLowerCase().includes(s)
      || (p.invoiceNumber || "").toLowerCase().includes(s);
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CreditCard color="#f8b400" /> Payment Approvals
          </h1>
          <p className="fin-page-subtitle">Payment approval, processing and completion — live from the database.</p>
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
          <input type="text" placeholder="Search payment, vendor or invoice..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); loadData(e.target.value); }} style={{ ...inputStyle, width: "220px" }}>
          <option value="">All statuses</option>
          {["SCHEDULED", "APPROVED", "PROCESSING", "PAID", "PARTIALLY_PAID", "FAILED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading payments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="fin-card" style={{ textAlign: "center", padding: "48px" }}>
          <CreditCard size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Payments</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No payments are currently pending.</p>
        </div>
      ) : (
        <div className="fin-card" style={{ overflow: "hidden" }}>
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Payment</th><th>Vendor</th><th>Invoice</th><th>Method</th><th>Net Amount</th><th>Date</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: "800", color: "#7c3aed", whiteSpace: "nowrap" }}>{p.paymentNumber}</td>
                    <td style={{ fontWeight: 600 }}>{p.vendorName}</td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{p.invoiceNumber || "—"}</td>
                    <td style={{ fontSize: "13px" }}>{p.paymentMethod}</td>
                    <td style={{ fontWeight: "800" }}>{formatINR(p.netAmount || p.grossAmount)}</td>
                    <td style={{ fontSize: "13px" }}>{formatDateIN(p.paymentDate, { withTime: false })}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(p.status)}14`, color: statusColor(p.status) }}>{statusLabel(p.status)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button className="fin-btn-primary-sm" onClick={() => setSelected(p)}><Eye size={14} /> View</button>
                        {p.status === "SCHEDULED" && (
                          <button className="fin-btn-primary-sm" onClick={() => act(p, "approve")} disabled={busy}><Check size={14} /> Approve</button>
                        )}
                        {p.status === "APPROVED" && (
                          <button className="fin-btn-primary-sm" onClick={() => act(p, "process")} disabled={busy}><RefreshCw size={14} /> Process</button>
                        )}
                        {p.status === "PROCESSING" && (
                          <>
                            <button className="fin-btn-primary-sm" onClick={() => act(p, "complete")} disabled={busy}><CheckCircle2 size={14} /> Complete</button>
                            <button className="fin-btn-primary-sm" style={{ background: "#dc2626", borderColor: "#dc2626" }} onClick={() => { setSelected(p); setShowFail(true); }}><XCircle size={14} /> Fail</button>
                          </>
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

      {selected && !showFail && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Payment {selected.paymentNumber}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px", marginBottom: "16px" }}>
              <div><span style={{ color: "#888" }}>Vendor:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.vendorName}</p></div>
              <div><span style={{ color: "#888" }}>Invoice:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.invoiceNumber || "—"}</p></div>
              <div><span style={{ color: "#888" }}>PO:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.purchaseOrderNumber || "—"}</p></div>
              <div><span style={{ color: "#888" }}>Method:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.paymentMethod}</p></div>
              <div><span style={{ color: "#888" }}>Reference:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.paymentReference || selected.bankReference || "—"}</p></div>
              <div><span style={{ color: "#888" }}>Status:</span><p style={{ fontWeight: 700, margin: "2px 0", color: statusColor(selected.status) }}>{statusLabel(selected.status)}</p></div>
            </div>
            <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Amounts (INR)</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                <div><span style={{ color: "#888" }}>Gross</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(selected.grossAmount)}</p></div>
                <div><span style={{ color: "#888" }}>Tax Deduction</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(selected.taxDeduction)}</p></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#888" }}>Net Payable</span>
                  <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669", margin: 0 }}>{formatINR(selected.netAmount)}</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button className="fin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setSelected(null)}>Close</button>
              {selected.status === "SCHEDULED" && (
                <button className="fin-btn-primary-sm" onClick={() => act(selected, "approve")} disabled={busy}><Check size={14} /> Approve Payment</button>
              )}
              {selected.status === "APPROVED" && (
                <button className="fin-btn-primary-sm" onClick={() => act(selected, "process")} disabled={busy}><RefreshCw size={14} /> Process Payment</button>
              )}
              {selected.status === "PROCESSING" && (
                <>
                  <button className="fin-btn-primary-sm" onClick={() => act(selected, "complete")} disabled={busy}><CheckCircle2 size={14} /> Complete Payment</button>
                  <button className="fin-btn-primary-sm" style={{ background: "#dc2626", borderColor: "#dc2626" }} onClick={() => setShowFail(true)} disabled={busy}><XCircle size={14} /> Mark Failed</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showFail && selected && (
        <div className="fin-modal-overlay">
          <div className="fin-modal" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Mark Payment Failed — {selected.paymentNumber}</h3>
              <button onClick={() => setShowFail(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" }}>
              <AlertTriangle size={16} /> The invoice will NOT be marked as paid.
            </div>
            <div className="fin-form-group" style={{ marginBottom: "20px" }}>
              <label className="fin-form-label">Failure Reason *</label>
              <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={failReason}
                onChange={(e) => setFailReason(e.target.value)} placeholder="e.g. Bank transaction rejected." required />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="fin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowFail(false)}>Cancel</button>
              <button className="fin-btn-primary-sm" style={{ background: "#dc2626", borderColor: "#dc2626" }}
                onClick={() => failReason.trim() ? act(selected, "fail") : null} disabled={busy || !failReason.trim()}>
                {busy ? <Loader2 size={15} className="login-spin" /> : <XCircle size={15} />} Confirm Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentApprovals;
