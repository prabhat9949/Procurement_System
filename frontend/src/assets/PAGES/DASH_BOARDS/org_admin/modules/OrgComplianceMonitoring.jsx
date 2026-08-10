import React from "react";
import { ShieldCheck, FileText, UserCog, AlertCircle } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatDateIN } from "../../../../../utils/format";

const OrgComplianceMonitoring = () => (
  <LiveRoleOverview
    header={{
      title: "Compliance Monitoring",
      subtitle: "Append-only audit trail of every state-changing action in the organization.",
      badge: "COMPLIANCE",
      icon: ShieldCheck,
      accent: "#059669",
    }}
    endpoints={{
      logs: "/api/audit-logs?page=0&size=100",
    }}
    kpiFn={(data) => {
      const logs = data.logs?.content || [];
      return [
        { label: "Audit Events", value: logs.length, icon: FileText, color: "#059669" },
        { label: "User / Role Events", value: logs.filter((l) => l.moduleName === "User" || l.moduleName === "Role").length, icon: UserCog, color: "#2563eb" },
        { label: "Failed Operations", value: logs.filter((l) => l.success === false).length, icon: AlertCircle, color: "#dc2626" },
      ];
    }}
    tables={[
      {
        key: "logs",
        title: "Audit Trail",
        emptyText: "No audit events recorded yet.",
        maxRows: 12,
        columns: [
          { header: "Module", render: (r) => <strong style={{ color: "#059669" }}>{r.moduleName}</strong> },
          { header: "Action", render: (r) => <span style={{ fontWeight: 600 }}>{r.operation}</span> },
          { header: "Reference", accessor: "referenceNumber" },
          { header: "Actor", accessor: "performedBy" },
          { header: "Time", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.performedAt)}</span> },
          { header: "Result", render: (r) => <span className="lro-badge" style={{ background: r.success ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.success ? "#059669" : "#dc2626" }}>{r.success ? "SUCCESS" : "FAILED"}</span> },
        ],
      },
    ]}
  />
);

export default OrgComplianceMonitoring;
