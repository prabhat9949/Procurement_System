import React from "react";
import { FileText, Clock, CheckCircle2, XCircle, Edit3, PlusCircle, IndianRupee, UserIcon, RotateCcw, Send } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const STATUS_STYLE = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  SUBMITTED: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  UNDER_REVIEW: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  APPROVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  CANCELLED: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  RFQ_CREATED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
};

const DashboardOverview = ({ onNavigate }) => {
  return (
    <LiveRoleOverview
      header={{
        title: "Welcome back to your Procurement Dashboard",
        subtitle:
          "Create and track your purchase requests — every number below is aggregated live from the database for your account.",
        badge: "EMPLOYEE PORTAL",
        icon: UserIcon,
        accent: "#2563eb",
      }}
      actions={[
        {
          label: "Create New Request",
          icon: PlusCircle,
          primary: true,
          onClick: () => onNavigate("create-request"),
        },
        {
          label: "My Requests",
          icon: FileText,
          onClick: () => onNavigate("my-requests"),
        },
      ]}
      endpoints={{
        emp: "/api/dashboard/employee",
        recent: "/api/purchase-requests?page=0&size=8&sort=createdAt&direction=desc",
      }}
      kpiFn={(data) => {
        const kpis = data.emp?.kpis || [];
        const kpi = (code) => kpis.find((item) => item.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        const amount = (code) => kpi(code)?.amount;
        return [
          { label: "Total Requests", value: count("TOTAL_REQUESTS"), icon: FileText, color: "#2563eb" },
          { label: "Draft", value: count("DRAFTS"), icon: Edit3, color: "#7c3aed" },
          { label: "Pending Approval", value: count("PENDING"), icon: Clock, color: "#d97706" },
          { label: "Approved", value: count("APPROVED"), icon: CheckCircle2, color: "#059669" },
          { label: "Rejected", value: count("REJECTED"), icon: XCircle, color: "#dc2626" },
          { label: "Returned", value: count("RETURNED"), icon: RotateCcw, color: "#f59e0b" },
          { label: "Cancelled", value: count("CANCELLED"), icon: XCircle, color: "#64748b" },
          { label: "In Sourcing", value: count("RFQ_CREATED"), icon: Send, color: "#2563eb" },
          { label: "Request Value", value: amount("TOTAL_VALUE") != null ? formatINR(amount("TOTAL_VALUE")) : "—", icon: IndianRupee, color: "#0d9488" },
          { label: "Approved Value", value: amount("APPROVED_VALUE") != null ? formatINR(amount("APPROVED_VALUE")) : "—", icon: IndianRupee, color: "#059669" },
        ];
      }}
      charts={[
        { key: "emp", code: "REQUESTS_BY_STATUS", label: "Requests by Status", color: "#2563eb", type: "bar" },
        { key: "emp", code: "REQUESTS_BY_MONTH", label: "Monthly Requests", color: "#7c3aed", type: "bar" },
        { key: "emp", code: "REQUEST_VALUE_BY_MONTH", label: "Monthly Request Value", color: "#0d9488", type: "area" },
      ]}
      tables={[
        {
          key: "recent",
          title: "Recently Submitted Requests",
          emptyText: "No purchase requests yet. Create your first request to get started.",
          maxRows: 8,
          columns: [
            { header: "PR Number", render: (r) => <strong style={{ color: "#111" }}>{r.requestNumber}</strong> },
            {
              header: "Purpose",
              render: (r) => (
                <span style={{ display: "block", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.purpose || "—"}
                </span>
              ),
            },
            {
              header: "Amount",
              align: "right",
              render: (r) => <span style={{ fontWeight: 700, color: "#0f172a" }}>{formatINR(r.estimatedAmount)}</span>,
            },
            {
              header: "Status",
              render: (r) => {
                const s = STATUS_STYLE[r.status] || STATUS_STYLE.DRAFT;
                return (
                  <span className="lro-badge" style={{ background: s.bg, color: s.color }}>
                    {r.status === "UNDER_REVIEW" ? "Pending" : r.status.replace("_", " ")}
                  </span>
                );
              },
            },
            { header: "Required By", render: (r) => formatDateIN(r.requiredDate, { withTime: false }) },
          ],
        },
      ]}
    />
  );
};

export default DashboardOverview;
