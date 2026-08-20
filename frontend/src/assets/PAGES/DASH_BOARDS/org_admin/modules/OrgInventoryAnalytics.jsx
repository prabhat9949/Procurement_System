import React from "react";
import { Boxes, Warehouse as WarehouseIcon, ClipboardList, IndianRupee } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatINR } from "../../../../../utils/format";

const OrgInventoryAnalytics = () => (
  <RealReportsView
    accent="#0891b2"
    header={{
      title: "Inventory Analytics",
      subtitle: "Stock levels, warehouses and GRNs — real quantities and values.",
      badge: "WAREHOUSE & INVENTORY",
      icon: Boxes,
    }}
    kpis={[
      { label: "Inventory Value", key: "inventoryValue", icon: IndianRupee, color: "#0891b2", format: "inr" },
      { label: "Pending GRNs", key: "pendingGrns", icon: ClipboardList, color: "#d97706" },
      { label: "Pending Purchase Orders", key: "pendingPurchaseOrders", icon: WarehouseIcon, color: "#2563eb" },
    ]}
    charts={[
      {
        label: "Inventory Value Trend",
        key: "invTrend",
        color: "#0891b2",
        type: "area",
        source: "endpoint",
        endpoint: "/api/dashboard/charts/inventory",
      },
    ]}
    tables={[
      {
        key: "stock",
        endpoint: "/api/inventory?page=0&size=10",
        title: "Stock Levels",
        emptyText: "No inventory records found.",
        maxRows: 8,
        columns: [
          { header: "Product", render: (r) => <strong style={{ color: "#0891b2" }}>{r.productName}</strong> },
          { header: "Warehouse", accessor: "warehouseName" },
          { header: "Available", render: (r) => <span style={{ fontWeight: 700 }}>{Number(r.availableQuantity || 0).toLocaleString()}</span> },
          { header: "Value", render: (r) => <span style={{ fontWeight: 700 }}>{formatINR(r.inventoryValue)}</span> },
          { header: "Status", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: /LOW|CRITICAL|OUT/i.test(r.status || "") ? "rgba(220,38,38,.12)" : "rgba(5,150,105,.12)", color: /LOW|CRITICAL|OUT/i.test(r.status || "") ? "#dc2626" : "#059669" }}>{r.status || "OK"}</span> },
        ],
      },
      {
        key: "warehouses",
        endpoint: "/api/warehouses?page=0&size=10",
        title: "Warehouses",
        emptyText: "No warehouses found.",
        maxRows: 8,
        columns: [
          { header: "Warehouse", render: (r) => <strong style={{ color: "#d97706" }}>{r.warehouseName}</strong> },
          { header: "Type", accessor: "warehouseType" },
          { header: "Location", render: (r) => <span>{[r.city, r.state].filter(Boolean).join(", ") || "—"}</span> },
          { header: "Manager", accessor: "managerName" },
        ],
      },
    ]}
  />
);

export default OrgInventoryAnalytics;
