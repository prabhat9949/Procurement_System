import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Landmark,
  FolderTree,
  Package,
  Warehouse as WarehouseIcon,
  Scale,
  PlusCircle,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Database,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

/* ============================== Shared UI ============================== */

const Toast = ({ toast }) =>
  toast && (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1200, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
      {toast.msg}
    </div>
  );

const Modal = ({ title, subtitle, onClose, children, maxWidth = "640px" }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px" }}>
    <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth, maxHeight: "90vh", overflow: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#f8f9fb", borderBottom: "1px solid #ececec", position: "sticky", top: 0, zIndex: 2 }}>
        <div>
          {subtitle && <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>{subtitle}</span>}
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>{title}</h3>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  </div>
);

const ConfirmDialog = ({ title, message, onConfirm, onCancel, busy }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}>
    <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "28px", textAlign: "center", boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
      <AlertCircle size={44} color="#dc2626" style={{ margin: "0 auto 14px" }} />
      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: 0 }}>{title}</h3>
      <p style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>{message}</p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
        <button className="sadmin-btn-primary-sm" style={{ background: "#dc2626", border: "none" }} onClick={onConfirm} disabled={busy}>
          {busy ? <><Loader2 size={15} className="login-spin" /> Deleting...</> : "Yes, Delete"}
        </button>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div className="sadmin-form-group">
    <label className="sadmin-form-label">{label} {required && "*"}</label>
    {children}
  </div>
);

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", fontSize: "14px", boxSizing: "border-box" };
const selectStyle = { ...inputStyle, background: "#fff" };

const Badge = ({ ok, children }) => (
  <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: ok ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: ok ? "#059669" : "#dc2626" }}>
    {children}
  </span>
);

const ManagerHeader = ({ icon: Icon, title, subtitle, onRefresh, loading, extra }) => (
  <div className="sadmin-page-header" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
    <div>
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", fontWeight: "700", color: "#111", margin: 0 }}>
        <Icon color="#d97706" size={24} /> {title}
      </h1>
      {subtitle && <p style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>{subtitle}</p>}
    </div>
    <div style={{ display: "flex", gap: "10px" }}>
      {extra}
      <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={onRefresh} disabled={loading}>
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  </div>
);

const LoadingBox = ({ text }) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", gap: "10px", color: "#666" }}>
    <Loader2 size={20} className="login-spin" /> {text}
  </div>
);

const ErrorBox = ({ message }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
    <AlertCircle size={18} /> {message}
  </div>
);

const EmptyBox = ({ text }) => (
  <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>{text}</div>
);

const Card = ({ children }) => (
  <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>{children}</div>
);

const ActionButtons = ({ onEdit, onDelete, showDelete = true }) => (
  <td style={{ textAlign: "right" }}>
    <button style={{ width: "32px", height: "32px", marginRight: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }} onClick={onEdit} title="Edit">
      <Edit size={14} />
    </button>
    {showDelete && (
      <button style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#dc2626" }} onClick={onDelete} title="Delete">
        <Trash2 size={14} />
      </button>
    )}
  </td>
);

/* ============================== Departments ============================== */

