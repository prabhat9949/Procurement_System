import React from "react";
import { ShieldCheck, Users, UserCheck, Lock, AlertTriangle } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatDateIN } from "../../../../../utils/format";

const SuperSecurityCenter = () => (
  <RealReportsView
    accent="#dc2626"
    header={{
      title: "Security Center",
      subtitle: "Account status and audit activity — real user records and append-only audit events.",
      badge: "SECURITY & GOVERNANCE",
      icon: ShieldCheck,
    }}
    kpiFn={(data) => {
      const users = data.users?.content || data.users || [];
      const logs = data.logs?.content || data.logs || [];
      const enabled = users.filter((u) => u.enabled).length;
      const locked = users.filter((u) => u.accountLocked).length;
      const failed = logs.filter((l) => l.success === false).length;
      return [
        { label: "Total User Accounts", value: users.length, icon: Users, color: "#2563eb" },
        { label: "Enabled Accounts", value: enabled, icon: UserCheck, color: "#059669" },
        { label: "Locked Accounts", value: locked, icon: Lock, color: "#d97706" },
        { label: "Failed Audit Events", value: failed, icon: AlertTriangle, color: "#dc2626" },
      ];
    }}
    charts={[]}
    tables={[
      {
        key: "users",
        endpoint: "/api/users?page=0&size=100",
        title: "User Accounts & Account Status",
        emptyText: "No user accounts found.",
        maxRows: 12,
        columns: [
          { header: "Username", render: (r) => <strong style={{ color: "#dc2626" }}>{r.username}</strong> },
          { header: "Display Name", accessor: "displayName" },
          { header: "Role", accessor: "roleName" },
          { header: "Email", accessor: "email" },
          { header: "Last Login", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.lastLogin)}</span> },
          { header: "Status", render: (r) => (
            <span style={{ display: "inline-flex", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: r.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.enabled ? "#059669" : "#dc2626" }}>{r.enabled ? "ENABLED" : "DISABLED"}</span>
              {r.accountLocked && <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: "rgba(217,119,6,.12)", color: "#d97706" }}>LOCKED</span>}
            </span>
          )},
        ],
      },
      {
        key: "logs",
        endpoint: "/api/audit-logs?page=0&size=50",
        title: "Security & User Audit Trail",
        emptyText: "No audit events recorded yet.",
        maxRows: 12,
        columns: [
          { header: "Module", render: (r) => <strong style={{ color: "#dc2626" }}>{r.moduleName}</strong> },
          { header: "Action", render: (r) => <span style={{ fontWeight: 600 }}>{r.operation}</span> },
          { header: "Reference", accessor: "referenceNumber" },
          { header: "Actor", accessor: "performedBy" },
          { header: "Time", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.performedAt)}</span> },
          { header: "Result", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: r.success ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.success ? "#059669" : "#dc2626" }}>{r.success ? "SUCCESS" : "FAILED"}</span> },
        ],
      },
    ]}
  />
);

export default SuperSecurityCenter;
