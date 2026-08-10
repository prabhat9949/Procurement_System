import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, CalendarDays, ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Search, Users, X } from "lucide-react";

const API_URL = "http://localhost:8080";
const countFormat = new Intl.NumberFormat("en-IN");

const menu = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["employees", "Employee Directory", Users],
  ["attendance", "Attendance", CalendarDays],
  ["leave", "Leave Management", ClipboardList],
  ["recruitment", "Recruitment", BriefcaseBusiness],
  ["reports", "HR Reports", FileText],
];

export default function HrDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const username = localStorage.getItem("eps_display_name") || localStorage.getItem("eps_username") || "Priya Singh";

  const loadData = async (search = "") => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("eps_access_token");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const query = search ? `&keyword=${encodeURIComponent(search)}` : "";
      const [dashboardResponse, employeeResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/hr`, { headers }),
        fetch(`${API_URL}/api/employees?active=true&page=0&size=50${query}`, { headers }),
      ]);
      if (!dashboardResponse.ok || !employeeResponse.ok) {
        throw new Error("Unable to load HR data from the server.");
      }
      const dashboard = await dashboardResponse.json();
      const employeePage = await employeeResponse.json();
      setKpis(dashboard.kpis || []);
      setEmployees(employeePage.data?.content || employeePage.data?.data?.content || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load HR data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredEmployees = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return employees;
    return employees.filter((employee) =>
      [employee.fullName, employee.employeeCode, employee.email, employee.departmentName, employee.designation]
        .filter(Boolean).some((field) => field.toLowerCase().includes(value))
    );
  }, [employees, keyword]);

  const logout = () => {
    localStorage.removeItem("eps_access_token");
    localStorage.removeItem("eps_active_role");
    localStorage.removeItem("eps_username");
    navigate("/login");
  };

  const kpi = (code) => kpis.find((item) => item.code === code)?.count ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", color: "#111", display: "flex", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <aside style={{ width: 270, background: "#fff", color: "#111", padding: 20, display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid #ececec", boxShadow: "2px 0 15px rgba(0,0,0,0.03)" }}>
        <div style={{ fontSize: 20, fontWeight: 800, padding: "10px 8px 24px", borderBottom: "1px solid #ececec" }}>Enterprise <span style={{ color: "#f8b400" }}>HR</span></div>
        <div style={{ fontSize: 12, color: "#666", padding: "12px 8px 8px", textTransform: "uppercase" }}>Human Resources</div>
        {menu.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ display: "flex", gap: 12, alignItems: "center", border: 0, borderRadius: 8, padding: "12px 10px", color: activeTab === id ? "#111" : "#555", background: activeTab === id ? "#f8b400" : "transparent", textAlign: "left", cursor: "pointer", fontWeight: activeTab === id ? 700 : 500 }}>
            <Icon size={17} /> {label}
          </button>
        ))}
        <button onClick={logout} style={{ marginTop: "auto", display: "flex", gap: 12, alignItems: "center", border: 0, background: "transparent", color: "#555", padding: "12px 10px", cursor: "pointer" }}><LogOut size={17} /> Logout</button>
      </aside>
      <main style={{ flex: 1, padding: "28px 34px", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div><div style={{ color: "#68778a", fontSize: 13 }}>Human Resources / {activeTab}</div><h1 style={{ margin: "6px 0", fontSize: 28 }}>Welcome, {username}</h1><p style={{ margin: 0, color: "#68778a" }}>Indian enterprise workforce management</p></div>
          <button onClick={() => loadData(keyword)} style={{ border: 0, borderRadius: 8, background: "#f8b400", color: "#111", padding: "11px 16px", cursor: "pointer", fontWeight: 700 }}><Menu size={16} /> Refresh data</button>
        </div>
        {error && <div style={{ marginTop: 20, padding: 14, background: "#fff1f2", color: "#be123c", borderRadius: 8 }}>{error}</div>}
        {activeTab === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginTop: 28 }}>
              {[["Total Employees", "TOTAL_EMPLOYEES"], ["Active Employees", "ACTIVE_EMPLOYEES"], ["New This Month", "NEW_EMPLOYEES"], ["Without Manager", "WITHOUT_MANAGER"], ["Departments", "DEPARTMENTS"]].map(([label, code]) => <div key={code} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px #1322380d" }}><div style={{ color: "#68778a", fontSize: 13 }}>{label}</div><strong style={{ display: "block", fontSize: 30, marginTop: 8 }}>{countFormat.format(kpi(code))}</strong><span style={{ color: "#15803d", fontSize: 12 }}>Live from database</span></div>)}
            </div>
            <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 22 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Recently active employees</h2>
              <EmployeeTable employees={employees.slice(0, 8)} loading={loading} />
            </section>
          </>
        )}
        {activeTab === "employees" && (
          <section style={{ background: "#fff", borderRadius: 12, padding: 22, marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><h2 style={{ margin: 0 }}>Employee Directory</h2><div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid #dbe2ea", borderRadius: 8, padding: "8px 10px" }}><Search size={16} color="#68778a" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadData(keyword)} placeholder="Search name or employee code" style={{ border: 0, outline: 0 }} />{keyword && <X size={15} onClick={() => { setKeyword(""); loadData(); }} style={{ cursor: "pointer" }} />}</div></div>
            <EmployeeTable employees={filteredEmployees} loading={loading} />
          </section>
        )}
        {["attendance", "leave", "recruitment", "reports"].includes(activeTab) && <section style={{ background: "#fff", borderRadius: 12, padding: 40, marginTop: 28, textAlign: "center" }}><CalendarDays size={42} color="#f5b942" /><h2>{menu.find(([id]) => id === activeTab)?.[1]}</h2><p style={{ color: "#68778a" }}>This HR workspace is secured for HR Manager access. Records will appear here as they are created through the connected HR APIs.</p></section>}
      </main>
    </div>
  );
}

function EmployeeTable({ employees, loading }) {
  if (loading) return <p style={{ color: "#68778a" }}>Loading employee records...</p>;
  if (!employees.length) return <p style={{ color: "#68778a" }}>No employee records found.</p>;
  return <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}><thead><tr>{["Employee", "Employee Code", "Department", "Role", "Email", "Status"].map((heading) => <th key={heading} style={{ textAlign: "left", color: "#68778a", fontSize: 12, padding: "12px 8px", borderBottom: "1px solid #e7edf3" }}>{heading}</th>)}</tr></thead><tbody>{employees.map((employee) => <tr key={employee.id || employee.employeeId}><td style={{ padding: "13px 8px", fontWeight: 700 }}>{employee.fullName || `${employee.firstName || ""} ${employee.lastName || ""}`}</td><td style={{ padding: "13px 8px" }}>{employee.employeeCode}</td><td style={{ padding: "13px 8px" }}>{employee.departmentName || "Unassigned"}</td><td style={{ padding: "13px 8px" }}>{employee.roleName || "Employee"}</td><td style={{ padding: "13px 8px" }}>{employee.email}</td><td style={{ padding: "13px 8px", color: employee.active ? "#15803d" : "#be123c" }}>{employee.active ? "Active" : "Inactive"}</td></tr>)}</tbody></table></div>;
}
