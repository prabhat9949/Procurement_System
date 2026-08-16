import React, { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Send,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  X,
  Loader2,
  WifiOff,
  ShoppingBag,
  FileCheck2,
  IndianRupee,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const rfqStatusColor = (s) =>
  s === "OPEN" ? "#059669" : s === "DRAFT" ? "#64748b" : s === "CANCELLED" ? "#dc2626" : s === "CLOSED" ? "#2563eb" : s === "AWARDED" ? "#7c3aed" : "#d97706";

const poStatusColor = (s) => {
  if (["FULLY_RECEIVED", "CLOSED"].includes(s)) return "#059669";
  if (s === "CANCELLED") return "#dc2626";
  if (["GENERATED", "SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED"].includes(s)) return "#2563eb";
  return "#64748b";
};

const ProcurementOperations = () => {
  const [rfqs, setRfqs] = useState([]);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [operationLines, setOperationLines] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rfqPage, poPage] = await Promise.all([
        apiGet("/api/rfqs?page=0&size=100&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/purchase-orders?page=0&size=100&sort=orderDate&direction=desc").catch(() => null),
      ]);
      setRfqs(rfqPage?.content || []);
      setPos(poPage?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load procurement operations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const today = new Date().toISOString().slice(0, 10);

  const overdueRfqs = rfqs.filter(
    (r) => r.closingDate && r.closingDate < today && ["DRAFT", "OPEN"].includes(r.status)
  );
  const overduePos = pos.filter(
    (p) => p.expectedDeliveryDate && p.expectedDeliveryDate < today && ["GENERATED", "SENT", "ACKNOWLEDGED"].includes(p.status)
  );

  const openRfqs = rfqs.filter((r) => ["DRAFT", "OPEN"].includes(r.status));
  const activePos = pos.filter((p) => ["GENERATED", "SENT", "ACKNOWLEDGED", "PARTIALLY_RECEIVED"].includes(p.status));

  const matchesSearch = (text) => {
    const q = searchTerm.toLowerCase();
    return !q || (text || "").toLowerCase().includes(q);
  };

  const filteredRfqs = rfqs.filter(
    (r) => matchesSearch(r.rfqNumber) || matchesSearch(r.purchaseRequestNumber) || matchesSearch(r.departmentName)
  );
  const filteredPos = pos.filter(
    (p) => matchesSearch(p.poNumber) || matchesSearch(p.vendorName) || matchesSearch(p.requestNumber)
  );

  const openDetail = async (type, item) => {
    setSelectedOperation({ type, item });
    setOperationLines([]);
    if (type === "po") {
      try {
        const page = await apiGet(`/api/purchase-orders/${item.id}/lines?page=0&size=50`).catch(() => null);
        setOperationLines(page?.content || []);
      } catch { /* non-fatal */ }
    }
  };

  const badge = (text, color) => (
    <span className="pman-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>
      <span className="pman-badge-dot"></span>{text}
    </span>
  );

  const rfqRows = filteredRfqs.map((r) => ({ type: "rfq", item: r }));
  const poRows = filteredPos.map((p) => ({ type: "po", item: p }));
  const delayedRows = [
    ...filteredRfqs.filter((r) => r.closingDate && r.closingDate < today && ["DRAFT", "OPEN"].includes(r.status)).map((r) => ({ type: "rfq", item: r })),
    ...filteredPos.filter((p) => p.expectedDeliveryDate && p.expectedDeliveryDate < today && ["GENERATED", "SENT", "ACKNOWLEDGED"].includes(p.status)).map((p) => ({ type: "po", item: p })),
  ];
  const visibleRows = activeTabFilter === "all" ? [...rfqRows, ...poRows] : activeTabFilter === "rfq" ? rfqRows : delayedRows;

  return (
    <div className="pman-operations-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Zap color="#f8b400" /> Procurement Operations
          </h1>
          <p className="pman-page-subtitle">
            Live RFQ and purchase-order operations — deadlines, delivery risk and workflow progress from the database.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> {error}
        </div>
      )}

      {/* KPI SUMMARY METRICS */}
      <div className="pman-kpi-grid" style={{ marginBottom: "24px" }}>
        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Active Procurement Processes</span>
            <span className="pman-kpi-value">{activePos.length + openRfqs.length}</span>
            <span className="pman-kpi-change positive">Live RFQs + POs</span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#f8b400", background: "#f8b40018" }}>
            <Zap size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Open RFQs</span>
            <span className="pman-kpi-value" style={{ color: "#059669" }}>{openRfqs.length}</span>
            <span className="pman-kpi-change positive">Vendor Bidding</span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#059669", background: "#05966918" }}>
            <Send size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">POs In Pipeline</span>
            <span className="pman-kpi-value" style={{ color: "#2563eb" }}>{activePos.length}</span>
            <span className="pman-kpi-change positive">Not yet received</span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#2563eb", background: "#2563eb18" }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="pman-kpi-card">
          <div className="pman-kpi-info">
            <span className="pman-kpi-label">Overdue / At Risk</span>
            <span className="pman-kpi-value" style={{ color: overdueRfqs.length + overduePos.length > 0 ? "#dc2626" : "#059669" }}>
              {overdueRfqs.length + overduePos.length}
            </span>
            <span className="pman-kpi-change" style={{ color: overdueRfqs.length + overduePos.length > 0 ? "#dc2626" : "#059669" }}>
              <AlertTriangle size={14} /> {overdueRfqs.length} RFQ · {overduePos.length} PO deadlines passed
            </span>
          </div>
          <div className="pman-kpi-icon-wrapper" style={{ color: "#dc2626", background: "#dc262618" }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { key: "all", label: `All Operations (${filteredRfqs.length + filteredPos.length})` },
              { key: "rfq", label: `RFQ Monitoring (${filteredRfqs.length})` },
              { key: "delayed", label: `Overdue (${overdueRfqs.length + overduePos.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTabFilter(t.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTabFilter === t.key ? "#f8b400" : "#f8f9fb",
                  color: activeTabFilter === t.key ? "#000000" : "#555555",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  border: "1px solid #d9d9d9",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", width: "300px" }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search RFQ / PO / vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "42px", height: "40px" }}
            />
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="pman-card">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
            <Loader2 size={20} className="login-spin" /> Loading operations…
          </div>
        ) : (
          <div className="pman-table-container">
            <table className="pman-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Reference</th>
                  <th>Vendor / Dept</th>
                  <th>Key Date</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "50px 0", color: "#666" }}>
                      <FileCheck2 size={30} style={{ opacity: 0.4, marginBottom: 8, margin: "0 auto" }} />
                      <p style={{ fontWeight: 600 }}>No operations match the current filter.</p>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map(({ type, item }) => {
                    const isRfq = type === "rfq";
                    const overdue = isRfq
                      ? item.closingDate && item.closingDate < today && ["DRAFT", "OPEN"].includes(item.status)
                      : item.expectedDeliveryDate && item.expectedDeliveryDate < today && ["GENERATED", "SENT", "ACKNOWLEDGED"].includes(item.status);
                    const keyDate = isRfq ? item.closingDate : item.expectedDeliveryDate;
                    return (
                      <tr key={`${type}-${item.id}`}>
                        <td style={{ fontWeight: 800, color: "#d97706" }}>
                          {isRfq ? item.rfqNumber : item.poNumber}
                          <span style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600 }}>{isRfq ? "RFQ" : "PURCHASE ORDER"}</span>
                        </td>
                        <td style={{ color: "#555" }}>{isRfq ? item.purchaseRequestNumber : item.requestNumber}</td>
                        <td style={{ fontWeight: 600 }}>{isRfq ? item.departmentName : item.vendorName}</td>
                        <td style={{ color: "#666", fontSize: 13 }}>
                          {keyDate ? formatDateIN(keyDate, { withTime: false }) : "—"}
                        </td>
                        <td>
                          {overdue ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#dc2626", fontWeight: 700, fontSize: 12.5 }}>
                              <AlertTriangle size={13} /> OVERDUE
                            </span>
                          ) : (
                            <span style={{ color: "#059669", fontWeight: 700, fontSize: 12.5 }}>ON TRACK</span>
                          )}
                        </td>
                        <td>
                          {isRfq
                            ? badge(item.status, rfqStatusColor(item.status))
                            : badge(item.status, poStatusColor(item.status))}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="pman-sidebar-toggle"
                            style={{ width: "32px", height: "32px", display: "inline-flex" }}
                            onClick={() => openDetail(type, item)}
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOperation && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "640px", maxHeight: "86vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ececec", paddingBottom: "14px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>{selectedOperation.type === "rfq" ? "RFQ DETAIL" : "PURCHASE ORDER DETAIL"}</span>
                <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700" }}>
                  {selectedOperation.type === "rfq" ? selectedOperation.item.rfqNumber : selectedOperation.item.poNumber}
                </h2>
              </div>
              <button onClick={() => setSelectedOperation(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "14px" }}>
              {selectedOperation.type === "rfq" ? (
                <>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Request</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{selectedOperation.item.purchaseRequestNumber}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Department</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{selectedOperation.item.departmentName}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Closing Date</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{formatDateIN(selectedOperation.item.closingDate, { withTime: false })}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Status</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{selectedOperation.item.status}</p>
                  </div>
                  {selectedOperation.item.remarks && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Remarks</label>
                      <p style={{ fontWeight: 600, color: "#111" }}>{selectedOperation.item.remarks}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Vendor</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{selectedOperation.item.vendorName}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Request</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{selectedOperation.item.requestNumber}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Expected Delivery</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{formatDateIN(selectedOperation.item.expectedDeliveryDate, { withTime: false })}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Grand Total</label>
                    <p style={{ fontWeight: 800, color: "#d97706" }}><IndianRupee size={14} style={{ verticalAlign: "middle" }} /> {formatINR(selectedOperation.item.grandTotal)}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Status</label>
                    <p style={{ fontWeight: 700, color: "#111" }}>{selectedOperation.item.status}</p>
                  </div>
                </>
              )}
            </div>

            {selectedOperation.type === "po" && operationLines.length > 0 && (
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
                    {operationLines.map((l) => (
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

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="pman-btn-primary-sm" onClick={() => setSelectedOperation(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementOperations;
