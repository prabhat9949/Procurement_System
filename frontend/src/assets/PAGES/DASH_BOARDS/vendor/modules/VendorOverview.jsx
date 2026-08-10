import React from "react";
import { Send, FileCheck2, ShoppingBag, Truck, IndianRupee, Store, FileText } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const VendorOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Supplier";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome, ${displayName}`,
        subtitle: "RFQ invitations, your quotations, purchase orders and deliveries — only your own records, live.",
        badge: "SUPPLIER PORTAL",
        icon: Store,
        accent: "#d97706",
      }}
      actions={[
        { label: "View RFQs", icon: Send, primary: true, onClick: () => onNavigate("rfqs") },
      ]}
      endpoints={{
        rfqs: "/api/rfqs?page=0&size=30&sort=createdAt&direction=desc",
        quotes: "/api/vendor-quotations?page=0&size=30&sort=createdAt&direction=desc",
        pos: "/api/purchase-orders?page=0&size=30&sort=orderDate&direction=desc",
        poTrend: "/api/dashboard/charts/po",
      }}
      kpiFn={(data) => {
        const rfqs = data.rfqs?.content || [];
        const quotes = data.quotes?.content || [];
        const pos = data.pos?.content || [];
        const openRfqs = rfqs.filter((r) => r.status === "OPEN" || r.status === "DRAFT").length;
        return [
          { label: "Open RFQs", value: openRfqs, icon: Send, color: "#7c3aed" },
          { label: "Submitted Quotations", value: quotes.length, icon: FileCheck2, color: "#2563eb" },
          { label: "Purchase Orders", value: pos.length, icon: ShoppingBag, color: "#d97706" },
          { label: "POs Awaiting Delivery", value: pos.filter((p) => p.status === "SENT" || p.status === "ACKNOWLEDGED").length, icon: Truck, color: "#059669" },
        ];
      }}
      charts={[
        { key: "poTrend", label: "Purchase Order Trend", color: "#d97706", type: "area" },
      ]}
      tables={[
        {
          key: "quotes",
          title: "Your Recent Quotations",
          emptyText: "You haven't submitted any quotations yet.",
          maxRows: 8,
          columns: [
            { header: "Quotation", render: (r) => <strong style={{ color: "#d97706" }}>#{r.id}</strong> },
            { header: "RFQ", accessor: "rfqNumber" },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "SUBMITTED" ? "rgba(5,150,105,.12)" : r.status === "ACCEPTED" ? "rgba(37,99,235,.12)" : r.status === "REJECTED" ? "rgba(220,38,38,.12)" : "rgba(100,116,139,.12)", color: r.status === "SUBMITTED" ? "#059669" : r.status === "ACCEPTED" ? "#2563eb" : r.status === "REJECTED" ? "#dc2626" : "#64748b" }}>{r.status}</span> },
            { header: "Created", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.createdAt)}</span> },
          ],
        },
        {
          key: "pos",
          title: "Purchase Orders Issued to You",
          emptyText: "No purchase orders have been issued yet.",
          maxRows: 8,
          columns: [
            { header: "PO No.", render: (r) => <strong style={{ color: "#d97706" }}>{r.poNumber}</strong> },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Request", accessor: "requestNumber" },
            { header: "Total", render: (r) => <strong>{formatINR(r.grandTotal)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "SENT" || r.status === "ACKNOWLEDGED" ? "rgba(37,99,235,.12)" : r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: r.status === "SENT" || r.status === "ACKNOWLEDGED" ? "#2563eb" : r.status === "FULLY_RECEIVED" || r.status === "CLOSED" ? "#059669" : "#d97706" }}>{r.status}</span> },
            { header: "Order Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.orderDate, { withTime: false })}</span> },
          ],
        },
      ]}
    />
  );
};

export default VendorOverview;