const DepartmentsTab = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null); // null | {record, values}
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/departments?size=200");
      setRows(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setForm({ record: null, values: { departmentCode: "", departmentName: "", description: "", active: true } });
  const openEdit = (r) => setForm({ record: r, values: { departmentCode: r.departmentCode, departmentName: r.departmentName, description: r.description || "", active: r.active ?? true } });

  const save = async (e) => {
    e.preventDefault();
    if (!form.values.departmentCode.trim() || !form.values.departmentName.trim()) {
      setError("Department code and name are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = { departmentCode: form.values.departmentCode.trim().toUpperCase(), departmentName: form.values.departmentName.trim(), description: form.values.description, active: form.values.active };
      if (form.record) {
        await apiPut(`/api/departments/${form.record.id}`, payload);
      } else {
        await apiPost("/api/departments", payload);
      }
      setToast({ msg: form.record ? "Department updated and saved." : "Department created and saved." });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save department.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await apiDelete(`/api/departments/${deleteTarget.id}`);
      setToast({ msg: `Department "${deleteTarget.departmentName}" deleted.` });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ msg: err.message || "Department could not be deleted.", tone: "err" });
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} />
      <ManagerHeader icon={Building2} title="Departments" subtitle="Organizational departments stored in the database." onRefresh={load} loading={loading} extra={
        <button className="sadmin-btn-primary-sm" onClick={openCreate}><PlusCircle size={14} /> Add Department</button>
      } />
      {error && <ErrorBox message={error} />}
      <Card>
        {loading ? <LoadingBox text="Loading departments..." /> : rows.length === 0 ? <EmptyBox text="No departments found. Seed data creates the base organization structure." /> : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr><th>Code</th><th>Department Name</th><th>Description</th><th>Employees</th><th>Cost Centers</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{r.departmentCode}</td>
                    <td style={{ fontWeight: "700", color: "#111" }}>{r.departmentName}</td>
                    <td style={{ color: "#555", fontSize: "13px" }}>{r.description || "—"}</td>
                    <td style={{ fontWeight: "700", color: "#059669" }}>{r.employeeCount ?? 0}</td>
                    <td style={{ fontWeight: "700", color: "#2563eb" }}>{r.costCenterCount ?? 0}</td>
                    <td><Badge ok={r.active}>{r.active ? "ACTIVE" : "INACTIVE"}</Badge></td>
                    <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.record ? `Edit: ${form.record.departmentName}` : "Create Department"} subtitle={form.record ? "EDIT DEPARTMENT" : "CREATE DEPARTMENT"} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Department Code" required><input style={inputStyle} value={form.values.departmentCode} onChange={(e) => setForm({ ...form, values: { ...form.values, departmentCode: e.target.value } })} placeholder="e.g. PROC" /></Field>
              <Field label="Department Name" required><input style={inputStyle} value={form.values.departmentName} onChange={(e) => setForm({ ...form, values: { ...form.values, departmentName: e.target.value } })} placeholder="e.g. Procurement" /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Description"><input style={inputStyle} value={form.values.description} onChange={(e) => setForm({ ...form, values: { ...form.values, description: e.target.value } })} placeholder="Department responsibility" /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" id="dept-active" checked={form.values.active} onChange={(e) => setForm({ ...form, values: { ...form.values, active: e.target.checked } })} style={{ width: "17px", height: "17px", accentColor: "#f8b400" }} />
              <label htmlFor="dept-active" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Department is active</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
              <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="sadmin-btn-primary-sm" disabled={busy}>{busy ? <><Loader2 size={15} className="login-spin" /> Saving...</> : form.record ? "Save Changes" : "Create Department"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title={`Delete "${deleteTarget.departmentName}"?`} message="Departments referenced by employees, cost centers or rules cannot be deleted by the backend. This action is audited." onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} busy={busy} />
      )}
    </div>
  );
};

/* ============================== Cost Centers ============================== */

const CostCentersTab = () => {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ccPage, depts] = await Promise.all([apiGet("/api/cost-centers?size=200"), apiGet("/api/departments/all")]);
      setRows(ccPage?.content || []);
      setDepartments(depts || []);
    } catch (err) {
      setError(err.message || "Failed to load cost centers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setForm({ record: null, values: { code: "", name: "", departmentId: departments[0]?.id || "", budget: "", active: true } });
  const openEdit = (r) => setForm({ record: r, values: { code: r.code, name: r.name, departmentId: r.departmentId || "", budget: r.budget ?? "", active: r.active ?? true } });

  const save = async (e) => {
    e.preventDefault();
    if (!form.values.code.trim() || !form.values.name.trim() || !form.values.departmentId) {
      setError("Code, name and department are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = { code: form.values.code.trim().toUpperCase(), name: form.values.name.trim(), departmentId: Number(form.values.departmentId), budget: form.values.budget ? Number(form.values.budget) : 0, active: form.values.active };
      if (form.record) {
        await apiPut(`/api/cost-centers/${form.record.id}`, payload);
      } else {
        await apiPost("/api/cost-centers", payload);
      }
      setToast({ msg: form.record ? "Cost center updated and saved." : "Cost center created and saved." });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save cost center.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await apiDelete(`/api/cost-centers/${deleteTarget.id}`);
      setToast({ msg: `Cost center "${deleteTarget.name}" deleted.` });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ msg: err.message || "Cost center could not be deleted.", tone: "err" });
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const utilization = (r) => (r.budget && Number(r.budget) > 0 ? Math.min(100, Math.round((Number(r.usedBudget || 0) / Number(r.budget)) * 100)) : 0);

  return (
    <div>
      <Toast toast={toast} />
      <ManagerHeader icon={Landmark} title="Cost Centers" subtitle="Budget-bearing cost centers mapped to departments." onRefresh={load} loading={loading} extra={
        <button className="sadmin-btn-primary-sm" onClick={openCreate}><PlusCircle size={14} /> Add Cost Center</button>
      } />
      {error && <ErrorBox message={error} />}
      <Card>
        {loading ? <LoadingBox text="Loading cost centers..." /> : rows.length === 0 ? <EmptyBox text="No cost centers found." /> : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Department</th><th>Budget</th><th>Used</th><th>Remaining</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{r.code}</td>
                    <td style={{ fontWeight: "700", color: "#111" }}>{r.name}</td>
                    <td style={{ color: "#555" }}>{r.departmentName || "—"}</td>
                    <td style={{ fontWeight: "700" }}>{formatINR(r.budget)}</td>
                    <td style={{ color: "#d97706", fontWeight: "600" }}>{formatINR(r.usedBudget)}</td>
                    <td style={{ color: "#059669", fontWeight: "700" }}>{formatINR(r.remainingBudget)}</td>
                    <td>
                      <Badge ok={r.active}>{r.active ? "ACTIVE" : "INACTIVE"}</Badge>
                      <div style={{ marginTop: "4px", fontSize: "10.5px", color: "#888", fontWeight: "700" }}>{utilization(r)}% used</div>
                    </td>
                    <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.record ? `Edit: ${form.record.name}` : "Create Cost Center"} subtitle={form.record ? "EDIT COST CENTER" : "CREATE COST CENTER"} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Cost Center Code" required><input style={inputStyle} value={form.values.code} onChange={(e) => setForm({ ...form, values: { ...form.values, code: e.target.value } })} placeholder="e.g. PROC-001" /></Field>
              <Field label="Name" required><input style={inputStyle} value={form.values.name} onChange={(e) => setForm({ ...form, values: { ...form.values, name: e.target.value } })} placeholder="e.g. Strategic Procurement" /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Department" required>
                <select style={selectStyle} value={form.values.departmentId} onChange={(e) => setForm({ ...form, values: { ...form.values, departmentId: e.target.value } })}>
                  <option value="">Select department...</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </Field>
              <Field label="Allocated Budget (₹)">
                <input type="number" min="0" style={inputStyle} value={form.values.budget} onChange={(e) => setForm({ ...form, values: { ...form.values, budget: e.target.value } })} placeholder="0.00" />
              </Field>
            </div>
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" id="cc-active" checked={form.values.active} onChange={(e) => setForm({ ...form, values: { ...form.values, active: e.target.checked } })} style={{ width: "17px", height: "17px", accentColor: "#f8b400" }} />
              <label htmlFor="cc-active" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Cost center is active</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
              <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="sadmin-btn-primary-sm" disabled={busy}>{busy ? <><Loader2 size={15} className="login-spin" /> Saving...</> : form.record ? "Save Changes" : "Create Cost Center"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title={`Delete "${deleteTarget.name}"?`} message="Cost centers referenced by budgets or employees cannot be deleted by the backend. This action is audited." onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} busy={busy} />
      )}
    </div>
  );
};

