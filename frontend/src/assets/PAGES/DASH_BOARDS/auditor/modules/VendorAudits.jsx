import React from "react";
import { Star, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatDateIN } from "../../../../../utils/format";

const VendorAudits = () => (
  <LiveRoleOverview
    header={{
      title: "Vendor Audits",
      subtitle: "Vendor registry, status and transaction history for supplier verification — live from the database.",
      badge: "VENDOR AUDIT",
      icon: Star,
      accent: "#dc2626",
    }}
    endpoints={{
      vendors: "/api/vendors?page=0&size=100",
    }}
    kpiFn={(data) => {
      const vendors = data.vendors?.content || [];
      return [
        { label: "Registered Vendors", value: vendors.length, icon: Users, color: "#2563eb" },
        { label: "Active", value: vendors.filter((v) => v.status === "ACTIVE").length, icon: CheckCircle2, color: "#059669" },
        { label: "Pending Approval", value: vendors.filter((v) => v.status === "PENDING" || v.status === "PENDING_APPROVAL").length, icon: AlertTriangle, color: "#d97706" },
        { label: "Inactive / Suspended", value: vendors.filter((v) => v.status === "INACTIVE" || v.status === "SUSPENDED" || v.status === "BLOCKED").length, icon: AlertTriangle, color: "#dc2626" },
      ];
    }}
    tables={[
      {
        key: "vendors",
        title: "Vendor Registry",
        emptyText: "No vendors recorded.",
        maxRows: 20,
        columns: [
          { header: "Vendor Code", render: (r) => <strong style={{ color: "#dc2626" }}>{r.vendorCode || r.id}</strong> },
          { header: "Vendor", accessor: "vendorName" },
          { header: "Business Type", accessor: "vendorType" },
          { header: "GSTIN", accessor: "gstNumber" },
          { header: "Contact", accessor: "contactPerson" },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "ACTIVE" ? "rgba(5,150,105,.12)" : r.status === "PENDING" || r.status === "PENDING_APPROVAL" ? "rgba(217,119,6,.12)" : "rgba(220,38,38,.12)", color: r.status === "ACTIVE" ? "#059669" : r.status === "PENDING" || r.status === "PENDING_APPROVAL" ? "#d97706" : "#dc2626" }}>{r.status}</span> },
        ],
      },
    ]}
  />
);

export default VendorAudits;
