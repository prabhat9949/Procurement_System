import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, Loader2, WifiOff, Download, FileText, CreditCard } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const FinancialReports = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, pay, cc] = await Promise.all([
        apiGet("/api/invoices?page=0&size=200&sort=invoiceDate&direction=desc").catch(() => null),
        apiGet("/api/payments?page=0&size=200&sort=paymentDate&direction=desc").catch(() => null),
        apiGet("/api/cost-centers?page=0&size=200").catch(() => null),
      ]);
      setInvoices(inv?.content || []);
      setPayments(pay?.content || []);
      setCenters(cc?.content || cc || []);
    } catch (err) {
      setError(err.message || "Unable to load financial reports.");
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

  const totalInvoice = invoices.reduce((a, i) => a + Number(i.grandTotal || 0), 0);
  const paid = payments.filter((p) => p.status === "PAID" || p.status === "PARTIALLY_PAID").reduce((a, p) => a + Number(p.netAmount || p.grossAmount || 0), 0);

  return (
    <div style={{ padding: "20px" }}>
      <div className="fin-page-header">
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderKanban color="#f8b400" /> Financial Reports
          </h1>
          <p className="fin-page-subtitle">Reports generated from the live database — invoices, payments and budgets.</p>
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
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>INVOICE VALUE</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{formatINR(totalInvoice)}</p>
              <span style={{ fontSize: "12px", color: "#666" }}>{invoices.length} invoices</span>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>PAID VALUE</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(paid)}</p>
              <span style={{ fontSize: "12px", color: "#666" }}>{payments.length} payment records</span>
            </div>
            <div className="fin-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>BUDGET UTILISATION</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>
                {centers.reduce((a, c) => a + Number(c.budget || 0), 0) > 0
                  ? Math.round((centers.reduce((a, c) => a + Number(c.usedBudget || 0), 0) / centers.reduce((a, c) => a + Number(c.budget || 0), 0)) * 100) + "%"
                  : "—"}
              </p>
              <span style={{ fontSize: "12px", color: "#666" }}>{centers.length} cost centers</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <button className="fin-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("invoice-register.csv",
                ["Invoice", "Vendor", "Invoice Date", "Due Date", "Subtotal", "Grand Total", "Status"],
                invoices.map((i) => [i.invoiceNumber, i.vendorName, i.invoiceDate, i.dueDate, i.subtotal, i.grandTotal, i.status]))}>
              <Download size={16} /> Export Invoice Register
            </button>
            <button className="fin-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("payment-register.csv",
                ["Payment", "Vendor", "Invoice", "Method", "Gross", "Net", "Date", "Status"],
                payments.map((p) => [p.paymentNumber, p.vendorName, p.invoiceNumber, p.paymentMethod, p.grossAmount, p.netAmount, p.paymentDate, p.status]))}>
              <Download size={16} /> Export Payment Register
            </button>
            <button className="fin-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("budget-register.csv",
                ["Code", "Cost Center", "Department", "Budget", "Spent", "Remaining"],
                centers.map((c) => [c.code, c.name, c.departmentName, c.budget, c.usedBudget, Number(c.budget || 0) - Number(c.usedBudget || 0)]))}>
              <Download size={16} /> Export Budget Register
            </button>
          </div>

          <div className="fin-card" style={{ overflow: "hidden" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={16} color="#d97706" /> Recent Invoices ({invoices.length})
            </h4>
            <div className="fin-table-container">
              <table className="fin-table">
                <thead>
                  <tr><th>Invoice</th><th>Vendor</th><th>Due</th><th>Grand Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No invoices recorded.</td></tr>
                  ) : invoices.slice(0, 25).map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{i.invoiceNumber}</td>
                      <td style={{ fontWeight: 600 }}>{i.vendorName}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(i.dueDate, { withTime: false })}</td>
                      <td style={{ fontWeight: 700 }}>{formatINR(i.grandTotal)}</td>
                      <td><span className="lro-badge" style={{ background: i.status === "PAID" ? "rgba(5,150,105,.12)" : i.status === "REJECTED" || i.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: i.status === "PAID" ? "#059669" : i.status === "REJECTED" || i.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{i.status}</span></td>
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

export default FinancialReports;