/* ============================== Categories ============================== */

const CategoriesTab = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/categories?size=200");
      setRows(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setForm({ record: null, values: { categoryCode: "", categoryName: "", description: "", parentCategoryId: "", active: true } });
  const openEdit = (r) => setForm({ record: r, values: { categoryCode: r.categoryCode, categoryName: r.categoryName, description: r.description || "", parentCategoryId: r.parentCategoryId || "", active: r.active ?? true } });

  const save = async (e) => {
    e.preventDefault();
    if (!form.values.categoryCode.trim() || !form.values.categoryName.trim()) {
      setError("Category code and name are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        categoryCode: form.values.categoryCode.trim().toUpperCase(),
        categoryName: form.values.categoryName.trim(),
        description: form.values.description,
        parentCategoryId: form.values.parentCategoryId ? Number(form.values.parentCategoryId) : null,
        active: form.values.active,
      };
      if (form.record) {
        await apiPut(`/api/categories/${form.record.id}`, payload);
      } else {
        await apiPost("/api/categories", payload);
      }
      setToast({ msg: form.record ? "Category updated and saved." : "Category created and saved." });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save category.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await apiDelete(`/api/categories/${deleteTarget.id}`);
      setToast({ msg: `Category "${deleteTarget.categoryName}" deleted.` });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ msg: err.message || "Category could not be deleted.", tone: "err" });
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} />
      <ManagerHeader icon={FolderTree} title="Categories & Subcategories" subtitle="Product categories with optional parent (subcategory) relationships." onRefresh={load} loading={loading} extra={
        <button className="sadmin-btn-primary-sm" onClick={openCreate}><PlusCircle size={14} /> Add Category</button>
      } />
      {error && <ErrorBox message={error} />}
      <Card>
        {loading ? <LoadingBox text="Loading categories..." /> : rows.length === 0 ? <EmptyBox text="No categories found." /> : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr><th>Code</th><th>Category Name</th><th>Parent Category</th><th>Products</th><th>Subcategories</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{r.categoryCode}</td>
                    <td style={{ fontWeight: "700", color: "#111" }}>{r.categoryName}</td>
                    <td style={{ color: "#555" }}>{r.parentCategoryName || "—"}</td>
                    <td style={{ fontWeight: "700", color: "#059669" }}>{r.productCount ?? 0}</td>
                    <td style={{ fontWeight: "700", color: "#2563eb" }}>{r.subCategoryCount ?? 0}</td>
                    <td><Badge ok={r.active}>{r.active ? "ACTIVE" : "INACTIVE"}</Badge></td>
                    <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.record ? `Edit: ${form.record.categoryName}` : "Create Category"} subtitle={form.record ? "EDIT CATEGORY" : "CREATE CATEGORY"} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Category Code" required><input style={inputStyle} value={form.values.categoryCode} onChange={(e) => setForm({ ...form, values: { ...form.values, categoryCode: e.target.value } })} placeholder="e.g. IT-SW" /></Field>
              <Field label="Category Name" required><input style={inputStyle} value={form.values.categoryName} onChange={(e) => setForm({ ...form, values: { ...form.values, categoryName: e.target.value } })} placeholder="e.g. Software & Licenses" /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Description"><input style={inputStyle} value={form.values.description} onChange={(e) => setForm({ ...form, values: { ...form.values, description: e.target.value } })} placeholder="Category purpose" /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Parent Category (for subcategories)">
                <select style={selectStyle} value={form.values.parentCategoryId} onChange={(e) => setForm({ ...form, values: { ...form.values, parentCategoryId: e.target.value } })}>
                  <option value="">— Top level category —</option>
                  {rows.filter((c) => c.id !== form.record?.id).map((c) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" id="cat-active" checked={form.values.active} onChange={(e) => setForm({ ...form, values: { ...form.values, active: e.target.checked } })} style={{ width: "17px", height: "17px", accentColor: "#f8b400" }} />
              <label htmlFor="cat-active" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Category is active</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
              <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="sadmin-btn-primary-sm" disabled={busy}>{busy ? <><Loader2 size={15} className="login-spin" /> Saving...</> : form.record ? "Save Changes" : "Create Category"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title={`Delete "${deleteTarget.categoryName}"?`} message="Categories referenced by products cannot be deleted by the backend. This action is audited." onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} busy={busy} />
      )}
    </div>
  );
};

