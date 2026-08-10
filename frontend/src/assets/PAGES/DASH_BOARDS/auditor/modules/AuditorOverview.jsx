import React from "react";
import { ShieldCheck, FileText, Users, ShoppingBag, CheckCircle2, AlertTriangle, IndianRupee, FileSearch, Landmark } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatDateIN } from "../../../../../utils/format";

const AuditorOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Auditor";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Read-only audit trail, system health and compliance evidence — all live and immutable.",
        badge: "AUDIT & COMPLIANCE PORTAL",
        icon: ShieldCheck,
        accent: "#dc2626",
      }}
      endpoints={{
        dash: "/api/dashboard/admin",
        logs: "/api/audit-logs?page=0&size=30",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        return [
          { label: "System Users", value: count("TOTAL_USERS"), icon: Users, color: "#2563eb" },
          { label: "Purchase Requests", value: count("PURCHASE_REQUESTS"), icon: FileText, color: "#7c3aed" },
          { label: "Purchase Orders", value: count("PURCHASE_ORDERS"), icon: ShoppingBag, color: "#0891b2" },
          { label: "Pending Approvals", value: count("PENDING_APPROVALS"), icon: CheckCircle2, color: "#d97706" },
          { label: "Pending Payments", value: count("PENDING_PAYMENTS"), icon: Landmark, color: "#059669" },
          { label: "Open RFQs", value: count("OPEN_RFQS"), icon: AlertTriangle, color: "#dc2626" },
        ];
      }}
      tables={[
        {
          key: "logs",
          title: "Audit Log Trail",
          emptyText: "No audit events recorded yet.",
          maxRows: 15,
          columns: [
            { header: "Module", render: (r) => <strong style={{ color: "#dc2626" }}>{r.moduleName}</strong> },
            { header: "Action", render: (r) => <span style={{ fontWeight: 600 }}>{r.operation}</span> },
            { header: "Reference", accessor: "referenceNumber" },
            { header: "Performed By", accessor: "performedBy" },
            { header: "Outcome", render: (r) => <span className="lro-badge" style={{ background: r.success ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.success ? "#059669" : "#dc2626" }}>{r.success ? "SUCCESS" : "FAILED"}</span> },
            { header: "Time", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.performedAt)}</span> },
          ],
        },
      ]}
    />
  );
};

export default AuditorOverview;
