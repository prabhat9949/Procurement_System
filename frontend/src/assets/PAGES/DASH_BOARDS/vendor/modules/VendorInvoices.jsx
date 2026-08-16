import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck2,
  Search,
  Eye,
  X,
  Loader2,
  WifiOff,
  FileText,
  IndianRupee,
  Download,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) => ({
  DRAFT: "Draft", RECEIVED: "Received", UNDER_VERIFICATION: "Under Verification",
  MATCH_PENDING: "Match Pending", MATCHED: "Matched", APPROVED: "Approved",
  REJECTED: "Rejected", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", CANCELLED: "Cancelled",
}[s] || s);

const statusColor = (s) => {
  if (s === "PAID" || s === "APPROVED" || s === "MATCHED") return "#059669";
  if (s === "REJECTED" || s === "CANCELLED") return "#dc2626";
  if (s === "MATCH_PENDING" || s === "UNDER_VERIFICATION") return "#d97706";
  return "#64748b";
};

const VendorInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/vendor/my/invoices?page=0&size=100");
      setInvoices(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = invoices.filter((i) => {
    const s = search.toLowerCase();
    return !s || (i.invoiceNumber || "").toLowerCase().includes(s) || (i.vendorInvoiceNumber || "").toLowerCase().includes(s)
      || (i.poNumber || "").toLowerCase().includes(s);
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileCheck2 color="#f8b400" /> My Invoices
          </h1>
          <p className="vnd-page-subtitle">Invoices raised against your company — only your own records, live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="vnd-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search invoice or PO..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="vnd-card" style={{ textAlign: "center", padding: "48px" }}>
          <FileText size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Invoices</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No invoices are currently available for your vendor account.</p>
        </div>
      ) : (
        <div className="vnd-card" style={{ overflow: "hidden" }}>
          <div className="vnd-table-container">
            <table className="vnd-table">
              <thead>
                <tr>
                  <th>Invoice</th><th>Vendor Ref</th><th>PO</th><th>Invoice Date</th><th>Due Date</th><th>Grand Total</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{i.invoiceNumber}</td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{i.vendorInvoiceNumber}</td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{i.poNumber}</td>
                    <td style={{ fontSize: "13px" }}>{formatDateIN(i.invoiceDate, { withTime: false })}</td>
                    <td style={{ fontSize: "13px" }}>{formatDateIN(i.dueDate, { withTime: false })}</td>
                    <td style={{ fontWeight: "800" }}>{formatINR(i.grandTotal)}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(i.status)}14`, color: statusColor(i.status) }}>{statusLabel(i.status)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="vnd-btn-primary-sm" onClick={() => setPreview(i)}><Eye size={14} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "580px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Invoice {preview.invoiceNumber}</h3>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px", marginBottom: "16px" }}>
              <div><span style={{ color: "#888" }}>Vendor Ref:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.vendorInvoiceNumber}</p></div>
              <div><span style={{ color: "#888" }}>PO:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{preview.poNumber}</p></div>
              <div><span style={{ color: "#888" }}>Invoice Date:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{formatDateIN(preview.invoiceDate, { withTime: false })}</p></div>
              <div><span style={{ color: "#888" }}>Due Date:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{formatDateIN(preview.dueDate, { withTime: false })}</p></div>
              <div><span style={{ color: "#888" }}>Status:</span><p style={{ fontWeight: 700, margin: "2px 0", color: statusColor(preview.status) }}>{statusLabel(preview.status)}</p></div>
            </div>
            <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee" }}>
              <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Amounts ({preview.currency || "INR"})</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
                <div><span style={{ color: "#888" }}>Subtotal</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(preview.subtotal)}</p></div>
                <div><span style={{ color: "#888" }}>Discount</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(preview.discountAmount)}</p></div>
                <div><span style={{ color: "#888" }}>Tax</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(preview.taxAmount)}</p></div>
                <div><span style={{ color: "#888" }}>Shipping</span><p style={{ fontWeight: 600, margin: 0 }}>{formatINR(preview.shippingCharges)}</p></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#888" }}>Grand Total</span>
                  <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669", margin: 0 }}>{formatINR(preview.grandTotal)}</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="vnd-btn-primary-sm" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorInvoices;
