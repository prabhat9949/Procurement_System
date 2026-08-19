import React, { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Landmark,
  CreditCard,
  RefreshCw,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const countFormat = new Intl.NumberFormat("en-IN");
const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const FinancialMonitoring = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [kpis, setKpis] = useState({ totalBudget: 0, allocated: 0, consumed: 0, remaining: 0, pendingInvoices: 0, paidAmount: 0, pendingPayment: 0, approvedPayments: 0 });

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [invoiceData, paymentData] = await Promise.all([
        apiGet("/api/invoices?page=0&size=100").catch((e) => { console.warn("Invoices API failed:", e.message); return null; }),
        apiGet("/api/payments?page=0&size=100").catch((e) => { console.warn("Payments API failed:", e.message); return null; }),
      ]);

      const invoiceList = invoiceData?.content || [];
      const paymentList = paymentData?.content || [];

      setInvoices(invoiceList);
      setPayments(paymentList);

      // Calculate KPIs from real data
      const totalInvoiceAmount = invoiceList.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
      const totalPaid = invoiceList.filter((inv) => inv.paymentStatus === "PAID" || inv.status === "PAID").reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
      const pendingInv = invoiceList.filter((inv) => inv.paymentStatus === "PENDING" || inv.status === "PENDING").length;
      const paidPayments = paymentList.filter((p) => p.status === "PAID" || p.status === "COMPLETED").reduce((sum, p) => sum + (Number(p.netAmount) || 0), 0);
      const pendingPayments = paymentList.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length;
      const approvedPayments = paymentList.filter((p) => p.status === "APPROVED").length;

      setKpis({
        totalBudget: totalInvoiceAmount,
        allocated: totalInvoiceAmount,
        consumed: totalPaid,
        remaining: totalInvoiceAmount - totalPaid,
        pendingInvoices: pendingInv,
        paidAmount: paidPayments,
        pendingPayment: pendingPayments,
        approvedPayments: approvedPayments,
      });
    } catch (err) {
      setError(err.message || "Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div style={{ padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1200, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
            <IndianRupee color="#059669" size={28} /> Financial Monitoring
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Organization-wide budget, invoice and payment tracking — live from the finance tables.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={loadData} disabled={loading}>
          <RefreshCw size={15} className={loading ? "login-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <KpiCard label="Total Budget" value={kpis.totalBudget} icon={Landmark} color="#059669" format="inr" />
        <KpiCard label="Allocated Budget" value={kpis.allocated} icon={Landmark} color="#2563eb" format="inr" />
        <KpiCard label="Consumed Budget" value={kpis.consumed} icon={CreditCard} color="#dc2626" format="inr" />
        <KpiCard label="Remaining Budget" value={kpis.remaining} icon={IndianRupee} color="#059669" format="inr" />
        <KpiCard label="Pending Invoices" value={kpis.pendingInvoices} icon={FileText} color="#d97706" />
        <KpiCard label="Paid Amount" value={kpis.paidAmount} icon={CreditCard} color="#059669" format="inr" />
        <KpiCard label="Pending Payments" value={kpis.pendingPayment} icon={AlertCircle} color="#dc2626" />
        <KpiCard label="Approved Payments" value={kpis.approvedPayments} icon={CheckCircle2} color="#2563eb" />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Invoices Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden", marginBottom: "18px" }}>
        <div style={{ padding: "20px 20px 0" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#111" }}>Invoices</h3>
        </div>
        {invoices.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "#888" }}>No invoices found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Invoice No.</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>PO</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Vendor</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Payment Status</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 20).map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: "#059669", fontSize: "13px" }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#555" }}>{inv.poNumber || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#555" }}>{inv.vendorName || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, textAlign: "right" }}>{inv.grandTotal != null ? moneyFormat.format(inv.grandTotal) : "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: inv.status === "PAID" ? "rgba(5,150,105,.12)" : inv.status === "PENDING" ? "rgba(217,119,6,.12)" : "#f1f3f5", color: inv.status === "PAID" ? "#059669" : inv.status === "PENDING" ? "#d97706" : "#666" }}>{inv.status || "PENDING"}</span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: inv.paymentStatus === "PAID" ? "rgba(5,150,105,.12)" : inv.paymentStatus === "PENDING" ? "rgba(217,119,6,.12)" : "#f1f3f5", color: inv.paymentStatus === "PAID" ? "#059669" : inv.paymentStatus === "PENDING" ? "#d97706" : "#666" }}>{inv.paymentStatus || "PENDING"}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12.5, color: "#888", whiteSpace: "nowrap" }}>{formatDateIN(inv.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "20px 20px 0" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#111" }}>Payments</h3>
        </div>
        {payments.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "#888" }}>No payments found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Payment No.</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>PO</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Vendor</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Reference</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 20).map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: "#2563eb", fontSize: "13px" }}>{p.paymentNumber}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#555" }}>{p.poNumber || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#555" }}>{p.vendorName || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, textAlign: "right" }}>{p.netAmount != null ? moneyFormat.format(p.netAmount) : "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: p.status === "PAID" || p.status === "COMPLETED" ? "rgba(5,150,105,.12)" : p.status === "PENDING" ? "rgba(217,119,6,.12)" : p.status === "APPROVED" ? "rgba(37,99,235,.12)" : "#f1f3f5", color: p.status === "PAID" || p.status === "COMPLETED" ? "#059669" : p.status === "PENDING" ? "#d97706" : p.status === "APPROVED" ? "#2563eb" : "#666" }}>{p.status || "PENDING"}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#555" }}>{p.paymentReference || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12.5, color: "#888", whiteSpace: "nowrap" }}>{formatDateIN(p.updatedAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function KpiCard({ label, value, icon: Icon, color, format }) {
  const raw = value ?? 0;
  const display = format === "inr" ? moneyFormat.format(raw) : countFormat.format(raw);
  return (
    <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}14`, color: color, flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{display}</div>
        <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{label}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: "#f8f9fb", border: "1px solid #ececec", borderRadius: 9, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px", color: "#888", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>{value || "—"}</div>
    </div>
  );
}

export default FinancialMonitoring;