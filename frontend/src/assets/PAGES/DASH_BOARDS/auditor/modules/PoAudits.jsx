import React from "react";
import { FileText, ShoppingBag, AlertTriangle, CheckCircle2 } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const PoAudits = () => (
  <LiveRoleOverview
    header={{
      title: "Purchase Order Audits",
      subtitle: "PO value verification against PR, quotation and invoice — live from the database.",
      badge: "PO AUDIT",
      icon: ShoppingBag,
      accent: "#dc2626",
    }}
    endpoints={{
      pos: "/api/purchase-orders?page=0&size=50&sort=orderDate&direction=desc",
      poTrend: "/api/dashboard/charts/po",
    }}
    kpiFn={(data) => {
      const pos = data.pos?.content || [];
      const total = pos.reduce((a, p) => a + Number(p.grandTotal || 0), 0);
      return [
        { label: "Purchase Orders", value: pos.length, icon: ShoppingBag, color: "#2563eb" },
        { label: "Total PO Value", value: formatINR(total), icon: FileText, color: "#7c3aed" },
        { label: "Sent / Acknowledged", value: pos.filter((p) => p.status === "SENT" || p.status === "ACKNOWLEDGED").length, icon: CheckCircle2, color: "#059669" },
        { label: "Cancelled", value: pos.filter((p) => p.status === "CANCELLED").length, icon: AlertTriangle, color: "#dc2626" },
      ];
    }}
    charts={[{ key: "poTrend", label: "Purchase Order Trend", color: "#dc2626", type: "area" }]}
    tables={[
      {
        key: "pos",
        title: "Purchase Orders for Verification",
        emptyText: "No purchase orders recorded.",
        maxRows: 15,
        columns: [
          { header: "PO No.", render: (r) => <strong style={{ color: "#dc2626" }}>{r.poNumber}</strong> },
          { header: "Vendor", accessor: "vendorName" },
          { header: "Request", accessor: "requestNumber" },
          { header: "Grand Total", render: (r) => <strong>{formatINR(r.grandTotal)}</strong> },
          { header: "Expected Delivery", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.expectedDeliveryDate, { withTime: false })}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "rgba(5,150,105,.12)" : r.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "#059669" : r.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
        ],
      },
    ]}
  />
);

export default PoAudits;
