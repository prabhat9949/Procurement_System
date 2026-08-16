import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  Eye,
  X,
  CheckCircle2,
  IndianRupee,
  Loader2,
  WifiOff,
  Send,
  Ban,
  Lock,
  FileText,
  RefreshCw,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) =>
  ({
    DRAFT: "Draft",
    GENERATED: "Generated",
    SENT: "Sent to Vendor",
    ACKNOWLEDGED: "Acknowledged",
    PARTIALLY_RECEIVED: "Partially Received",
    FULLY_RECEIVED: "Fully Received",
    CANCELLED: "Cancelled",
    CLOSED: "Closed",
  }[s] || s);

const statusColor = (s) => {
  if (["FULLY_RECEIVED", "CLOSED"].includes(s)) return "#059669";
  if (s === "CANCELLED") return "#dc2626";
  if (["GENERATED", "SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED"].includes(s)) return "#2563eb";
  return "#64748b";
};

const canSend = (s) => s === "GENERATED";
const canCancel = (s) => !["CANCELLED", "CLOSED"].includes(s);
const canClose = (s) => s === "FULLY_RECEIVED";

const PoApprovals = () => {
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/purchase-orders?page=0&size=100&sort=orderDate&direction=desc");
      setPoList(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = poList.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (p.poNumber || "").toLowerCase().includes(q) ||
      (p.vendorName || "").toLowerCase().includes(q) ||
      (p.requestNumber || "").toLowerCase().includes(q);
    const matchesTab =
      activeTabFilter === "all" ||
      (activeTabFilter === "pending" && ["DRAFT", "GENERATED", "SENT", "ACKNOWLEDGED"].includes(p.status)) ||
      (activeTabFilter === "received" && ["PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED"].includes(p.status)) ||
      (activeTabFilter === "cancelled" && p.status === "CANCELLED");
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: poList.length,
    pending: poList.filter((p) => ["DRAFT", "GENERATED", "SENT", "ACKNOWLEDGED"].includes(p.status)).length,
    received: poList.filter((p) => ["PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CLOSED"].includes(p.status)).length,
    cancelled: poList.filter((p) => p.status === "CANCELLED").length,
  };

  const openDetail = async (po) => {
    setSelected(po);
    setSelectedLines([]);
    setSelectedHistory([]);
    try {
      const [linesPage, histPage] = await Promise.all([
        apiGet(`/api/purchase-orders/${po.id}/lines?page=0&size=50`).catch(() => null),
        apiGet(`/api/purchase-orders/${po.id}/history?page=0&size=50`).catch(() => null),
      ]);
      setSelectedLines(linesPage?.content || []);
      setSelectedHistory(histPage?.content || []);
    } catch { /* non-fatal */ }
  };

  const action = async (po, act) => {
    setBusy(true);
    setError("");
    try {
      await apiPost(`/api/purchase-orders/${po.id}/${act}`);
      triggerToast(`PO ${po.poNumber} ${act === "send" ? "sent to vendor" : act === "cancel" ? "cancelled" : "closed"}.`);
      setSelected(null);
      loadData();
    } catch (err) {
      setError(err.message || `Unable to ${act} the purchase order.`);
    } finally {
      setBusy(false);
    }
  };

  const tabBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setActiveTabFilter(key)}
      style={{
        padding: "6px 14px",
        borderRadius: "8px",
        border: "none",
        background: activeTabFilter === key ? "#f8b400" : "transparent",
        color: activeTabFilter === key ? "#000" : "#555",
        fontWeight: activeTabFilter === key ? "700" : "600",
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      {label} ({counts[key]})
    </button>
  );

  return (
    <div className="pman-po-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <ShieldCheck color="#f8b400" /> Purchase Order Management
          </h1>
          <p className="pman-page-subtitle">
            Live purchase orders — send to vendor, track acknowledgement, delivery and closure. Financial figures from the backend.
          </p>
        </div>
        <button className="pman-btn-primary-sm" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0" }}>
          <CheckCircle2 size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search PO number, vendor, request..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>
          <div style={{ display: "flex", background: "#f8f9fb", padding: "3px", borderRadius: "10px", border: "1px solid #d9d9d9" }}>
            {tabBtn("all", "All")}
            {tabBtn("pending", "Pending")}
            {tabBtn("received", "Received")}
            {tabBtn("cancelled", "Cancelled")}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pman-card">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
            <Loader2 size={20} className="login-spin" /> Loading purchase orders…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
            <FileText size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
            <p style={{ fontWeight: 600 }}>No purchase orders found.</p>
            <p style={{ fontSize: "13px" }}>No purchase orders match the current filter.</p>
          </div>
        ) : (
          <div className="pman-table-container">
            <table className="pman-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Request</th>
                  <th>Order Date</th>
                  <th>Expected Delivery</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: "#d97706" }}>{p.poNumber}</td>
                    <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.vendorName}</td>
                    <td style={{ color: "#555" }}>{p.requestNumber}</td>
                    <td style={{ color: "#666", fontSize: 13 }}>{formatDateIN(p.orderDate, { withTime: false })}</td>
                    <td style={{ color: "#666", fontSize: 13 }}>{formatDateIN(p.expectedDeliveryDate, { withTime: false })}</td>
                    <td style={{ fontWeight: 800 }}>
                      <IndianRupee size={13} style={{ verticalAlign: "middle" }} /> {formatINR(p.grandTotal)}
                    </td>
                    <td>
                      <span className="pman-badge" style={{ background: `${statusColor(p.status)}18`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}33` }}>
                        <span className="pman-badge-dot"></span>{statusLabel(p.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {canSend(p.status) && (
                        <button
                          className="pman-btn-primary-sm"
                          style={{ marginRight: 6, padding: "5px 10px", fontSize: 12 }}
                          onClick={() => action(p, "send")}
                          disabled={busy}
                        >
                          <Send size={13} /> Send
                        </button>
                      )}
                      {canClose(p.status) && (
                        <button
                          className="pman-btn-primary-sm"
                          style={{ marginRight: 6, padding: "5px 10px", fontSize: 12, background: "#059669", color: "#fff", border: "none" }}
                          onClick={() => action(p, "close")}
                          disabled={busy}
                        >
                          <Lock size={13} /> Close
                        </button>
                      )}
                      {canCancel(p.status) && (
                        <button
                          className="pman-btn-primary-sm"
                          style={{ marginRight: 6, padding: "5px 10px", fontSize: 12, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                          onClick={() => action(p, "cancel")}
                          disabled={busy}
                        >
                          <Ban size={13} /> Cancel
                        </button>
                      )}
                      <button
                        className="pman-sidebar-toggle"
                        style={{ width: "32px", height: "32px", display: "inline-flex" }}
                        onClick={() => openDetail(p)}
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "720px", maxHeight: "86vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ececec", paddingBottom: "14px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>PURCHASE ORDER DETAIL</span>
                <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700" }}>{selected.poNumber}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Vendor</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{selected.vendorName}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Request</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{selected.requestNumber}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Order Date</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{formatDateIN(selected.orderDate, { withTime: false })}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Expected Delivery</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{formatDateIN(selected.expectedDeliveryDate, { withTime: false })}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Grand Total</label>
                <p style={{ fontSize: "18px", fontWeight: 800, color: "#d97706" }}>
                  <IndianRupee size={15} style={{ verticalAlign: "middle" }} /> {formatINR(selected.grandTotal)}
                </p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Status</label>
                <p style={{ fontWeight: 700, color: statusColor(selected.status) }}>{statusLabel(selected.status)}</p>
              </div>
            </div>

            {selectedLines.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Order Lines</label>
                <table className="pman-table" style={{ marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Line Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLines.map((l) => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.productName}</td>
                        <td>{l.quantityOrdered}</td>
                        <td>{formatINR(l.unitPrice)}</td>
                        <td style={{ fontWeight: 700 }}>{formatINR(l.lineAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedHistory.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Order History</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {selectedHistory.slice().reverse().map((h) => (
                    <div key={h.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <CheckCircle2 size={15} style={{ color: "#059669", marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>
                          {h.action} <span style={{ color: "#666", fontWeight: 600 }}>— {h.remarks || ""}</span>
                        </p>
                        <p style={{ fontSize: "12px", color: "#888" }}>
                          {h.oldStatus} → {h.newStatus} · {formatDateIN(h.performedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="pman-btn-primary-sm" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoApprovals;
