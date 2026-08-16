import React from "react";
import { Warehouse, Boxes, PackageCheck, AlertTriangle, Truck, Package, CheckCircle2 } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const InventoryOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Warehouse Manager";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Receiving, GRN and stock position — every number is live from the database.",
        badge: "INVENTORY CONTROL PORTAL",
        icon: Warehouse,
        accent: "#f8b400",
      }}
      actions={[
        { label: "Goods Receiving", icon: Truck, primary: true, onClick: () => onNavigate("goods-receiving") },
        { label: "Stock Management", icon: PackageCheck, onClick: () => onNavigate("stock-management") },
      ]}
      endpoints={{
        dash: "/api/dashboard/warehouse",
        inventory: "/api/inventory?page=0&size=100",
        grns: "/api/goods-receipts?page=0&size=30",
        warehouses: "/api/warehouses?page=0&size=30",
        invChart: "/api/dashboard/charts/inventory",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        const inv = data.inventory?.content || [];
        const grns = data.grns?.content || [];
        const low = inv.filter((i) => Number(i.availableQuantity) <= Number(i.reorderLevel || 0) && Number(i.availableQuantity) > 0).length;
        const out = inv.filter((i) => Number(i.availableQuantity) <= 0).length;
        return [
          { label: "Inventory Records", value: count("INVENTORY") || inv.length, icon: Boxes, color: "#2563eb" },
          { label: "Low Stock", value: low, icon: AlertTriangle, color: "#d97706" },
          { label: "Out of Stock", value: out, icon: AlertTriangle, color: "#dc2626" },
          { label: "GRNs Completed", value: grns.filter((g) => g.status === "COMPLETED" || g.status === "RECEIVED").length, icon: CheckCircle2, color: "#059669" },
          { label: "Warehouses", value: count("WAREHOUSES") || data.warehouses?.content?.length || 0, icon: Warehouse, color: "#7c3aed" },
          { label: "Pending GRNs", value: grns.filter((g) => !["COMPLETED", "RECEIVED", "REJECTED", "CANCELLED"].includes(g.status)).length, icon: Package, color: "#0891b2" },
        ];
      }}
      charts={[{ key: "invChart", label: "Inventory Trend", color: "#f8b400", type: "area" }]}
      tables={[
        {
          key: "inventory",
          title: "Stock Position",
          emptyText: "No inventory records are currently available.",
          maxRows: 10,
          columns: [
            { header: "Product", accessor: "productName" },
            { header: "Warehouse", accessor: "warehouseName" },
            { header: "Available", render: (r) => <strong>{Number(r.availableQuantity)}</strong> },
            { header: "Reserved", render: (r) => <span>{Number(r.reservedQuantity)}</span> },
            { header: "Value", render: (r) => <strong>{formatINR(r.inventoryValue)}</strong> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "LOW_STOCK" || r.status === "OUT_OF_STOCK" ? "rgba(220,38,38,.12)" : "rgba(5,150,105,.12)", color: r.status === "LOW_STOCK" || r.status === "OUT_OF_STOCK" ? "#dc2626" : "#059669" }}>{r.status}</span> },
          ],
        },
        {
          key: "grns",
          title: "Recent GRNs",
          emptyText: "No GRNs are currently pending.",
          maxRows: 8,
          columns: [
            { header: "GRN", render: (r) => <strong style={{ color: "#d97706" }}>{r.grnNumber}</strong> },
            { header: "PO", accessor: "poNumber" },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Warehouse", accessor: "warehouseName" },
            { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.receiptDate, { withTime: false })}</span> },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "COMPLETED" || r.status === "RECEIVED" ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: r.status === "COMPLETED" || r.status === "RECEIVED" ? "#059669" : "#d97706" }}>{r.status}</span> },
          ],
        },
      ]}
    />
  );
};

export default InventoryOverview;