/* ============================== Products ============================== */

const ProductsTab = () => {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prodPage, cats, vends, uomList] = await Promise.all([
        apiGet("/api/products?size=200"),
        apiGet("/api/categories/all"),
        apiGet("/api/vendors?size=200"),
        apiGet("/api/uoms/all"),
      ]);
      setRows(prodPage?.content || []);
      setCategories(cats || []);
      setVendors(vends?.content || []);
      setUoms(uomList || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setForm({ record: null, values: { productCode: "", sku: "", productName: "", description: "", brand: "", manufacturer: "", categoryId: "", vendorId: "", unitOfMeasureId: "", unitPrice: "", currency: "INR", minimumStock: "0", maximumStock: "0", reorderLevel: "0", leadTimeDays: "", taxPercentage: "18", active: true } });
  const openEdit = (r) => setForm({ record: r, values: { productCode: r.productCode, sku: r.sku, productName: r.productName, description: r.description || "", brand: r.brand || "", manufacturer: r.manufacturer || "", categoryId: r.categoryId || "", vendorId: r.vendorId || "", unitOfMeasureId: r.unitOfMeasureId || "", unitPrice: r.unitPrice ?? "", currency: r.currency || "INR", minimumStock: r.minimumStock ?? "0", maximumStock: r.maximumStock ?? "0", reorderLevel: r.reorderLevel ?? "0", leadTimeDays: r.leadTimeDays ?? "", taxPercentage: r.taxPercentage ?? "18", active: r.active ?? true } });

  const save = async (e) => {
    e.preventDefault();
    if (!form.values.productCode.trim() || !form.values.sku.trim() || !form.values.productName.trim() || !form.values.categoryId || !form.values.vendorId || !form.values.unitOfMeasureId) {
      setError("Product code, SKU, name, category, vendor and unit are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        productCode: form.values.productCode.trim().toUpperCase(),
        sku: form.values.sku.trim(),
        productName: form.values.productName.trim(),
        description: form.values.description,
        brand: form.values.brand,
        manufacturer: form.values.manufacturer,
        categoryId: Number(form.values.categoryId),
        vendorId: Number(form.values.vendorId),
        unitOfMeasureId: Number(form.values.unitOfMeasureId),
        unitPrice: Number(form.values.unitPrice || 0),
        currency: form.values.currency || "INR",
        minimumStock: Number(form.values.minimumStock || 0),
        maximumStock: Number(form.values.maximumStock || 0),
        reorderLevel: Number(form.values.reorderLevel || 0),
        leadTimeDays: form.values.leadTimeDays ? Number(form.values.leadTimeDays) : null,
        taxPercentage: form.values.taxPercentage ? Number(form.values.taxPercentage) : null,
        active: form.values.active,
      };
      if (form.record) {
        await apiPut(`/api/products/${form.record.id}`, payload);
      } else {
        await apiPost("/api/products", payload);
      }
      setToast({ msg: form.record ? "Product updated and saved." : "Product created and saved." });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save product.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await apiDelete(`/api/products/${deleteTarget.id}`);
      setToast({ msg: `Product "${deleteTarget.productName}" deleted.` });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ msg: err.message || "Product could not be deleted.", tone: "err" });
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} />
      <ManagerHeader icon={Package} title="Products & Services" subtitle="Catalogue items used by purchase requests — categories, vendors and units from the database." onRefresh={load} loading={loading} extra={
        <button className="sadmin-btn-primary-sm" onClick={openCreate}><PlusCircle size={14} /> Add Product</button>
      } />
      {error && <ErrorBox message={error} />}
      <Card>
        {loading ? <LoadingBox text="Loading products..." /> : rows.length === 0 ? <EmptyBox text="No products found." /> : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Vendor</th><th>Unit</th><th>Unit Price</th><th>Reorder</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: "800", color: "#111" }}>{r.productName}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{r.productCode} · {r.sku}</div>
                    </td>
                    <td style={{ color: "#555" }}>{r.categoryName || "—"}</td>
                    <td style={{ color: "#555" }}>{r.vendorName || "—"}</td>
                    <td>{r.uomName || "—"}</td>
                    <td style={{ fontWeight: "700" }}>{formatINR(r.unitPrice)}</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{r.reorderLevel ?? 0}</td>
                    <td><Badge ok={r.active}>{r.active ? "ACTIVE" : "INACTIVE"}</Badge></td>
                    <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.record ? `Edit: ${form.record.productName}` : "Create Product"} subtitle={form.record ? "EDIT PRODUCT" : "CREATE PRODUCT"} onClose={() => setForm(null)} maxWidth="720px">
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <Field label="Product Code" required><input style={inputStyle} value={form.values.productCode} onChange={(e) => setForm({ ...form, values: { ...form.values, productCode: e.target.value } })} placeholder="e.g. PRD-1001" /></Field>
              <Field label="SKU" required><input style={inputStyle} value={form.values.sku} onChange={(e) => setForm({ ...form, values: { ...form.values, sku: e.target.value } })} placeholder="e.g. SKU-LAP-001" /></Field>
              <Field label="Product Name" required><input style={inputStyle} value={form.values.productName} onChange={(e) => setForm({ ...form, values: { ...form.values, productName: e.target.value } })} placeholder="e.g. Dell Latitude Laptop" /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Description"><input style={inputStyle} value={form.values.description} onChange={(e) => setForm({ ...form, values: { ...form.values, description: e.target.value } })} placeholder="Product specification" /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <Field label="Category" required>
                <select style={selectStyle} value={form.values.categoryId} onChange={(e) => setForm({ ...form, values: { ...form.values, categoryId: e.target.value } })}>
                  <option value="">Select...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                </select>
              </Field>
              <Field label="Vendor" required>
                <select style={selectStyle} value={form.values.vendorId} onChange={(e) => setForm({ ...form, values: { ...form.values, vendorId: e.target.value } })}>
                  <option value="">Select...</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                </select>
              </Field>
              <Field label="Unit of Measure" required>
                <select style={selectStyle} value={form.values.unitOfMeasureId} onChange={(e) => setForm({ ...form, values: { ...form.values, unitOfMeasureId: e.target.value } })}>
                  <option value="">Select...</option>
                  {uoms.map((u) => <option key={u.id} value={u.id}>{u.uomName}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <Field label="Unit Price (₹)" required><input type="number" min="0" style={inputStyle} value={form.values.unitPrice} onChange={(e) => setForm({ ...form, values: { ...form.values, unitPrice: e.target.value } })} /></Field>
              <Field label="Currency"><input style={inputStyle} maxLength="3" value={form.values.currency} onChange={(e) => setForm({ ...form, values: { ...form.values, currency: e.target.value.toUpperCase() } })} /></Field>
              <Field label="Tax %"><input type="number" min="0" max="100" style={inputStyle} value={form.values.taxPercentage} onChange={(e) => setForm({ ...form, values: { ...form.values, taxPercentage: e.target.value } })} /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
              <Field label="Min Stock"><input type="number" min="0" style={inputStyle} value={form.values.minimumStock} onChange={(e) => setForm({ ...form, values: { ...form.values, minimumStock: e.target.value } })} /></Field>
              <Field label="Max Stock"><input type="number" min="0" style={inputStyle} value={form.values.maximumStock} onChange={(e) => setForm({ ...form, values: { ...form.values, maximumStock: e.target.value } })} /></Field>
              <Field label="Reorder Level"><input type="number" min="0" style={inputStyle} value={form.values.reorderLevel} onChange={(e) => setForm({ ...form, values: { ...form.values, reorderLevel: e.target.value } })} /></Field>
              <Field label="Lead Time (days)"><input type="number" min="0" style={inputStyle} value={form.values.leadTimeDays} onChange={(e) => setForm({ ...form, values: { ...form.values, leadTimeDays: e.target.value } })} /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Brand / Manufacturer">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input style={inputStyle} placeholder="Brand" value={form.values.brand} onChange={(e) => setForm({ ...form, values: { ...form.values, brand: e.target.value } })} />
                  <input style={inputStyle} placeholder="Manufacturer" value={form.values.manufacturer} onChange={(e) => setForm({ ...form, values: { ...form.values, manufacturer: e.target.value } })} />
                </div>
              </Field>
            </div>
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" id="prod-active" checked={form.values.active} onChange={(e) => setForm({ ...form, values: { ...form.values, active: e.target.checked } })} style={{ width: "17px", height: "17px", accentColor: "#f8b400" }} />
              <label htmlFor="prod-active" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Product is active</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
              <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="sadmin-btn-primary-sm" disabled={busy}>{busy ? <><Loader2 size={15} className="login-spin" /> Saving...</> : form.record ? "Save Changes" : "Create Product"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title={`Delete "${deleteTarget.productName}"?`} message="Products referenced by purchase requests cannot be deleted by the backend. This action is audited." onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} busy={busy} />
      )}
    </div>
  );
};

