import React, { useState, useEffect, useCallback } from "react";
import { IndianRupee, Loader2, WifiOff, Search, CheckCircle2, AlertTriangle, Clock, Landmark } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusColor = (s) => {
  if (s === "PAID") return "#059669";
  if (s === "FAILED" || s === "CANCELLED") return "#dc2626";
  if (s === "PROCESSING") return "#7c3aed";
  if (s === "APPROVED" || s === "SCHEDULED") return "#2563eb";
  return "#64748b";
};

const ProcurementPaymentTracking = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pay, inv] = await Promise.all([
        apiGet("/api/payments?page=0&size=100&sort=paymentDate&direction=desc").catch(() => null),
        apiGet("/api/invoices?page=0&size=100&sort=invoiceDate&direction=desc").catch(() => null),
      ]);
      setPayments(pay?.content || []);
      setInvoices(inv?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load payment tracking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = payments.filter((p) => {
    const s = search.toLowerCase();
    return !s || (p.paymentNumber || "").toLowerCase().includes(s) || (p.vendorName || "").toLowerCase().includes(s)
      || (p.invoiceNumber || "").toLowerCase().includes(s) || (p.purchaseOrderNumber || "").toLowerCase().includes(s);
  });

  const paid = payments.filter((p) => p.status === "PAID" || p.status === "PARTIALLY_PAID").reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);
  const pending = payments.filter((p) => ["SCHEDULED", "APPROVED", "PROCESSING"].includes(p.status)).reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);
  const failed = payments.filter((p) => p.status === "FAILED").length;
  const overdue = invoices.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && !["PAID", "CANCELLED", "REJECTED"].includes(i.status)).length;

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Landmark color="#f8b400" /> Procurement Payment Tracking
          </h1>
          <p className="fin-page-subtitle">Invoice and payment status for procurement records — live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading payment data...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>PAID VALUE</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(paid)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>PENDING VALUE</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{formatINR(pending)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>FAILED PAYMENTS</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", margin: "4px 0" }}>{failed}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>OVERDUE INVOICES</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", margin: "4px 0" }}>{overdue}</p>
            </div>
          </div>

          <div className="fin-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ position: "relative", maxWidth: "380px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" placeholder="Search payment, PO, invoice or vendor..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
            </div>
          </div>

          <div className="fin-card" style={{ overflow: "hidden" }}>
            <div className="fin-table-container">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Payment</th><th>Vendor</th><th>PO</th><th>Invoice</th><th>Method</th><th>Net Amount</th><th>Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No payment records available.</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "800", color: "#7c3aed", whiteSpace: "nowrap" }}>{p.paymentNumber}</td>
                      <td style={{ fontWeight: 600 }}>{p.vendorName}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{p.purchaseOrderNumber || "—"}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{p.invoiceNumber || "—"}</td>
                      <td style={{ fontSize: "13px" }}>{p.paymentMethod}</td>
                      <td style={{ fontWeight: "800" }}>{formatINR(p.netAmount || p.grossAmount)}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(p.paymentDate, { withTime: false })}</td>
                      <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(p.status)}14`, color: statusColor(p.status) }}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProcurementPaymentTracking;
