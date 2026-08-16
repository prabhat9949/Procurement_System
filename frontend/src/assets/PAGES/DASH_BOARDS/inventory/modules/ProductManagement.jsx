import React, { useState, useEffect, useCallback } from "react";
import { Boxes, Search, Loader2, WifiOff, X, Eye, IndianRupee } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/products?page=0&size=200");
      setProducts(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    return !s || (p.productName || "").toLowerCase().includes(s) || (p.sku || "").toLowerCase().includes(s)
      || (p.categoryName || "").toLowerCase().includes(s);
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Boxes color="#f8b400" /> Product Management
          </h1>
          <p className="inv-page-subtitle">Product catalogue master data — live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="inv-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search product, SKU or category..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading products...
        </div>
      ) : filtered.length === 0 ? (
        <div className="inv-card" style={{ textAlign: "center", padding: "48px" }}>
          <Boxes size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Products</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No product records are currently available.</p>
        </div>
      ) : (
        <div className="inv-card" style={{ overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>SKU</th><th>Product</th><th>Category</th><th>Brand</th><th>UoM</th><th>Unit Price</th><th>Reorder Level</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{p.sku || p.productCode}</td>
                    <td style={{ fontWeight: 600 }}>{p.productName}</td>
                    <td style={{ fontSize: "13px" }}>{p.categoryName || "—"}</td>
                    <td style={{ fontSize: "13px" }}>{p.brand || "—"}</td>
                    <td style={{ fontSize: "13px" }}>{p.uomName || "—"}</td>
                    <td style={{ fontWeight: "700" }}>{formatINR(p.unitPrice)}</td>
                    <td style={{ fontSize: "13px" }}>{p.reorderLevel ?? "—"}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: p.active ? "rgba(5,150,105,.12)" : "rgba(100,116,139,.12)", color: p.active ? "#059669" : "#64748b" }}>{p.active ? "ACTIVE" : "INACTIVE"}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="inv-btn-primary-sm" onClick={() => setSelected(p)}><Eye size={14} /> View</button>
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
              <div><span style={{ color: "#888" }}>SKU:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.sku || selected.productCode}</p></div>
              <div><span style={{ color: "#888" }}>Category:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.categoryName || "—"}</p></div>
              <div><span style={{ color: "#888" }}>Brand:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.brand || "—"}</p></div>
              <div><span style={{ color: "#888" }}>Manufacturer:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.manufacturer || "—"}</p></div>
              <div><span style={{ color: "#888" }}>UoM:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{selected.uomName || "—"}</p></div>
              <div><span style={{ color: "#888" }}>Unit Price:</span><p style={{ fontWeight: 700, margin: "2px 0" }}>{formatINR(selected.unitPrice)}</p></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#888" }}>Description:</span>
                <p style={{ fontWeight: 600, margin: "2px 0" }}>{selected.description || "—"}</p>
              </div>
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

export default ProductManagement;
