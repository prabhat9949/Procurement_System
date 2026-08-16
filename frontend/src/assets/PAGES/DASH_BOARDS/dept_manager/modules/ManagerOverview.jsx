import React from "react";
import { ClipboardCheck, FileText, CheckCircle2, XCircle, Clock, IndianRupee, UserCheck, FileCheck } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const ManagerOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Manager";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Review and act on your team's purchase requests — the approval queue below is live.",
        badge: "DEPARTMENT MANAGER PORTAL",
        icon: UserCheck,
        accent: "#7c3aed",
      }}
      actions={[
        { label: "Open Approval Queue", icon: FileCheck, primary: true, onClick: () => onNavigate("approvals") },
      ]}
      endpoints={{
        tasks: "/api/approval-tasks?page=0&size=30&sort=assignedDate&direction=desc",
        prs: "/api/purchase-requests?page=0&size=50",
        prTrend: "/api/dashboard/charts/pr",
      }}
      kpiFn={(data) => {
        const tasks = data.tasks?.content || [];
        const prs = data.prs?.content || [];
        const pending = tasks.filter((t) => t.status === "PENDING").length;
        const approved = prs.filter((r) => r.status === "APPROVED").length;
        const rejected = prs.filter((r) => r.status === "REJECTED").length;
        const value = tasks
          .filter((t) => t.status === "PENDING")
          .reduce((sum, t) => sum + (Number(t.approvedAmount) || 0), 0);
        return [
          { label: "Pending Approvals", value: pending, icon: Clock, color: "#d97706" },
          { label: "Approved Requests", value: approved, icon: CheckCircle2, color: "#059669" },
          { label: "Rejected Requests", value: rejected, icon: XCircle, color: "#dc2626" },
          { label: "Pending Value", value: formatINR(value), icon: IndianRupee, color: "#7c3aed" },
        ];
      }}
      charts={[
        { key: "prTrend", label: "Department Purchase Request Trend", color: "#7c3aed", type: "bar" },
      ]}
      tables={[
        {
          key: "tasks",
          title: "Approval Tasks",
          emptyText: "No approval tasks have been assigned yet.",
          maxRows: 12,
          columns: [
            { header: "Task", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.taskNumber}</strong> },
            { header: "Request", accessor: "requestNumber" },
            { header: "Stage", accessor: "stageName" },
            { header: "Assigned To", accessor: "assignedEmployeeName" },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "PENDING" ? "rgba(217,119,6,.12)" : r.status === "APPROVED" ? "rgba(5,150,105,.12)" : r.status === "REJECTED" ? "rgba(220,38,38,.12)" : "rgba(100,116,139,.12)", color: r.status === "PENDING" ? "#d97706" : r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : "#64748b" }}>{r.status}</span> },
            { header: "Assigned", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.assignedDate)}</span> },
          ],
        },
      ]}
    />
  );
};

export default ManagerOverview;
