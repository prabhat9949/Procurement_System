import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, Loader2, WifiOff, Download, FileText, Send, ShoppingBag } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const VendorReports = () => {
  const [quotes, setQuotes] = useState([]);
  const [pos, setPos] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [q, p, pay] = await Promise.all([
        apiGet("/api/vendor/my/quotations?page=0&size=100&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/vendor/my/purchase-orders?page=0&size=100&sort=orderDate&direction=desc").catch(() => null),
        apiGet("/api/vendor/my/payments?page=0&size=100").catch(() => null),
      ]);
      setQuotes(q?.content || []);
      setPos(p?.content || []);
      setPayments(pay?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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

  const poValue = pos.reduce((a, p) => a + Number(p.grandTotal || 0), 0);
  const paidValue = payments.filter((p) => p.status === "PAID" || p.status === "PARTIALLY_PAID").reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);

  return (
    <div style={{ padding: "20px" }}>
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderKanban color="#f8b400" /> Reports & Activity
          </h1>
          <p className="vnd-page-subtitle">Your transaction activity — generated from the live database. No documents are fabricated.</p>
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
          <Loader2 size={22} className="login-spin" /> Generating reports...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>QUOTATIONS</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#2563eb", margin: "4px 0" }}>{quotes.length}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PURCHASE ORDERS</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{pos.length}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PO VALUE</span>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{formatINR(poValue)}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PAID VALUE</span>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(paidValue)}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <button className="vnd-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("my-quotations.csv",
                ["Quotation", "RFQ", "Grand Total", "Status", "Submitted"],
                quotes.map((q) => [q.quotationNumber, q.rfqNumber, q.grandTotal, q.status, q.createdAt]))}>
              <Download size={16} /> Export Quotations
            </button>
            <button className="vnd-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("my-purchase-orders.csv",
                ["PO", "Vendor", "Grand Total", "Status", "Order Date"],
                pos.map((p) => [p.poNumber, p.vendorName, p.grandTotal, p.status, p.orderDate]))}>
              <Download size={16} /> Export Purchase Orders
            </button>
            <button className="vnd-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("my-payments.csv",
                ["Payment", "Invoice", "Net Amount", "Date", "Status"],
                payments.map((p) => [p.paymentNumber, p.invoiceNumber, p.netAmount, p.paymentDate, p.status]))}>
              <Download size={16} /> Export Payments
            </button>
          </div>

          <div className="vnd-card" style={{ overflow: "hidden" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingBag size={16} color="#d97706" /> Recent Purchase Orders
            </h4>
            <div className="vnd-table-container">
              <table className="vnd-table">
                <thead>
                  <tr><th>PO</th><th>Request</th><th>Grand Total</th><th>Order Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {pos.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No purchase orders yet.</td></tr>
                  ) : pos.slice(0, 15).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{p.poNumber}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{p.requestNumber}</td>
                      <td style={{ fontWeight: "700" }}>{formatINR(p.grandTotal)}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(p.orderDate, { withTime: false })}</td>
                      <td><span className="lro-badge" style={{ background: p.status === "FULLY_RECEIVED" || p.status === "CLOSED" ? "rgba(5,150,105,.12)" : "rgba(37,99,235,.12)", color: p.status === "FULLY_RECEIVED" || p.status === "CLOSED" ? "#059669" : "#2563eb" }}>{p.status}</span></td>
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

export default VendorReports;
