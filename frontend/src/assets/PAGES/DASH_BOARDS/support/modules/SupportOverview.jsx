import React from "react";
import { LifeBuoy, FileText, ClipboardCheck, CheckCircle2, XCircle, Clock, PackageCheck } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const SupportOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Support Team";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Procurement support desk — live request activity and approval workload.",
        badge: "SUPPORT OPERATIONS",
        icon: LifeBuoy,
        accent: "#0891b2",
      }}
      actions={[
        { label: "Support Tickets", icon: LifeBuoy, primary: true, onClick: () => onNavigate("support-tickets") },
      ]}
      endpoints={{
        prs: "/api/purchase-requests?page=0&size=30",
        tasks: "/api/approval-tasks?page=0&size=30",
        prTrend: "/api/dashboard/charts/pr",
      }}
      kpiFn={(data) => {
        const prs = data.prs?.content || [];
        const tasks = data.tasks?.content || [];
        return [
          { label: "Total Requests", value: prs.length, icon: FileText, color: "#2563eb" },
          { label: "Pending Approvals", value: tasks.filter((t) => t.status === "PENDING").length, icon: ClipboardCheck, color: "#d97706" },
          { label: "Approved", value: prs.filter((r) => r.status === "APPROVED").length, icon: CheckCircle2, color: "#059669" },
          { label: "Rejected", value: prs.filter((r) => r.status === "REJECTED").length, icon: XCircle, color: "#dc2626" },
          { label: "In Progress", value: prs.filter((r) => r.status === "UNDER_REVIEW" || r.status === "SUBMITTED").length, icon: Clock, color: "#7c3aed" },
        ];
      }}
      charts={[
        { key: "prTrend", label: "Purchase Request Trend", color: "#0891b2", type: "bar" },
      ]}
      tables={[
        {
          key: "prs",
          title: "Latest Purchase Requests",
          emptyText: "No purchase requests found yet.",
          maxRows: 10,
          columns: [
            { header: "Request", render: (r) => <strong style={{ color: "#0891b2" }}>{r.requestNumber}</strong> },
            { header: "Purpose", render: (r) => <span style={{ fontWeight: 600 }}>{r.purpose}</span> },
            { header: "Requester", accessor: "requesterName" },
            { header: "Department", accessor: "departmentName" },
            { header: "Amount", render: (r) => <strong>{formatINR(r.estimatedAmount)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "APPROVED" ? "rgba(5,150,105,.12)" : r.status === "REJECTED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
            { header: "Created", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.createdAt)}</span> },
          ],
        },
      ]}
    />
  );
};

export default SupportOverview;
