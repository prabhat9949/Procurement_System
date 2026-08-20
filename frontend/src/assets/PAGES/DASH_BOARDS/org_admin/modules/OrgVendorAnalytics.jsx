import React from "react";
import { Truck, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";

const OrgVendorAnalytics = () => (
  <LiveRoleOverview
    header={{
      title: "Vendor Analytics",
      subtitle: "Supplier lifecycle and spend — real vendor records from the database.",
      badge: "VENDOR MANAGEMENT",
      icon: Truck,
      accent: "#7c3aed",
    }}
    endpoints={{
      vendors: "/api/vendors?page=0&size=100",
      dash: "/api/dashboard/admin",
    }}
    kpiFn={(data) => {
      const vendors = data.vendors?.content || [];
      return [
        { label: "Registered Vendors", value: vendors.length, icon: Truck, color: "#7c3aed" },
        { label: "Active Vendors", value: vendors.filter((v) => v.status === "ACTIVE").length, icon: CheckCircle2, color: "#059669" },
        { label: "KYC Approved", value: vendors.filter((v) => v.approved).length, icon: Star, color: "#2563eb" },
        { label: "Suspended / Blacklisted", value: vendors.filter((v) => /SUSPEND|BLACKLIST/i.test(v.status || "")).length, icon: AlertTriangle, color: "#dc2626" },
      ];
    }}
    charts={[
      { key: "dash", code: "VENDOR_DISTRIBUTION", label: "Vendor Spend Distribution", color: "#7c3aed", type: "area" },
    ]}
    tables={[
      {
        key: "vendors",
        title: "Vendors",
        emptyText: "No vendors registered yet.",
        maxRows: 10,
        columns: [
          { header: "Vendor", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.vendorName}</strong> },
          { header: "Code", accessor: "vendorCode" },
          { header: "GST", accessor: "gstNumber" },
          { header: "City", accessor: "city" },
          { header: "KYC", render: (r) => <span className="lro-badge" style={{ background: r.approved ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: r.approved ? "#059669" : "#d97706" }}>{r.approved ? "APPROVED" : "PENDING"}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "ACTIVE" ? "rgba(5,150,105,.12)" : /SUSPEND|BLACKLIST/i.test(r.status || "") ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "ACTIVE" ? "#059669" : /SUSPEND|BLACKLIST/i.test(r.status || "") ? "#dc2626" : "#d97706" }}>{r.status || "DRAFT"}</span> },
        ],
      },
    ]}
  />
);

export default OrgVendorAnalytics;