/* ============================== Warehouses ============================== */

const WarehousesTab = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/warehouses?size=200");
      setRows(data?.content || []);
    } catch (err) {
      setError(err.message || "Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setForm({ record: null, values: { warehouseCode: "", warehouseName: "", description: "", warehouseType: "CENTRAL", status: "ACTIVE", managerName: "", contactPerson: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", country: "India", postalCode: "", storageCapacity: "" } });
  const openEdit = (r) => setForm({ record: r, values: { warehouseCode: r.warehouseCode, warehouseName: r.warehouseName, description: r.description || "", warehouseType: r.warehouseType || "CENTRAL", status: r.status || "ACTIVE", managerName: r.managerName || "", contactPerson: r.contactPerson || "", email: r.email || "", phone: r.phone || "", addressLine1: r.addressLine1 || "", addressLine2: r.addressLine2 || "", city: r.city || "", state: r.state || "", country: r.country || "India", postalCode: r.postalCode || "", storageCapacity: r.storageCapacity ?? "" } });

  const save = async (e) => {
    e.preventDefault();
    if (!form.values.warehouseCode.trim() || !form.values.warehouseName.trim()) {
      setError("Warehouse code and name are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = { ...form.values, warehouseCode: form.values.warehouseCode.trim().toUpperCase(), storageCapacity: Number(form.values.storageCapacity || 0) };
      if (form.record) {
        await apiPut(`/api/warehouses/${form.record.id}`, payload);
      } else {
        await apiPost("/api/warehouses", payload);
      }
      setToast({ msg: form.record ? "Warehouse updated and saved." : "Warehouse created and saved." });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save warehouse.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await apiDelete(`/api/warehouses/${deleteTarget.id}`);
      setToast({ msg: `Warehouse "${deleteTarget.warehouseName}" deleted.` });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ msg: err.message || "Warehouse could not be deleted.", tone: "err" });
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} />
      <ManagerHeader icon={WarehouseIcon} title="Warehouses" subtitle="Storage locations for goods receiving and inventory." onRefresh={load} loading={loading} extra={
        <button className="sadmin-btn-primary-sm" onClick={openCreate}><PlusCircle size={14} /> Add Warehouse</button>
      } />
      {error && <ErrorBox message={error} />}
      <Card>
        {loading ? <LoadingBox text="Loading warehouses..." /> : rows.length === 0 ? <EmptyBox text="No warehouses found." /> : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr><th>Warehouse</th><th>Type</th><th>Location</th><th>Manager</th><th>Capacity</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: "800", color: "#111" }}>{r.warehouseName}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{r.warehouseCode}</div>
                    </td>
                    <td><span style={{ fontSize: "12px", fontWeight: "700", background: "rgba(37,99,235,0.08)", color: "#2563eb", padding: "2px 8px", borderRadius: "10px" }}>{r.warehouseType}</span></td>
                    <td style={{ color: "#555", fontSize: "13px" }}>{[r.city, r.state].filter(Boolean).join(", ") || "—"}</td>
                    <td>{r.managerName || "—"}</td>
                    <td style={{ fontWeight: "700" }}>{Number(r.storageCapacity || 0).toLocaleString()}</td>
                    <td><Badge ok={/ACTIVE/i.test(r.status || "ACTIVE")}>{(r.status || "ACTIVE").replace(/_/g, " ")}</Badge></td>
                    <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.record ? `Edit: ${form.record.warehouseName}` : "Create Warehouse"} subtitle={form.record ? "EDIT WAREHOUSE" : "CREATE WAREHOUSE"} onClose={() => setForm(null)} maxWidth="720px">
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <Field label="Warehouse Code" required><input style={inputStyle} value={form.values.warehouseCode} onChange={(e) => setForm({ ...form, values: { ...form.values, warehouseCode: e.target.value } })} placeholder="e.g. WH-MUM-01" /></Field>
              <Field label="Warehouse Name" required><input style={inputStyle} value={form.values.warehouseName} onChange={(e) => setForm({ ...form, values: { ...form.values, warehouseName: e.target.value } })} placeholder="e.g. Mumbai Central" /></Field>
              <Field label="Type">
                <select style={selectStyle} value={form.values.warehouseType} onChange={(e) => setForm({ ...form, values: { ...form.values, warehouseType: e.target.value } })}>
                  {["CENTRAL", "REGIONAL", "LOCAL", "TRANSIT", "VIRTUAL"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Description"><input style={inputStyle} value={form.values.description} onChange={(e) => setForm({ ...form, values: { ...form.values, description: e.target.value } })} /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <Field label="Manager Name"><input style={inputStyle} value={form.values.managerName} onChange={(e) => setForm({ ...form, values: { ...form.values, managerName: e.target.value } })} /></Field>
              <Field label="Contact Person"><input style={inputStyle} value={form.values.contactPerson} onChange={(e) => setForm({ ...form, values: { ...form.values, contactPerson: e.target.value } })} /></Field>
              <Field label="Phone"><input style={inputStyle} value={form.values.phone} onChange={(e) => setForm({ ...form, values: { ...form.values, phone: e.target.value } })} /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <Field label="City"><input style={inputStyle} value={form.values.city} onChange={(e) => setForm({ ...form, values: { ...form.values, city: e.target.value } })} /></Field>
              <Field label="State"><input style={inputStyle} value={form.values.state} onChange={(e) => setForm({ ...form, values: { ...form.values, state: e.target.value } })} /></Field>
              <Field label="Country"><input style={inputStyle} value={form.values.country} onChange={(e) => setForm({ ...form, values: { ...form.values, country: e.target.value } })} /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <Field label="Postal Code"><input style={inputStyle} value={form.values.postalCode} onChange={(e) => setForm({ ...form, values: { ...form.values, postalCode: e.target.value } })} /></Field>
              <Field label="Storage Capacity"><input type="number" min="0" style={inputStyle} value={form.values.storageCapacity} onChange={(e) => setForm({ ...form, values: { ...form.values, storageCapacity: e.target.value } })} /></Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
              <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="sadmin-btn-primary-sm" disabled={busy}>{busy ? <><Loader2 size={15} className="login-spin" /> Saving...</> : form.record ? "Save Changes" : "Create Warehouse"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title={`Delete "${deleteTarget.warehouseName}"?`} message="Warehouses referenced by stock or GRNs cannot be deleted by the backend. This action is audited." onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} busy={busy} />
      )}
    </div>
  );
};

