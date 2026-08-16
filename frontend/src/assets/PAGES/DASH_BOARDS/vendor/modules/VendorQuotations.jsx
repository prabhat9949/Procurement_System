import React, { useState, useEffect, useCallback } from "react";
import {
  FileCheck2,
  Search,
  Download,
  Eye,
  FileText,
  Loader2,
  WifiOff,
  X,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const statusLabel = (s) => {
  const map = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    AWARDED: "Awarded",
  };
  return map[s] || s;
};

const statusColor = (s) => {
  if (s === "ACCEPTED" || s === "AWARDED") return "#059669";
  if (s === "REJECTED") return "#dc2626";
  if (s === "SUBMITTED" || s === "UNDER_REVIEW") return "#d97706";
  return "#475569";
};

const VendorQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewQuote, setPreviewQuote] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/vendor/my/quotations?page=0&size=50&sort=createdAt&direction=desc");
      setQuotations(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your quotations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = quotations.filter((q) => {
    const s = searchTerm.toLowerCase();
    return (
      !s ||
      (q.quotationNumber || "").toLowerCase().includes(s) ||
      (q.rfqNumber || "").toLowerCase().includes(s) ||
      (q.vendorName || "").toLowerCase().includes(s)
    );
  });

  const handleDownload = (quote) => {
    triggerToast(`Downloading quotation ${quote.quotationNumber}...`);
  };

  return (
    <div className="vnd-quotations-container" style={{ padding: "20px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#111111",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            fontWeight: "700",
            fontSize: "14px",
            borderLeft: "4px solid #f8b400",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="vnd-page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="vnd-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111" }}>
            <FileCheck2 color="#f8b400" size={28} /> My Submitted Quotations
          </h1>
          <p className="vnd-page-subtitle" style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Every quotation your company has submitted — only your own records, live from the database.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Search bar */}
      <div className="vnd-card" style={{ marginBottom: "24px", padding: "18px 24px", background: "#fff", border: "1px solid #ececec", borderRadius: "12px" }}>
        <div style={{ position: "relative", width: "360px" }}>
          <Search
            size={16}
            color="#666666"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by quote, RFQ, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 42px",
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your quotations...
        </div>
      ) : (
        <div className="vnd-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
          <div className="vnd-table-container">
            <table className="vnd-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Quote No.</th>
                  <th style={{ whiteSpace: "nowrap" }}>RFQ Reference</th>
                  <th style={{ whiteSpace: "nowrap" }}>Vendor</th>
                  <th style={{ whiteSpace: "nowrap" }}>Grand Total</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                  <th style={{ whiteSpace: "nowrap" }}>Submitted</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                      No quotations found. Submit a quotation from the RFQs module.
                    </td>
                  </tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>{q.quotationNumber}</td>
                      <td style={{ color: "#666666", fontSize: "13px", whiteSpace: "nowrap" }}>{q.rfqNumber}</td>
                      <td style={{ fontWeight: "700", color: "#111111", whiteSpace: "nowrap" }}>{q.vendorName}</td>
                      <td style={{ fontWeight: "800", color: "#059669", whiteSpace: "nowrap" }}>{formatINR(q.grandTotal)}</td>
                      <td style={{ fontSize: "13px", color: "#555" }}>{q.paymentTerms || "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: `${statusColor(q.status)}14`,
                            color: statusColor(q.status),
                            border: `1px solid ${statusColor(q.status)}30`,
                          }}
                        >
                          {statusLabel(q.status)}
                        </span>
                      </td>
                      <td style={{ color: "#666", fontSize: "13px", whiteSpace: "nowrap" }}>
                        {q.createdAt ? formatDateIN(q.createdAt) : "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            className="vnd-sidebar-toggle"
                            style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                            onClick={() => setPreviewQuote(q)}
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="vnd-sidebar-toggle"
                            style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", color: "#d97706" }}
                            onClick={() => handleDownload(q)}
                            title="Download Quotation"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuote && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                background: "#f8f9fb",
                borderBottom: "1px solid #ececec",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#d97706", fontWeight: "800" }}>QUOTATION OVERVIEW</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>{previewQuote.quotationNumber}</h3>
              </div>
              <button onClick={() => setPreviewQuote(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f2f2f2", paddingBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#666" }}>Quotation Status</span>
                    <div style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: `${statusColor(previewQuote.status)}14`,
                          color: statusColor(previewQuote.status),
                          border: `1px solid ${statusColor(previewQuote.status)}30`,
                        }}
                      >
                        {statusLabel(previewQuote.status)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>Valid Until</span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#333", marginTop: "4px" }}>
                      {previewQuote.validUntil ? formatDateIN(previewQuote.validUntil, { withTime: false }) : "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "12px", color: "#777" }}>RFQ Reference</span>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{previewQuote.rfqNumber}</p>
                </div>

                <div>
                  <span style={{ fontSize: "12px", color: "#777" }}>Vendor</span>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{previewQuote.vendorName}</p>
                </div>

                <div style={{ background: "#fafafa", padding: "14px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <span style={{ fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase" }}>Pricing Details</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Subtotal</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{formatINR(previewQuote.subtotal)}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Discount</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{formatINR(previewQuote.discountAmount)}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Tax</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{formatINR(previewQuote.taxAmount)}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#888" }}>Shipping</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{formatINR(previewQuote.shippingCharges)}</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span style={{ fontSize: "11px", color: "#888" }}>Grand Total</span>
                      <p style={{ fontSize: "16px", fontWeight: "800", color: "#059669" }}>{formatINR(previewQuote.grandTotal)}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Payment Terms</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{previewQuote.paymentTerms || "—"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Delivery (Days)</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{previewQuote.deliveryDays != null ? `${previewQuote.deliveryDays} days` : "—"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Warranty (Months)</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{previewQuote.warrantyMonths != null ? `${previewQuote.warrantyMonths} months` : "—"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#777" }}>Delivery Location</span>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginTop: "2px" }}>{previewQuote.deliveryLocation || "—"}</p>
                  </div>
                </div>

                {previewQuote.remarks && (
                  <div style={{ background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec" }}>
                    <span style={{ fontSize: "12px", color: "#777" }}>Remarks</span>
                    <p style={{ fontSize: "13px", color: "#333", margin: "2px 0 0" }}>{previewQuote.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "20px", background: "#f8f9fb", borderTop: "1px solid #ececec" }}>
              <button className="vnd-btn-primary-sm" onClick={() => handleDownload(previewQuote)}>
                <Download size={15} /> Download Quote
              </button>
              <button
                className="vnd-btn-primary-sm"
                style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }}
                onClick={() => setPreviewQuote(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorQuotations;
