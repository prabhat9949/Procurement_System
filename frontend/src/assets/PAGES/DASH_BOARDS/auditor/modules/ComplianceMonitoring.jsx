import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, ClipboardList, HelpCircle } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const ComplianceMonitoring = () => (
  <LiveRoleOverview
    header={{
      title: "Compliance Monitoring",
      subtitle: "Compliance rates derived from actual audit conclusions — live from the database.",
      badge: "COMPLIANCE",
      icon: ShieldCheck,
      accent: "#dc2626",
    }}
    endpoints={{
      cases: "/api/audits/my-queue?page=0&size=200&sort=createdAt&direction=desc",
      logs: "/api/audit-logs?page=0&size=50",
    }}
    kpiFn={(data) => {
      const cases = data.cases?.content || [];
      const compliant = cases.filter((c) => c.status === "COMPLIANT").length;
      const partial = cases.filter((c) => c.status === "PARTIALLY_COMPLIANT").length;
      const non = cases.filter((c) => c.status === "NON_COMPLIANT").length;
      const pending = cases.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW" || c.status === "REQUIRES_CLARIFICATION").length;
      const decided = cases.length - pending;
      const rate = decided > 0 ? Math.round((compliant / decided) * 100) : 0;
      return [
        { label: "Compliance Rate", value: `${rate}%`, icon: ShieldCheck, color: "#059669" },
        { label: "Compliant", value: compliant, icon: CheckCircle2, color: "#2563eb" },
        { label: "Partially Compliant", value: partial, icon: HelpCircle, color: "#d97706" },
        { label: "Non-Compliant", value: non, icon: XCircle, color: "#dc2626" },
        { label: "In Review", value: pending, icon: ClipboardList, color: "#7c3aed" },
      ];
    }}
    tables={[
      {
        key: "cases",
        title: "Audit Outcomes",
        emptyText: "No concluded audit cases yet.",
        maxRows: 20,
        columns: [
          { header: "Case", render: (r) => <strong style={{ color: "#dc2626" }}>{r.caseNumber}</strong> },
          { header: "PR", accessor: "requestNumber" },
          { header: "Department", accessor: "department" },
          { header: "Amount", render: (r) => <strong>{formatINR(r.estimatedAmount)}</strong> },
          { header: "Conclusion", render: (r) => <span className="lro-badge" style={{ background: r.conclusion === "COMPLIANT" ? "rgba(5,150,105,.12)" : r.conclusion === "NON_COMPLIANT" ? "rgba(220,38,38,.12)" : r.conclusion ? "rgba(217,119,6,.12)" : "rgba(100,116,139,.12)", color: r.conclusion === "COMPLIANT" ? "#059669" : r.conclusion === "NON_COMPLIANT" ? "#dc2626" : r.conclusion ? "#d97706" : "#64748b" }}>{r.conclusion || "—"}</span> },
          { header: "Concluded", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.concludedAt, { withTime: true })}</span> },
        ],
      },
    ]}
  />
);

export default ComplianceMonitoring;
