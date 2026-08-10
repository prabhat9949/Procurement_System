import React, { useState } from "react";
import {
  Users,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  PlusCircle,
  X,
  ShieldCheck,
  Edit,
  Lock,
  History,
} from "lucide-react";

const initialUsersList = [
  { username: "David Chen", email: "david.chen@enterprise.com", role: "Sourcing Executive", org: "ORG-GLOBAL-HQ", status: "Active", lastActive: "2026-07-27 09:15 AM" },
  { username: "Victoria Vance", email: "victoria.vance@enterprise.com", role: "Finance Manager (CFO)", org: "ORG-GLOBAL-HQ", status: "Active", lastActive: "2026-07-27 08:30 AM" },
  { username: "Arthur Sterling", email: "arthur.sterling@enterprise.com", role: "Auditor", org: "ORG-GLOBAL-HQ", status: "Active", lastActive: "2026-07-27 09:20 AM" },
  { username: "Samantha Sterling", email: "samantha.sterling@enterprise.com", role: "Contact & Support Lead", org: "ORG-GLOBAL-HQ", status: "Active", lastActive: "2026-07-27 09:10 AM" },
  { username: "Suspicious Sourcing Agent", email: "unverified.agent@enterprise.com", role: "Procurement Executive", org: "ORG-LATAM-OFFICE", status: "Suspended", lastActive: "2026-07-20 11:30 AM" }
];

const initialUserActivities = [
  { username: "David Chen", action: "Created Requisition REQ-2026-8921", status: "Pass", timestamp: "2026-07-27 09:12 AM" },
  { username: "Victoria Vance", action: "Approved Wire Transfer PAY-2026-904", status: "Pass", timestamp: "2026-07-27 08:29 AM" },
  { username: "Suspicious Sourcing Agent", action: "Attempted unapproved PO edit override", status: "Denied", timestamp: "2026-07-20 11:28 AM" }
];

const initialRoles = [
  { role: "Employees (Requesters)", users: 120, privileges: "Create Requisition, Track Request", hierarchy: "Level 1 (User)" },
  { role: "Department Managers", users: 12, privileges: "Approve Requisition, Budget Oversight", hierarchy: "Level 2 (Manager)" },
  { role: "Procurement Executives", users: 18, privileges: "RFQ Management, Vendor Evaluation", hierarchy: "Level 2 (Executive)" },
  { role: "Procurement Managers", users: 8, privileges: "Issue Purchase Order, Sign PO", hierarchy: "Level 3 (Senior Manager)" },
  { role: "Vendors / Suppliers", users: 48, privileges: "Submit Quote, Upload Tax Invoice", hierarchy: "Level 1 (External Tenant)" },
  { role: "Super Admins", users: 2, privileges: "Root System Access, Master Control", hierarchy: "Level 5 (Root Admin)" },
];

const initialTemplates = [
  { id: "TMPL-01", name: "Standard Requester Policy", scope: "Procurement Requests (Read/Write), Catalog (Read)", orgScope: "Subsidiary-only", level: "Read/Write" },
  { id: "TMPL-02", name: "Finance Disburser Policy", scope: "Payment Approvals (Read/Write/Approve), Invoice Clearance (Read/Write)", orgScope: "Subsidiary-only", level: "Approve / Disburse" },
  { id: "TMPL-03", name: "Global Governance Auditor Policy", scope: "All Modules Audits (Read-only), compliance monitoring", orgScope: "Tenant-wide (Global)", level: "Read-only Audit" }
];

