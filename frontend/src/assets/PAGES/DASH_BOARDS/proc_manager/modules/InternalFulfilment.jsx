import React, { useState, useEffect, useCallback } from "react";
import {
  PackageCheck,
  Search,
  Eye,
  X,
  Loader2,
  WifiOff,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  Send,
  FileCheck2,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";

// Procurement-stage statuses shown in the Internal Fulfilment queue.
const PROCUREMENT_STATUSES = [
  "APPROVED",
  "INTERNAL_AVAILABILITY_CHECK",
  "INTERNALLY_FULFILLABLE",
  "INTERNAL_FULFILMENT_IN_PROGRESS",
  "PARTIAL_FULFILMENT_PENDING",
  "EXTERNAL_PROCUREMENT_REQUIRED",
  "RFQ_CREATED",
];

const statusLabel = (s) =>
  ({
    APPROVED: "Approved",
    INTERNAL_AVAILABILITY_CHECK: "Availability Check",
    INTERNALLY_FULFILLABLE: "Internally Fulfillable",
    INTERNAL_FULFILMENT_IN_PROGRESS: "Internal Fulfilment In Progress",
    PARTIAL_FULFILMENT_PENDING: "Partial Fulfilment Pending",
    EXTERNAL_PROCUREMENT_REQUIRED: "External Procurement Required",
    RFQ_CREATED: "RFQ Created",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
  }[s] || s);

const actionLabel = (s) =>
  ({
    INTERNAL_FULFILMENT: "Fulfil Internally",
    PARTIAL_FULFILMENT_AND_EXTERNAL_PROCUREMENT: "Partial — Fulfil Internally + External",
    EXTERNAL_PROCUREMENT_REQUIRED: "External Procurement",
  }[s] || s);

const InternalFulfilment = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPr, setSelectedPr] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [acting, setActing] = useState(false);
  const [fulfilTasks, setFulfilTasks] = useState([]);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await apiGet("/api/purchase-requests/procurement-queue?page=0&size=200&sort=createdAt&direction=desc");
      setPrs(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load procurement queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = prs.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (r.requestNumber || "").toLowerCase().includes(q) ||
      (r.requesterName || "").toLowerCase().includes(q) ||
      (r.purpose || "").toLowerCase().includes(q) ||
      (r.departmentName || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = async (pr) => {
    setSelectedPr(pr);
    setAvailability(null);
    setFulfilTasks([]);
    // Fetch the availability check (live database) + any existing fulfilment tasks.
    try {
      const [avail, tasks] = await Promise.all([
        apiGet(`/api/fulfilments/check-availability/${pr.id}`).catch(() => null),
        apiGet(`/api/fulfilments/team-tasks?page=0&size=100`).catch(() => null),
      ]);
      setAvailability(avail || null);
      const allTasks = tasks?.content || [];
      setFulfilTasks(allTasks.filter((t) => t.purchaseRequestId === pr.id));
    } catch {
      // non-fatal — the modal still shows the request header
    }
  };

  const runAvailabilityCheck = async () => {
    if (!selectedPr) return;
    setChecking(true);
    setError("");
    try {
      const avail = await apiGet(`/api/fulfilments/check-availability/${selectedPr.id}`);
      setAvailability(avail);
      triggerToast("Internal availability checked against live inventory.");
    } catch (err) {
      setError(err.message || "Unable to check availability.");
    } finally {
      setChecking(false);
    }
  };

  const initiateAction = async (actionType) => {
    if (!selectedPr || !availability) return;
    setActing(true);
    setError("");
    try {
      const body = {
        purchaseRequestId: selectedPr.id,
        actionType,
        remarks:
          actionType === "FULL_INTERNAL"
            ? "Fulfilled internally from warehouse stock"
            : actionType === "PARTIAL_FULFILMENT"
              ? "Partial fulfilment — internal allocation + external for shortage"
              : "External procurement triggered from internal availability check",
      };
      if (actionType === "PARTIAL_FULFILMENT" || actionType === "EXTERNAL_PROCUREMENT") {
        body.quantityForExternalProcurement = availability.totalShortageQuantity;
      }
      await apiPost(`/api/fulfilments/initiate/${selectedPr.id}`, body);
      triggerToast(
        actionType === "FULL_INTERNAL"
          ? `Stock allocated for ${selectedPr.requestNumber} — internal fulfilment in progress.`
          : actionType === "PARTIAL_FULFILMENT"
            ? `Partial fulfilment recorded — ${availability.totalShortageQuantity} sent to external procurement (RFQ auto-created).`
            : `External procurement started for ${selectedPr.requestNumber} — RFQ auto-created for all vendors.`
      );
      setSelectedPr(null);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to perform the requested action.");
    } finally {
      setActing(false);
    }
  };

  const completeTask = async (task) => {
    setActing(true);
    setError("");
    try {
      await apiPost(`/api/fulfilments/${task.id}/complete`, {
        quantity: task.allocatedQuantity,
        remarks: "Delivered to requester — fulfilment completed",
      });
      triggerToast(`Fulfilment ${task.fulfilmentNumber} completed — inventory issued.`);
      if (selectedPr) openDetail(selectedPr);
      loadData();
    } catch (err) {
      setError(err.message || "Unable to complete fulfilment.");
    } finally {
      setActing(false);
    }
  };

  const summaryCard = (label, value, color) => (
    <div className="pman-kpi-card">
      <div className="pman-kpi-info">
        <span className="pman-kpi-label">{label}</span>
        <span className="pman-kpi-value" style={{ color }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="pman-fulfilment-container">
      {/* Header */}
      <div className="pman-page-header">
        <div>
          <h1 className="pman-page-title">
            <PackageCheck color="#f8b400" /> Internal Fulfilment
          </h1>
          <p className="pman-page-subtitle">
            Approved PRs at the procurement stage — real-time internal availability check, internal fulfilment, partial allocation and external procurement handoff. All data is live from MySQL.
          </p>
        </div>
        <button className="pman-btn-primary-sm" onClick={loadData}>
          <RefreshCw size={15} /> Refresh Queue
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

      {/* KPI summary */}
      <div className="pman-kpi-grid" style={{ marginBottom: "24px" }}>
        {summaryCard("Awaiting Procurement Action", prs.length, "#d97706")}
        {summaryCard("Internal Fulfilment In Progress", prs.filter((r) => r.status === "INTERNAL_FULFILMENT_IN_PROGRESS").length, "#059669")}
        {summaryCard("Partial Fulfilment Pending", prs.filter((r) => r.status === "PARTIAL_FULFILMENT_PENDING").length, "#7c3aed")}
        {summaryCard("External Procurement Required", prs.filter((r) => r.status === "EXTERNAL_PROCUREMENT_REQUIRED" || r.status === "RFQ_CREATED").length, "#2563eb")}
      </div>

      {/* Filter bar */}
      <div className="pman-card" style={{ marginBottom: "24px", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ position: "relative", width: "340px" }}>
            <Search size={16} color="#666666" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search request number, requester, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pman-form-input"
              style={{ paddingLeft: "42px", height: "42px" }}
            />
          </div>
          <div style={{ display: "flex", background: "#f8f9fb", padding: "3px", borderRadius: "10px", border: "1px solid #d9d9d9", flexWrap: "wrap" }}>
            {["all", ...PROCUREMENT_STATUSES].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: statusFilter === st ? "#f8b400" : "transparent",
                  color: statusFilter === st ? "#000000" : "#555555",
                  fontWeight: statusFilter === st ? "700" : "600",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {st === "all" ? "All" : statusLabel(st)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue table */}
      <div className="pman-card">
        <div className="pman-table-container">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#666666" }}>
              <Loader2 size={20} className="login-spin" /> Loading procurement queue…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#666666" }}>
              <PackageCheck size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No PRs currently require procurement action.</p>
              <p style={{ fontSize: "13px" }}>Approved PRs automatically enter this queue after final approval.</p>
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
                  <th>Required Action</th>
                  <th style={{ textAlign: "right" }}>Open</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: "800", color: "#d97706" }}>{r.requestNumber}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700", color: "#111111" }}>{r.requesterName}</span>
                        <span style={{ fontSize: "11px", color: "#666666" }}>{r.departmentName}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: "600", color: "#111111", maxWidth: "240px" }}>{r.purpose}</td>
                    <td style={{ fontWeight: "800", color: "#111111" }}>{formatINR(r.estimatedAmount)}</td>
                    <td>
                      <span className={`pman-badge ${(r.status || "").toLowerCase()}`}>
                        <span className="pman-badge-dot"></span>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px", fontWeight: 700, color: r.status === "EXTERNAL_PROCUREMENT_REQUIRED" ? "#2563eb" : r.status === "RFQ_CREATED" ? "#7c3aed" : "#059669" }}>
                      {r.status === "RFQ_CREATED" ? "RFQ generated — awaiting quotations" : r.status === "EXTERNAL_PROCUREMENT_REQUIRED" ? "Run availability → Start RFQ" : r.status === "PARTIAL_FULFILMENT_PENDING" ? "Allocate internal + external shortage" : r.status === "INTERNAL_FULFILMENT_IN_PROGRESS" ? "Complete internal fulfilment" : "Check availability → Fulfil"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="pman-sidebar-toggle" style={{ width: "32px", height: "32px", display: "inline-flex" }} onClick={() => openDetail(r)} title="Open request">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedPr && (
        <div className="pman-modal-overlay">
          <div className="pman-modal" style={{ maxWidth: "860px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ececec", paddingBottom: "14px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "800" }}>PROCUREMENT / INTERNAL FULFILMENT</span>
                <h2 style={{ fontSize: "20px", color: "#111111", fontWeight: "700" }}>{selectedPr.requestNumber}</h2>
                <p style={{ fontSize: "13px", color: "#555" }}>{selectedPr.purpose}</p>
              </div>
              <button onClick={() => setSelectedPr(null)} style={{ background: "none", border: "none", color: "#666666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Request header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontSize: "13.5px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Requester</label>
                <p style={{ fontWeight: 700, color: "#111" }}>{selectedPr.requesterName}</p>
                <p style={{ fontSize: "12px", color: "#666" }}>{selectedPr.departmentName}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Estimated Amount</label>
                <p style={{ fontSize: "16px", fontWeight: "800", color: "#d97706" }}>
                  <IndianRupee size={14} style={{ verticalAlign: "middle" }} /> {formatINR(selectedPr.estimatedAmount)}
                </p>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>Current Status</label>
                <p style={{ fontWeight: 700, color: "#111" }}>
                  {statusLabel(selectedPr.status)} · {selectedPr.approvalStatus}
                </p>
              </div>
            </div>

            {/* Availability check */}
            <div className="pman-card" style={{ background: "#f8f9fb", border: "1px solid #ececec", padding: "18px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "15px", color: "#111", fontWeight: "700" }}>
                  <ClipboardCheck size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Internal Availability Check
                </h3>
                <button className="pman-btn-primary-sm" onClick={runAvailabilityCheck} disabled={checking} style={{ opacity: checking ? 0.7 : 1 }}>
                  {checking ? <><Loader2 size={15} className="login-spin" /> Checking…</> : <><RefreshCw size={15} /> Check Availability</>}
                </button>
              </div>

              {availability ? (
                <div>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
                    <span className="pman-badge" style={{ background: availability.overallStatus === "FULLY_AVAILABLE" ? "rgba(5,150,105,.12)" : availability.overallStatus === "PARTIALLY_AVAILABLE" ? "rgba(124,58,237,.12)" : "rgba(37,99,235,.12)", color: availability.overallStatus === "FULLY_AVAILABLE" ? "#059669" : availability.overallStatus === "PARTIALLY_AVAILABLE" ? "#7c3aed" : "#2563eb" }}>
                      <span className="pman-badge-dot"></span>
                      {availability.overallStatus === "FULLY_AVAILABLE" ? "Available — Fulfil Internally" : availability.overallStatus === "PARTIALLY_AVAILABLE" ? "Partially Available" : "External Procurement Required"}
                    </span>
                    <span style={{ fontSize: "12.5px", color: "#666" }}>
                      Requested <strong>{availability.totalRequestedQuantity}</strong> · Available <strong>{availability.totalAvailableQuantity}</strong> · Shortage <strong>{availability.totalShortageQuantity}</strong>
                    </span>
                  </div>

                  <table className="pman-table" style={{ marginTop: 8 }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Requested</th>
                        <th>Available</th>
                        <th>Shortage</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(availability.lines || []).map((l) => (
                        <tr key={l.lineId}>
                          <td style={{ fontWeight: 600 }}>{l.productName}</td>
                          <td style={{ fontSize: "12.5px" }}>{l.categoryName}</td>
                          <td>{l.requestedQuantity}</td>
                          <td style={{ color: l.availableQuantity > 0 ? "#059669" : "#dc2626", fontWeight: 700 }}>{l.availableQuantity}</td>
                          <td style={{ color: l.shortageQuantity > 0 ? "#d97706" : "#059669", fontWeight: 700 }}>{l.shortageQuantity}</td>
                          <td style={{ fontSize: "12.5px", color: "#666" }}>{l.warehouseLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#888" }}>
                  Click <strong>Check Availability</strong> to run the live inventory query from MySQL (requested vs available vs shortage per line).
                </p>
              )}
            </div>

            {/* Action buttons */}
            {availability && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                {availability.recommendedAction === "INTERNAL_FULFILMENT" && (
                  <button className="pman-btn-primary-sm" style={{ background: "#059669" }} disabled={acting} onClick={() => initiateAction("FULL_INTERNAL")}>
                    {acting ? <Loader2 size={15} className="login-spin" /> : <Truck size={15} />} Fulfil Internally (Allocated {availability.totalAvailableQuantity})
                  </button>
                )}
                {availability.recommendedAction === "PARTIAL_FULFILMENT_AND_EXTERNAL_PROCUREMENT" && (
                  <>
                    <button className="pman-btn-primary-sm" style={{ background: "#7c3aed" }} disabled={acting} onClick={() => initiateAction("PARTIAL_FULFILMENT")}>
                      {acting ? <Loader2 size={15} className="login-spin" /> : <FileCheck2 size={15} />} Partial — Internal {availability.totalAvailableQuantity} + External {availability.totalShortageQuantity}
                    </button>
                  </>
                )}
                {availability.recommendedAction === "EXTERNAL_PROCUREMENT_REQUIRED" && (
                  <button className="pman-btn-primary-sm" style={{ background: "#2563eb" }} disabled={acting} onClick={() => initiateAction("EXTERNAL_PROCUREMENT")}>
                    {acting ? <Loader2 size={15} className="login-spin" /> : <Send size={15} />} Start External Procurement (RFQ Auto-Created)
                  </button>
                )}
                {availability.recommendedAction === "PARTIAL_FULFILMENT_AND_EXTERNAL_PROCUREMENT" && (
                  <button className="pman-btn-primary-sm" style={{ background: "#2563eb" }} disabled={acting} onClick={() => initiateAction("EXTERNAL_PROCUREMENT")}>
                    {acting ? <Loader2 size={15} className="login-spin" /> : <Send size={15} />} External Only ({availability.totalShortageQuantity})
                  </button>
                )}
              </div>
            )}

            {/* Existing fulfilment tasks */}
            {fulfilTasks.length > 0 && (
              <div className="pman-card" style={{ padding: "18px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", color: "#111", fontWeight: "700", marginBottom: "12px" }}>
                  <Truck size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Internal Fulfilment Tasks
                </h3>
                <table className="pman-table">
                  <thead>
                    <tr>
                      <th>Fulfilment</th>
                      <th>Product</th>
                      <th>Requested</th>
                      <th>Allocated</th>
                      <th>Shortage</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fulfilTasks.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, color: "#d97706" }}>{t.fulfilmentNumber}</td>
                        <td style={{ fontWeight: 600 }}>{t.productName}</td>
                        <td>{t.requestedQuantity}</td>
                        <td style={{ color: "#059669", fontWeight: 700 }}>{t.allocatedQuantity}</td>
                        <td style={{ color: t.shortageQuantity > 0 ? "#d97706" : "#059669", fontWeight: 700 }}>{t.shortageQuantity}</td>
                        <td>
                          <span className="pman-badge"><span className="pman-badge-dot"></span>{t.status}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {t.status === "ALLOCATED" || t.status === "CONFIRMED" || t.status === "DISPATCHED" ? (
                            <button className="pman-btn-primary-sm" style={{ background: "#059669" }} disabled={acting} onClick={() => completeTask(t)}>
                              {acting ? <Loader2 size={15} className="login-spin" /> : <CheckCircle2 size={15} />} Complete
                            </button>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#666" }}>{t.status === "COMPLETED" ? "Completed" : "—"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button className="pman-btn-primary-sm" onClick={() => setSelectedPr(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalFulfilment;
