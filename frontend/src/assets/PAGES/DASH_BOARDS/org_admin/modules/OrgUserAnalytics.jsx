import React from "react";
import { Users, UserCheck, Lock, ShieldCheck } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatDateIN } from "../../../../../utils/format";

const OrgUserAnalytics = () => (
  <LiveRoleOverview
    header={{
      title: "User Analytics",
      subtitle: "User accounts, roles and login activity — real records from the user database.",
      badge: "USERS & ACCESS",
      icon: Users,
      accent: "#2563eb",
    }}
    endpoints={{
      users: "/api/users?page=0&size=100",
      roles: "/api/roles?page=0&size=100",
    }}
    kpiFn={(data) => {
      const users = data.users?.content || [];
      const roles = data.roles?.content || [];
      return [
        { label: "Total Users", value: users.length, icon: Users, color: "#2563eb" },
        { label: "Enabled Accounts", value: users.filter((u) => u.enabled).length, icon: UserCheck, color: "#059669" },
        { label: "Locked Accounts", value: users.filter((u) => u.accountLocked).length, icon: Lock, color: "#d97706" },
        { label: "Roles", value: roles.length, icon: ShieldCheck, color: "#7c3aed" },
      ];
    }}
    tables={[
      {
        key: "users",
        title: "User Accounts",
        emptyText: "No user accounts found.",
        maxRows: 12,
        columns: [
          { header: "Username", render: (r) => <strong style={{ color: "#2563eb" }}>{r.username}</strong> },
          { header: "Display Name", accessor: "displayName" },
          { header: "Role", accessor: "roleName" },
          { header: "Department", accessor: "departmentName" },
          { header: "Last Login", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.lastLogin)}</span> },
          { header: "Status", render: (r) => (
            <span style={{ display: "inline-flex", gap: "6px" }}>
              <span className="lro-badge" style={{ background: r.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.enabled ? "#059669" : "#dc2626" }}>{r.enabled ? "ENABLED" : "DISABLED"}</span>
              {r.accountLocked && <span className="lro-badge" style={{ background: "rgba(217,119,6,.12)", color: "#d97706" }}>LOCKED</span>}
            </span>
          )},
        ],
      },
      {
        key: "roles",
        title: "Roles",
        emptyText: "No roles found.",
        maxRows: 10,
        columns: [
          { header: "Role Code", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.roleCode}</strong> },
          { header: "Role Name", render: (r) => <span style={{ fontWeight: 700 }}>{r.roleName}</span> },
          { header: "Description", accessor: "description" },
          { header: "Users", render: (r) => <span style={{ fontWeight: 700, color: "#059669" }}>{r.userCount ?? 0}</span> },
          { header: "Permissions", render: (r) => <span style={{ fontWeight: 700, color: "#2563eb" }}>{r.permissionIds?.length ?? 0}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.active ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.active ? "#059669" : "#dc2626" }}>{r.active ? "ACTIVE" : "INACTIVE"}</span> },
        ],
      },
    ]}
  />
);

export default OrgUserAnalytics;
