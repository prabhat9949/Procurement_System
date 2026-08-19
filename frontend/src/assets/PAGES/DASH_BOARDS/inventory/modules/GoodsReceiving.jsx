import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  CheckCircle2,
  X,
  Search,
  AlertTriangle,
  Layers,
  FileText,
  Loader2,
  WifiOff,
  PackageCheck,
  IndianRupee,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const grnStatusLabel = (s) => ({
  DRAFT: "Draft", RECEIVING: "Receiving", PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received", UNDER_INSPECTION: "Under Inspection", COMPLETED: "Completed",
  REJECTED: "Rejected", CANCELLED: "Cancelled",
}[s] || s);

const GoodsReceiving = () => {
  const [pos, setPos] = useState([]);
  const [grns, setGrns] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showReceive, setShowReceive] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [poLines, setPoLines] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [grnForm, setGrnForm] = useState({ warehouseId: "", receiptDate: "", invoiceReference: "", vehicleNumber: "", transporterName: "", remarks: "" });
  const [lineQty, setLineQty] = useState({});

  const triggerToast = (m) => { setToast(m); setTimeout(() => setToast(""), 5000); };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [poPage, grnPage, whPage] = await Promise.all([
        apiGet("/api/purchase-orders?page=0&size=50&sort=orderDate&direction=desc").catch(() => null),
        apiGet("/api/goods-receipts?page=0&size=50").catch(() => null),
        apiGet("/api/warehouses?page=0&size=50").catch(() => null),
      ]);
      setPos(poPage?.content || []);
      setGrns(grnPage?.content || []);
      setWarehouses(whPage?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load receiving queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Deliveries awaiting warehouse receipt = PO sent/acknowledged/partially received.
  const receivingQueue = pos.filter((p) => ["SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED"].includes(p.status));

  const openReceive = async (po) => {
    setSelectedPo(po);
    setGrnForm({ warehouseId: "", receiptDate: new Date().toISOString().slice(0, 10), invoiceReference: "", vehicleNumber: "", transporterName: "", remarks: "" });
    setLineQty({});
    setShowReceive(true);
    try {
      const lines = await apiGet(`/api/purchase-order-lines?purchaseOrderId=${po.id}&page=0&size=50`).catch(() => null);
      const ls = lines?.content || [];
      setPoLines(ls);
      const initial = {};
      ls.forEach((l) => { initial[l.id] = String(l.quantityOrdered || 0); });
      setLineQty(initial);
    } catch { setPoLines([]); }
  };

  const submitReceiving = async (e) => {
    e.preventDefault();
    if (!grnForm.warehouseId) { setError("Please select the receiving warehouse."); return; }
    setBusy(true);
    setError("");
    try {
      // 1. Create the GRN header.
      const grn = await apiPost("/api/goods-receipts", {
        purchaseOrderId: selectedPo.id,
        warehouseId: Number(grnForm.warehouseId),
        receiptDate: grnForm.receiptDate,
        invoiceReference: grnForm.invoiceReference.trim() || null,
        vehicleNumber: grnForm.vehicleNumber.trim() || null,
        transporterName: grnForm.transporterName.trim() || null,
        remarks: grnForm.remarks.trim() || null,
      });
      // 2. Add one line per PO line with the entered received quantity.
      for (const l of poLines) {
        const received = parseFloat(lineQty[l.id]) || 0;
        if (received <= 0) continue;
        await apiPost(`/api/goods-receipts/${grn.id}/lines`, {
          purchaseOrderLineId: l.id,
          receivedQuantity: received,
          acceptedQuantity: received,
          rejectedQuantity: 0,
          damagedQuantity: 0,
          storageLocation: null,
          batchNumber: null,
          serialNumber: null,
          remarks: null,
        });
      }
      // 3. Complete the GRN.
      await apiPost(`/api/goods-receipts/${grn.id}/complete`);
      setShowReceive(false);
      triggerToast(`GRN ${grn.grnNumber} created and completed — inventory updated.`);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to record the receipt.");
    } finally {
      setBusy(false);
    }
  };

  const filteredQueue = receivingQueue.filter((p) => {
    const s = search.toLowerCase();
    return !s || (p.poNumber || "").toLowerCase().includes(s) || (p.vendorName || "").toLowerCase().includes(s) || (p.requestNumber || "").toLowerCase().includes(s);
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };
  const labelStyle = { display: "block", fontSize: "12.5px", fontWeight: "700", color: "#374151", marginBottom: "6px" };

  return (
    <div style={{ padding: "20px" }}>
      <div className="inv-page-header">
        <div>
          <h1 className="inv-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Truck color="#f8b400" /> Goods Receiving
          </h1>
          <p className="inv-page-subtitle">Receive vendor deliveries, verify quantities and create GRNs — live from the database.</p>
        </div>
      </div>

      {toast && (
        <div style={{ background: "rgba(5, 150, 105, 0.12)", border: "1px solid #059669", color: "#059669", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

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
          <input type="text" placeholder="Search PO or vendor..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading receiving queue...
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>DELIVERIES AWAITING RECEIPT</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#d97706", margin: "4px 0" }}>{receivingQueue.length}</p>
            </div>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>GRNs RECORDED</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#111", margin: "4px 0" }}>{grns.length}</p>
            </div>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>GRNs COMPLETED</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#059669", margin: "4px 0" }}>{grns.filter((g) => g.status === "COMPLETED" || g.status === "RECEIVED").length}</p>
            </div>
            <div className="inv-card" style={{ padding: "18px" }}>
              <span style={{ fontSize: "12px", color: "#666", fontWeight: "700" }}>WAREHOUSES</span>
              <p style={{ fontSize: "24px", fontWeight: "800", color: "#7c3aed", margin: "4px 0" }}>{warehouses.length}</p>
            </div>
          </div>

          <div className="inv-card" style={{ overflow: "hidden", marginBottom: "24px" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={16} color="#f8b400" /> Receiving Queue
            </h4>
            <div className="inv-table-container">
              <table className="inv-table">
                <thead>
                  <tr><th>PO</th><th>PR</th><th>Vendor</th><th>PO Value</th><th>Expected Delivery</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr>
                </thead>
                <tbody>
                  {filteredQueue.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#666" }}>No deliveries are currently awaiting warehouse receipt.</td></tr>
                  ) : filteredQueue.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{p.poNumber}</td>
                      <td style={{ fontSize: "13px", color: "#666" }}>{p.requestNumber || "—"}</td>
                      <td style={{ fontWeight: 600 }}>{p.vendorName}</td>
                      <td style={{ fontWeight: "700" }}>{formatINR(p.grandTotal)}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(p.expectedDeliveryDate, { withTime: false })}</td>
                      <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: "rgba(217,119,6,.12)", color: "#d97706" }}>{p.status}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <button className="inv-btn-primary-sm" onClick={() => openReceive(p)}><PackageCheck size={14} /> Receive</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="inv-card" style={{ overflow: "hidden" }}>
            <h4 style={{ padding: "16px 20px", fontSize: "15px", fontWeight: "700", color: "#111", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={16} color="#059669" /> Recent GRNs
            </h4>
            <div className="inv-table-container">
              <table className="inv-table">
                <thead>
                  <tr><th>GRN</th><th>PO</th><th>Vendor</th><th>Warehouse</th><th>Receipt Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {grns.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#666" }}>No GRNs are currently pending.</td></tr>
                  ) : grns.slice(0, 15).map((g) => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: "800", color: "#059669", whiteSpace: "nowrap" }}>{g.grnNumber}</td>
                      <td style={{ fontSize: "13px" }}>{g.poNumber}</td>
                      <td style={{ fontSize: "13px" }}>{g.vendorName}</td>
                      <td style={{ fontSize: "13px" }}>{g.warehouseName}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateIN(g.receiptDate, { withTime: false })}</td>
                      <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: (g.status === "COMPLETED" || g.status === "RECEIVED") ? "rgba(5,150,105,.12)" : g.status === "REJECTED" || g.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: (g.status === "COMPLETED" || g.status === "RECEIVED") ? "#059669" : g.status === "REJECTED" || g.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{grnStatusLabel(g.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* RECEIVE DELIVERY MODAL */}
      {showReceive && selectedPo && (
        <div className="inv-modal-overlay">
          <div className="inv-modal" style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #ececec", background: "#fafafa" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>RECEIVE DELIVERY</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>{selectedPo.poNumber} — {selectedPo.vendorName}</h3>
              </div>
              <button onClick={() => setShowReceive(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={submitReceiving} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                <div>
                  <label className="inv-form-label">Warehouse *</label>
                  <select style={inputStyle} value={grnForm.warehouseId} onChange={(e) => setGrnForm({ ...grnForm, warehouseId: e.target.value })} required>
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.warehouseName} ({w.warehouseCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inv-form-label">Receipt Date *</label>
                  <input type="date" style={inputStyle} value={grnForm.receiptDate} onChange={(e) => setGrnForm({ ...grnForm, receiptDate: e.target.value })} required />
                </div>
                <div>
                  <label className="inv-form-label">Invoice Reference</label>
                  <input style={inputStyle} value={grnForm.invoiceReference} onChange={(e) => setGrnForm({ ...grnForm, invoiceReference: e.target.value })} />
                </div>
                <div>
                  <label className="inv-form-label">Vehicle Number</label>
                  <input style={inputStyle} value={grnForm.vehicleNumber} onChange={(e) => setGrnForm({ ...grnForm, vehicleNumber: e.target.value })} />
                </div>
                <div>
                  <label className="inv-form-label">Transporter</label>
                  <input style={inputStyle} value={grnForm.transporterName} onChange={(e) => setGrnForm({ ...grnForm, transporterName: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="inv-form-label">Remarks</label>
                  <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={grnForm.remarks} onChange={(e) => setGrnForm({ ...grnForm, remarks: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="inv-form-label">Received Quantities (enter the ACTUAL quantity received for each line)</label>
                {poLines.length === 0 ? (
                  <p style={{ color: "#888", fontSize: "13px" }}>No line items found for this PO.</p>
                ) : poLines.map((l) => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", background: "#f8f9fb", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ececec" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{l.productName}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>Ordered: {Number(l.quantityOrdered)} · Unit: {formatINR(l.unitPrice)}</div>
                    </div>
                    <input type="number" min="0" step="any" required style={{ ...inputStyle, width: "120px" }} value={lineQty[l.id] || ""}
                      placeholder="Received qty"
                      onChange={(e) => setLineQty((q) => ({ ...q, [l.id]: e.target.value }))} />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "12px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px" }}>
                <AlertTriangle size={16} /> Enter the actual received quantity. If it differs from the ordered quantity, the system preserves both and records the difference.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="inv-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowReceive(false)}>Cancel</button>
                <button type="submit" className="inv-btn-primary-sm" disabled={busy} style={{ opacity: busy ? 0.7 : 1 }}>
                  {busy ? <><Loader2 size={15} className="login-spin" /> Creating GRN...</> : <><PackageCheck size={15} /> Create GRN & Update Stock</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsReceiving;
