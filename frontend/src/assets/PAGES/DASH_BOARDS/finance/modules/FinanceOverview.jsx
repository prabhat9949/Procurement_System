import React from "react";
import { FileCheck2, IndianRupee, CreditCard, CheckCircle2, Landmark, TrendingUp, FileText } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const FinanceOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Finance Officer";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Invoices, three-way matches and payments — every number is live from the database.",
        badge: "FINANCE PORTAL",
        icon: Landmark,
        accent: "#f8b400",
      }}
      actions={[
        { label: "Invoice Management", icon: FileCheck2, primary: true, onClick: () => onNavigate("invoice-management") },
      ]}
      endpoints={{
        dash: "/api/dashboard/finance",
        invoices: "/api/invoices?page=0&size=20&sort=invoiceDate&direction=desc",
        payments: "/api/payments?page=0&size=20&sort=paymentDate&direction=desc",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        const amount = (code) => kpi(code)?.amount ?? 0;
        return [
          { label: "Pending Invoices", value: count("PENDING_INVOICES"), icon: FileText, color: "#d97706" },
          { label: "Pending 3-Way Matches", value: count("PENDING_THREE_WAY_MATCHES"), icon: FileCheck2, color: "#2563eb" },
          { label: "Pending Payments", value: count("PENDING_PAYMENTS"), icon: CreditCard, color: "#7c3aed" },
          { label: "Completed Payments", value: count("COMPLETED_PAYMENTS"), icon: CheckCircle2, color: "#059669" },
          { label: "Outstanding Balance", value: formatINR(amount("OUTSTANDING_VENDOR_BALANCE")), icon: IndianRupee, color: "#dc2626" },
          { label: "Monthly Spend", value: formatINR(amount("MONTHLY_SPEND")), icon: TrendingUp, color: "#0891b2" },
        ];
      }}
      charts={[
        { key: "dash", code: "MONTHLY_SPEND", label: "Monthly Procurement Spend", color: "#f8b400", type: "area" },
        { key: "dash", code: "INVOICES", label: "Invoice Trend", color: "#2563eb", type: "bar" },
      ]}
      tables={[
        {
          key: "invoices",
          title: "Recent Invoices",
          emptyText: "No invoices have been received yet.",
          maxRows: 8,
          columns: [
            { header: "Invoice", render: (r) => <strong style={{ color: "#d97706" }}>{r.invoiceNumber}</strong> },
            { header: "Vendor", accessor: "vendorName" },
            { header: "PO Id", accessor: "purchaseOrderId" },
            { header: "Total", render: (r) => <strong>{formatINR(r.grandTotal)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "APPROVED" || r.status === "PAID" ? "rgba(5,150,105,.12)" : r.status === "REJECTED" ? "rgba(220,38,38,.12)" : r.status === "MATCHED" ? "rgba(37,99,235,.12)" : "rgba(217,119,6,.12)", color: r.status === "APPROVED" || r.status === "PAID" ? "#059669" : r.status === "REJECTED" ? "#dc2626" : r.status === "MATCHED" ? "#2563eb" : "#d97706" }}>{r.status}</span> },
            { header: "Invoice Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.invoiceDate, { withTime: false })}</span> },
          ],
        },
        {
          key: "payments",
          title: "Recent Payments",
          emptyText: "No payments have been processed yet.",
          maxRows: 8,
          columns: [
            { header: "Payment", render: (r) => <strong style={{ color: "#059669" }}>{r.paymentNumber}</strong> },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Invoice", accessor: "invoiceNumber" },
            { header: "Amount", render: (r) => <strong>{formatINR(r.grossAmount)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "PAID" ? "rgba(5,150,105,.12)" : r.status === "FAILED" || r.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "PAID" ? "#059669" : r.status === "FAILED" || r.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
            { header: "Payment Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.paymentDate, { withTime: false })}</span> },
          ],
        },
      ]}
    />
  );
};

export default FinanceOverview;
