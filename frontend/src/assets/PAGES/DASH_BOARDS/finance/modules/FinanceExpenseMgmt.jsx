import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, IndianRupee, Layers, Loader2, WifiOff, CheckCircle2, AlertTriangle, FileText, Download } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const FinanceExpenseMgmt = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pay, inv] = await Promise.all([
        apiGet("/api/payments?page=0&size=200&sort=paymentDate&direction=desc").catch(() => null),
        apiGet("/api/invoices?page=0&size=200&sort=invoiceDate&direction=desc").catch(() => null),
      ]);
      setPayments(pay?.content || []);
      setInvoices(inv?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load expense data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Group payments by vendor as a proxy for spend by supplier.
  const byVendor = {};
  payments.forEach((p) => {
    const amt = Number(p.netAmount || p.grossAmount || 0);
    byVendor[p.vendorName || "Unknown"] = (byVendor[p.vendorName || "Unknown"] || 0) + amt;
  });
  const vendorRows = Object.entries(byVendor).map(([vendor, amount]) => ({ vendor, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthKey = (d) => (d ? String(d).slice(0, 7) : "");
  const byMonth = {};
  payments.forEach((p) => {
    const k = monthKey(p.paymentDate) || "unknown";
    byMonth[k] = (byMonth[k] || 0) + Number(p.netAmount || p.grossAmount || 0);
  });
  const monthRows = Object.entries(byMonth).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const totalPaid = payments.filter((p) => p.status === "PAID" || p.status === "PARTIALLY_PAID").reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);
  const outstanding = invoices.filter((i) => !["PAID", "CANCELLED", "REJECTED"].includes(i.status)).reduce((a, i) => a + Number(i.grandTotal || 0), 0);

  const exportCSV = (filename, headers, rows) => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TrendingUp color="#f8b400" /> Expense Management
          </h1>
          <p className="fin-page-subtitle">Procurement spend by supplier and month — live from invoice and payment records.</p>
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
          <Loader2 size={22} className="login-spin" /> Loading expense data...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>TOTAL PAID</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(totalPaid)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>OUTSTANDING</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{formatINR(outstanding)}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>SUPPLIERS</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{vendorRows.length}</p>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PAYMENTS</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", margin: "4px 0" }}>{payments.length}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="fin-card" style={{ overflow: "hidden" }}>
              <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} color="#f8b400" /> Spend by Supplier
              </h4>
              <div className="fin-table-container">
                <table className="fin-table">
                  <thead><tr><th>Supplier</th><th>Paid Amount</th><th>Share</th></tr></thead>
                  <tbody>
                    {vendorRows.length === 0 ? (
                      <tr><td colSpan="3" style={{ textAlign: "center", padding: "24px", color: "#666" }}>No payment records yet.</td></tr>
                    ) : vendorRows.slice(0, 15).map((v) => (
                      <tr key={v.vendor}>
                        <td style={{ fontWeight: 600 }}>{v.vendor}</td>
                        <td style={{ fontWeight: 700 }}>{formatINR(v.amount)}</td>
                        <td>
                          <div style={{ background: "#ececec", borderRadius: 6, height: 8, minWidth: 60 }}>
                            <div style={{ width: `${Math.min(totalPaid > 0 ? Math.round((v.amount / totalPaid) * 100) : 0, 100)}%`, height: 8, borderRadius: 6, background: "#f8b400" }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="fin-card" style={{ overflow: "hidden" }}>
              <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} color="#7c3aed" /> Monthly Spend
              </h4>
              <div className="fin-table-container">
                <table className="fin-table">
                  <thead><tr><th>Month</th><th>Paid Amount</th></tr></thead>
                  <tbody>
                    {monthRows.length === 0 ? (
                      <tr><td colSpan="2" style={{ textAlign: "center", padding: "24px", color: "#666" }}>No payment records yet.</td></tr>
                    ) : monthRows.slice(0, 12).map(([m, amt]) => (
                      <tr key={m}>
                        <td style={{ fontWeight: 600 }}>{m}</td>
                        <td style={{ fontWeight: 700 }}>{formatINR(amt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "14px 20px", borderTop: "1px solid #ececec" }}>
                <button className="fin-btn-primary-sm" onClick={() => exportCSV("spend-by-supplier.csv",
                  ["Supplier", "Paid Amount"], vendorRows.map((v) => [v.vendor, v.amount]))}>
                  <Download size={14} /> Export Spend
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceExpenseMgmt;
