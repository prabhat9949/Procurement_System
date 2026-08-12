import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShieldCheck,
  Download,
  Search,
  FileText,
  Calendar,
  AlertTriangle,
  History,
  CheckCircle,
  FileCheck2,
} from "lucide-react";
import {
  epsEventBus,
  getStoredVendorInvoices,
  saveStoredVendorInvoices,
} from "../../../../../services/epsApiService";

const initialFinancialAudits = [
  {
    payRef: "PAY-2026-901",
    invRef: "INV-2026-9901",
    vendor: "Apple Business Direct",
    amount: 36990.00,
    bankRoute: "JPMorgan Chase • Acct #4491",
    cfoSignoff: "Victoria Vance (CFO)",
    status: "Verified & Cleared",
    type: "Disbursement",
    taxInfo: "18% GST ($5,642.54)",
    date: "2026-07-26",
  },
  {
    payRef: "PAY-2026-904",
    invRef: "INV-2026-9912",
    vendor: "Dell Technologies",
    amount: 54200.00,
    bankRoute: "Bank of America • Acct #8802",
    cfoSignoff: "Victoria Vance (CFO)",
    status: "Verified & Cleared",
    type: "Disbursement",
    taxInfo: "18% GST ($8,267.80)",
    date: "2026-07-26",
  },
  {
    payRef: "PAY-2026-908",
    invRef: "INV-2026-9877",
    vendor: "HP Inc. Enterprise",
    amount: 4750.00,
    bankRoute: "Wells Fargo • Acct #1109",
    cfoSignoff: "Victoria Vance (CFO)",
    status: "Outstanding Audit Clear",
    type: "Outstanding Payment",
    taxInfo: "18% GST ($724.58)",
    date: "2026-07-27",
  }
];

const initialFinTrails = [
  { eventId: "FIN-TRL-801", ref: "PAY-2026-901", action: "FedWire clearance match", status: "Match OK", date: "2026-07-26", Operator: "Federal Reserve Node" },
  { eventId: "FIN-TRL-802", ref: "INV-2026-9912", action: "GST tax verification compliance check", status: "Pass", date: "2026-07-26", Operator: "Arthur Sterling" },
  { eventId: "FIN-TRL-803", ref: "PAY-2026-908", action: "Outstanding invoice match audit", status: "Awaiting Clear", date: "2026-07-27", Operator: "Arthur Sterling" },
];

