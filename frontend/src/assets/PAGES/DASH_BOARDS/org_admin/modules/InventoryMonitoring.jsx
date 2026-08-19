import React, { useState, useEffect, useCallback } from "react";
import {
  Boxes,
  Warehouse,
  ClipboardList,
  IndianRupee,
  RefreshCw,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  History,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const countFormat = new Intl.NumberFormat("en-IN");
const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const InventoryMonitoring = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "",
    warehouseId: "",
    status: "",
    lowStock: "",
    outOfStock: "",
  });
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetail, setItemDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [kpis, setKpis] = useState({ totalProducts: 0, totalAvailable: 0, totalAllocated: 0, totalReserved: 0, totalIssued: 0, lowStock: 0, outOfStock: 0 });

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Load categories
  useEffect(() => {
    let mounted = true;
    apiGet("/api/categories/all")
      .then((data) => mounted && setCategories(data || []))
      .catch(() => mounted && setCategories([]));
    return () => { mounted = false; };
  }, []);

  // Load warehouses
  useEffect(() => {
    let mounted = true;
    apiGet("/api/warehouses?page=0&size=100")
      .then((data) => mounted && setWarehouses(data?.content || []))
      .catch(() => mounted && setWarehouses([]));
    return () => { mounted = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size), sort: "lastStockUpdate", direction: "desc" });
      if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.warehouseId) params.set("warehouseId", filters.warehouseId);
      if (filters.status) params.set("status", filters.status);
      if (filters.lowStock) params.set("lowStock", filters.lowStock);
      if (filters.outOfStock) params.set("outOfStock", filters.outOfStock);
      const data = await apiGet(`/api/inventory?${params.toString()}`);
      setRows(data?.content || []);
      setTotal(data?.totalElements || 0);

      // Calculate KPIs
      const content = data?.content || [];
      const totalAvailable = content.reduce((sum, item) => sum + (Number(item.availableQuantity) || 0), 0);
      const totalAllocated = content.reduce((sum, item) => sum + (Number(item.allocatedQuantity) || 0), 0);
      const totalReserved = content.reduce((sum, item) => sum + (Number(item.reservedQuantity) || 0), 0);
      const totalIssued = content.reduce((sum, item) => sum + (Number(item.issuedQuantity) || 0), 0);
      const lowStockCount = content.filter((item) => item.status === "LOW_STOCK" || item.status === "CRITICAL").length;
      const outOfStockCount = content.filter((item) => item.status === "OUT_OF_STOCK").length;
      setKpis({
        totalProducts: data?.totalElements || 0,
        totalAvailable,
        totalAllocated,
        totalReserved,
        totalIssued,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      });
    } catch (err) {
      setError(err.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const resetPage = () => setPage(0);

  const openItem = async (item) => {
    setSelectedItem(item);
    setItemDetail(null);
    setMovements([]);
    setDetailLoading(true);
    setMovementsLoading(true);
    try {
      const detail = await apiGet(`/api/inventory/${item.id}`);
      setItemDetail(detail);
    } catch (err) {
      triggerToast(err.message || "Failed to load inventory detail.", "error");
    } finally {
      setDetailLoading(false);
    }
    try {
      const txData = await apiGet(`/api/inventory/transactions/product/${item.id}`);
      setMovements(txData || []);
    } catch {
      setMovements([]);
    } finally {
      setMovementsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div style={{ padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1200, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
            <Boxes color="#0891b2" size={28} /> Inventory Monitoring
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Complete inventory visibility across all warehouses — stock levels, movements and values from the live database.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? "login-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <KpiCard label="Total Products" value={kpis.totalProducts} icon={Boxes} color="#0891b2" />
        <KpiCard label="Available Stock" value={kpis.totalAvailable} icon={ClipboardList} color="#059669" />
        <KpiCard label="Allocated" value={kpis.totalAllocated} icon={Warehouse} color="#2563eb" />
        <KpiCard label="Reserved" value={kpis.totalReserved} icon={Warehouse} color="#7c3aed" />
        <KpiCard label="Issued" value={kpis.totalIssued} icon={ClipboardList} color="#d97706" />
        <KpiCard label="Low Stock" value={kpis.lowStock} icon={AlertCircle} color="#dc2626" />
        <KpiCard label="Out of Stock" value={kpis.outOfStock} icon={AlertCircle} color="#dc2626" />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", border: "1px solid #dbe2ea", borderRadius: 9, padding: "8px 12px", background: "#f8f9fb", flex: "1 1 240px" }}>
            <Search size={15} color="#68778a" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); resetPage(); }}
              placeholder="Search product, SKU..."
              style={{ border: 0, outline: 0, background: "transparent", fontSize: "13.5px", minWidth: 180, width: "100%" }}
            />
            {keyword && <X size={14} onClick={() => { setKeyword(""); resetPage(); }} style={{ cursor: "pointer" }} />}
          </div>
          <select value={filters.categoryId} onChange={(e) => { setFilters((f) => ({ ...f, categoryId: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px", minWidth: 150 }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
          </select>
          <select value={filters.warehouseId} onChange={(e) => { setFilters((f) => ({ ...f, warehouseId: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px", minWidth: 150 }}>
            <option value="">All Warehouses</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px", minWidth: 150 }}>
            <option value="">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
            <Loader2 size={20} className="login-spin" /> Loading inventory...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>No inventory records match the current filters.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Product</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>SKU</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Category</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Warehouse</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Available</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Allocated</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Reserved</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Issued</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Value</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: "#111", fontSize: "13px" }}>{item.productName || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{item.productSku || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{item.categoryName || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{item.warehouseName || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, textAlign: "right" }}>{(Number(item.availableQuantity) || 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", textAlign: "right" }}>{(Number(item.allocatedQuantity) || 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", textAlign: "right" }}>{(Number(item.reservedQuantity) || 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", textAlign: "right" }}>{(Number(item.issuedQuantity) || 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, textAlign: "right" }}>{item.inventoryValue != null ? moneyFormat.format(item.inventoryValue) : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", background: item.status === "IN_STOCK" ? "rgba(5,150,105,.12)" : /LOW|CRITICAL|OUT/i.test(item.status || "") ? "rgba(220,38,38,.12)" : "#fffbeb", color: item.status === "IN_STOCK" ? "#059669" : /LOW|CRITICAL|OUT/i.test(item.status || "") ? "#dc2626" : "#b45309" }}>{item.status || "OK"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }} onClick={() => openItem(item)} title="View detail">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "10px" }}>
        <span style={{ color: "#888", fontSize: "13" }}>
          Page {page + 1} of {totalPages} · {countFormat.format(total)} items
        </span>
        <div style={{ display: "flex", gap: "8" }}>
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d9d9d9", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1, fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ChevronLeft size={15} /> Prev
          </button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d9d9d9", background: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.5 : 1, fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Inventory Detail Drawer */}
      {selectedItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.45)", backdropFilter: "blur(3px)", zIndex: 400, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: "#fff", width: "min(600px, 100%)", height: "100%", overflowY: "auto", padding: "26px 26px 40px", boxShadow: "-8px 0 30px rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111" }}>Inventory Item Detail</h2>
              <button onClick={() => { setSelectedItem(null); setItemDetail(null); setMovements([]); }} style={{ border: "none", background: "#f1f3f5", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
            </div>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 18px" }}>{itemDetail?.productName || selectedItem.productName} · live from the database</p>

            {detailLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px", color: "#666" }}>
                <Loader2 size={20} className="login-spin" /> Loading item detail...
              </div>
            ) : itemDetail ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  <InfoBox label="Product" value={itemDetail.productName} />
                  <InfoBox label="SKU" value={itemDetail.productSku} />
                  <InfoBox label="Category" value={itemDetail.categoryName} />
                  <InfoBox label="Warehouse" value={itemDetail.warehouseName} />
                  <InfoBox label="Location" value={itemDetail.location || "—"} />
                  <InfoBox label="Department" value={itemDetail.departmentName || "—"} />
                  <InfoBox label="Available Qty" value={Number(itemDetail.availableQuantity || 0).toLocaleString()} />
                  <InfoBox label="Allocated Qty" value={Number(itemDetail.allocatedQuantity || 0).toLocaleString()} />
                  <InfoBox label="Reserved Qty" value={Number(itemDetail.reservedQuantity || 0).toLocaleString()} />
                  <InfoBox label="Issued Qty" value={Number(itemDetail.issuedQuantity || 0).toLocaleString()} />
                  <InfoBox label="Reorder Level" value={itemDetail.reorderLevel ?? "—"} />
                  <InfoBox label="Status" value={itemDetail.status} />
                  <InfoBox label="Inventory Value" value={itemDetail.inventoryValue != null ? moneyFormat.format(itemDetail.inventoryValue) : "—"} />
                  <InfoBox label="Last Updated" value={formatDateIN(itemDetail.lastStockUpdate)} />
                </div>

                {/* Movement History */}
                <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#111" }}>Movement History</h4>
                {movementsLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "20px", color: "#666" }}>
                    <Loader2 size={18} className="login-spin" /> Loading movements...
                  </div>
                ) : movements.length === 0 ? (
                  <p style={{ color: "#888", fontSize: 13 }}>No movement history recorded.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Type", "Qty", "Prev. Qty", "New Qty", "Reference", "Performed By", "Timestamp", "Reason"].map((h) => (
                            <th key={h} style={{ textAlign: "left", color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: ".3px", padding: "8px 6px", borderBottom: "1px solid #e7edf3" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((tx) => (
                          <tr key={tx.id} style={{ borderBottom: "1px solid #f2f4f6" }}>
                            <td style={{ padding: "9px 6px", fontSize: 12.5, fontWeight: 600 }}>{tx.transactionType || "Movement"}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12.5, textAlign: "center" }}>{tx.quantityChanged ?? "—"}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12.5, textAlign: "center" }}>{tx.previousQuantity ?? "—"}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12.5, textAlign: "center" }}>{tx.newQuantity ?? "—"}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{tx.transactionNumber || tx.referenceNumber || "—"}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{tx.performedByName || "—"}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12, whiteSpace: "nowrap", color: "#888" }}>{formatDateIN(tx.createdAt)}</td>
                            <td style={{ padding: "9px 6px", fontSize: 12.5, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.reason || tx.remarks || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: "#be123c", fontWeight: 600 }}>Unable to load item detail.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}14`, color: color, flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{countFormat.format(value ?? 0)}</div>
        <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{label}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: "#f8f9fb", border: "1px solid #ececec", borderRadius: 9, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px", color: "#888", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>{value || "—"}</div>
    </div>
  );
}

export default InventoryMonitoring;