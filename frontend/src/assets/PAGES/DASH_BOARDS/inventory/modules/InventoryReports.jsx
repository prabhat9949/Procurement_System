import React, { useState, useEffect, useCallback } from "react";
import { FolderKanban, Loader2, WifiOff, Download, PackageCheck, Truck } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const InventoryReports = () => {
  const [inventory, setInventory] = useState([]);
  const [grns, setGrns] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, g, wh] = await Promise.all([
        apiGet("/api/inventory?page=0&size=300").catch(() => null),
        apiGet("/api/goods-receipts?page=0&size=200").catch(() => null),
        apiGet("/api/warehouses?page=0&size=100").catch(() => null),
      ]);
      setInventory(inv?.content || []);
      setGrns(g?.content || []);
      setWarehouses(wh?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load inventory reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const exportCSV = (filename, headers, rows) => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const low = inventory.filter((i) => Number(i.availableQuantity) <= Number(i.reorderLevel || 0) && Number(i.availableQuantity) > 0).length;
  const out = inventory.filter((i) => Number(i.availableQuantity) <= 0).length;
  const totalValue = inventory.reduce((a, i) => a + Number(i.inventoryValue || 0), 0);

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderKanban color="#f8b400" /> Inventory Reports
          </h1>
          <p className="inv-page-subtitle">Stock position, GRN register and warehouse list — generated from the live database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Generating reports...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>STOCK VALUE</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(totalValue)}</p>
              <span style={{ fontSize: "12px", color: "#666" }}>{inventory.length} records</span>
            </div>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>LOW STOCK</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{low}</p>
            </div>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>OUT OF STOCK</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", margin: "4px 0" }}>{out}</p>
            </div>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>GRNs</span>
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{grns.length}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <button className="inv-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("stock-position.csv",
                ["Product", "SKU", "Warehouse", "Available", "Reserved", "Damaged", "Value", "Status"],
                inventory.map((i) => [i.productName, i.productCode, i.warehouseName, i.availableQuantity, i.reservedQuantity, i.damagedQuantity, i.inventoryValue, i.status]))}>
              <Download size={16} /> Export Stock Position
            </button>
            <button className="inv-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("grn-register.csv",
                ["GRN", "PO", "Vendor", "Warehouse", "Receipt Date", "Status"],
                grns.map((g) => [g.grnNumber, g.poNumber, g.vendorName, g.warehouseName, g.receiptDate, g.status]))}>
              <Download size={16} /> Export GRN Register
            </button>
            <button className="inv-btn-primary-sm" style={{ padding: "18px", justifyContent: "center", fontSize: "14px" }}
              onClick={() => exportCSV("warehouse-list.csv",
                ["Code", "Warehouse", "Type", "Manager", "Status"],
                warehouses.map((w) => [w.warehouseCode, w.warehouseName, w.warehouseType, w.managerName, w.status]))}>
              <Download size={16} /> Export Warehouse List
            </button>
          </div>

          <div className="inv-card" style={{ overflow: "hidden" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <PackageCheck size={16} color="#f8b400" /> Recent GRNs ({grns.length})
            </h4>
            <div className="inv-table-container">
              <table className="inv-table">
                <thead>
                  <tr><th>GRN</th><th>PO</th><th>Vendor</th><th>Warehouse</th><th>Receipt Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {grns.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "#666" }}>No GRNs recorded.</td></tr>
                  ) : grns.slice(0, 20).map((g) => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: "800", color: "#059669" }}>{g.grnNumber}</td>
                      <td style={{ fontSize: "13px" }}>{g.poNumber}</td>
                      <td style={{ fontWeight: 600 }}>{g.vendorName}</td>
                      <td style={{ fontSize: "13px" }}>{g.warehouseName}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(g.receiptDate, { withTime: false })}</td>
                      <td><span className="lro-badge" style={{ background: g.status === "COMPLETED" || g.status === "RECEIVED" ? "rgba(5,150,105,.12)" : "rgba(217,119,6,.12)", color: g.status === "COMPLETED" || g.status === "RECEIVED" ? "#059669" : "#d97706" }}>{g.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryReports;
