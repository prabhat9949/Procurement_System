import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  PlusCircle,
  Edit,
  X,
  Trash2,
  RefreshCw,
  Users,
  KeyRound,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../services/apiClient";

const SuperRoleManagement = () => {
  const [rolesList, setRolesList] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null | role object
  const [showDialog, setShowDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  // Create/Edit form state
  const [form, setForm] = useState({
    roleCode: "",
    roleName: "",
    description: "",
    active: true,
    permissionIds: [],
  });

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rolesPage, perms] = await Promise.all([
        apiGet("/api/roles?size=200"),
        apiGet("/api/permissions/all"),
      ]);
      setRolesList(rolesPage?.content || []);
      setPermissions(perms || []);
    } catch (err) {
      setError(err.message || "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setForm({ roleCode: "", roleName: "", description: "", active: true, permissionIds: [] });
    setEditingRole(null);
    setError("");
    setShowDialog(true);
  };

  const openEdit = (role) => {
    setForm({
      roleCode: role.roleCode || "",
      roleName: role.roleName || "",
      description: role.description || "",
      active: role.active ?? true,
      permissionIds: role.permissionIds || [],
    });
    setEditingRole(role);
    setError("");
    setShowDialog(true);
  };

  const togglePermission = (id) => {
    setForm((f) => ({
      ...f,
      permissionIds: f.permissionIds.includes(id)
        ? f.permissionIds.filter((p) => p !== id)
        : [...f.permissionIds, id],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.roleCode.trim() || !form.roleName.trim()) {
      setError("Role code and role name are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        roleCode: form.roleCode.trim().toUpperCase().replace(/\s+/g, "_"),
        roleName: form.roleName.trim(),
        description: form.description || "",
        active: form.active,
        permissionIds: form.permissionIds,
      };
      if (editingRole) {
        await apiPut(`/api/roles/${editingRole.id}`, payload);
        triggerToast(`Role "${form.roleName}" updated and saved to the database.`);
      } else {
        const created = await apiPost("/api/roles", payload);
        if (created?.id && form.permissionIds.length > 0) {
          await apiPut(`/api/roles/${created.id}/permissions`, form.permissionIds);
        }
        triggerToast(`Role "${form.roleName}" created and saved to the database.`);
      }
      setShowDialog(false);
      loadData();
    } catch (err) {
      setError(err.message || "Could not save the role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/roles/${deleteTarget.id}`);
      triggerToast(`Role "${deleteTarget.roleName}" deleted.`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      triggerToast(err.message || "Role could not be deleted.", "err");
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module for the checklist
  const groupedPermissions = permissions.reduce((acc, p) => {
    const mod = p.moduleName || "General";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <div className="sadmin-role-mgmt-container" style={{ padding: "20px" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: toast.tone === "err" ? "#dc2626" : "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}`,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sadmin-page-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="sadmin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <ShieldCheck color="#f8b400" size={28} /> Role Management
          </h1>
          <p className="sadmin-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Roles, permission assignments and RBAC policies — all stored in the database and enforced by the backend.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={loadData} disabled={loading}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="sadmin-btn-primary-sm" onClick={openCreate}>
            <PlusCircle size={15} /> Create Role
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* View Roles */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
              <Loader2 size={20} className="login-spin" /> Loading roles from the database...
            </div>
          ) : (
            <div className="sadmin-table-container">
              <table className="sadmin-table">
                <thead>
                  <tr>
                    <th>Role Code</th>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Assigned Users</th>
                    <th>Permissions</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#888", padding: "32px" }}>
                        No roles found in the database yet. Create one to get started.
                      </td>
                    </tr>
                  )}
                  {rolesList.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: "800", color: "#d97706" }}>{r.roleCode}</td>
                      <td style={{ fontWeight: "700", color: "#111" }}>{r.roleName}</td>
                      <td style={{ color: "#555", fontSize: "13.5px" }}>{r.description || "—"}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#059669" }}>
                          <Users size={14} /> {r.userCount ?? 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#2563eb" }}>
                          <KeyRound size={14} /> {r.permissionIds?.length ?? 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: r.active ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: r.active ? "#059669" : "#dc2626" }}>
                          {r.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          style={{ width: "32px", height: "32px", marginRight: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
                          onClick={() => openEdit(r)}
                          title="Edit Role & Permissions"
                        >
                          <Edit size={14} />
                        </button>
                        {!r.systemRole && (
                          <button
                            style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#dc2626" }}
                            onClick={() => setDeleteTarget(r)}
                            title="Delete Role"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "16px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "720px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", position: "sticky", top: 0, zIndex: 2 }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{editingRole ? "EDIT ROLE" : "CREATE ROLE"}</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>
                  {editingRole ? `Role: ${editingRole.roleName}` : "Provision New Role"}
                </h3>
              </div>
              <button onClick={() => setShowDialog(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: "24px" }}>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13.5px", fontWeight: "600" }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sadmin-form-group">
                  <label className="sadmin-form-label">Role Code *</label>
                  <input type="text" placeholder="e.g. SOURCING_AUDITOR" value={form.roleCode} onChange={(e) => setForm({ ...form, roleCode: e.target.value })} className="sadmin-form-input" disabled={!!editingRole?.systemRole} />
                </div>
                <div className="sadmin-form-group">
                  <label className="sadmin-form-label">Role Name *</label>
                  <input type="text" placeholder="e.g. Sourcing Auditor" value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} className="sadmin-form-input" />
                </div>
              </div>

              <div className="sadmin-form-group" style={{ marginTop: "16px" }}>
                <label className="sadmin-form-label">Description</label>
                <input type="text" placeholder="What is this role responsible for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sadmin-form-input" />
              </div>

              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" id="role-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ width: "17px", height: "17px", accentColor: "#f8b400" }} />
                <label htmlFor="role-active" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Role is active</label>
              </div>

              {/* Permission Checklist */}
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <KeyRound size={16} color="#2563eb" /> Permissions
                  <span style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>({form.permissionIds.length} selected of {permissions.length})</span>
                </h4>
                <p style={{ color: "#888", fontSize: "12.5px", margin: "0 0 12px" }}>
                  These are real permission records from the database. Changes take effect on the next authorization refresh.
                </p>

                {permissions.length === 0 ? (
                  <div style={{ padding: "16px", background: "#f8f9fb", borderRadius: "8px", color: "#666", fontSize: "13.5px" }}>
                    No permissions found. Run the backend seed initializer to create the standard permission set.
                  </div>
                ) : (
                  <div style={{ maxHeight: "320px", overflow: "auto", border: "1px solid #ececec", borderRadius: "10px", padding: "12px" }}>
                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                      <div key={module} style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px" }}>
                          {module}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                          {perms.map((p) => (
                            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "4px 6px", borderRadius: "6px", cursor: "pointer", background: form.permissionIds.includes(p.id) ? "rgba(37,99,235,0.07)" : "transparent" }}>
                              <input type="checkbox" checked={form.permissionIds.includes(p.id)} onChange={() => togglePermission(p.id)} style={{ width: "15px", height: "15px", accentColor: "#2563eb" }} />
                              <span style={{ fontWeight: "500", color: "#333" }}>{p.permissionName || p.permissionCode}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
                <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowDialog(false)}>
                  Cancel
                </button>
                <button type="submit" className="sadmin-btn-primary-sm" disabled={saving}>
                  {saving ? <><Loader2 size={15} className="login-spin" /> Saving...</> : editingRole ? "Save Role Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "28px", textAlign: "center", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
            <AlertCircle size={44} color="#dc2626" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>Delete Role "{deleteTarget.roleName}"?</h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>
              Roles with assigned users or system roles cannot be deleted. This action is audited.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
              <button className="sadmin-btn-primary-sm" style={{ background: "#dc2626", border: "none" }} onClick={handleDelete} disabled={saving}>
                {saving ? <><Loader2 size={15} className="login-spin" /> Deleting...</> : "Yes, Delete"}
              </button>
              <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperRoleManagement;
