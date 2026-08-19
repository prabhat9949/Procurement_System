import React from "react";
import { AlertTriangle, ClipboardList, ShieldCheck, FileSearch } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const RiskAnalysis = () => (
  <LiveRoleOverview
    header={{
      title: "Risk Analysis",
      subtitle: "Risk levels are derived from actual transaction values and audit outcomes — live from the database.",
      badge: "RISK ANALYSIS",
      icon: AlertTriangle,
      accent: "#dc2626",
    }}
    endpoints={{
      cases: "/api/audits/my-queue?page=0&size=200&sort=createdAt&direction=desc",
    }}
    kpiFn={(data) => {
      const cases = data.cases?.content || [];
      return [
        { label: "Audit Cases", value: cases.length, icon: ClipboardList, color: "#2563eb" },
        { label: "Critical Risk", value: cases.filter((c) => c.riskLevel === "CRITICAL").length, icon: AlertTriangle, color: "#dc2626" },
        { label: "High Risk", value: cases.filter((c) => c.riskLevel === "HIGH").length, icon: AlertTriangle, color: "#d97706" },
        { label: "Medium / Low", value: cases.filter((c) => c.riskLevel === "MEDIUM" || c.riskLevel === "LOW").length, icon: ShieldCheck, color: "#059669" },
      ];
    }}
    tables={[
      {
        key: "cases",
        title: "Cases by Risk Level",
        emptyText: "No audit cases assigned yet.",
        maxRows: 20,
        columns: [
          { header: "Case", render: (r) => <strong style={{ color: "#dc2626" }}>{r.caseNumber}</strong> },
          { header: "PR", accessor: "requestNumber" },
          { header: "Requester", accessor: "requesterName" },
          { header: "Amount", render: (r) => <strong>{formatINR(r.estimatedAmount)}</strong> },
          { header: "Risk", render: (r) => <span className="lro-badge" style={{ background: r.riskLevel === "CRITICAL" ? "rgba(220,38,38,.12)" : r.riskLevel === "HIGH" ? "rgba(217,119,6,.12)" : r.riskLevel === "MEDIUM" ? "rgba(245,158,11,.12)" : "rgba(5,150,105,.12)", color: r.riskLevel === "CRITICAL" ? "#dc2626" : r.riskLevel === "HIGH" ? "#d97706" : r.riskLevel === "MEDIUM" ? "#f59e0b" : "#059669" }}>{r.riskLevel}</span> },
          { header: "Status", accessor: "status" },
          { header: "Due", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.dueDate, { withTime: false })}</span> },
        ],
      },
    ]}
  />
);

export default RiskAnalysis;
