import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  User,
  Building,
  IndianRupee,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Truck,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

const STATUS_COLORS = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  SUBMITTED: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  UNDER_REVIEW: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  APPROVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  CANCELLED: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  RFQ_CREATED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  COMPLETED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  INTERNAL_FULFILMENT_IN_PROGRESS: { bg: "rgba(124,58,237,.12)", color: "#7c3aed" },
  PARTIAL_FULFILMENT_PENDING: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  EXTERNAL_PROCUREMENT_REQUIRED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
  FULFILMENT_COMPLETED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
};

const APPROVAL_COLORS = {
  PENDING: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  APPROVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  RETURNED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
};

const SuperProcurementMonitoring = () => {
  const [prs, setPrs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [selectedPr, setSelectedPr] = useState(null);
  const [prDetail, setPrDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort: "createdAt",
        direction: "desc",
      });
      if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (approvalFilter) params.set("approvalStatus", approvalFilter);
      const data = await apiGet(`/api/purchase-requests?${params.toString()}`);
      setPrs(data?.content || []);
      setTotal(data?.totalElements || 0);
    } catch (err) {
      setError(err.message || "Failed to load purchase requests.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword, statusFilter, approvalFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openPr = async (pr) => {
    setSelectedPr(pr);
    setPrDetail(null);
    setTimeline([]);
    setDetailLoading(true);
    try {
      const [detail, tlRes] = await Promise.all([
        apiGet(`/api/purchase-requests/${pr.id}`).catch(() => null),
        apiGet(`/api/procurement/${pr.id}/timeline`).catch(() => null),
      ]);
      setPrDetail(detail);
      setTimeline(tlRes?.events || []);
    } catch {
      /* ignore */
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 800, color: "#111", margin: 0 }}>
            <ShoppingBag color="#2563eb" size={26} />
            Procurement Monitoring
          </h1>
          <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
            All purchase requests across the organization — live from the database. Click any PR to inspect its full lifecycle.
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", border: "1px solid #d9dee6", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#444" }}>
          <RefreshCw size={14} className={loading ? "lro-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 16, color: "#991b1b", fontWeight: 600 }}>{error}</div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9aa8b8" }} />
          <input
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #d9dee6", borderRadius: 9, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            placeholder="Search PR number, purpose, requester..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} style={{ padding: "8px 12px", border: "1px solid #d9dee6", borderRadius: 9, fontSize: 13, background: "#fff" }}>
          <option value="">All Statuses</option>
          {["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED", "RFQ_CREATED", "COMPLETED", "INTERNAL_FULFILMENT_IN_PROGRESS", "EXTERNAL_PROCUREMENT_REQUIRED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select value={approvalFilter} onChange={(e) => { setApprovalFilter(e.target.value); setPage(0); }} style={{ padding: "8px 12px", border: "1px solid #d9dee6", borderRadius: 9, fontSize: 13, background: "#fff" }}>
          <option value="">All Approval Status</option>
          {["PENDING", "APPROVED", "REJECTED", "RETURNED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* PR Table */}
      <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: 10, color: "#666" }}>
            <Loader2 size={20} className="lro-spin" /> Loading purchase requests...
          </div>
        ) : prs.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>No purchase requests found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  {["PR Number", "Requester", "Department", "Purpose", "Amount", "Status", "Approval", "Date", "Action"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: ".4px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => {
                  const sc = STATUS_COLORS[pr.status] || STATUS_COLORS.DRAFT;
                  const ac = APPROVAL_COLORS[pr.approvalStatus] || APPROVAL_COLORS.PENDING;
                  return (
                    <tr key={pr.id} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => openPr(pr)}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2563eb", fontSize: 13 }}>{pr.requestNumber}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{pr.requesterName || "—"}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{pr.employeeCode || ""}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "#475569" }}>{pr.departmentName || "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.purpose || "—"}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{formatINR(pr.estimatedAmount)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: sc.bg, color: sc.color }}>
                          {(pr.status || "DRAFT").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: ac.bg, color: ac.color }}>
                          {pr.approvalStatus || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#7a8999" }}>{formatDateIN(pr.createdAt)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <button style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: 6, background: "#fff", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); openPr(pr); }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > size && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderTop: "1px solid #ececec" }}>
            <span style={{ color: "#68778a", fontSize: 13 }}>Page {page + 1} of {totalPages} · {total} total PRs</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ padding: "6px 12px", border: "1px solid #d9dee6", borderRadius: 6, background: page === 0 ? "#f8f9fb" : "#fff", cursor: page === 0 ? "default" : "pointer", fontSize: 12, fontWeight: 600, color: page === 0 ? "#bbb" : "#333" }}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={{ padding: "6px 12px", border: "1px solid #d9dee6", borderRadius: 6, background: page >= totalPages - 1 ? "#f8f9fb" : "#fff", cursor: page >= totalPages - 1 ? "default" : "pointer", fontSize: 12, fontWeight: 600, color: page >= totalPages - 1 ? "#bbb" : "#333" }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PR Detail Modal */}
      {selectedPr && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 60px rgba(15,23,42,.25)", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", letterSpacing: 0.5 }}>PURCHASE REQUEST DETAILS</span>
                <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "#111" }}>{selectedPr.requestNumber}</h3>
              </div>
              <button onClick={() => setSelectedPr(null)} style={{ background: "#f8f9fb", border: "1px solid #d9dee6", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontWeight: 800, color: "#555" }}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#888" }}><Loader2 size={20} className="lro-spin" /> Loading...</div>
            ) : (
              <>
                {/* Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
                  <SummaryBox icon={User} label="Requester" value={prDetail?.requesterName || selectedPr.requesterName} />
                  <SummaryBox icon={Building} label="Department" value={prDetail?.departmentName || selectedPr.departmentName} />
                  <SummaryBox icon={IndianRupee} label="Amount" value={formatINR(prDetail?.estimatedAmount || selectedPr.estimatedAmount)} />
                  <SummaryBox icon={CheckCircle2} label="Status" value={`${selectedPr.status} · ${selectedPr.approvalStatus || "—"}`} />
                </div>

                {prDetail?.purpose && (
                  <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#475569" }}>
                    <strong>Justification:</strong> {prDetail.purpose}
                  </div>
                )}

                {/* Timeline */}
                <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 7 }}>
                  <Clock size={15} color="#2563eb" /> Workflow Timeline
                </h4>
                {timeline.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#7a8999", background: "#f8fafc", borderRadius: 10, padding: 14 }}>No workflow events recorded yet.</div>
                ) : (
                  <div style={{ position: "relative", paddingLeft: 28 }}>
                    {timeline.map((e, idx) => {
                      const isCompleted = ["APPROVED", "COMPLETED", "SUBMITTED", "CREATED"].some((k) => (e.type || e.action || "").includes(k));
                      const isRejected = ["REJECTED"].some((k) => (e.type || e.action || "").includes(k));
                      const isReturned = ["RETURNED"].some((k) => (e.type || e.action || "").includes(k));
                      const color = isRejected ? "#dc2626" : isReturned ? "#2563eb" : isCompleted ? "#059669" : "#d97706";
                      const Icon = isRejected ? XCircle : isReturned ? RotateCcw : isCompleted ? CheckCircle2 : Clock;
                      return (
                        <div key={idx} style={{ position: "relative", paddingBottom: 16 }}>
                          <div style={{ position: "absolute", left: -28, top: 2, width: 28, height: 28, borderRadius: "50%", background: `${color}14`, color, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${color}` }}>
                            <Icon size={12} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{e.title || e.type || e.action}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {formatDateIN(e.occurredAt || e.timestamp)} {e.performedByName || e.person ? `· ${e.performedByName || e.person}` : ""}
                          </div>
                          {(e.description || e.comment) && (
                            <div style={{ fontSize: 12, color: "#475569", marginTop: 4, background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>"{e.description || e.comment}"</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                  <button onClick={() => setSelectedPr(null)} style={{ padding: "10px 20px", border: "1px solid #d9dee6", borderRadius: 8, background: "#f8f9fb", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryBox = ({ icon: Icon, label, value }) => (
  <div style={{ background: "#f8fafc", border: "1px solid #eef1f5", borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ fontSize: 11, color: "#7a8999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, display: "flex", alignItems: "center", gap: 5 }}>
      <Icon size={12} /> {label}
    </div>
    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{value || "—"}</div>
  </div>
);

export default SuperProcurementMonitoring;
