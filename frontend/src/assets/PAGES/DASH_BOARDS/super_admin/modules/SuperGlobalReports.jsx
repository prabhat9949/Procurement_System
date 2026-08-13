import React from "react";
import { FolderKanban, IndianRupee, ClipboardCheck, FileText, Landmark, CreditCard } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const SuperGlobalReports = () => (
  <RealReportsView
    accent="#d97706"
    header={{
      title: "Global Reports",
      subtitle: "Organization-wide reports generated from real transaction tables. Export to PDF or Excel from the backend.",
      badge: "REPORTS & ANALYTICS",
      icon: FolderKanban,
    }}
    kpis={[
      { label: "Total Procurement Spend", key: "totalProcurementSpend", icon: IndianRupee, color: "#d97706", format: "inr" },
      { label: "Monthly Spend", key: "monthlySpend", icon: IndianRupee, color: "#2563eb", format: "inr" },
      { label: "Pending Approvals", key: "pendingApprovals", icon: ClipboardCheck, color: "#dc2626" },
      { label: "Pending Invoices", key: "pendingInvoices", icon: Landmark, color: "#059669" },
      { label: "Pending Payments", key: "pendingPayments", icon: CreditCard, color: "#7c3aed" },
      { label: "Inventory Value", key: "inventoryValue", icon: FileText, color: "#0891b2", format: "inr" },
    ]}
    charts={[
      { label: "Monthly Spend", key: "monthlySpendChart", color: "#d97706", type: "area", source: "dash" },
      { label: "Department Spend", key: "departmentSpendChart", color: "#2563eb", type: "bar", source: "dash" },
      { label: "Vendor Spend", key: "vendorSpendChart", color: "#7c3aed", type: "bar", source: "dash" },
      { label: "Invoice Status", key: "invoiceStatusChart", color: "#059669", type: "pie", source: "dash" },
      { label: "Payment Status", key: "paymentStatusChart", color: "#dc2626", type: "pie", source: "dash" },
    ]}
    tables={[
      {
        key: "prs",
        endpoint: "/api/reports/purchase-requests?page=0&size=10",
        title: "Purchase Request Report",
        emptyText: "No purchase requests found.",
        maxRows: 8,
        columns: [
          { header: "Request No.", render: (r) => <strong style={{ color: "#d97706" }}>{r.referenceNumber}</strong> },
          { header: "Title", accessor: "title" },
          { header: "Department", accessor: "relatedOne" },
          { header: "Requester", accessor: "relatedTwo" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
      {
        key: "pos",
        endpoint: "/api/reports/purchase-orders?page=0&size=10",
        title: "Purchase Order Report",
        emptyText: "No purchase orders found.",
        maxRows: 8,
        columns: [
          { header: "PO No.", render: (r) => <strong style={{ color: "#2563eb" }}>{r.referenceNumber}</strong> },
          { header: "Title", accessor: "title" },
          { header: "Vendor", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
      {
        key: "invoices",
        endpoint: "/api/reports/invoices?page=0&size=10",
        title: "Invoice Report",
        emptyText: "No invoices found.",
        maxRows: 8,
        columns: [
          { header: "Invoice No.", render: (r) => <strong style={{ color: "#059669" }}>{r.referenceNumber}</strong> },
          { header: "Vendor", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
      {
        key: "payments",
        endpoint: "/api/reports/payments?page=0&size=10",
        title: "Payment Report",
        emptyText: "No payments processed yet.",
        maxRows: 8,
        columns: [
          { header: "Payment No.", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.referenceNumber}</strong> },
          { header: "Vendor", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
    ]}
  />
);

export default SuperGlobalReports;
