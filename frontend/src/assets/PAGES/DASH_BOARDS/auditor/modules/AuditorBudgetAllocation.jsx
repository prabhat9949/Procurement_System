import React, { useState } from "react";
import { PieChart, PlusCircle, CheckCircle2 } from "lucide-react";
import { getBudgetAllocations, saveBudgetAllocations } from "../../../../../services/epsApiService";

const AuditorBudgetAllocation = () => {
  const [allocations, setAllocations] = useState(getBudgetAllocations());
  const [newDept, setNewDept] = useState("");
  const [newAmt, setNewAmt] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!newDept || !newAmt) return;
    
    const amount = parseFloat(newAmt);
    const newAlloc = {
      id: `ALLOC-${Math.floor(1000 + Math.random() * 9000)}`,
      department: newDept,
      allocatedAmt: amount,
      spentAmt: 0,
      remainingAmt: amount,
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    const updated = [newAlloc, ...allocations];
    setAllocations(updated);
    saveBudgetAllocations(updated);
    
    setNewDept("");
    setNewAmt("");
    triggerToast(`Successfully allocated $${amount.toLocaleString()} to ${newDept}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#059669", color: "#fff", padding: "12px 24px", borderRadius: "8px", zIndex: 1000 }}>
          <CheckCircle2 size={16} style={{ marginRight: "8px", display: "inline" }} />
          {toastMsg}
        </div>
      )}
      
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
          <PieChart color="#d97706" size={28} /> Budget Allocations
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>Allocate funding directly to Finance Management for departmental spending.</p>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Form */}
        <div style={{ flex: "1 1 300px", background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #ececec" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={18} color="#d97706" /> New Allocation
          </h3>
          <form onSubmit={handleAllocate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Department</label>
              <input type="text" value={newDept} onChange={e => setNewDept(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d9d9d9" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Amount ($)</label>
              <input type="number" value={newAmt} onChange={e => setNewAmt(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d9d9d9" }} />
            </div>
            <button type="submit" style={{ padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Allocate Funds
            </button>
          </form>
        </div>

        {/* List */}
        <div style={{ flex: "2 1 500px", background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #ececec" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Current Allocations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {allocations.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #eee" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "700" }}>{a.id} • {a.lastUpdated}</span>
                  <h4 style={{ margin: "4px 0 0", fontSize: "16px", color: "#111" }}>{a.department}</h4>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#666" }}>Allocated Amount</span>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#059669" }}>${a.allocatedAmt.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorBudgetAllocation;
