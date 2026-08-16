import React, { useState, useEffect, useCallback } from "react";
import {
  PackageCheck,
  Search,
  Loader2,
  WifiOff,
  AlertTriangle,
  IndianRupee,
  X,
  Eye,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const StockManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const q = status ? `&status=${status}` : "";
      const page = await apiGet(`/api/inventory?page=0&size=200${q}`);
      setItems(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load stock data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(""); }, [loadData]);

  const filtered = items.filter((i) => {
    const s = search.toLowerCase();
    return !s || (i.productName || "").toLowerCase().includes(s) || (i.productCode || "").toLowerCase().includes(s)
      || (i.warehouseName || "").toLowerCase().includes(s);
  });

  const lowCount = items.filter((i) => Number(i.availableQuantity) <= Number(i.reorderLevel || 0) && Number(i.availableQuantity) > 0).length;
  const outCount = items.filter((i) => Number(i.availableQuantity) <= 0).length;
  const totalValue = items.reduce((a, i) => a + Number(i.inventoryValue || 0), 0);
  const reserved = items.reduce((a, i) => a + Number(i.reservedQuantity || 0), 0);

  const statusColor = (s) => {
    if (s === "OUT_OF_STOCK") return "#dc2626";
    if (s === "LOW_STOCK") return "#d97706";
    if (s === "RESERVED") return "#7c3aed";
    return "#059669";
  };

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <PackageCheck color="#f8b400" /> Stock Management
          </h1>
          <p className="inv-page-subtitle">Available, reserved, damaged and low stock — every value is live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => loadData("")} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>INVENTORY ITEMS</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{items.length}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>STOCK VALUE</span>
          <p style={{ fontSize: "20px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{formatINR(totalValue)}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>RESERVED UNITS</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{reserved}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>LOW STOCK</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{lowCount}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>OUT OF STOCK</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#dc2626", margin: "4px 0" }}>{outCount}</p>
        </div>
      </div>

      <div className="inv-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search product, SKU or warehouse..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); loadData(e.target.value); }} style={{ ...inputStyle, width: "200px" }}>
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="RESERVED">Reserved</option>
          <option value="DAMAGED">Damaged</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading stock data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="inv-card" style={{ textAlign: "center", padding: "48px" }}>
          <PackageCheck size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Inventory Records</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No inventory records are currently available.</p>
        </div>
      ) : (
        <div className="inv-card" style={{ overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Warehouse</th><th>Available</th><th>Reserved</th><th>Damaged</th><th>Reorder</th><th>Value</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
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
                    <td style={{ fontSize: "13px", color: "#666" }}>{Number(i.reorderLevel)}</td>
                    <td style={{ fontWeight: "700" }}>{formatINR(i.inventoryValue)}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(i.status)}14`, color: statusColor(i.status) }}>{i.status}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="inv-btn-primary-sm" onClick={() => setSelected(i)}><Eye size={14} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="inv-modal-overlay">
          <div className="inv-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>{selected.productName}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
              <div><span style={{ color: "#888" }}>SKU:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.productCode}</p></div>
              <div><span style={{ color: "#888" }}>Warehouse:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.warehouseName}</p></div>
              <div><span style={{ color: "#888" }}>Available:</span><p style={{ fontWeight: 800, margin: "2px 0", color: "#059669" }}>{Number(selected.availableQuantity)}</p></div>
              <div><span style={{ color: "#888" }}>Reserved:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{Number(selected.reservedQuantity)}</p></div>
              <div><span style={{ color: "#888" }}>Damaged:</span><p style={{ fontWeight: 700, margin: "2px 0", color: Number(selected.damagedQuantity) > 0 ? "#dc2626" : "#333" }}>{Number(selected.damagedQuantity)}</p></div>
              <div><span style={{ color: "#888" }}>Reorder Level:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{Number(selected.reorderLevel)}</p></div>
              <div><span style={{ color: "#888" }}>Min / Max:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{Number(selected.minimumStock)} / {Number(selected.maximumStock)}</p></div>
              <div><span style={{ color: "#888" }}>Status:</span><p style={{ fontWeight: 700, margin: "2px 0", color: statusColor(selected.status) }}>{selected.status}</p></div>
              <div style={{ gridColumn: "1 / -1", background: "#fafafa", padding: "12px", borderRadius: "8px", border: "1px solid #eee" }}>
                <span style={{ color: "#888", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Stock Value (INR)</span>
                <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669", margin: "4px 0 0" }}>{formatINR(selected.inventoryValue)}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#888" }}>Last Updated:</span>
                <p style={{ fontWeight: 600, margin: "2px 0" }}>{formatDateIN(selected.lastStockUpdate)}</p>
              </div>
            </div>
            {selected.status === "LOW_STOCK" && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "12px 14px", borderRadius: "10px", fontSize: "13px", marginTop: "16px" }}>
                <AlertTriangle size={16} /> Available ({Number(selected.availableQuantity)}) is at or below the reorder level ({Number(selected.reorderLevel)}).
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="inv-btn-primary-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
