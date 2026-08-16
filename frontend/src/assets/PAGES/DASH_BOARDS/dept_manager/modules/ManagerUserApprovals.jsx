import React, { useState, useEffect } from "react";
import { UserCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getStoredUsers, saveStoredUsers, epsEventBus } from "../../../../../services/epsApiService";

const ManagerUserApprovals = () => {
  const [users, setUsers] = useState([]);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadUsers = () => {
    setUsers(getStoredUsers());
  };

  useEffect(() => {
    loadUsers();
    const unsub = epsEventBus.subscribe(() => {
      loadUsers();
    });
    return unsub;
  }, []);

  const handleApprove = (id) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: "Active" };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);
    triggerToast("User approved successfully. They can now log in.");
  };

  const handleReject = (id) => {
    if (!window.confirm("Reject and remove this user request?")) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveStoredUsers(updated);
    triggerToast("User request rejected and removed.");
  };

  const pendingUsers = users.filter(u => u.status === "Pending Approval");

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
          <UserCheck color="#d97706" size={28} /> User Access Approvals
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          Review and approve pending employee account registration requests.
        </p>
      </div>

      <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #ececec", maxWidth: "800px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Pending Registration Requests ({pendingUsers.length})</h3>
        {pendingUsers.length === 0 ? (
          <p style={{ color: "#666", fontSize: "14.5px" }}>No registration requests awaiting approval.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingUsers.map(u => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #eee" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#111" }}>{u.name}</h4>
                  <span style={{ fontSize: "12.5px", color: "#666" }}>
                    Email: <strong>{u.email}</strong> • Dept: <strong>{u.department}</strong> • Role: <strong>{u.role}</strong>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleApprove(u.id)} style={{ padding: "8px 16px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                    Approve
                  </button>
                  <button onClick={() => handleReject(u.id)} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerUserApprovals;
