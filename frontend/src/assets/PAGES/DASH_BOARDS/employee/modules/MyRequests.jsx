import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Eye,
  Clock,
  Loader2,
  PlusCircle,
  Pencil,
  Send,
  XCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const canEdit = hasPermission("CAN_EDIT_PR");
const canSubmit = hasPermission("CAN_SUBMIT_PR");
const canCancel = hasPermission("CAN_CANCEL_PR");

const STATUS_STYLE = {
  DRAFT: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  SUBMITTED: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  UNDER_REVIEW: { bg: "rgba(217,119,6,.12)", color: "#d97706" },
  APPROVED: { bg: "rgba(5,150,105,.12)", color: "#059669" },
  REJECTED: { bg: "rgba(220,38,38,.12)", color: "#dc2626" },
  CANCELLED: { bg: "rgba(100,116,139,.12)", color: "#64748b" },
  RETURNED: { bg: "rgba(245,158,11,.14)", color: "#b45309" },
  RFQ_CREATED: { bg: "rgba(37,99,235,.12)", color: "#2563eb" },
};

const displayStatus = (r) => (r.approvalStatus === "RETURNED" ? "RETURNED" : r.status);
const statusLabel = (s) => (s === "UNDER_REVIEW" ? "Pending" : s === "RETURNED" ? "Returned for Correction" : s.replace("_", " "));

