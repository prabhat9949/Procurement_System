import React from "react";
import { FileText, Clock, CheckCircle2, XCircle, Edit3, PlusCircle, IndianRupee, UserIcon } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const DashboardOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "there";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Create and track your purchase requests — every status below is live from the database.",
        badge: "EMPLOYEE PORTAL",
        icon: UserIcon,
        accent: "#2563eb",
      }}
      actions={[
        { label: "Create New Request", icon: PlusCircle, primary: true, onClick: () => onNavigate("create-request") },
      ]}
      endpoints={{
        prs: "/api/purchase-requests?page=0&size=50",
        prTrend: "/api/dashboard/charts/pr",
      }}
      kpiFn={(data) => {
        const rows = data.prs?.content || [];
        const count = (status) => rows.filter((r) => r.status === status).length;
        return [
          { label: "Total Requests", value: rows.length, icon: FileText, color: "#2563eb" },
          { label: "Draft", value: count("DRAFT"), icon: Edit3, color: "#7c3aed" },
          { label: "Pending / Under Review", value: count("SUBMITTED") + count("UNDER_REVIEW"), icon: Clock, color: "#d97706" },
          { label: "Approved", value: count("APPROVED"), icon: CheckCircle2, color: "#059669" },
          { label: "Rejected", value: count("REJECTED"), icon: XCircle, color: "#dc2626" },
        ];
      }}
      charts={[
        { key: "prTrend", label: "Purchase Request Trend", color: "#2563eb", type: "bar" },
      ]}
      tables={[
        {
          key: "prs",
          title: "Recent Purchase Requests",
          emptyText: "No purchase requests yet. Create your first request to get started.",
          maxRows: 10,
          columns: [
            { header: "Request No.", render: (r) => <strong style={{ color: "#2563eb" }}>{r.requestNumber}</strong> },
            { header: "Purpose", render: (r) => <span style={{ fontWeight: 600 }}>{r.purpose}</span> },
            { header: "Department", accessor: "departmentName" },
            { header: "Amount", render: (r) => <strong>{formatINR(r.estimatedAmount)}</strong> },
            { header: "Priority", render: (r) => <span className="lro-badge" style={{ background: "rgba(217,119,6,.12)", color: "#d97706" }}>{r.priority}</span> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "APPROVED" ? "rgba(5,150,105,.12)" : r.status === "REJECTED" ? "rgba(220,38,38,.12)" : r.status === "DRAFT" ? "rgba(100,116,139,.12)" : "rgba(217,119,6,.12)", color: r.status === "APPROVED" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : r.status === "DRAFT" ? "#64748b" : "#d97706" }}>{r.status}</span> },
            { header: "Created", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.createdAt)}</span> },
          ],
        },
      ]}
    />
  );
};

export default DashboardOverview;
