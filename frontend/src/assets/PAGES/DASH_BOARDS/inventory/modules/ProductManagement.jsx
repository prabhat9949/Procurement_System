import React, { useState, useEffect, useCallback } from "react";
import { Boxes, Search, Loader2, WifiOff, X, Eye, IndianRupee, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR } from "../../../../../utils/format";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm] = useState({
    productName: "",
    description: "",
    brand: "",
    categoryId: "",
    unitPrice: "",
    isDigital: false,
  });

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

  useEffect(() => {
    loadData();
    apiGet("/api/categories/all").then((list) => setCategories(list || [])).catch(() => setCategories([]));
  }, [loadData]);

  const openAdd = () => {
    setForm({ productName: "", description: "", brand: "", categoryId: "", unitPrice: "", isDigital: false });
    setSaveError("");
    setSaveMsg("");
    setShowAdd(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveMsg("");
    if (!form.productName.trim()) return setSaveError("Item name is required.");
    if (!form.categoryId) return setSaveError("Please select a category.");
    if (form.unitPrice === "" || Number(form.unitPrice) < 0) return setSaveError("Unit price is required.");
    setSaving(true);
    try {
      const created = await apiPost("/api/products/request-new", {
        productName: form.productName.trim(),
        description: form.description.trim() || null,
        brand: form.brand.trim() || null,
        categoryId: Number(form.categoryId),
        unitPrice: Number(form.unitPrice),
        currency: "INR",
        isDigital: form.isDigital,
      });
      setSaveMsg(`${created.productName} added to the catalogue — employees can now request it.`);
      setTimeout(() => { setShowAdd(false); loadData(); }, 1200);
    } catch (err) {
      setSaveError(err.message || "Could not add the item to the catalogue.");
    } finally {
      setSaving(false);
    }
  };

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

      <div className="inv-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", maxWidth: "380px", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search product, SKU or category..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <button className="inv-btn-primary-sm" onClick={openAdd} style={{ background: "#059669", whiteSpace: "nowrap" }}>
          <PlusCircle size={15} /> Add Item to Catalogue
        </button>
      </div>

      {saveMsg && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600 }}>
          <CheckCircle2 size={17} /> {saveMsg}
        </div>
      )}

      {/* Add Item modal */}
      {showAdd && (
        <div className="inv-modal-overlay">
          <div className="inv-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Add Item to Catalogue</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: "12.5px", color: "#666", margin: "-8px 0 16px" }}>
              The item is saved to the database and immediately becomes requestable by employees from the catalogue.
            </p>
            {saveError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px", fontWeight: 600 }}>
                <AlertCircle size={16} /> {saveError}
              </div>
            )}
            <form onSubmit={handleAdd} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>Item Name *</label>
                <input type="text" className="inv-form-input" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="e.g. Dell UltraSharp 27-inch Monitor" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={inputStyle}>
                    <option value="">Select category…</option>
                    {categories.filter((c) => c.active !== false).map((c) => (
                      <option key={c.id} value={c.id}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>Unit Price (₹) *</label>
                  <input type="number" min="0" step="any" className="inv-form-input" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>Brand</label>
                <input type="text" className="inv-form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Dell" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>Description / Specification</label>
                <textarea rows={3} className="inv-form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this item?" style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#333" }}>
                <input type="checkbox" checked={form.isDigital} onChange={(e) => setForm({ ...form, isDigital: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: "#059669" }} />
                Digital item (software licence / subscription)
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
                <button type="button" className="inv-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="inv-btn-primary-sm" style={{ background: "#059669" }} disabled={saving}>
                  {saving ? <><Loader2 size={15} className="login-spin" /> Saving…</> : <><PlusCircle size={15} /> Add Item</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
