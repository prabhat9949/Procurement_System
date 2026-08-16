import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  UserCog,
  BarChart3,
  Bell,
  PlusCircle,
  Edit,
  Eye,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserCheck,
  BriefcaseBusiness,
  FileText,
  Building,
  Wallet,
  User,
  KeyRound,
  TrendingUp,
  ClipboardList,
  History,
  Clock,
} from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../../../services/apiClient";
import { hasPermission } from "../../../../utils/permissions";
import RoleShell from "../shared_ui/RoleShell";

const countFormat = new Intl.NumberFormat("en-IN");
const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "directory", label: "Employee Directory", icon: Users },
  { id: "structure", label: "Reporting Structure", icon: GitBranch },
  { id: "tracking", label: "Procurement Tracking", icon: ClipboardList },
  { id: "reports", label: "HR Reports", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const ACCENT = "#f8b400";

/* ------------------------------------------------------------------ */
/*  Main HR Dashboard shell                                            */
/* ------------------------------------------------------------------ */
export default function HrDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dash, setDash] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMaster = useCallback(async () => {
    const [deptList, roleList, ccList] = await Promise.all([
      apiGet("/api/departments/all").catch(() => []),
      apiGet("/api/roles/all").catch(() => []),
      apiGet("/api/cost-centers/all").catch(() => []),
    ]);
    setDepartments(deptList || []);
    setRoles(roleList || []);
    setCostCenters(ccList || []);
  }, []);

  const loadDash = useCallback(async () => {
    try {
      const data = await apiGet("/api/dashboard/hr");
      setDash(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load HR dashboard data.");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMaster(),
        loadDash(),
        apiGet("/api/auth/me").then(setMe).catch(() => null),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadMaster, loadDash]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div>
        <div style={{ color: "#68778a", fontSize: 13, fontWeight: 600 }}>
          Human Resources / {NAV_ITEMS.find((item) => item.id === activeTab)?.label || activeTab}
        </div>
        <h1 style={{ margin: "6px 0", fontSize: 26, fontWeight: 800, color: "#111" }}>
          {NAV_ITEMS.find((item) => item.id === activeTab)?.label || "HR Dashboard"}
        </h1>
        <p style={{ margin: 0, color: "#68778a", fontSize: 14 }}>
          Employee identity, organisation structure and user-account linkage — live from MySQL
        </p>
      </div>
      <button
        onClick={refreshAll}
        disabled={loading}
        style={{
          border: 0,
          borderRadius: 9,
          background: ACCENT,
          color: "#111",
          padding: "11px 18px",
          cursor: "pointer",
          fontWeight: 800,
          fontSize: 13.5,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 14px rgba(248,180,0,.35)",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <RefreshCw size={15} style={loading ? { animation: "hrSpin 1s linear infinite" } : undefined} /> Refresh data
      </button>
      <style>{`@keyframes hrSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <RoleShell
      portalTitle="HR & People Portal"
      roleLabel="HR Manager"
      accent={ACCENT}
      navItems={NAV_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userMeta={{
        dept: me?.departmentName || "Human Resources",
        empId: me?.employeeId ? String(me.employeeId) : "",
      }}
    >
      {header}

      {error && (
        <div style={{ marginTop: 18, padding: 14, background: "#fff1f2", color: "#be123c", borderRadius: 10, fontWeight: 600, display: "flex", gap: 10, alignItems: "center" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {activeTab === "dashboard" && (
        <OverviewView dash={dash} loading={loading} onGoTo={(tab) => setActiveTab(tab)} />
      )}
      {activeTab === "directory" && (
        <DirectoryView departments={departments} roles={roles} costCenters={costCenters} onChanged={refreshAll} />
      )}
      {activeTab === "structure" && <StructureView />}
      {activeTab === "tracking" && (
        <ProcurementTrackingView departments={departments} />
      )}
      {activeTab === "reports" && (
        <ReportsView departments={departments} costCenters={costCenters} dash={dash} />
      )}
      {activeTab === "notifications" && <NotificationsView userId={me?.userId} />}
    </RoleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview (Dashboard tab)                                           */
/* ------------------------------------------------------------------ */
function OverviewView({ dash, loading, onGoTo }) {
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setRecentLoading(true);
    apiGet("/api/employees?page=0&size=6&sort=createdAt&direction=desc")
      .then((page) => mounted && setRecent(page?.content || []))
      .catch(() => mounted && setRecent([]))
      .finally(() => mounted && setRecentLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = dash?.kpis || [];
  const charts = dash?.charts || [];
  const activities = dash?.recentActivities || [];
  const kpi = (code) => kpis.find((item) => item.code === code)?.count ?? 0;

  const kpiCards = [
    { label: "Total Employees", code: "TOTAL_EMPLOYEES", color: "#2563eb", icon: Users },
    { label: "Active Employees", code: "ACTIVE_EMPLOYEES", color: "#059669", icon: UserCheck },
    { label: "Inactive Employees", code: "INACTIVE_EMPLOYEES", color: "#dc2626", icon: User },
    { label: "New This Month", code: "NEW_EMPLOYEES", color: "#f59e0b", icon: TrendingUp },
    { label: "With User Account", code: "WITH_USER_ACCOUNT", color: "#7c3aed", icon: KeyRound },
    { label: "Without Manager", code: "WITHOUT_MANAGER", color: "#e11d48", icon: GitBranch },
  ];

  const chartByCode = (code) => charts.find((c) => c.code === code);

  const actionCenter = [
    { label: "Employees without reporting manager", value: kpi("WITHOUT_MANAGER"), color: "#e11d48", tab: "directory" },
    { label: "Inactive employees requiring review", value: kpi("INACTIVE_EMPLOYEES"), color: "#dc2626", tab: "directory" },
    { label: "New joiners this month", value: kpi("NEW_EMPLOYEES"), color: "#059669", tab: "directory" },
  ];

  return (
    <>
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginTop: 24 }}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.code} style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e7ebf0", boxShadow: "0 2px 10px #1322380d", transition: "transform .15s ease, box-shadow .15s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px #1322381a"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 10px #1322380d"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "#68778a", fontSize: 12.5, fontWeight: 600 }}>{card.label}</div>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${card.color}14`, color: card.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} />
                </div>
              </div>
              <strong style={{ display: "block", fontSize: 28, marginTop: 8, color: "#111" }}>
                {loading ? "—" : countFormat.format(kpi(card.code))}
              </strong>
              <span style={{ color: "#15803d", fontSize: 11.5, fontWeight: 700 }}>● Live from database</span>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16, marginTop: 20 }}>
        {[chartByCode("EMPLOYEES_BY_STATUS"), chartByCode("EMPLOYEES_BY_MANAGER")].filter(Boolean).map((chart) => (
          <section key={chart.code} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e7ebf0" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#111" }}>{chart.label}</h3>
            {chart.points?.length ? (
              <MiniBars points={chart.points} />
            ) : (
              <p style={{ color: "#68778a", fontSize: 13, margin: 0 }}>No data recorded yet.</p>
            )}
          </section>
        ))}
      </div>

      {/* Action centre + recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16, marginTop: 20 }}>
        <section style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e7ebf0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111" }}>HR Action Centre</h3>
          {actionCenter.map((action) => (
            <button
              key={action.label}
              onClick={() => onGoTo(action.tab)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "1px solid #e7ebf0", borderRadius: 10, background: "#fafbfc", padding: "12px 14px", marginBottom: 8, cursor: "pointer", textAlign: "left", transition: "border-color .15s ease, background .15s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = "#fffdf5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e7ebf0"; e.currentTarget.style.background = "#fafbfc"; }}
            >
              <span style={{ color: "#334155", fontSize: 13.5, fontWeight: 600 }}>{action.label}</span>
              <span style={{ fontWeight: 800, fontSize: 17, color: action.color }}>
                {loading ? "—" : countFormat.format(action.value)}
              </span>
            </button>
          ))}
        </section>

        <section style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e7ebf0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#111" }}>Recent System Activity</h3>
          {activities.length === 0 ? (
            <p style={{ color: "#68778a", fontSize: 13, margin: 0 }}>No recent activity yet.</p>
          ) : (
            activities.slice(0, 8).map((activity, index) => (
              <div key={index} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: index < 7 ? "1px solid #eef2f6" : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f8b4001a", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {activity.type?.includes("APPROVAL") ? <ShieldCheck size={15} /> : activity.type?.includes("ORDER") ? <BriefcaseBusiness size={15} /> : activity.type?.includes("PAYMENT") ? <Wallet size={15} /> : <FileText size={15} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {activity.referenceNumber} · {activity.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#68778a" }}>{activity.status} — {formatDateTime(activity.occurredAt)}</div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Recently created employees */}
      <section style={{ background: "#fff", borderRadius: 12, padding: 20, marginTop: 20, border: "1px solid #e7ebf0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111" }}>
            <Users size={16} style={{ verticalAlign: "-2px", marginRight: 6, color: ACCENT }} /> Recently created employees
          </h3>
          <button onClick={() => onGoTo("directory")} style={{ border: "none", background: "none", color: "#2563eb", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            View directory →
          </button>
        </div>
        {recentLoading ? (
          <LoadingRow text="Loading recent employees..." />
        ) : recent.length === 0 ? (
          <EmptyState text="No employee records found yet." />
        ) : (
          <DataTable
            rows={recent}
            columns={[
              { key: "name", label: "Employee", render: (e) => <strong style={{ color: "#111" }}>{fullName(e)}</strong> },
              { key: "employeeCode", label: "Code" },
              { key: "departmentName", label: "Department", render: (e) => e.departmentName || "Unassigned" },
              { key: "roleName", label: "Designation", render: (e) => e.roleName || "Employee" },
              { key: "managerName", label: "Manager", render: (e) => e.managerName || "—" },
              { key: "active", label: "Status", render: (e) => <StatusChip active={e.active} /> },
            ]}
          />
        )}
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Employee Directory                                                 */
/* ------------------------------------------------------------------ */
function DirectoryView({ departments, roles, costCenters, onChanged }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState({ departmentId: "", roleId: "", managerId: "", costCenterId: "", active: "" });
  const [managers, setManagers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [profileEmployee, setProfileEmployee] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Managers for the reporting-manager filter (active employees).
  useEffect(() => {
    let mounted = true;
    apiGet("/api/employees?active=true&page=0&size=500")
      .then((pageData) => mounted && setManagers(pageData?.content || []))
      .catch(() => mounted && setManagers([]));
    return () => {
      mounted = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size), sort: "createdAt", direction: "desc" });
      if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
      if (filters.departmentId) params.set("departmentId", filters.departmentId);
      if (filters.roleId) params.set("roleId", filters.roleId);
      if (filters.managerId) params.set("managerId", filters.managerId);
      if (filters.costCenterId) params.set("costCenterId", filters.costCenterId);
      if (filters.active !== "") params.set("active", filters.active);
      const data = await apiGet(`/api/employees?${params.toString()}`);
      setRows(data?.content || []);
      setTotal(data?.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const resetPage = () => setPage(0);

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    setPage(0);
    onChanged();
    triggerToast("Employee record saved to the database.");
  };

  const toggleActive = async (employee) => {
    setConfirmTarget(null);
    try {
      await apiPut(`/api/employees/${employee.id}`, {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || null,
        departmentId: employee.departmentId,
        costCenterId: employee.costCenterId,
        roleId: employee.roleId,
        managerId: employee.managerId,
        active: !employee.active,
      });
      triggerToast(employee.active ? "Employee deactivated (linked account disabled)." : "Employee activated (linked account enabled).", employee.active ? "warn" : "ok");
      onChanged();
    } catch (err) {
      triggerToast(err.message || "Failed to update employee status.", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 20, border: "1px solid #e7ebf0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111" }}>
          Employee Directory <span style={{ color: "#68778a", fontSize: 13, fontWeight: 600 }}>({countFormat.format(total)})</span>
        </h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #dbe2ea", borderRadius: 9, padding: "8px 12px", background: "#f8f9fb" }}>
            <Search size={15} color="#68778a" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); resetPage(); }}
              placeholder="Search name, code or email"
              style={{ border: 0, outline: 0, background: "transparent", fontSize: 13.5, minWidth: 180 }}
            />
            {keyword && <X size={14} onClick={() => { setKeyword(""); resetPage(); }} style={{ cursor: "pointer" }} />}
          </div>
          <FilterSelect value={filters.departmentId} onChange={(v) => { setFilters((f) => ({ ...f, departmentId: v })); resetPage(); }} placeholder="All departments">
            {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
          </FilterSelect>
          <FilterSelect value={filters.roleId} onChange={(v) => { setFilters((f) => ({ ...f, roleId: v })); resetPage(); }} placeholder="Designation / Role">
            {roles.filter((r) => r.active !== false && !["ADMIN", "SUPER_ADMIN"].includes(r.roleCode)).map((r) => <option key={r.id} value={r.id}>{r.roleName}</option>)}
          </FilterSelect>
          <FilterSelect value={filters.managerId} onChange={(v) => { setFilters((f) => ({ ...f, managerId: v })); resetPage(); }} placeholder="All managers">
            {managers.map((m) => <option key={m.id} value={m.id}>{fullName(m)}</option>)}
          </FilterSelect>
          <FilterSelect value={filters.costCenterId} onChange={(v) => { setFilters((f) => ({ ...f, costCenterId: v })); resetPage(); }} placeholder="All cost centers">
            {costCenters.map((cc) => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
          </FilterSelect>
          <FilterSelect value={filters.active} onChange={(v) => { setFilters((f) => ({ ...f, active: v })); resetPage(); }} placeholder="All statuses">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </FilterSelect>
          <button
            onClick={() => { setEditing(null); setFormOpen(true); }}
            style={{ border: 0, borderRadius: 9, background: ACCENT, color: "#111", padding: "10px 16px", cursor: "pointer", fontWeight: 800, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(248,180,0,.3)" }}
          >
            <PlusCircle size={15} /> New Employee
          </button>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, padding: 12, background: "#fff1f2", color: "#be123c", borderRadius: 9, fontWeight: 600 }}>{error}</div>}

      {loading ? (
        <LoadingRow text="Loading employee records..." />
      ) : rows.length === 0 ? (
        <EmptyState text="No employees match the current search and filters." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}>
            <thead>
              <tr>
                {["Employee", "Code", "Department", "Designation", "Manager", "Email", "Status", "Actions"].map((heading) => (
                  <th key={heading} style={{ textAlign: "left", color: "#68778a", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 10px", borderBottom: "1px solid #e7edf3", whiteSpace: "nowrap" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((employee) => (
                <tr key={employee.id} style={{ borderBottom: "1px solid #eef2f6" }}>
                  <td style={{ padding: "12px 10px" }}>
                    <strong style={{ color: "#111", fontSize: 13.5 }}>{fullName(employee)}</strong>
                    <div style={{ fontSize: 12, color: "#68778a" }}>{employee.email}</div>
                  </td>
                  <td style={{ padding: "12px 10px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>{employee.employeeCode}</td>
                  <td style={{ padding: "12px 10px" }}>{employee.departmentName || "Unassigned"}</td>
                  <td style={{ padding: "12px 10px" }}>{employee.roleName || "Employee"}</td>
                  <td style={{ padding: "12px 10px" }}>{employee.managerName || "—"}</td>
                  <td style={{ padding: "12px 10px", color: "#64748b" }}>{employee.email}</td>
                  <td style={{ padding: "12px 10px" }}><StatusChip active={employee.active} /></td>
                  <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                    {(() => {
                      const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(employee.roleCode);
                      if (isAdmin) {
                        return (
                          <>
                            <IconBtn title="View profile" onClick={() => setProfileEmployee(employee)}><Eye size={15} /></IconBtn>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", padding: "3px 8px", borderRadius: 20 }} title="Protected — HR cannot modify administrator records">Protected</span>
                          </>
                        );
                      }
                      return (
                        <>
                          <IconBtn title="View profile" onClick={() => setProfileEmployee(employee)}><Eye size={15} /></IconBtn>
                          <IconBtn title={employee.active ? "Deactivate" : "Activate"} onClick={() => (employee.active ? setConfirmTarget(employee) : toggleActive(employee))} danger={employee.active}>
                            {employee.active ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                          </IconBtn>
                        </>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
        <span style={{ color: "#68778a", fontSize: 13 }}>
          Showing page {page + 1} of {totalPages} · {countFormat.format(total)} employees
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={pageBtn(page === 0)}>
            <ChevronLeft size={15} /> Prev
          </button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={pageBtn(page >= totalPages - 1)}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {formOpen && (
        <EmployeeFormModal
          departments={departments}
          roles={roles}
          employee={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {profileEmployee && (
        <EmployeeProfileDrawer employee={profileEmployee} onClose={() => setProfileEmployee(null)} />
      )}

      {/* Deactivation confirmation dialog */}
      {confirmTarget && (
        <Modal title="Confirm Deactivation" onClose={() => setConfirmTarget(null)} width="440px">
          <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
            <XCircle size={44} color="#dc2626" style={{ margin: "0 auto 12px" }} />
            <p style={{ margin: 0, color: "#334155", fontSize: 14.5, lineHeight: 1.6 }}>
              Deactivate <strong>{fullName(confirmTarget)}</strong> ({confirmTarget.employeeCode})?
              <br />
              <span style={{ color: "#64748b", fontSize: 13 }}>The linked user account will be disabled and the employee will lose login access. Historical records are preserved.</span>
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setConfirmTarget(null)} style={{ padding: "10px 20px", border: "1px solid #d9d9d9", borderRadius: 9, cursor: "pointer", background: "#f8f9fb", color: "#111", fontWeight: 700, fontSize: 13.5 }}>Cancel</button>
              <button onClick={() => toggleActive(confirmTarget)} style={{ padding: "10px 22px", border: 0, borderRadius: 9, cursor: "pointer", background: "#dc2626", color: "#fff", fontWeight: 800, fontSize: 13.5 }}>Yes, Deactivate</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast toast={toast} />}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Employee create/edit modal with dependent dropdowns                */
/* ------------------------------------------------------------------ */
function EmployeeFormModal({ departments, roles, employee, onClose, onSaved }) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    departmentId: employee?.departmentId || "",
    costCenterId: employee?.costCenterId || "",
    roleId: employee?.roleId || "",
    managerId: employee?.managerId || "",
    active: employee?.active ?? true,
  });
  const [costCenters, setCostCenters] = useState([]);
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Dependent dropdowns: cost centers for selected department
  useEffect(() => {
    if (!form.departmentId) {
      setCostCenters([]);
      return;
    }
    let mounted = true;
    apiGet(`/api/cost-centers/by-department/${form.departmentId}`)
      .then((list) => {
        if (!mounted) return;
        const activeList = (list || []).filter((cc) => cc.active !== false);
        setCostCenters(activeList);
        if (!activeList.some((cc) => String(cc.id) === String(form.costCenterId))) {
          setForm((f) => ({ ...f, costCenterId: "" }));
        }
      })
      .catch(() => mounted && setCostCenters([]));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.departmentId]);

  // Eligible managers (active employees)
  useEffect(() => {
    let mounted = true;
    apiGet("/api/employees?active=true&page=0&size=500")
      .then((page) => mounted && setManagers(page?.content || []))
      .catch(() => mounted && setManagers([]));
    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address";
    if (form.phone && !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) errors.phone = "Enter a valid phone number";
    if (!form.departmentId) errors.departmentId = "Department is required";
    if (!form.costCenterId) errors.costCenterId = "Cost center is required";
    if (!form.roleId) errors.roleId = "Designation / role is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        departmentId: Number(form.departmentId),
        costCenterId: Number(form.costCenterId),
        roleId: Number(form.roleId),
        managerId: form.managerId ? Number(form.managerId) : null,
        active: form.active,
      };
      if (isEdit) {
        await apiPut(`/api/employees/${employee.id}`, payload);
      } else {
        await apiPost("/api/employees", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save employee. Please check the entered values.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit Employee — ${employee.employeeCode}` : "New Employee"} onClose={onClose} width="680px">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="First Name *" error={fieldErrors.firstName}>
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle(!!fieldErrors.firstName)} placeholder="e.g. Rahul" />
        </Field>
        <Field label="Last Name *" error={fieldErrors.lastName}>
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle(!!fieldErrors.lastName)} placeholder="e.g. Kumar" />
        </Field>
        <Field label="Email *" error={fieldErrors.email}>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle(!!fieldErrors.email)} placeholder="name@company.com" />
        </Field>
        <Field label="Phone" error={fieldErrors.phone}>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle(!!fieldErrors.phone)} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Department *" error={fieldErrors.departmentId}>
          <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value, costCenterId: "" })} style={inputStyle(!!fieldErrors.departmentId)}>
            <option value="">Select department</option>
            {departments.filter((d) => d.active !== false).map((d) => (
              <option key={d.id} value={d.id}>{d.departmentName}</option>
            ))}
          </select>
        </Field>
        <Field label="Cost Center *" error={fieldErrors.costCenterId} hint={!form.departmentId ? "Select a department first" : undefined}>
          <select value={form.costCenterId} onChange={(e) => setForm({ ...form, costCenterId: e.target.value })} style={inputStyle(!!fieldErrors.costCenterId)} disabled={!form.departmentId || costCenters.length === 0}>
            <option value="">{costCenters.length ? "Select cost center" : form.departmentId ? "No cost centers for this department" : "Select department first"}</option>
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
            ))}
          </select>
        </Field>
        <Field label="Designation / Role *" error={fieldErrors.roleId}>
          <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} style={inputStyle(!!fieldErrors.roleId)}>
            <option value="">Select designation</option>
            {roles.filter((r) => r.active !== false && !["ADMIN", "SUPER_ADMIN"].includes(r.roleCode)).map((r) => (
              <option key={r.id} value={r.id}>{r.roleName}</option>
            ))}
          </select>
        </Field>
        <Field label="Reporting Manager" hint="Optional — must not be the employee themselves">
          <select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} style={inputStyle()}>
            <option value="">No manager</option>
            {(() => {
              let options = managers.filter((m) => !isEdit || m.id !== employee.id);
              // Keep the current manager selectable even if their account is inactive.
              if (isEdit && employee.managerId && !options.some((m) => m.id === employee.managerId)) {
                options = [{ id: employee.managerId, firstName: employee.managerName || "Current", lastName: "", employeeCode: "", displayName: employee.managerName }, ...options];
              }
              return options.map((m) => (
                <option key={m.id} value={m.id}>{fullName(m)}{m.employeeCode ? ` (${m.employeeCode})` : ""}</option>
              ));
            })()}
          </select>
        </Field>
        <Field label="Employment Status">
          <select value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })} style={inputStyle()}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </Field>
      </div>

      {error && <div style={{ marginTop: 14, padding: 12, background: "#fff1f2", color: "#be123c", borderRadius: 9, fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}><AlertCircle size={16} /> {error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1px solid #d9d9d9", borderRadius: 9, cursor: "pointer", background: "#f8f9fb", color: "#111", fontWeight: 700, fontSize: 13.5 }}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 22px", border: 0, borderRadius: 9, cursor: "pointer", background: ACCENT, color: "#111", fontWeight: 800, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(248,180,0,.35)", opacity: saving ? 0.6 : 1 }}>
          {saving ? <Loader2 size={15} style={{ animation: "hrSpin 1s linear infinite" }} /> : <CheckCircle2 size={15} />}
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Employee"}
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Employee profile drawer with procurement history                   */
/* ------------------------------------------------------------------ */
function EmployeeProfileDrawer({ employee, onClose }) {
  const [prs, setPrs] = useState([]);
  const [prLoading, setPrLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setPrLoading(true);
    apiGet(`/api/purchase-requests?requesterId=${employee.id}&page=0&size=10`)
      .then((page) => mounted && setPrs(page?.content || []))
      .catch(() => mounted && setPrs([]))
      .finally(() => mounted && setPrLoading(false));
    return () => {
      mounted = false;
    };
  }, [employee.id]);

  // Linked user account (matched by employeeId from the real accounts API).
  useEffect(() => {
    let mounted = true;
    setAccountLoading(true);
    apiGet("/api/users/search?page=0&size=500")
      .then((page) => {
        const match = (page?.content || []).find((user) => user.employeeId === employee.id);
        if (mounted) setAccount(match || null);
      })
      .catch(() => mounted && setAccount(null))
      .finally(() => mounted && setAccountLoading(false));
    return () => {
      mounted = false;
    };
  }, [employee.id]);

  const InfoRow = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #eef2f6" }}>
      <span style={{ color: "#68778a", fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#111", fontSize: 13, fontWeight: 700, textAlign: "right" }}>{value || "—"}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.45)", backdropFilter: "blur(3px)", zIndex: 400, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ background: "#fff", width: "min(560px, 100%)", height: "100%", overflowY: "auto", padding: "26px 26px 40px", boxShadow: "-8px 0 30px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111" }}>Employee Profile</h2>
          <button onClick={onClose} style={{ border: "none", background: "#f1f3f5", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>
        <p style={{ color: "#68778a", fontSize: 13, margin: "0 0 18px" }}>Records loaded from the live database</p>

        {/* Identity header */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#fafbfc", border: "1px solid #e7ebf0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #d97706)`, color: "#0f1b2d", fontWeight: 900, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {initials(fullName(employee))}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>{fullName(employee)}</div>
            <div style={{ fontSize: 13, color: "#68778a" }}>{employee.employeeCode} · {employee.roleName || "Employee"}</div>
            <div style={{ marginTop: 6 }}><StatusChip active={employee.active} /></div>
          </div>
        </div>

        {/* Personal */}
        <SectionTitle>Personal Information</SectionTitle>
        <InfoRow label="Employee ID" value={employee.employeeCode} />
        <InfoRow label="First Name" value={employee.firstName} />
        <InfoRow label="Last Name" value={employee.lastName} />
        <InfoRow label="Email" value={employee.email} />
        <InfoRow label="Phone" value={employee.phone} />

        {/* Employment */}
        <SectionTitle>Employment Information</SectionTitle>
        <InfoRow label="Department" value={employee.departmentName} />
        <InfoRow label="Designation" value={employee.roleName} />
        <InfoRow label="Reporting Manager" value={employee.managerName} />
        <InfoRow label="Cost Center" value={employee.costCenterName} />
        <InfoRow label="Status" value={employee.active ? "Active" : "Inactive"} />
        <InfoRow label="Created" value={formatDateTime(employee.createdAt)} />
        <InfoRow label="Last Updated" value={formatDateTime(employee.updatedAt)} />

        {/* Account information */}
        <SectionTitle>Account Information</SectionTitle>
        {accountLoading ? (
          <LoadingRow text="Loading account status..." />
        ) : !account ? (
          <div style={{ padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, color: "#b45309", fontSize: 13, fontWeight: 600 }}>
            No user account linked. Account creation is managed by Admin.
          </div>
        ) : (
          <>
            <InfoRow label="Username" value={account.username} />
            <InfoRow label="Assigned Role" value={account.roleName} />
            <InfoRow label="Account Status" value={!account.enabled ? "Disabled" : account.accountLocked ? "Locked" : "Active"} />
            <InfoRow label="Last Login" value={formatDateTime(account.lastLogin)} />
            <InfoRow label="Account Created" value={formatDate(account.createdAt)} />
          </>
        )}

        {/* Procurement history */}
        <SectionTitle>Procurement Activity</SectionTitle>
        {prLoading ? (
          <LoadingRow text="Loading purchase requests..." />
        ) : prs.length === 0 ? (
          <p style={{ color: "#68778a", fontSize: 13 }}>No purchase requests recorded for this employee.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["PR No.", "Purpose", "Amount", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", color: "#68778a", fontSize: 11, textTransform: "uppercase", letterSpacing: ".3px", padding: "8px 6px", borderBottom: "1px solid #e7edf3" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => (
                  <tr key={pr.id}>
                    <td style={{ padding: "9px 6px", fontWeight: 700, color: "#111", fontSize: 12.5 }}>{pr.requestNumber}</td>
                    <td style={{ padding: "9px 6px", fontSize: 12.5, color: "#334155", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.purpose}</td>
                    <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{pr.estimatedAmount ? moneyFormat.format(pr.estimatedAmount) : "—"}</td>
                    <td style={{ padding: "9px 6px", fontSize: 12.5, fontWeight: 600, color: statusColor(pr.approvalStatus || pr.status) }}>{pr.approvalStatus || pr.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Procurement Tracking (All Active PRs monitoring)                   */
/* ------------------------------------------------------------------ */
function ProcurementTrackingView({ departments }) {
  const canViewAll = hasPermission("CAN_VIEW_ALL_EMPLOYEE_PR");
  const canTimeline = hasPermission("CAN_VIEW_PR_TIMELINE");
  const canApprovalHistory = hasPermission("CAN_VIEW_APPROVAL_HISTORY");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState({
    departmentId: "",
    requesterId: "",
    status: "",
    approvalStatus: "",
    createdDateFrom: "",
    createdDateTo: "",
  });
  const [employees, setEmployees] = useState([]);
  const [selectedPr, setSelectedPr] = useState(null);
  const [prDetail, setPrDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  // Employees for the searchable requester dropdown.
  useEffect(() => {
    let mounted = true;
    apiGet("/api/employees?page=0&size=500&sort=firstName&direction=asc")
      .then((pageData) => mounted && setEmployees(pageData?.content || []))
      .catch(() => mounted && setEmployees([]));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size), sort: "createdAt", direction: "desc" });
      if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
      if (filters.departmentId) params.set("departmentId", filters.departmentId);
      if (filters.requesterId) params.set("requesterId", filters.requesterId);
      if (filters.status) params.set("status", filters.status);
      if (filters.approvalStatus) params.set("approvalStatus", filters.approvalStatus);
      if (filters.createdDateFrom) params.set("createdDateFrom", filters.createdDateFrom);
      if (filters.createdDateTo) params.set("createdDateTo", filters.createdDateTo);
      const data = await apiGet(`/api/hr/purchase-requests?${params.toString()}`);
      setRows(data?.content || []);
      setTotal(data?.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load active purchase requests.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const resetPage = () => setPage(0);

  const openPr = async (pr) => {
    setSelectedPr(pr);
    setPrDetail(null);
    setTimeline(null);
    setDetailLoading(true);
    try {
      const detail = await apiGet(`/api/hr/purchase-requests/${pr.id}`);
      setPrDetail(detail);
    } catch (err) {
      triggerToast(err.message || "Failed to load PR detail.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const openTimeline = async (pr) => {
    if (!canTimeline) {
      triggerToast("You do not have permission to view PR timelines.", "warn");
      return;
    }
    setTimeline(null);
    setTimelineLoading(true);
    try {
      const events = await apiGet(`/api/hr/purchase-requests/${pr.id}/timeline`);
      setTimeline(events || []);
    } catch (err) {
      triggerToast(err.message || "Failed to load the PR timeline.", "error");
    } finally {
      setTimelineLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 20, border: "1px solid #e7ebf0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111" }}>
          <ClipboardList size={17} style={{ verticalAlign: "-2px", marginRight: 6, color: ACCENT }} />
          Active Purchase Requests <span style={{ color: "#68778a", fontSize: 13, fontWeight: 600 }}>({countFormat.format(total)})</span>
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {!canViewAll && (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", padding: "5px 11px", borderRadius: 20 }}>
              Scoped to your department
            </span>
          )}
          {canViewAll && (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#047857", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 11px", borderRadius: 20 }}>
              Organisation-wide scope
            </span>
          )}
        </div>
      </div>
      <p style={{ margin: "0 0 14px", color: "#68778a", fontSize: 13 }}>
        Every employee purchase request in progress, live from the database — with the current stage, owner and approval history.
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #dbe2ea", borderRadius: 9, padding: "8px 12px", background: "#f8f9fb" }}>
          <Search size={15} color="#68778a" />
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); resetPage(); }}
            placeholder="Search PR number, purpose"
            style={{ border: 0, outline: 0, background: "transparent", fontSize: 13.5, minWidth: 170 }}
          />
          {keyword && <X size={14} onClick={() => { setKeyword(""); resetPage(); }} style={{ cursor: "pointer" }} />}
        </div>
        <FilterSelect value={filters.status} onChange={(v) => { setFilters((f) => ({ ...f, status: v })); resetPage(); }} placeholder="All statuses">
          {["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "RFQ_CREATED", "REJECTED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={filters.approvalStatus} onChange={(v) => { setFilters((f) => ({ ...f, approvalStatus: v })); resetPage(); }} placeholder="Approval status">
          {["PENDING", "APPROVED", "REJECTED", "RETURNED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={filters.departmentId} onChange={(v) => { setFilters((f) => ({ ...f, departmentId: v })); resetPage(); }} placeholder="All departments">
          {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
        </FilterSelect>
        <FilterSelect value={filters.requesterId} onChange={(v) => { setFilters((f) => ({ ...f, requesterId: v })); resetPage(); }} placeholder="All employees">
          {employees.map((e) => <option key={e.id} value={e.id}>{fullName(e)} ({e.employeeCode})</option>)}
        </FilterSelect>
        <input type="date" value={filters.createdDateFrom} onChange={(e) => { setFilters((f) => ({ ...f, createdDateFrom: e.target.value })); resetPage(); }} style={dateInputStyle()} title="From date" />
        <input type="date" value={filters.createdDateTo} onChange={(e) => { setFilters((f) => ({ ...f, createdDateTo: e.target.value })); resetPage(); }} style={dateInputStyle()} title="To date" />
        <button
          onClick={load}
          style={{ border: "1px solid #d9d9d9", background: "#f8f9fb", borderRadius: 9, padding: "9px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#111", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <div style={{ marginBottom: 12, padding: 12, background: "#fff1f2", color: "#be123c", borderRadius: 9, fontWeight: 600 }}>{error}</div>}

      {loading ? (
        <LoadingRow text="Loading active purchase requests..." />
      ) : rows.length === 0 ? (
        <EmptyState text="No active purchase requests match the current filters." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}>
            <thead>
              <tr>
                {["PR Number", "Requester", "Department", "Purpose", "Amount", "Status", "Approval", "Stage / Owner", "Age", "Actions"].map((heading) => (
                  <th key={heading} style={{ textAlign: "left", color: "#68778a", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 10px", borderBottom: "1px solid #e7edf3", whiteSpace: "nowrap" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((pr) => (
                <tr key={pr.id} style={{ borderBottom: "1px solid #eef2f6" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>{pr.requestNumber}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <strong style={{ fontSize: 13, color: "#111" }}>{pr.requesterName}</strong>
                    <div style={{ fontSize: 12, color: "#68778a" }}>{pr.employeeCode}</div>
                  </td>
                  <td style={{ padding: "12px 10px", color: "#334155" }}>{pr.departmentName || "—"}</td>
                  <td style={{ padding: "12px 10px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#334155" }} title={pr.purpose}>{pr.purpose || "—"}</td>
                  <td style={{ padding: "12px 10px", fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>{pr.estimatedAmount != null ? moneyFormat.format(pr.estimatedAmount) : "—"}</td>
                  <td style={{ padding: "12px 10px" }}><StatusChip active={pr.status === "APPROVED" || pr.status === "RFQ_CREATED"} label={pr.status} /></td>
                  <td style={{ padding: "12px 10px" }}><ApprovalChip status={pr.approvalStatus} /></td>
                  <td style={{ padding: "12px 10px" }}>
                    {pr.currentStage && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111" }}>{pr.currentStage}</div>}
                    {pr.currentOwner && <div style={{ fontSize: 12, color: "#68778a" }}>{pr.currentOwner}</div>}
                    {!pr.currentStage && <span style={{ color: "#94a3b8" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 10px", color: pr.ageDays >= 7 ? "#dc2626" : "#64748b", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {pr.ageDays}d
                  </td>
                  <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                    <IconBtn title="View detail" onClick={() => openPr(pr)}><Eye size={15} /></IconBtn>
                    {canTimeline && (
                      <IconBtn title="View full process" onClick={() => openTimeline(pr)}><History size={15} /></IconBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
        <span style={{ color: "#68778a", fontSize: 13 }}>
          Page {page + 1} of {totalPages} · {countFormat.format(total)} requests
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={pageBtn(page === 0)}><ChevronLeft size={15} /> Prev</button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={pageBtn(page >= totalPages - 1)}>Next <ChevronRight size={15} /></button>
        </div>
      </div>

      {/* PR detail drawer */}
      {selectedPr && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.45)", backdropFilter: "blur(3px)", zIndex: 400, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: "#fff", width: "min(620px, 100%)", height: "100%", overflowY: "auto", padding: "26px 26px 40px", boxShadow: "-8px 0 30px rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111" }}>Purchase Request Detail</h2>
              <button onClick={() => { setSelectedPr(null); setPrDetail(null); setTimeline(null); }} style={{ border: "none", background: "#f1f3f5", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
            </div>
            <p style={{ color: "#68778a", fontSize: 13, margin: "0 0 18px" }}>{selectedPr.requestNumber} · live from the database</p>

            {detailLoading ? (
              <LoadingRow text="Loading request detail..." />
            ) : prDetail ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <InfoBox label="Requester" value={prDetail.requesterName} />
                  <InfoBox label="Employee ID" value={prDetail.employeeCode} />
                  <InfoBox label="Department" value={prDetail.departmentName} />
                  <InfoBox label="Cost Center" value={prDetail.costCenterName} />
                  <InfoBox label="Manager" value={prDetail.managerName} />
                  <InfoBox label="Priority" value={prDetail.priority} />
                  <InfoBox label="Status" value={prDetail.status} />
                  <InfoBox label="Approval Status" value={prDetail.approvalStatus} />
                  <InfoBox label="Estimated Amount" value={prDetail.estimatedAmount != null ? moneyFormat.format(prDetail.estimatedAmount) : "—"} />
                  <InfoBox label="Request Date" value={formatDate(prDetail.requestDate)} />
                  <InfoBox label="Required Date" value={formatDate(prDetail.requiredDate)} />
                  <InfoBox label="Age" value={`${prDetail.ageDays} day(s)`} />
                  <InfoBox label="Current Stage" value={prDetail.currentStage} />
                  <InfoBox label="Current Owner" value={prDetail.currentOwner} />
                </div>
                {prDetail.nextAction && (
                  <div style={{ marginTop: 12, padding: "11px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                    Next: {prDetail.nextAction}
                  </div>
                )}
                {prDetail.purpose && (
                  <div style={{ marginTop: 12, fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>
                    <SectionTitle>Purpose</SectionTitle>
                    {prDetail.purpose}
                  </div>
                )}

                {/* Approval history */}
                {canApprovalHistory && (
                  <>
                    <SectionTitle>Approval History</SectionTitle>
                    {!prDetail.approvalHistory || prDetail.approvalHistory.length === 0 ? (
                      <p style={{ color: "#68778a", fontSize: 13 }}>No approval decisions recorded yet.</p>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["Stage", "Approver", "Role", "Decision", "Comments", "Date"].map((h) => (
                                <th key={h} style={{ textAlign: "left", color: "#68778a", fontSize: 11, textTransform: "uppercase", letterSpacing: ".3px", padding: "8px 6px", borderBottom: "1px solid #e7edf3" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {prDetail.approvalHistory.map((task) => (
                              <tr key={task.taskId}>
                                <td style={{ padding: "9px 6px", fontWeight: 700, color: "#111", fontSize: 12.5 }}>{task.stageName}</td>
                                <td style={{ padding: "9px 6px", fontSize: 12.5 }}>
                                  <div style={{ fontWeight: 700, color: "#111" }}>{task.approverName}</div>
                                  <div style={{ fontSize: 11.5, color: "#68778a" }}>{task.approverEmployeeCode}</div>
                                </td>
                                <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{task.approverRole}</td>
                                <td style={{ padding: "9px 6px" }}><ApprovalChip status={task.status} /></td>
                                <td style={{ padding: "9px 6px", fontSize: 12.5, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={task.comments || ""}>{task.comments || "—"}</td>
                                <td style={{ padding: "9px 6px", fontSize: 12.5, whiteSpace: "nowrap" }}>{task.completedDate ? formatDateTime(task.completedDate) : formatDateTime(task.assignedDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {canTimeline && (
                    <button
                      onClick={() => openTimeline(selectedPr)}
                      style={{ border: 0, borderRadius: 9, background: ACCENT, color: "#111", padding: "11px 18px", cursor: "pointer", fontWeight: 800, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(248,180,0,.35)" }}
                    >
                      <History size={15} /> View Full Process
                    </button>
                  )}
                  {!canTimeline && (
                    <span style={{ fontSize: 12.5, color: "#94a3b8" }}>PR timeline access is restricted for your role.</span>
                  )}
                </div>
              </>
            ) : (
              <p style={{ color: "#be123c", fontWeight: 600 }}>Unable to load request detail.</p>
            )}

            {/* Timeline */}
            {timeline && (
              <div style={{ marginTop: 26 }}>
                <SectionTitle>Full Process Timeline</SectionTitle>
                <p style={{ fontSize: 12.5, color: "#68778a", margin: "0 0 12px" }}>
                  Who handled this request, when — from approval tasks and audit events.
                </p>
                {timeline.length === 0 ? (
                  <p style={{ color: "#68778a", fontSize: 13 }}>No timeline events recorded yet.</p>
                ) : (
                  timeline.map((event, index) => (
                    <div key={index} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: index === timeline.length - 1 ? "#059669" : "#f8b4001a", color: index === timeline.length - 1 ? "#fff" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>
                          <CheckCircle2 size={14} />
                        </div>
                        {index < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: "#e7ebf0" }} />}
                      </div>
                      <div style={{ paddingBottom: 8, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 13.5, color: "#111" }}>{event.action}</strong>
                          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{formatDateTime(event.timestamp)}</span>
                        </div>
                        {event.person && (
                          <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2 }}>
                            {event.person}
                            {event.employeeCode ? ` (${event.employeeCode})` : ""}
                            {event.role ? ` · ${event.role}` : ""}
                          </div>
                        )}
                        {event.comment && <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>{event.comment}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {timelineLoading && <LoadingRow text="Loading full process timeline..." />}
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} />}
    </section>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: "#fafbfc", border: "1px solid #e7ebf0", borderRadius: 9, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px", color: "#68778a", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>{value || "—"}</div>
    </div>
  );
}

function ApprovalChip({ status }) {
  const s = String(status || "").toUpperCase();
  const isOk = s === "APPROVED";
  const isBad = s === "REJECTED" || s === "RETURNED";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: isBad ? "#fff1f2" : isOk ? "#ecfdf5" : "#fffbeb", color: isBad ? "#be123c" : isOk ? "#047857" : "#b45309" }}>
      {s || "PENDING"}
    </span>
  );
}

const dateInputStyle = () => ({
  border: "1px solid #dbe2ea",
  borderRadius: 9,
  padding: "8px 10px",
  background: "#f8f9fb",
  fontSize: 12.5,
  color: "#334155",
  outline: "none",
  cursor: "pointer",
});

/* ------------------------------------------------------------------ */
/*  Departments view                                                   */
/* ------------------------------------------------------------------ */
function DepartmentsView({ departments, dash }) {
  const deptChart = dash?.charts?.find((c) => c.code === "EMPLOYEES_BY_DEPARTMENT");
  const counts = useMemo(() => {
    const map = {};
    (deptChart?.points || []).forEach((p) => { map[p.label] = Number(p.value); });
    return map;
  }, [deptChart]);

  if (!departments.length) {
    return <section style={{ background: "#fff", borderRadius: 12, padding: 40, marginTop: 20, border: "1px solid #e7ebf0", textAlign: "center" }}><EmptyState text="No departments configured yet. Admin can create departments." /></section>;
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 20 }}>
        {departments.map((dept) => {
          const empCount = dept.employeeCount ?? counts[dept.departmentName] ?? 0;
          return (
            <div key={dept.id} style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e7ebf0", boxShadow: "0 2px 10px #1322380d" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f8b4001a", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building size={18} />
                </div>
                <StatusChip active={dept.active !== false} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{dept.departmentName}</div>
              <div style={{ fontSize: 12, color: "#68778a", marginTop: 2 }}>{dept.departmentCode}</div>
              {dept.description && <p style={{ fontSize: 12.5, color: "#64748b", margin: "10px 0 0", lineHeight: 1.5 }}>{dept.description}</p>}
              <div style={{ display: "flex", gap: 20, marginTop: 14, borderTop: "1px solid #eef2f6", paddingTop: 12 }}>
                <div><div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{countFormat.format(empCount)}</div><div style={{ fontSize: 11.5, color: "#68778a", fontWeight: 600 }}>Employees</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{countFormat.format(dept.costCenterCount ?? 0)}</div><div style={{ fontSize: 11.5, color: "#68778a", fontWeight: 600 }}>Cost Centers</div></div>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ color: "#68778a", fontSize: 12.5, marginTop: 14 }}>
        Department master records are managed by Admin. Employee counts update automatically from the database.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Reporting structure (org tree)                                     */
/* ------------------------------------------------------------------ */
function StructureView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet("/api/employees?page=0&size=1000&sort=firstName&direction=asc")
      .then((page) => mounted && setEmployees(page?.content || []))
      .catch((err) => mounted && setError(err.message || "Failed to load employees."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const tree = useMemo(() => {
    const byId = new Map(employees.map((e) => [e.id, { ...e, children: [] }]));
    const roots = [];
    employees.forEach((e) => {
      const node = byId.get(e.id);
      const managerId = e.managerId;
      if (managerId && byId.has(managerId)) {
        byId.get(managerId).children.push(node);
      } else if (managerId && !byId.has(managerId)) {
        roots.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.managerId ? 1 : 0) - (b.managerId ? 1 : 0) || fullName(a).localeCompare(fullName(b)));
      nodes.forEach((n) => sortTree(n.children));
      return nodes;
    };
    return sortTree(roots);
  }, [employees]);

  if (loading) return <LoadingBox text="Building reporting structure from manager relationships..." />;
  if (error) return <ErrorBox message={error} />;
  if (!tree.length) return <section style={{ background: "#fff", borderRadius: 12, padding: 40, marginTop: 20, border: "1px solid #e7ebf0" }}><EmptyState text="No employees available to build the reporting structure." /></section>;

  const renderNode = (node, depth) => (
    <div key={node.id} style={{ marginLeft: depth === 0 ? 0 : 26, position: "relative" }}>
      {depth > 0 && <div style={{ position: "absolute", left: -16, top: 0, bottom: "50%", width: 12, borderLeft: "1.5px solid #d8dee7", borderBottom: "1.5px solid #d8dee7", borderBottomLeftRadius: 6 }} />}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: depth === 0 ? "#0f1b2d" : "#fff", color: depth === 0 ? "#fff" : "#111", border: `1px solid ${depth === 0 ? "#0f1b2d" : "#e7ebf0"}`, borderRadius: 10, padding: "10px 14px", margin: "6px 0", boxShadow: "0 2px 8px #1322380d", minWidth: 240 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: depth === 0 ? ACCENT : "#f8b4001a", color: depth === 0 ? "#0f1b2d" : "#d97706", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {initials(fullName(node))}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}>{fullName(node)}</div>
          <div style={{ fontSize: 11.5, color: depth === 0 ? "#8ea0b8" : "#68778a", whiteSpace: "nowrap" }}>
            {node.roleName || "Employee"} · {node.departmentName || "—"}
          </div>
        </div>
        {node.children.length > 0 && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: depth === 0 ? ACCENT : "#2563eb" }}>{node.children.length}</span>}
      </div>
      {node.children.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 24, marginTop: 20, border: "1px solid #e7ebf0" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#111" }}>
        <GitBranch size={17} style={{ verticalAlign: "-2px", marginRight: 6, color: ACCENT }} /> Organizational Reporting Structure
      </h2>
      <p style={{ color: "#68778a", fontSize: 13, margin: "0 0 18px" }}>
        Built from real manager relationships. Update an employee's manager to see the hierarchy change instantly.
      </p>
      {tree.map((node) => renderNode(node, 0))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Employee accounts                                                  */
/* ------------------------------------------------------------------ */
function AccountsView() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [noAccountEmployees, setNoAccountEmployees] = useState([]);
  const [toast, setToast] = useState(null);

  // Employees without a linked user account (from real employees + users data).
  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiGet("/api/employees?page=0&size=1000&sort=firstName&direction=asc"),
      apiGet("/api/users/search?page=0&size=500"),
    ])
      .then(([empPage, userPage]) => {
        if (!mounted) return;
        const linkedIds = new Set((userPage?.content || []).map((user) => user.employeeId));
        setNoAccountEmployees((empPage?.content || []).filter((emp) => !linkedIds.has(emp.id)));
      })
      .catch(() => mounted && setNoAccountEmployees([]));
    return () => {
      mounted = false;
    };
  }, []);

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size), sort: "createdAt", direction: "desc" });
      if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
      const data = await apiGet(`/api/users/search?${params.toString()}`);
      setRows(data?.content || []);
      setTotal(data?.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEnabled = async (user) => {
    setBusyId(user.id);
    try {
      await apiPut(`/api/users/${user.id}/status`, { enabled: !user.enabled, accountLocked: false });
      triggerToast(user.enabled ? "Account disabled." : "Account enabled.", user.enabled ? "warn" : "ok");
      load();
    } catch (err) {
      triggerToast(err.message || "Failed to update account status.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 20, border: "1px solid #e7ebf0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111" }}>
          Employee Accounts <span style={{ color: "#68778a", fontSize: 13, fontWeight: 600 }}>({countFormat.format(total)})</span>
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #dbe2ea", borderRadius: 9, padding: "8px 12px", background: "#f8f9fb" }}>
          <Search size={15} color="#68778a" />
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            placeholder="Search username or employee"
            style={{ border: 0, outline: 0, background: "transparent", fontSize: 13.5, minWidth: 180 }}
          />
          {keyword && <X size={14} onClick={() => { setKeyword(""); setPage(0); }} style={{ cursor: "pointer" }} />}
        </div>
      </div>

      <p style={{ margin: "0 0 12px", color: "#68778a", fontSize: 12.5 }}>
        Account creation and role assignment are managed by Admin. HR can review status and enable/disable access. Passwords are never displayed.
      </p>

      {noAccountEmployees.length > 0 && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: "#b45309", marginBottom: 6 }}>
            Employees without a user account ({noAccountEmployees.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {noAccountEmployees.map((emp) => (
              <span key={emp.id} style={{ fontSize: 12, fontWeight: 600, background: "#fff", border: "1px solid #fde68a", borderRadius: 20, padding: "4px 11px", color: "#92400e" }}>
                {fullName(emp)} ({emp.employeeCode})
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#92400e", marginTop: 6 }}>Account creation for these employees is handled by Admin.</div>
        </div>
      )}

      {error && <div style={{ marginBottom: 12, padding: 12, background: "#fff1f2", color: "#be123c", borderRadius: 9, fontWeight: 600 }}>{error}</div>}

      {loading ? (
        <LoadingRow text="Loading user accounts..." />
      ) : rows.length === 0 ? (
        <EmptyState text="No user accounts found." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}>
            <thead>
              <tr>
                {["User", "Employee", "Role", "Account Status", "Last Login", "Created", "Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", color: "#68778a", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 10px", borderBottom: "1px solid #e7edf3", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eef2f6" }}>
                  <td style={{ padding: "12px 10px" }}>
                    <strong style={{ color: "#111", fontSize: 13.5 }}>{user.username}</strong>
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <div style={{ fontWeight: 700, color: "#111", fontSize: 13 }}>{user.displayName}</div>
                    <div style={{ fontSize: 12, color: "#68778a" }}>{user.employeeCode}</div>
                  </td>
                  <td style={{ padding: "12px 10px" }}>{user.roleName}</td>
                  <td style={{ padding: "12px 10px" }}><AccountChip user={user} /></td>
                  <td style={{ padding: "12px 10px", color: "#64748b", fontSize: 12.5 }}>{user.lastLogin ? formatDateTime(user.lastLogin) : "Never"}</td>
                  <td style={{ padding: "12px 10px", color: "#64748b", fontSize: 12.5 }}>{formatDate(user.createdAt)}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <button
                      onClick={() => toggleEnabled(user)}
                      disabled={busyId === user.id}
                      style={{
                        border: "1px solid", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12,
                        background: user.enabled ? "#fff1f2" : "#ecfdf5", color: user.enabled ? "#be123c" : "#047857",
                        borderColor: user.enabled ? "#fecdd3" : "#a7f3d0", display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {busyId === user.id ? <Loader2 size={13} style={{ animation: "hrSpin 1s linear infinite" }} /> : user.enabled ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                      {user.enabled ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
        <span style={{ color: "#68778a", fontSize: 13 }}>Page {page + 1} of {totalPages} · {countFormat.format(total)} accounts</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={pageBtn(page === 0)}><ChevronLeft size={15} /> Prev</button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={pageBtn(page >= totalPages - 1)}>Next <ChevronRight size={15} /></button>
        </div>
      </div>

      {toast && <Toast toast={toast} />}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HR Reports                                                         */
/* ------------------------------------------------------------------ */
function ReportsView({ departments, costCenters, dash }) {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet("/api/employees?page=0&size=1000&sort=firstName&direction=asc")
      .then((page) => mounted && setAllEmployees(page?.content || []))
      .catch((err) => mounted && setError(err.message || "Failed to load employee data."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const dashCharts = dash?.charts || [];
  const chartPoints = (code) => dashCharts.find((c) => c.code === code)?.points || [];

  const downloadCsv = (filename, headers, rows) => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ msg: `${filename} downloaded — generated from live database data.`, tone: "ok" });
    setTimeout(() => setToast(null), 4000);
  };

  const exportDirectory = () =>
    downloadCsv(
      "employee-directory.csv",
      ["Employee Code", "First Name", "Last Name", "Email", "Phone", "Department", "Designation", "Manager", "Cost Center", "Status"],
      allEmployees.map((e) => [e.employeeCode, e.firstName, e.lastName, e.email, e.phone, e.departmentName, e.roleName, e.managerName, e.costCenterName, e.active ? "Active" : "Inactive"])
    );

  const exportDept = () =>
    downloadCsv(
      "department-wise-count.csv",
      ["Department", "Employees", "Cost Centers", "Status"],
      departments.map((d) => [d.departmentName, d.employeeCount ?? 0, d.costCenterCount ?? 0, d.active ? "Active" : "Inactive"])
    );

  const exportDesignation = () =>
    downloadCsv("designation-distribution.csv", ["Designation", "Employees"], chartPoints("EMPLOYEES_BY_DESIGNATION").map((p) => [p.label, Number(p.value)]));

  const exportStatus = () =>
    downloadCsv("active-inactive.csv", ["Status", "Employees"], chartPoints("EMPLOYEES_BY_STATUS").map((p) => [p.label, Number(p.value)]));

  const exportAccounts = () =>
    downloadCsv("account-status.csv", ["Account Status", "Employees"], chartPoints("EMPLOYEE_ACCOUNT_STATUS").map((p) => [p.label, Number(p.value)]));

  if (loading) return <LoadingBox text="Preparing HR reports from live database data..." />;
  if (error) return <ErrorBox message={error} />;

  const ReportCard = ({ title, subtitle, headers, rows, onExport }) => (
    <section style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e7ebf0", marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111" }}>{title}</h3>
          <p style={{ margin: "2px 0 0", color: "#68778a", fontSize: 12.5 }}>{subtitle}</p>
        </div>
        <button onClick={onExport} style={{ border: "1px solid #d9d9d9", background: "#f8f9fb", borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontWeight: 700, fontSize: 12.5, color: "#111", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Download size={14} /> CSV
        </button>
      </div>
      {rows.length === 0 ? (
        <EmptyState text="No data available for this report yet." />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h} style={{ textAlign: "left", color: "#68778a", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".4px", padding: "10px 8px", borderBottom: "1px solid #e7edf3" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map((row, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eef2f6" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "10px 8px", fontSize: 13, color: "#334155", fontWeight: ci === 0 ? 700 : 500 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <>
      <div style={{ marginTop: 16 }}>
        <ReportCard
          title="Employee Directory Report"
          subtitle="All employee records from MySQL"
          headers={["Code", "Name", "Email", "Phone", "Department", "Designation", "Manager", "Cost Center", "Status"]}
          rows={allEmployees.map((e) => [e.employeeCode, fullName(e), e.email, e.phone || "—", e.departmentName || "—", e.roleName || "—", e.managerName || "—", e.costCenterName || "—", e.active ? "Active" : "Inactive"])}
          onExport={exportDirectory}
        />
        <ReportCard
          title="Designation Distribution"
          subtitle="Employees grouped by designation / role"
          headers={["Designation", "Employees"]}
          rows={chartPoints("EMPLOYEES_BY_DESIGNATION").map((p) => [p.label, Number(p.value)])}
          onExport={exportDesignation}
        />
        <ReportCard
          title="Active vs Inactive Employees"
          subtitle="Employment status distribution"
          headers={["Status", "Employees"]}
          rows={chartPoints("EMPLOYEES_BY_STATUS").map((p) => [p.label, Number(p.value)])}
          onExport={exportStatus}
        />
        <ReportCard
          title="Manager-wise Employee Count"
          subtitle="Direct reports per reporting manager"
          headers={["Manager", "Direct Reports"]}
          rows={chartPoints("EMPLOYEES_BY_MANAGER").map((p) => [p.label, Number(p.value)])}
          onExport={() =>
            downloadCsv("manager-wise-count.csv", ["Manager", "Direct Reports"],
              chartPoints("EMPLOYEES_BY_MANAGER").map((p) => [p.label, Number(p.value)]))
          }
        />
        <ReportCard
          title="Missing Organizational Assignment"
          subtitle="Employees without a reporting manager — candidates for review"
          headers={["Code", "Name", "Department", "Designation"]}
          rows={allEmployees.filter((e) => !e.managerId).map((e) => [e.employeeCode, fullName(e), e.departmentName || "—", e.roleName || "—"])}
          onExport={() =>
            downloadCsv("missing-assignment.csv", ["Code", "Name", "Department", "Designation"],
              allEmployees.filter((e) => !e.managerId).map((e) => [e.employeeCode, fullName(e), e.departmentName || "", e.roleName || ""]))
          }
        />
        <ReportCard
          title="Cost Center Register"
          subtitle="Cost centers with budget position and headcount"
          headers={["Code", "Name", "Department", "Budget", "Used", "Remaining", "Employees"]}
          rows={costCenters.map((cc) => [cc.code, cc.name, cc.departmentName || "—", cc.budget ? moneyFormat.format(cc.budget) : "—", cc.usedBudget ? moneyFormat.format(cc.usedBudget) : "—", cc.remainingBudget ? moneyFormat.format(cc.remainingBudget) : "—", cc.employeeCount ?? 0])}
          onExport={() =>
            downloadCsv("cost-center-register.csv", ["Code", "Name", "Department", "Budget", "Used", "Remaining", "Employees"],
              costCenters.map((cc) => [cc.code, cc.name, cc.departmentName || "", cc.budget ?? "", cc.usedBudget ?? "", cc.remainingBudget ?? "", cc.employeeCount ?? 0]))
          }
        />
      </div>
      {toast && <Toast toast={toast} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */
function NotificationsView({ userId }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const userIdParam = userId ? `&userId=${userId}` : "";
      const data = await apiGet(`/api/notifications?page=${page}&size=${size}&sort=createdAt&direction=desc${userIdParam}`);
      setRows(data?.content || []);
      setTotal(data?.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, size, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      await apiPost(`/api/notifications/${id}/mark-read`);
      load();
    } catch (err) {
      triggerToast(err.message || "Failed to update notification.", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 20, border: "1px solid #e7ebf0" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#111" }}>
        <Bell size={17} style={{ verticalAlign: "-2px", marginRight: 6, color: ACCENT }} /> Notifications
      </h2>
      <p style={{ color: "#68778a", fontSize: 13, margin: "0 0 14px" }}>System notifications relevant to HR and employee management — from the backend notification service.</p>

      {error && <div style={{ marginBottom: 12, padding: 12, background: "#fff1f2", color: "#be123c", borderRadius: 9, fontWeight: 600 }}>{error}</div>}

      {loading ? (
        <LoadingRow text="Loading notifications..." />
      ) : rows.length === 0 ? (
        <EmptyState text="No notifications yet. They will appear here as the backend workflow generates them." />
      ) : (
        rows.map((notification) => (
          <div key={notification.id} style={{ display: "flex", gap: 12, padding: "13px 4px", borderBottom: "1px solid #eef2f6", alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: notification.status === "READ" ? "#f1f3f5" : "#f8b4001a", color: notification.status === "READ" ? "#94a3b8" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bell size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 13.5, color: "#111" }}>{notification.title || notification.notificationNumber}</strong>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>{formatDateTime(notification.createdAt)}</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{notification.message}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: notification.type === "SYSTEM" ? "#eef2ff" : "#f1f5f9", color: notification.type === "SYSTEM" ? "#4f46e5" : "#64748b" }}>
                  {notification.type || "SYSTEM"}
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: notification.status === "READ" ? "#f1f5f9" : "#ecfdf5", color: notification.status === "READ" ? "#64748b" : "#047857" }}>
                  {notification.status || "PENDING"}
                </span>
                {notification.status !== "READ" && (
                  <button onClick={() => markRead(notification.id)} style={{ border: "none", background: "none", color: "#2563eb", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
        <span style={{ color: "#68778a", fontSize: 13 }}>Page {page + 1} of {totalPages} · {countFormat.format(total)} notifications</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={pageBtn(page === 0)}><ChevronLeft size={15} /> Prev</button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={pageBtn(page >= totalPages - 1)}>Next <ChevronRight size={15} /></button>
        </div>
      </div>

      {toast && <Toast toast={toast} />}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI helpers                                                  */
/* ------------------------------------------------------------------ */
function MiniBars({ points }) {
  const max = Math.max(1, ...points.map((p) => Number(p.value)));
  const palette = ["#2563eb", "#059669", "#f59e0b", "#e11d48", "#7c3aed", "#0891b2", "#d97706", "#64748b", "#0d9488", "#dc2626"];
  return (
    <div>
      {points.map((point, index) => (
        <div key={`${point.label}-${index}`} style={{ marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
            <span style={{ color: "#334155", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{point.label}</span>
            <span style={{ color: "#111", fontWeight: 800 }}>{countFormat.format(Number(point.value))}</span>
          </div>
          <div style={{ height: 8, background: "#eef2f6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(Number(point.value) / max) * 100}%`, height: "100%", background: palette[index % palette.length], borderRadius: 4, transition: "width .4s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusChip({ active, label }) {
  const text = label ?? (active ? "Active" : "Inactive");
  const green = active === true;
  const red = active === false;
  const amber = active === undefined && label;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, padding: "4px 11px", borderRadius: 20, background: amber ? "#fffbeb" : green ? "#ecfdf5" : "#fff1f2", color: amber ? "#b45309" : green ? "#047857" : "#be123c" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: amber ? "#d97706" : green ? "#059669" : "#dc2626" }} />
      {text.replace(/_/g, " ")}
    </span>
  );
}

function AccountChip({ user }) {
  const enabled = user.enabled && !user.accountLocked;
  const label = !user.enabled ? "Disabled" : user.accountLocked ? "Locked" : "Active";
  const color = enabled ? "#047857" : user.accountLocked ? "#d97706" : "#be123c";
  const bg = enabled ? "#ecfdf5" : user.accountLocked ? "#fffbeb" : "#fff1f2";
  return (
    <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 11px", borderRadius: 20, background: bg, color }}>
      {label}
    </span>
  );
}

function FilterSelect({ value, onChange, placeholder, children }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ border: "1px solid #dbe2ea", borderRadius: 9, padding: "9px 10px", background: "#f8f9fb", fontSize: 13, color: "#334155", outline: "none", cursor: "pointer", maxWidth: 180 }}>
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}

function IconBtn({ children, title, onClick, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ border: "1px solid #e2e8f0", background: danger ? "#fff1f2" : "#f8f9fb", color: danger ? "#be123c" : "#475569", width: 30, height: 30, borderRadius: 8, cursor: "pointer", marginRight: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background .15s ease, color .15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "#fecdd3" : "#eef2f6"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = danger ? "#fff1f2" : "#f8f9fb"; }}
    >
      {children}
    </button>
  );
}

function DataTable({ rows, columns }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: "left", color: "#68778a", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".4px", padding: "10px 8px", borderBottom: "1px solid #e7edf3" }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} style={{ borderBottom: "1px solid #eef2f6" }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: "11px 8px", fontSize: 13 }}>{col.render ? col.render(row) : row[col.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ title, onClose, children, width }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.5)", backdropFilter: "blur(3px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: width || "600px", width: "100%", padding: "24px 26px", boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "hrModalIn .22s ease" }}>
        <style>{`@keyframes hrModalIn { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111" }}>{title}</h2>
          <button onClick={onClose} style={{ border: "none", background: "#f1f3f5", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 5 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11.5, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>{error}</div>}
      {!error && hint && <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#68778a", margin: "22px 0 6px" }}>
      {children}
    </h3>
  );
}

function LoadingRow({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#68778a", fontSize: 13.5, padding: "18px 4px" }}>
      <Loader2 size={17} style={{ animation: "hrSpin 1s linear infinite", color: ACCENT }} /> {text}
    </div>
  );
}

function LoadingBox({ text }) {
  return (
    <section style={{ background: "#fff", borderRadius: 12, padding: 40, marginTop: 20, border: "1px solid #e7ebf0", textAlign: "center", color: "#68778a", fontWeight: 600 }}>
      <Loader2 size={22} style={{ animation: "hrSpin 1s linear infinite", color: ACCENT, marginBottom: 8 }} />
      <div>{text}</div>
    </section>
  );
}

function ErrorBox({ message }) {
  return (
    <section style={{ background: "#fff1f2", borderRadius: 12, padding: 24, marginTop: 20, border: "1px solid #fecdd3", color: "#be123c", fontWeight: 600, display: "flex", gap: 10, alignItems: "center" }}>
      <AlertCircle size={18} /> {message}
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "28px 10px", textAlign: "center", color: "#68778a", fontSize: 13.5 }}>
      <Users size={34} style={{ margin: "0 auto 10px", color: "#cbd5e1", display: "block" }} />
      {text}
    </div>
  );
}

function Toast({ toast }) {
  const colors = toast.tone === "error" ? { bg: "#fff1f2", color: "#be123c" } : toast.tone === "warn" ? { bg: "#fffbeb", color: "#b45309" } : { bg: "#ecfdf5", color: "#047857" };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 900, background: colors.bg, color: colors.color, padding: "13px 18px", borderRadius: 11, fontWeight: 700, fontSize: 13.5, boxShadow: "0 10px 30px rgba(0,0,0,.15)", animation: "hrModalIn .25s ease", maxWidth: 340 }}>
      {toast.msg}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility functions                                                  */
/* ------------------------------------------------------------------ */
const fullName = (employee) => `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.displayName || "Unnamed";

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(value);
  }
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return String(value);
  }
};

const statusColor = (status) => {
  const s = String(status || "").toUpperCase();
  if (["APPROVED", "COMPLETED", "PAID", "ACCEPTED", "ACTIVE"].includes(s)) return "#047857";
  if (["REJECTED", "CANCELLED", "FAILED"].includes(s)) return "#be123c";
  if (["PENDING", "SUBMITTED", "DRAFT", "IN_PROGRESS"].includes(s)) return "#d97706";
  return "#475569";
};

const inputStyle = (hasError) => ({
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${hasError ? "#fca5a5" : "#dbe2ea"}`,
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13.5,
  color: "#111",
  outline: "none",
  background: "#f8f9fb",
});

const pageBtn = (disabled) => ({
  border: "1px solid #dbe2ea",
  borderRadius: 8,
  padding: "8px 14px",
  background: disabled ? "#f1f3f5" : "#fff",
  color: disabled ? "#b0b8c4" : "#111",
  fontWeight: 700,
  fontSize: 13,
  cursor: disabled ? "not-allowed" : "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});
