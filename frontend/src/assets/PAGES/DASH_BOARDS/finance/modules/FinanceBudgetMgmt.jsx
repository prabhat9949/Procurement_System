import React, { useState } from "react";
import {
  PieChart,
  DollarSign,
  Building2,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Download,
  Check,
  X,
} from "lucide-react";

const initialBudgets = [
  { id: "COST-101", dept: "Engineering & IT", allocated: 750000, consumed: 620000, type: "Procurement & Hardware" },
  { id: "COST-102", dept: "DevOps & Cloud Infra", allocated: 600000, consumed: 312000, type: "Procurement & Hardware" },
  { id: "COST-103", dept: "Product & UI/UX", allocated: 400000, consumed: 168500, type: "General Operations" },
  { id: "COST-104", dept: "Marketing & Growth", allocated: 500000, consumed: 424000, type: "General Operations" },
  { id: "COST-105", dept: "HR & Operations", allocated: 250000, consumed: 144200, type: "General Operations" },
];

const initialRequests = [
  { reqId: "REQ-BDG-201", dept: "Engineering & IT", amount: 80000, reason: "Urgent purchase of M3 Workstation laptops for new hires", status: "Pending Approval" },
  { reqId: "REQ-BDG-202", dept: "Marketing & Growth", amount: 45000, reason: "Q3 global marketing campaign budget overrun", status: "Pending Approval" },
];

