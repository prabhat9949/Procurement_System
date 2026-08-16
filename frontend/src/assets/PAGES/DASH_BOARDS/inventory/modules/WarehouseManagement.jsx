import React, { useState, useEffect, useCallback } from "react";
import { Warehouse, Loader2, WifiOff, X, Eye } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/warehouses?page=0&size=100");
      setWarehouses(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load warehouses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Warehouse color="#f8b400" /> Warehouse Management
          </h1>
          <p className="inv-page-subtitle">Active warehouses and their contacts — live from the database.</p>
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
          <Loader2 size={22} className="login-spin" /> Loading warehouses...
        </div>
      ) : warehouses.length === 0 ? (
        <div className="inv-card" style={{ textAlign: "center", padding: "48px" }}>
          <Warehouse size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Warehouses</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No warehouse records are currently available.</p>
        </div>
      ) : (
        <div className="inv-card" style={{ overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Code</th><th>Warehouse</th><th>Type</th><th>Manager</th><th>Contact</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{w.warehouseCode}</td>
                    <td style={{ fontWeight: 600 }}>{w.warehouseName}</td>
                    <td style={{ fontSize: "13px" }}>{w.warehouseType}</td>
                    <td style={{ fontSize: "13px" }}>{w.managerName || "—"}</td>
                    <td style={{ fontSize: "13px" }}>{w.contactPerson || w.email || "—"}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: w.status === "ACTIVE" ? "rgba(5,150,105,.12)" : "rgba(100,116,139,.12)", color: w.status === "ACTIVE" ? "#059669" : "#64748b" }}>{w.status}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="inv-btn-primary-sm" onClick={() => setSelected(w)}><Eye size={14} /> View</button>
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
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>{selected.warehouseName}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
              <div><span style={{ color: "#888" }}>Code:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.warehouseCode}</p></div>
              <div><span style={{ color: "#888" }}>Type:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.warehouseType}</p></div>
              <div><span style={{ color: "#888" }}>Manager:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.managerName || "—"}</p></div>
              <div><span style={{ color: "#888" }}>Status:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.status}</p></div>
              <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#888" }}>Description:</span><p style={{ fontWeight: 600, margin: "2px 0" }}>{selected.description || "—"}</p></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="inv-btn-primary-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
