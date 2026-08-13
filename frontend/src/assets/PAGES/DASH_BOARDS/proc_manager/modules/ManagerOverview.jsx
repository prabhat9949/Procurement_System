import React from "react";
import { ClipboardCheck, FileText, Send, FileCheck2, ShoppingBag, PackageCheck, Users, IndianRupee } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const ManagerOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Procurement Manager";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Approved requisitions, RFQs, quotations and purchase orders — all live from the database.",
        badge: "PROCUREMENT MANAGER PORTAL",
        icon: PackageCheck,
        accent: "#059669",
      }}
      actions={[
        { label: "Procurement Overview", icon: FileText, primary: true, onClick: () => onNavigate("procurement-overview") },
      ]}
      endpoints={{
        dash: "/api/dashboard/procurement",
        approved: "/api/purchase-requests?status=APPROVED&page=0&size=20",
        rfqs: "/api/rfqs?page=0&size=20&sort=createdAt&direction=desc",
        pos: "/api/purchase-orders?page=0&size=20&sort=orderDate&direction=desc",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        return [
          { label: "My Pending Approvals", value: count("MY_PENDING_APPROVALS"), icon: ClipboardCheck, color: "#d97706" },
          { label: "Purchase Requests", value: count("PURCHASE_REQUESTS"), icon: FileText, color: "#2563eb" },
          { label: "Open RFQs", value: count("OPEN_RFQS"), icon: Send, color: "#7c3aed" },
          { label: "Quotations for Comparison", value: count("QUOTATIONS_AWAITING_COMPARISON"), icon: FileCheck2, color: "#0891b2" },
          { label: "POs Awaiting Delivery", value: count("POS_AWAITING_DELIVERY"), icon: ShoppingBag, color: "#059669" },
        ];
      }}
      charts={[
        { key: "dash", code: "PURCHASE_REQUESTS", label: "Purchase Request Trend", color: "#2563eb", type: "bar" },
        { key: "dash", code: "PURCHASE_ORDERS", label: "Purchase Order Trend", color: "#059669", type: "area" },
      ]}
      tables={[
        {
          key: "approved",
          title: "Approved Requisitions Awaiting Sourcing",
          emptyText: "No approved requisitions awaiting sourcing right now.",
          maxRows: 8,
          columns: [
            { header: "Request", render: (r) => <strong style={{ color: "#059669" }}>{r.requestNumber}</strong> },
            { header: "Purpose", render: (r) => <span style={{ fontWeight: 600 }}>{r.purpose}</span> },
            { header: "Requester", accessor: "requesterName" },
            { header: "Department", accessor: "departmentName" },
            { header: "Amount", render: (r) => <strong>{formatINR(r.estimatedAmount)}</strong> },
            { header: "Priority", render: (r) => <span className="lro-badge" style={{ background: "rgba(217,119,6,.12)", color: "#d97706" }}>{r.priority}</span> },
          ],
        },
        {
          key: "pos",
          title: "Recent Purchase Orders",
          emptyText: "No purchase orders have been generated yet.",
          maxRows: 8,
          columns: [
            { header: "PO No.", render: (r) => <strong style={{ color: "#059669" }}>{r.poNumber}</strong> },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Request", accessor: "requestNumber" },
            { header: "Total", render: (r) => <strong>{formatINR(r.grandTotal)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "DRAFT" ? "rgba(100,116,139,.12)" : r.status === "SENT" || r.status === "ACKNOWLEDGED" ? "rgba(37,99,235,.12)" : r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: r.status === "DRAFT" ? "#64748b" : r.status === "SENT" || r.status === "ACKNOWLEDGED" ? "#2563eb" : r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "#059669" : "#d97706" }}>{r.status}</span> },
            { header: "Order Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.orderDate, { withTime: false })}</span> },
          ],
        },
      ]}
    />
  );
};

export default ManagerOverview;
