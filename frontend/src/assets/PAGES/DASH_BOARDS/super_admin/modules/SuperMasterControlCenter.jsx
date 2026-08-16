import React, { useState, useEffect } from "react";
import { Database, ShieldAlert, Power, Play, UserPlus, Building, CreditCard, CheckCircle2, Pause } from "lucide-react";
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredMasterRequests,
  saveStoredMasterRequests,
  getStoredVendorProfiles,
  saveStoredVendorProfiles,
  getStoredStockItems,
  getStoredPaymentRequests,
  saveStoredPaymentRequests,
  getBudgetAllocations,
  getSystemPauseState,
  setSystemPauseState,
  epsEventBus
} from "../../../../../services/epsApiService";

const SuperMasterControlCenter = () => {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Store per-request step pause states in localstorage
  const [requestPausedSteps, setRequestPausedSteps] = useState(() => {
    const saved = localStorage.getItem("eps_request_paused_steps");
    return saved ? JSON.parse(saved) : {};
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadData = () => {
    setUsers(getStoredUsers());
    setVendors(getStoredVendorProfiles());
    const reqs = getStoredMasterRequests();
    setRequests(reqs);
    if (reqs.length > 0 && !selectedReqId) {
      setSelectedReqId(reqs[0].id || reqs[0].numericId);
    }
    setPayments(getStoredPaymentRequests());
  };

  useEffect(() => {
    loadData();
    const unsub = epsEventBus.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const handleToggleStepPause = (reqId, stepNum) => {
    const current = requestPausedSteps[reqId] || {};
    const updatedReqSteps = { ...current, [stepNum]: !current[stepNum] };
    const updatedAll = { ...requestPausedSteps, [reqId]: updatedReqSteps };
    setRequestPausedSteps(updatedAll);
    localStorage.setItem("eps_request_paused_steps", JSON.stringify(updatedAll));
    epsEventBus.publish({ type: "STEP_PAUSE_UPDATED", data: updatedAll });
    triggerToast(`Step ${stepNum} for Order ${reqId} is now ${updatedReqSteps[stepNum] ? "PAUSED" : "ACTIVE"}`);
  };

  const handleReleasePayment = (payId) => {
    const updated = payments.map(p => {
      if (p.payId === payId) {
        return { ...p, status: "Approved & Wired" };
      }
      return p;
    });
    setPayments(updated);
    saveStoredPaymentRequests(updated);
    triggerToast(`Payment ${payId} approved & wired successfully!`);
  };

  const handleAddUser = () => {
    const name = prompt("Enter new user name:");
    if (!name) return;
    const newU = { id: `USR-${Math.floor(1000 + Math.random() * 9000)}`, name, role: "Employee", department: "IT", status: "Active" };
    const uList = [...users, newU];
    setUsers(uList);
    saveStoredUsers(uList);
    triggerToast("User added successfully.");
  };

  const handleApproveUser = (id) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: "Active" };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);
    triggerToast("User approved successfully!");
  };

  const handleRemoveUser = (id) => {
    if (!window.confirm("Remove this user?")) return;
    const uList = users.filter(u => u.id !== id);
    setUsers(uList);
    saveStoredUsers(uList);
    triggerToast("User removed.");
  };

  const handleAddVendor = () => {
    const name = prompt("Enter new vendor name:");
    if (!name) return;
    const newV = { id: `V-${Math.floor(1000 + Math.random() * 9000)}`, name, status: "Active" };
    const vList = [...vendors, newV];
    setVendors(vList);
    saveStoredVendorProfiles(vList);
    triggerToast("Vendor added successfully.");
  };

  const handleRemoveVendor = (id) => {
    if (!window.confirm("Remove this vendor?")) return;
    const vList = vendors.filter(v => v.id !== id);
    setVendors(vList);
    saveStoredVendorProfiles(vList);
    triggerToast("Vendor removed.");
  };

  const handleMakePayment = () => {
    const amt = prompt("Enter payment override amount ($):");
    if (!amt) return;
    triggerToast(`Direct payment of ₹${Number(amt || 0).toLocaleString("en-IN")} executed successfully via Super Admin Override.`);
  };

  const selectedRequest = requests.find(r => r.id === selectedReqId || r.numericId === selectedReqId) || requests[0];

  const standardSteps = [
    { num: 1, name: "Requisition Creation" },
    { num: 2, name: "Manager Approval" },
    { num: 3, name: "RFQ Generation" },
    { num: 4, name: "Vendor Bidding" },
    { num: 5, name: "PO Dispatch" },
    { num: 6, name: "Goods Receipt (GRN)" },
    { num: 7, name: "Invoice Audit" },
    { num: 8, name: "Treasury Release" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#dc2626", color: "#fff", padding: "12px 24px", borderRadius: "8px", zIndex: 1000 }}>
          <CheckCircle2 size={16} style={{ marginRight: "8px", display: "inline" }} />
          {toastMsg}
        </div>
      )}

      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "28px", fontWeight: "800", color: "#dc2626" }}>
            <ShieldAlert color="#dc2626" size={32} /> Super Admin Control Center
          </h1>
          <p style={{ color: "#666", fontSize: "15px", marginTop: "4px" }}>
            Ultimate system overrides, emergency process pauses, and master entity management.
          </p>
        </div>
        <button onClick={handleMakePayment} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#059669", color: "#fff", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer" }}>
          <CreditCard size={18} /> Direct Payment Override
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
        
        {/* Granular Order Process step control */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "#dc2626" }}>
            <Pause size={18} /> Granular Order Process Controls
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Select Active Order Process:</label>
            <select
              value={selectedReqId}
              onChange={e => setSelectedReqId(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontWeight: "600" }}
            >
              {requests.map(r => (
                <option key={r.id || r.numericId} value={r.id || r.numericId}>
                  {r.id || `REQ-${r.numericId}`} - {r.items?.[0]?.name || "General Request"} ({r.requestor})
                </option>
              ))}
            </select>
          </div>

          {selectedRequest ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "10px", background: "#f9fafb", borderRadius: "6px", marginBottom: "10px", fontSize: "13px" }}>
                <strong>Current Active Step:</strong> Step {selectedRequest.currentStep || 1} ({standardSteps[(selectedRequest.currentStep || 1) - 1]?.name || "Created"})
              </div>
              {standardSteps.map(step => {
                const isPaused = !!requestPausedSteps[selectedRequest.id || selectedRequest.numericId]?.[step.num];
                return (
                  <div key={step.num} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: isPaused ? "#fee2e2" : "#f0fdf4", borderRadius: "8px", border: `1px solid ${isPaused ? "#fca5a5" : "#bbf7d0"}` }}>
                    <span style={{ fontSize: "13px", fontWeight: "600" }}>Step {step.num}: {step.name}</span>
                    <button
                      onClick={() => handleToggleStepPause(selectedRequest.id || selectedRequest.numericId, step.num)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", border: "none", background: isPaused ? "#16a34a" : "#dc2626", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                    >
                      {isPaused ? <Play size={12} /> : <Pause size={12} />}
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#666", fontSize: "14px" }}>No active requisitions found to configure.</p>
          )}
        </div>

        {/* Pending Payments Release */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "#059669" }}>
            <CreditCard size={18} /> Direct Pending Payments Release
          </h3>
          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {payments.filter(p => p.status === "Awaiting CFO Sign-off" || p.status === "Pending").length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>No pending payments requiring approval.</p>
            ) : (
              payments.filter(p => p.status === "Awaiting CFO Sign-off" || p.status === "Pending").map(p => (
                <div key={p.payId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                  <span>
                    <strong>{p.vendor || p.vendorName}</strong> - ${p.amount.toLocaleString()}<br/>
                    <span style={{ color: "#666" }}>Ref: {p.payId}</span>
                  </span>
                  <button
                    onClick={() => handleReleasePayment(p.payId)}
                    style={{ padding: "6px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                  >
                    Release Wire
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Management */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><UserPlus size={18} color="#2563eb" /> Manage Users</h3>
            <button onClick={handleAddUser} style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>+ Add User</button>
          </div>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {users.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span>
                  <strong>{u.name}</strong> ({u.department})<br/>
                  <span style={{ color: "#666" }}>{u.role} • {u.status}</span>
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {u.status === "Pending Approval" && (
                    <button onClick={() => handleApproveUser(u.id)} style={{ color: "#059669", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Approve</button>
                  )}
                  <button onClick={() => handleRemoveUser(u.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Management */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><Building size={18} color="#d97706" /> Manage Vendors</h3>
            <button onClick={handleAddVendor} style={{ background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>+ Add Vendor</button>
          </div>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {vendors.map(v => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span><strong>{v.name}</strong></span>
                <button onClick={() => handleRemoveVendor(v.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Remove</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperMasterControlCenter;
