import React from "react";
import { ClipboardCheck, FileText, Send, FileCheck2, ShoppingBag, PackageCheck, Users } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const ProcurementOverview = () => {
  return (
    <LiveRoleOverview
      header={{
        title: "Procurement Operations",
        subtitle: "End-to-end sourcing pipeline — approved requests, RFQs, quotations and purchase orders.",
        badge: "LIVE SOURCING PIPELINE",
        icon: PackageCheck,
        accent: "#059669",
      }}
      endpoints={{
        dash: "/api/dashboard/procurement",
        rfqs: "/api/rfqs?page=0&size=20&sort=createdAt&direction=desc",
        pos: "/api/purchase-orders?page=0&size=20&sort=orderDate&direction=desc",
        quotes: "/api/vendor-quotations?page=0&size=20&sort=createdAt&direction=desc",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        return [
          { label: "My Pending Approvals", value: count("MY_PENDING_APPROVALS"), icon: ClipboardCheck, color: "#d97706" },
          { label: "Open RFQs", value: count("OPEN_RFQS"), icon: Send, color: "#7c3aed" },
          { label: "Quotations for Comparison", value: count("QUOTATIONS_AWAITING_COMPARISON"), icon: FileCheck2, color: "#2563eb" },
          { label: "POs Awaiting Delivery", value: count("POS_AWAITING_DELIVERY"), icon: ShoppingBag, color: "#0891b2" },
        ];
      }}
      charts={[
        { key: "dash", code: "RFQS", label: "RFQ Trend", color: "#7c3aed", type: "bar" },
        { key: "dash", code: "PURCHASE_ORDERS", label: "Purchase Order Trend", color: "#059669", type: "area" },
      ]}
      tables={[
        {
          key: "rfqs",
          title: "Active RFQs",
          emptyText: "No RFQs created yet.",
          maxRows: 8,
          columns: [
            { header: "RFQ", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.rfqNumber}</strong> },
            { header: "Request", accessor: "purchaseRequestNumber" },
            { header: "Department", accessor: "departmentName" },
            { header: "Closing Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.closingDate, { withTime: false })}</span> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "OPEN" ? "rgba(5,150,105,.12)" : r.status === "DRAFT" ? "rgba(100,116,139,.12)" : r.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(37,99,235,.12)", color: r.status === "OPEN" ? "#059669" : r.status === "DRAFT" ? "#64748b" : r.status === "CANCELLED" ? "#dc2626" : "#2563eb" }}>{r.status}</span> },
          ],
        },
        {
          key: "pos",
          title: "Purchase Orders",
          emptyText: "No purchase orders generated yet.",
          maxRows: 8,
          columns: [
            { header: "PO No.", render: (r) => <strong style={{ color: "#059669" }}>{r.poNumber}</strong> },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Request", accessor: "requestNumber" },
            { header: "Total", render: (r) => <strong>{formatINR(r.grandTotal)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "rgba(5,150,105,.12)" : r.status === "SENT" || r.status === "ACKNOWLEDGED" ? "rgba(37,99,235,.12)" : r.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "#059669" : r.status === "SENT" || r.status === "ACKNOWLEDGED" ? "#2563eb" : r.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
          ],
        },
      ]}
    />
  );
};

export default ProcurementOverview;
