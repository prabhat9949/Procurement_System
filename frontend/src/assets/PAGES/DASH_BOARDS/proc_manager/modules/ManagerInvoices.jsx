import React, { useState, useEffect } from "react";
import {
  Receipt,
  CheckCircle2,
  Eye,
  FileText,
  IndianRupee,
  AlertTriangle,
  Loader2,
  WifiOff,
  RefreshCw,
  GitCompareArrows,
  Landmark,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const invoiceStatus = (s) =>
  ({
    DRAFT: "Draft", RECEIVED: "Received", UNDER_VERIFICATION: "Under Verification",
    MATCH_PENDING: "Match Pending", MATCHED: "Matched", APPROVED: "Approved",
    REJECTED: "Rejected", PARTIALLY_PAID: "Partially Paid", PAID: "Paid", CANCELLED: "Cancelled",
  }[s] || s);

const invoiceColor = (s) => {
  if (["PAID", "APPROVED", "MATCHED"].includes(s)) return "#059669";
  if (["REJECTED", "CANCELLED"].includes(s)) return "#dc2626";
  if (["RECEIVED", "UNDER_VERIFICATION", "MATCH_PENDING"].includes(s)) return "#d97706";
  return "#64748b";
};

const matchColor = (s) => (s === "MATCHED" ? "#059669" : s === "MISMATCH" ? "#dc2626" : s === "PARTIAL_MATCH" ? "#d97706" : "#64748b");

const paymentColor = (s) => {
  if (s === "PAID") return "#059669";
  if (["CANCELLED", "FAILED", "REFUNDED"].includes(s)) return "#dc2626";
  if (["DRAFT", "SCHEDULED", "APPROVED", "PROCESSING"].includes(s)) return "#d97706";
  return "#64748b";
};

const badge = (text, color) => (
  <span className="pman-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>
    <span className="pman-badge-dot"></span>{text}
  </span>
);

const ManagerInvoices = () => {
  const [tab, setTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [matches, setMatches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, m, pay] = await Promise.all([
        apiGet("/api/invoices?page=0&size=100&sort=invoiceDate&direction=desc").catch(() => null),
        apiGet("/api/three-way-matches?page=0&size=100&sort=matchDate&direction=desc").catch(() => null),
        apiGet("/api/payments?page=0&size=100&sort=paymentDate&direction=desc").catch(() => null),
      ]);
      setInvoices(inv?.content || []);
      setMatches(m?.content || []);
      setPayments(pay?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load invoice data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div className="pman-invoices-container">
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Receipt color="#f8b400" /> Vendor Invoices & Financial Status
          </h1>
          <p className="pman-page-subtitle">
            Invoice, three-way match and payment visibility for procurement monitoring — Finance remains the action owner.
          </p>
        </div>
        <button className="pman-btn-primary-sm" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {[
          { key: "invoices", label: `Invoices (${invoices.length})`, icon: <FileText size={15} /> },
          { key: "matches", label: `Three-Way Matches (${matches.length})`, icon: <GitCompareArrows size={15} /> },
          { key: "payments", label: `Payments (${payments.length})`, icon: <Landmark size={15} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelected(null); }}
            className="pman-btn-primary-sm"
            style={{
              background: tab === t.key ? "#f8b400" : "#f8f9fb",
              color: tab === t.key ? "#000" : "#555",
              border: "1px solid #d9d9d9",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="pman-card">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
            <Loader2 size={20} className="login-spin" /> Loading financial data…
          </div>
        ) : tab === "invoices" ? (
          invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
              <FileText size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
              <p style={{ fontWeight: 600 }}>No invoices recorded.</p>
            </div>
          ) : (
            <div className="pman-table-container">
              <table className="pman-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Vendor</th>
                    <th>PO</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 800, color: "#d97706" }}>{i.invoiceNumber}</td>
                      <td style={{ fontWeight: 600 }}>{i.vendorName}</td>
                      <td style={{ color: "#555" }}>{i.purchaseOrderId || "—"}</td>
                      <td style={{ color: "#666", fontSize: 13 }}>{formatDateIN(i.invoiceDate, { withTime: false })}</td>
                      <td style={{ color: "#666", fontSize: 13 }}>{i.dueDate ? formatDateIN(i.dueDate, { withTime: false }) : "—"}</td>
                      <td style={{ fontWeight: 800 }}>{formatINR(i.grandTotal)}</td>
                      <td>{badge(invoiceStatus(i.status), invoiceColor(i.status))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : tab === "matches" ? (
          matches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
              <GitCompareArrows size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
              <p style={{ fontWeight: 600 }}>No three-way matches yet.</p>
            </div>
          ) : (
            <div className="pman-table-container">
              <table className="pman-table">
                <thead>
                  <tr>
                    <th>Match No.</th>
                    <th>PO</th>
                    <th>GRN</th>
                    <th>Invoice</th>
                    <th>Vendor</th>
                    <th>Result</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 800, color: "#d97706" }}>{m.matchNumber}</td>
                      <td style={{ color: "#555" }}>{m.purchaseOrderNumber}</td>
                      <td style={{ color: "#555" }}>{m.goodsReceiptNoteNumber || "—"}</td>
                      <td style={{ color: "#555" }}>{m.invoiceNumber || "—"}</td>
                      <td style={{ fontWeight: 600 }}>{m.vendorName}</td>
                      <td>{badge(m.overallResult || m.status, matchColor(m.overallResult || m.status))}</td>
                      <td style={{ color: "#555", fontSize: 13 }}>{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
            <Landmark size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
            <p style={{ fontWeight: 600 }}>No payments recorded.</p>
          </div>
        ) : (
          <div className="pman-table-container">
            <table className="pman-table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Vendor</th>
                  <th>Invoice</th>
                  <th>Payment Date</th>
                  <th>Net Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: "#d97706" }}>{p.paymentNumber}</td>
                    <td style={{ fontWeight: 600 }}>{p.vendorName}</td>
                    <td style={{ color: "#555" }}>{p.invoiceNumber || "—"}</td>
                    <td style={{ color: "#666", fontSize: 13 }}>{p.paymentDate ? formatDateIN(p.paymentDate, { withTime: false }) : "—"}</td>
                    <td style={{ fontWeight: 800 }}>{formatINR(p.netAmount)}</td>
                    <td>{formatINR(p.paidAmount)}</td>
                    <td>{badge(p.status, paymentColor(p.status))}</td>
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

export default ManagerInvoices;
