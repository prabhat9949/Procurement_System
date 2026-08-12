import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Download,
  Eye,
  Check,
  Search,
  X,
  FileText,
  Truck,
  Loader2,
  WifiOff,
  XCircle,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) => {
  const map = {
    DRAFT: "Draft",
    GENERATED: "Generated",
    SENT: "Sent to Vendor",
    ACKNOWLEDGED: "Accepted & Confirmed",
    PARTIALLY_RECEIVED: "Partially Received",
    FULLY_RECEIVED: "Fully Received",
    CANCELLED: "Cancelled",
    CLOSED: "Closed",
  };
  return map[s] || s;
};

const statusColor = (s) => {
  if (s === "ACKNOWLEDGED" || s === "FULLY_RECEIVED" || s === "CLOSED") return "#059669";
  if (s === "CANCELLED") return "#dc2626";
  if (s === "SENT" || s === "GENERATED") return "#2563eb";
  return "#d97706";
};

const VendorPurchaseOrders = () => {
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewPo, setPreviewPo] = useState(null);
  const [confirmPo, setConfirmPo] = useState(null); // PO awaiting accept/reject confirmation
  const [action, setAction] = useState(null); // 'accept' | 'reject'
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/vendor/my/purchase-orders?page=0&size=50&sort=orderDate&direction=desc");
      setPoList(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const confirmDecision = async () => {
    if (!confirmPo) return;
    setSubmitting(true);
    setError("");
    try {
      if (action === "accept") {
        await apiPost(`/api/vendor/my/purchase-orders/${confirmPo.id}/acknowledge`, {});
        triggerToast(`Purchase Order ${confirmPo.poNumber} accepted & confirmed!`);
      } else {
        await apiPost(`/api/vendor/my/purchase-orders/${confirmPo.id}/reject`, {});
        triggerToast(`Purchase Order ${confirmPo.poNumber} rejected.`);
      }
      setConfirmPo(null);
      setAction(null);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to update the purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = poList.filter(
    (p) =>
      !searchTerm ||
      (p.poNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.requestNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.vendorName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d7dce3",
    borderRadius: "9px",
    fontSize: "13.5px",
    background: "#fff",
    outline: "none",
  };

  return (
    <div className="vnd-purchase-orders-container">
      {/* Header */}
      <div className="vnd-page-header">
        <div>
          <h1 className="vnd-page-title">
            <ShoppingBag color="#f8b400" /> Purchase Orders Issued to My Company
          </h1>
          <p className="vnd-page-subtitle">
            Review, accept, or reject Purchase Orders issued to your company — only your own records, live.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            background: "rgba(5, 150, 105, 0.12)",
            border: "1px solid #059669",
            color: "#059669",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Search */}
      <div className="vnd-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search
            size={16}
            color="#666666"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search PO Code, Request, or Vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vnd-form-input"
            style={{ paddingLeft: "42px", height: "42px" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your purchase orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="vnd-card" style={{ textAlign: "center", padding: "48px" }}>
          <ShoppingBag size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>No Purchase Orders</h3>
          <p style={{ color: "#666666", fontSize: "14px", marginTop: "4px" }}>
            POs issued to your company after quotation approval will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filtered.map((po) => (
            <div key={po.id} className="vnd-card vnd-card-gold-glow">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "800", color: "#d97706", fontSize: "16px" }}>{po.poNumber}</span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>Request: {po.requestNumber}</span>
                    <span
                      className="vnd-badge"
                      style={{
                        background: `${statusColor(po.status)}14`,
                        color: statusColor(po.status),
                        border: `1px solid ${statusColor(po.status)}`,
                      }}
                    >
                      {statusLabel(po.status)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700", marginTop: "4px" }}>
                    {po.vendorName || "Your Company"}
                  </h3>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#666666", textTransform: "uppercase", fontWeight: "700" }}>
                    PO Total Value
                  </span>
                  <p style={{ fontSize: "24px", color: "#059669", fontWeight: "800" }}>
                    {formatINR(po.grandTotal)}
                  </p>
                  <span style={{ fontSize: "12px", color: "#7a8999" }}>
                    {po.currency} · {po.paymentTerms || "Net 30 Days"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                  padding: "14px",
                  background: "#f8f9fb",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Order Date</span>
                  <p style={{ fontWeight: "700", color: "#111111", marginTop: "2px" }}>{formatDateIN(po.orderDate, { withTime: false })}</p>
                </div>
                <div>
                  <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Expected Delivery</span>
                  <p style={{ fontWeight: "700", color: "#111111", marginTop: "2px" }}>
                    {po.expectedDeliveryDate ? formatDateIN(po.expectedDeliveryDate, { withTime: false }) : "—"}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#666666", fontSize: "11px", textTransform: "uppercase" }}>Delivery Address</span>
                  <p style={{ fontWeight: "600", color: "#333", marginTop: "2px", fontSize: "12.5px" }}>{po.deliveryAddress || "—"}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => alert(`Downloading PO ${po.poNumber}...`)}
                >
                  <Download size={15} /> Download PO PDF
                </button>
                <button
                  className="vnd-btn-primary-sm"
                  style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                  onClick={() => setPreviewPo(po)}
                >
                  <Eye size={15} /> View Details
                </button>
                {(po.status === "SENT" || po.status === "GENERATED") && (
                  <>
                    <button
                      className="vnd-btn-primary-sm"
                      style={{ background: "#059669", color: "#fff" }}
                      onClick={() => { setConfirmPo(po); setAction("accept"); }}
                    >
                      <Check size={16} /> Accept Purchase Order
                    </button>
                    <button
                      className="vnd-btn-primary-sm"
                      style={{ background: "#dc2626", color: "#fff" }}
                      onClick={() => { setConfirmPo(po); setAction("reject"); }}
                    >
                      <XCircle size={16} /> Reject Purchase Order
                    </button>
                  </>
                )}
                {po.status === "ACKNOWLEDGED" && (
                  <button
                    className="vnd-btn-primary-sm"
                    style={{ background: "#0ea5e9", color: "#fff" }}
                    onClick={() => triggerToast("Shipment can be initiated once the goods are ready. Delivery tracking updates automatically.")}
                  >
                    <Truck size={15} /> Track Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PO Preview Modal */}
      {previewPo && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111111", fontWeight: "700" }}>PO Details: {previewPo.poNumber}</h3>
              <button onClick={() => setPreviewPo(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #ececec", textAlign: "center" }}>
              <FileText size={48} color="#f8b400" style={{ margin: "0 auto 12px" }} />
              <h4 style={{ fontSize: "16px", color: "#111111", fontWeight: "700" }}>{previewPo.poNumber}</h4>
              <p style={{ color: "#666666", fontSize: "13px", marginTop: "4px" }}>
                Request: <strong>{previewPo.requestNumber}</strong> · Payment Terms: {previewPo.paymentTerms}
              </p>
              <div style={{ marginTop: "16px", fontSize: "22px", fontWeight: "800", color: "#059669" }}>{formatINR(previewPo.grandTotal)}</div>
            </div>
            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Subtotal</span>
                <p style={{ fontWeight: "700", margin: "2px 0 0" }}>{formatINR(previewPo.subtotal)}</p>
              </div>
              <div>
                <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Tax</span>
                <p style={{ fontWeight: "700", margin: "2px 0 0" }}>{formatINR(previewPo.taxAmount)}</p>
              </div>
              <div>
                <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Shipping</span>
                <p style={{ fontWeight: "700", margin: "2px 0 0" }}>{formatINR(previewPo.shippingCharges)}</p>
              </div>
              <div>
                <span style={{ color: "#666", fontSize: "11px", textTransform: "uppercase" }}>Discount</span>
                <p style={{ fontWeight: "700", margin: "2px 0 0" }}>{formatINR(previewPo.discountAmount)}</p>
              </div>
            </div>
            {previewPo.remarks && (
              <div style={{ marginTop: "16px", padding: "12px", background: "#f8f9fb", borderRadius: "8px", fontSize: "13px", color: "#555" }}>
                <strong>Remarks:</strong> {previewPo.remarks}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button className="vnd-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setPreviewPo(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept/Reject Confirmation Modal */}
      {confirmPo && (
        <div className="vnd-modal-overlay">
          <div className="vnd-modal" style={{ maxWidth: "440px", textAlign: "center" }}>
            {action === "accept" ? (
              <CheckCircle2 size={48} color="#059669" style={{ margin: "0 auto 16px" }} />
            ) : (
              <XCircle size={48} color="#dc2626" style={{ margin: "0 auto 16px" }} />
            )}
            <h3 style={{ fontSize: "20px", color: "#111", fontWeight: "700" }}>
              {action === "accept" ? "Accept Purchase Order?" : "Reject Purchase Order?"}
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "8px", marginBottom: "24px" }}>
              {action === "accept"
                ? `Confirm acceptance of ${confirmPo.poNumber} worth ${formatINR(confirmPo.grandTotal)}. This will be recorded in the database.`
                : `Reject ${confirmPo.poNumber}. This will cancel the order and notify the buyer.`}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: action === "accept" ? "#059669" : "#dc2626", color: "#fff" }}
                disabled={submitting}
                onClick={confirmDecision}
              >
                {submitting ? <><Loader2 size={15} className="login-spin" /> Saving...</> : action === "accept" ? "Yes, Accept" : "Yes, Reject"}
              </button>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => { setConfirmPo(null); setAction(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPurchaseOrders;
