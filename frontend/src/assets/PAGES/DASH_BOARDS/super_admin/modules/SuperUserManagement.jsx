import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Eye,
  Pencil,
  PlusCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Unlock,
  Loader2,
  WifiOff,
  X,
  UserPlus,
  ShieldCheck,
  Building2,
  Banknote,
  AlertTriangle,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../../../../services/apiClient";

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const SuperUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [permTarget, setPermTarget] = useState(null);
  const [roleConfirm, setRoleConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const triggerToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadLookups = useCallback(async () => {
    try {
      const [r, d, cc, m] = await Promise.all([
        apiGet("/api/roles/all").catch(() => []),
        apiGet("/api/departments/all").catch(() => []),
        apiGet("/api/cost-centers/all").catch(() => []),
        apiGet("/api/users").catch(() => []),
      ]);
      setRoles(r || []);
      setDepartments(d || []);
      setCostCenters(cc || []);
      setManagers(m || []);
    } catch {
      /* lookup failures are non-fatal */
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/api/users");
      setUsers(res || []);
    } catch (err) {
      setError(err.message || "Unable to reach the backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadLookups();
  }, [loadUsers, loadLookups]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchesTerm =
        !term ||
        [u.username, u.displayName, u.email, u.roleName, u.roleCode, u.employeeCode, u.departmentName]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term));
      const matchesRole = roleFilter === "all" || u.roleId === Number(roleFilter);
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

  const doSaveUser = async (form, isCreate) => {
    setSaving(true);
    setError("");
    try {
      if (isCreate) {
        await apiPost("/api/users", form);
        triggerToast(`User ${form.username} created successfully.`);
      } else {
        const payload = {
          username: form.username,
          newPassword: form.password || null,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          roleId: form.roleId,
          departmentId: form.departmentId,
          costCenterId: form.costCenterId,
          managerId: form.managerId || null,
          enabled: form.enabled,
          accountLocked: form.accountLocked,
        };
        await apiPut(`/api/users/${form.id}`, payload);
        triggerToast(`User ${form.username} updated successfully.`);
      }
      setEditingUser(null);
      setCreatingUser(false);
      setRoleConfirm(null);
      loadUsers();
      loadLookups();
    } catch (err) {
      triggerToast(err.message || "Failed to save user.", "error");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUser = async (form, isCreate) => {
    // Role changes require an explicit confirmation showing the old and new role.
    if (!isCreate && editingUser && Number(form.roleId) !== Number(editingUser.roleId)) {
      setRoleConfirm({
        user: editingUser,
        newRoleId: form.roleId,
        newRoleName: roleName(form.roleId),
        form,
      });
      return;
    }
    await doSaveUser(form, isCreate);
  };

  const handleSaveOverrides = async (user, items) => {
    try {
      await apiPut(`/api/users/${user.id}/permission-overrides`, items);
      triggerToast(`Permissions updated for ${user.displayName || user.username}.`);
      setPermTarget(null);
    } catch (err) {
      triggerToast(err.message || "Unable to update permissions.", "error");
    }
  };

  const handleToggleStatus = async (u) => {
    setError("");
    try {
      await apiPut(`/api/users/${u.id}/status`, {
        enabled: !u.enabled,
        accountLocked: u.enabled ? u.accountLocked : false,
      });
      triggerToast(u.enabled ? `User ${u.username} deactivated.` : `User ${u.username} activated.`);
      loadUsers();
    } catch (err) {
      triggerToast(err.message || "Failed to update status.", "error");
    }
  };

  const roleName = (id) => roles.find((r) => r.id === Number(id))?.roleName || `Role #${id}`;
  const deptName = (id) => departments.find((d) => d.id === Number(id))?.departmentName || `Dept #${id}`;
  const ccName = (id) => costCenters.find((c) => c.id === Number(id))?.name || `CC #${id}`;

  return (
    <div style={{ padding: "20px", fontFamily: "Inter, sans-serif" }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", background: toast.type === "error" ? "#7f1d1d" : "#111111",
          color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          zIndex: 2000, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.type === "error" ? "#f87171" : "#f8b400"}`,
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          {toast.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />} {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "800", color: "#111", margin: 0 }}>
            <Users color="#f8b400" size={26} /> User Management
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Create, edit, activate, deactivate and manage accounts for every employee, manager and vendor — stored in MySQL.
          </p>
        </div>
        <button onClick={() => setCreatingUser(true)} style={{
          display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", border: "none", borderRadius: "9px",
          background: "linear-gradient(135deg,#f8b400,#d97706)", color: "#111", fontWeight: "800", fontSize: "13.5px", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(217,119,6,.35)",
        }}>
          <UserPlus size={16} /> Create User
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Accounts", value: stats.total, icon: Users, color: "#111" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "#059669" },
          { label: "Disabled", value: stats.disabled, icon: XCircle, color: "#dc2626" },
          { label: "Locked", value: stats.locked, icon: Lock, color: "#d97706" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${card.color}14`, color: card.color, flexShrink: 0 }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#111", lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ padding: "16px 20px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px", marginBottom: "20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}>
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: "260px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search username, name, email, role, department..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px" }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff", cursor: "pointer" }}>
          <option value="all">All Roles</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.roleName}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff", cursor: "pointer" }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="locked">Locked</option>
        </select>
        <button onClick={loadUsers} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 14px", border: "1px solid #d9d9d9", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "13.5px", fontWeight: "700", color: "#444" }}>
          <RefreshCw size={15} className={loading ? "sadmin-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "14px", color: "#991b1b" }}>
          <WifiOff size={20} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14.5px" }}>Could not load user accounts</strong>
            <span style={{ fontSize: "13px" }}>{error}</span>
          </div>
          <button onClick={loadUsers} style={{ background: "#111", color: "#fff", border: "none", padding: "9px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: "600" }}>
            <Loader2 size={22} className="sadmin-spin" /> Loading user accounts...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr>
                  {["Username", "Employee", "Role", "Department", "Cost Center", "Status", "Last Login", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", color: "#7a8999", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: ".4px", padding: "12px", borderBottom: "1px solid #eceef1" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
                    {users.length === 0 ? "No user accounts found. Check that the backend has seeded users." : "No accounts match your filters."}
                  </td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "800", color: "#111" }}>{u.username}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>{u.employeeCode}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "600" }}>{u.displayName}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: "rgba(248,180,0,.14)", color: "#b57a00" }}>{u.roleName || u.roleCode}</span>
                      </td>
                      <td style={{ padding: "12px", color: "#555" }}>{u.departmentName || "—"}</td>
                      <td style={{ padding: "12px", color: "#555" }}>{u.costCenterName || "—"}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", width: "fit-content", background: u.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: u.enabled ? "#059669" : "#dc2626" }}>
                            {u.enabled ? "Active" : "Disabled"}
                          </span>
                          {u.accountLocked && <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", width: "fit-content", background: "rgba(217,119,6,.12)", color: "#d97706" }}>Locked</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "#666", fontSize: "13px" }}>{formatDateTime(u.lastLogin)}</td>
                      <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                        <button title="View details" onClick={() => setSelectedUser(u)} style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", cursor: "pointer", marginRight: "6px", background: "#fff" }}>
                          <Eye size={14} />
                        </button>
                        <button title="Edit profile & role" onClick={() => setEditingUser({ ...u })} style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#f8b400", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "6px" }}>
                          <Pencil size={14} />
                        </button>
                        <button title="Manage permissions" onClick={() => setPermTarget(u)} style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(37,99,235,.1)", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "6px" }}>
                          <KeyRound size={14} />
                        </button>
                        <button title={u.enabled ? "Deactivate" : "Activate"} onClick={() => handleToggleStatus(u)} style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: u.enabled ? "rgba(220,38,38,.1)" : "rgba(5,150,105,.1)", color: u.enabled ? "#dc2626" : "#059669", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                          {u.enabled ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "640px", boxShadow: "0 12px 36px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>USER PROFILE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", margin: 0 }}>{selectedUser.displayName}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "14px" }}>
              <DetailRow label="Username" value={selectedUser.username} />
              <DetailRow label="Employee Code" value={selectedUser.employeeCode} />
              <DetailRow label="Email" value={selectedUser.email} />
              <DetailRow label="Phone" value={selectedUser.phone || "—"} />
              <DetailRow label="Role" value={`${selectedUser.roleName} (${selectedUser.roleCode})`} />
              <DetailRow label="Department" value={selectedUser.departmentName || "—"} />
              <DetailRow label="Cost Center" value={selectedUser.costCenterName || "—"} />
              <DetailRow label="Reporting Manager" value={selectedUser.managerName || "—"} />
              <DetailRow label="Status" value={!selectedUser.enabled ? "Disabled" : selectedUser.accountLocked ? "Active but Locked" : "Active"} />
              <DetailRow label="Last Login" value={formatDateTime(selectedUser.lastLogin)} />
              <DetailRow label="Created" value={formatDateTime(selectedUser.createdAt)} />
              <DetailRow label="Updated" value={formatDateTime(selectedUser.updatedAt)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec", flexWrap: "wrap" }}>
              <button onClick={() => setSelectedUser({ ...selectedUser, showEffective: true })} style={{ padding: "9px 18px", borderRadius: "8px", background: "rgba(37,99,235,.1)", color: "#2563eb", border: "none", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <KeyRound size={14} /> Effective Permissions
              </button>
              <button onClick={() => { setEditingUser({ ...selectedUser }); setSelectedUser(null); }} style={{ padding: "9px 18px", borderRadius: "8px", background: "#111", color: "#f8b400", border: "none", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Pencil size={14} /> Edit Profile
              </button>
              <button onClick={() => setSelectedUser(null)} style={{ padding: "9px 18px", borderRadius: "8px", background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", fontWeight: "700", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {(creatingUser || editingUser) && (
        <UserFormModal
          isCreate={Boolean(creatingUser)}
          user={editingUser}
          roles={roles}
          departments={departments}
          costCenters={costCenters}
          managers={managers}
          saving={saving}
          onSave={handleSaveUser}
          onClose={() => { setCreatingUser(false); setEditingUser(null); }}
        />
      )}

      {/* Role change confirmation */}
      {roleConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "0 12px 36px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>CONFIRM ROLE CHANGE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", margin: 0 }}>{roleConfirm.user.displayName || roleConfirm.user.username}</h3>
              </div>
              <button onClick={() => setRoleConfirm(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", marginBottom: "16px" }}>
                <div style={{ flex: 1, padding: "14px", background: "#f8f9fb", border: "1px solid #ececec", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: "700" }}>Current Role</div>
                  <div style={{ fontWeight: "800", color: "#111", marginTop: 4 }}>{roleConfirm.user.roleName || roleConfirm.user.roleCode}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "#d97706" }}><ArrowRight size={18} /></div>
                <div style={{ flex: 1, padding: "14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#b45309", textTransform: "uppercase", fontWeight: "700" }}>New Role</div>
                  <div style={{ fontWeight: "800", color: "#b45309", marginTop: 4 }}>{roleConfirm.newRoleName}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#666", lineHeight: 1.6 }}>
                The role is stored in the database. After this change the user's effective permissions and
                dashboard will change on their next login, and the Dev Login panel will move the account to the
                new role group. An audit record (USER_ROLE_CHANGED) is created automatically.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button onClick={() => setRoleConfirm(null)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
              <button
                disabled={saving}
                onClick={async () => { try { await doSaveUser(roleConfirm.form, false); } catch (e) { /* toast already shown */ } }}
                style={{ padding: "10px 22px", borderRadius: "8px", background: "linear-gradient(135deg,#f8b400,#d97706)", color: "#111", border: "none", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                {saving ? <Loader2 size={15} className="sadmin-spin" /> : <CheckCircle2 size={15} />} Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User-specific permission overrides */}
      {permTarget && (
        <PermissionOverridesModal
          user={permTarget}
          onSave={(items) => handleSaveOverrides(permTarget, items)}
          onClose={() => setPermTarget(null)}
          onError={(msg) => triggerToast(msg, "error")}
        />
      )}

      {/* Effective permissions modal */}
      {selectedUser?.showEffective && (
        <EffectivePermissionsModal user={selectedUser} onClose={() => setSelectedUser((s) => (s ? { ...s, showEffective: false } : null))} />
      )}

      <style>{`
        @keyframes sadminToastIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .sadmin-spin { animation: sadminSpin .9s linear infinite; }
        @keyframes sadminSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: "700", letterSpacing: ".4px" }}>{label}</div>
    <div style={{ fontWeight: "700", color: "#111", marginTop: "2px", wordBreak: "break-all" }}>{value}</div>
  </div>
);

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", background: "#fff", boxSizing: "border-box",
};

const UserFormModal = ({ isCreate, user, roles, departments, costCenters, managers, saving, onSave, onClose }) => {
  const [form, setForm] = useState({
    id: user?.id || null,
    username: user?.username || "",
    password: "",
    firstName: user?.displayName?.split(" ")[0] || "",
    lastName: user?.displayName?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleId: user?.roleId || "",
    departmentId: user?.departmentId || "",
    costCenterId: user?.costCenterId || "",
    managerId: user?.managerId || "",
    enabled: user?.enabled ?? true,
    accountLocked: user?.accountLocked ?? false,
  });
  const [localError, setLocalError] = useState("");

  const deptCostCenters = useMemo(
    () => (form.departmentId ? costCenters.filter((c) => c.departmentId === Number(form.departmentId)) : costCenters),
    [costCenters, form.departmentId]
  );

  const submit = () => {
    if (!form.username.trim() || form.username.trim().length < 3) { setLocalError("Username must be at least 3 characters."); return; }
    if (isCreate && form.password.length < 8) { setLocalError("Password must be at least 8 characters."); return; }
    if (!form.firstName.trim() || !form.lastName.trim()) { setLocalError("First and last name are required."); return; }
    if (!form.email.trim()) { setLocalError("Email is required."); return; }
    if (!form.roleId) { setLocalError("Please select a role from the dropdown."); return; }
    if (!form.departmentId) { setLocalError("Please select a department from the dropdown."); return; }
    if (!form.costCenterId) { setLocalError("Please select a cost center from the dropdown."); return; }
    setLocalError("");
    onSave({ ...form, username: form.username.trim(), password: form.password || (isCreate ? null : undefined) }, isCreate);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "720px", boxShadow: "0 12px 36px rgba(0,0,0,0.15)", overflow: "hidden", margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{isCreate ? "CREATE USER ACCOUNT" : "EDIT USER PROFILE"}</span>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", margin: 0 }}>{isCreate ? "New User" : user?.displayName || user?.username}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px", maxHeight: "70vh", overflowY: "auto" }}>
          <SectionTitle icon={<Users size={15} color="#f8b400" />} title="Account Credentials" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Username *" hint="Used to sign in. Must be unique.">
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={inputStyle} />
            </Field>
            <Field label={isCreate ? "Password *" : "New Password"} hint={isCreate ? "Minimum 8 characters." : "Leave blank to keep the current password."}>
              <input type="text" value={form.password} placeholder={isCreate ? "Set a password" : "•••••••• (unchanged)"} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <SectionTitle icon={<Users size={15} color="#f8b400" />} title="Personal & Employment Information" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="First Name *"><input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} /></Field>
            <Field label="Last Name *"><input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} /></Field>
            <Field label="Email *"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} /></Field>
            <Field label="Phone"><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></Field>
          </div>

          <SectionTitle icon={<ShieldCheck size={15} color="#f8b400" />} title="Role, Department & Cost Center" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Role *" hint="Loaded from the Roles API.">
              <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} style={inputStyle}>
                <option value="">Select role...</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.roleName} ({r.roleCode})</option>)}
              </select>
            </Field>
            <Field label="Department *" hint="Loaded from the Departments API.">
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value, costCenterId: "" })} style={inputStyle}>
                <option value="">Select department...</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
              </select>
            </Field>
            <Field label="Cost Center *" hint={form.departmentId ? "Filtered by the selected department." : "Select a department first."}>
              <select value={form.costCenterId} onChange={(e) => setForm({ ...form, costCenterId: e.target.value })} style={inputStyle}>
                <option value="">Select cost center...</option>
                {deptCostCenters.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </Field>
            <Field label="Reporting Manager" hint="Optional. Loaded from active users.">
              <select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} style={inputStyle}>
                <option value="">No manager</option>
                {managers.filter((m) => m.id !== form.id).map((m) => <option key={m.id} value={m.id}>{m.displayName} ({m.roleName})</option>)}
              </select>
            </Field>
          </div>

          <SectionTitle icon={<ShieldCheck size={15} color="#f8b400" />} title="Account Status" />
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <ToggleChip active={form.enabled} onToggle={() => setForm({ ...form, enabled: !form.enabled })} activeLabel="Enabled" inactiveLabel="Disabled" activeIcon={<CheckCircle2 size={15} />} />
            <ToggleChip active={!form.accountLocked} onToggle={() => setForm({ ...form, accountLocked: !form.accountLocked })} activeLabel="Not Locked" inactiveLabel="Locked" activeIcon={<Unlock size={15} />} dangerInactive />
          </div>

          {localError && <div style={{ color: "#dc2626", fontSize: "13px", fontWeight: "600", display: "flex", gap: "6px", alignItems: "center" }}><AlertTriangle size={15} /> {localError}</div>}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
          <button onClick={onClose} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ padding: "10px 22px", borderRadius: "8px", background: "linear-gradient(135deg,#f8b400,#d97706)", color: "#111", border: "none", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 14px rgba(217,119,6,.3)" }}>
            {saving ? <Loader2 size={15} className="sadmin-spin" /> : isCreate ? <PlusCircle size={15} /> : <CheckCircle2 size={15} />}
            {saving ? "Saving..." : isCreate ? "Create User" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "13px", fontWeight: "800", color: "#333" }}>{label}</label>
    {children}
    {hint && <span style={{ fontSize: "12px", color: "#999" }}>{hint}</span>}
  </div>
);

const SectionTitle = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", fontWeight: "800", color: "#333", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
    {icon} {title}
  </div>
);

const ToggleChip = ({ active, onToggle, activeLabel, inactiveLabel, activeIcon, dangerInactive }) => (
  <button type="button" onClick={onToggle} style={{
    display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 14px", borderRadius: "10px",
    border: active ? "1px solid rgba(5,150,105,.35)" : "1px solid rgba(220,38,38,.4)",
    background: active ? "rgba(5,150,105,.1)" : "rgba(220,38,38,.08)",
    color: active ? "#059669" : "#dc2626", fontWeight: "800", fontSize: "13px", cursor: "pointer",
  }}>
    {active ? activeIcon : dangerInactive ? <Lock size={15} /> : <XCircle size={15} />}
    {active ? activeLabel : inactiveLabel}
  </button>
);

/**
 * Resolved effective permissions for one user: role defaults plus any
 * user-specific ALLOW/DENY overrides, each showing its source.
 */
const EffectivePermissionsModal = ({ user, onClose }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(`/api/users/${user.id}/effective-permissions`)
      .then((list) => setPermissions(list || []))
      .catch((err) => setError(err.message || "Could not load effective permissions."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const grouped = permissions.reduce((acc, p) => {
    const mod = p.moduleName || "General";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  const allowedCount = permissions.filter((p) => p.allowed).length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "760px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 12px 36px rgba(0,0,0,0.15)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>EFFECTIVE PERMISSIONS</span>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", margin: 0 }}>{user.displayName || user.username} · {user.roleName || user.roleCode}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ececec", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", padding: "4px 12px", borderRadius: "999px", background: "rgba(5,150,105,.12)", color: "#059669" }}>{allowedCount} allowed</span>
          <span style={{ fontSize: "12px", fontWeight: "800", padding: "4px 12px", borderRadius: "999px", background: "rgba(220,38,38,.12)", color: "#dc2626" }}>{permissions.length - allowedCount} denied</span>
          <span style={{ fontSize: "12px", color: "#888", alignSelf: "center" }}>Source shown per permission: ROLE or USER OVERRIDE.</span>
        </div>

        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {error ? (
            <div style={{ color: "#dc2626", fontSize: "13.5px", display: "flex", gap: "8px", alignItems: "center" }}><AlertTriangle size={16} /> {error}</div>
          ) : loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px 0", color: "#888", fontWeight: "600" }}>
              <Loader2 size={20} className="sadmin-spin" /> Resolving effective permissions...
            </div>
          ) : (
            Object.entries(grouped).map(([module, perms]) => (
              <div key={module} style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: "6px" }}>{module}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                  {perms.map((p) => (
                    <div key={p.permissionCode} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "5px 6px", borderRadius: "6px", background: p.allowed ? "rgba(5,150,105,.06)" : "transparent" }}>
                      <span style={{ width: "18px", textAlign: "center", fontWeight: 800, color: p.allowed ? "#059669" : "#dc2626" }}>{p.allowed ? "✓" : "✗"}</span>
                      <span style={{ fontWeight: 600, color: "#333" }}>{p.permissionName}</span>
                      <span style={{ marginLeft: "auto", fontSize: "10.5px", fontWeight: 800, padding: "2px 8px", borderRadius: "999px", background: p.overridden ? "rgba(37,99,235,.12)" : "rgba(100,116,139,.12)", color: p.overridden ? "#2563eb" : "#64748b" }}>
                        {p.overridden ? "USER OVERRIDE" : "ROLE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "8px", background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", fontWeight: "700", cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

/**
 * Per-user permission overrides. Every active permission gets a dropdown:
 * Inherited (default), Allowed (ALLOW) or Denied (DENY). Only explicit
 * overrides are saved — everything else stays inherited from the role.
 */
const PermissionOverridesModal = ({ user, onSave, onClose, onError }) => {
  const [permissions, setPermissions] = useState([]);
  const [overrides, setOverrides] = useState({}); // permissionId → ALLOW | DENY
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const [all, existing] = await Promise.all([
          apiGet("/api/permissions/all"),
          apiGet(`/api/users/${user.id}/permission-overrides`),
        ]);
        setPermissions((all || []).filter((p) => p.active !== false));
        const map = {};
        (existing || []).forEach((o) => { map[o.permissionId] = o.access; });
        setOverrides(map);
      } catch (err) {
        onError(err.message || "Could not load permissions.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const modules = ["All", ...Array.from(new Set(permissions.map((p) => p.moduleName || "General")))];
  const q = searchTerm.trim().toLowerCase();
  const filtered = permissions.filter((p) => {
    const matchesModule = moduleFilter === "All" || (p.moduleName || "General") === moduleFilter;
    const matchesSearch =
      !q ||
      (p.permissionCode || "").toLowerCase().includes(q) ||
      (p.permissionName || "").toLowerCase().includes(q);
    return matchesModule && matchesSearch;
  });
  const grouped = filtered.reduce((acc, p) => {
    const mod = p.moduleName || "General";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  const save = () => {
    const items = Object.entries(overrides)
      .filter(([, access]) => access === "ALLOW" || access === "DENY")
      .map(([permissionId, access]) => ({ permissionId: Number(permissionId), access }));
    setSaving(true);
    onSave(items);
    // onSave triggers the toast + closes on success via the parent handler
    setTimeout(() => setSaving(false), 1200);
  };

  const selectStyle = {
    padding: "5px 8px",
    borderRadius: "7px",
    border: "1px solid #d9d9d9",
    fontSize: "12.5px",
    background: "#fff",
    cursor: "pointer",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "820px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 12px 36px rgba(0,0,0,0.15)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>USER-SPECIFIC PERMISSIONS</span>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", margin: 0 }}>{user.displayName || user.username}</h3>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#666" }}>
              Role: {user.roleName || user.roleCode} — overrides apply on top of the role defaults.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ padding: "14px 20px", borderBottom: "1px solid #ececec", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={15} color="#666" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search permission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "13.5px", boxSizing: "border-box" }}
            />
          </div>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "13px", background: "#fff", cursor: "pointer" }}>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px 0", color: "#888", fontWeight: "600" }}>
              <Loader2 size={20} className="sadmin-spin" /> Loading permissions...
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>No permissions match your filters.</div>
          ) : (
            Object.entries(grouped).map(([module, perms]) => (
              <div key={module} style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: "6px" }}>{module}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                  {perms.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", padding: "6px 8px", borderRadius: "6px", background: overrides[p.id] ? "rgba(37,99,235,.05)" : "transparent" }}>
                      <span style={{ flex: 1, fontWeight: 600, color: "#333" }}>
                        {p.permissionName}
                        <span style={{ marginLeft: 8, fontSize: "11px", color: "#9aa8b8", fontWeight: 600 }}>{p.permissionCode}</span>
                      </span>
                      <select
                        value={overrides[p.id] || "INHERITED"}
                        onChange={(e) => {
                          const v = e.target.value;
                          setOverrides((o) => {
                            const next = { ...o };
                            if (v === "INHERITED") delete next[p.id];
                            else next[p.id] = v;
                            return next;
                          });
                        }}
                        style={selectStyle}
                      >
                        <option value="INHERITED">Inherited</option>
                        <option value="ALLOW">Allowed</option>
                        <option value="DENY">Denied</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
          <span style={{ marginRight: "auto", fontSize: "12px", color: "#888", alignSelf: "center" }}>
            {Object.values(overrides).filter((a) => a === "ALLOW" || a === "DENY").length} override(s) — saved to the database and audited.
          </span>
          <button onClick={onClose} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: "10px 22px", borderRadius: "8px", background: "linear-gradient(135deg,#f8b400,#d97706)", color: "#111", border: "none", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {saving ? <Loader2 size={15} className="sadmin-spin" /> : <CheckCircle2 size={15} />} Save Overrides
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperUserManagement;
