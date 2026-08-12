import React from "react";
import { BarChart2, IndianRupee, ClipboardCheck, Landmark, CreditCard, Boxes } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";

const BusinessIntelligence = () => (
  <RealReportsView
    accent="#7c3aed"
    header={{
      title: "Business Intelligence",
      subtitle: "Executive view of the entire procurement lifecycle — all KPIs and charts are real database aggregates.",
      badge: "BUSINESS INTELLIGENCE",
      icon: BarChart2,
    }}
    kpis={[
      { label: "Total Procurement Spend", key: "totalProcurementSpend", icon: IndianRupee, color: "#7c3aed", format: "inr" },
      { label: "Monthly Spend", key: "monthlySpend", icon: IndianRupee, color: "#f8b400", format: "inr" },
      { label: "Pending Approvals", key: "pendingApprovals", icon: ClipboardCheck, color: "#dc2626" },
      { label: "Pending Invoices", key: "pendingInvoices", icon: Landmark, color: "#059669" },
      { label: "Pending Payments", key: "pendingPayments", icon: CreditCard, color: "#2563eb" },
      { label: "Inventory Value", key: "inventoryValue", icon: Boxes, color: "#0891b2", format: "inr" },
    ]}
    charts={[
      { label: "Monthly Spend", key: "monthlySpendChart", color: "#7c3aed", type: "area", source: "dash" },
      { label: "Department Spend", key: "departmentSpendChart", color: "#059669", type: "bar", source: "dash" },
      { label: "Vendor Spend", key: "vendorSpendChart", color: "#2563eb", type: "bar", source: "dash" },
      { label: "Invoice Status", key: "invoiceStatusChart", color: "#f8b400", type: "pie", source: "dash" },
      { label: "Payment Status", key: "paymentStatusChart", color: "#dc2626", type: "pie", source: "dash" },
    ]}
    tables={[
      {
        key: "pos",
        endpoint: "/api/reports/purchase-orders?page=0&size=10",
        title: "Purchase Orders",
        emptyText: "No purchase orders found.",
        maxRows: 8,
        columns: [
          { header: "PO No.", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.referenceNumber}</strong> },
          { header: "Title", accessor: "title" },
          { header: "Vendor", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{Number(r.amount || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
    ]}
  />
);

export default BusinessIntelligence;
