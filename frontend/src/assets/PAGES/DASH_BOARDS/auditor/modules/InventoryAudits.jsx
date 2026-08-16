import React from "react";
import { Boxes, PackageCheck, AlertTriangle, Truck } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatDateIN } from "../../../../../utils/format";

const InventoryAudits = () => (
  <LiveRoleOverview
    header={{
      title: "Inventory & GRN Audits",
      subtitle: "Stock levels, receipts and GRN records for receiving verification — live from the database.",
      badge: "INVENTORY AUDIT",
      icon: Boxes,
      accent: "#dc2626",
    }}
    endpoints={{
      inventory: "/api/inventory?page=0&size=100",
      grns: "/api/goods-receipts?page=0&size=50",
      invChart: "/api/dashboard/charts/inventory",
    }}
    kpiFn={(data) => {
      const inv = data.inventory?.content || [];
      const grns = data.grns?.content || [];
      const low = inv.filter((i) => Number(i.availableQuantity) <= Number(i.reorderLevel || 0) && Number(i.availableQuantity) > 0);
      const out = inv.filter((i) => Number(i.availableQuantity) <= 0);
      return [
        { label: "Inventory Records", value: inv.length, icon: Boxes, color: "#2563eb" },
        { label: "GRNs", value: grns.length, icon: PackageCheck, color: "#7c3aed" },
        { label: "Low Stock", value: low.length, icon: AlertTriangle, color: "#d97706" },
        { label: "Out of Stock", value: out.length, icon: Truck, color: "#dc2626" },
      ];
    }}
    charts={[{ key: "invChart", label: "Inventory Trend", color: "#dc2626", type: "area" }]}
    tables={[
      {
        key: "inventory",
        title: "Stock Position",
        emptyText: "No inventory records available.",
        maxRows: 15,
        columns: [
          { header: "Product", accessor: "productName" },
          { header: "SKU", accessor: "productCode" },
          { header: "Warehouse", accessor: "warehouseName" },
          { header: "Available", render: (r) => <strong>{Number(r.availableQuantity)}</strong> },
          { header: "Reserved", render: (r) => <span>{Number(r.reservedQuantity)}</span> },
          { header: "Damaged", render: (r) => <span style={{ color: r.damagedQuantity > 0 ? "#dc2626" : "#666" }}>{Number(r.damagedQuantity)}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "LOW_STOCK" || r.status === "OUT_OF_STOCK" ? "rgba(220,38,38,.12)" : "rgba(5,150,105,.12)", color: r.status === "LOW_STOCK" || r.status === "OUT_OF_STOCK" ? "#dc2626" : "#059669" }}>{r.status}</span> },
        ],
      },
      {
        key: "grns",
        title: "Goods Receipt Notes",
        emptyText: "No GRNs recorded.",
        maxRows: 10,
        columns: [
          { header: "GRN", render: (r) => <strong style={{ color: "#dc2626" }}>{r.grnNumber}</strong> },
          { header: "PO", accessor: "poNumber" },
          { header: "Vendor", accessor: "vendorName" },
          { header: "Warehouse", accessor: "warehouseName" },
          { header: "Receipt Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.receiptDate, { withTime: false })}</span> },
          { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "COMPLETED" || r.status === "GRN_CONFIRMED" ? "rgba(5,150,105,.12)" : r.status === "REJECTED" || r.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "COMPLETED" || r.status === "GRN_CONFIRMED" ? "#059669" : r.status === "REJECTED" || r.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
        ],
      },
    ]}
  />
);

export default InventoryAudits;
