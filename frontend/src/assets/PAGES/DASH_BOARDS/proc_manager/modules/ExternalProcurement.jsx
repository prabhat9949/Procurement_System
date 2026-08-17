import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  Eye,
  X,
  Loader2,
  WifiOff,
  RefreshCw,
  FileText,
  FileCheck2,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const EXTERNAL_STATUSES = [
  "EXTERNAL_PROCUREMENT_REQUIRED",
  "PARTIAL_FULFILMENT_PENDING",
  "RFQ_CREATED",
];

const statusLabel = (s) =>
  ({
    EXTERNAL_PROCUREMENT_REQUIRED: "External Procurement Required",
    PARTIAL_FULFILMENT_PENDING: "Partial Fulfilment Pending",
    RFQ_CREATED: "RFQ Created",
    COMPLETED: "Completed",
  }[s] || s);

const ExternalProcurement = ({ onNavigate }) => {
  const [prs, setPrs] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [selectedPr, setSelectedPr] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prPage, rfqPage, quotPage] = await Promise.all([
        apiGet("/api/purchase-requests/procurement-queue?page=0&size=200&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/rfqs?page=0&size=100&sort=createdAt&direction=desc").catch(() => null),
        apiGet("/api/vendor-quotations?page=0&size=200&sort=createdAt&direction=desc").catch(() => null),
      ]);
      setPrs((prPage?.content || []).filter((r) => EXTERNAL_STATUSES.includes(r.status)));
      setRfqs(rfqPage?.content || []);
      setQuotations(quotPage?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load external procurement queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rfqFor = (prId) => rfqs.find((r) => r.purchaseRequestId === prId) || null;
  const quotationsFor = (prId) => {
    const rfq = rfqFor(prId);
    if (!rfq) return [];
    return quotations.filter((q) => q.rfqId === rfq.id);
  };

  const startRfq = async (pr) => {
    setActing(true);
    setError("");
    try {
      await apiPost(`/api/fulfilments/initiate/${pr.id}`, {
        purchaseRequestId: pr.id,
        actionType: "EXTERNAL_PROCUREMENT",
        quantityForExternalProcurement: 0,
        remarks: "External procurement triggered from Procurement Manager queue",
      });
      triggerToast(`External procurement started for ${pr.requestNumber} — RFQ generated for all active vendors.`);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to start external procurement.");
    } finally {
      setActing(false);
    }
  };

  const rows = prs.map((pr) => {
    const rfq = rfqFor(pr.id);
    const quots = quotationsFor(pr.id);
    return { pr, rfq, quots };
  });

  return (
    <div className="pman-external-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <Send color="#f8b400" /> External Procurement
          </h1>
          <p className="pman-page-subtitle">
            PRs with zero or partial internal availability — RFQ, vendor quotations and PO progress, live from the database. Only the shortage quantity is ever procured externally.
          </p>
        </div>
        <button className="pman-btn-primary-sm" onClick={loadData}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", fontWeight: 600, border: "1px solid #a7f3d0", display: "flex", gap: "10px", alignItems: "center" }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", border: "1px solid #fecaca", display: "flex", gap: "10px", alignItems: "center" }}>
          <WifiOff size={18} /> <span style={{ flex: 1 }}>{error}</span>
          <button onClick={loadData} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="pman-card">
        <div className="pman-table-container">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
              <Loader2 size={20} className="login-spin" /> Loading external procurement queue…
            </div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
              <Send size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No PRs currently require external procurement.</p>
              <p style={{ fontSize: "13px" }}>Shortages from the internal availability check enter this queue automatically.</p>
            </div>
          ) : (
            <table className="pman-table">
              <thead>
                <tr>
                  <th>PR</th>
                  <th>Requester / Dept</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>RFQ</th>
                  <th>Quotations</th>
                  <th>Next Action</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ pr, rfq, quots }) => (
                  <tr key={pr.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{pr.requestNumber}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700", color: "#111111" }}>{pr.requesterName}</span>
                        <span style={{ fontSize: "11px", color: "#666666" }}>{pr.departmentName}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: "600", color: "#111111", maxWidth: "220px" }}>{pr.purpose}</td>
                    <td style={{ fontWeight: "800", color: "#111111" }}>{formatINR(pr.estimatedAmount)}</td>
                    <td>
                      <span className={`pman-badge ${(pr.status || "").toLowerCase()}`}>
                        <span className="pman-badge-dot"></span>
                        {statusLabel(pr.status)}
                      </span>
                    </td>
                    <td>
                      {rfq ? (
                        <span style={{ fontWeight: 700, color: "#7c3aed" }}>
                          {rfq.rfqNumber} · {rfq.status}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#888" }}>Not created yet</span>
                      )}
                    </td>
                    <td>
                      {rfq ? (
                        <span style={{ fontWeight: 700, color: quots.length ? "#059669" : "#666" }}>
                          {quots.length} submitted
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#888" }}>—</span>
                      )}
                    </td>
                    <td>
                      {!rfq ? (
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#2563eb" }}>Start RFQ (all vendors)</span>
                      ) : quots.length === 0 ? (
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#d97706" }}>Awaiting vendor quotations</span>
                      ) : (
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#059669" }}>Compare & select quotation</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!rfq ? (
                        <button className="pman-btn-primary-sm" style={{ background: "#2563eb" }} disabled={acting} onClick={() => startRfq(pr)}>
                          {acting ? <Loader2 size={15} className="login-spin" /> : <Send size={15} />} Create RFQ
                        </button>
                      ) : (
                        <button className="pman-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => onNavigate && onNavigate("vendor-quotations")}>
                          <FileCheck2 size={15} /> Compare
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalProcurement;
