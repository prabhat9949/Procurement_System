import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  Eye,
  X,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  CheckCircle2,
  Loader2,
  WifiOff,
  IndianRupee,
  ClipboardList,
  Flag,
} from "lucide-react";
import { apiGet, apiPost } from "../../../../../services/apiClient";
import { formatINR, formatDateIN } from "../../../../../utils/format";
import { hasPermission } from "../../../../../utils/permissions";

const statusLabel = (s) => ({
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  REQUIRES_CLARIFICATION: "Clarification",
  COMPLIANT: "Compliant",
  PARTIALLY_COMPLIANT: "Partially Compliant",
  NON_COMPLIANT: "Non-Compliant",
  CLOSED: "Closed",
}[s] || s);

const statusColor = (s) => {
  if (s === "COMPLIANT") return "#059669";
  if (s === "NON_COMPLIANT") return "#dc2626";
  if (s === "PARTIALLY_COMPLIANT" || s === "REQUIRES_CLARIFICATION") return "#d97706";
  if (s === "CLOSED") return "#64748b";
  return "#2563eb";
};

const riskColor = (r) => {
  if (r === "CRITICAL") return "#dc2626";
  if (r === "HIGH") return "#d97706";
  if (r === "MEDIUM") return "#f59e0b";
  return "#059669";
};

const FINDING_TYPES = [
  "PROCESS_VIOLATION", "APPROVAL_ISSUE", "VENDOR_ISSUE", "QUOTATION_ISSUE",
  "PO_MISMATCH", "QUANTITY_MISMATCH", "PRICE_MISMATCH", "INVOICE_MISMATCH",
  "PAYMENT_ISSUE", "BUDGET_ISSUE", "DOCUMENT_MISSING", "DUPLICATE_TRANSACTION",
  "UNAUTHORIZED_ACTION", "OTHER",
];

