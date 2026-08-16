import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  Loader2,
  WifiOff,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusColor = (s) => {
  if (s === "PAID") return "#059669";
  if (s === "FAILED" || s === "CANCELLED") return "#dc2626";
  if (s === "PROCESSING") return "#7c3aed";
  if (s === "APPROVED" || s === "SCHEDULED") return "#2563eb";
  return "#64748b";
};

const VendorPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/vendor/my/payments?page=0&size=100");
      setPayments(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = payments.filter((p) => {
    const s = search.toLowerCase();
    return !s || (p.paymentNumber || "").toLowerCase().includes(s) || (p.invoiceNumber || "").toLowerCase().includes(s)
      || (p.purchaseOrderNumber || "").toLowerCase().includes(s);
  });

  const paidTotal = payments.filter((p) => p.status === "PAID" || p.status === "PARTIALLY_PAID").reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);
  const pendingTotal = payments.filter((p) => ["SCHEDULED", "APPROVED", "PROCESSING"].includes(p.status)).reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CreditCard color="#f8b400" /> My Payments
          </h1>
          <p className="vnd-page-subtitle">Payment status for your invoices — only your own records, live from the database.</p>
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
          <Loader2 size={22} className="login-spin" /> Loading your payments...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>TOTAL PAID</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(paidTotal)}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PENDING PAYMENTS</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{formatINR(pendingTotal)}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PAYMENTS</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{payments.length}</p>
            </div>
          </div>

          <div className="vnd-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ position: "relative", maxWidth: "380px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" placeholder="Search payment, invoice or PO..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="vnd-card" style={{ textAlign: "center", padding: "48px" }}>
              <IndianRupee size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Payments</h3>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No payments are currently available for your vendor account.</p>
            </div>
          ) : (
            <div className="vnd-card" style={{ overflow: "hidden" }}>
              <div className="vnd-table-container">
                <table className="vnd-table">
                  <thead>
                    <tr>
                      <th>Payment</th><th>Invoice</th><th>PO</th><th>Method</th><th>Net Amount</th><th>Payment Date</th><th>Reference</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: "800", color: "#7c3aed", whiteSpace: "nowrap" }}>{p.paymentNumber}</td>
                        <td style={{ fontSize: "13px", color: "#666" }}>{p.invoiceNumber || "—"}</td>
                        <td style={{ fontSize: "13px", color: "#666" }}>{p.purchaseOrderNumber || "—"}</td>
                        <td style={{ fontSize: "13px" }}>{p.paymentMethod}</td>
                        <td style={{ fontWeight: "800" }}>{formatINR(p.netAmount || p.grossAmount)}</td>
                        <td style={{ fontSize: "13px" }}>{formatDateIN(p.paymentDate, { withTime: false })}</td>
                        <td style={{ fontSize: "12.5px", color: "#666" }}>{p.paymentReference || p.bankReference || "—"}</td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(p.status)}14`, color: statusColor(p.status) }}>
                            {p.status === "PAID" && <CheckCircle2 size={12} />}
                            {p.status === "FAILED" && <AlertTriangle size={12} />}
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
        </>
      )}
    </div>
  );
};

export default VendorPayments;
