import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Layers,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  Check,
  X,
  Download,
} from "lucide-react";

const initialExpenseCategories = [
  { category: "Hardware & IT Workstations", amount: 520800, percentage: "42%", trend: "+12% MoM" },
  { category: "SaaS Subscriptions & Licenses", amount: 347200, percentage: "28%", trend: "+5% MoM" },
  { category: "Cloud Infrastructure & Servers", amount: 223200, percentage: "18%", trend: "-3% MoM" },
  { category: "Office Furniture & Facilities", amount: 148800, percentage: "12%", trend: "+15% MoM" },
];

const initialExpenseClaims = [
  { claimId: "CLM-EXP-551", employee: "David Chen", dept: "Engineering & IT", category: "Hardware accessories", amount: 340.00, receipt: "Keyboard_Mouse_Receipt.pdf", status: "Pending Approval" },
  { claimId: "CLM-EXP-552", employee: "Emily Watson", dept: "HR & Operations", category: "Office catering team building", amount: 820.00, receipt: "Catering_Slip.pdf", status: "Pending Approval" },
];

const initialMonthlySummary = [
  { date: "2026-07-26", id: "TXN-7009", category: "Hardware & IT Workstations", desc: "Apple Developer workstations", amount: 36990.00, status: "Paid" },
  { date: "2026-07-25", id: "TXN-7005", category: "Cloud Infrastructure & Servers", desc: "AWS Hosting monthly subscription", amount: 14500.00, status: "Outstanding" },
  { date: "2026-07-22", id: "TXN-6998", category: "SaaS Subscriptions & Licenses", desc: "Enterprise Slack license renewal", amount: 8200.00, status: "Paid" },
  { date: "2026-07-20", id: "TXN-6981", category: "Office Furniture & Facilities", desc: "Herman Miller Aeron chairs", amount: 7995.00, status: "Outstanding" },
];

