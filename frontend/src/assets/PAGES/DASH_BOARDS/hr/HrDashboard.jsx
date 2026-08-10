import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Search,
  Users,
  X,
} from "lucide-react";
import { apiGet } from "../../../../services/apiClient";
import RoleShell from "../shared_ui/RoleShell";

const countFormat = new Intl.NumberFormat("en-IN");

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employee Directory", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "leave", label: "Leave Management", icon: ClipboardList },
  { id: "recruitment", label: "Recruitment", icon: BriefcaseBusiness },
  { id: "reports", label: "HR Reports", icon: BarChart3 },
];

export default function HrDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (search = "") => {
    setLoading(true);
    setError("");
    try {
      const query = search ? `&keyword=${encodeURIComponent(search)}` : "";
      const [dashboard, employeePage] = await Promise.all([
        apiGet("/api/dashboard/hr").catch(() => null),
        apiGet(`/api/employees?active=true&page=0&size=50${query}`).catch(() => null),
      ]);
      setKpis(dashboard?.kpis || []);
      setEmployees(employeePage?.content || employeePage?.data?.content || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load HR data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEmployees = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return employees;
    return employees.filter((employee) =>
      [employee.fullName, employee.firstName, employee.lastName, employee.employeeCode, employee.email, employee.departmentName]
        .filter(Boolean).some((field) => field.toLowerCase().includes(value))
    );
  }, [employees, keyword]);

  const kpi = (code) => kpis.find((item) => item.code === code)?.count ?? 0;

  return (
    <RoleShell
      portalTitle="HR & People Portal"
      roleLabel="HR Manager"
      accent="#f8b400"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userMeta={{ dept: "Human Resources" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#68778a", fontSize: 13, fontWeight: 600 }}>Human Resources / {activeTab}</div>
          <h1 style={{ margin: "6px 0", fontSize: 26, fontWeight: 800, color: "#111" }}>HR Dashboard</h1>
          <p style={{ margin: 0, color: "#68778a", fontSize: 14 }}>Indian enterprise workforce management — live from the database</p>
        </div>
        <button
          onClick={() => loadData(keyword)}
          style={{ border: 0, borderRadius: 9, background: "#f8b400", color: "#111", padding: "11px 18px", cursor: "pointer", fontWeight: 800, fontSize: 13.5, boxShadow: "0 4px 14px rgba(248,180,0,.35)" }}
        >
          <RefreshCwIcon /> Refresh data
        </button>
      </div>

      {error && <div style={{ marginTop: 20, padding: 14, background: "#fff1f2", color: "#be123c", borderRadius: 10, fontWeight: 600 }}>{error}</div>}

      {activeTab === "dashboard" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginTop: 26 }}>
            {[["Total Employees", "TOTAL_EMPLOYEES"], ["Active Employees", "ACTIVE_EMPLOYEES"], ["New This Month", "NEW_EMPLOYEES"], ["Without Manager", "WITHOUT_MANAGER"], ["Departments", "DEPARTMENTS"]].map(([label, code]) => (
              <div key={code} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e7ebf0", boxShadow: "0 2px 10px #1322380d" }}>
                <div style={{ color: "#68778a", fontSize: 13, fontWeight: 600 }}>{label}</div>
                <strong style={{ display: "block", fontSize: 30, marginTop: 8, color: "#111" }}>{countFormat.format(kpi(code))}</strong>
                <span style={{ color: "#15803d", fontSize: 12, fontWeight: 700 }}>Live from database</span>
              </div>
            ))}
          </div>
          <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 22, border: "1px solid #e7ebf0" }}>
            <h2 style={{ marginTop: 0, fontSize: 17, fontWeight: 800, color: "#111" }}>
              <Users size={16} style={{ verticalAlign: "-2px", marginRight: 6, color: "#f8b400" }} /> Recently active employees
            </h2>
            <EmployeeTable employees={employees.slice(0, 8)} loading={loading} />
          </section>
        </>
      )}

      {activeTab === "employees" && (
        <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 24, border: "1px solid #e7ebf0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111" }}>Employee Directory</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #dbe2ea", borderRadius: 9, padding: "8px 12px", background: "#f8f9fb" }}>
              <Search size={16} color="#68778a" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && loadData(keyword)}
                placeholder="Search name or employee code"
                style={{ border: 0, outline: 0, background: "transparent", fontSize: 13.5 }}
              />
              {keyword && <X size={15} onClick={() => { setKeyword(""); loadData(); }} style={{ cursor: "pointer" }} />}
            </div>
          </div>
          <EmployeeTable employees={filteredEmployees} loading={loading} />
        </section>
      )}

      {["attendance", "leave", "recruitment", "reports"].includes(activeTab) && (
        <section style={{ background: "#fff", borderRadius: 12, padding: 40, marginTop: 24, textAlign: "center", border: "1px solid #e7ebf0" }}>
          <CalendarDays size={42} color="#f8b400" />
          <h2 style={{ fontSize: 18, color: "#111", fontWeight: 800 }}>{navItems.find((item) => item.id === activeTab)?.label}</h2>
          <p style={{ color: "#68778a", fontSize: 14 }}>This HR workspace is secured for HR Manager access. Records will appear here as they are created through the connected HR APIs.</p>
        </section>
      )}
    </RoleShell>
  );
}

const RefreshCwIcon = () => <span style={{ display: "inline-flex", verticalAlign: "-2px", marginRight: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" /></svg></span>;

function EmployeeTable({ employees, loading }) {
  if (loading) return <p style={{ color: "#68778a" }}>Loading employee records...</p>;
  if (!employees.length) return <p style={{ color: "#68778a" }}>No employee records found.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}>
        <thead>
          <tr>
            {["Employee", "Employee Code", "Department", "Role", "Email", "Status"].map((heading) => (
              <th key={heading} style={{ textAlign: "left", color: "#68778a", fontSize: 12, textTransform: "uppercase", letterSpacing: ".4px", padding: "12px 8px", borderBottom: "1px solid #e7edf3" }}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id || employee.employeeId}>
              <td style={{ padding: "13px 8px", fontWeight: 700, color: "#111" }}>{employee.fullName || `${employee.firstName || ""} ${employee.lastName || ""}`}</td>
              <td style={{ padding: "13px 8px" }}>{employee.employeeCode}</td>
              <td style={{ padding: "13px 8px" }}>{employee.departmentName || "Unassigned"}</td>
              <td style={{ padding: "13px 8px" }}>{employee.roleName || "Employee"}</td>
              <td style={{ padding: "13px 8px" }}>{employee.email}</td>
              <td style={{ padding: "13px 8px", color: employee.active ? "#15803d" : "#be123c", fontWeight: 700 }}>{employee.active ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
