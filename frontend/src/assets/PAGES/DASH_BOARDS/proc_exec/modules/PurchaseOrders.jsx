import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  X,
  Send,
  Loader2,
  AlertTriangle,
  Truck,
  IndianRupee,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const STATUS_STYLE = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  GENERATED: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  SENT: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  ACKNOWLEDGED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  PARTIALLY_RECEIVED: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  FULLY_RECEIVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  CANCELLED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
};

const PurchaseOrders = () => {
  // Resolve permissions at render time so admin grants/revocations are
  // reflected without a stale module-level snapshot.
  const canCreatePo = hasPermission("CAN_CREATE_PO");
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [preview, setPreview] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const toast = (t) => { setToastMsg(t); setTimeout(() => setToastMsg(""), 5000); };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/api/purchase-orders?page=0&size=100&sort=orderDate&direction=desc").catch(() => null);
      setPos(res?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (action, po) => {
    setBusyId(po.id);
    setError("");
    try {
      if (action === "send") await apiPost(`/api/purchase-orders/${po.id}/send`);
      if (action === "cancel") await apiPost(`/api/purchase-orders/${po.id}/cancel`);
      if (action === "close") await apiPost(`/api/purchase-orders/${po.id}/close`);
      setConfirmAction(null);
      toast(`${po.poNumber} ${action === "send" ? "sent to the vendor" : action === "cancel" ? "cancelled" : "closed"}.`);
      load();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = pos.filter((p) => {
    const text = searchTerm.toLowerCase();
    if (text && !(
      (p.poNumber || "").toLowerCase().includes(text) ||
      (p.vendorName || "").toLowerCase().includes(text) ||
      (p.requestNumber || "").toLowerCase().includes(text)
    )) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="pe-purchase-orders-container">
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <ShoppingBag color="#f8b400" /> Purchase Orders Management
          </h1>
          <p className="pe-page-subtitle">
            Purchase orders generated from approved vendor selections — send, track and close them from the database.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: "rgba(5,150,105,.12)", border: "1px solid #059669", color: "#059669", padding: "14px 20px", borderRadius: 12, marginBottom: 20, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      <div className="pe-card" style={{ marginBottom: 24, padding: "18px 24px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search PO number, vendor or request..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-form-input"
              style={{ paddingLeft: 42, height: 42 }}
            />
          </div>
          <select className="pe-form-select" style={{ width: 220, height: 42 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All PO Statuses</option>
            {Object.keys(STATUS_STYLE).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading purchase orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="pe-card" style={{ padding: 60, textAlign: "center", color: "#9aa8b8" }}>
          <ShoppingBag size={30} style={{ opacity: 0.5, marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: "#475569" }}>No purchase orders found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{canCreatePo ? "Generate a PO from an approved vendor selection." : "No purchase orders have been generated."}</div>
        </div>
      ) : (
        <div className="pe-card">
          <div className="pe-table-container">
            <table className="pe-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Req Reference</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po) => {
                  const s = STATUS_STYLE[po.status] || STATUS_STYLE.DRAFT;
                  const busy = busyId === po.id;
                  return (
                    <tr key={po.id}>
                      <td style={{ fontWeight: 800, color: "#d97706" }}>{po.poNumber}</td>
                      <td style={{ color: "#666", fontSize: 13 }}>{po.requestNumber}</td>
                      <td style={{ fontWeight: 700, color: "#111" }}>{po.vendorName}</td>
                      <td style={{ fontWeight: 800, color: "#059669" }}>{formatINR(po.grandTotal)}</td>
                      <td style={{ color: "#555" }}>{formatDateIN(po.expectedDeliveryDate, { withTime: false })}</td>
                      <td><span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>{po.status}</span></td>
                      <td style={{ color: "#666", fontSize: 13 }}>{formatDateIN(po.orderDate, { withTime: false })}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                          {po.status === "DRAFT" || po.status === "GENERATED" ? (
                            <button className="pe-btn-primary-sm" style={{ padding: "6px 12px", fontSize: 12 }} disabled={busy} onClick={() => setConfirmAction({ action: "send", po })}>
                              {busy ? <Loader2 size={13} className="login-spin" /> : <Send size={13} />} Send PO
                            </button>
                          ) : po.status === "FULLY_RECEIVED" ? (
                            <button className="pe-btn-primary-sm" style={{ padding: "6px 12px", fontSize: 12, background: "#059669" }} disabled={busy} onClick={() => setConfirmAction({ action: "close", po })}>
                              <CheckCircle2 size={13} /> Close PO
                            </button>
                          ) : (po.status === "SENT" || po.status === "ACKNOWLEDGED" || po.status === "PARTIALLY_RECEIVED") && (
                            <button className="pe-btn-primary-sm" style={{ padding: "6px 12px", fontSize: 12, background: "#fff", color: "#dc2626", border: "1px solid #dc2626" }} disabled={busy} onClick={() => setConfirmAction({ action: "cancel", po })}>
                              <X size={13} /> Cancel
                            </button>
                          )}
                          <button className="pe-sidebar-toggle" style={{ width: 32, height: 32, display: "inline-flex" }} title="View PO Details" onClick={() => setPreview(po)}>
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm action modal */}
      {confirmAction && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: 460, textAlign: "center" }}>
            <AlertTriangle size={44} color={confirmAction.action === "cancel" ? "#dc2626" : "#059669"} style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: 18, color: "#111", fontWeight: 800 }}>
              {confirmAction.action === "send" ? "Send Purchase Order" : confirmAction.action === "cancel" ? "Cancel Purchase Order" : "Close Purchase Order"}
            </h3>
            <p style={{ color: "#666", fontSize: 13.5, margin: "10px 0 20px" }}>
              {confirmAction.action === "send" && `Transmit ${confirmAction.po.poNumber} (${formatINR(confirmAction.po.grandTotal)}) to ${confirmAction.po.vendorName}?`}
              {confirmAction.action === "cancel" && `Are you sure you want to cancel ${confirmAction.po.poNumber}? This cannot be undone.`}
              {confirmAction.action === "close" && `Close ${confirmAction.po.poNumber} after full receipt?`}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="pe-btn-primary-sm" style={{ background: confirmAction.action === "cancel" ? "#dc2626" : "#059669" }} disabled={busyId === confirmAction.po.id} onClick={() => runAction(confirmAction.action, confirmAction.po)}>
                {busyId === confirmAction.po.id ? <Loader2 size={15} className="login-spin" /> : "Yes, Continue"}
              </button>
              <button className="pe-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setConfirmAction(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PO detail modal */}
      {preview && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800 }}>PURCHASE ORDER DETAILS</span>
                <h3 style={{ fontSize: 18, color: "#111", fontWeight: 800, margin: "2px 0 0" }}>{preview.poNumber}</h3>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ background: "rgba(5,150,105,.08)", border: "1px solid #059669", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, color: "#059669", fontWeight: 800, textTransform: "uppercase" }}>PO STATUS</span>
                <p style={{ fontSize: 16, color: "#111", fontWeight: 800, margin: "2px 0 0" }}>{preview.status}</p>
              </div>
              <Truck size={22} color="#059669" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8f9fb", padding: 14, borderRadius: 10, border: "1px solid #ececec", fontSize: 13 }}>
              <div><span style={{ fontSize: 11, color: "#666" }}>Vendor</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{preview.vendorName}</p></div>
              <div><span style={{ fontSize: 11, color: "#666" }}>Request</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{preview.requestNumber}</p></div>
              <div><span style={{ fontSize: 11, color: "#666" }}>Total Amount</span><p style={{ fontWeight: 800, color: "#059669", fontSize: 16, margin: "2px 0 0" }}>{formatINR(preview.grandTotal)}</p></div>
              <div><span style={{ fontSize: 11, color: "#666" }}>Payment Terms</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{preview.paymentTerms || "—"}</p></div>
              <div><span style={{ fontSize: 11, color: "#666" }}>Expected Delivery</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{formatDateIN(preview.expectedDeliveryDate, { withTime: false })}</p></div>
              <div><span style={{ fontSize: 11, color: "#666" }}>Order Date</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{formatDateIN(preview.orderDate, { withTime: false })}</p></div>
              {preview.deliveryAddress && (
                <div style={{ gridColumn: "1 / -1" }}><span style={{ fontSize: 11, color: "#666" }}>Delivery Address</span><p style={{ fontWeight: 600, color: "#111", margin: "2px 0 0" }}>{preview.deliveryAddress}</p></div>
              )}
              {preview.remarks && (
                <div style={{ gridColumn: "1 / -1" }}><span style={{ fontSize: 11, color: "#666" }}>Remarks</span><p style={{ fontWeight: 600, color: "#111", margin: "2px 0 0", fontStyle: "italic" }}>"{preview.remarks}"</p></div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button className="pe-btn-primary-sm" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