const FinancialAudits = () => {
  const [audits, setAudits] = useState(initialFinancialAudits);
  const [trails, setTrails] = useState(initialFinTrails);
  const [invoices, setInvoices] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("txns"); // txns, reports, trails
  const [searchTerm, setSearchTerm] = useState("");

  const loadInvoices = () => {
    setInvoices(getStoredVendorInvoices());
  };

  useEffect(() => {
    loadInvoices();
    const unsub = epsEventBus.subscribe((e) => {
      if (e.type === "VENDOR_INVOICE_CREATED" || e.type === "INVOICE_SUBMITTED" || e.type === "INVOICES_UPDATED") {
        loadInvoices();
      }
    });
    return unsub;
  }, []);

  const handleAuditApprove = (invId) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invId) {
        return { ...inv, status: "Pending Finance Approval" };
      }
      return inv;
    });
    saveStoredVendorInvoices(updated);
    epsEventBus.publish({ type: "INVOICE_SUBMITTED", data: updated.find(i => i.id === invId) });
  };

  const triggerDownload = (filename) => {
    alert(`Initiating download for compliance document: ${filename}`);
  };

  const filteredAudits = audits.filter(
    (a) =>
      a.payRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.invRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="aud-fin-audits-container" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="aud-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <DollarSign color="#f8b400" size={28} /> Financial & Wire Disbursement Audits
          </h1>
          <p className="aud-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Independent reconciliation of bank wire receipts, CFO treasury releases, outstanding payables, and tax compliance records.
          </p>
        </div>

        <button
          className="aud-btn-primary-sm"
          onClick={() => triggerDownload("Financial_Disbursement_Audit_Ledger.csv")}
        >
          <Download size={16} /> Export Treasury Ledger (CSV)
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("txns")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "txns" ? "700" : "500",
            color: activeSubTab === "txns" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "txns" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Payment Transactions & Outlays
        </button>
        <button
          onClick={() => setActiveSubTab("reports")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "reports" ? "700" : "500",
            color: activeSubTab === "reports" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "reports" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Invoice Compliance Audits
        </button>
        <button
          onClick={() => setActiveSubTab("trails")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "trails" ? "700" : "500",
            color: activeSubTab === "trails" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "trails" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Financial Audit Trails
        </button>
      </div>

      {/* Search and Filters */}
      <div className="aud-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search payment or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
              fontSize: "14.5px",
            }}
          />
        </div>
      </div>

      {/* 1. Payment Outlays Tab */}
      {activeSubTab === "txns" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Payment Ref</th>
                  <th>Invoice Ref</th>
                  <th>Beneficiary Supplier</th>
                  <th>Amount</th>
                  <th>Tax Details</th>
                  <th>Bank Routing</th>
                  <th>CFO Signoff</th>
                  <th>Transaction Type</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((f) => (
                  <tr key={f.payRef}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{f.payRef}</td>
                    <td style={{ color: "#666", fontSize: "13px" }}>{f.invRef}</td>
                    <td style={{ fontWeight: "700" }}>{f.vendor}</td>
                    <td style={{ fontWeight: "800", color: "#059669" }}>${f.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: "#666", fontSize: "13px" }}>{f.taxInfo}</td>
                    <td style={{ color: "#555", fontSize: "13px" }}>{f.bankRoute}</td>
                    <td style={{ fontWeight: "600" }}>{f.cfoSignoff}</td>
                    <td style={{ fontSize: "13px", fontWeight: "600" }}>{f.type}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: f.status.includes("Cleared") ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                          color: f.status.includes("Cleared") ? "#059669" : "#d97706",
                        }}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Invoice Compliance Audits Tab */}
      {activeSubTab === "reports" && (
        <div className="aud-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
            Invoice Compliance Audits
          </h3>
          <div className="aud-table-container">
            <table className="aud-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "12px" }}>Invoice ID</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>PO Reference</th>
                  <th style={{ textAlign: "left", padding: "12px" }}>Vendor / Supplier</th>
                  <th style={{ textAlign: "right", padding: "12px" }}>Amount</th>
                  <th style={{ textAlign: "right", padding: "12px" }}>Tax</th>
                  <th style={{ textAlign: "center", padding: "12px" }}>Billing Status</th>
                  <th style={{ textAlign: "right", padding: "12px" }}>Compliance Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.filter(i => i.status === "Pending Auditor Verification").length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                      No invoices awaiting auditor compliance verification.
                    </td>
                  </tr>
                ) : (
                  invoices.filter(i => i.status === "Pending Auditor Verification").map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #ececec" }}>
                      <td style={{ padding: "12px", fontWeight: "800", color: "#d97706" }}>{inv.id}</td>
                      <td style={{ padding: "12px", fontWeight: "700" }}>{inv.poId}</td>
                      <td style={{ padding: "12px" }}>{inv.vendor}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "800", color: "#059669" }}>${(inv.totalAmount || inv.amount * 1.09).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "12px", textAlign: "right", color: "#666" }}>${(inv.taxAmount || inv.amount * 0.09).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "12px", background: "rgba(217, 119, 6, 0.12)", color: "#d97706", border: "1px solid rgba(217,119,6,0.3)" }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <button
                          style={{ background: "#059669", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          onClick={() => handleAuditApprove(inv.id)}
                        >
                          <FileCheck2 size={14} /> Verify Compliance & Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Trails Tab */}
      {activeSubTab === "trails" && (
        <div className="aud-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Payment / Invoice Ref</th>
                  <th>Action Checked</th>
                  <th>Audit Status</th>
                  <th>Date Logged</th>
                  <th>Audited System Node</th>
                </tr>
              </thead>
              <tbody>
                {trails
                  .filter(t => t.ref.toLowerCase().includes(searchTerm.toLowerCase()) || t.eventId.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((t) => (
                    <tr key={t.eventId}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{t.eventId}</td>
                      <td>{t.ref}</td>
                      <td style={{ fontWeight: "600" }}>{t.action}</td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: t.status === "Pass" || t.status === "Match OK" ? "rgba(5, 150, 105, 0.12)" : "rgba(217, 119, 6, 0.12)",
                            color: t.status === "Pass" || t.status === "Match OK" ? "#059669" : "#d97706",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td>{t.date}</td>
                      <td style={{ fontWeight: "600" }}>{t.Operator}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinancialAudits;