const MyRequests = ({ onNavigate, onSelectTracking }) => {
  const [requests, setRequests] = useState([]);
  const [linesByRequest, setLinesByRequest] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [editTarget, setEditTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedKeyword) params.set("keyword", debouncedKeyword);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      params.set("page", page);
      params.set("size", pageSize);
      params.set("sort", "createdAt");
      params.set("direction", "desc");
      const data = await apiGet(`/api/purchase-requests?${params.toString()}`);
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      const lineMap = {};
      await Promise.all(
        (data.content || []).map(async (r) => {
          const lines = await apiGet(`/api/purchase-request-lines?purchaseRequestId=${r.id}&size=5`).catch(() => null);
          lineMap[r.id] = lines?.content || [];
        })
      );
      setLinesByRequest(lineMap);
    } catch (err) {
      setError(err.message || "Unable to load your requests.");
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, statusFilter, priorityFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, statusFilter, priorityFilter]);

  const runAction = async (action, request) => {
    setBusyId(request.id);
    setError("");
    try {
      if (action === "submit") await apiPost(`/api/purchase-requests/${request.id}/submit`);
      if (action === "cancel") await apiPost(`/api/purchase-requests/${request.id}/cancel`);
      if (action === "delete") await apiDelete(`/api/purchase-requests/${request.id}`);
      setConfirmAction(null);
      await load();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const itemNames = (r) => {
    const lines = linesByRequest[r.id] || [];
    return lines.length
      ? lines.map((l) => l.productName).join(", ")
      : r.purpose || "—";
  };

  const statusBadge = (status) => {
    const s = STATUS_STYLE[status] || STATUS_STYLE.DRAFT;
    return <span style={{ background: s.bg, color: s.color, fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>{statusLabel(status)}</span>;
  };

  const priorityBadge = (p) => {
    const color = p === "URGENT" ? "#dc2626" : p === "HIGH" ? "#ea580c" : p === "MEDIUM" ? "#d97706" : "#64748b";
    return <span style={{ color, fontWeight: 800, fontSize: 12 }}>{p}</span>;
  };

  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="emp-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h1 className="emp-page-title" style={{ display: "flex", alignItems: "center", gap: 10, margin: 0, fontSize: 22 }}>
            <FileText color="#2563eb" /> My Purchase Requests
          </h1>
          <p className="emp-page-subtitle" style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
            Only your own requests are shown — {totalElements} total record(s).
          </p>
        </div>
        <button className="emp-btn-primary-sm" style={{ display: "inline-flex", alignItems: "center", gap: 7 }} onClick={() => onNavigate("create-request")}>
          <PlusCircle size={15} /> New Request
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 340 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: "#9aa8b8" }} />
          <input
            style={{ width: "100%", padding: "9px 12px 9px 34px", border: "1px solid #d7dce3", borderRadius: 9, fontSize: 13, outline: "none" }}
            placeholder="Search by PR number, purpose, item…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <select style={{ padding: "9px 12px", border: "1px solid #d7dce3", borderRadius: 9, fontSize: 13, background: "#fff" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_STYLE).map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <select style={{ padding: "9px 12px", border: "1px solid #d7dce3", borderRadius: 9, fontSize: 13, background: "#fff" }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 13 }}>
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="emp-table-container" style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "70px 0", color: "#888", fontWeight: 600 }}>
            <Loader2 size={22} className="lro-spin" /> Loading your requests…
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#9aa8b8" }}>
            <Clock size={26} style={{ marginBottom: 8, opacity: 0.6 }} />
            <div style={{ fontWeight: 600, fontSize: 14 }}>No purchase requests found.</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>Create a request to start the procurement workflow.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="emp-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#7a8999", textTransform: "uppercase", fontSize: 11, letterSpacing: 0.4 }}>
                  <th style={{ padding: "11px 14px", textAlign: "left" }}>PR Number</th>
                  <th style={{ padding: "11px 14px", textAlign: "left" }}>Item(s) / Purpose</th>
                  <th style={{ padding: "11px 14px", textAlign: "left" }}>Cost Center</th>
                  <th style={{ padding: "11px 14px", textAlign: "right" }}>Amount</th>
                  <th style={{ padding: "11px 14px", textAlign: "left" }}>Priority</th>
                  <th style={{ padding: "11px 14px", textAlign: "left" }}>Required By</th>
                  <th style={{ padding: "11px 14px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "11px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const status = displayStatus(r);
                  const busy = busyId === r.id;
                  const editable = r.status === "DRAFT";
                  const cancellable = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(r.status) && r.status !== "CANCELLED";
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #f2f4f6", cursor: "pointer" }} onClick={() => onSelectTracking(r.id)}>
                      <td style={{ padding: "12px 14px" }}><strong style={{ color: "#111" }}>{r.requestNumber}</strong></td>
                      <td style={{ padding: "12px 14px", maxWidth: 260 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{itemNames(r)}</span>
                        {r.purpose && <span style={{ display: "block", fontSize: 11.5, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.purpose}</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#475569" }}>{r.costCenterCode || r.costCenterName || "—"}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{formatINR(r.estimatedAmount)}</td>
                      <td style={{ padding: "12px 14px" }}>{priorityBadge(r.priority)}</td>
                      <td style={{ padding: "12px 14px", color: "#475569" }}>{formatDateIN(r.requiredDate, { withTime: false })}</td>
                      <td style={{ padding: "12px 14px" }}>{statusBadge(status)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        <button title="View / Track" style={iconBtn("#2563eb")} onClick={() => onSelectTracking(r.id)}><Eye size={15} /></button>
                        {editable && canEdit && (
                          <button title="Edit" style={iconBtn("#7c3aed")} onClick={() => setEditTarget(r)}><Pencil size={14} /></button>
                        )}
                        {editable && canSubmit && (
                          <button title="Submit" style={iconBtn("#059669")} disabled={busy} onClick={() => setConfirmAction({ action: "submit", request: r })}><Send size={14} /></button>
                        )}
                        {cancellable && canCancel && (
                          <button title="Cancel" style={iconBtn("#d97706")} disabled={busy} onClick={() => setConfirmAction({ action: "cancel", request: r })}><XCircle size={14} /></button>
                        )}
                        {editable && (canEdit || canCancel) && (
                          <button title="Delete" style={iconBtn("#dc2626")} disabled={busy} onClick={() => setConfirmAction({ action: "delete", request: r })}><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 14, fontSize: 13 }}>
          <button disabled={page === 0} style={pageBtn(page === 0)} onClick={() => setPage(page - 1)}>Prev</button>
          <span style={{ color: "#475569", fontWeight: 600 }}>Page {page + 1} of {Math.max(totalPages, 1)}</span>
          <button disabled={page >= totalPages - 1} style={pageBtn(page >= totalPages - 1)} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          request={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={async () => {
            setEditTarget(null);
            await load();
          }}
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Confirm action modal */}
      {confirmAction && (
        <div className="emp-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div className="emp-modal" style={{ maxWidth: 430, background: "#fff", borderRadius: 14, padding: 26, textAlign: "center" }}>
            <AlertTriangle size={44} color={confirmAction.action === "delete" ? "#dc2626" : "#d97706"} style={{ margin: "0 auto 14px" }} />
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111" }}>
              {confirmAction.action === "submit" ? "Submit Request" : confirmAction.action === "cancel" ? "Cancel Request" : "Delete Request"}
            </h3>
            <p style={{ color: "#666", fontSize: 13.5, margin: "10px 0 22px" }}>
              {confirmAction.action === "submit" &&
                `Submit ${confirmAction.request.requestNumber} for approval? Budget will be validated and the workflow will be generated.`}
              {confirmAction.action === "cancel" &&
                `Are you sure you want to cancel ${confirmAction.request.requestNumber}? Any committed budget will be released.`}
              {confirmAction.action === "delete" &&
                `Are you sure you want to permanently delete draft ${confirmAction.request.requestNumber}? This cannot be undone.`}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="emp-btn-primary-sm" disabled={busyId === confirmAction.request.id} onClick={() => runAction(confirmAction.action, confirmAction.request)}>
                {busyId === confirmAction.request.id ? <Loader2 size={14} className="lro-spin" /> : "Yes, Continue"}
              </button>
              <button className="emp-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setConfirmAction(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const iconBtn = (color) => ({
  border: "none",
  background: `${color}14`,
  color,
  width: 30,
  height: 30,
  borderRadius: 8,
  marginLeft: 6,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
});
const pageBtn = (disabled) => ({
  border: "1px solid #d7dce3",
  background: disabled ? "#f1f5f9" : "#fff",
  color: disabled ? "#b6c2cf" : "#334155",
  padding: "7px 14px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
});

const EditModal = ({ request, onClose, onSaved, onError }) => {
  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [line, setLine] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const employee = await apiGet("/api/employees/me");
        setMe(employee);
        const [prodPage, linesRes] = await Promise.all([
          apiGet("/api/products?active=true&size=500"),
          apiGet(`/api/purchase-request-lines?purchaseRequestId=${request.id}&size=1`),
        ]);
        setProducts(prodPage?.content || []);
        const firstLine = linesRes?.content?.[0] || null;
        setLine(firstLine);
        let costCentersList = [];
        if (employee?.departmentId) {
          costCentersList = (await apiGet(`/api/cost-centers/by-department/${employee.departmentId}`)) || [];
          setCostCenters(costCentersList);
        }
        setForm({
          productId: firstLine ? String(firstLine.productId) : "",
          quantity: firstLine ? String(firstLine.quantity) : "1",
          unitPrice: firstLine ? String(firstLine.unitPrice) : "",
          costCenterId: String(request.costCenterId || employee?.costCenterId || (costCentersList[0]?.id ?? "")),
          requiredDate: (request.requiredDate || "").slice(0, 10),
          priority: request.priority || "MEDIUM",
          purpose: request.purpose || "",
          remarks: request.remarks || "",
        });
      } catch (err) {
        onError(err.message || "Unable to load the edit form.");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  const total = Number(form?.quantity || 0) * Number(form?.unitPrice || 0);
  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #d7dce3", borderRadius: 9, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const fieldLabel = { display: "block", fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 6 };

  const save = async () => {
    setSaving(true);
    try {
      await apiPut(`/api/purchase-requests/${request.id}`, {
        requesterId: me.id,
        departmentId: me.departmentId,
        costCenterId: Number(form.costCenterId),
        requiredDate: form.requiredDate,
        priority: form.priority,
        purpose: form.purpose.trim(),
        remarks: form.remarks.trim() || null,
        estimatedAmount: Number(total.toFixed(2)),
      });
      if (line) {
        await apiPut(`/api/purchase-request-lines/${line.id}`, {
          purchaseRequestId: request.id,
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          remarks: form.remarks.trim() || null,
        });
      } else {
        await apiPost("/api/purchase-request-lines", {
          purchaseRequestId: request.id,
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          remarks: form.remarks.trim() || null,
        });
      }
      await onSaved();
    } catch (err) {
      onError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="emp-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, overflow: "auto", padding: "20px 0" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 26, width: "100%", maxWidth: 720, boxShadow: "0 24px 60px rgba(15,23,42,.25)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 800, color: "#111" }}>Edit {request.requestNumber}</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#666" }}>Draft requests can be changed. Saving keeps the same request number.</p>
        {!form ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "#888" }}><Loader2 size={20} className="lro-spin" /></div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label style={fieldLabel}>Product / Service</label>
                <select style={inputStyle} value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}>
                  <option value="">Select…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.productName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>Quantity</label>
                <input type="number" min="0.001" step="any" style={inputStyle} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div>
                <label style={fieldLabel}>Unit Price (₹)</label>
                <input type="number" min="0" step="any" style={inputStyle} value={form.unitPrice} onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))} />
              </div>
              <div>
                <label style={fieldLabel}>Cost Center</label>
                <select style={inputStyle} value={form.costCenterId} onChange={(e) => setForm((f) => ({ ...f, costCenterId: e.target.value }))}>
                  {costCenters.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>Required By</label>
                <input type="date" style={inputStyle} value={form.requiredDate} onChange={(e) => setForm((f) => ({ ...f, requiredDate: e.target.value }))} />
              </div>
              <div>
                <label style={fieldLabel}>Priority</label>
                <select style={inputStyle} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={fieldLabel}>Business Justification</label>
              <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={fieldLabel}>Remarks / Delivery Notes</label>
              <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />
            </div>
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 13.5, color: "#1e3a8a" }}>
              <strong>Estimated Total:</strong> {formatINR(total)}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="emp-btn-primary-sm" disabled={saving} onClick={save}>
                {saving ? <Loader2 size={14} className="lro-spin" /> : "Save Changes"}
              </button>
              <button className="emp-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
