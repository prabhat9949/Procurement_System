import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  Pencil,
  RefreshCw,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  AlertTriangle,
  X,
  ShieldAlert,
  WifiOff,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const getToken = () => localStorage.getItem("eps_access_token") || "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Role groups shown as quick filters in the dashboard
const ROLE_GROUPS = [
  { label: "All Roles", codes: null },
  { label: "Admin", codes: ["SUPER_ADMIN", "ADMIN"] },
  { label: "HR", codes: ["HR_MANAGER"] },
  { label: "Procurement", codes: ["PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER"] },
  { label: "Finance", codes: ["FINANCE_MANAGER"] },
  { label: "Warehouse", codes: ["WAREHOUSE_MANAGER"] },
  { label: "Vendor", codes: ["VENDOR"] },
  { label: "Employee", codes: ["EMPLOYEE"] },
];

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const generateStrongPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#$%&*!?";
  const all = upper + lower + digits + symbols;
  const pick = (set, n) =>
    Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join("");
  const pwd =
    pick(upper, 2) + pick(lower, 3) + pick(digits, 3) + pick(symbols, 2) + pick(all, 2);
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
};

const SuperUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("all");
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null); // view modal
  const [editingUser, setEditingUser] = useState(null); // edit modal
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const triggerToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/users`, { headers: authHeaders() });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "You are not authorized to view user accounts. Log in as Super Admin."
          );
        }
        throw new Error(`Server error (${res.status}). Please try again.`);
      }
      const body = await res.json();
      setUsers(body.data || []);
    } catch (err) {
      setError(err.message || "Unable to reach the backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || "");
      triggerToast(`${label} copied to clipboard.`);
    } catch {
      triggerToast("Could not copy to clipboard.", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const group = ROLE_GROUPS.find((g) => g.label === roleFilter);
    return users.filter((u) => {
      const matchesTerm =
        !term ||
        [u.username, u.displayName, u.email, u.roleName, u.roleCode, u.employeeCode]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term));
      const matchesRole =
        !group || !group.codes || group.codes.includes(u.roleCode);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.enabled && !u.accountLocked) ||
        (statusFilter === "disabled" && !u.enabled) ||
        (statusFilter === "locked" && u.accountLocked);
      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.enabled && !u.accountLocked).length;
    const disabled = users.filter((u) => !u.enabled).length;
    const locked = users.filter((u) => u.accountLocked).length;
    return { total, active, disabled, locked };
  }, [users]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        username: form.username,
        newPassword: form.password || null,
        enabled: form.enabled,
        accountLocked: form.accountLocked,
      };
      const res = await fetch(`${API_URL}/api/users/${form.id}/credentials`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          body.message ||
            (body.errors ? Object.values(body.errors).join(", ") : "Update failed.")
        );
      }
      triggerToast(
        `Credentials for ${body.data?.username || form.username} updated successfully.`
      );
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      triggerToast(err.message || "Failed to update user.", "error");
    } finally {
      setSaving(false);
    }
  };

  const roleGroupLabel = (roleCode) => {
    const group = ROLE_GROUPS.find(
      (g) => g.codes && g.codes.includes(roleCode)
    );
    return group ? group.label : roleCode;
  };

  // ---------- RENDER ----------
  return (
    <div className="sadmin-user-mgmt-container" style={{ padding: "20px" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: toast.type === "error" ? "#7f1d1d" : "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            zIndex: 2000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: `4px solid ${toast.type === "error" ? "#f87171" : "#f8b400"}`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "sadminToastIn 0.25s ease-out",
          }}
        >
          {toast.type === "error" ? (
            <AlertTriangle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1
            className="sadmin-page-title"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "24px",
              fontWeight: "700",
              color: "#111",
            }}
          >
            <Users color="#f8b400" size={28} />
            User Account Administration
          </h1>
          <p
            className="sadmin-page-subtitle"
            style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}
          >
            View, reveal, and edit the login credentials of every account — employees, HR,
            procurement, finance, warehouse, and vendors.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Total Accounts", value: stats.total, icon: Users, color: "#111" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "#059669" },
          { label: "Disabled", value: stats.disabled, icon: XCircle, color: "#dc2626" },
          { label: "Locked", value: stats.locked, icon: Lock, color: "#d97706" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="sadmin-card"
              style={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: "12px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${card.color}14`,
                  color: card.color,
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div
                  style={{ fontSize: "24px", fontWeight: "800", color: "#111", lineHeight: 1 }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div
        className="sadmin-card"
        style={{
          padding: "16px 20px",
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: "12px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: "260px" }}>
          <Search
            size={16}
            color="#666"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search username, name, email, role, employee code..."
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

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
            fontSize: "14px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {ROLE_GROUPS.map((g) => (
            <option key={g.label} value={g.label}>
              {g.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
            fontSize: "14px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="locked">Locked</option>
        </select>

        <button
          onClick={loadUsers}
          className="sadmin-sidebar-toggle"
          title="Refresh"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 14px",
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            background: "#fff",
            cursor: "pointer",
            fontSize: "13.5px",
            fontWeight: "700",
            color: "#444",
          }}
        >
          <RefreshCw size={15} className={loading ? "sadmin-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            color: "#991b1b",
          }}
        >
          <WifiOff size={20} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14.5px" }}>
              Could not load user accounts
            </strong>
            <span style={{ fontSize: "13px" }}>
              {error} Make sure the backend is running on port 8080 and you are logged in as
              Super Admin.
            </span>
          </div>
          <button
            onClick={loadUsers}
            className="sadmin-btn-primary-sm"
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="sadmin-card"
        style={{
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div className="sadmin-table-container">
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "60px 0",
                color: "#888",
                fontWeight: "600",
              }}
            >
              <Loader2 size={22} className="sadmin-spin" />
              Loading user accounts...
            </div>
          ) : (
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
                      {users.length === 0
                        ? "No user accounts found. Check that the backend has seeded users."
                        : "No accounts match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const revealed = revealedIds.has(u.id);
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: "800", color: "#111" }}>{u.username}</span>
                            <button
                              className="sadmin-sidebar-toggle"
                              title="Copy username"
                              onClick={() => copyText(u.username, "Username")}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#999",
                                display: "inline-flex",
                              }}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          <div style={{ fontSize: "12px", color: "#999" }}>{u.employeeCode}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <code
                              style={{
                                fontFamily: "monospace",
                                background: "#f8f9fb",
                                border: "1px solid #ececec",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "13px",
                                color: revealed ? "#111" : "#999",
                                minWidth: "110px",
                                display: "inline-block",
                              }}
                            >
                              {u.password ? (revealed ? u.password : "••••••••") : "—"}
                            </code>
                            {u.password && (
                              <>
                                <button
                                  className="sadmin-sidebar-toggle"
                                  title={revealed ? "Hide password" : "Reveal password"}
                                  onClick={() => toggleReveal(u.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#666",
                                    display: "inline-flex",
                                  }}
                                >
                                  {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                <button
                                  className="sadmin-sidebar-toggle"
                                  title="Copy password"
                                  onClick={() => copyText(u.password, "Password")}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#999",
                                    display: "inline-flex",
                                  }}
                                >
                                  <Copy size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: "600" }}>{u.displayName}</div>
                          <div style={{ fontSize: "12px", color: "#999" }}>{u.email}</div>
                        </td>
                        <td>
                          <span className="sadmin-badge">{u.roleName || u.roleCode}</span>
                          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                            {roleGroupLabel(u.roleCode)}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "800",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                width: "fit-content",
                                background: u.enabled
                                  ? "rgba(5, 150, 105, 0.12)"
                                  : "rgba(220, 38, 38, 0.12)",
                                color: u.enabled ? "#059669" : "#dc2626",
                              }}
                            >
                              {u.enabled ? "Active" : "Disabled"}
                            </span>
                            {u.accountLocked && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  width: "fit-content",
                                  background: "rgba(217, 119, 6, 0.12)",
                                  color: "#d97706",
                                }}
                              >
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: "#666", fontSize: "13px" }}>
                          {formatDateTime(u.lastLogin)}
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            className="sadmin-sidebar-toggle"
                            title="View details"
                            onClick={() => setSelectedUser(u)}
                            style={{
                              width: "32px",
                              height: "32px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #d9d9d9",
                              borderRadius: "6px",
                              cursor: "pointer",
                              marginRight: "6px",
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="sadmin-sidebar-toggle"
                            title="Edit credentials"
                            onClick={() =>
                              setEditingUser({
                                id: u.id,
                                username: u.username,
                                password: u.password || "",
                                enabled: u.enabled,
                                accountLocked: u.accountLocked,
                              })
                            }
                            style={{
                              width: "32px",
                              height: "32px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#111",
                              color: "#f8b400",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ============ VIEW DETAILS MODAL ============ */}
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
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                background: "#f8f9fb",
                borderBottom: "1px solid #ececec",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
                  USER ACCOUNT DETAILS
                </span>
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

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <DetailRow
                label="Username"
                value={selectedUser.username}
                mono
                onCopy={() => copyText(selectedUser.username, "Username")}
              />
              <DetailRow
                label="Password"
                value={selectedUser.password || "—"}
                mono
                revealable={Boolean(selectedUser.password)}
                onCopy={() => copyText(selectedUser.password, "Password")}
              />
              <DetailRow label="Employee" value={`${selectedUser.displayName} (${selectedUser.employeeCode})`} />
              <DetailRow label="Email" value={selectedUser.email || "—"} />
              <DetailRow label="Role" value={`${selectedUser.roleName} · ${selectedUser.roleCode}`} />
              <DetailRow label="Last Login" value={formatDateTime(selectedUser.lastLogin)} />
              <DetailRow
                label="Status"
                value={
                  !selectedUser.enabled
                    ? "Disabled"
                    : selectedUser.accountLocked
                      ? "Active but Locked"
                      : "Active"
                }
              />
              <DetailRow label="Account Created" value={formatDateTime(selectedUser.createdAt)} />
              <DetailRow label="Last Updated" value={formatDateTime(selectedUser.updatedAt)} />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                padding: "16px 20px",
                background: "#f8f9fb",
                borderTop: "1px solid #ececec",
              }}
            >
              <button
                className="sadmin-btn-primary-sm"
                style={{ background: "#111", color: "#f8b400", border: "none" }}
                onClick={() => {
                  setEditingUser({
                    id: selectedUser.id,
                    username: selectedUser.username,
                    password: selectedUser.password || "",
                    enabled: selectedUser.enabled,
                    accountLocked: selectedUser.accountLocked,
                  });
                  setSelectedUser(null);
                }}
              >
                <Pencil size={14} style={{ verticalAlign: "-2px", marginRight: "6px" }} />
                Edit Credentials
              </button>
              <button
                className="sadmin-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {editingUser && (
        <EditCredentialsModal
          user={editingUser}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditingUser(null)}
        />
      )}

      <style>{`
        @keyframes sadminToastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sadmin-spin {
          animation: sadminSpin 0.9s linear infinite;
        }
        @keyframes sadminSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ---------- Small building blocks ----------

const DetailRow = ({ label, value, mono, revealable, onCopy }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", fontSize: "14px" }}>
      <span style={{ color: "#888", fontWeight: "600", flexShrink: 0 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "right" }}>
        <span
          style={{
            fontWeight: "700",
            color: "#111",
            fontFamily: mono ? "monospace" : "inherit",
            wordBreak: "break-all",
          }}
        >
          {revealable ? (revealed ? value : "••••••••") : value}
        </span>
        {revealable && (
          <button
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? "Hide" : "Reveal"}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "inline-flex" }}
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            title="Copy"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#999", display: "inline-flex" }}
          >
            <Copy size={14} />
          </button>
        )}
      </span>
    </div>
  );
};

const EditCredentialsModal = ({ user, saving, onSave, onClose }) => {
  const [form, setForm] = useState({
    id: user.id,
    username: user.username,
    password: user.password || "",
    enabled: user.enabled,
    accountLocked: user.accountLocked,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = () => {
    if (!form.username.trim()) {
      setLocalError("Username cannot be empty.");
      return;
    }
    if (form.username.trim().length < 3) {
      setLocalError("Username must be at least 3 characters.");
      return;
    }
    if (form.password && form.password.length < 8) {
      setLocalError("New password must be at least 8 characters (leave blank to keep current).");
      return;
    }
    setLocalError("");
    onSave({ ...form, username: form.username.trim(), password: form.password || null });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            background: "#f8f9fb",
            borderBottom: "1px solid #ececec",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>
              EDIT LOGIN CREDENTIALS
            </span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
              {user.username}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Username */}
          <Field label="Username" hint="Used to sign in. Must be unique.">
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={inputStyle}
            />
          </Field>

          {/* Password */}
          <Field
            label="New Password"
            hint="Leave blank to keep the current password. If set, the account password is changed."
          >
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder={user.password ? "•••••••• (unchanged)" : "Set a new password"}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: "110px" }}
              />
              <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "4px" }}>
                <button
                  type="button"
                  title={showPassword ? "Hide" : "Show"}
                  onClick={() => setShowPassword((s) => !s)}
                  style={iconBtnStyle}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  type="button"
                  title="Generate strong password"
                  onClick={() => setForm({ ...form, password: generateStrongPassword(), showPassword: true })}
                  style={iconBtnStyle}
                >
                  <KeyRound size={15} />
                </button>
              </div>
            </div>
          </Field>

          {/* Toggles */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <ToggleChip
              active={form.enabled}
              onToggle={() => setForm({ ...form, enabled: !form.enabled })}
              activeLabel="Enabled"
              inactiveLabel="Disabled"
              activeIcon={<UserCheck size={15} />}
            />
            <ToggleChip
              active={!form.accountLocked}
              onToggle={() => setForm({ ...form, accountLocked: !form.accountLocked })}
              activeLabel="Not Locked"
              inactiveLabel="Locked"
              activeIcon={<Unlock size={15} />}
              dangerInactive
            />
          </div>

          {localError && (
            <div style={{ color: "#dc2626", fontSize: "13px", fontWeight: "600", display: "flex", gap: "6px", alignItems: "center" }}>
              <AlertTriangle size={15} />
              {localError}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            padding: "16px 20px",
            background: "#f8f9fb",
            borderTop: "1px solid #ececec",
          }}
        >
          <button
            className="sadmin-btn-primary-sm"
            style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="sadmin-btn-primary-sm"
            style={{
              background: "#111",
              color: "#f8b400",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={submit}
            disabled={saving}
          >
            {saving ? <Loader2 size={15} className="sadmin-spin" /> : <ShieldAlert size={15} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d9d9d9",
  fontSize: "14px",
  background: "#fff",
  boxSizing: "border-box",
};

const iconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#666",
  display: "inline-flex",
  alignItems: "center",
  padding: "4px",
};

const Field = ({ label, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "13px", fontWeight: "800", color: "#333" }}>{label}</label>
    {children}
    {hint && <span style={{ fontSize: "12px", color: "#999" }}>{hint}</span>}
  </div>
);

const ToggleChip = ({ active, onToggle, activeLabel, inactiveLabel, activeIcon, dangerInactive }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "9px 14px",
      borderRadius: "10px",
      border: active
        ? "1px solid rgba(5, 150, 105, 0.35)"
        : dangerInactive
          ? "1px solid rgba(220, 38, 38, 0.4)"
          : "1px solid rgba(220, 38, 38, 0.4)",
      background: active ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.08)",
      color: active ? "#059669" : "#dc2626",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.15s ease",
    }}
  >
    {active ? activeIcon : dangerInactive ? <Lock size={15} /> : <XCircle size={15} />}
    {active ? activeLabel : inactiveLabel}
  </button>
);

export default SuperUserManagement;
