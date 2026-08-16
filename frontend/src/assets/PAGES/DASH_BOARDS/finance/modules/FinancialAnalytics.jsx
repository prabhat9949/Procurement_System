import React from "react";
import { BarChart3, IndianRupee, TrendingUp, Landmark, FileText } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR } from "../../../../../utils/format";

const FinancialAnalytics = () => (
  <LiveRoleOverview
    header={{
      title: "Financial Analytics",
      subtitle: "Spend, invoice and payment analytics — every value is live from the database.",
      badge: "FINANCIAL ANALYTICS",
      icon: BarChart3,
      accent: "#f8b400",
    }}
    endpoints={{
      dash: "/api/dashboard/finance",
      spend: "/api/dashboard/charts/spend",
      invoices: "/api/dashboard/charts/invoices",
      payments: "/api/dashboard/charts/payments",
    }}
    kpiFn={(data) => {
      const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
      const count = (code) => kpi(code)?.count ?? 0;
      const amount = (code) => kpi(code)?.amount ?? 0;
      return [
        { label: "Monthly Spend", value: formatINR(amount("MONTHLY_SPEND")), icon: TrendingUp, color: "#f8b400" },
        { label: "Outstanding Balance", value: formatINR(amount("OUTSTANDING_VENDOR_BALANCE")), icon: Landmark, color: "#dc2626" },
        { label: "Pending Payments", value: count("PENDING_PAYMENTS"), icon: IndianRupee, color: "#7c3aed" },
        { label: "Completed Payments", value: count("COMPLETED_PAYMENTS"), icon: FileText, color: "#059669" },
      ];
    }}
    charts={[
      { key: "spend", label: "Procurement Spend Trend", color: "#f8b400", type: "area" },
      { key: "invoices", label: "Invoice Trend", color: "#7c3aed", type: "bar" },
      { key: "payments", label: "Payment Trend", color: "#059669", type: "area" },
    ]}
  />
);

export default FinancialAnalytics;
