import React from "react";
import { Activity, IndianRupee, ClipboardCheck, Landmark, Boxes } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatDateIN } from "../../../../../utils/format";

const SuperSystemAnalytics = () => (
  <RealReportsView
    accent="#7c3aed"
    header={{
      title: "System Analytics",
      subtitle: "Organization-wide procurement, finance and governance analytics — every figure is a real database aggregate.",
      badge: "SYSTEM ANALYTICS",
      icon: Activity,
    }}
    kpis={[
      { label: "Total Procurement Spend", key: "totalProcurementSpend", icon: IndianRupee, color: "#7c3aed", format: "inr" },
      { label: "Monthly Spend", key: "monthlySpend", icon: IndianRupee, color: "#f8b400", format: "inr" },
      { label: "Pending Approvals", key: "pendingApprovals", icon: ClipboardCheck, color: "#dc2626" },
      { label: "Pending Invoices", key: "pendingInvoices", icon: Landmark, color: "#059669" },
      { label: "Pending Payments", key: "pendingPayments", icon: Boxes, color: "#2563eb" },
      { label: "Inventory Value", key: "inventoryValue", icon: Boxes, color: "#0891b2", format: "inr" },
    ]}
    charts={[
      { label: "Monthly Spend", key: "monthlySpendChart", color: "#7c3aed", type: "area", source: "dash" },
      { label: "Department Spend", key: "departmentSpendChart", color: "#059669", type: "bar", source: "dash" },
      { label: "Vendor Spend", key: "vendorSpendChart", color: "#2563eb", type: "bar", source: "dash" },
      { label: "Invoice Status", key: "invoiceStatusChart", color: "#f8b400", type: "pie", source: "dash" },
      { label: "Payment Status", key: "paymentStatusChart", color: "#7c3aed", type: "pie", source: "dash" },
    ]}
    tables={[
      {
        key: "users",
        endpoint: "/api/users?page=0&size=10",
        title: "User Accounts",
        emptyText: "No user accounts found.",
        maxRows: 8,
        columns: [
          { header: "Username", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.username}</strong> },
          { header: "Display Name", accessor: "displayName" },
          { header: "Role", accessor: "roleName" },
          { header: "Status", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: r.enabled ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.enabled ? "#059669" : "#dc2626" }}>{r.enabled ? "ENABLED" : "DISABLED"}</span> },
        ],
      },
      {
        key: "vendors",
        endpoint: "/api/vendors?page=0&size=10",
        title: "Vendors",
        emptyText: "No vendors registered yet.",
        maxRows: 8,
        columns: [
          { header: "Vendor", render: (r) => <strong style={{ color: "#2563eb" }}>{r.vendorName}</strong> },
          { header: "GST", accessor: "gstNumber" },
          { header: "City", accessor: "city" },
          { header: "Status", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: r.status === "ACTIVE" ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: r.status === "ACTIVE" ? "#059669" : "#d97706" }}>{r.status || "DRAFT"}</span> },
        ],
      },
      {
        key: "logs",
        endpoint: "/api/audit-logs?page=0&size=10",
        title: "Recent Audit Events",
        emptyText: "No audit events recorded yet.",
        maxRows: 8,
        columns: [
          { header: "Module", render: (r) => <strong style={{ color: "#dc2626" }}>{r.moduleName}</strong> },
          { header: "Action", render: (r) => <span style={{ fontWeight: 600 }}>{r.operation}</span> },
          { header: "Actor", accessor: "performedBy" },
          { header: "Time", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.performedAt)}</span> },
        ],
      },
    ]}
  />
);

export default SuperSystemAnalytics;
