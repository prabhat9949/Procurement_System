import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  ClipboardCheck,
  FileText,
  Boxes,
  PackageSearch,
  RefreshCw,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  History,
} from "lucide-react";
import { apiGet } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const countFormat = new Intl.NumberFormat("en-IN");
const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ProcurementMonitoring = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState({
    departmentId: "",
    requesterId: "",
    status: "",
    approvalStatus: "",
    createdDateFrom: "",
    createdDateTo: "",
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedPr, setSelectedPr] = useState(null);
  const [prDetail, setPrDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [kpis, setKpis] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, inProcurement: 0 });

  const triggerToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Load departments
  useEffect(() => {
    let mounted = true;
    apiGet("/api/departments/all")
      .then((data) => mounted && setDepartments(data || []))
      .catch(() => mounted && setDepartments([]));
    return () => { mounted = false; };
  }, []);

  // Load employees for filter
  useEffect(() => {
    let mounted = true;
    apiGet("/api/employees?page=0&size=500&sort=firstName&direction=asc")
      .then((pageData) => mounted && setEmployees(pageData?.content || []))
      .catch(() => mounted && setEmployees([]));
    return () => { mounted = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size), sort: "createdAt", direction: "desc" });
      if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
      if (filters.departmentId) params.set("departmentId", filters.departmentId);
      if (filters.requesterId) params.set("requesterId", filters.requesterId);
      if (filters.status) params.set("status", filters.status);
      if (filters.approvalStatus) params.set("approvalStatus", filters.approvalStatus);
      if (filters.createdDateFrom) params.set("createdDateFrom", filters.createdDateFrom);
      if (filters.createdDateTo) params.set("createdDateTo", filters.createdDateTo);
      const data = await apiGet(`/api/purchase-requests?${params.toString()}`);
      setRows(data?.content || []);
      setTotal(data?.totalElements || 0);

      // Calculate KPIs from data
      const content = data?.content || [];
      setKpis({
        total: data?.totalElements || 0,
        pending: content.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length,
        approved: content.filter((r) => r.approvalStatus === "APPROVED").length,
        rejected: content.filter((r) => r.approvalStatus === "REJECTED").length,
        inProcurement: content.filter((r) => ["APPROVED", "RFQ_CREATED", "PO_CREATED", "IN_PROGRESS"].includes(r.status)).length,
      });
    } catch (err) {
      setError(err.message || "Failed to load purchase requests.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const resetPage = () => setPage(0);

  const openPr = async (pr) => {
    setSelectedPr(pr);
    setPrDetail(null);
    setTimeline(null);
    setDetailLoading(true);
    try {
      const detail = await apiGet(`/api/purchase-requests/${pr.id}`);
      setPrDetail(detail);
    } catch (err) {
      triggerToast(err.message || "Failed to load PR detail.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const openTimeline = async (pr) => {
    setTimeline(null);
    setTimelineLoading(true);
    try {
      const events = await apiGet(`/api/procurement/${pr.id}/timeline`);
      setTimeline(events?.events || []);
    } catch (err) {
      triggerToast(err.message || "Failed to load the PR timeline.", "error");
    } finally {
      setTimelineLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div style={{ padding: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.tone === "err" ? "#dc2626" : "#111", color: "#fff", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1200, fontWeight: "700", fontSize: "14px", borderLeft: `4px solid ${toast.tone === "err" ? "#fff" : "#f8b400"}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>
            <ShoppingBag color="#2563eb" size={28} /> Procurement Monitoring
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Organization-wide purchase request monitoring — all PRs, approvals, RFQs, POs and timeline from the live database.
          </p>
        </div>
        <button className="sadmin-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? "login-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <KpiCard label="Total PRs" value={kpis.total} icon={FileText} color="#2563eb" />
        <KpiCard label="Pending" value={kpis.pending} icon={ClipboardCheck} color="#d97706" />
        <KpiCard label="Approved" value={kpis.approved} icon={CheckCircle2} color="#059669" />
        <KpiCard label="Rejected" value={kpis.rejected} icon={AlertCircle} color="#dc2626" />
        <KpiCard label="In Procurement" value={kpis.inProcurement} icon={PackageSearch} color="#7c3aed" />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", border: "1px solid #dbe2ea", borderRadius: "9", padding: "8px 12px", background: "#f8f9fb", flex: "1 1 240px" }}>
            <Search size={15} color="#68778a" />
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); resetPage(); }}
              placeholder="Search PR number, purpose, requester..."
              style={{ border: 0, outline: 0, background: "transparent", fontSize: "13.5px", minWidth: 180, width: "100%" }}
            />
            {keyword && <X size={14} onClick={() => { setKeyword(""); resetPage(); }} style={{ cursor: "pointer" }} />}
          </div>
          <select value={filters.departmentId} onChange={(e) => { setFilters((f) => ({ ...f, departmentId: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px", minWidth: 150 }}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px", minWidth: 150 }}>
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="RFQ_CREATED">RFQ Created</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <input type="date" value={filters.createdDateFrom} onChange={(e) => { setFilters((f) => ({ ...f, createdDateFrom: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px" }} title="From date" />
          <input type="date" value={filters.createdDateTo} onChange={(e) => { setFilters((f) => ({ ...f, createdDateTo: e.target.value })); resetPage(); }} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #dbe2ea", background: "#f8f9fb", fontSize: "13px" }} title="To date" />
        </div>
      </div>

      {/* Table */}
      <div className="sadmin-card" style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px", gap: "10px", color: "#666" }}>
            <Loader2 size={20} className="login-spin" /> Loading purchase requests...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>No purchase requests match the current filters.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ececec" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>PR Number</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Requester</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Department</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Purpose</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Stage / Owner</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#888", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((pr) => (
                  <tr key={pr.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#2563eb", fontSize: "13px" }}>{pr.requestNumber}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: "600", color: "#111", fontSize: "13px" }}>{pr.requesterName || "—"}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{pr.employeeCode || ""}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#555" }}>{pr.departmentName || "—"}</td>
                    <td style={{ padding: "12px 16px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#334155" }} title={pr.purpose}>{pr.purpose || "—"}</td>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#111", whiteSpace: "nowrap" }}>{pr.estimatedAmount != null ? moneyFormat.format(pr.estimatedAmount) : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", background: pr.status === "APPROVED" || pr.status === "RFQ_CREATED" ? "rgba(5,150,105,.12)" : pr.status === "REJECTED" || pr.status === "CANCELLED" ? "rgba(220,38,38,.12)" : "rgba(217,119,6,.12)", color: pr.status === "APPROVED" || pr.status === "RFQ_CREATED" ? "#059669" : pr.status === "REJECTED" || pr.status === "CANCELLED" ? "#dc2626" : "#d97706" }}>{pr.status || "DRAFT"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {pr.currentStage && <div style={{ fontSize: "12px", fontWeight: "700", color: "#111" }}>{pr.currentStage}</div>}
                      {pr.currentOwner && <div style={{ fontSize: "12px", color: "#888" }}>{pr.currentOwner}</div>}
                      {!pr.currentStage && <span style={{ color: "#aaa" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer", marginRight: "4px" }} onClick={() => openPr(pr)} title="View detail">
                        <Eye size={14} />
                      </button>
                      <button style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d9d9d9", borderRadius: "6px", background: "#fff", cursor: "pointer" }} onClick={() => openTimeline(pr)} title="View timeline">
                        <History size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "10px" }}>
        <span style={{ color: "#888", fontSize: "13" }}>
          Page {page + 1} of {totalPages} · {countFormat.format(total)} requests
        </span>
        <div style={{ display: "flex", gap: "8" }}>
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d9d9d9", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.5 : 1, fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ChevronLeft size={15} /> Prev
          </button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d9d9d9", background: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.5 : 1, fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* PR Detail Drawer */}
      {selectedPr && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.45)", backdropFilter: "blur(3px)", zIndex: 400, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: "#fff", width: "min(640px, 100%)", height: "100%", overflowY: "auto", padding: "26px 26px 40px", boxShadow: "-8px 0 30px rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111" }}>Purchase Request Detail</h2>
              <button onClick={() => { setSelectedPr(null); setPrDetail(null); setTimeline(null); }} style={{ border: "none", background: "#f1f3f5", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
            </div>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 18px" }}>{selectedPr.requestNumber} · live from the database</p>

            {detailLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px", color: "#666" }}>
                <Loader2 size={20} className="login-spin" /> Loading request detail...
              </div>
            ) : prDetail ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <InfoBox label="Requester" value={prDetail.requesterName} />
                  <InfoBox label="Employee ID" value={prDetail.employeeCode} />
                  <InfoBox label="Department" value={prDetail.departmentName} />
                  <InfoBox label="Cost Center" value={prDetail.costCenterName} />
                  <InfoBox label="Manager" value={prDetail.managerName} />
                  <InfoBox label="Priority" value={prDetail.priority} />
                  <InfoBox label="Status" value={prDetail.status} />
                  <InfoBox label="Approval Status" value={prDetail.approvalStatus} />
                  <InfoBox label="Estimated Amount" value={prDetail.estimatedAmount != null ? moneyFormat.format(prDetail.estimatedAmount) : "—"} />
                  <InfoBox label="Request Date" value={formatDateIN(prDetail.requestDate)} />
                  <InfoBox label="Required Date" value={formatDateIN(prDetail.requiredDate)} />
                  <InfoBox label="Current Stage" value={prDetail.currentStage} />
                  <InfoBox label="Current Owner" value={prDetail.currentOwner} />
                </div>
                {prDetail.purpose && (
                  <div style={{ marginTop: 14 }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#111" }}>Purpose</h4>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>{prDetail.purpose}</p>
                  </div>
                )}

                {/* PR Lines */}
                {prDetail.lines && prDetail.lines.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#111" }}>PR Lines</h4>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {["Product", "Category", "Description", "Req. Qty", "Available", "Shortage", "Unit", "Est. Price", "Total"].map((h) => (
                              <th key={h} style={{ textAlign: "left", color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: ".3px", padding: "8px 6px", borderBottom: "1px solid #e7edf3" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {prDetail.lines.map((line, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #f2f4f6" }}>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, fontWeight: 600 }}>{line.productName || "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{line.categoryName || "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line.description || "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, textAlign: "center" }}>{line.requestedQuantity ?? "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, textAlign: "center" }}>{line.availableQuantity ?? "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, textAlign: "center", color: line.shortage > 0 ? "#dc2626" : "#059669" }}>{line.shortage ?? 0}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{line.unitOfMeasure || "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{line.estimatedPrice != null ? moneyFormat.format(line.estimatedPrice) : "—"}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, fontWeight: 700 }}>{line.totalPrice != null ? moneyFormat.format(line.totalPrice) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Approval History */}
                {prDetail.approvalHistory && prDetail.approvalHistory.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#111" }}>Approval Information</h4>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {["Stage", "Approver", "Role", "Decision", "Date"].map((h) => (
                              <th key={h} style={{ textAlign: "left", color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: ".3px", padding: "8px 6px", borderBottom: "1px solid #e7edf3" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {prDetail.approvalHistory.map((task) => (
                            <tr key={task.taskId} style={{ borderBottom: "1px solid #f2f4f6" }}>
                              <td style={{ padding: "9px 6px", fontWeight: 700, fontSize: 12.5 }}>{task.stageName}</td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5 }}>
                                <div style={{ fontWeight: 700, color: "#111" }}>{task.approverName}</div>
                                <div style={{ fontSize: 11.5, color: "#888" }}>{task.approverEmployeeCode}</div>
                              </td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5 }}>{task.approverRole}</td>
                              <td style={{ padding: "9px 6px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: task.status === "APPROVED" ? "#ecfdf5" : task.status === "REJECTED" ? "#fff1f2" : "#fffbeb", color: task.status === "APPROVED" ? "#047857" : task.status === "REJECTED" ? "#be123c" : "#b45309" }}>{task.status}</span>
                              </td>
                              <td style={{ padding: "9px 6px", fontSize: 12.5, whiteSpace: "nowrap" }}>{task.completedDate ? formatDateIN(task.completedDate) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => openTimeline(selectedPr)}
                    style={{ border: 0, borderRadius: 9, background: "#2563eb", color: "#fff", padding: "11px 18px", cursor: "pointer", fontWeight: 800, fontSize: "13.5", display: "inline-flex", alignItems: "center", gap: 7 }}
                  >
                    <History size={15} /> View Full Timeline
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: "#be123c", fontWeight: 600 }}>Unable to load request detail.</p>
            )}

            {/* Timeline */}
            {timeline && (
              <div style={{ marginTop: 26 }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#111" }}>Full Process Timeline</h4>
                {timeline.length === 0 ? (
                  <p style={{ color: "#888", fontSize: 13 }}>No timeline events recorded yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {timeline.map((event, index) => (
                      <div key={index} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                          {(() => {
                            const status = String(event.status || "").toUpperCase();
                            const returned = status === "RETURNED" || event.type === "APPROVAL_RETURNED";
                            const failed = ["CANCELLED", "REJECTED", "FAILED", "FAILURE"].includes(status) || /REJECTED|CANCELLED|FAILED/i.test(event.type || event.action || "");
                            const tone = failed ? { bg: "#fee2e2", fg: "#b91c1c", mark: "✕" } : returned ? { bg: "#dbeafe", fg: "#1d4ed8", mark: "↩" } : { bg: "#dcfce7", fg: "#15803d", mark: "✓" };
                            return <div style={{ width: 28, height: 28, borderRadius: "50%", background: tone.bg, color: tone.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900 }}>{tone.mark}</div>;
                          })()}
                          {index < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: "#e7ebf0" }} />}
                        </div>
                        <div style={{ paddingBottom: 8, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <strong style={{ fontSize: 13.5, color: "#111" }}>{event.title || event.action || "Event"}</strong>
                            <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{formatDateIN(event.occurredAt || event.timestamp)}</span>
                          </div>
                          {(event.performedByName || event.person) && (
                            <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2 }}>
                              {event.performedByName || event.person}
                              {event.employeeCode ? ` (${event.employeeCode})` : ""}
                              {event.performedByRole || event.role ? ` · ${event.performedByRole || event.role}` : ""}
                            </div>
                          )}
                          {(event.description || event.comment) && <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>{event.description || event.comment}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {timelineLoading && <div style={{ display: "flex", justifyContent: "center", padding: "20px", color: "#666" }}><Loader2 size={18} className="login-spin" /> Loading timeline...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}14`, color: color, flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#111", lineHeight: 1.1 }}>{countFormat.format(value ?? 0)}</div>
        <div style={{ fontSize: "12.5px", color: "#777", fontWeight: "600" }}>{label}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: "#f8f9fb", border: "1px solid #ececec", borderRadius: 9, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".4px", color: "#888", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>{value || "—"}</div>
    </div>
  );
}

export default ProcurementMonitoring;