/* ============================== Approval Rules ============================== */

const ApprovalRulesTab = () => {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rulePage, depts] = await Promise.all([apiGet("/api/approval-rules?size=200"), apiGet("/api/departments/all")]);
      setRows(rulePage?.content || []);
      setDepartments(depts || []);
    } catch (err) {
      setError(err.message || "Failed to load approval rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setForm({ record: null, values: { ruleCode: "", ruleName: "", departmentId: departments[0]?.id || "", minimumAmount: "", maximumAmount: "", description: "", active: true } });
  const openEdit = (r) => setForm({ record: r, values: { ruleCode: r.ruleCode, ruleName: r.ruleName, departmentId: r.departmentId || "", minimumAmount: r.minimumAmount ?? "", maximumAmount: r.maximumAmount ?? "", description: r.description || "", active: r.active ?? true } });

  const save = async (e) => {
    e.preventDefault();
    if (!form.values.ruleCode.trim() || !form.values.ruleName.trim() || !form.values.departmentId) {
      setError("Rule code, name and department are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        ruleCode: form.values.ruleCode.trim().toUpperCase(),
        ruleName: form.values.ruleName.trim(),
        departmentId: Number(form.values.departmentId),
        minimumAmount: Number(form.values.minimumAmount || 0),
        maximumAmount: form.values.maximumAmount ? Number(form.values.maximumAmount) : null,
        description: form.values.description,
        active: form.values.active,
      };
      if (form.record) {
        await apiPut(`/api/approval-rules/${form.record.id}`, payload);
      } else {
        await apiPost("/api/approval-rules", payload);
      }
      setToast({ msg: form.record ? "Approval rule updated and saved." : "Approval rule created and saved." });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save approval rule.");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await apiDelete(`/api/approval-rules/${deleteTarget.id}`);
      setToast({ msg: `Approval rule "${deleteTarget.ruleName}" deleted.` });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToast({ msg: err.message || "Approval rule could not be deleted.", tone: "err" });
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} />
      <ManagerHeader icon={Scale} title="Approval Rules" subtitle="Configurable amount thresholds per department — used by the workflow engine for request routing." onRefresh={load} loading={loading} extra={
        <button className="sadmin-btn-primary-sm" onClick={openCreate}><PlusCircle size={14} /> Add Approval Rule</button>
      } />
      {error && <ErrorBox message={error} />}
      <Card>
        {loading ? <LoadingBox text="Loading approval rules..." /> : rows.length === 0 ? <EmptyBox text="No approval rules found. Seed data creates the default thresholds." /> : (
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr><th>Rule Code</th><th>Rule Name</th><th>Department</th><th>Min Amount</th><th>Max Amount</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{r.ruleCode}</td>
                    <td style={{ fontWeight: "700", color: "#111" }}>{r.ruleName}</td>
                    <td style={{ color: "#555" }}>{r.departmentName || "—"}</td>
                    <td style={{ fontWeight: "700" }}>{formatINR(r.minimumAmount)}</td>
                    <td style={{ fontWeight: "700" }}>{r.maximumAmount ? formatINR(r.maximumAmount) : "∞"}</td>
                    <td><Badge ok={r.active}>{r.active ? "ACTIVE" : "INACTIVE"}</Badge></td>
                    <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <Modal title={form.record ? `Edit: ${form.record.ruleName}` : "Create Approval Rule"} subtitle={form.record ? "EDIT APPROVAL RULE" : "CREATE APPROVAL RULE"} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Rule Code" required><input style={inputStyle} value={form.values.ruleCode} onChange={(e) => setForm({ ...form, values: { ...form.values, ruleCode: e.target.value } })} placeholder="e.g. APPROVE-50K" /></Field>
              <Field label="Rule Name" required><input style={inputStyle} value={form.values.ruleName} onChange={(e) => setForm({ ...form, values: { ...form.values, ruleName: e.target.value } })} placeholder="e.g. Manager Approval up to 50K" /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Department" required>
                <select style={selectStyle} value={form.values.departmentId} onChange={(e) => setForm({ ...form, values: { ...form.values, departmentId: e.target.value } })}>
                  <option value="">Select department...</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Minimum Amount (₹)" required><input type="number" min="0" style={inputStyle} value={form.values.minimumAmount} onChange={(e) => setForm({ ...form, values: { ...form.values, minimumAmount: e.target.value } })} /></Field>
              <Field label="Maximum Amount (₹)"><input type="number" min="0" style={inputStyle} value={form.values.maximumAmount} onChange={(e) => setForm({ ...form, values: { ...form.values, maximumAmount: e.target.value } })} placeholder="Leave empty for unlimited" /></Field>
            </div>
            <div style={{ marginTop: "14px" }}>
              <Field label="Description"><input style={inputStyle} value={form.values.description} onChange={(e) => setForm({ ...form, values: { ...form.values, description: e.target.value } })} placeholder="When does this rule apply?" /></Field>
            </div>
            <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" id="rule-active" checked={form.values.active} onChange={(e) => setForm({ ...form, values: { ...form.values, active: e.target.checked } })} style={{ width: "17px", height: "17px", accentColor: "#f8b400" }} />
              <label htmlFor="rule-active" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Rule is active</label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "20px", borderTop: "1px solid #ececec" }}>
              <button type="button" className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="sadmin-btn-primary-sm" disabled={busy}>{busy ? <><Loader2 size={15} className="login-spin" /> Saving...</> : form.record ? "Save Changes" : "Create Rule"}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title={`Delete "${deleteTarget.ruleName}"?`} message="Approval rules used by the workflow engine. This action is audited." onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} busy={busy} />
      )}
    </div>
  );
};

