import React, { useState } from "react";
import {
  ShieldCheck,
  PlusCircle,
  Eye,
  Settings,
  Edit,
  X,
} from "lucide-react";

const initialRoles = [
  { role: "Employees (Requesters)", users: 840, privileges: "Create Requisition, Track Request", hierarchy: "Level 1 (User)" },
  { role: "Department Managers", users: 48, privileges: "Approve Requisition, Budget Oversight", hierarchy: "Level 2 (Manager)" },
  { role: "Procurement Executives", users: 64, privileges: "RFQ Management, Vendor Evaluation", hierarchy: "Level 2 (Executive)" },
  { role: "Procurement Managers", users: 24, privileges: "Issue Purchase Order, Sign PO", hierarchy: "Level 3 (Senior Manager)" },
  { role: "Vendors (Suppliers)", users: 320, privileges: "Submit Quote, Upload Tax Invoice", hierarchy: "Level 1 (External Tenant)" },
  { role: "Inventory Managers", users: 42, privileges: "Warehouse Intake, Stock Verification", hierarchy: "Level 2 (Manager)" },
  { role: "Finance Managers", users: 28, privileges: "Process Payments, Authorize FedWire", hierarchy: "Level 3 (Senior Manager)" },
  { role: "Auditors", users: 18, privileges: "Audit Ledger Verification, Issue Report", hierarchy: "Level 3 (Governance)" },
  { role: "Contact & Support Team", users: 32, privileges: "Support Tickets, Escalation Routing", hierarchy: "Level 2 (Support)" },
  { role: "Organization Admins (Data Analysts)", users: 14, privileges: "Business Intelligence, Org Overview", hierarchy: "Level 4 (Org Admin)" },
  { role: "Super Admins", users: 6, privileges: "Root System Access, Master Control", hierarchy: "Level 5 (Root Admin)" },
];

const SuperRoleManagement = () => {
  const [rolesList, setRolesList] = useState(initialRoles);
  const [activeSubTab, setActiveSubTab] = useState("view"); // view, create
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Create role form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newPrivileges, setNewPrivileges] = useState("");
  const [newHierarchy, setNewHierarchy] = useState("Level 1 (User)");
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    const newRole = {
      role: newRoleName,
      users: 0,
      privileges: newPrivileges,
      hierarchy: newHierarchy,
    };
    setRolesList([...rolesList, newRole]);
    setNewRoleName("");
    setNewPrivileges("");
    setActiveSubTab("view");
    triggerToast(`Custom role ${newRole.role} provisioned successfully!`);
  };

  return (
    <div className="sadmin-role-mgmt-container" style={{ padding: "20px" }}>
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
      <div className="sadmin-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ShieldCheck color="#f8b400" size={28} /> Enterprise System Roles Matrix
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Audit mapped enterprise profiles, hierarchy clearances, and modify user privilege policies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("view")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "view" ? "700" : "500",
            color: activeSubTab === "view" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "view" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          View Roles & Permissions Map
        </button>
        <button
          onClick={() => setActiveSubTab("create")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "create" ? "700" : "500",
            color: activeSubTab === "create" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "create" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Create Custom Role Profile
        </button>
      </div>

      {/* 1. View Roles */}
      {activeSubTab === "view" && (
        <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Enterprise System Role</th>
                  <th>Active Headcount</th>
                  <th>Hierarchy Level Rank</th>
                  <th>Privileges Scope</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rolesList.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "800", color: "#111" }}>{r.role}</td>
                    <td style={{ fontWeight: "700", color: "#059669" }}>{r.users} Active Users</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{r.hierarchy}</td>
                    <td style={{ color: "#555" }}>{r.privileges}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="sadmin-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                        onClick={() => setSelectedRole(r)}
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Create Role */}
      {activeSubTab === "create" && (
        <div className="sadmin-card" style={{ padding: "28px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", maxWidth: "560px", margin: "0 auto" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
            Provision Custom Role Definition
          </h3>

          <form onSubmit={handleCreateRole} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Role Profile Name *</label>
              <input type="text" placeholder="e.g. Sourcing Auditor" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="sadmin-form-input" required />
            </div>

            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Hierarchy Rank Level *</label>
              <select value={newHierarchy} onChange={(e) => setNewHierarchy(e.target.value)} className="sadmin-form-select">
                <option value="Level 1 (User)">Level 1 (Baseline Requester)</option>
                <option value="Level 2 (Executive)">Level 2 (Executive Desk)</option>
                <option value="Level 3 (Senior Manager)">Level 3 (Department Sign-off)</option>
                <option value="Level 4 (Org Admin)">Level 4 (Tenant Administrator)</option>
              </select>
            </div>

            <div className="sadmin-form-group">
              <label className="sadmin-form-label">Baseline Privileges Scope *</label>
              <input type="text" placeholder="e.g. View Audit logs, export compliance PDF" value={newPrivileges} onChange={(e) => setNewPrivileges(e.target.value)} className="sadmin-form-input" required />
            </div>

            <button type="submit" className="sadmin-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
              Provision Role Mapping policy
            </button>
          </form>
        </div>
      )}

      {/* Role details edit modal */}
      {selectedRole && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>EDIT ROLE PRIVILEGES</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  Role: {selectedRole.role}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14.5px" }}>
                <p><strong>Hierarchy Level:</strong> {selectedRole.hierarchy}</p>
                <p><strong>Active Headcount:</strong> {selectedRole.users} Users</p>
                <p><strong>Current Privileges:</strong></p>
                <input
                  type="text"
                  value={selectedRole.privileges}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRolesList(rolesList.map(r => r.role === selectedRole.role ? { ...r, privileges: val } : r));
                  }}
                  className="sadmin-form-input"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="sadmin-btn-primary-sm"
                onClick={() => setSelectedRole(null)}
              >
                Save Role Config
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperRoleManagement;