const OrgUserAnalytics = () => {
  const [users, setUsers] = useState(initialUsersList);
  const [activities, setActivities] = useState(initialUserActivities);
  const [rolesList, setRolesList] = useState(initialRoles);
  const [templates, setTemplates] = useState(initialTemplates);

  const [activeSubTab, setActiveSubTab] = useState("users"); // users, roles, perms
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Create role form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newPrivileges, setNewPrivileges] = useState("");
  const [newHierarchy, setNewHierarchy] = useState("Level 1 (User)");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleToggleStatus = (username) => {
    setUsers(
      users.map((u) => {
        if (u.username === username) {
          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
          triggerToast(`User account ${username} status changed to ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    setSelectedUser(null);
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
    triggerToast(`Custom role ${newRole.role} provisioned successfully!`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="org-user-analytics-container" style={{ padding: "20px" }}>
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
      <div className="org-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="org-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <Users color="#f8b400" size={28} /> Tenant User & Access Control Management
          </h1>
          <p className="org-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Administer mapping profiles, evaluate role hierarchies clearances, toggle account statuses, and audit permission templates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #ececec", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("users")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "users" ? "700" : "500",
            color: activeSubTab === "users" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "users" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Users & Activity Logs
        </button>
        <button
          onClick={() => setActiveSubTab("roles")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "roles" ? "700" : "500",
            color: activeSubTab === "roles" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "roles" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Role Hierarchies Matrix
        </button>
        <button
          onClick={() => setActiveSubTab("perms")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 16px",
            fontSize: "15px",
            fontWeight: activeSubTab === "perms" ? "700" : "500",
            color: activeSubTab === "perms" ? "#d97706" : "#666",
            borderBottom: activeSubTab === "perms" ? "3px solid #f8b400" : "3px solid transparent",
            cursor: "pointer",
          }}
        >
          Permission Templates
        </button>
      </div>

      {/* SUBTAB 1: Users & Activities */}
      {activeSubTab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search bar */}
          <div className="org-card" style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <div style={{ position: "relative", width: "360px" }}>
              <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search Username, Role, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
            {/* Left table users */}
            <div className="org-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
              <div className="org-table-container">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>System Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "700" }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td style={{ fontWeight: "600" }}>{u.role}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: u.status === "Active" ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                              color: u.status === "Active" ? "#059669" : "#dc2626",
                            }}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="org-btn-primary-sm"
                            style={{ padding: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", background: "none" }}
                            onClick={() => setSelectedUser(u)}
                          >
                            <Eye size={13} color="#111" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right log queue */}
            <div className="org-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
                Recent User Activity Logs
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activities.map((a, idx) => (
                  <div key={idx} style={{ padding: "10px", background: "#f8f9fb", borderRadius: "6px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", marginBottom: "4px" }}>
                      <span>{a.username}</span>
                      <span style={{ fontSize: "11px", color: "#777" }}>{a.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, color: "#555" }}>{a.action}</p>
                    <span style={{ color: a.status === "Pass" ? "#059669" : "#dc2626", fontWeight: "800", fontSize: "11px" }}>Status: {a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Role Hierarchies Matrix */}
      {activeSubTab === "roles" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
          {/* Roles Table */}
          <div className="org-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
            <div className="org-table-container">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>System Role</th>
                    <th>Active Headcount</th>
                    <th>Hierarchy level</th>
                    <th>Privileges</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesList.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "800" }}>{r.role}</td>
                      <td style={{ fontWeight: "700", color: "#059669" }}>{r.users} Users</td>
                      <td style={{ color: "#d97706", fontWeight: "700" }}>{r.hierarchy}</td>
                      <td style={{ color: "#666" }}>{r.privileges}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="org-btn-primary-sm"
                          style={{ padding: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", background: "none" }}
                          onClick={() => setSelectedRole(r)}
                        >
                          <Edit size={13} color="#111" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Custom Role */}
          <div className="org-card" style={{ padding: "24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "16px" }}>
              Provision Custom Role Profile
            </h3>
            <form onSubmit={handleCreateRole} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="org-form-group">
                <label className="org-form-label">Role Profile Name *</label>
                <input type="text" placeholder="e.g. Finance Clerk" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="org-form-input" required />
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Hierarchy level *</label>
                <select value={newHierarchy} onChange={(e) => setNewHierarchy(e.target.value)} className="org-form-select">
                  <option value="Level 1 (User)">Level 1 (Baseline Requester)</option>
                  <option value="Level 2 (Executive)">Level 2 (Executive Desk)</option>
                  <option value="Level 3 (Senior Manager)">Level 3 (Department Sign-off)</option>
                </select>
              </div>

              <div className="org-form-group">
                <label className="org-form-label">Baseline Privileges Scope *</label>
                <input type="text" placeholder="e.g. View Audit logs, export compliance PDF" value={newPrivileges} onChange={(e) => setNewPrivileges(e.target.value)} className="org-form-input" required />
              </div>

              <button type="submit" className="org-btn-primary-sm" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
                Provision Role Mapping policy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Permission Templates */}
      {activeSubTab === "perms" && (
        <div className="org-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="org-table-container">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Template Code</th>
                  <th>Policy Template Name</th>
                  <th>Module Scope Parameters</th>
                  <th>Subsidiary Scope</th>
                  <th>Access Clearance Level</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{t.id}</td>
                    <td style={{ fontWeight: "700" }}>{t.name}</td>
                    <td style={{ fontWeight: "600", color: "#555" }}>{t.scope}</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{t.orgScope}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          background: "rgba(5, 150, 105, 0.12)",
                          color: "#059669",
                          padding: "4px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        {t.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User details modal */}
      {selectedUser && (
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
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>USER DETAILS</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  {selectedUser.username}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14.5px" }}>
                <p><strong>Corporate Email:</strong> {selectedUser.email}</p>
                <p><strong>System Role Mapping:</strong> {selectedUser.role}</p>
                <p><strong>Subsidiary Tenant Org:</strong> {selectedUser.org}</p>
                <p><strong>Last Activity Timestamp:</strong> {selectedUser.lastActive}</p>
                <p><strong>Current Access Status:</strong> <strong>{selectedUser.status}</strong></p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="org-btn-primary-sm"
                style={{ background: selectedUser.status === "Active" ? "#dc2626" : "#059669", color: "#fff", border: "none" }}
                onClick={() => handleToggleStatus(selectedUser.username)}
              >
                {selectedUser.status === "Active" ? "Suspend User Account" : "Activate User Account"}
              </button>
              
              <button
                className="org-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedUser(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role details modal */}
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
                  className="org-form-input"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button
                className="org-btn-primary-sm"
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

export default OrgUserAnalytics;
