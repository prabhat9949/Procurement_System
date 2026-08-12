import React from "react";
import { DollarSign, Landmark, IndianRupee, Receipt, CreditCard } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const SuperFinancialMonitoring = () => (
  <RealReportsView
    accent="#059669"
    header={{
      title: "Financial Monitoring",
      subtitle: "Invoices, payments and spend — every number is a real aggregate from the financial tables.",
      badge: "FINANCE & TREASURY",
      icon: DollarSign,
    }}
    kpis={[
      { label: "Total Procurement Spend", key: "totalProcurementSpend", icon: IndianRupee, color: "#059669", format: "inr" },
      { label: "Monthly Spend", key: "monthlySpend", icon: IndianRupee, color: "#2563eb", format: "inr" },
      { label: "Pending Invoices", key: "pendingInvoices", icon: Landmark, color: "#d97706" },
      { label: "Pending Payments", key: "pendingPayments", icon: CreditCard, color: "#dc2626" },
      { label: "Inventory Value", key: "inventoryValue", icon: Receipt, color: "#7c3aed", format: "inr" },
    ]}
    charts={[
      { label: "Monthly Spend", key: "monthlySpendChart", color: "#059669", type: "area", source: "dash" },
      { label: "Invoice Status", key: "invoiceStatusChart", color: "#d97706", type: "pie", source: "dash" },
      { label: "Payment Status", key: "paymentStatusChart", color: "#2563eb", type: "pie", source: "dash" },
      { label: "Vendor Spend", key: "vendorSpendChart", color: "#7c3aed", type: "bar", source: "dash" },
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
          { header: "Status", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: /APPROVED|PAID/i.test(r.status) ? "rgba(5,150,105,.12)" : /REJECTED/i.test(r.status) ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: /APPROVED|PAID/i.test(r.status) ? "#059669" : /REJECTED/i.test(r.status) ? "#dc2626" : "#d97706" }}>{r.status}</span> },
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
          { header: "Status", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: /PAID|COMPLETED/i.test(r.status) ? "rgba(5,150,105,.12)" : /FAILED|CANCELLED/i.test(r.status) ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: /PAID|COMPLETED/i.test(r.status) ? "#059669" : /FAILED|CANCELLED/i.test(r.status) ? "#dc2626" : "#d97706" }}>{r.status}</span> },
        ],
      },
    ]}
  />
);

export default SuperFinancialMonitoring;
