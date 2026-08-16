import React from "react";
import { BarChart3, Boxes, AlertTriangle, PackageCheck, IndianRupee } from "lucide-react";
import LiveRoleOverview from "../../shared_ui/LiveRoleOverview";
import { formatINR } from "../../../../../utils/format";

const InventoryAnalytics = () => (
  <LiveRoleOverview
    header={{
      title: "Inventory Analytics",
      subtitle: "Stock, receipts and GRN analytics — every value is live from the database.",
      badge: "INVENTORY ANALYTICS",
      icon: BarChart3,
      accent: "#f8b400",
    }}
    endpoints={{
      dash: "/api/dashboard/warehouse",
      inventory: "/api/inventory?page=0&size=200",
      grns: "/api/goods-receipts?page=0&size=100",
      invChart: "/api/dashboard/charts/inventory",
      grnChart: "/api/dashboard/charts/grn",
    }}
    kpiFn={(data) => {
      const inv = data.inventory?.content || [];
      const grns = data.grns?.content || [];
      const low = inv.filter((i) => Number(i.availableQuantity) <= Number(i.reorderLevel || 0) && Number(i.availableQuantity) > 0).length;
      const out = inv.filter((i) => Number(i.availableQuantity) <= 0).length;
      const value = inv.reduce((a, i) => a + Number(i.inventoryValue || 0), 0);
      return [
        { label: "Inventory Records", value: inv.length, icon: Boxes, color: "#2563eb" },
        { label: "Stock Value", value: formatINR(value), icon: IndianRupee, color: "#f8b400" },
        { label: "Low Stock", value: low, icon: AlertTriangle, color: "#d97706" },
        { label: "Out of Stock", value: out, icon: AlertTriangle, color: "#dc2626" },
        { label: "GRNs", value: grns.length, icon: PackageCheck, color: "#059669" },
      ];
    }}
    charts={[
      { key: "invChart", label: "Inventory Trend", color: "#f8b400", type: "area" },
      { key: "grnChart", label: "Goods Receipt Trend", color: "#059669", type: "bar" },
    ]}
  />
);

export default InventoryAnalytics;