/* ============================== Panel Shell ============================== */

const TABS = [
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "cost-centers", label: "Cost Centers", icon: Landmark },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "products", label: "Products", icon: Package },
  { id: "warehouses", label: "Warehouses", icon: WarehouseIcon },
  { id: "approval-rules", label: "Approval Rules", icon: Scale },
];

const OrgMasterDataPanel = () => {
  const [tab, setTab] = useState("departments");

  const renderTab = () => {
    switch (tab) {
      case "departments": return <DepartmentsTab />;
      case "cost-centers": return <CostCentersTab />;
      case "categories": return <CategoriesTab />;
      case "products": return <ProductsTab />;
      case "warehouses": return <WarehousesTab />;
      case "approval-rules": return <ApprovalRulesTab />;
      default: return <DepartmentsTab />;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
          <Database color="#d97706" size={28} /> Master Data Management
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          Organization structure, catalogue and approval configuration — every value below is read from and written to MySQL through the backend APIs.
        </p>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", borderBottom: "1px solid #ececec", marginBottom: "20px" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: isActive ? "rgba(248,180,0,0.10)" : "none",
                border: "none",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#b45309" : "#666",
                borderBottom: isActive ? "3px solid #f8b400" : "3px solid transparent",
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
};

export default OrgMasterDataPanel;
