import React from "react";
import { Users, ShoppingBag, FileText, Boxes, IndianRupee, CheckCircle2, ClipboardCheck, Landmark, Building2, UserCheck } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const OrgOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Organization Admin";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Organization-wide procurement, finance and governance at a glance — every figure is live.",
        badge: "ORGANIZATION ADMIN & BI",
        icon: Building2,
        accent: "#f8b400",
      }}
      actions={[
        { label: "User Analytics", icon: UserCheck, primary: true, onClick: () => onNavigate("user-analytics") },
      ]}
      endpoints={{
        dash: "/api/dashboard/admin",
        users: "/api/users?page=0&size=20",
        vendors: "/api/vendors?page=0&size=20",
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
        { key: "dash", code: "MONTHLY_SPEND", label: "Monthly Procurement Spend", color: "#f8b400", type: "area" },
        { key: "dash", code: "PURCHASE_ORDERS", label: "Purchase Order Trend", color: "#2563eb", type: "bar" },
        { key: "dash", code: "INVOICES", label: "Invoice Trend", color: "#7c3aed", type: "bar" },
        { key: "dash", code: "VENDOR_DISTRIBUTION", label: "Vendor Spend Distribution", color: "#059669", type: "area" },
      ]}
      tables={[
        {
          key: "users",
          title: "User Accounts",
          emptyText: "No user accounts found.",
          maxRows: 8,
          columns: [
            { header: "Username", render: (r) => <strong style={{ color: "#f8b400" }}>{r.username}</strong> },
            { header: "Display Name", accessor: "displayName" },
            { header: "Role", accessor: "roleName" },
            { header: "Email", accessor: "email" },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.enabled ? "#059669" : "#dc2626" }}>{r.enabled ? "ENABLED" : "DISABLED"}</span> },
          ],
        },
        {
          key: "vendors",
          title: "Vendors",
          emptyText: "No vendors registered yet.",
          maxRows: 8,
          columns: [
            { header: "Vendor", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.vendorCode}</strong> },
            { header: "Name", render: (r) => <span style={{ fontWeight: 600 }}>{r.vendorName}</span> },
            { header: "GST", accessor: "gstNumber" },
            { header: "Contact", accessor: "contactPerson" },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "ACTIVE" ? "rgba(5,150,105,.12)" : r.status === "BLACKLISTED" || r.status === "SUSPENDED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "ACTIVE" ? "#059669" : r.status === "BLACKLISTED" || r.status === "SUSPENDED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
          ],
        },
      ]}
    />
  );
};

export default OrgOverview;
