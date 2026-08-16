import React from "react";
import { ShieldCheck, FileText, Users, ShoppingBag, CheckCircle2, AlertTriangle, IndianRupee, FileSearch, Landmark, ClipboardList } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const AuditorOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Auditor";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Independent review of the complete procurement record — audit cases, findings, compliance and the immutable audit trail.",
        badge: "AUDIT & COMPLIANCE PORTAL",
        icon: ShieldCheck,
        accent: "#dc2626",
      }}
      actions={[
        { label: "My Audit Queue", icon: ClipboardList, primary: true, onClick: () => onNavigate("procurement-audits") },
        { label: "Audit Trail", icon: FileSearch, onClick: () => onNavigate("reports") },
      ]}
      endpoints={{
        dash: "/api/dashboard/admin",
        logs: "/api/audit-logs?page=0&size=30",
        queue: "/api/audits/my-queue?page=0&size=10&sort=createdAt&direction=desc",
        pending: "/api/audits/pending-count",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        const pending = data.pending ?? 0;
        const cases = data.queue?.content || [];
        return [
          { label: "Assigned Audit Cases", value: pending, icon: ClipboardList, color: "#dc2626" },
          { label: "Pending Approvals", value: count("PENDING_APPROVALS"), icon: CheckCircle2, color: "#d97706" },
          { label: "Purchase Orders", value: count("PURCHASE_ORDERS"), icon: ShoppingBag, color: "#0891b2" },
          { label: "Pending Payments", value: count("PENDING_PAYMENTS"), icon: Landmark, color: "#059669" },
          { label: "Open RFQs", value: count("OPEN_RFQS"), icon: AlertTriangle, color: "#7c3aed" },
          { label: "Audit Log Events", value: data.logs?.totalElements ?? 0, icon: FileSearch, color: "#2563eb" },
        ];
      }}
      tables={[
        {
          key: "queue",
          title: "My Audit Queue",
          emptyText: "No audit cases are currently assigned to you.",
          maxRows: 8,
          columns: [
            { header: "Case", render: (r) => <strong style={{ color: "#dc2626" }}>{r.caseNumber}</strong> },
            { header: "PR", render: (r) => <span style={{ fontWeight: 600 }}>{r.requestNumber}</span> },
            { header: "Requester", accessor: "requesterName" },
            { header: "Department", accessor: "department" },
            { header: "Amount", render: (r) => <strong>{formatINR(r.estimatedAmount)}</strong> },
            { header: "Risk", render: (r) => <span className="lro-badge" style={{ background: r.riskLevel === "CRITICAL" ? "rgba(220,38,38,.12)" : r.riskLevel === "HIGH" ? "rgba(217,119,6,.12)" : "rgba(100,116,139,.12)", color: r.riskLevel === "CRITICAL" ? "#dc2626" : r.riskLevel === "HIGH" ? "#d97706" : "#64748b" }}>{r.riskLevel}</span> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "COMPLIANT" ? "rgba(5,150,105,.12)" : r.status === "NON_COMPLIANT" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "COMPLIANT" ? "#059669" : r.status === "NON_COMPLIANT" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
            { header: "Assigned", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.assignedDate, { withTime: false })}</span> },
          ],
        },
        {
          key: "logs",
          title: "Audit Log Trail",
          emptyText: "No audit events recorded yet.",
          maxRows: 12,
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
