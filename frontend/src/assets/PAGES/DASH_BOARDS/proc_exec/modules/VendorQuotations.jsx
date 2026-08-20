import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck2,
  Search,
  Eye,
  X,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const STATUS_STYLE = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  SUBMITTED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  UNDER_REVIEW: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  ACCEPTED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  WITHDRAWN: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
};

const VendorQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rfqFilter, setRfqFilter] = useState("");
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [quoteRes, rfqRes] = await Promise.all([
        apiGet("/api/vendor-quotations?page=0&size=100&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/rfqs?page=0&size=100").catch(() => null),
      ]);
      setQuotations(quoteRes?.content || []);
      setRfqs(rfqRes?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load quotations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = quotations.filter((q) => {
    const text = searchTerm.toLowerCase();
    if (text && !(
      (q.quotationNumber || "").toLowerCase().includes(text) ||
      (q.vendorName || "").toLowerCase().includes(text) ||
      (q.rfqNumber || "").toLowerCase().includes(text)
    )) return false;
    if (statusFilter && q.status !== statusFilter) return false;
    if (rfqFilter && String(q.rfqId) !== rfqFilter) return false;
    return true;
  });

  return (
    <div className="pe-quotations-container">
      <div className="pe-page-header">
        <div>
          <h1 className="pe-page-title">
            <FileCheck2 color="#f8b400" /> Vendor Quotations Review
          </h1>
          <p className="pe-page-subtitle">
            Quotations submitted by invited vendors against your RFQs — live from the database.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      <div className="pe-card" style={{ marginBottom: 24, padding: "18px 24px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <Search size={16} color="#666" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by quotation number, vendor or RFQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-form-input"
              style={{ paddingLeft: 42, height: 42 }}
            />
          </div>
          <select className="pe-form-select" style={{ width: 200, height: 42 }} value={rfqFilter} onChange={(e) => setRfqFilter(e.target.value)}>
            <option value="">All RFQs</option>
            {rfqs.map((r) => <option key={r.id} value={r.id}>{r.rfqNumber}</option>)}
          </select>
          <select className="pe-form-select" style={{ width: 180, height: 42 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {["DRAFT", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading quotations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="pe-card" style={{ padding: 60, textAlign: "center", color: "#9aa8b8" }}>
          <Clock size={30} style={{ opacity: 0.5, marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 15, color: "#475569" }}>No vendor quotations received yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Quotations appear here once invited vendors submit their commercial bids.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filtered.map((q) => {
            const s = STATUS_STYLE[q.status] || STATUS_STYLE.DRAFT;
            return (
              <div key={q.id} className="pe-card pe-card-gold-glow">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, color: "#d97706", fontSize: 13 }}>{q.quotationNumber} · {q.rfqNumber}</span>
                  <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>{q.status}</span>
                </div>
                <h3 style={{ fontSize: 17, color: "#111", fontWeight: 700 }}>{q.vendorName}</h3>
                <p style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{q.vendorCode} · Valid until {formatDateIN(q.validUntil, { withTime: false })}</p>
                <div style={{ marginTop: 16, padding: 12, background: "#f8f9fb", borderRadius: 10, border: "1px solid #ececec", display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Total Bid Price:</span>
                    <strong style={{ color: "#059669", fontSize: 15 }}>{formatINR(q.grandTotal)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Delivery:</span>
                    <span style={{ fontWeight: 600 }}>{q.deliveryDays ? `${q.deliveryDays} day(s)` : "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Payment Terms:</span>
                    <span style={{ fontWeight: 600 }}>{q.paymentTerms || "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Warranty:</span>
                    <span style={{ fontWeight: 600 }}>{q.warrantyMonths ? `${q.warrantyMonths} months` : "—"}</span>
                  </div>
                  {q.remarks && <div style={{ color: "#555", fontStyle: "italic", marginTop: 4 }}>"{q.remarks}"</div>}
                </div>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                  <button className="pe-btn-primary-sm" style={{ background: "#fff", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setPreview(q)}>
                    <Eye size={15} /> View Quotation Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="pe-modal-overlay">
          <div className="pe-modal" style={{ maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800 }}>VENDOR COMMERCIAL BID</span>
                <h3 style={{ fontSize: 18, color: "#111", fontWeight: 800, margin: "2px 0 0" }}>{preview.quotationNumber} ({preview.vendorName})</h3>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: 16, background: "#f8f9fb", borderRadius: 12, border: "1px solid #ececec", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13 }}>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Total Bid Price</span><p style={{ fontSize: 20, color: "#059669", fontWeight: 800, margin: "2px 0 0" }}>{formatINR(preview.grandTotal)}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>RFQ</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{preview.rfqNumber}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Submitted</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{formatDateIN(preview.submissionDate, { withTime: false })}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Valid Until</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{formatDateIN(preview.validUntil, { withTime: false })}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Subtotal</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{formatINR(preview.subtotal)}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Tax</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{formatINR(preview.taxAmount)}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Delivery (days)</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{preview.deliveryDays ?? "—"}</p></div>
                <div><span style={{ fontSize: 11, color: "#666", textTransform: "uppercase" }}>Warranty (months)</span><p style={{ fontWeight: 700, color: "#111", margin: "2px 0 0" }}>{preview.warrantyMonths ?? "—"}</p></div>
              </div>
              {preview.remarks && <p style={{ background: "#f8f9fb", padding: 12, borderRadius: 8, border: "1px solid #ececec", fontSize: 13, fontStyle: "italic" }}>"{preview.remarks}"</p>}
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

export default VendorQuotations;
