import React from "react";
import { Building2, Landmark, Users, Briefcase } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";

const OrgDeptAnalytics = () => (
  <LiveRoleOverview
    header={{
      title: "Department Analytics",
      subtitle: "Department structure and budget-bearing cost centers — real master data.",
      badge: "DEPARTMENTS",
      icon: Building2,
      accent: "#d97706",
    }}
    endpoints={{
      depts: "/api/departments?page=0&size=100",
      ccs: "/api/cost-centers?page=0&size=100",
      emps: "/api/employees?page=0&size=100",
    }}
    kpiFn={(data) => {
      const depts = data.depts?.content || [];
      const ccs = data.ccs?.content || [];
      const emps = data.emps?.content || [];
      const totalBudget = ccs.reduce((s, c) => s + (Number(c.budget) || 0), 0);
      const usedBudget = ccs.reduce((s, c) => s + (Number(c.usedBudget) || 0), 0);
      const inr = (n) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      return [
        { label: "Departments", value: depts.length, icon: Building2, color: "#d97706" },
        { label: "Cost Centers", value: ccs.length, icon: Landmark, color: "#2563eb" },
        { label: "Employees", value: emps.length, icon: Users, color: "#059669" },
        { label: "Total Budget", value: inr(totalBudget), icon: Briefcase, color: "#7c3aed" },
        { label: "Budget Utilized", value: inr(usedBudget), icon: Briefcase, color: "#0891b2" },
      ];
    }}
    tables={[
      {
        key: "depts",
        title: "Departments",
        emptyText: "No departments found.",
        maxRows: 8,
        columns: [
          { header: "Code", render: (r) => <strong style={{ color: "#d97706" }}>{r.departmentCode}</strong> },
          { header: "Department", render: (r) => <span style={{ fontWeight: 700 }}>{r.departmentName}</span> },
          { header: "Employees", render: (r) => <span style={{ fontWeight: 700, color: "#059669" }}>{r.employeeCount ?? 0}</span> },
          { header: "Cost Centers", render: (r) => <span style={{ fontWeight: 700, color: "#2563eb" }}>{r.costCenterCount ?? 0}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.active ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.active ? "#059669" : "#dc2626" }}>{r.active ? "ACTIVE" : "INACTIVE"}</span> },
        ],
      },
      {
        key: "ccs",
        title: "Cost Centers & Budgets",
        emptyText: "No cost centers found.",
        maxRows: 8,
        columns: [
          { header: "Code", render: (r) => <strong style={{ color: "#2563eb" }}>{r.code}</strong> },
          { header: "Name", render: (r) => <span style={{ fontWeight: 700 }}>{r.name}</span> },
          { header: "Department", accessor: "departmentName" },
          { header: "Budget", render: (r) => <span style={{ fontWeight: 700 }}>{Number(r.budget || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span> },
          { header: "Used", render: (r) => <span style={{ fontWeight: 600, color: "#d97706" }}>{Number(r.usedBudget || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span> },
        ],
      },
    ]}
  />
);

export default OrgDeptAnalytics;
