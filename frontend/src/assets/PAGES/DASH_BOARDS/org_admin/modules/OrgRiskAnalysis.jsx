import React from "react";
import { AlertTriangle, Lock, Truck, AlertOctagon } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatDateIN } from "../../../../../utils/format";

const OrgRiskAnalysis = () => (
  <RealReportsView
    accent="#dc2626"
    header={{
      title: "Risk Analysis",
      subtitle: "Real risk indicators — locked accounts, suspended vendors and failed audit events.",
      badge: "RISK & EXCEPTIONS",
      icon: AlertTriangle,
    }}
    kpiFn={(data) => {
      const users = data.users?.content || data.users || [];
      const vendors = data.vendors?.content || data.vendors || [];
      const logs = data.logs?.content || data.logs || [];
      return [
        { label: "Locked Accounts", value: users.filter((u) => u.accountLocked).length, icon: Lock, color: "#d97706" },
        { label: "Suspended / Blacklisted Vendors", value: vendors.filter((v) => /SUSPEND|BLACKLIST/i.test(v.status || "")).length, icon: Truck, color: "#dc2626" },
        { label: "Failed Audit Events", value: logs.filter((l) => l.success === false).length, icon: AlertOctagon, color: "#7c3aed" },
      ];
    }}
    charts={[]}
    tables={[
      {
        key: "logs",
        endpoint: "/api/audit-logs?page=0&size=50",
        title: "Failed / Failed-Previous Audit Events",
        emptyText: "No audit events recorded yet.",
        maxRows: 10,
        columns: [
          { header: "Module", render: (r) => <strong style={{ color: "#dc2626" }}>{r.moduleName}</strong> },
          { header: "Action", render: (r) => <span style={{ fontWeight: 600 }}>{r.operation}</span> },
          { header: "Actor", accessor: "performedBy" },
          { header: "Details", accessor: "details" },
          { header: "Time", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.performedAt)}</span> },
          { header: "Result", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: r.success ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.12)", color: r.success ? "#059669" : "#dc2626" }}>{r.success ? "SUCCESS" : "FAILED"}</span> },
        ],
      },
      {
        key: "vendors",
        endpoint: "/api/vendors?page=0&size=100",
        title: "Vendor Lifecycle Exceptions",
        emptyText: "No vendors found.",
        maxRows: 10,
        columns: [
          { header: "Vendor", render: (r) => <strong style={{ color: "#d97706" }}>{r.vendorName}</strong> },
          { header: "GST", accessor: "gstNumber" },
          { header: "KYC", render: (r) => <span className="lro-badge" style={{ background: r.approved ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: r.approved ? "#059669" : "#d97706" }}>{r.approved ? "APPROVED" : "PENDING"}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: /SUSPEND|BLACKLIST/i.test(r.status || "") ? "rgba(220,38,38,.12)" : "rgba(5,150,105,.12)", color: /SUSPEND|BLACKLIST/i.test(r.status || "") ? "#dc2626" : "#059669" }}>{r.status || "DRAFT"}</span> },
        ],
      },
    ]}
  />
);

export default OrgRiskAnalysis;
