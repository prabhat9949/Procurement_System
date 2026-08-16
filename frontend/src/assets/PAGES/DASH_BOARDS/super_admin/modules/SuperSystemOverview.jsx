import React from "react";
import { Users, ShoppingBag, FileText, Boxes, IndianRupee, ClipboardCheck, Landmark, Globe, UserCheck, FileSearch } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatDateIN } from "../../../../../utils/format";

const SuperSystemOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Super Administrator";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "System-wide governance, procurement, finance and audit health — all live from the database.",
        badge: "SUPER ADMIN CONTROL CENTER",
        icon: Globe,
        accent: "#7c3aed",
      }}
      actions={[
        { label: "User Management", icon: UserCheck, primary: true, onClick: () => onNavigate("user-management") },
      ]}
      endpoints={{
        dash: "/api/dashboard/admin",
        users: "/api/users?page=0&size=20",
        logs: "/api/audit-logs?page=0&size=20",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        return [
          { label: "Total Users", value: count("TOTAL_USERS"), icon: Users, color: "#2563eb" },
          { label: "Active Users", value: count("ACTIVE_USERS"), icon: UserCheck, color: "#059669" },
          { label: "Vendors", value: count("VENDORS"), icon: ShoppingBag, color: "#7c3aed" },
          { label: "Purchase Requests", value: count("PURCHASE_REQUESTS"), icon: FileText, color: "#d97706" },
          { label: "Purchase Orders", value: count("PURCHASE_ORDERS"), icon: Boxes, color: "#0891b2" },
          { label: "Pending Approvals", value: count("PENDING_APPROVALS"), icon: ClipboardCheck, color: "#dc2626" },
          { label: "Pending Invoices", value: count("PENDING_INVOICES"), icon: Landmark, color: "#059669" },
          { label: "Pending Payments", value: count("PENDING_PAYMENTS"), icon: IndianRupee, color: "#7c3aed" },
        ];
      }}
      charts={[
        { key: "dash", code: "MONTHLY_SPEND", label: "Monthly Procurement Spend", color: "#7c3aed", type: "area" },
        { key: "dash", code: "PURCHASE_ORDERS", label: "Purchase Order Trend", color: "#f8b400", type: "bar" },
        { key: "dash", code: "DEPARTMENT_SPEND", label: "Department Spend", color: "#059669", type: "area" },
        { key: "dash", code: "VENDOR_DISTRIBUTION", label: "Vendor Spend Distribution", color: "#2563eb", type: "area" },
      ]}
      tables={[
        {
          key: "users",
          title: "User Accounts",
          emptyText: "No user accounts found.",
          maxRows: 8,
          columns: [
            { header: "Username", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.username}</strong> },
            { header: "Display Name", accessor: "displayName" },
            { header: "Role", accessor: "roleName" },
            { header: "Email", accessor: "email" },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.enabled ? "#059669" : "#dc2626" }}>{r.enabled ? "ENABLED" : "DISABLED"}</span> },
          ],
        },
        {
          key: "logs",
          title: "Audit Log Trail",
          emptyText: "No audit events recorded yet.",
          maxRows: 8,
          columns: [
            { header: "Module", render: (r) => <strong style={{ color: "#dc2626" }}>{r.moduleName}</strong> },
            { header: "Action", render: (r) => <span style={{ fontWeight: 600 }}>{r.operation}</span> },
            { header: "Reference", accessor: "referenceNumber" },
            { header: "Performed By", accessor: "performedBy" },
            { header: "Time", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.performedAt)}</span> },
          ],
        },
      ]}
    />
  );
};

export default SuperSystemOverview;
