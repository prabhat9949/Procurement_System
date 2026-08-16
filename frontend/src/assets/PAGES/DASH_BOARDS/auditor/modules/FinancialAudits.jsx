import React, { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Search,
  Eye,
  X,
  Loader2,
  WifiOff,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const FinancialAudits = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, pay, twm] = await Promise.all([
        apiGet("/api/invoices?page=0&size=100&sort=invoiceDate&direction=desc").catch(() => null),
        apiGet("/api/payments?page=0&size=100&sort=paymentDate&direction=desc").catch(() => null),
        apiGet("/api/three-way-matches/search?page=0&size=100").catch(() => null),
      ]);
      setInvoices(inv?.content || []);
      setPayments(pay?.content || []);
      setMatches(twm?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load financial audit data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredInvoices = invoices.filter((i) => {
    const s = search.toLowerCase();
    return !s || (i.invoiceNumber || "").toLowerCase().includes(s) || (i.vendorName || "").toLowerCase().includes(s);
  });

  const invStatusColor = (s) => {
    if (s === "APPROVED" || s === "PAID") return "#059669";
    if (s === "REJECTED" || s === "CANCELLED") return "#dc2626";
    if (s === "ON_HOLD" || s === "DISCREPANCY") return "#d97706";
    return "#2563eb";
  };

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="aud-page-header">
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IndianRupee color="#dc2626" /> Financial Audits
          </h1>
          <p className="aud-page-subtitle">Invoices, three-way matches and payments — live from the database, for independent verification.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="aud-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ position: "relative", maxWidth: "360px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search invoice or vendor..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading financial records...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="aud-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>INVOICES</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{invoices.length}</p>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>Total value {formatINR(invoices.reduce((a, i) => a + Number(i.grandTotal || 0), 0))}</span>
            </div>
            <div className="aud-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>3-WAY MATCHES</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{matches.length}</p>
              <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 700 }}>{matches.filter((m) => m.overallResult === "MISMATCH").length} mismatches</span>
            </div>
            <div className="aud-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PAYMENTS</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{payments.length}</p>
              <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 700 }}>{payments.filter((p) => p.status === "PAID" || p.status === "COMPLETED").length} completed</span>
            </div>
            <div className="aud-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>TOTAL PAID</span>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(payments.filter((p) => p.status === "PAID" || p.status === "COMPLETED").reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0))}</p>
            </div>
          </div>

          <div className="aud-card" style={{ overflow: "hidden", marginBottom: "20px" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={16} color="#dc2626" /> Invoices
            </h4>
            <div className="aud-table-container">
              <table className="aud-table">
                <thead>
                  <tr><th>Invoice</th><th>Vendor</th><th>PO</th><th>Amount</th><th>Due</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No invoices recorded.</td></tr>
                  ) : filteredInvoices.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{i.invoiceNumber}</td>
                      <td style={{ fontWeight: 600 }}>{i.vendorName}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{i.purchaseOrderId || "—"}</td>
                      <td style={{ fontWeight: "800" }}>{formatINR(i.grandTotal)}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(i.dueDate, { withTime: false })}</td>
                      <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${invStatusColor(i.status)}14`, color: invStatusColor(i.status) }}>{i.status}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <button className="aud-btn-primary-sm" onClick={() => setPreview({ kind: "invoice", row: i })}><Eye size={14} /> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="aud-card" style={{ overflow: "hidden" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} color="#059669" /> Payments
            </h4>
            <div className="aud-table-container">
              <table className="aud-table">
                <thead>
                  <tr><th>Payment</th><th>Vendor</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No payments recorded.</td></tr>
                  ) : payments.slice(0, 50).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "800", color: "#7c3aed", whiteSpace: "nowrap" }}>{p.paymentNumber}</td>
                      <td style={{ fontWeight: 600 }}>{p.vendorName}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{p.invoiceNumber || "—"}</td>
                      <td style={{ fontWeight: "800" }}>{formatINR(p.netAmount || p.grossAmount)}</td>
                      <td style={{ fontSize: "13px" }}>{p.paymentMethod}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(p.paymentDate, { withTime: false })}</td>
                      <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${invStatusColor(p.status)}14`, color: invStatusColor(p.status) }}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {preview && (
        <div className="aud-modal-overlay">
          <div className="aud-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>
                {preview.kind === "invoice" ? preview.row.invoiceNumber : preview.row.paymentNumber}
              </h3>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {preview.kind === "invoice" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
                <div><span style={{ color: "#888" }}>Vendor:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.row.vendorName}</p></div>
                <div><span style={{ color: "#888" }}>Status:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.row.status}</p></div>
                <div><span style={{ color: "#888" }}>Invoice Date:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{formatDateIN(preview.row.invoiceDate, { withTime: false })}</p></div>
                <div><span style={{ color: "#888" }}>Due Date:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{formatDateIN(preview.row.dueDate, { withTime: false })}</p></div>
                <div style={{ gridColumn: "1 / -1", background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec" }}>
                  <span style={{ color: "#888", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Amounts</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                    <div><span style={{ color: "#888" }}>Subtotal</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(preview.row.subtotal)}</p></div>
                    <div><span style={{ color: "#888" }}>Grand Total</span><p style={{ fontWeight: 800, margin: 0, color: "#059669" }}>{formatINR(preview.row.grandTotal)}</p></div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
                <div><span style={{ color: "#888" }}>Vendor:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.row.vendorName}</p></div>
                <div><span style={{ color: "#888" }}>Invoice:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.row.invoiceNumber || "—"}</p></div>
                <div><span style={{ color: "#888" }}>Net Amount:</span><p style={{ fontWeight: 800, margin: "2px 0", color: "#059669" }}>{formatINR(preview.row.netAmount)}</p></div>
                <div><span style={{ color: "#888" }}>Reference:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.row.paymentReference || preview.row.bankReference || "—"}</p></div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="aud-btn-primary-sm" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAudits;
