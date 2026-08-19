import React from "react";
import { IndianRupee, Landmark, CreditCard } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const OrgFinancialAnalytics = () => (
  <RealReportsView
    accent="#059669"
    header={{
      title: "Financial Analytics",
      subtitle: "Spend, invoices and payments — real aggregates from the financial tables.",
      badge: "FINANCE",
      icon: IndianRupee,
    }}
    kpis={[
      { label: "Total Procurement Spend", key: "totalProcurementSpend", icon: IndianRupee, color: "#059669", format: "inr" },
      { label: "Monthly Spend", key: "monthlySpend", icon: IndianRupee, color: "#2563eb", format: "inr" },
      { label: "Pending Invoices", key: "pendingInvoices", icon: Landmark, color: "#d97706" },
      { label: "Pending Payments", key: "pendingPayments", icon: CreditCard, color: "#dc2626" },
    ]}
    charts={[
      { label: "Monthly Spend", key: "monthlySpendChart", color: "#059669", type: "area", source: "dash" },
      { label: "Invoice Status", key: "invoiceStatusChart", color: "#d97706", type: "pie", source: "dash" },
      { label: "Payment Status", key: "paymentStatusChart", color: "#2563eb", type: "pie", source: "dash" },
    ]}
    tables={[
      {
        key: "invoices",
        endpoint: "/api/reports/invoices?page=0&size=10",
        title: "Invoices",
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
        title: "Payments",
        emptyText: "No payments processed yet.",
        maxRows: 8,
        columns: [
          { header: "Payment No.", render: (r) => <strong style={{ color: "#2563eb" }}>{r.referenceNumber}</strong> },
          { header: "Vendor", accessor: "relatedOne" },
          { header: "Amount", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.amount)}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", accessor: "status" },
        ],
      },
    ]}
  />
);

export default OrgFinancialAnalytics;
