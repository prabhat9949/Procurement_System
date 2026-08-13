import React from "react";
import { ShoppingBag, ClipboardCheck, FileText, Boxes, PackageSearch } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const OrgProcurementAnalytics = () => (
  <RealReportsView
    accent="#2563eb"
    header={{
      title: "Procurement Analytics",
      subtitle: "Requests, orders and approvals — real workflow data from the database.",
      badge: "PROCUREMENT",
      icon: ShoppingBag,
    }}
    kpis={[
      { label: "Pending Approvals", key: "pendingApprovals", icon: ClipboardCheck, color: "#dc2626" },
      { label: "Pending RFQs", key: "pendingRfqs", icon: PackageSearch, color: "#d97706" },
      { label: "Pending Purchase Orders", key: "pendingPurchaseOrders", icon: FileText, color: "#2563eb" },
      { label: "Pending GRNs", key: "pendingGrns", icon: Boxes, color: "#7c3aed" },
      { label: "Monthly Spend", key: "monthlySpend", icon: ShoppingBag, color: "#059669", format: "inr" },
    ]}
    charts={[
      { label: "Monthly Spend", key: "monthlySpendChart", color: "#2563eb", type: "area", source: "dash" },
      { label: "Department Spend", key: "departmentSpendChart", color: "#059669", type: "bar", source: "dash" },
      { label: "Vendor Spend", key: "vendorSpendChart", color: "#7c3aed", type: "bar", source: "dash" },
    ]}
    tables={[
      {
        key: "prs",
        endpoint: "/api/reports/purchase-requests?page=0&size=10",
        title: "Purchase Requests",
        emptyText: "No purchase requests found.",
        maxRows: 8,
        columns: [
          { header: "Request No.", render: (r) => <strong style={{ color: "#2563eb" }}>{r.referenceNumber}</strong> },
          { header: "Title", accessor: "title" },
          { header: "Department", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
      {
        key: "pos",
        endpoint: "/api/reports/purchase-orders?page=0&size=10",
        title: "Purchase Orders",
        emptyText: "No purchase orders found.",
        maxRows: 8,
        columns: [
          { header: "PO No.", render: (r) => <strong style={{ color: "#d97706" }}>{r.referenceNumber}</strong> },
          { header: "Title", accessor: "title" },
          { header: "Vendor", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
    ]}
  />
);

export default OrgProcurementAnalytics;
