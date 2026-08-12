import React from "react";
import { PackageCheck, Truck, IndianRupee, AlertTriangle, Boxes, Warehouse as WarehouseIcon, FileCheck2 } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const InventoryOverview = ({ onNavigate }) => {
  const displayName = localStorage.getItem("eps_display_name") || "Warehouse Manager";

  return (
    <LiveRoleOverview
      header={{
        title: `Welcome back, ${displayName}`,
        subtitle: "Pending GRNs, stock levels and inbound deliveries — all live from the database.",
        badge: "WAREHOUSE & INVENTORY PORTAL",
        icon: WarehouseIcon,
        accent: "#0891b2",
      }}
      actions={[
        { label: "Goods Receiving", icon: PackageCheck, primary: true, onClick: () => onNavigate("goods-receiving") },
      ]}
      endpoints={{
        dash: "/api/dashboard/warehouse",
        inv: "/api/inventory?page=0&size=50",
        grns: "/api/goods-receipts?page=0&size=20",
      }}
      kpiFn={(data) => {
        const kpi = (code) => data.dash?.kpis?.find((k) => k.code === code);
        const count = (code) => kpi(code)?.count ?? 0;
        const amount = (code) => kpi(code)?.amount ?? 0;
        return [
          { label: "Pending GRNs", value: count("PENDING_GRNS"), icon: FileCheck2, color: "#d97706" },
          { label: "Goods Received Today", value: count("GOODS_RECEIVED_TODAY"), icon: Truck, color: "#2563eb" },
          { label: "Inventory Value", value: formatINR(amount("INVENTORY_VALUE")), icon: IndianRupee, color: "#059669" },
          { label: "Low Stock", value: count("LOW_STOCK"), icon: AlertTriangle, color: "#d97706" },
          { label: "Out of Stock", value: count("OUT_OF_STOCK"), icon: Boxes, color: "#dc2626" },
        ];
      }}
      charts={[
        { key: "dash", code: "GRNS", label: "Goods Receipt Trend", color: "#0891b2", type: "bar" },
        { key: "dash", code: "INVENTORY_VALUE", label: "Inventory Value by Warehouse", color: "#059669", type: "area" },
      ]}
      tables={[
        {
          key: "inv",
          title: "Current Stock Levels",
          emptyText: "No inventory records found.",
          maxRows: 10,
          columns: [
            { header: "Product", render: (r) => <strong style={{ color: "#0891b2" }}>{r.productCode}</strong> },
            { header: "Name", render: (r) => <span style={{ fontWeight: 600 }}>{r.productName}</span> },
            { header: "Warehouse", accessor: "warehouseName" },
            { header: "Available", render: (r) => <strong>{formatINR(r.availableQuantity, { symbol: false })}</strong> },
            { header: "Reserved", render: (r) => <span>{formatINR(r.reservedQuantity, { symbol: false })}</span> },
            { header: "Damaged", render: (r) => <span style={{ color: r.damagedQuantity > 0 ? "#dc2626" : "#7a8999" }}>{formatINR(r.damagedQuantity, { symbol: false })}</span> },
          ],
        },
        {
          key: "grns",
          title: "Goods Receipt Notes",
          emptyText: "No goods receipts have been recorded yet.",
          maxRows: 8,
          columns: [
            { header: "GRN No.", render: (r) => <strong style={{ color: "#0891b2" }}>{r.grnNumber}</strong> },
            { header: "PO", accessor: "poNumber" },
            { header: "Vendor", accessor: "vendorName" },
            { header: "Warehouse", accessor: "warehouseName" },
            { header: "Status", render: (r) => <span className="lro-badge" style={{ background: r.status === "COMPLETED" ? "rgba(5,150,105,.12)" : r.status === "CANCELLED" || r.status === "REJECTED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: r.status === "COMPLETED" ? "#059669" : r.status === "CANCELLED" || r.status === "REJECTED" ? "#dc2626" : "#d97706" }}>{r.status}</span> },
            { header: "Receipt Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.receiptDate, { withTime: false })}</span> },
          ],
        },
      ]}
    />
  );
};

export default InventoryOverview;
