import React, { useState, useEffect, useCallback } from "react";
import { Barcode, Search, Loader2, WifiOff } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";

const InventoryTracking = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/inventory?page=0&size=300");
      setItems(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load inventory tracking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const warehouses = [...new Set(items.map((i) => i.warehouseName).filter(Boolean))];

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    const matchSearch = !s || (i.productName || "").toLowerCase().includes(s) || (i.productCode || "").toLowerCase().includes(s) || (i.warehouseName || "").toLowerCase().includes(s);
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchWh = !warehouseFilter || i.warehouseName === warehouseFilter;
    return matchSearch && matchStatus && matchWh;
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Barcode color="#f8b400" /> Inventory Tracking
          </h1>
          <p className="inv-page-subtitle">Track stock across warehouses — live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="inv-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search product, SKU or warehouse..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "170px" }}>
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="RESERVED">Reserved</option>
        </select>
        <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} style={{ ...inputStyle, width: "200px" }}>
          <option value="">All warehouses</option>
          {warehouses.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading inventory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="inv-card" style={{ textAlign: "center", padding: "48px" }}>
          <Barcode size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Inventory Records</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No inventory records match the current filters.</p>
        </div>
      ) : (
        <div className="inv-card" style={{ overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Warehouse</th><th>Available</th><th>Reserved</th><th>Damaged</th><th>Last Updated</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600 }}>{i.productName}</td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{i.productCode}</td>
                    <td style={{ fontSize: "13px" }}>{i.warehouseName}</td>
                    <td style={{ fontWeight: "800" }}>{Number(i.availableQuantity)}</td>
                    <td style={{ fontSize: "13px" }}>{Number(i.reservedQuantity)}</td>
                    <td style={{ fontSize: "13px", color: Number(i.damagedQuantity) > 0 ? "#dc2626" : "#666" }}>{Number(i.damagedQuantity)}</td>
                    <td style={{ fontSize: "12.5px", color: "#888" }}>{i.lastStockUpdate ? new Date(i.lastStockUpdate).toLocaleString("en-IN") : "—"}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK" ? "rgba(220,38,38,.12)" : "rgba(5,150,105,.12)", color: i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK" ? "#dc2626" : "#059669" }}>{i.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTracking;