const FinanceExpenseMgmt = () => {
  const [categories, setCategories] = useState(initialExpenseCategories);
  const [claims, setClaims] = useState(initialExpenseClaims);
  const [transactions, setTransactions] = useState(initialMonthlySummary);
  const [activeSubTab, setActiveSubTab] = useState("overview"); // overview, claims, logs
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleClaimAction = (claimId, isApproved) => {
    const claim = claims.find(c => c.claimId === claimId);
    if (!claim) return;

    if (isApproved) {
      // Add transaction
      const newTxn = {
        date: new Date().toISOString().split("T")[0],
        id: `TXN-${7010 + transactions.length}`,
        category: claim.category.includes("Hardware") ? "Hardware & IT Workstations" : "Office Furniture & Facilities",
        desc: `${claim.category} reimbursement - ${claim.employee}`,
        amount: claim.amount,
        status: "Paid",
      };
      setTransactions([newTxn, ...transactions]);
      triggerToast(`Claim ${claimId} approved and disbursed!`);
    } else {
      triggerToast(`Claim ${claimId} rejected.`);
    }

    setClaims(claims.filter(c => c.claimId !== claimId));
  };

  // Outstanding sum calculation
  const totalOutstanding = transactions
    .filter(t => t.status === "Outstanding")
    .reduce((sum, current) => sum + current.amount, 0);

  return (
    <div className="fin-expense-mgmt-container" style={{ padding: "20px" }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: "4px solid #f8b400",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="fin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="fin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <TrendingUp color="#f8b400" size={28} /> Procurement Expense & Outflow Desk
          </h1>
          <p className="fin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Analyze categorical spending, authorize employee reimbursement claims, monitor outstanding liabilities, and review trends.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("overview")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "overview" ? "700" : "500",
            color: activeSubTab === "overview" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "overview" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Expense Breakdown & Trends
        </button>
        <button
          onClick={() => setActiveSubTab("claims")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "claims" ? "700" : "500",
            color: activeSubTab === "claims" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "claims" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Reimbursement Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveSubTab("logs")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "logs" ? "700" : "500",
            color: activeSubTab === "logs" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "logs" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Recent Outflow Logs
        </button>
      </div>

      {/* 1. Overview Workspace */}
      {activeSubTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Top KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="fin-card" style={{ padding: "20px", background: "#f8f9fb", border: "1px solid #eee", borderRadius: "12px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Total Outstanding Accrued Liabilities</span>
              <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#dc2626", marginTop: "4px" }}>
                ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: "12.5px", color: "#666", marginTop: "2px" }}>
                Verified supplier invoices awaiting direct wire release.
              </p>
            </div>
            
            <div className="fin-card" style={{ padding: "20px", background: "#f8f9fb", border: "1px solid #eee", borderRadius: "12px" }}>
              <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase" }}>Category Outflow Distribution</span>
              <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#059669", marginTop: "4px" }}>
                $1,239,800.00 YTD
              </h2>
              <p style={{ fontSize: "12.5px", color: "#666", marginTop: "2px" }}>
                Total cumulative spending logged across tech and general supply categories.
              </p>
            </div>
          </div>

          {/* Grid of Categories & Trends */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {categories.map((exp, idx) => (
              <div key={idx} className="fin-card fin-card-gold-glow" style={{ padding: "20px", position: "relative" }}>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>CATEGORY #{idx + 1}</span>
                <h3 style={{ fontSize: "17px", color: "#111", fontWeight: "700", marginTop: "4px" }}>{exp.category}</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "12px" }}>
                  <p style={{ fontSize: "22px", color: "#059669", fontWeight: "800", margin: 0 }}>
                    ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span style={{ fontSize: "12.5px", fontWeight: "700", color: exp.trend.includes("-") ? "#059669" : "#dc2626" }}>
                    {exp.trend}
                  </span>
                </div>
                
                <p style={{ fontSize: "13px", color: "#666", margin: "6px 0 0" }}>{exp.percentage} of YTD Total Outflow</p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 2. Claims Workspace */}
      {activeSubTab === "claims" && (
        <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
            Employee Reimbursements Approval Desk
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                No active employee reimbursement claims pending treasury clearance.
              </div>
            ) : (
              claims.map((c) => (
                <div key={c.claimId} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "16px", background: "#f8f9fb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{c.claimId} • {c.dept}</span>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "2px 0 4px" }}>
                      {c.employee} - {c.category}
                    </h4>
                    <span style={{ fontSize: "12.5px", color: "#666" }}>Attached slip: <strong style={{ color: "#3b82f6" }}>{c.receipt}</strong></span>
                  </div>

                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <strong style={{ fontSize: "18px", color: "#059669" }}>${c.amount.toFixed(2)}</strong>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleClaimAction(c.claimId, false)}
                        className="fin-btn-reject"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <X size={14} /> Reject Claim
                      </button>
                      <button
                        onClick={() => handleClaimAction(c.claimId, true)}
                        className="fin-btn-approve"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Check size={14} /> Approve Claim
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Transaction Logs Workspace */}
      {activeSubTab === "logs" && (
        <div className="fin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Post Date</th>
                  <th>Transaction ID</th>
                  <th>Budget Category</th>
                  <th>Outflow Description</th>
                  <th>Outflow Amount</th>
                  <th>Liability Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{t.id}</td>
                    <td style={{ fontWeight: "700" }}>{t.category}</td>
                    <td style={{ color: "#555" }}>{t.desc}</td>
                    <td style={{ fontWeight: "800", color: t.status === "Paid" ? "#059669" : "#dc2626" }}>
                      ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: t.status === "Paid" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                          color: t.status === "Paid" ? "#059669" : "#dc2626",
                          border: `1px solid ${t.status === "Paid" ? "rgba(5, 150, 105, 0.3)" : "rgba(220, 38, 38, 0.3)"}`
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
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

export default FinanceExpenseMgmt;