const ProcurementAudits = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [findings, setFindings] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showFinding, setShowFinding] = useState(false);
  const [showConclude, setShowConclude] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [prs, setPrs] = useState([]);
  const [createForm, setCreateForm] = useState({ purchaseRequestId: "", dueDate: "" });
  const [findingForm, setFindingForm] = useState({
    findingType: "OTHER", severity: "MEDIUM", description: "",
    relatedRecord: "", recommendation: "", evidenceRef: "",
  });
  const [concludeForm, setConcludeForm] = useState({ conclusion: "COMPLIANT", auditSummary: "", recommendation: "" });

  const triggerToast = (m) => { setToast(m); setTimeout(() => setToast(""), 4500); };

  const loadData = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const q = status ? `&status=${status}` : "";
      const page = await apiGet(`/api/audits/my-queue?page=0&size=100&sort=createdAt&direction=desc${q}`);
      setCases(page?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load your audit queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(""); }, [loadData]);

  const openDetail = async (c) => {
    setSelected(c);
    setDetailLoading(true);
    setFindings([]);
    try {
      const fpage = await apiGet(`/api/audits/${c.id}/findings?page=0&size=100`).catch(() => null);
      setFindings(fpage?.content || []);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreate = async () => {
    setCreateForm({ purchaseRequestId: "", dueDate: "" });
    setShowCreate(true);
    try {
      const page = await apiGet("/api/purchase-requests?page=0&size=200&sort=createdAt&direction=desc");
      setPrs(page?.content || []);
    } catch { setPrs([]); }
  };

  const createCase = async (e) => {
    e.preventDefault();
    if (!createForm.purchaseRequestId) { setError("Please select a purchase request to audit."); return; }
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/audits", {
        purchaseRequestId: Number(createForm.purchaseRequestId),
        dueDate: createForm.dueDate || null,
      });
      setShowCreate(false);
      triggerToast("Audit case created and assigned to you.");
      loadData("");
    } catch (err) {
      setError(err.message || "Unable to create the audit case.");
    } finally {
      setBusy(false);
    }
  };

  const submitFinding = async (e) => {
    e.preventDefault();
    if (!findingForm.description.trim()) { setError("A finding description is required."); return; }
    setBusy(true);
    setError("");
    try {
      await apiPost(`/api/audits/${selected.id}/findings`, {
        findingType: findingForm.findingType,
        severity: findingForm.severity,
        description: findingForm.description.trim(),
        relatedRecord: findingForm.relatedRecord.trim() || null,
        recommendation: findingForm.recommendation.trim() || null,
        evidenceRef: findingForm.evidenceRef.trim() || null,
      });
      setShowFinding(false);
      setFindingForm({ findingType: "OTHER", severity: "MEDIUM", description: "", relatedRecord: "", recommendation: "", evidenceRef: "" });
      triggerToast("Audit finding recorded.");
      openDetail(selected);
      loadData("");
    } catch (err) {
      setError(err.message || "Unable to record the finding.");
    } finally {
      setBusy(false);
    }
  };

  const updateFindingStatus = async (f, status) => {
    setBusy(true);
    try {
      await apiPost(`/api/audits/${selected.id}/findings/${f.id}/status`, { status });
      triggerToast(`Finding ${status === "RESOLVED" ? "resolved" : "marked " + status}.`);
      openDetail(selected);
    } catch (err) {
      setError(err.message || "Unable to update finding status.");
    } finally {
      setBusy(false);
    }
  };

  const conclude = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await apiPost(`/api/audits/${selected.id}/conclude`, {
        conclusion: concludeForm.conclusion,
        auditSummary: concludeForm.auditSummary.trim() || null,
        recommendation: concludeForm.recommendation.trim() || null,
      });
      setShowConclude(false);
      triggerToast(`Audit ${res.caseNumber} concluded as ${res.conclusion}.`);
      setSelected(res);
      loadData("");
    } catch (err) {
      setError(err.message || "Unable to conclude the audit.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = cases.filter((c) => {
    const s = search.toLowerCase();
    return !s || (c.caseNumber || "").toLowerCase().includes(s) || (c.requestNumber || "").toLowerCase().includes(s)
      || (c.requesterName || "").toLowerCase().includes(s) || (c.department || "").toLowerCase().includes(s);
  });

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #d7dce3", borderRadius: "9px", fontSize: "13.5px", background: "#fff", outline: "none" };
  const labelStyle = { display: "block", fontSize: "12.5px", fontWeight: "700", color: "#374151", marginBottom: "6px" };

  return (
    <div className="aud-page-content-inner" style={{ padding: "20px" }}>
      <div className="aud-page-header">
        <div>
          <h1 className="aud-page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck color="#dc2626" /> My Audit Queue
          </h1>
          <p className="aud-page-subtitle">Audit cases assigned to you — every record is live from the database.</p>
        </div>
        {hasPermission("CAN_CREATE_AUDIT_CASE") && (
          <button className="aud-btn-primary-sm" onClick={openCreate}>
            <Plus size={15} /> New Audit Case
          </button>
        )}
      </div>

      {toast && (
        <div style={{ background: "rgba(5, 150, 105, 0.12)", border: "1px solid #059669", color: "#059669", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
          <WifiOff size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => loadData("")} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      <div className="aud-card" style={{ padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="#666" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Search case, PR, requester or department..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "38px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); loadData(e.target.value); }} style={{ ...inputStyle, width: "200px" }}>
          <option value="">All statuses</option>
          {["PENDING", "UNDER_REVIEW", "REQUIRES_CLARIFICATION", "COMPLIANT", "PARTIALLY_COMPLIANT", "NON_COMPLIANT", "CLOSED"].map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px 0", color: "#888", fontWeight: 600 }}>
          <Loader2 size={22} className="login-spin" /> Loading your audit queue...
        </div>
      ) : filtered.length === 0 ? (
        <div className="aud-card" style={{ textAlign: "center", padding: "48px" }}>
          <ClipboardList size={48} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>All Clear</h3>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>No audit cases are currently assigned to you.</p>
        </div>
      ) : (
        <div className="aud-card" style={{ overflow: "hidden" }}>
          <div className="aud-table-container">
            <table className="aud-table">
              <thead>
                <tr>
                  <th>Case</th><th>PR</th><th>Requester</th><th>Department</th><th>Amount</th><th>Risk</th><th>PO / GRN / Inv / Pay</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: "800", color: "#dc2626", whiteSpace: "nowrap" }}>{c.caseNumber}</td>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{c.requestNumber}</td>
                    <td style={{ fontSize: "13px" }}>{c.requesterName}<div style={{ fontSize: "11px", color: "#888" }}>{c.employeeId}</div></td>
                    <td style={{ fontSize: "13px" }}>{c.department}</td>
                    <td style={{ fontWeight: "800", whiteSpace: "nowrap" }}>{formatINR(c.estimatedAmount)}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: `${riskColor(c.riskLevel)}14`, color: riskColor(c.riskLevel) }}>{c.riskLevel}</span></td>
                    <td style={{ fontSize: "11.5px", color: "#666" }}>
                      {c.poNumber || "—"} · {c.grnNumber || "—"} · {c.invoiceNumber || "—"} · {c.paymentNumber || "—"}
                    </td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(c.status)}14`, color: statusColor(c.status) }}>{statusLabel(c.status)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="aud-btn-primary-sm" onClick={() => openDetail(c)}><Eye size={14} /> Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE CASE MODAL */}
      {showCreate && (
        <div className="aud-modal-overlay">
          <div className="aud-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>New Audit Case</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={createCase}>
              <div className="aud-form-group" style={{ marginBottom: "14px" }}>
                <label className="aud-form-label">Purchase Request *</label>
                <select style={inputStyle} value={createForm.purchaseRequestId} onChange={(e) => setCreateForm({ ...createForm, purchaseRequestId: e.target.value })} required>
                  <option value="">Select a purchase request...</option>
                  {prs.map((p) => (
                    <option key={p.id} value={p.id}>{p.requestNumber} — {p.purpose || ""} ({formatINR(p.estimatedAmount)})</option>
                  ))}
                </select>
              </div>
              <div className="aud-form-group" style={{ marginBottom: "20px" }}>
                <label className="aud-form-label">Due Date</label>
                <input type="date" style={inputStyle} value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="aud-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="aud-btn-primary-sm" disabled={busy}>{busy ? <Loader2 size={15} className="login-spin" /> : <><Plus size={15} /> Create Case</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE DETAIL MODAL */}
      {selected && !showFinding && !showConclude && (
        <div className="aud-modal-overlay">
          <div className="aud-modal" style={{ maxWidth: "760px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #ececec", background: "#fafafa" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "800" }}>AUDIT CASE</span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>{selected.caseNumber} — {selected.requestNumber}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div><span style={{ fontSize: "11px", color: "#888" }}>Requester</span><p style={{ fontSize: "14px", fontWeight: 700, margin: "2px 0" }}>{selected.requesterName}</p><span style={{ fontSize: "11px", color: "#888" }}>{selected.employeeId}</span></div>
                <div><span style={{ fontSize: "11px", color: "#888" }}>Department</span><p style={{ fontSize: "14px", fontWeight: 700, margin: "2px 0" }}>{selected.department}</p></div>
                <div><span style={{ fontSize: "11px", color: "#888" }}>Category</span><p style={{ fontSize: "14px", fontWeight: 700, margin: "2px 0" }}>{selected.category || "—"}</p></div>
                <div><span style={{ fontSize: "11px", color: "#888" }}>Estimated Amount</span><p style={{ fontSize: "15px", fontWeight: 800, color: "#059669", margin: "2px 0" }}>{formatINR(selected.estimatedAmount)}</p></div>
                <div><span style={{ fontSize: "11px", color: "#888" }}>Priority</span><p style={{ fontSize: "14px", fontWeight: 700, margin: "2px 0" }}>{selected.priority || "—"}</p></div>
                <div><span style={{ fontSize: "11px", color: "#888" }}>Risk Level</span><p style={{ fontSize: "14px", fontWeight: 800, margin: "2px 0", color: riskColor(selected.riskLevel) }}>{selected.riskLevel}</p></div>
              </div>

              <div style={{ background: "#f8f9fb", borderRadius: "10px", border: "1px solid #ececec", padding: "14px", marginBottom: "20px", fontSize: "13px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div><strong>PO:</strong> {selected.poNumber || "—"}</div>
                <div><strong>GRN:</strong> {selected.grnNumber || "—"}</div>
                <div><strong>Invoice:</strong> {selected.invoiceNumber || "—"}</div>
                <div><strong>Payment:</strong> {selected.paymentNumber || "—"}</div>
                <div><strong>Assigned:</strong> {formatDateIN(selected.assignedDate, { withTime: false })}</div>
                <div><strong>Due:</strong> {formatDateIN(selected.dueDate, { withTime: false })}</div>
              </div>

              {selected.auditSummary && (
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#888", fontWeight: 700, textTransform: "uppercase" }}>Audit Summary</span>
                  <p style={{ fontSize: "13.5px", color: "#333", marginTop: "4px", background: "#f8f9fb", padding: "12px", borderRadius: "8px", border: "1px solid #ececec" }}>{selected.auditSummary}</p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><Flag size={16} color="#dc2626" /> Findings ({findings.length})</h4>
                {hasPermission("CAN_CREATE_AUDIT_FINDING") && (
                  <button className="aud-btn-primary-sm" onClick={() => setShowFinding(true)}><Plus size={14} /> Add Finding</button>
                )}
              </div>

              {detailLoading ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#888" }}><Loader2 size={20} className="login-spin" /></div>
              ) : findings.length === 0 ? (
                <p style={{ color: "#888", fontSize: "13px", padding: "10px 0" }}>No findings recorded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {findings.map((f) => (
                    <div key={f.id} style={{ border: "1px solid #ececec", borderRadius: "10px", padding: "12px 14px", background: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: "#111", background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px" }}>{f.findingType}</span>
                          <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", background: `${riskColor(f.severity)}14`, color: riskColor(f.severity) }}>{f.severity}</span>
                          <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", background: `${statusColor(f.status === "OPEN" ? "PENDING" : "CLOSED")}14`, color: statusColor(f.status === "OPEN" ? "PENDING" : "CLOSED") }}>{f.status}</span>
                        </div>
                        {f.status === "OPEN" && hasPermission("CAN_CLOSE_FINDING") && (
                          <button className="aud-btn-primary-sm" style={{ fontSize: "11px", padding: "5px 10px" }} onClick={() => updateFindingStatus(f, "RESOLVED")}>Mark Resolved</button>
                        )}
                      </div>
                      <p style={{ fontSize: "13.5px", color: "#333", margin: "8px 0 4px" }}>{f.description}</p>
                      {f.relatedRecord && <p style={{ fontSize: "12px", color: "#666" }}><strong>Related:</strong> {f.relatedRecord}</p>}
                      {f.recommendation && <p style={{ fontSize: "12px", color: "#666" }}><strong>Recommendation:</strong> {f.recommendation}</p>}
                      <p style={{ fontSize: "11px", color: "#999", marginTop: "6px" }}>{f.createdBy} · {formatDateIN(f.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}

              {hasPermission("CAN_CONCLUDE_AUDIT") && selected.status !== "CLOSED" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid #ececec", paddingTop: "16px" }}>
                  <button className="aud-btn-primary-sm" style={{ background: "#dc2626", borderColor: "#dc2626" }} onClick={() => setShowConclude(true)}>
                    <ShieldCheck size={15} /> Conclude Audit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD FINDING MODAL */}
      {showFinding && selected && (
        <div className="aud-modal-overlay">
          <div className="aud-modal" style={{ maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Record Finding — {selected.caseNumber}</h3>
              <button onClick={() => setShowFinding(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={submitFinding}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label className="aud-form-label">Finding Type *</label>
                  <select style={inputStyle} value={findingForm.findingType} onChange={(e) => setFindingForm({ ...findingForm, findingType: e.target.value })}>
                    {FINDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="aud-form-label">Severity *</label>
                  <select style={inputStyle} value={findingForm.severity} onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}>
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="aud-form-group" style={{ marginBottom: "14px" }}>
                <label className="aud-form-label">Description *</label>
                <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={findingForm.description} onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })} placeholder="Describe the discrepancy or process violation..." required />
              </div>
              <div className="aud-form-group" style={{ marginBottom: "14px" }}>
                <label className="aud-form-label">Related Record</label>
                <input style={inputStyle} value={findingForm.relatedRecord} onChange={(e) => setFindingForm({ ...findingForm, relatedRecord: e.target.value })} placeholder="e.g. PO-2026-0042 / INV-2026-0041" />
              </div>
              <div className="aud-form-group" style={{ marginBottom: "14px" }}>
                <label className="aud-form-label">Recommendation</label>
                <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={findingForm.recommendation} onChange={(e) => setFindingForm({ ...findingForm, recommendation: e.target.value })} />
              </div>
              <div className="aud-form-group" style={{ marginBottom: "20px" }}>
                <label className="aud-form-label">Evidence Reference</label>
                <input style={inputStyle} value={findingForm.evidenceRef} onChange={(e) => setFindingForm({ ...findingForm, evidenceRef: e.target.value })} placeholder="Document / attachment reference" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="aud-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowFinding(false)}>Cancel</button>
                <button type="submit" className="aud-btn-primary-sm" disabled={busy}>{busy ? <Loader2 size={15} className="login-spin" /> : <><Flag size={15} /> Record Finding</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONCLUDE MODAL */}
      {showConclude && selected && (
        <div className="aud-modal-overlay">
          <div className="aud-modal" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#111", fontWeight: "700" }}>Conclude Audit — {selected.caseNumber}</h3>
              <button onClick={() => setShowConclude(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={conclude}>
              <div className="aud-form-group" style={{ marginBottom: "14px" }}>
                <label className="aud-form-label">Conclusion *</label>
                <select style={inputStyle} value={concludeForm.conclusion} onChange={(e) => setConcludeForm({ ...concludeForm, conclusion: e.target.value })}>
                  <option value="COMPLIANT">Compliant</option>
                  <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="REQUIRES_ACTION">Requires Action</option>
                </select>
              </div>
              <div className="aud-form-group" style={{ marginBottom: "14px" }}>
                <label className="aud-form-label">Audit Summary *</label>
                <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={concludeForm.auditSummary} onChange={(e) => setConcludeForm({ ...concludeForm, auditSummary: e.target.value })} placeholder="Summarise what was verified and the outcome..." required />
              </div>
              <div className="aud-form-group" style={{ marginBottom: "20px" }}>
                <label className="aud-form-label">Recommendation</label>
                <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={concludeForm.recommendation} onChange={(e) => setConcludeForm({ ...concludeForm, recommendation: e.target.value })} />
              </div>
              {selected.concludedBy && (
                <p style={{ fontSize: "12.5px", color: "#666", marginBottom: "14px" }}>
                  Concluded by <strong>{selected.concludedBy}</strong> on {formatDateIN(selected.concludedAt)} — conclusion: <strong>{selected.conclusion}</strong>
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="aud-btn-primary-sm" style={{ background: "#f8f9fb", color: "#111", border: "1px solid #d9d9d9" }} onClick={() => setShowConclude(false)}>Cancel</button>
                <button type="submit" className="aud-btn-primary-sm" style={{ background: "#dc2626", borderColor: "#dc2626" }} disabled={busy}>{busy ? <Loader2 size={15} className="login-spin" /> : <><ShieldCheck size={15} /> Conclude Audit</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementAudits;