const FinanceBudgetMgmt = () => {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [requests, setRequests] = useState(initialRequests);
  const [activeSubTab, setActiveSubTab] = useState("budgets"); // budgets, requests, forecast
  
  // Allocate Form State
  const [allocDept, setAllocDept] = useState("COST-101");
  const [allocAmount, setAllocAmount] = useState("");
  const [allocAction, setAllocAction] = useState("Increase"); // Increase, Decrease

  // Forecast State
  const [growthRate, setGrowthRate] = useState(10); // percent increase
  
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(allocAmount || 0);
    if (amount <= 0) {
      triggerToast("Please enter a valid allocation amount.");
      return;
    }

    setBudgets(
      budgets.map((b) => {
        if (b.id === allocDept) {
          const delta = allocAction === "Increase" ? amount : -amount;
          return {
            ...b,
            allocated: Math.max(0, b.allocated + delta)
          };
        }
        return b;
      })
    );

    triggerToast(`Budget allocation successfully updated for cost center!`);
    setAllocAmount("");
  };

  const handleRequestAction = (reqId, isApproved) => {
    const targetReq = requests.find((r) => r.reqId === reqId);
    if (!targetReq) return;

    if (isApproved) {
      setBudgets(
        budgets.map((b) => {
          if (b.dept === targetReq.dept) {
            return {
              ...b,
              allocated: b.allocated + targetReq.amount
            };
          }
          return b;
        })
      );
      triggerToast(`Approved and allocated additional $${targetReq.amount.toLocaleString()} to ${targetReq.dept}!`);
    } else {
      triggerToast(`Budget extension request ${reqId} rejected.`);
    }

    setRequests(requests.filter((r) => r.reqId !== reqId));
  };

  return (
    <div className="fin-budget-mgmt-container" style={{ padding: "20px" }}>
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
            <PieChart color="#f8b400" size={28} /> Organizational Budget Allocation & Ceiling Control
          </h1>
          <p className="fin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Monitor and distribute departmental spending caps, authorize extension requests, and generate fiscal spending reports.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("budgets")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "budgets" ? "700" : "500",
            color: activeSubTab === "budgets" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "budgets" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Departmental Budgets
        </button>
        <button
          onClick={() => setActiveSubTab("requests")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "requests" ? "700" : "500",
            color: activeSubTab === "requests" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "requests" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Budget Extension Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveSubTab("forecast")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "forecast" ? "700" : "500",
            color: activeSubTab === "forecast" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "forecast" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Budget Forecasting & Reports
        </button>
      </div>

      {/* 1. Departmental Budgets Workspace */}
      {activeSubTab === "budgets" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          
          {/* Table */}
          <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Active Cost Centers & Utilization
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {budgets.map((b) => {
                const remaining = b.allocated - b.consumed;
                const percent = ((b.consumed / b.allocated) * 100).toFixed(1);
                const isOverThreshold = parseFloat(percent) >= 80;

                return (
                  <div key={b.id} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "16px", background: "#f8f9fb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#777", fontWeight: "800" }}>{b.id} • {b.type}</span>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "2px 0 0" }}>{b.dept}</h4>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", color: "#777" }}>Allocated Cap</span>
                        <p style={{ fontSize: "16px", fontWeight: "800", color: "#111", margin: 0 }}>${b.allocated.toLocaleString()}</p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "13px", padding: "10px", background: "#fff", border: "1px solid #eee", borderRadius: "6px", margin: "12px 0" }}>
                      <div>
                        <span style={{ fontSize: "10px", color: "#777" }}>Consumed YTD</span>
                        <p style={{ fontWeight: "700", color: "#059669", margin: 0 }}>${b.consumed.toLocaleString()}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", color: "#777" }}>Remaining Cap</span>
                        <p style={{ fontWeight: "700", color: "#3b82f6", margin: 0 }}>${remaining.toLocaleString()}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: "10px", color: "#777" }}>Spent %</span>
                        <p style={{ fontWeight: "800", color: isOverThreshold ? "#dc2626" : "#d97706", margin: 0 }}>{percent}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "6px", background: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, percent)}%`, height: "100%", background: isOverThreshold ? "#dc2626" : "linear-gradient(90deg, #f8b400, #059669)", borderRadius: "3px" }} />
                    </div>

                    {isOverThreshold && (
                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#dc2626", fontWeight: "700" }}>
                        <AlertTriangle size={14} />
                        <span>Budget utilization has exceeded 80% ceiling limit warnings!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocate Form */}
          <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", height: "fit-content" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <PlusCircle size={18} color="#f8b400" /> Allocate / Adjust Budget
            </h3>

            <form onSubmit={handleAllocateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="fin-form-group">
                <label className="fin-form-label">Select Cost Center</label>
                <select
                  value={allocDept}
                  onChange={(e) => setAllocDept(e.target.value)}
                  className="fin-form-select"
                >
                  {budgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.dept} (${b.allocated.toLocaleString()} Cap)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="fin-form-group">
                  <label className="fin-form-label">Adjustment Type</label>
                  <select
                    value={allocAction}
                    onChange={(e) => setAllocAction(e.target.value)}
                    className="fin-form-select"
                  >
                    <option value="Increase">Increase (+) </option>
                    <option value="Decrease">Decrease (-)</option>
                  </select>
                </div>
                <div className="fin-form-group">
                  <label className="fin-form-label">Amount ($) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={allocAmount}
                    onChange={(e) => setAllocAmount(e.target.value)}
                    className="fin-form-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="fin-btn-approve"
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                Apply Budget Adjustment
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 2. Extensions Requests Workspace */}
      {activeSubTab === "requests" && (
        <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
            Cost Center Extension Approval Pipeline
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {requests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                No active budget extension requests pending treasury action.
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.reqId} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "16px", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{r.reqId} • {r.dept}</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#333", margin: "4px 0" }}>Requested Addition: <strong>${r.amount.toLocaleString()}</strong></p>
                    <span style={{ fontSize: "13px", color: "#666" }}>Reasoning: {r.reason}</span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleRequestAction(r.reqId, false)}
                      className="fin-btn-reject"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleRequestAction(r.reqId, true)}
                      className="fin-btn-approve"
                    >
                      <Check size={14} /> Approve & Credit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Forecasting Workspace */}
      {activeSubTab === "forecast" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          
          {/* Forecasting Slider */}
          <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="#059669" /> Budget Forecasting & Growth Index
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#444" }}>Projected Spending Growth Rate: {growthRate}%</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(e.target.value)}
                  style={{ width: "100%", marginTop: "12px", accentColor: "#f8b400" }}
                />
              </div>

              <div style={{ borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#111", marginBottom: "12px" }}>Next Quarter Projected Spendings</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {budgets.map((b) => {
                    const projected = b.allocated * (1 + growthRate / 100);
                    return (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                        <span>{b.dept}</span>
                        <strong>${projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Budget Reports */}
          <div className="fin-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", height: "fit-content" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "20px" }}>
              Fiscal Spending Reports
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f8f9fb", border: "1px solid #eee", borderRadius: "8px" }}>
                <div>
                  <h4 style={{ fontSize: "13.5px", fontWeight: "700", margin: 0 }}>Q2 Corporate Budget Report</h4>
                  <span style={{ fontSize: "11px", color: "#777" }}>Format: PDF (2.4 MB) • July 2026</span>
                </div>
                <button
                  className="fin-sidebar-toggle"
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                  onClick={() => triggerToast("Downloading Q2 Corporate Budget Report...")}
                >
                  <Download size={14} />
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f8f9fb", border: "1px solid #eee", borderRadius: "8px" }}>
                <div>
                  <h4 style={{ fontSize: "13.5px", fontWeight: "700", margin: 0 }}>Procurement Spend Analysis Report</h4>
                  <span style={{ fontSize: "11px", color: "#777" }}>Format: XLSX (1.8 MB) • June 2026</span>
                </div>
                <button
                  className="fin-sidebar-toggle"
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                  onClick={() => triggerToast("Downloading Procurement Spend Analysis Report...")}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default FinanceBudgetMgmt;
