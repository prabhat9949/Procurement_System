import React, { useState, useEffect, useCallback } from "react";
import { Truck, CheckCircle2, Loader2, WifiOff, PackageCheck, Clock } from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const VendorDeliveryTracking = () => {
  const [pos, setPos] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [poPage, del] = await Promise.all([
        apiGet("/api/vendor/my/purchase-orders?page=0&size=100&sort=orderDate&direction=desc").catch(() => null),
        apiGet("/api/vendor/my/deliveries").catch(() => null),
      ]);
      setPos(poPage?.content || []);
      setDeliveries(del || []);
    } catch (err) {
      setError(err.message || "Unable to load delivery tracking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const grnByPo = {};
  deliveries.forEach((d) => { grnByPo[d.purchaseOrderId] = d; });

  const activePos = pos.filter((p) => !["CANCELLED", "CLOSED"].includes(p.status));

  return (
    <div style={{ padding: "20px" }}>
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Truck color="#f8b400" /> Delivery Tracking
          </h1>
          <p className="vnd-page-subtitle">Your purchase orders, expected delivery dates and warehouse receipt status — live from the database.</p>
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
          <Loader2 size={22} className="login-spin" /> Loading delivery data...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>ACTIVE POs</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{activePos.length}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>AWAITING DELIVERY</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#2563eb", margin: "4px 0" }}>{activePos.filter((p) => ["SENT", "ACKNOWLEDGED"].includes(p.status)).length}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>RECEIVED BY WAREHOUSE</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{activePos.filter((p) => ["PARTIALLY_RECEIVED", "FULLY_RECEIVED"].includes(p.status)).length}</p>
            </div>
            <div className="vnd-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>GRNs RECORDED</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{deliveries.length}</p>
            </div>
          </div>

          {activePos.length === 0 ? (
            <div className="vnd-card" style={{ textAlign: "center", padding: "48px" }}>
              <PackageCheck size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>No Active Deliveries</h3>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No deliveries are currently in progress for your vendor account.</p>
            </div>
          ) : (
            <div className="vnd-card" style={{ overflow: "hidden" }}>
              <div className="vnd-table-container">
                <table className="vnd-table">
                  <thead>
                    <tr>
                      <th>PO</th><th>PO Value</th><th>Expected Delivery</th><th>Status</th><th>GRN</th><th>Receipt Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePos.map((p) => {
                      const grn = grnByPo[p.id];
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{p.poNumber}</td>
                          <td style={{ fontWeight: "700" }}>{formatINR(p.grandTotal)}</td>
                          <td style={{ fontSize: "13px" }}>{formatDateIN(p.expectedDeliveryDate, { withTime: false })}</td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: ["PARTIALLY_RECEIVED", "FULLY_RECEIVED"].includes(p.status) ? "rgba(5,150,105,.12)" : "rgba(37,99,235,.12)", color: ["PARTIALLY_RECEIVED", "FULLY_RECEIVED"].includes(p.status) ? "#059669" : "#2563eb" }}>
                              {["PARTIALLY_RECEIVED", "FULLY_RECEIVED"].includes(p.status) && <CheckCircle2 size={12} />}
                              {["SENT", "ACKNOWLEDGED"].includes(p.status) && <Clock size={12} />}
                              {p.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: grn ? "#059669" : "#999", fontWeight: grn ? 700 : 400 }}>{grn?.grnNumber || "—"}</td>
                          <td style={{ fontSize: "13px" }}>{grn ? formatDateIN(grn.receiptDate, { withTime: false }) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorDeliveryTracking;
