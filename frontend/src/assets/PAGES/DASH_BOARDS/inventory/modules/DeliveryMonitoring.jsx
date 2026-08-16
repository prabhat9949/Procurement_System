import React, { useState, useEffect, useCallback } from "react";
import { Clock, Search, Loader2, WifiOff, Truck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const DeliveryMonitoring = () => {
  const [pos, setPos] = useState([]);
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [poPage, grnPage] = await Promise.all([
        apiGet("/api/purchase-orders?page=0&size=100&sort=orderDate&direction=desc").catch(() => null),
        apiGet("/api/goods-receipts?page=0&size=100").catch(() => null),
      ]);
      setPos(poPage?.content || []);
      setGrns(grnPage?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load delivery monitoring data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const grnByPo = {};
  grns.forEach((g) => { grnByPo[g.purchaseOrderId] = g; });

  const rows = pos.map((p) => {
    const grn = grnByPo[p.purchaseOrderId || p.id];
    const overdue = ["SENT", "ACKNOWLEDGED"].includes(p.status) && p.expectedDeliveryDate && new Date(p.expectedDeliveryDate) < new Date();
    return { ...p, grn, overdue };
  });

  const filtered = rows.filter((p) => {
    const s = search.toLowerCase();
    const matchSearch = !s || (p.poNumber || "").toLowerCase().includes(s) || (p.vendorName || "").toLowerCase().includes(s);
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const overdueCount = rows.filter((p) => p.overdue).length;
  const deliveredCount = rows.filter((p) => ["PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED"].includes(p.status)).length;

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock color="#f8b400" /> Delivery Monitoring
          </h1>
          <p className="inv-page-subtitle">Expected deliveries, overdue flags and receipt status — live from the database.</p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>PURCHASE ORDERS</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{rows.length}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>AWAITING DELIVERY</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{rows.filter((p) => ["SENT", "ACKNOWLEDGED"].includes(p.status)).length}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>OVERDUE</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#dc2626", margin: "4px 0" }}>{overdueCount}</p>
        </div>
        <div className="inv-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>RECEIVED / CLOSED</span>
          <p style={{ fontSize: "24px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{deliveredCount}</p>
        </div>
      </div>

      <div className="inv-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search PO or vendor..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "220px" }}>
          <option value="">All statuses</option>
          {["SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading delivery data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="inv-card" style={{ textAlign: "center", padding: "48px" }}>
          <Truck size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Deliveries</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No purchase order deliveries are currently tracked.</p>
        </div>
      ) : (
        <div className="inv-card" style={{ overflow: "hidden" }}>
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>PO</th><th>Vendor</th><th>Value</th><th>Expected Delivery</th><th>GRN</th><th>Status</th><th>Overdue</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{p.poNumber}</td>
                    <td style={{ fontWeight: 600 }}>{p.vendorName}</td>
                    <td style={{ fontWeight: "700" }}>{formatINR(p.grandTotal)}</td>
                    <td style={{ fontSize: "13px" }}>{formatDateIN(p.expectedDeliveryDate, { withTime: false })}</td>
                    <td style={{ fontSize: "13px", color: p.grn ? "#059669" : "#999" }}>{p.grn?.grnNumber || "—"}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: ["PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED"].includes(p.status) ? "rgba(5,150,105,.12)" : p.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: ["PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED"].includes(p.status) ? "#059669" : p.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{p.status}</span></td>
                    <td>
                      {p.overdue ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "800", color: "#dc2626" }}><AlertTriangle size={13} /> OVERDUE</span>
                      ) : ["FULLY_RECEIVED", "CLOSED"].includes(p.status) ? (
                        <CheckCircle2 size={15} color="#059669" />
                      ) : (
                        <span style={{ fontSize: "11px", color: "#999" }}>—</span>
                      )}
                    </td>
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

export default DeliveryMonitoring;
