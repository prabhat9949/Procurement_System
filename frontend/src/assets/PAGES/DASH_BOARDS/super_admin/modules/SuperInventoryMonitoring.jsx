import React from "react";
import { Boxes, Warehouse as WarehouseIcon, ClipboardList, IndianRupee } from "lucide-react";
import RealReportsView from "../../shared_ui/RealReportsView";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const SuperInventoryMonitoring = () => (
  <RealReportsView
    accent="#0891b2"
    header={{
      title: "Inventory Monitoring",
      subtitle: "Stock, warehouses and goods receipts — real quantities and values from the inventory tables.",
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
      { label: "Department Spend", key: "departmentSpendChart", color: "#059669", type: "bar", source: "dash" },
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
          { header: "Reserved", render: (r) => <span style={{ fontWeight: 600, color: "#d97706" }}>{Number(r.reservedQuantity || 0).toLocaleString()}</span> },
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
          { header: "Code", accessor: "warehouseCode" },
          { header: "Type", render: (r) => <span style={{ fontSize: "12px", fontWeight: 700 }}>{r.warehouseType}</span> },
          { header: "Location", render: (r) => <span>{[r.city, r.state].filter(Boolean).join(", ") || "—"}</span> },
          { header: "Manager", accessor: "managerName" },
        ],
      },
      {
        key: "grns",
        endpoint: "/api/reports/grns?page=0&size=10",
        title: "Goods Receipt Notes",
        emptyText: "No GRNs recorded yet.",
        maxRows: 8,
        columns: [
          { header: "GRN No.", render: (r) => <strong style={{ color: "#7c3aed" }}>{r.referenceNumber}</strong> },
          { header: "PO", accessor: "relatedOne" },
          { header: "Title", accessor: "title" },
          { header: "Qty", render: (r) => <span style={{ fontWeight: 700 }}>{Number(r.quantity || 0).toLocaleString()}</span> },
          { header: "Date", render: (r) => <span style={{ color: "#7a8999", fontSize: "12.5px" }}>{formatDateIN(r.date)}</span> },
          { header: "Status", render: (r) => <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: /COMPLETED|RECEIVED/i.test(r.status) ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: /COMPLETED|RECEIVED/i.test(r.status) ? "#059669" : "#d97706" }}>{r.status}</span> },
        ],
      },
    ]}
  />
);

export default SuperInventoryMonitoring;
